<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <!-- 分类表格
      :data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框)
      :expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头)
      border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮) -->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 自定义模板列的使用 -->
        <!-- 是否有效区域， 设置对应的模板列： slot="isok"(与columns中设置的template一致) -->
        <!-- 是否有效 自定义列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 自定义列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 自定义列 -->
        <template slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <!-- @size-change(每页的数据条数page-size改变时触发)
          @current-change(页码current-page发生改变时触发)
          :current-page(设置当前页码)
          :page-sizes(会将选中的值给:page-size)
          :page-size(设置每页的数据条数)
          :total(设置总页数) -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCatedialogVisible" width="50%" @closed="addCatedialogClosed">
      <!-- 添加分类的表单 -->
      <el-form ref="addCateFormRef" :model="addCateForm" label-width="100px" :rules="addCateFormRules">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- expandTrigger='hover'(鼠标悬停触发级联) v-model(设置级联菜单绑定数据) :options(指定级联菜单数据源)  :props(用来配置数据显示的规则)
          clearable(提供“X”号完成删除文本功能) change-on-select(是否可以选中任意一级的菜单) -->
          <el-cascader :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 查询商品分类接口的请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 存储商品分类的数据列表，默认为空
      cateList: [],
      // 存储商品分类的总条数
      total: 0,
      // tree-table组件中的属性绑定的列的定义
      columns: [
        // 分类名称列
        { label: '分类名称', prop: 'cat_name' },
        // 自定义列 ：type:'template'(将该列设置为模板列)，template:'isok'(设置该列模板的名称为isok)
        // 是否有效 自定义列
        { label: '是否有效', prop: '', type: 'template', template: 'isok' },
        // 排序 自定义列
        { label: '排序', prop: '', type: 'template', template: 'order' },
        // 操作 自定义列
        { label: '操作', prop: '', type: 'template', template: 'opt' }
      ],
      // 用来控制添加对话框的显示与隐藏
      addCatedialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 存储所有父级（一级、二级）分类的变量
      parentCateList: [],
      // 配置级联菜单中数据如何展示
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 绑定用户在级联菜单中选中的分类的值
      selectedKeys: []
    }
  },
  created: function () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    getCateList: async function () {
      // this.$http.get发送请求，categories请求地址，queryInfo是请求参数，获取商品分类数据的接口
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将返回的数据存储到变量中
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 当分页功能中每一页显示的条数发生改变
    handleSizeChange: function (newSize) {
      // 获取到最新每一页显示的条数的值，并赋值到请求所有分类中的请求参数中
      this.queryInfo.pagesize = newSize
      // 重新发送获取所有分类的请求
      this.getCateList()
    },
    // 当分页功能中页码发生改变
    handleCurrentChange: function (newSize) {
      // 获取到最新页码的值，并赋值到请求所有分类中的请求参数中
      this.queryInfo.pagenum = newSize
      // 重新发送获取所有分类的请求
      this.getCateList()
    },
    // 点击了添加分类的的对话框
    showAddCateDialog: function () {
      // 获取父级分类（一级、二级）的数据列表
      this.addCatedialogVisible = true
      // 隐藏添加分类的的对话框
      this.getParentCateList()
    },
    // 获取父级分类（一级、二级）的数据列表
    getParentCateList: async function () {
      // 发送请求获取父级分类（一级、二级）的数据列表
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 请求成功，将返回的数据存储到变量中
      this.parentCateList = res.data
    },
    // 当用户在添加表单中的级联选择器中选中节点发生改变时触发
    parentCateChanged: function () {
      // 如果保存 选择器变量 的值的长度大于0，说明有选中项
      if (this.selectedKeys.length > 0) {
        // 将选中项的值保存到 添加分类的表单数据对象变量addCateForm中
        // 将数组中最后一项id设置为父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 将数组的长度设置为level
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 如果没有选中项
        // 添加分类的表单数据对象变量addCateForm中的id值和level值重置
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 当关闭添加分类对话框时，重置添加分类表单
    addCatedialogClosed: function () {
      // 将整个添加表单重置
      this.$refs.addCateFormRef.resetFields()
      // 选中项变量的数组清空
      this.selectedKeys = []
      // 添加表单数据对象变量addCateForm中值重置
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 当点击了添加分类对话框中的确定按钮
    addCate: function () {
      // 对添加分类表单进行预验证处理
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // 预验证通过发送添加分类请求
        // this.$http.post发送请求，categories请求地址，addCateForm是请求参数，添加分类请求接口
        // 返回的信息中解构出 data，然后将data赋值到res变量中
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // res.meta.status是服务器端返回的状态码 如果不等于201，说明请求失败。返回一个错误提示窗
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // 请求成功返回一个成功的提示窗
        this.$message.success(res.meta.msg)
        // 重新刷新分类列表
        this.getCateList()
        // 将添加分类对话框隐藏
        this.addCatedialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
}

// .el-cascader {
//   width: 100%;
// }
.el-cascader-panel {
  height: 20px;
}
</style>
