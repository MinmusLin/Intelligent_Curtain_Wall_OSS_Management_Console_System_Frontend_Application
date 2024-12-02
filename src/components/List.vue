<template>
  <div class='file-list' @dragover.prevent @drop='dropFile'>
    <el-table stripe
              :data='ossList'
              ref='fileList'
              v-loading='loading'
              :max-height='tableHeight'
              style='width: 100%'
              @selection-change='toggleRowSelection'>
      <el-table-column type='selection' width='34'/>
      <el-table-column label='名称'>
        <div slot-scope='scope' class='file-name'>
          <svg class='icon' aria-hidden='true'>
            <use :xlink:href='suffixIconTool(scope.row)'/>
          </svg>
          <span style='color: #337AB7; cursor: pointer' @click='fileNameClick(scope.row)'>
            {{ dirTitleTool(scope.row) }}
          </span>
        </div>
      </el-table-column>
      <el-table-column prop='date' label='类型 / 大小' width='130px'>
        <span slot-scope='scope'>{{ scope.row.dir ? '目录' : renderSize(scope.row.size) }}</span>
      </el-table-column>
      <el-table-column label='最后修改时间' width='200'>
        <span slot-scope='scope'>
          {{ scope.row.dir ? '' : dateFormat('YYYY-mm-dd HH:MM', scope.row.lastModified) }}
        </span>
      </el-table-column>
      <el-table-column label='操作' width='240' header-align='right'>
        <div class='ace-operation' slot-scope='scope'>
          <div @click='getUrl(scope.row.name)'
               v-if='!scope.row.dir'
               type='text'
               style='font-size: 15px; font-weight: 700; color: #409EFF; cursor: pointer'>
            获取地址
          </div>
          <div @click='downloadClick(scope.row)'
               v-if='!scope.row.dir'
               type='text'
               style='font-size: 15px; font-weight: 700; color: #409EFF; cursor: pointer'>
            下载
          </div>
          <div type='text'
               @click='renameClick(scope.row)'
               style='font-size: 15px; font-weight: 700; color: #888888; cursor: pointer'>
            重命名
          </div>
          <div @click='deleteKeyTool(scope.row)'
               type='text'
               style='font-size: 15px; font-weight: 700; color: #F56C6C; cursor: pointer'>
            删除
          </div>
        </div>
      </el-table-column>
    </el-table>
    <el-dialog title='重命名'
               :visible.sync='renameVisible'
               width='400px'
               :before-close='handleClose'
               append-to-body
               :close-on-click-modal='false'>
      <div class='rename-path'>
        <span>重命名</span>
        <el-input v-model='rename.to' :spellcheck='false' style='width: 240px'/>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click='renameConfirm'>
            <i class='iconfont icon-queding1'/>
            <span>确定</span>
          </div>
          <div class='btn-child' @click='renameVisible=false'>
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>取消</span>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title='图片预览'
               :visible.sync='imgPreviewVisible'
               width='800px'
               :before-close='handleClose'
               append-to-body
               :close-on-click-modal='false'>
      <div class='img-preview'>
        <img :src='imgPreviewUrl' alt='imgPreviewUrl'/>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click='imgPreviewVisible=false'>
            <i class='iconfont icon-dashujukeshihuaico-'></i>
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
      imgPreviewUrl: '',
      downloadAddress: {},
      tableHeight: 0
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
    getHeight(vm) {
      let oss = document.querySelector('.web-oss').getBoundingClientRect().height
      vm.tableHeight = oss - (160)
    },
    async downloadClick(row) {
      let url = await signatureUrl(row.name)
      download(url, this.dirTitleTool(row))
    },
    getUrl(name) {
      navigator.clipboard.writeText('http://110.42.214.164:8005/oss/download/' + name).then(() => {
        this.$notify({
          title: '剪贴板',
          message: '文件地址已复制到剪贴板',
          type: 'success',
          position: 'top-left',
          duration: 3000
        })
      })
    },
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
        this.$store.dispatch('fileUpdate')
      })
    },
    async renameConfirm() {
      const _this = this
      this.renameVisible = false
      let {to, from, dir} = this.rename
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
          _this.$store.dispatch('fileUpdate')
          _this.renameVisible = false
        })
      }
    },
    renameClick(row) {
      this.renameVisible = true
      let name = row.name.replace(this.path, '').replace('/', '')
      this.rename = {to: name, from: name, dir: row.dir}
    },
    handleClose(none) {
      none()
    },
    toggleRowSelection(rows) {
      this.$store.commit('stateUpdate', {name: 'selections', data: rows})
    },
    dropFile(event) {
      event = window.event || event
      event.preventDefault()
      event.stopPropagation()
      let files = Array.from(event.dataTransfer.files)
      files.map((file) => {
        this.$store.dispatch('sliceUpload', {file})
      })
    },
    async refresh() {
      this.$store.dispatch('fileUpdate')
    },
    async fileNameClick(row) {
      let suffix = row.name.split('.')
      if (row.dir) {
        this.$store.commit('stateUpdate', {name: 'path', data: row.name})
        return
      }
      if (this.imgSuffixTool(row.name)) {
        this.imgPreviewUrl = row.url
        console.log(this.imgPreviewUrl)
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
    imgSuffixTool(name) {
      const suffix = name.split('.').pop()
      return ['png', 'jpeg', 'jpg', 'gif', 'webp'].includes(suffix)
    },
    dirTitleTool({name, dir}) {
      let names = name.split('/')
      return dir ? names[names.length - 2] : names[names.length - 1]
    },
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
.el-table th > .cell {
  font-size: 13px;
  font-weight: 700;
  color: #888888;
}

.el-dialog__body {
  padding: 0;
}

.form-outer {
  padding: 0 20px;

  .form-inner {
    padding: 0;
  }
}
</style>

<style scoped lang='css'>
.rename-path {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  margin-bottom: 10px;

  > span:nth-child(1) {
    width: 70px;
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #606266;
    margin-right: 10px;
  }

  > input {
    width: 100px;
  }
}

.mkdir-btn {
  width: 100%;
  height: 40px;
  border-top: 1px solid rgba(136, 136, 136, 0.3);
  background-color: #F6F6F6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 6px;
  box-sizing: border-box;

  .ace-btns {
    display: flex;

    .btn-child {
      border: 1px solid rgba(136, 136, 136, 0.3);
      border-radius: 5px;
      margin-left: 10px;

      > i {
        margin-top: 1px;
      }
    }

    .btn-child:nth-child(1) {
      background-color: #5CB85C;
      color: white;

      &:hover {
        background-color: #449D44;
      }

      &:active {
        background-color: #398439;
      }

      > i {
        color: white;
        margin-top: 1px;
      }
    }
  }
}

.ace-btns {
  height: 30px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin-right: 0;
  user-select: none;

  .btn-child {
    height: 30px;
    min-width: 40px;
    padding: 0 8px;
    background-color: white;
    box-sizing: border-box;
    border: 1px solid rgba(136, 136, 136, 0.3);
    border-right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    input[type='file'] {
      opacity: 0;
      position: absolute;
      left: 0;
      top: -100%;
      width: 100%;
      height: 200%;
      cursor: pointer;
    }

    > span {
      font-size: 14px;
      margin-left: 3px;
    }

    &:hover {
      background-color: #E6E6E6;
    }

    &:active {
      background-color: #F5F5F5;
    }
  }
}
</style>

<style scoped lang='css'>
.file-list {
  width: 100%;
  overflow: auto;

  .file-name {
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 20px;

    > svg {
      margin-right: 10px;
    }

    span {
      font-size: 13px;
    }
  }

  span {
    font-size: 14px;
  }

  .ace-operation {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}

.img-preview {
  width: 800px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  > img {
    max-height: 100%;
  }
}
</style>
