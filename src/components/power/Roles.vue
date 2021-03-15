<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表表格区域 -->
      <el-table :data="rolesList" border style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 通过 for 循环嵌套 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 再通过 for 循环 嵌套渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
      <!-- 树形控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 用于存放特定角色的所有三级权限id
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  // created是生命周期函数，属于在模板渲染成html前阶段
  created: function () {
    // 调用获取角色列表函数
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    getRolesList: async function () {
      // this.$http.get发送请求，roles请求地址，获取角色列表数据
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('roles')
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将roles接口返回的数据赋值到 保存角色列表数据变量
      this.rolesList = res.data
    },
    // 根据id删除权限功能
    removeRightById: async function (role, rightId) {
      // 弹窗提示用户是否删除
      const confirmResult = await this.$confirm('请问是否要删除该权限', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult != 'confirm') {
        return this.$message.info('已经取消删除')
      }

      // 用户点击了确定表示真的要删除发送删除权限请求
      // this.$http.get发送请求，menus请求地址，根据id删除权限
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 当发送delete请求之后，返回的数据就是最新的角色权限信息
      // 将最新的角色权限信息res.data 更新到 这个角色的权限中role.children
      role.children = res.data
    },
    // 分配权限按钮功能
    showSetRightDialog: async function (role) {
      this.roleId = role.id
      // this.$http.get发送请求，rights请求地址，tree是返回的信息的类型，获取所有权限数据
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('rights/tree')
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 将获取所有权限的数据保存到变量中
      this.rightslist = res.data

      // 可以特定角色下所有的三级权限id
      this.getLeafKeys(role, this.defKeys)

      // 将分配权限对话框显示
      this.setRightDialogVisible = true
    },
    // 可以获取特定角色下所有的三级权限id的函数
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKey数组中
    getLeafKeys: function (node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClose: function () {
      // 将默认勾选节点的变量清空
      this.defKeys = []
    },
    // 点击分配对话框中的确认按钮
    allotRights: async function () {
      // getCheckedKeys、getHalfCheckedNodes是树形控件的实例方法，可以将已选中的节点的id变为数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')

      // this.$http.post发送请求，roles请求地址，修改角色权限的接口
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      // 请求成功返回一个成功的提示窗
      this.$message.success(res.meta.msg)
      // 重新加载角色列表数据
      this.getRolesList()
      // 关闭分配角色对话框
      this.setRightDialogVisible = false
    }
  }

}
</script>

<style>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
