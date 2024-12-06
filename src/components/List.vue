<!--suppress HtmlDeprecatedAttribute-->

<template>
  <div class='file-list' @dragover.prevent @drop='dropFile'>
    <el-table v-if='path'
              stripe
              :data='ossList'
              ref='fileList'
              v-loading='loading'
              :max-height='tableHeight'
              style='width: 100%'
              @selection-change='toggleRowSelection'>
      <el-table-column type='selection' width='35'/>
      <el-table-column label='名称'>
        <div slot-scope='scope' class='file-name'>
          <svg class='icon' aria-hidden='true'>
            <!--suppress HtmlUnknownAttribute-->
            <use :xlink:href='suffixIconTool(scope.row)'/>
          </svg>
          <span style='color: #337AB7; cursor: pointer' @click='fileNameClick(scope.row)'>
            {{ dirTitleTool(scope.row) }}
          </span>
        </div>
      </el-table-column>
      <el-table-column prop='date' label='类型 / 大小' width='140'>
        <span slot-scope='scope'>{{ scope.row.dir ? '目录' : renderSize(scope.row.size) }}</span>
      </el-table-column>
      <el-table-column label='修改时间' width='160'>
        <span slot-scope='scope'>
          {{ scope.row.dir ? '' : dateFormat('YYYY-mm-dd HH:MM', scope.row.lastModified) }}
        </span>
      </el-table-column>
      <el-table-column label='操作' width='220' header-align='right'>
        <div class='ace-operation' slot-scope='scope'>
          <div @click='getUrl(scope.row.name)'
               v-if='!scope.row.dir'
               style='font-size: 15px; font-weight: 700; color: #409EFF; cursor: pointer'>
            获取地址
          </div>
          <div @click='downloadClick(scope.row)'
               v-if='!scope.row.dir'
               style='font-size: 15px; font-weight: 700; color: #409EFF; cursor: pointer'>
            下载
          </div>
          <div @click='renameClick(scope.row)'
               style='font-size: 15px; font-weight: 700; color: #888888; cursor: pointer'>
            重命名
          </div>
          <div @click='deleteKeyTool(scope.row)'
               style='font-size: 15px; font-weight: 700; color: #F56C6C; cursor: pointer'>
            删除
          </div>
        </div>
      </el-table-column>
    </el-table>

    <el-table v-if='!path'
              stripe
              :data='ossList'
              ref='fileList'
              v-loading='loading'
              :max-height='tableHeight'
              style='width: 100%'
              @selection-change='toggleRowSelection'>
      <el-table-column type='selection' width='35'/>
      <el-table-column label='数据集'>
        <div slot-scope='scope' class='file-name'>
          <svg class='icon' aria-hidden='true'>
            <!--suppress HtmlUnknownAttribute-->
            <use :xlink:href='suffixIconTool(scope.row)'/>
          </svg>
          <span style='color: #337AB7; cursor: pointer' @click='datasetClick(scope.row)'>
            {{ dirTitleTool(scope.row) }}
          </span>
        </div>
      </el-table-column>
      <el-table-column label='子系统' width='400'>
        <span slot-scope='scope'>
          {{ getSubsystemByName(scope.row.name) }}
        </span>
      </el-table-column>
    </el-table>

    <el-dialog title='重命名' :visible.sync='renameVisible' width='500px' :before-close='handleClose' append-to-body>
      <div class='rename-path'>
        <el-input v-model='rename.to' :spellcheck='false' style='width: 100%' placeholder='请输入文件名称'/>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click='renameVisible=false'>
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>取消</span>
          </div>
          <div class='btn-child' @click='renameConfirm'>
            <i class='iconfont icon-queding1'/>
            <span>确定</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog title='图像预览'
               :visible.sync='imgPreviewVisible'
               width='800px'
               :before-close='handleClose'
               append-to-body>
      <div class='img-preview'>
        <img v-if='imgPreviewName'
             :src='`${this.$baseURL}oss/download/${imgPreviewName}`'
             alt='imgPreviewName'/>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click='imgPreviewVisible=false'>
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang='js'>
import {dateFormat, download, renderSize} from '@/tool'
import {copy, deleteKey, signatureUrl} from '@/api'
import {mapState} from 'vuex'
import axios from 'axios'

export default {
  data() {
    return {
      renderSize,
      dateFormat,
      rename: {},
      renameVisible: false,
      imgPreviewVisible: false,
      imgPreviewName: '',
      downloadAddress: {},
      tableHeight: 0,
      accounts: [
        {name: 'corrosion-detection', subsystem: '金属幕墙锈蚀污损检测系统'},
        {name: 'crack-detection', subsystem: '石材幕墙裂缝检测系统'},
        {name: 'flatness-detection', subsystem: '玻璃幕墙平整度检测系统'},
        {name: 'mobile-data', subsystem: '移动端幕墙数据采集与展示系统'},
        {name: 'modeling-communication', subsystem: '无人机采集数据的 3D 建模与通讯系统'},
        {name: 'resilience-assessment', subsystem: '幕墙韧性评估软件系统'},
        {name: 'spalling-detection', subsystem: '玻璃幕墙爆裂检测系统'},
        {name: 'stain-detection', subsystem: '石材幕墙污渍检测系统'},
        {name: 'vibration-detection', subsystem: '幕墙震动数据检测与展示系统'},
        {name: 'oss-management', subsystem: '智慧幕墙数据集管理平台管理员'}
      ]
    }
  },
  computed: mapState({
    path: (state) => state.path,
    loading: (state) => state.loading,
    ossList: (state) => state.ossList,
    CodeEditor: (state) => state.CodeEditor
  }),
  mounted() {
    const _this = this
    this.refresh()
    this.$nextTick(() => {
      this.getHeight(_this)
    })
    window.addEventListener('resize', () => _this.getHeight(_this))
  },
  methods: {
    /**
     * Returns the corresponding subsystem for a given account name.
     * If no matching account name is found, it returns the provided name.
     * @param {string} name - The account name to search for.
     * @returns {string} - The corresponding subsystem if a match is found, or the input name if no match is found.
     */
    getSubsystemByName(name) {
      if (name.endsWith('/')) {
        name = name.slice(0, -1)
      }
      const account = this.accounts.find(account => account.name === name)
      return account ? account.subsystem : name
    },

    /**
     * Calculate and set the height of the table based on window size.
     * @param {Object} vm - The Vue component instance.
     */
    getHeight(vm) {
      let oss = document.querySelector('.web-oss').getBoundingClientRect().height
      vm.tableHeight = oss - (160)
    },

    /**
     * Initiates file download by calling the download function.
     * @param {Object} row - The file row object to download.
     */
    async downloadClick(row) {
      download(signatureUrl(row.name, {}), this.dirTitleTool(row))
    },

    /**
     * Copies the file URL to the clipboard.
     * @param {string} name - The file name to generate the URL.
     */
    getUrl(name) {
      const textArea = document.createElement('textarea')
      textArea.value = `${this.$baseURL}oss/download/` + name
      document.body.appendChild(textArea)
      textArea.select()
      try {
        // noinspection JSDeprecatedSymbols
        const successful = document.execCommand('copy')
        if (successful) {
          this.$notify({
            title: '剪贴板',
            message: '文件地址已复制到剪贴板',
            type: 'success',
            position: 'top-left',
            duration: 3000
          })
        } else {
          this.$notify({
            title: '剪贴板',
            message: '复制文件地址失败',
            type: 'error',
            position: 'top-left',
            duration: 3000
          })
        }
      } catch (err) {
        this.$notify({
          title: '剪贴板',
          message: '复制文件地址失败',
          type: 'error',
          position: 'top-left',
          duration: 3000
        })
      }
      document.body.removeChild(textArea)
    },

    /**
     * Deletes a file or directory after confirmation.
     * @param {Object} row - The file or directory object to delete.
     */
    async deleteKeyTool(row) {
      if (row.dir) {
        this.$store.commit('stateUpdate', {name: 'selections', data: [{dir: true, name: row.name}]})
        this.$store.commit('stateUpdate', {name: 'deleteVisible', data: true})
        return
      }
      this.$confirm('是否永久删除此文件？', '删除文件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await deleteKey(row.name)
        await this.$store.dispatch('fileUpdate')
      })
    },

    /**
     * Confirms renaming of a file or directory and handles the rename operation.
     */
    async renameConfirm() {
      const _this = this
      const validNamePattern1 = /^[A-Za-z0-9-.]+$/
      const validNamePattern2 = /^[A-Za-z0-9-]+$/
      let {to, from, dir} = this.rename
      if (to === from) {
        this.renameVisible = false
        return
      }
      if (!dir && (!to || !validNamePattern1.test(to))) {
        this.$message({
          message: '文件名称只能包含以下字符：A-Z, a-z, 0-9, -, .',
          type: 'warning',
          duration: 3000,
          showClose: true
        })
        return
      }
      if (dir && (!to || !validNamePattern2.test(to))) {
        this.$message({
          message: '目录名称只能包含以下字符：A-Z, a-z, 0-9, -',
          type: 'warning',
          duration: 3000,
          showClose: true
        })
        return
      }
      this.renameVisible = false
      if (dir) {
        to = to + '/'
        from = from + '/'
      }
      if (dir) {
        this.$store.commit('stateUpdate', {name: 'copyPath', data: `${this.path}${from}`})
        this.$store.commit('stateUpdate', {name: 'copys', data: [{dir: true, name: `${this.path}${from}`}]})
        this.$store.commit('stateUpdate', {name: 'shear', data: true})
        await this.$store.dispatch('pasteClick', {
          toFile: `${this.path}${to}`,
          emptys: [{dir: true, name: `${this.path}${from}`}]
        })
      } else {
        copy(`${this.path}${to}`, `${this.path}${from}`).then(async () => {
          await deleteKey(`${this.path}${from}`)
          await _this.$store.dispatch('fileUpdate')
          _this.renameVisible = false
        })
      }
    },

    /**
     * Opens the rename dialog for a file or directory.
     * @param {Object} row - The file or directory row to rename.
     */
    renameClick(row) {
      this.renameVisible = true
      let name = row.name.replace(this.path, '').replace('/', '')
      this.rename = {to: name, from: name, dir: row.dir}
    },

    /**
     * Handles closing of dialogs, clearing preview image data.
     * @param {Function} none - Callback to close the dialog.
     */
    handleClose(none) {
      this.imgPreviewName = ''
      none()
    },

    /**
     * Toggles row selection in the table.
     * @param {Array} rows - The selected rows.
     */
    toggleRowSelection(rows) {
      this.$store.commit('stateUpdate', {name: 'selections', data: rows})
    },

    /**
     * Handles file drop event to upload files.
     * @param {Event} event - The drop event.
     */
    dropFile(event) {
      // noinspection JSDeprecatedSymbols
      event = window.event || event
      event.preventDefault()
      event.stopPropagation()
      // noinspection JSUnresolvedReference
      let files = Array.from(event.dataTransfer.files)
      files.map((file) => {
        this.$store.dispatch('sliceUpload', {file})
      })
    },

    /**
     * Refreshes the file list by dispatching a file update action.
     */
    async refresh() {
      await this.$store.dispatch('fileUpdate')
    },

    /**
     * Handles file name click, navigating to directories or previewing files.
     * @param {Object} row - The clicked file or directory row.
     */
    async fileNameClick(row) {
      let suffix = row.name.split('.')
      if (row.dir) {
        this.$store.commit('stateUpdate', {name: 'path', data: row.name})
        return
      }
      if (this.imgSuffixTool(row.name)) {
        this.imgPreviewName = row.name
        this.imgPreviewVisible = true
        return
      }
      const result = await axios({
        url: signatureUrl(row.name, {'content-disposition': `attachment; filename=code.js`}),
        method: 'get'
      })
      let CodeEditor = this.CodeEditor
      if (suffix[suffix.length - 1] === 'json') {
        CodeEditor.code = JSON.stringify(result.data, null, '\t')
      } else {
        CodeEditor.code = result.data
      }
      CodeEditor.size = renderSize(row.size)
      CodeEditor.path = row.name
      CodeEditor.suffix = '.' + row.name.split('.')[row.name.split('.').length - 1]
      this.$store.commit('stateUpdate', {name: 'CodeEditor', data: CodeEditor})
      this.$store.commit('stateUpdate', {name: 'editorShow', data: true})
    },

    /**
     * Handles the click event on a dataset row.
     * Checks the user's permission and decides whether they can view the dataset.
     * If the user has permission, it calls the `fileNameClick` method.
     * If the user doesn't have permission, it shows a notification indicating that access is denied.
     * @param {Object} row - The dataset row object clicked by the user. This object contains the dataset's metadata.
     * @returns {Promise<void>} - A promise that resolves when the fileNameClick method is executed, or a notification is shown.
     */
    async datasetClick(row) {
      let ossUserName = window.localStorage.getItem('ossUserName') || ''
      if (ossUserName !== 'oss-management') {
        let name = row.name
        if (name.endsWith('/')) {
          name = name.slice(0, -1)
        }
        if (name === ossUserName) {
          await this.fileNameClick(row)
        } else {
          this.$notify({
            title: '权限禁止',
            message: '您没有权限查看此数据集',
            type: 'error',
            position: 'top-left',
            duration: 3000
          })
        }
      } else {
        await this.fileNameClick(row)
      }
    },

    /**
     * Checks if the file extension is an image format.
     * @param {string} name - The file name to check.
     * @returns {boolean} - Returns true if the file is an image, otherwise false.
     */
    imgSuffixTool(name) {
      const suffix = name.split('.').pop()
      return ['png', 'jpeg', 'jpg', 'gif', 'webp'].includes(suffix)
    },

    /**
     * Returns the directory or file name without its path.
     * @param {Object} param - The row object containing file or directory information.
     * @returns {string} - The name of the file or directory.
     */
    dirTitleTool({name, dir}) {
      let names = name.split('/')
      return dir ? names[names.length - 2] : names[names.length - 1]
    },

    /**
     * Returns the appropriate icon for the file based on its extension.
     * @param {Object} row - The row object containing the file information.
     * @returns {string} - The icon's reference.
     */
    suffixIconTool(row) {
      if (row.dir) {
        return '#icon-wenjianjia'
      }
      let icon = '#icon-wendang1'
      let names = row.name.split('.')
      let suffix = names[names.length - 1]
      suffix === 'zip' && (icon = '#icon-yasuobao')
      suffix === 'pdf' && (icon = '#icon-pdf')
      suffix === 'docx' && (icon = '#icon-WORD')
      suffix === 'doc' && (icon = '#icon-WORD')
      suffix === 'md' && (icon = '#icon-file-markdown')
      suffix === 'vue' && (icon = '#icon-Vue')
      suffix === 'java' && (icon = '#icon-java')
      suffix === 'jar' && (icon = '#icon-java')
      suffix === 'class' && (icon = '#icon-java')
      suffix === 'js' && (icon = '#icon-js')
      suffix === 'jsx' && (icon = '#icon-jsx')
      suffix === 'php' && (icon = '#icon-php')
      suffix === 'css' && (icon = '#icon-CSS1')
      suffix === 'less' && (icon = '#icon-CSS1')
      suffix === 'scss' && (icon = '#icon-CSS1')
      suffix === 'xlsx' && (icon = '#icon-xlsx')
      suffix === 'json' && (icon = '#icon-JSON')
      suffix === 'txt' && (icon = '#icon-TXT')
      suffix === 'png' && (icon = '#icon-huabanfuben')
      suffix === 'jpg' && (icon = '#icon-huabanfuben')
      suffix === 'jpeg' && (icon = '#icon-huabanfuben')
      suffix === 'gif' && (icon = '#icon-huabanfuben')
      suffix === 'webp' && (icon = '#icon-huabanfuben')
      suffix === 'svg' && (icon = '#icon-huabanfuben')
      suffix === 'icon' && (icon = '#icon-huabanfuben')
      suffix === 'psd' && (icon = '#icon-PSDtubiao')
      suffix === 'exe' && (icon = '#icon-windows')
      suffix === 'html' && (icon = '#icon-chrome')
      suffix === 'htm' && (icon = '#icon-chrome')
      suffix === 'xml' && (icon = '#icon-xml')
      suffix === 'ts' && (icon = '#icon-ts')
      return icon
    }
  }
}
</script>

<style lang='css'>
/* noinspection CssUnusedSymbol */
.el-dialog__body {
  padding: 0;
}
</style>

<style scoped lang='css'>
.rename-path {
  width: 100%;
  padding: 0 15px;
  margin-top: 10px;
  margin-bottom: 20px;
}

.mkdir-btn {
  width: 100%;
  height: 50px;
  border-top: 1px solid rgba(136, 136, 136, 0.3);
  background-color: #F6F6F6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 15px;
}

.mkdir-btn .ace-btns .btn-child {
  border: 1px solid rgba(136, 136, 136, 0.3);
  border-radius: 5px;
  margin-left: 10px;
}

.mkdir-btn .ace-btns .btn-child > i {
  transform: translateY(1px);
}

.mkdir-btn .ace-btns .btn-child:nth-child(2) {
  background-color: #5CB85C;
  color: white;
}

.mkdir-btn .ace-btns .btn-child:nth-child(2):hover {
  background-color: #449D44;
}

.ace-btns {
  display: flex;
  align-items: center;
  user-select: none;
}

.ace-btns .btn-child {
  height: 30px;
  padding: 0 8px;
  background-color: white;
  border: 1px solid rgba(136, 136, 136, 0.3);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.ace-btns .btn-child > span {
  font-size: 14px;
  margin-left: 3px;
}

.ace-btns .btn-child:hover {
  background-color: #E6E6E6;
}

.file-list {
  width: 100%;
  overflow: auto;
}

.file-list .file-name {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 20px;
}

.file-list .file-name > svg {
  margin-right: 10px;
}

.file-list .file-name span {
  font-size: 13px;
}

.file-list .ace-operation {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.img-preview {
  width: 800px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.img-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
