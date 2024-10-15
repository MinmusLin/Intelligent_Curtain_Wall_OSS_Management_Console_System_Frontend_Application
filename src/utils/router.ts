import {createRouter, RouteRecordRaw, Router, createWebHistory} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    },
    {
        path: '/404',
        // @ts-ignore
        component: () => import('../pages/NotFoundPage.vue')
    }
]

const router: Router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
