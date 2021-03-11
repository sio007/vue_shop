import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入公共样式
import './assets/css/global.css'
// 导入axios
import axios from 'axios'
// 设置axios请求的基准地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 将axios请求方法存放到Vue实例对象中原型的$http中，可以方便调用axios请求，使用方法为 this.$http() this在通常在函数中指Vue实例对象
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
