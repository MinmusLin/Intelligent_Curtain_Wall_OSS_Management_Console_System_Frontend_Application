<template>
  <div class='home-container'>
    <CloudDiskHeader/>
    <CloudDiskList/>
    <AceEditor v-if='editorShow'/>
    <CloudDiskDataPass v-show='transmissionShow'/>
    <div class='copyright'>
      <span>版权所有 © 2024 同济大学 - 智慧幕墙数据集管理平台</span>
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
import AceEditor from '@/components/AceEditor.vue'
import CloudDiskHeader from '@/components/CloudDiskHeader.vue'
import CloudDiskList from '@/components/CloudDiskList.vue'
import CloudDiskDataPass from '@/components/CloudDiskDataPass.vue'

export default {
  components: {
    AceEditor,
    CloudDiskHeader,
    CloudDiskList,
    CloudDiskDataPass
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

  .copyright {
    position: absolute;
    color: #5D6065;
    user-select: none;
    left: 8px;
    bottom: 4px;
  }

  .transmission-control {
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
}
</style>
