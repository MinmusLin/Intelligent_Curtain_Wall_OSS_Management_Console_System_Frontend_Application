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
          <span>创建目录</span>
        </div>
        <div class='btn-child' @click='downloadAddressClick'>
          <i class='iconfont icon-xiazai3'/>
          <span>获取地址</span>
        </div>
        <div class='btn-child' @click='copyClick(null)'>
          <i class='iconfont icon-fuzhi'/>
          <span>复制</span>
        </div>
        <div class='btn-child' @click='copyClick(true)'>
          <i class='iconfont icon-jianqie'/>
          <span>移动</span>
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
    </div>
    <el-dialog title='创建目录' :visible.sync='mkdirVisible' width='400px' :before-close='handleClose' append-to-body>
      <div class='mkdir'>
        <span>目录名称</span>
        <el-input v-model='mkdirName' placeholder='目录名称'/>
      </div>
      <div class='mkdir-btn'>
        <div class='ace-btns'>
          <div class='btn-child' @click='mkdirClick'>
            <i class='iconfont icon-queding1'/>
            <span>确定</span>
          </div>
          <div class='btn-child' @click='mkdirVisible = false'>
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>取消</span>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog :title="deleteConfirm ? '文件删除' : '将删除以下目录和文件'"
               :visible.sync='deleteVisible'
               width='600px'
               :before-close="() => closeFun('deleteVisible', false)"
               append-to-body>
      <div class='delete-progress' v-if='deleteConfirm'>
        <span>
          {{ this.deleteTotal > 1000 ? '删除文件数量超限，可能会受到OSS服务器的并发限制，正在删除' : '正在删除' }}
        </span>
        <div class='delete-child'>
          <span :style="{ width: percentage(deleteNum, deleteTotal) + '%' }"/>
        </div>
        <span>{{ deleteNum }} / {{ deleteTotal }}</span>
      </div>
      <div class='delete-list' v-if='!deleteConfirm'>
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
          <div class='btn-child' @click='deleteFile' v-if='!deleteConfirm'>
            <i class='iconfont icon-queding1'/>
            <span>确定</span>
          </div>
          <div class='btn-child' @click="closeFun('deleteVisible', false)">
            <i class='iconfont icon-dashujukeshihuaico-'/>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title='拷贝'
               :visible.sync='copyVisible'
               width='600px'
               :before-close="() => closeFun('copyVisible', false)"
               append-to-body>
      <div class='copy-progress'>
        <span>
          {{ this.copyTotal > 1000 ? '由于拷贝文件数量超限，可能会受到OSS服务器的并发限制，正在粘贴' : '正在粘贴' }}
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
    mkdirFileClick() {
      this.mkdirName = ''
      this.mkdirVisible = true
    },
    closeFun(name, data) {
      this.$store.commit('stateUpdate', {name, data})
    },
    async downloadAddressClick() {
      if (this.selections.length < 1) {
        return
      }
      let list = await this.$store.dispatch('getfiles', this.selections)
      let filteredList = list.filter(item => !item.name.endsWith('/'))
      const textToSave = filteredList.map(item => item.url).join('\n')
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
    operationClick(type) {
      if (this.selections.length < 1) {
        this.$message.error('错误，勾选数据为空')
        return
      }
      if (type === 'delete') {
        this.$store.commit('stateUpdate', {
          name: 'deleteVisible',
          data: true
        })
      }
    },
    async pasteClick() {
      await this.$store.dispatch('pasteClick', {emptys: this.copys})
    },
    cancelPasteClick() {
      this.$store.commit('stateUpdate', {name: 'copys', data: []})
    },
    async copyClick(type) {
      this.$store.commit('stateUpdate', {name: 'shear', data: type})
      this.$store.commit('stateUpdate', {name: 'copys', data: this.selections})
      this.$store.commit('stateUpdate', {name: 'copyPath', data: this.path})
    },
    async deleteFile() {
      await this.$store.dispatch('deleteFile', this.selections)
    },
    async mkdirClick() {
      const validNamePattern = /^[a-z0-9]+$/
      if (!this.mkdirName || !validNamePattern.test(this.mkdirName)) {
        this.$message.warning('目录名称非法，请输入小写字母或数字')
        return
      }
      this.mkdirVisible = false
      await simplePut(`${this.path}${this.mkdirName}/`, new Blob(['']))
      await this.$store.dispatch('fileUpdate')
    },
    handleClose(none) {
      none()
    },
    dirUpload(e) {
      let files = Array.from(e.target.files)
      e.target.value = ''
      files.map((file) => {
        this.$store.dispatch('sliceUpload', {file})
      })
    },
    async refresh() {
      await this.$store.dispatch('fileUpdate')
    },
    pathBack() {
      let path = this.path
      let paths = path.split('/')
      paths.splice(paths.length - 2, 1)
      this.$store.commit('stateUpdate', {
        name: 'path',
        data: paths.join('/')
      })
      this.refresh()
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
.ace-btns {
  height: 30px;
  display: flex;
  align-items: center;
  margin-right: 0;
  user-select: none;

  .btn-child {
    height: 30px;
    min-width: 40px;
    padding: 0 8px;
    background-color: white;
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

    > .icon-jia {
      color: #3C763D;
      font-weight: 700;
    }

    > .icon-shangchuan {
      color: #31708F;
    }

    &:hover {
      background-color: #E6E6E6;
    }

    &:active {
      background-color: #F5F5F5;
    }
  }
}

.paste {
  height: 30px;
  border: 1px solid rgba(136, 136, 136, 0.3);
  border-left: 0;
  display: flex;
  align-items: center;
  padding-right: 16px;
  position: relative;
  cursor: pointer;

  > .paste-child {
    width: 100%;
    height: 100%;
    padding-right: 4px;
    display: flex;
    align-items: center;

    &:hover {
      background-color: #F5F5F5;
    }

    > i {
      color: #409EFF;
    }

    > span {
      height: 100%;
      display: flex;
      align-items: center;
      margin-left: 2px;
    }
  }

  > span {
    width: 16px;
    height: 100%;
    display: flex;
    align-items: center;
    border-left: 1px solid rgba(136, 136, 136, 0.3);
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;

    &:hover {
      background-color: #F5F5F5;
    }
  }
}

.copy-progress,
.delete-progress {
  width: 100%;
  height: 100px;
  padding: 0 8px;

  > span:nth-child(1) {
    display: block;
    margin-top: 14px;
    font-size: 16px;
    color: #888888;
  }

  > span:nth-child(3) {
    font-size: 13px;
    color: black;
    font-weight: 700;
    margin-top: 6px;
  }

  > span {
    display: block;
    margin-top: 14px;
    font-size: 16px;
    color: #888888;
  }

  .copy-child,
  .delete-child {
    width: 100%;
    height: 22px;
    background-color: #F5F5F5;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;

    > span:nth-child(1) {
      height: 100%;
      display: block;
      background-color: #5CB85C;
    }
  }
}

.mkdir {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-top: 1px solid rgba(136, 136, 136, 0.3);

  > span {
    width: 120px;
    font-size: 18px;
    font-weight: 700;
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

  .ace-btns {
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

.delete-list {
  width: 100%;
  padding: 4px 10px;

  margin-top: 0;
  height: 400px;
  overflow: auto;

  .delete-child {
    width: 100%;
    font-size: 15px;
    display: flex;
    align-items: center;

    > span {
      margin-left: 5px;
      color: #333333;
      font-size: 14px;
    }
  }
}

.file-header {
  > .top {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 10px;

    .ace-path {
      width: 100%;
      height: 30px;
      border: 1px solid rgba(136, 136, 136, 0.3);
      display: flex;
      align-items: center;
      padding-left: 10px;

      > span {
        color: #2F3235;
        font-weight: bold;
        font-size: 13px;
      }
    }
  }

  > .bottom {
    height: 35px;
    padding: 0 10px;
    border-bottom: 1px solid rgba(136, 136, 136, 0.3);
  }
}
</style>
