import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodList from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
// to 将要访问的路径
// from 代表从哪个路径条状而来
// next 是一个函数，表示放行
// next() 放行  next('/login) 强制跳转
router.beforeEach((to, from, next) => {
  // 如果访问的路由地址是 login登录地址，直接放行
  if (to.path == '/login') {
    return next()
  }
  // 如果访问的不是 login登录地址，要获取 sessionStorage中token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果不存在token，说明没有登录过，强制跳转到 login登录地址
  if (!tokenStr) {
    return next('/login')
  }
  // 如果存在token，说明已经登录过了，直接放行
  next()
})

export default router
