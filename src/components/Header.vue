<template>
  <div class='header' v-if='headerVisible'>
    <div class='title'>
      <span>智慧幕墙数据集管理平台</span>
    </div>
    <div class='operation'>
      <div class='operation-child'>
        <span class='iconfont icon-yonghu1'/>
        <span>{{ ossSubsystem }}</span>
      </div>
      <div class='operation-child' style='cursor: pointer' @click='exit'>
        <span class='iconfont icon-zhuxiao'/>
        <span>注销</span>
      </div>
    </div>
  </div>
</template>

<script lang='js'>
import {mapState} from 'vuex'

export default {
  computed: mapState({
    headerVisible: (state) => state.headerVisible
  }),
  data() {
    return {
      ossSubsystem: ''
    }
  },
  mounted() {
    this.ossSubsystem = window.localStorage.getItem('ossSubsystem') || ''
  },
  watch: {
    '$route': function () {
      this.ossSubsystem = window.localStorage.getItem('ossSubsystem') || ''
    }
  },
  methods: {
    /**
     * Handles the logout process by confirming with the user,
     * removing the client data from localStorage, and redirecting to the login page.
     * @returns {void}
     */
    exit() {
      this.$confirm('是否退出当前账号？', '注销', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.localStorage.removeItem('client')
        this.$router.push('/login')
      })
    }
  }
}
</script>

<style scoped lang='css'>
.header {
  width: 100%;
  height: 54px;
  background-color: #5182F8;
  padding: 0 24px;
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  color: white;
  user-select: none;
  white-space: nowrap;
}

.header .title {
  font-size: 18px;
  font-weight: bold;
}

.header .operation {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.header .operation .operation-child:nth-last-child(1) {
  margin-right: -8px;
}

.header .operation .operation-child {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.header .operation .operation-child > span:nth-child(1) {
  font-size: 15px;
}

.header .operation .operation-child > span:nth-child(2) {
  font-size: 15px;
  margin-left: 6px;
}
</style>
