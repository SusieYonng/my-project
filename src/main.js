import Vue from 'vue'
import App from './App.vue'
import router from './router' //添加部分

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
