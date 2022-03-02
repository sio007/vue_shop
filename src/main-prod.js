import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 导入公共样式
import './assets/css/global.css'
// 导入vue-table-with-tree-grid插件
import TreeTable from 'vue-table-with-tree-grid'

// 导入vue-quill-editor（富文本编辑器）
import VueQuillEditor from 'vue-quill-editor'
// 导入vue-quill-editor的样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

// 导入nprogress进度条插件
import NProgress from 'nprogress'
// 导入nprogress进度条样式
// import 'nprogress/nprogress.css'

// 导入axios
import axios from 'axios'
// 设置axios请求的基准地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 请求拦截器：请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use(config => {
// 当进入request拦截器，表示发送了请求，我们就开启进度条
  NProgress.start()
  // 为请求头对象，添加token验证的Authorization字段(用于请求接口时携带token)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 响应拦截器
axios.interceptors.response.use(config => {
  // 当进入response拦截器，表示请求已经结束，我们就结束进度条
  NProgress.done()
  return config
})

// 将axios请求方法存放到Vue实例对象中原型的$http中，可以方便调用axios请求，使用方法为 this.$http() this在通常在函数中指Vue实例对象
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 配置TreeTable插件
Vue.component('tree-table', TreeTable)

// 全局注册组件
Vue.component('tree-table', TreeTable)
// 全局注册富文本组件
Vue.use(VueQuillEditor)

// 定义一个全局的过滤器,用来处理时间格式
Vue.filter('dateFormat', function (originval) {
  const dt = new Date(originval)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
