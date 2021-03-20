<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索栏 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="95px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="125px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <!-- @size-change(每页的数据条数page-size改变时触发)
          @current-change(页码current-page发生改变时触发)
          :current-page(设置当前页码)
          :page-sizes(会将选中的值给:page-size)
          :page-size(设置每页的数据条数)
          :total(设置总页数) -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 查询商品列表接口的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 存储商品列表的数据对象，默认为空
      goodsList: [],
      // 存储商品列表的总条数
      total: 0
    }
  },
  created: function () {
    // 调用获取商品列表数据函数
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表数据
    getGoodsList: async function () {
      // this.$http.get发送请求，goods请求地址，queryInfo是请求参数，获取商品列表数据的接口
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 请求成功就将返回的数据进行存储
      // 为存储商品列表的变量赋值
      this.goodsList = res.data.goods
      // 为总条数数据赋值
      this.total = res.data.total
    },
    // 当分页功能中每一页显示的条数发生改变
    handleSizeChange: function (newSize) {
      // 获取到最新每一页显示的条数的值，并赋值到请求所有商品中的请求参数中
      this.queryInfo.pagesize = newSize
      // 重新发送获取所有商品的请求

      this.getGoodsList()
    },
    // 当分页功能中页码发生改变
    handleCurrentChange: function (newSize) {
      // 获取到最新页码的值，并赋值到请求所有商品中的请求参数中
      this.queryInfo.pagenum = newSize
      // 重新发送获取所有商品的请求
      this.getGoodsList()
    },
    // 点击商品表格中删除按钮时触发
    removeById: async function (id) {
      // 弹出确定取消框，是否删除商品
      const confirmResult = await this.$confirm('此操作将永久删除该项，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      // 用户点击取消,返回一个提示窗
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // 用户确认删除，将向删除商品的接口 发送请求
      const { data: res } = await this.$http.delete(`goods/${id}`)
      // 如果请求失败，返回错误信息提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 如果请求成功，返回成功信息提示窗
      this.$message.success(res.meta.msg)
      // 重新商品表格
      this.getGoodsList()
    },
    // 点击添加商品按钮时触发
    goAddpage: function () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
