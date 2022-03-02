<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加按钮 -->
          <el-button type="primary" @click="addDialogVisible =true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表（表格）区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column label="姓名" prop="username">
        </el-table-column>
        <el-table-column label="邮箱" prop="email">
        </el-table-column>
        <el-table-column label="电话" prop="mobile">
        </el-table-column>
        <el-table-column label="角色" prop="role_name">
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页导航区域 -->
      <!-- @size-change(每页的数据条数page-size改变时触发)
          @current-change(页码current-page发生改变时触发)
          :current-page(设置当前页码)
          :page-sizes(会将选中的值给:page-size)
          :page-size(设置每页的数据条数)
          :total(设置总页数) -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <!-- :visible.sync(设置是否显示对话框) width(设置对话框的度)
         :before-close(在对话框关闭前触发的事件) -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @closed="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="EditDialogVisible" width="50%" @closed="editDialogClosed">
      <!-- 修改用户表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="提示" :visible.sync="setRoleDialogVisible" width="50%" @closed="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
      </div>
      <!-- 下拉选项 -->
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    // 自定义添加表单的 email的验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的邮箱'))
    }
    // 自定义添加表单的 mobile的验证规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }

    return {
      // 发送查询用户列表请求的参数
      queryInfo: {
        // 使用搜索功能时，携带的搜索字段
        query: '',
        // 查询的页码
        pagenum: 1,
        // 每一页的数据条数
        pagesize: 2
      },
      // 用于保存请求回来的用户列表数据
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      EditDialogVisible: false,
      // 控制分配对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 用于保存请求回来的修改用户的数据
      editForm: {},
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中角色的id值
      selectedRoleId: '',
      // 添加表单的数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改表单的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  // created是生命周期函数，属于在模板渲染成html前阶段
  created: function () {
    // 调用获取用户列表数据函数
    this.getUserList()
  },
  methods: {
    // 获取用户列表数据
    getUserList: async function () {
      // this.$http.get发送请求，users请求地址，获取用户列表数据
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      // 将users接口返回的数据赋值到userList、total变量
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 分页功能之改变每页数据条数
    handleSizeChange: function (newSize) {
      // pagesize每一页数据条数改变时触发，当pagesize发生改变的时候，我们应该 以最新的pagesize来请求数据并展示数据
      this.queryInfo.pagesize = newSize
      // 重新按照新的pagesize发送请求，请求最新的数据
      this.getUserList()
    },
    // 分页功能之改变页码数据
    handleCurrentChange: function (current) {
      // 页码发生改变时触发当current发生改变的时候，我们应该以最新的current页码来请求数据并展示数据
      this.queryInfo.pagenum = current
      // 重新按照新的pagenum发送请求，请求最新的数据
      this.getUserList()
    },
    // 监听switch开关状态的改变
    userStateChanged: async function (row) {
      // row是此时要更改状态的用户的信息
      // 此时传递过来的用户信息中的状态已经更改
      // 发送请求进行状态修改
      const { data: res } = await this.$http.put(
        `users/${row.id}/state/${row.mg_state}`
      )
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败
      if (res.meta.status !== 200) {
        // 将已经更改的状态返回原来的状态
        row.mg_state = !row.mg_state
        // 返回一个失败的提示窗
        return this.$message(res.meta.msg)
      }
      this.$message.success('更新用户状态成功！')
    },
    // 当添加用户对话框关闭时
    addDialogClosed: function () {
      // 将添加表单的内容进行清空重置
      // element表单中提供resetFields实例方法可以清空表单,使用方法:实例对象.resetFields()
      this.$refs.addFormRef.resetFields()
    },
    // 点击确认按钮，添加用户
    addUser: function () {
      // element中提供validate实例方法可以验证表单内容,使用方法:实例对象.validate()
      // 点击确认的时候先调用validate方法验证表单内容是否有误
      this.$refs.addFormRef.validate(async valid => {
        // 如果预验证失败返回一个错误提示窗
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 如果验证通过则发送请求完成添加用户的操作
        // this.$http.post发送请求，users请求地址，this.addForm请求携带的表单参数
        // 返回的信息中解构出 data，然后将data赋值到res变量中
        const { data: res } = await this.$http.post('users', this.addForm)
        // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败,返回一个失败的提示窗
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        // 如果状态码等于200 说明请求成功,调用一个成功的提示窗
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 重新渲染用户表格数据
        this.getUserList()
      })
    },
    // 点击修改按钮
    showEditDialog: async function (id) {
      // 展开编辑用户对话框
      this.EditDialogVisible = true
      // 将修改用户的id作为参数向后台接口发送请求查询该用户信息
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('users/' + id)
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败,返回一个失败的提示窗
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      // 如果请求成功将返回的用户信息保存在变量中
      this.editForm = res.data
    },
    // 当修改用户对话框关闭时
    editDialogClosed: function () {
      // 将修改表单的内容进行清空重置
      // element表单中提供resetFields实例方法可以清空表单,使用方法:实例对象.resetFields()
      this.$refs.editFormRef.resetFields()
    },
    // 当点击修改对话框中的确定按钮时，修改用户
    editUserInfo: function () {
      // element中提供validate实例方法可以验证表单内容,使用方法:实例对象.validate()
      // 点击确认的时候先调用validate方法验证表单内容是否有误
      this.$refs.editFormRef.validate(async valid => {
        // 如果预验证失败返回一个错误提示窗
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 如果验证通过则发送请求完成修改用户的操作
        // this.$http.put发送请求，users/:id请求地址，this.addForm请求携带的表单参数
        // 返回的信息中解构出 data，然后将data赋值到res变量中
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败,返回一个失败的提示窗
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 关闭修改对话框
        this.EditDialogVisible = false
        // 重新渲染用户表格数据
        this.getUserList()
      })
    },
    // 当点击删除按钮，删除用户
    removeUserById: async function (id) {
      // 弹出确定取消框，是否删除用户
      const confirmResult = await this.$confirm('请问是否要永久删除改用户', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult != 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.delete('users/' + id)
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败,返回一个失败的提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 删除成功返回一个成功的提示窗
      this.$message.success(res.meta.msg)
      // 重新渲染用户表格数据
      this.getUserList()
    },
    // 展示分配角色的对话框
    setRole: async function (userInfo) {
      // 保存要分配角色的用户信息
      this.userInfo = userInfo

      // 获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败,返回一个失败的提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      // 将所有角色的数据保存到变量中
      this.rolesList = res.data

      // 关闭分配角色的对话框
      this.setRoleDialogVisible = true
    },
    // 点击分配角色对话框中的确定按钮
    saveRoleInfo: async function () {
      // 如果selectedRoleId值为空代表用户没有选中角色
      if (!this.selectedRoleId) {
        // 返回一个错误的提示窗
        return this.$message.error('请选择要分配的角色!')
      }
      // 如果用户选中了角色，发送改变用户角色的请求
      // this.$http.put发送请求，users/:id/role请求地址，this.selectedRoleId选中角色的id 为请求携带的表单参数
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败,返回一个失败的提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 删除成功返回一个成功的提示窗
      this.$message.success(res.meta.msg)
      // 重新渲染用户列表
      this.getUserList()
      // 关闭分配角色的对话框
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed: function () {
      this.selectedRoleId = ''
    }
  }
}
</script>

<style>
</style>
