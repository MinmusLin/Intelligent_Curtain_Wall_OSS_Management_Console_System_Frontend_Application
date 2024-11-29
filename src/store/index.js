import Vue from 'vue'
import Vuex from 'vuex'
import OSS from 'ali-oss'
import {uuid} from '@/tool'
import router from '@/router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        bucket: '',
        accessKeyId: '',
        headerVisible: true,
        path: '',
        ossList: [],
        loading: false,
        CodeEditor: {
            size: '',
            code: '',
            path: ''
        },
        language: {},
        editorShow: false,
        uploadList: [],
        transmissionShow: false,
        selections: [],
        copys: [],
        copyPath: '',
        copyNum: 0,
        copyTotal: 0,
        copyVisible: false,
        deleteNum: 0,
        deleteConfirm: false,
        deleteTotal: 0,
        deleteVisible: false,
        state: false,
        shear: null
    },
    mutations: {
        /**
         * Update the state value for a given name.
         * @param {Object} state - The current state of the Vuex store.
         * @param {Object} payload - Contains name (property to update) and data (new value).
         */
        stateUpdate(state, {name, data}) {
            state[name] = data
        },

        /**
         * Cancel the upload progress of a specific file.
         * @param {Object} state - The current state of the Vuex store.
         * @param {Object} payload - Contains the uploadId of the file to cancel.
         */
        progressCancel(state, {uploadId}) {
            state.uploadList.map((item) => {
                if (item.uploadId === uploadId) {
                    item.status = '-1'
                }
            })
            window.localStorage.setItem('uploadList', JSON.stringify(state.uploadList))
        },

        /**
         * Cancel the upload progress of a specific file.
         * @param {Object} state - The current state of the Vuex store.
         * @param {Object} payload - Contains the uploadId of the file to cancel.
         */
        progressUpdate(state, {uploadId, progress, checkpoint}) {
            state.uploadList.map((item) => {
                if (item.uploadId === uploadId) {
                    item.progress = progress
                    item.checkpoint = checkpoint
                    if (progress === 1) {
                        item.status = '1'
                    }
                    item.currentSize += checkpoint ? checkpoint.partSize : item.size
                }
            })
            window.localStorage.setItem('uploadList', JSON.stringify(state.uploadList))
        }
    },
    actions: {
        /**
         * Handle the upload of large files in slices (multipart upload).
         * @param {Object} context - Vuex store context object.
         * @param {Object} payload - Contains file, checkpoint, uploadId, progress, currentSize, and path.
         * @returns {Promise<void>}
         */
        async sliceUpload({state, commit, dispatch}, {file, checkpoint, uploadId, progress, currentSize, path}) {
            const {multipartUpload} = require('@/api/index')
            commit('stateUpdate', {name: 'transmissionShow', data: true})
            let client = new OSS(JSON.parse(window.localStorage.getItem('client')))
            let uploadList = state.uploadList
            uploadId = uploadId ? uploadId : uuid(16, 16)
            let fileChild = {
                title: file.name,
                size: file.size,
                currentSize: currentSize ? currentSize : 0,
                uploadId,
                progress: progress ? progress : 0,
                checkpoint: checkpoint ? checkpoint : {},
                status: '0',
                client,
                file,
                path: path ? path : `${state.path}${file.name}`
            }
            if (checkpoint) {
                uploadList = uploadList.map((item) => {
                    if (uploadId === item.uploadId) {
                        return fileChild
                    } else {
                        return item
                    }
                })
            } else {
                uploadList.unshift(fileChild)
            }
            commit('stateUpdate', {
                name: 'uploadList',
                data: uploadList
            })
            let options = {
                progress: function (progress, checkpoint) {
                    commit('progressUpdate', {
                        uploadId,
                        progress,
                        checkpoint
                    })
                },
                mime: file.type
            }
            if (checkpoint) {
                options.checkpoint = checkpoint
            }
            multipartUpload(
                `${state.path}${file.name}`,
                file,
                options,
                client
            ).then((_) => {
                dispatch('fileUpdate')
            }).catch((_) => {
                commit('progressCancel', {uploadId})
            })
        },

        /**
         * Update the file list from OSS (Object Storage Service).
         * Checks the validity of client session and updates the UI.
         * @param {Object} context - Vuex store context object.
         * @returns {Promise<void>}
         */
        async fileUpdate({state, commit}) {
            let {overdueDate} = JSON.parse(window.localStorage.getItem('ossInfo')) || {}
            let date = Math.round(new Date())
            if (date > overdueDate) {
                window.localStorage.removeItem('client')
                router.push('/login')
            }
            const {fileList} = require('@/api/index')

            /**
             * Recursively fetches a complete list of files and directories from OSS (Object Storage Service) when the
             * result is paginated. It handles the pagination by checking the `nextMarker` and continues fetching until
             * all files and directories are retrieved.
             * @param {string} nextMarker - The marker to start fetching the next page of results (used for pagination).
             * @param {Array} objects - An array to accumulate the list of file objects.
             * @param {Array} prefixes - An array to accumulate the list of directory prefixes.
             * @returns {Promise<Object>} A promise that resolves to an object containing two arrays:
             */
            async function infiniteList(nextMarker, objects, prefixes) {
                let max = nextMarker
                let flag = true
                while (flag) {
                    const res = await fileList(state.path, max)
                    max = res.nextMarker
                    flag = res.isTruncated
                    if (objects) {
                        objects.push(...res.objects)
                    }
                    if (prefixes) {
                        prefixes.push(...res.prefixes)
                    }
                }
                return {objects, prefixes}
            }

            commit('stateUpdate', {name: 'loading', data: true})
            let rf = await fileList(state.path)
            let {objects, prefixes, isTruncated, nextMarker} = rf
            if (isTruncated) {
                const result = await infiniteList(nextMarker, objects, prefixes)
                objects = result.objects
                prefixes = result.prefixes
            }
            let list = []
            if (prefixes) {
                prefixes.map((item) => {
                    list.push({name: item, dir: true})
                })
            }
            if (objects) {
                objects.map((item) => {
                    if (item.name) {
                        let names = item.name.split('/')
                        if (names[names.length - 1]) {
                            list.push(item)
                        }
                    }
                })
            }
            commit('stateUpdate', {name: 'ossList', data: list})
            commit('stateUpdate', {name: 'loading', data: false})
        },

        /**
         * Delete files from the server.
         * @param {Object} context - Vuex store context object.
         * @param {Array} dir - List of directories to delete files from.
         * @returns {Promise<void>}
         */
        async deleteFile({state, dispatch, commit}, dir) {
            const {deleteKey} = require('@/api/index')
            commit('stateUpdate', {name: 'deleteVisible', data: true})
            commit('stateUpdate', {name: 'deleteNum', data: 0})
            commit('stateUpdate', {name: 'deleteConfirm', data: true})
            let files = await dispatch('getfiles', dir)
            let keys = files.map((item) => item.name)
            deleteKeyTool(keys)

            /**
             * Deletes a list of files from OSS (Object Storage Service).
             * It updates the state to reflect the number of files deleted and triggers the `fileUpdate` action when all
             * files are successfully deleted.
             * @param {Array<string>} keys - An array of file keys (paths) to be deleted.
             * @returns {Promise<void>}
             */
            async function deleteKeyTool(keys) {
                commit('stateUpdate', {name: 'deleteTotal', data: keys.length})
                for (let i = 0; i < keys.length; i++) {
                    deleteKey(keys[i]).then(() => {
                        commit('stateUpdate', {name: 'deleteNum', data: state.deleteNum += 1})
                        if (state.deleteNum >= state.deleteTotal) {
                            commit('stateUpdate', {name: 'deleteVisible', data: false})
                            dispatch('fileUpdate')
                            commit('stateUpdate', {name: 'deleteConfirm', data: false})
                        }
                    })
                }
            }
        },

        /**
         * Retrieve all files from specified directories, including recursive listing.
         * @param {Object} context - Vuex store context object.
         * @param {Array} temps - Array of directories to fetch files from.
         * @returns {Promise<Array>} A list of files.
         */
        async getfiles({state}, temps) {
            const {maxList, allList} = require('@/api/index')
            let files = []
            for (let i = 0; i < temps.length; i++) {
                let item = temps[i]
                if (item.dir) {
                    const {objects, isTruncated, nextMarker} = await allList(item.name)
                    files.push(...objects)
                    if (isTruncated) {
                        const maxs = await infiniteList(nextMarker)
                        files.push(...maxs)
                    }
                } else {
                    files.push(item)
                }
            }

            /**
             * Recursively fetches a complete list of files from OSS (Object Storage Service) when the result is
             * paginated (i.e., the number of files exceeds the API limit per request).
             * This function handles the pagination by checking the `nextMarker` and continues fetching until all files
             * are retrieved.
             * @param {string} nextMarker - The marker to start the next page of results (used for pagination).
             * @returns {Promise<Array>} A promise that resolves to an array of file objects.
             */
            async function infiniteList(nextMarker) {
                let max = nextMarker
                let flag = true
                let files = []
                while (flag) {
                    const res = await maxList(max)
                    max = res.nextMarker
                    flag = res.isTruncated
                    files.push(...res.objects)
                }
                return files
            }

            return files
        },

        /**
         * Handle the copy and paste operation for files or directories.
         * It retrieves the selected files, copies them to the target location, and optionally deletes them from the
         * source if a "shear" operation is triggered.
         * @param {Object} context - Vuex store context object.
         * @param {Object} info - Contains information for the paste operation.
         * @returns {Promise<void>}
         */
        async pasteClick({state, commit, dispatch}, info = {}) {
            const {copy} = require('@/api/index')
            commit('stateUpdate', {name: 'copyNum', data: 0})
            commit('stateUpdate', {name: 'copyVisible', data: true})
            let files = await dispatch('getfiles', state.copys)
            let list = []
            files.map((item) => {
                list.push({
                    to: item.name.replace(state.copyPath, info.toFile ? info.toFile : state.path),
                    from: item.name
                })
            })
            state.copyTotal = list.length
            for (let i = 0; i < list.length; i++) {
                copy(list[i].to, list[i].from).then(async () => {
                    commit('stateUpdate', {name: 'copyNum', data: state.copyNum += 1})
                    if (state.copyNum >= state.copyTotal) {
                        commit('stateUpdate', {name: 'copyVisible', data: false})
                        if (state.shear) {
                            commit('stateUpdate', {name: 'copys', data: []})
                            await dispatch('deleteFile', info.emptys)
                        } else {
                            dispatch('fileUpdate')
                        }
                    }
                })
            }
        }
    }
})
