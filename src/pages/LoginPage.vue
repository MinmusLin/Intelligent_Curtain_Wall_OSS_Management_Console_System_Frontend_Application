<template>
  <div v-loading='loading' class='page-container' @keydown.enter='handleEnter'>
    <img src='/png/top-left.png' alt='top-left' class='top-left'/>
    <div class='login-container'>
      <img src='/png/tongji.png' alt='favicon' class='favicon'/>
      <h1>欢迎登录系统</h1>
      <h4>智慧幕墙数据集管理平台</h4>
      <div style='display: flex; flex-direction: column; justify-content: center; align-items: center'>
        <el-select v-model='user' placeholder='请选择账号' style='width: 380px'>
          <el-option v-for='item in accounts' :key='item.name' :label='item.subsystem' :value='item.name'/>
        </el-select>
        <el-input v-model='password'
                  type='password'
                  placeholder='请输入密码'
                  style='width: 380px; margin: 25px 0'
                  show-password/>
        <el-button type='primary' @click='login' style='width: 380px; margin: 10px 0'>登录</el-button>
      </div>
      <el-button type='text' class='guide'>平台使用指南</el-button>
    </div>
    <img src='/png/illustration.png' alt='illustration' class='illustration'/>
    <img src='/png/bottom-right.png' alt='bottom-right' class='bottom-right'/>
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
    handleEnter() {
      this.login()
    },
    async authenticate(userName, password) {
      try {
        const response = await this.$axios.post('authenticate/', {
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
  user-select: none;
}

.page-container .top-left {
  position: relative;
  top: 0;
  left: 0;
}

.page-container .login-container {
  position: absolute;
  top: 50%;
  left: 10%;
  height: 600px;
  width: 480px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(158, 195, 255, 0.51);
  padding: 20px;
  z-index: 2;
  background-color: white;
  transform: translateY(-50%);
}

.page-container .login-container .favicon {
  width: 100px;
  height: auto;
  position: relative;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.page-container .login-container h1 {
  margin-top: 40px;
  text-align: center;
  font-size: 36px;
  font-weight: 600;
  line-height: 48px;
  color: rgba(0, 0, 0, 1);
  vertical-align: top;
}

.page-container .login-container h4 {
  margin-top: 20px;
  margin-bottom: 30px;
  font-size: 16px;
  font-weight: 400;
  line-height: 26px;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
  vertical-align: top;
}

.page-container .login-container .guide {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: #409eff;
}

.page-container .illustration {
  position: absolute;
  top: 25%;
  right: 10%;
  width: 800px;
  height: auto;
  z-index: 1;
}

.page-container .bottom-right {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
