<template>
  <div class='file-header'>
    <div class='top' style='transform: translateY(-5px)'>
      <div class='ace-btns'>
        <div class='btn-child' @click='pathBack'>
          <span class='iconfont icon-arrowLeft-fill'/>
        </div>
        <div class='btn-child' @click='refresh'>
          <span class='iconfont icon-shuaxin'/>
        </div>
        <div class='btn-child' @click="$store.commit('stateUpdate', { name: 'path', data: '' })">
          <span class='iconfont icon-home'/>
        </div>
      </div>
      <div class='ace-path'>
        <span>oss://{{ bucket }}/{{ path }}</span>
      </div>
    </div>
    <div class='bottom'>
      <div class='ace-btns' v-show='path' style='transform: translateY(-3px)'>
        <div class='btn-child'>
          <i class='iconfont icon-shangchuan'/>
          <span>文件</span>
          <input type='file' @change='dirUpload' multiple/>
        </div>
        <div class='btn-child' @click='mkdirFileClick'>
          <i class='iconfont icon-jia'/>
          <span>目录</span>
        </div>
        <div class='btn-child' @click='downloadAddressClick'>
          <i class='iconfont icon-xiazai3'/>
          <span>地址</span>
        </div>
        <div class='btn-child' @click='copyClick(null)'>
          <i class='iconfont icon-fuzhi'/>
          <span>复制</span>
        </div>
        <div class='btn-child' @click='copyClick(true)'>
          <i class='iconfont icon-jianqie'/>
          <span>剪切</span>
        </div>
        <div class='btn-child'
             @click="operationClick('delete')"
             style='border-right: 1px solid rgba(136, 136, 136, 0.3)'>
          <i class='iconfont icon-dashujukeshihuaico-'/>
          <span>删除</span>
        </div>
        <div class='paste' v-if='copys.length > 0'>
          <div class='paste-child' @click='pasteClick'>
            <i class='iconfont icon-niantie'/>
            <span>粘贴 ({{ copys.length }})</span>
          </div>
          <span class='iconfont icon-dashujukeshihuaico-' @click='cancelPasteClick'/>
        </div>
      </div>
      <div v-show='!path' style='font-size: 14px; padding-top: 2px; padding-left: 3px'>
        <span>欢迎使用智慧幕墙数据集管理平台！</span>
        <a href='https://github.com/MinmusLin/Intelligent_Curtain_Wall_Backend_Integration/blob/main/Documentation/Dataset_Management_Platform_Guide.md'
           target='_blank'
           style='color: #409EFF; text-decoration: none'>点击此处</a>
        <span>查阅平台使用指南。</span>
      </div>
    </div>

    <el-dialog title='创建目录' :visible.sync='mkdirVisible' width='500px' :before-close='handleClose' append-to-body>
      <div class='mkdir-path'>
        <el-input v-model='mkdirName' placeholder='请输入目录名称' :spellcheck='false' style='width: 100%'/>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click='mkdirVisible=false'>
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>取消</span>
          </div>
          <div class='btn-child' @click='mkdirClick'>
            <i class='iconfont icon-queding1'/>
            <span>确定</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog title='删除文件'
               :visible.sync='deleteVisible'
               width='800px'
               :before-close="() => closeFun('deleteVisible', false)"
               append-to-body>
      <div class='delete-progress' v-if='deleteConfirm'>
        <span>
          {{
            this.deleteTotal > 1000 ? '正在删除文件 ...（同时删除的文件数量过多，可能会受到阿里云 OSS 的并发请求限制）' : '正在删除文件 ...'
          }}
        </span>
        <div class='delete-child'>
          <span :style="{ width: percentage(deleteNum, deleteTotal) + '%' }"/>
        </div>
        <span>{{ deleteNum }} / {{ deleteTotal }}</span>
      </div>
      <div class='delete-list' v-if='!deleteConfirm'>
        <span>将删除以下文件：</span>
        <div class='delete-child' v-for='(item, index) in selections' :key='index'>
          <svg class='icon' aria-hidden='true'>
            <!--suppress HtmlUnknownAttribute-->
            <use :xlink:href="item.name[item.name.length - 1] === '/' ? '#icon-wenjianjia' : suffixIconTool(item)"/>
          </svg>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click="closeFun('deleteVisible', false)">
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>关闭</span>
          </div>
          <div class='btn-child' @click='deleteFile' v-if='!deleteConfirm'>
            <i class='iconfont icon-queding1'/>
            <span>确定</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog title='粘贴文件'
               :visible.sync='copyVisible'
               width='800px'
               :before-close="() => closeFun('copyVisible', false)"
               append-to-body>
      <div class='copy-progress'>
        <span>
          {{
            this.copyTotal > 1000 ? '正在粘贴文件 ...（同时删除的文件数量过多，可能会受到阿里云 OSS 的并发请求限制）' : '正在粘贴文件 ...'
          }}
        </span>
        <div class='copy-child'>
          <span :style="{ width: percentage(copyNum, copyTotal) + '%' }"/>
        </div>
        <span>{{ copyNum }} / {{ copyTotal }}</span>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click="closeFun('copyVisible', false)">
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang='js'>
import {mapState} from 'vuex'
import {simplePut} from '@/api'
import {percentage} from '@/tool'

export default {
  data() {
    return {
      percentage,
      mkdirVisible: false,
      mkdirName: ''
    }
  },
  computed: mapState({
    path: (state) => state.path,
    selections: (state) => state.selections,
    copys: (state) => state.copys,
    copyPath: (state) => state.copyPath,
    copyNum: (state) => state.copyNum,
    copyTotal: (state) => state.copyTotal,
    copyVisible: (state) => state.copyVisible,
    deleteNum: (state) => state.deleteNum,
    deleteTotal: (state) => state.deleteTotal,
    deleteVisible: (state) => state.deleteVisible,
    deleteConfirm: (state) => state.deleteConfirm,
    shear: (state) => state.shear,
    bucket: (state) => state.bucket
  }),
  watch: {
    path() {
      this.refresh()
    }
  },
  methods: {
    /**
     * Toggles the visibility of the create directory dialog.
     * @method mkdirFileClick
     */
    mkdirFileClick() {
      this.mkdirName = ''
      this.mkdirVisible = true
    },

    /**
     * Closes the dialog and updates the store.
     * @method closeFun
     * @param {string} name - The store variable name.
     * @param {boolean} data - The data to set.
     */
    closeFun(name, data) {
      this.$store.commit('stateUpdate', {name, data})
    },

    /**
     * Initiates the download of a text file containing URLs of the selected files.
     * @method downloadAddressClick
     */
    async downloadAddressClick() {
      if (this.selections.length < 1) {
        return
      }
      let list = await this.$store.dispatch('getfiles', this.selections)
      let filteredList = list.filter(item => !item.name.endsWith('/'))
      const baseUrl = `${this.$baseURL}/oss/download/`
      const textToSave = filteredList.map(item => baseUrl + item.name).join('\n')
      const blob = new Blob([textToSave], {type: 'text/plain'})
      // noinspection JSCheckFunctionSignatures
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'files_list.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    /**
     * Opens a dialog for performing file operations such as delete.
     * @method operationClick
     * @param {string} type - The type of operation (delete).
     */
    operationClick(type) {
      if (this.selections.length < 1) {
        return
      }
      if (type === 'delete') {
        this.$store.commit('stateUpdate', {name: 'deleteVisible', data: true})
      }
    },

    /**
     * Initiates the paste operation using copied files.
     * @method pasteClick
     */
    async pasteClick() {
      await this.$store.dispatch('pasteClick', {emptys: this.copys})
    },

    /**
     * Cancels the current paste operation.
     * @method cancelPasteClick
     */
    cancelPasteClick() {
      this.$store.commit('stateUpdate', {name: 'copys', data: []})
    },

    /**
     * Prepares to copy or cut selected files.
     * @method copyClick
     * @param {boolean} type - Determines whether to copy or cut (true for cut).
     */
    async copyClick(type) {
      this.$store.commit('stateUpdate', {name: 'shear', data: type})
      this.$store.commit('stateUpdate', {name: 'copys', data: this.selections})
      this.$store.commit('stateUpdate', {name: 'copyPath', data: this.path})
    },

    /**
     * Deletes the selected files.
     * @method deleteFile
     */
    async deleteFile() {
      await this.$store.dispatch('deleteFile', this.selections)
    },

    /**
     * Creates a new directory after validating the name.
     * @method mkdirClick
     */
    async mkdirClick() {
      const validNamePattern = /^[A-Za-z0-9-]+$/
      if (!this.mkdirName || !validNamePattern.test(this.mkdirName)) {
        this.$message({
          message: '目录名称只能包含以下字符：A-Z, a-z, 0-9, -',
          type: 'warning',
          duration: 3000,
          showClose: true
        })
        return
      }
      this.mkdirVisible = false
      await simplePut(`${this.path}${this.mkdirName}/`, new Blob(['']))
      await this.$store.dispatch('fileUpdate')
    },

    /**
     * Handles the closing of dialogs.
     * @method handleClose
     * @param {function} none - The callback function to close the dialog.
     */
    handleClose(none) {
      none()
    },

    /**
     * Handles file upload and validates filenames.
     * @method dirUpload
     * @param {Event} e - The event triggered by the file input change.
     */
    dirUpload(e) {
      let files = Array.from(e.target.files)
      e.target.value = ''
      const validNamePattern1 = /^[A-Za-z0-9-.]+$/
      const invalidFiles = files.filter(file => !validNamePattern1.test(file.name))
      if (invalidFiles.length > 0) {
        this.$message({
          message: '已取消上传文件，文件名称只能包含以下字符：A-Z, a-z, 0-9, -, .',
          type: 'warning',
          duration: 3000,
          showClose: true
        })
        return
      }
      files.forEach((file) => {
        this.$store.dispatch('sliceUpload', {file})
      })
    },

    /**
     * Refreshes the file list by dispatching an update action.
     * @method refresh
     */
    async refresh() {
      await this.$store.dispatch('fileUpdate')
    },

    /**
     * Navigates one level up the current file path.
     * @method pathBack
     */
    pathBack() {
      let path = this.path
      let paths = path.split('/')
      paths.splice(paths.length - 2, 1)
      this.$store.commit('stateUpdate', {name: 'path', data: paths.join('/')})
      this.refresh()
    },

    /**
     * Returns the appropriate icon based on the file type.
     * @method suffixIconTool
     * @param {object} row - The file item to check for the icon.
     * @returns {string} - The corresponding icon.
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

<style scoped lang='css'>
.mkdir-path {
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
  border-right: 0;
}

.ace-btns .btn-child input[type='file'] {
  opacity: 0;
  position: absolute;
  cursor: pointer;
  left: 0;
  top: 0;
  width: 65px;
  height: 30px;
}

.ace-btns .btn-child > span {
  font-size: 14px;
  margin-left: 3px;
}

.ace-btns .btn-child:hover {
  background-color: #E6E6E6;
}

.ace-btns .btn-child i {
  transform: translateY(1px);
}

.paste {
  height: 30px;
  background-color: white;
  border: 1px solid rgba(136, 136, 136, 0.3);
  display: flex;
  align-items: center;
  cursor: pointer;
  border-left: 0;
  position: relative;
  padding-right: 16px;
}

.paste .paste-child {
  width: 100%;
  height: 100%;
  padding: 0 6px;
  display: flex;
  align-items: center;
}

.paste .paste-child:hover {
  background-color: #F5F5F5;
}

.paste .paste-child > i {
  color: #409EFF;
  transform: translateY(1px);
}

.paste .paste-child > span {
  margin-left: 4px;
}

.paste > span {
  width: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 1px solid rgba(136, 136, 136, 0.3);
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
}

.paste > span:hover {
  background-color: #F5F5F5;
}

.file-header > .top {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.file-header > .top .ace-path {
  width: 100%;
  height: 30px;
  border: 1px solid rgba(136, 136, 136, 0.3);
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.file-header > .top .ace-path > span {
  color: #2F3235;
  font-weight: bold;
  font-size: 13px;
}

.file-header > .bottom {
  height: 35px;
  padding: 0 10px;
  border-bottom: 1px solid rgba(136, 136, 136, 0.3);
}

.delete-list {
  padding: 6px 20px 16px;
  height: 400px;
  overflow: auto;
}

.delete-list > span {
  color: #2F3235;
  font-size: 14px;
}

.delete-list .delete-child {
  margin-top: 5px;
  width: 100%;
  font-size: 15px;
  display: flex;
  align-items: center;
}

.delete-list .delete-child > span {
  color: #2F3235;
  font-size: 14px;
  margin: 1px 8px 0;
}

.copy-progress, .delete-progress {
  width: 100%;
  height: 110px;
  padding: 0 20px;
  color: #2F3235;
}

.copy-progress > span:nth-child(3), .delete-progress > span:nth-child(3) {
  font-size: 14px;
  font-weight: 700;
}

.copy-progress > span, .delete-progress > span {
  display: block;
  margin-top: 14px;
  font-size: 16px;
}

.copy-progress .copy-child, .delete-progress .delete-child {
  width: 100%;
  height: 20px;
  background-color: #EEEEEE;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 16px;
}

.copy-progress .copy-child > span:nth-child(1), .delete-progress .delete-child > span:nth-child(1) {
  height: 100%;
  display: block;
  background-color: #5CB85C;
}
</style>
