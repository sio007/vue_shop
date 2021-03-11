<template>
  <div class="login_container">
    <!-- 登录盒子 -->
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
          <!-- 密码 -->
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="success" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 登录表单的数据对象绑定
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 3, max: 10, message: '登录名长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm: function () {
      console.log(this) // this=>当前login组件对象，其中的属性$refs包含了设置的登录表单LoginFormRefref实例对象
      // element中提供resetFields实例方法可以清空表单,使用方法:实例对象.resetFields()
      this.$refs.loginFormRef.resetFields()
    },
    login: function () {
      // element中提供validate实例方法可以验证表单内容,使用方法:实例对象.validate()
      // 点击登录的时候先调用validate方法验证表单内容是否有误
      this.$refs.loginFormRef.validate(async valid => {
        // 如果valid参数为true则验证通过,如果为false则退出函数
        if (!valid) {
          return
        }
        // 如果验证通过则发送请求进行登录操作
        // this.$http.post发送请求，login请求地址，this.loginForm请求携带的表单参数
        // 返回的信息中解构出 data，然后将data赋值到res变量中
        const { data: res } = await this.$http.post('login', this.loginForm)
        // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败
        if (res.meta.status !== 200) {
          // 返回一个失败的提示窗
          return this.$message.error('登录失败！' + res.meta.msg)
        }
        // 如果状态码等于200 说明请求成功
        // 调用一个成功的提示窗
        this.$message.success('登录成功')
        // 将登录成功之后返回的 token，保存到客户端的 sessionStorage 中
        // 项目中除了登录之外的其他路由，必须在登录之后才能访问
        // token 只能在当前网站打开期间生效，所以token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 通过编程式导航跳转到后台主页，路由地址为 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  // 将页面盒子撑满页面，并设置颜色
  height: 100%;
  background-color: #2b5b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  //  在页面中创建一个定位在中间的登录盒子
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    // 在登录盒子上方绘制一个头像
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  // 登录表单撑满盒子
  width: 100%;
  position: absolute;
  bottom: 0;
  // 设置内边距
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  // 将按钮定位在底部最尾处
  display: flex;
  justify-content: flex-end;
}
</style>
