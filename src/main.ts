// @ts-ignore
import App from './App.vue'
import {createApp} from 'vue'
import router from './utils/router'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router)
app.mount('#app')
