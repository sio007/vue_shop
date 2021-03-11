import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 将提示窗组件存放到Vue实例对象中原型的$message中，可以方便调用提示窗
Vue.prototype.$message = Message
