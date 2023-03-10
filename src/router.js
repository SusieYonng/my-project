import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter)


const homePage = () => import('./pages/Home/index.vue')
const routes = [
    { path: '/', component: homePage },
]

const router = new VueRouter({
    base: process.env.publicPath,
    mode: 'history',//可写可不写
    routes
})


export default router