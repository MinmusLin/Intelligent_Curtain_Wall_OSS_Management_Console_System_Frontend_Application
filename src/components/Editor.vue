<template>
  <div class='ace-mask'>
    <div class='ace-main'>
      <div class='ace-header'>
        <div class='ace-title'>
          <svg class='icon' aria-hidden='true'>
            <use xlink:href='#icon-tubiaozhizuomobanyihuifu-'/>
          </svg>
          <span>{{ displayAcePath }} ({{ aceSize }})</span>
          <div class='close' @click='closeClick'>
            <svg class='icon' aria-hidden='true'>
              <use xlink:href='#icon-dashujukeshihuaico-'/>
            </svg>
          </div>
        </div>
      </div>
      <div id='editor'/>
    </div>
  </div>
</template>

<script lang='js'>
import {editorInit} from '@/tool/ace'
import {mapState} from 'vuex'

export default {
  data() {
    return {
      editor: {},
      acePath: '',
      aceSize: '',
      codeType: ''
    }
  },
  computed: {
    ...mapState({
      path: (state) => state.path,
      CodeEditor: (state) => state.CodeEditor
    }),
    displayAcePath() {
      const parts = this.acePath.split('/')
      return parts.length > 1 ? parts.slice(1).join('/') : this.acePath
    }
  },
  mounted() {
    this.value = this.CodeEditor.code
    this.acePath = this.CodeEditor.path
    this.aceSize = this.CodeEditor.size
    let {editor, language} = editorInit(this.value, this.CodeEditor.suffix)
    this.editor = editor
    this.codeType = language.caption
  },
  methods: {
    closeClick() {
      this.$store.commit('stateUpdate', {name: 'editorShow', data: false})
    }
  }
}
</script>

<style lang='css'>
.icon {
  width: 1em;
  height: 1em;
  overflow: hidden;
}
</style>

<style scoped lang='css'>
.ace-mask {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;

  .ace-main {
    width: 1000px;
    border-radius: 8px;
    overflow: hidden;

    .ace-header {
      width: 100%;
      background-color: #F0F0F0;

      .ace-title {
        width: 100%;
        height: 40px;
        font-size: 20px;
        display: flex;
        align-items: center;
        padding-left: 10px;
        user-select: none;
        position: relative;

        .close {
          position: absolute;
          right: 10px;
          top: 7px;
          font-size: 24px;
          cursor: pointer;
        }

        > span {
          font-size: 16px;
          font-weight: 700;
          color: #2F3235;
          margin-left: 6px;
          white-space: nowrap;
        }
      }
    }

    #editor {
      width: 100%;
      height: 600px;
    }
  }
}
</style>
