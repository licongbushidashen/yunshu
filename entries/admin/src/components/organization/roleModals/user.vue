<template>
  <a-modal
    v-model="showModal"
    :title="modalTitle"
    :width="446"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="submit"
    @cancel="cancel"
    :closable="false"
    :maskClosable="false"
    :keyboard="false"
  >
    <template #footer>
      <a-button key="back" @click="cancel" :disabled="loading">{{$t('languages.Apps.Cancel')}}</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="submit">{{$t('languages.Apps.Ok')}}</a-button>
    </template>
    <a-form class="add-user" :autoFormCreate="(form) => { this.form = form }">
      <a-form-item
        required
        label="选择用户"
        fieldDecoratorId="user"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <staff-selector
          :options="userOpts"
          :disabled="userType === 1 || userType === 2"
          :onlyForm="onlyForm"
          @ok="setUserId"
        ></staff-selector>
      </a-form-item>

      <a-form-item
        label="角色管理范围"
        fieldDecoratorId="ouScope"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <staff-selector
          :options="ouScopeOpts"
          :params="{corpId: curUserId}"
        ></staff-selector>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { pattern, nameValidator } from '@/common/utils';
import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';

import OrgApi from '@/apis/organization';

@Component({
  name: "add-user",
  components: {
    StaffSelector
  }
})

export default class AddUser extends Vue {
  @Prop() value!: boolean;

  @Prop() userType!: number; // 0：新增，1：编辑

  @Prop() userData!: any;

  @Prop() roleData!: any;

  showModal: boolean = false;

  modalTitle: string = '新建用户';

  params: any = {
    user: [],
    ouScope: []
  };

  form: any = {};

  formItemLayout: any = {
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 18
    }
  };

  rules: any = {};
  onlyForm: boolean = false;

  userOpts: any = {
    selectOrg: true,
    selectUser: true,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true
  }

  ouScopeOpts = {
    selectOrg: true,
    selectUser: true,
    showModel: false,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true
  }

  curUserId:any = ''; // 根据选择用户选择获取对应组织

  loading:boolean = false;

  setUserId(data:any){
    if (data.length > 0) {
      const id = data[0].corpId;
      this.curUserId = id;

      this.form.setFieldsValue({
        ouScope: []
      });
    }
  }

  beforeMount() {
    this.setRules();
  }
  mounted() {
    // console.log('mounted', this)
  }
  setRules() {
    this.rules = {
      user: {
        rules: [{
            required: true,
            message: '用户不能为空'
          }]
      },
      // roleAuth:{
      //   rules: [{
      //     required: true,
      //     message: '角色范围不能为空'
      //   }]
      // }
    };
  }

  // 新建用户
  submit() {
    this.form.validateFields((err: any) => {
      if (!err) {
        const user = this.form.getFieldValue('user');
        if(!user || user && user.length <= 0){
          this.$message.error('请选择用户');
          return
        }
        const ouScopeData = this.form.getFieldValue('ouScope');
        const userIds = user ? user.map((u:any) => {
            return {
              id: u.id,
              unitType: u.unitType,
              name: u.name
            };
          }) :  [];
        const ouScope = ouScopeData ? ouScopeData.map((ou:any) => {
          return {
            unitType: ou.unitType,
            type: ou.type,
            id: ou.id,
          }
        }) : [];

        // userType ：1 表示单个更新，：2 表单批量更新
        if (this.userType === 1 || this.userType === 2) {
          
          // 更新用户管理范围
          const userData = Array.isArray(this.userData) && this.userData.length && this.userData[0]
          let params:any = {};

          if (this.userType === 1) {
            
            if (userData.unitType === 1) {
              params = {
                ouScopeList: ouScope,
                roleId: userData.roleId,
                deptId: userData.deptId,
                unitType: userData.unitType ? userData.unitType : 3,
              };
            } else {
              params = {
                ouScopeList: ouScope,
                roleId: userData.roleId,
                userId: userData.id,
                unitType: userData.unitType ? userData.unitType : 3,
              };
            }
          } else if (this.userType === 2) {

            const deptIdArr: any = [];
            const userIdArr: any = [];

            for (let item of user) {
              if (item.unitType === 1)  deptIdArr.push(item.id);
              if (item.unitType === 3)  userIdArr.push(item.id);
            }

            const roleId = Array.isArray(this.userData) && this.userData.length &&　this.userData[0] && this.userData[0].roleId;

            params = {
              ouScopeList: ouScope,
              roleId: roleId,
              userId: userIdArr.join(','),
              deptId: deptIdArr.join(','),
              unitType: 3,
            };

          }
          
          this.loading = true;
          OrgApi.updateUserOuscope(params).then((res: any) => {
            this.loading = false;
            if (res.errcode) {
              this.$message.error(res.errmsg as string);
              return;
            }
            this.$message.success(res.errmsg as string);
            this.$emit('reloadUser', 'save');
            this.cancel();
          }).catch(() =>{
            this.loading = false;
          });
        } else {
          // 新建用户
          const params = {
            roleId: this.roleData.id,
            userIds,
            ouScope
          };
          this.loading = true;
          OrgApi.addRoleUser(params).then((res) => {
            this.loading = false;
            if (res.errcode) {
              this.$message.error(res.errmsg as string);
              return;
            }
            this.$message.success(res.errmsg as string);
            this.$emit('reloadUser');
            this.cancel();
          }).catch(() =>{
            this.loading = false;
          });
        }
      }
    });
    
  }

  cancel() {
    this.form.resetFields();
    this.$emit('input', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
    if (!v) {
      return;
    }

    if (this.userType === 1) {
      this.modalTitle = '修改用户';
      let userData: any;

      this.onlyForm = false;

      if (Array.isArray(this.userData)) {
        userData = this.userData[0];
      }
      

      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          const userId = userData.unitType === 1 ? userData.deptId : userData.id;
          this.curUserId = userData.corpId || '';
          const params = {
            roleId: userData.roleId,
            userId,
            unitType: userData.unitType ? userData.unitType : 3,
          };
          // 获取当前用户的角色管理范围
          OrgApi.getUserOuscope(params).then((res: any) => {
            let ouScope = [];
            if (!res.errcode) {
              ouScope = res.data ? res.data : [];
            }
            this.form.setFieldsValue({
              user: [{ id: userId, name: userData.name, unitType: userData.unitType }],
              ouScope
            });
          });
        }
      });
    } else if (this.userType === 2) {
      this.modalTitle = '批量修改';

      let userData: any;
      // 已选中用户
      let selected: any;

      this.onlyForm = true;
    
      if (Array.isArray(this.userData)) {
        selected = this.userData.map(item => {
          const obj: any = {name: item.name, unitType: item.unitType};
          obj.id = item.unitType === 1 ? item.deptId : item.id;

          return obj
        });

        this.$nextTick(() => {
          if (this.form.setFieldsValue) {
            this.form.setFieldsValue({
              user: selected,
              ouScope: []
            });
          }
        })
      }

    } else {
      this.modalTitle = '新建用户';
      this.onlyForm = false;
      if (this.form.setFieldsValue) {
        this.form.setFieldsValue({
          user: [],
          ouScope: []
        });
      }
    }
  }

}
</script>

<style lang="less" scoped>
.add-user{
  /deep/.has-error{
    .h3-organization__label{
      border-color: #F4454E;
    }
  }
}
</style>
