<template>
  <div class="modify-owner">
    <a-row class="modify-owner__item">
      <a-col :span = "layout.left" class="modify-owner__left">
        <span class="label-required">{{ i18nData.selectOwner}}</span>
      </a-col>
      <a-col :span = "layout.right" class="modify-owner__right">
        <staff-selector
          v-model="owner"
          :options="taffSelectorOpts"
          @change="onValueChange"
        >
        </staff-selector>
      </a-col>
    </a-row>

    <a-row class="modify-owner__item">
      <a-col :span = "layout.left" class="modify-owner__left">
        <span>{{ i18nData.ownerDepartment}}</span>
      </a-col>
      <a-col :span = "layout.right" class="modify-ownerr__right">
        <config-provider :locale="locale">
          <a-select
            v-model="departments"
            style="width:100%"
          >
            <a-select-option
              v-for="(opt,index) in departmentsList"
              :key="index"
              :value="opt.deptId"
              :title="opt.deptName"
            >
              {{ opt.deptName }}
            </a-select-option>
          </a-select>
        </config-provider>
      </a-col>
    </a-row>

    <a-row class="modify-owner__item">
      <a-col :span = "layout.left" class="modify-owner__left">
        <span >{{ i18nData.modifyExplain}}</span>
      </a-col>
      <a-col :span = "layout.right" class="modify-owner__right">
        <a-textarea
          placeholder="请输入"
          v-model="remark"
          :maxLength="1000"
        ></a-textarea>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import {
  Row,
  Col,
  Input,
  Select
} from '@h3/antd-vue';

import StaffSelector from "@cloudpivot/form/src/renderer/components/shared/staff-selector.vue";
import { ConfigProvider } from "@h3/antd-vue";
import { userApi } from "@cloudpivot/api";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

@Component({
  name: 'form-modify-owner',
  components: {
    ARow: Row,
    ACol: Col,
    ATextarea: Input.TextArea,
    ASelect: Select,
    ASelectOption: Select.Option,
    StaffSelector,
    ConfigProvider
  }
})
export default class FormModifyOwner extends Vue{

  @Prop()
  i18nData!: any

  @Prop() newLocale : any;

  owner: Array<any> = []; 

  departments: string = ''; 

  departmentsList: Array<any> = [];

  remark: string = '';

  layout: any = {
    left: 6,
    right: 18
  }

  taffSelectorOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title:'选择拥有者'
  }

  get locale() {
    switch (this.newLocale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }
  onValueChange(value : any[]){
    if(value.length > 0){
      this.getUserDepartments(value[0].id);
    }else{
      this.departmentsList = [];
      this.departments = '';
    }
  }

  async getUserDepartments(userId: string){
    const res: any = await userApi.getUserDepartments(userId);
    if(res && res.errcode === 0) {
      this.departmentsList = res.data;
      let resoure = res.data.find((d: any) => d.isMain);
      this.departments = resoure.deptId;
    }else{
      this.$message.error(res.errmsg);
    }
  }
}
</script>

<style lang="less" scoped>
.modify-owner{
  &__item+&__item{
    margin-top: 20px;
    .modify-owner__left {
      height: 32px;
      line-height: 32px;
    }
    .modify-owner__right {
      & textarea.ant-input{
        min-height: 120px;
      }
    }
  }
}
.label-required:after {
  content: "*";
  display: block;
  font-size: 14px;
  position: absolute;
  left: 0;
  top: 3px;
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
  color: #f5222d;
  line-height: 19px;
}
</style>
