<template>
  <div class='home-container'>
    <Operation/>
    <List/>
    <Editor v-if='editorShow'/>
    <Transmission v-show='transmissionShow'/>
    <div class='copyright'>
      <span>
        <span>版权所有 © 2024 同济大学 - 智慧幕墙数据集管理平台 (</span>
        <a href='https://github.com/MinmusLin/ICW_OssManagement_Frontend'
           target='_blank'
           style='color: #409EFF; text-decoration: none'>
          前端仓库
        </a>
        <a href='https://github.com/MinmusLin/ICW_OssManagement_Backend'
           target='_blank'
           style='color: #409EFF; text-decoration: none'>
          后端仓库
        </a>
        <span>)</span>
      </span>
    </div>
    <div class='transmission-control'
         v-show='!transmissionShow'
         @click="$store.commit('stateUpdate', { name: 'transmissionShow', data: true })">
      <span class='iconfont icon-shangchuan' style='margin-right: 6px'/>
      <span style='color: #2F3235; font-weight: 700'>
        {{ `${diskInfo().current} / ${diskInfo().all}` }}
      </span>
    </div>
  </div>
</template>

<script lang='js'>
import {mapState} from 'vuex'
import Editor from '@/components/Editor.vue'
import Operation from '@/components/Operation.vue'
import List from '@/components/List.vue'
import Transmission from '@/components/Transmission.vue'

export default {
  components: {
    Editor,
    Operation,
    List,
    Transmission
  },
  computed: mapState({
    editorShow: (state) => state.editorShow,
    transmissionShow: (state) => state.transmissionShow,
    uploadList: (state) => state.uploadList
  }),
  methods: {
    diskInfo() {
      let current = 0
      this.uploadList.map((item) => {
        if (item.status === '1') {
          current += 1
        }
      })
      return {current, all: this.uploadList.length}
    }
  }
}
</script>

<style scoped lang='css'>
.home-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.home-container .copyright {
  position: absolute;
  color: #5D6065;
  user-select: none;
  left: 8px;
  bottom: 4px;
}

.home-container .transmission-control {
  position: absolute;
  height: 24px;
  right: 0;
  bottom: 0;
  padding: 0 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
</style>
