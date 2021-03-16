<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 :closable="false"(是否展示“X”号) show-icon(显示图标) -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- 级联选择器 -->
          <!-- expandTrigger='hover'(鼠标悬停触发级联) v-model(设置级联菜单绑定数据) :options(指定级联菜单数据源)  :props(用来配置数据显示的规则)
          clearable(提供“X”号完成删除文本功能) change-on-select(是否可以选中任意一级的菜单) -->
          <el-cascader expand-trigger="hover" v-model="selectCateKeys" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- Tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环生成的el-tag -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 生成添加可选项的输入框 -->
                <!-- v-if绑定的是控制输入框显示隐藏的变量 -->
                <!-- v-model绑定的是输入框的值 -->
                <!-- @keyup.enter.native是当文本框被回车时触发 -->
                <!-- @blur是文本框失去焦点 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 生成的用于添加的可选项的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环生成的el-tag -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 循环生成添加可选项的输入框 -->
                <!-- v-if绑定的是控制输入框显示隐藏的变量 -->
                <!-- v-model绑定的是输入框的值 -->
                <!-- @keyup.enter.native是当文本框被回车时触发 -->
                <!-- @blur是文本框失去焦点 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 循环生成的用于添加的可选项的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数和属性 对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数和属性 对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 修改表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 所有的分类列表
      cateList: [],
      // 用户在级联下拉菜单中选中的分类id
      selectCateKeys: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 被默认选中的页签
      activeName: 'many',
      // 动态参数的表格数据
      manyTableData: [],
      // 静态属性的表格数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加对话框中表单的数据对象
      addForm: {},
      // 添加对话框中表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改对话框中表单的数据对象
      editForm: {},
      // 修改对话框中表单的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created: function () {
    // 调用获取所有的商品分类列表函数
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类列表
    getCateList: async function () {
      // 向获取所有商品分类的接口发送请求
      const { data: res } = await this.$http.get('categories')
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将所有分类数据列表赋值给cateList
      this.cateList = res.data
    },
    // 当用户在级联菜单中选择内容改变时触发
    handleChange: function () {
      // 只允许选中三级分类时存储数据到选中项的变量中selectCateKeys，
      // 如果选中项不是三级分类则将selectCateKeys变量清空
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = []
        // 清空表格中数据
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 获取tab栏中对应的表格数据
      this.getParamsData()
    },
    // 当tab页签点击切换时触发
    handleTabClick: function () {
      this.getParamsData()
    },
    // 获取tab栏中对应的表格数据
    getParamsData: async function () {
      // 根据所选分类的id，和当前所处的面板，获取对应的表格参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        // sel为当前面板的name属性,它绑定在activeName变量中
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      // 将获取到的数据中的attr_vals字符串转换为数组（用于渲染表格中的展开列数据）
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加一个bool值控制文本框的显示或者隐藏
        item.inputVisible = false
        // 添加一个inputValue保存文本框值
        item.inputValue = ''
      })
      // 根据当前tab页签面板，判断返回的数据是对应哪一个tab页签的数据
      if (this.activeName == 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框中的关闭事件
    addDialogClosed: function () {
      // 将对话框中添加表单的内容重置
      this.$refs.addFormRef.resetFields()
    },
    // 添加对话框中确定按钮点击事件
    addParams: function () {
      // 对添加表单进行预验证处理
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 通过验证后向添加参数的接口发送请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          // 添加参数的名称
          attr_name: this.addForm.attr_name,
          // 添加参数的分类id
          attr_sel: this.activeName
        })
        // 如果请求失败，返回错误信息提示窗
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // 如果请求成功，返回成功信息提示窗
        this.$message.success(res.meta.msg)
        // 将添加对话框隐藏
        this.addDialogVisible = false
        // 重新渲染属性或参数表格
        this.getParamsData()
      })
    },
    // 当点击了表格中修改按钮时触发
    showEditDialog: async function (attrid) {
      // 将 该属性的id 和 该属性父级分类的id 做为参数,向查询参数接口发送请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, {
        params: { attr_sel: this.activeName }
      })

      // 如果请求失败，返回错误信息提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将接口返回的数据赋值到修改表单的数据对象变量中
      this.editForm = res.data
      // 将修改对话框显示
      this.editDialogVisible = true
    },
    // 监听修改对话框中的关闭事件
    editDialogClosed: function () {
      // 将对话框中修改表单的内容重置
      this.$refs.editFormRef.resetFields()
    },
    // 修改对话框中确定按钮点击事件
    editParams: function () {
      // 对修改表单进行预验证处理
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 通过验证后向修改参数的接口发送请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          // 参数的修改名称
          attr_name: this.editForm.attr_name,
          // 修改参数的分类id
          attr_sel: this.activeName
        })
        // 如果请求失败，返回错误信息提示窗
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 如果请求成功，返回成功信息提示窗
        this.$message.success(res.meta.msg)
        // 将添加对话框隐藏
        this.editDialogVisible = false
        // 重新渲染属性或参数表格
        this.getParamsData()
      })
    },
    // 当点击了表格中删除按钮时触发
    removeParams: async function (attrid) {
      // 弹出确定取消框，是否删除属性或参数
      const confirmResult = await this.$confirm('此操作将永久删除该项，是否继续', '提示',
        {
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
      // 用户确认删除，将向删除属性或参数的接口 发送请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
      // 如果请求失败，返回错误信息提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 如果请求成功，返回成功信息提示窗
      this.$message.success(res.meta.msg)

      // 重新渲染属性或参数表格
      this.handleChange()
    },
    // 当添加可选项的文本框被回车时触发
    handleInputConfirm: function (row) {
      // 当用户在文本框中按下enter键或者焦点离开时都会触发执行
      // 判断用户在文本框中输入的内容是否合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果用户输入了真实合法的数据，需要保存起来
      row.attr_vals.push(row.inputValue.trim())
      // 将添加文本框的清空
      row.inputValue = ''
      // 将添加文本框隐藏
      row.inputVisible = false
      // 调用函数，完成保存可选项的操作
      this.saveAttrVals(row)
    },
    // 当添加可选项的按钮被点击时触发
    showInput: function (row) {
      // 将添加可选项文本框显示
      row.inputVisible = true
      // $nextTick:在页面上元素被重新渲染之后，调用回调函数的代码
      this.$nextTick(_ => {
        // 让文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 封装一个可以保存可选项的操作的函数
    saveAttrVals: async function (row) {
      // 发起请求，更新当前的可选项数据 到 数据库中
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      // 如果请求失败，返回错误信息提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 如果请求成功，返回成功信息提示窗
      this.$message.success(res.meta.msg)
    },
    // 删除可选项的操作
    handleClose: function (index, row) {
      // 删除对应索引的参数可选项
      row.attr_vals.splice(index, 1)
      // 调用函数，完成保存可选项的操作
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 判断级联菜单中选中项是否为三级分类，用于是否禁用tab页签中的按钮
    isBtnDisabled: function () {
      if (this.selectCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取当前级联菜单中选中项的三级分类的父类id
    cateId: function () {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2]
      }
      return null
    },
    // 动态计算添加对话框中添加表单的标题文本
    titleText: function () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style>
.cat_opt {
  margin: 15px 0;
}
</style>
