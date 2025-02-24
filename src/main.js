import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import axios from 'axios'
import '@/element-ui'

axios.defaults.baseURL = 'http://110.42.214.164:9000/'
axios.defaults.headers.post['Content-Type'] = 'application/json'

Vue.prototype.$axios = axios
Vue.prototype.$baseURL = axios.defaults.baseURL

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
