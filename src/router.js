import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter)

const canvasBarrage = () => import('./pages/Barrage/index.vue')
const danmakuDemo = () => import('./pages/Danmaku/index.vue')

const routes = [
    { path: '/canvas-demo', component: canvasBarrage },
    { path: '/', component: danmakuDemo },
]

const router = new VueRouter({
    base: process.env.publicPath,
    mode: 'history',//可写可不写
    routes
})


export default router