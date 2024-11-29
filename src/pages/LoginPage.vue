<template>
  <div v-loading='loading' class='page-container'>
    <div class='login-container'>
      <el-select v-model='user' placeholder='请选择账号' style='width: 100%'>
        <el-option v-for='item in accounts' :key='item.name' :label='item.subsystem' :value='item.name'/>
      </el-select>
      <el-input v-model='password' type='password' placeholder='请输入密码' show-password style='width: 100%'/>
      <el-button type='primary' @click='login' style='width: 100%'>登录</el-button>
    </div>
  </div>
</template>

<script lang='js'>
import OSS from 'ali-oss'

export default {
  data() {
    return {
      client: {
        accessKeyId: '',
        accessKeySecret: '',
        region: '',
        bucket: ''
      },
      loading: false,
      user: '',
      password: '',
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
  methods: {
    showErrorNotification() {
      this.$notify({
        title: '登录失败',
        message: '请检查网络连接情况或确认账号和密码是否正确',
        type: 'error',
        position: 'top-left',
        duration: 3000
      })
    },
    async authenticate(userName, password) {
      try {
        const response = await this.$axios.post('authenticate', {
          userName: userName,
          password: password
        })
        if (response.data) {
          return {
            accessKeyId: response.data.accessKeyId,
            accessKeySecret: response.data.accessKeySecret
          }
        } else {
          return {
            accessKeyId: '',
            accessKeySecret: ''
          }
        }
      } catch (error) {
        return {
          accessKeyId: '',
          accessKeySecret: ''
        }
      }
    },
    async login() {
      if (!this.user && !this.password) {
        this.$message({
          message: '请选择账号并输入密码',
          type: 'warning',
          duration: 3000,
          showClose: true
        })
      } else if (!this.user && this.password) {
        this.$message({
          message: '请选择账号',
          type: 'warning',
          duration: 3000,
          showClose: true
        })
      } else if (this.user && !this.password) {
        this.$message({
          message: '请输入密码',
          type: 'warning',
          duration: 3000,
          showClose: true
        })
      } else {
        try {
          this.loading = true
          let {accessKeyId, accessKeySecret} = await this.authenticate(this.user, this.password)
          if (accessKeyId && accessKeySecret) {
            Object.assign(this.client, {
              accessKeyId: accessKeyId,
              accessKeySecret: accessKeySecret,
              bucket: 'tongji-icw',
              region: 'oss-cn-shanghai'
            })
            try {
              const client = new OSS(this.client)
              // noinspection JSUnresolvedReference
              let {res} = await client.list({
                prefix: '',
                delimiter: '/'
              })
              if (res.status === 200) {
                let ossInfo = {...this.client}
                ossInfo.overdueDate = Date.now() + 86400000
                this.$store.commit('stateUpdate', {
                  name: 'bucket',
                  data: ossInfo.bucket
                })
                this.$store.commit('stateUpdate', {
                  name: 'accessKeyId',
                  data: ossInfo.accessKeyId
                })
                const currentAccount = this.accounts.find(item => item.name === this.user)
                window.localStorage.setItem('ossUserName', currentAccount.name)
                window.localStorage.setItem('ossSubsystem', currentAccount.subsystem)
                window.localStorage.setItem('ossInfo', JSON.stringify(ossInfo))
                window.localStorage.setItem('client', JSON.stringify(this.client))
                await this.$router.push('home')
              } else {
                this.showErrorNotification()
              }
            } catch (error) {
              this.showErrorNotification()
            }
          } else {
            this.showErrorNotification()
          }
          this.loading = false
        } catch (error) {
          this.showErrorNotification()
        }
      }
    }
  }
}
</script>

<style scoped lang='css'>
.page-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .login-container {
    position: relative;
    top: 50px;
    left: 100px;
    height: 500px;
    width: 500px;
    border-radius: 20px;
    border: 2px #5182F8 solid;
    padding: 20px;
  }
}
</style>
