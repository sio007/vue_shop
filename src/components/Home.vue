<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="iscollapse ? '64px' : '200px' ">
        <div class="toogle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409BFF" unique-opened :collapse="iscollapse" :collapse-transition="false" router :default-active='activePath'>
          <!-- 一级菜单模板区域 -->
          <!-- index属性是组件自带，主要是辨识打开时选项卡的唯一标识，所以我们可以绑定id，由于属性值必须为字符串所以最后加一个空字符串 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item-group>
              <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-location"></i>
                  <!-- 文本 -->
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体结构 -->
      <el-main>
        <!-- 子级路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data: function () {
    return {
      activePath: '',
      // 定义menuList变量用于接收menu接口返回的数据
      menuList: null,
      // 定于iconsObj对象用于渲染一级菜单中的图标
      // 每一个属性名是每一个选项的id，而属性值的icon的类名
      iconsObj: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      // 定义iscollapse变量是用于控制菜单的collapse属性
      iscollapse: false
    }
  },
  // created是生命周期函数，属于在模板渲染成html前阶段
  created: function () {
    // 调用获取菜单数据函数
    this.getMenuList()
    // 将sessionStorage中的当前浏览地址赋值给activePath
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出功能
    logout: function () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    // 获取菜单数据
    getMenuList: async function () {
      // this.$http.get发送请求，menus请求地址，获取菜单数据
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('menus')
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将menu接口返回的数据赋值到menuList变量
      this.menuList = res.data
      // console.log(res)
    },
    // 菜单折叠功能
    toggleCollapse: function () {
      this.iscollapse = !this.iscollapse
    },
    // 二级子菜单高亮功能
    saveNavState: function (path) {
      // 点击二级菜单的时候保存被点击的二级菜单信息到sessionStorage
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.toogle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  color: #fff;
}
</style>
