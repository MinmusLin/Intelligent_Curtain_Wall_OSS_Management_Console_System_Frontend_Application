<template>
  <div class='web-oss'>
    <div class='oss-main'>
      <Header/>
      <router-view/>
    </div>
  </div>
</template>

<script lang='js'>
import Header from '@/components/Header.vue'

export default {
  name: 'App',
  components: {
    Header
  },
  created() {
    this.resetPageFun()
  },
  mounted() {
    this.resetUserInfoFun()
  },
  methods: {
    resetPageFun(to) {
      let client = JSON.parse(window.localStorage.getItem('client'))
      if (to === '/login') {
        client && this.$router.push('/home')
        this.$store.commit('stateUpdate', {
          name: 'headerVisible',
          data: false
        })
      } else {
        !client && this.$router.push('/login')
        this.$store.commit('stateUpdate', {
          name: 'headerVisible',
          data: true
        })
        this.$store.commit('stateUpdate', {
          name: 'path',
          data: ''
        })
      }
    },
    resetUserInfoFun() {
      let {bucket, accessKeyId} = JSON.parse(window.localStorage.getItem('ossInfo')) || {}
      this.$store.commit('stateUpdate', {name: 'bucket', data: bucket})
      this.$store.commit('stateUpdate', {
        name: 'accessKeyId',
        data: accessKeyId
      })
    }
  },
  watch: {
    '$route.path': function (to) {
      this.resetPageFun(to)
      this.resetUserInfoFun()
    }
  }
}
</script>

<style lang='css'>
*, *::before, *::after {
  margin: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
}

body {
  font-size: 12px;
}

img {
  -webkit-user-drag: none;
}
</style>

<style scoped lang='css'>
@import '/css/icon.css';

.web-oss {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.oss-main {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  padding-top: 61px;
}
</style>
