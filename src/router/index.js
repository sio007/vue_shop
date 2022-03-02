import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Login from '../components/Login.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Home from '../components/Home.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
// import Welcome from '../components/Welcome.vue'

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
// import Users from '../components/user/Users.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
// import Rights from '../components/power/Rights.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')
// import Roles from '../components/power/Roles.vue'

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
// import Cate from '../components/goods/Cate.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')
// import Params from '../components/goods/Params.vue'

const GoodList = () => import(/* webpackChunkName: "GoodList_Add" */ '../components/goods/List.vue')
// import GoodList from '../components/goods/List.vue'
const Add = () => import(/* webpackChunkName: "GoodList_Add" */ '../components/goods/Add.vue')
// import Add from '../components/goods/Add.vue'
const Edit = () => import(/* webpackChunkName: "GoodList_Add" */ '../components/goods/Edit.vue')
// import Add from '../components/goods/Edit.vue'

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
// import Order from '../components/order/Order.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')
// import Report from '../components/report/Report.vue'

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
      { path: '/goods/edit/:id', component: Edit },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
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
