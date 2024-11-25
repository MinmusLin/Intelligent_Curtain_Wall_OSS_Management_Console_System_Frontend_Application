import VueRouter from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: () => import('@/pages/LoginPage.vue')
    },
    {
        path: '/home',
        component: () => import('@/pages/HomePage.vue')
    },
    {
        path: '*',
        redirect: '/login'
    }
]

const router = new VueRouter({
    routes,
    mode: 'history',
})

export default router
