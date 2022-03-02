<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods'}">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="修改商品信息" :closable="false" type="info" show-icon center>
      </el-alert>
      <!-- 步骤条区域 -->

      <!-- 实现 tab栏与步骤条的数据联络：
      <el-step>active属性绑定的属性值 要和 <el-tabs>v-model绑定的属性值相同，我们定义同一个变量 activeIndex 来赋值，而且<el-tabs-pane>的name属性绑定的属性 就是来控制 变量 activeIndex的值 -->

      <!-- active属性必须绑定数值，但是activeIndex属性为字符串，所以-0 -->
      <el-steps finish-status="success" :space="200" align-center :active="activeIndex - 0">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 侧向tab栏区域 -->
      <!-- tab栏 中的 表单定义规则:
          <el-form>标签需要包装在<el-tabs>外面，而<el-form-item>标签需要包装在<el-tab-pane>里面
       -->
      <el-form ref="editFormRef" :model="EditForm" label-width="100px" :rules="editFormRules">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="EditForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="EditForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="EditForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="EditForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <!-- 选择商品分类的级联选择框 -->
              <el-cascader expandTrigger='hover' v-model="EditForm.goods_cat" :options="cateList" :props="cateProps" disabled></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 循环渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 循环渲染可选项，数据以复选框的形式 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="val" v-for="(val,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- upload图片上传 -->
            <!--  action:指定图片上传api接口
                  on-preview ： 当点击图片时会触发该事件进行预览操作,处理图片预览
                  on-remove : 当用户点击图片右上角的X号时触发执行
                  on-success：当用户点击上传图片并成功上传时触发
                  list-type ：设置预览图片的方式
                  headers ：设置上传图片的请求头 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture" :headers="headerObj">
              <el-button size="small" type="primary" :headers="headerObj">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="EditForm.goods_introduce"></quill-editor>
            <!-- 编辑商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="edit">编辑商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash深拷贝插件
import _ from 'lodash'

export default {
  data: function () {
    return {
      // 用于保存url传递过来的要编辑商品的id
      goodsEditId: '',
      // 用于保存要编辑商品表单的数据
      EditForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属分类的数组
        goods_cat: [],
        // 上传图片在服务器的位置
        pics: [],
        // 富文本框的商品内容
        goods_introduce: ''
      },
      // 用来控制tab栏与步骤条同时联动的变量
      activeIndex: '0',
      // 用于保存所有商品分类的数据 的变量
      cateList: [],
      selectGood_cat: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        multiple: true
      },
      // 用于保存所有动态参数列表数据 的变量
      manyTableData: [],
      // 图片上传组件的请求接口地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 用于控制预览图片对话框的显示与隐藏
      previewVisible: false,
      // 用于存储预览图片的地址
      previewPath: '',
      // 编辑商品表单的验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      }
    }
  },
  created: function () {
    // 将url中传递过来的要编辑商品的id保存到变量中
    this.goodsEditId = this.$route.params.id
    // 调用获取编辑商品的原先数据的函数
    this.getGoodsInfo()
    // 调用获取所有商品分类的数据函数,用于编辑时可让用户选择
    this.getCateList()
  },
  methods: {
    // 获取编辑商品的原先数据
    getGoodsInfo: async function () {
      // 将编辑商品的id作为参数向后台接口发送请求查询该商品信息
      // 返回的信息中解构出 data，然后将data赋值到res变量中
      const { data: res } = await this.$http.get('goods/' + this.goodsEditId)
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败,返回一个失败的提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 如果请求成功将返回的角色信息保存在变量中
      this.EditForm = res.data
      // console.log(this.EditForm)
      // console.log(this.EditForm.goods_cat)
      this.selectGood_cat = this.EditForm.goods_cat.split(',')
      // console.log(this.selectGood_cat)
    },
    // 获取所有商品分类数据
    getCateList: async function () {
      // this.$http.get发送请求，categories请求地址，获取商品分类数据的接口
      const { data: res } = await this.$http.get('categories')
      // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 请求成功就将返回的数据进行存储
      // 为存储所有商品分类的变量赋值
      this.cateList = res.data
    },
    // 在tab栏中切换页签时触发
    beforeTabLeave: function () {
      // 如果离开的页签是基本信息(它的name:0)
      if (!this.EditForm.goods_name) {
        // 就返回一个错误提示窗，并且不让切换页签
        this.$message.error('请填写完全商品名称')
        return false
      }
    },
    // 当tab栏中的页签被点击时触发
    tabClicked: async function () {
      // 如果当前显示的页签为商品参数页签
      // 商品参数页签 name:1 而name属性值与activeIndex变量关联
      if (this.activeIndex == 1) {
        // 向获取动态参数的接口发送请求
        // this.$http.get发送请求，categories请求地址，cateId是三级分类的父类id，获取动态参数接口
        // 返回的信息中解构出 data，然后将data赋值到res变量中
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        // res.meta.status是服务器端返回的状态码 如果不等于200，说明请求失败。返回一个错误提示窗
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

        // 在保存数据前,要将数据中 attr_vals 可选项值从字符串转换为数组,便于后面循环渲染到页面中
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
        })
        // 请求成功就将返回的数据进行存储
        this.manyTableData = res.data
      }
    },
    // 当用户点击上传图片并成功上传时触发
    handleSuccess: function (response) {
      // response是图片上传成功后，图片在服务器端的信息数据
      // 将得到的信息数据 拼接得到一个图片地址信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 将图片地址信息对象，添加到 存储编辑表单的数据对象变量中
      this.EditForm.pics.push(picInfo)
    },
    // 当用户点击图片右上角的X号时触发执行
    handleRemove: function (file) {
      // file是图片上传成功后，图片在服务器端的信息数据
      // 获取要删除的图片的临时地址
      const filePath = file.response.data.tmp_path
      // 从编辑表单图片pics数组中，找到这个图片的索引值
      const i = this.EditForm.pics.findIndex(x => x.pic == filePath)
      // 调用数组的splice方法，将图片信息对象，从编辑表单图片pics数组中删除
      this.EditForm.pics.splice(i, 1)
    },
    // 当点击图片时会触发该事件进行预览操作,处理图片预览
    handlePreview: function (file) {
      // 将预览图片对话框显示
      this.previewVisible = true
      // 将图片在服务器端的地址赋值给img的src属性
      this.previewPath = file.response.data.url
    },
    // 当点击了编辑商品按钮时触发
    edit: function () {
      // 对编辑表单的进行预验证处理
      this.$refs.editFormRef.validate(async valid => {
        // 如果验证不通过，就返回一个错误的提示窗
        if (!valid) return this.$message.error('请填写必要的表单项!')
        // 如果验证通过要进行编辑商品操作
        const form = _.cloneDeep(this.EditForm)
        // 将goods_cat从数组转换为"1,2,3"字符串形式
        // form.goods_cat = form.goods_cat.join(',')
        // 处理attrs数组，数组中需要包含商品的动态参数和静态属性
        // 将manyTableData（动态参数）处理添加到attrs
        this.manyTableData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        // 发送请求完成商品的编辑,商品名称必须是唯一的
        // this.$http.put发送请求，goods请求地址，form是请求参数，编辑商品接口
        // 返回的信息中解构出 data，然后将data赋值到res变量中
        const { data: res } = await this.$http.put('goods/' + this.goodsEditId, form)
        // res.meta.status是服务器端返回的状态码 如果不等于201，说明请求失败。返回一个错误提示窗
        if (res.meta.status !== 200) {
          return this.$message.error('编辑商品失败')
        }
        // 请求成功，就返回一个成功的提示窗
        this.$message.success('编辑商品成功')
        // 编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取当前级联菜单中选中项的三级分类的父类id
    cateId: function () {
      if (this.selectGood_cat.length === 3) {
        return this.selectGood_cat[2]
      }
      return null
    }

  }
}
</script>
<style>
</style>
