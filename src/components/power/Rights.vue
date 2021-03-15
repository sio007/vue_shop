<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 表格区域 -->
      <el-table :data="rightsList" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <!-- 权限等级列 -->
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level == '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 权限列表数据
      rightsList: []
    }
  },
  // created是生命周期函数，属于在模板渲染成html前阶段
  created: function () {
    // 调用获取权限列表函数
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    getRightsList: async function () {
      // this.$http.get发送请求，rights请求地址，获取权限列表数据
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('rights/list')
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将rights接口返回的数据赋值到 保存权限列表数据变量
      this.rightsList = res.data
    }
  }
}
</script>

<style>
</style>
