<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单数据表格 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditAddress"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox"></el-button>
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
    <!-- 修改地址的对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
      <!-- 修改地址表单 -->
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRules" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线组件 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.content}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 引入 存储地址地址的 citydata.js文件
import cityData from './citydata.js'

export default {
  data: function () {
    return {
      // 查询订单列表接口的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 存储订单列表的数据对象，默认为空
      orderList: [],
      // 存储订单列表的总条数
      total: 0,
      // 用于控制修改地址对话框的显示与隐藏
      addressVisible: false,
      // 将导入的订单地址数据保存起来
      cityData: cityData,
      // 存储修改地址表单的数据对象
      addressForm: {
        address1: [],
        address2: ''
      },
      // 定义修改地址表单的验证规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 用于控制物流进度对话框的显示与隐藏
      progressVisible: false,
      // 用于存储物流进度的数据对象变量
      progressInfo: []
    }
  },
  created: function () {
    // 调用获取订单列表数据函数
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    getOrderList: async function () {
      // this.$http.get发送请求，orders请求地址，queryInfo是请求参数，获取订单列表数据的接口
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 请求成功就将返回的数据进行存储
      // 为存储订单列表的变量赋值
      this.orderList = res.data.goods
      // 为总条数数据赋值
      this.total = res.data.total
      console.log(res.data)
    },
    // 当分页功能中页码发生改变
    handleCurrentChange: function (newSize) {
      // 获取到最新页码的值，并赋值到请求所有订单中的请求参数中
      this.queryInfo.pagenum = newSize
      // 重新发送获取订单列表的请求
      this.getOrderList()
    },
    // 当分页功能中每一页显示的条数发生改变
    handleSizeChange: function (newSize) {
      // 获取到最新每一页显示的条数的值，并赋值到请求所有订单中的请求参数中
      this.queryInfo.pagesize = newSize
      // 重新发送获取订单列表的请求
      this.getOrderList()
    },
    // 点击修改地址按钮时触发
    showEditAddress: function () {
      // 显示修改地址对话框
      this.addressVisible = true
    },
    // 监听修改对话框中的关闭事件
    addressDialogClosed: function () {
      // 将修改地址表单进行内容重置
      this.$refs.addressFormRef.resetFields()
    },
    // 点击物流进度按钮时触发
    showProgressBox: async function () {
      // 显示物流进度对话框
      this.progressVisible = true
      // this.$http.get发送请求，kuaidi请求地址，获取物流进度的数据
      // 由于后台接口只是一个测试接口，并不是一个完整的接口，所以只能调固定的测试接口
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      console.log(res.data)

      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 请求成功就将返回的数据进行存储
      this.progressInfo = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
