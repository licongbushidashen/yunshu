
<template>
  <div class="permission-from-wrap">
    <a-form
      class="add-role"
      :autoFormCreate="(form) => { this.form = form }"
      layout="horizontal"
      labelAlign="left"
    >
      <a-form-item
        required
        fieldDecoratorId="name"
        :fieldDecoratorOptions="rules.name"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        label="权限组名称"
      >
        <a-input/>
      </a-form-item>

      <a-form-item
        required
        fieldDecoratorId="dataSource"
        :fieldDecoratorOptions="rules.dataSource"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        label="选择数据流"
      >
        <a-select
          mode="multiple"
          placeholder="请选择"
          @change="steamChange"
        >
          <a-select-option v-for="dataSteam in filterDataSteamList" :key="dataSteam.objectId">
            {{ dataSteam.displayName }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        required
        fieldDecoratorId="users"
        :fieldDecoratorOptions="rules.users"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        label="添加使用者"
      >
        <a-select
          mode="multiple"
          placeholder="请选择"
          @change="memberChange"
        >
          <a-select-option v-for="manager in subManagers" :key="manager.id">
            {{ manager.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>

    <div class="options">
      <a-button :style="{ marginRight: '8px' }" @click="cancel">
        取消
      </a-button>
      <a-button type="primary" @click="submit"> 确定 </a-button>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
// import reportApi from '@/apis/report/data-source-api';

interface ReportAddEditParams {
    // 权限组名称
    name: string
    // 数据流列表
    objectList: Array<string>
    // 子管理员列表
    userScope: Array<string>
    // 权限组id
    id?: string
}

@Component({
  name: "permission-form",
  components: {},
})
export default class PermissionForm extends Vue {

  form: any = {};
  
  rules: any = {};

  @Prop({default: []}) subManagers!: Array<any>;  // 子管理员列表

  @Prop() target!: any;   // 当前操作的行

  @Prop({default: []})
  dataSteamList!: any[]   // 从菜单栏获取的数据流

  @Watch('target', {
    immediate: true
  })
  targetChange(val: any) {
    if (!val) {
      this.form.resetFields();
      return
    }
    const { name, dataSource, users } = val
    console.log(val)
    this.form.setFieldsValue({
      name,
      dataSource,
      users
    })
  }

  formItemLayout: Object = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 19,
    },
  };

  // 数据流只选取叶子节点
  get filterDataSteamList() {
    return this.dataSteamList.filter((item: any) => !item.parentObjectId)
  }

  beforeMount() {
    this.setRules();
  }

  setRules() {
    this.rules = {
      name: {
        rules: [
          {
            required: true,
            message: "权限组名称不能为空",
          }
        ]
      },
      dataSource: {
        rules: [
          {
            required: true,
            message: "数据流不能为空",
          }
        ]
      },
      users: {
        rules: [
          {
            required: true,
            message: "使用者不能为空",
          }
        ]
      },      
    };
  }

  cancel() { 
    this.$emit('formViewChange', false)
  }

  submit() {
    this.form.validateFields((err, values) => {
      if (!err) {
        const { name, dataSource, users } = values
        const params: ReportAddEditParams = {
          name,
          objectList: dataSource.join(','),
          userScope: users.join(',')
        }
        const id = this.target ? this.target.id : ''
        console.log(params)
        // 编辑传入id
        if(id) {
          params.id = id
          this.editPermisson(params)
        } else {
          this.addPermisson(params)
        }
      }
    })
  }

  // 添加权限组
  async addPermisson(params: ReportAddEditParams) {
    // const res:any = await reportApi.addPermissonGroups(params)
    // if (res.errcode === 0) {
    //   this.$message.success('添加成功')
    //   this.$emit('formViewChange', false)
    // } else {
    //   this.$message.error('添加失败')
    // }
  }

  // 编辑权限组
  async editPermisson(params: ReportAddEditParams) {
    // const res:any = await reportApi.updatePermissonGroups(params)
    // if (res.errcode === 0) {
    //   this.$message.success('修改成功')
    //   this.$emit('formViewChange', false)
    // } else {
    //   this.$message.error('修改失败')
    // }
  }

  // 切换数据流
  steamChange() {

  }

  // 切换使用者
  memberChange() {
  }

  created() {
  }

  mounted() {
  }
}
</script>


<style lang="less" scoped>
.options {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: right;
  z-index: 1;

}
</style>

<style lang="less">
</style>
