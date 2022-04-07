<template>
  <a-modal
    v-model="visible"
    :title="$t('cloudpivot.list.pc.modifyOwner')"
    :maskClosable="false"
    :keyboard="false"
    :okText="$t('cloudpivot.list.pc.OK')"
    :cancelText="$t('cloudpivot.list.pc.Cancel')"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    @ok="ok"
    @cancel="close"
  > 
    <div class="modify-owner">
      <a-row class="modify-owner__item" v-if="num > 0">
        <a-col :span="24">
          <a-alert :message="$t('cloudpivot.list.pc.ownerTip',{num: num})" banner />
        </a-col>
      </a-row>
      <a-row class="modify-owner__item">
        <a-col :span = "layout.left" class="modify-owner__left">
          <span class="label-required">{{ $t('cloudpivot.list.pc.selectOwner') }}</span>
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
          <span>{{ $t('cloudpivot.list.pc.ownerDepartment') }}</span>
        </a-col>
        <a-col :span = "layout.right" class="modify-ownerr__right">
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
        </a-col>
      </a-row>

      <a-row class="modify-owner__item">
        <a-col :span = "layout.left" class="modify-owner__left">
          <span >{{ $t('cloudpivot.list.pc.modifyExplain') }}</span>
        </a-col>
        <a-col :span = "layout.right" class="modify-owner__right">
          <a-textarea
            :placeholder="$t('cloudpivot.list.pc.placeholder')"
            v-model="remark"
            maxLength="1000"
          ></a-textarea>
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import {
  Modal,
  Row,
  Col,
  Input,
  Select,
  Alert
} from '@h3/antd-vue';

import StaffSelector from "@cloudpivot/form/src/renderer/components/shared/staff-selector.vue";

import { userApi } from "@cloudpivot/api";

@Component({
  name: 'form-modify-owner-modal',
  components: {
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    Alert,
    ATextarea: Input.TextArea,
    ASelect: Select,
    ASelectOption: Select.Option,
    StaffSelector
  }
})
export default class FormModifyOwnerModal extends Vue {

  @Prop() checkeds!: Array<any>;

  @Prop() dataSource!: Array<any>;

  @Prop({ default: 20 }) pageSize!: number;

  @Prop({ default: 0 }) curPage!: number;

  @Prop() schemaCode!: string;

  @Prop() queryCode!: string;

  visible: boolean = false;

  modal: string = '';

  owner: Array<any> = []; 

  departments: string = ''; 

  departmentsList: Array<any> = [];

  remark: string = '';

  num: number = 0;

  confirmLoading: boolean = false;
  action: any = "";
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
    title: '选择拥有者'
  }

  init(num: number, action: any) {
    this.num = num;
    this.action = action;
    this.show();
  }
  show() {
    this.visible = true;
  }

  close() {
    this.confirmLoading = false;
    this.owner = [];
    this.departmentsList = [];
    this.departments = '';
    this.remark = '';
    this.visible = false;
  }

  ok() {
    if(this.owner.length === 0){
      this.$message.info(this.$t('cloudpivot.list.pc.pleaseSelectOwner') as string);
      return;
    }
    let objectIds: any = [];
    this.checkeds.forEach((c: boolean, index: number)=> {
      if (c) {
        objectIds.push(this.dataSource[index].id);
      }
    })
    let data = {
      mobile: false,
      isSheet: false,
      page: this.curPage - 1,
      size: this.pageSize,
      schemaCode: this.schemaCode,
      objectIds,
      ownerId: this.owner[0].id,
      ownerDeptId: this.departments,
      remark: this.remark,
      filters: [{
        propertyCode: "id",
        propertyType: 13,
        propertyValue: objectIds.join(";"),
        propertyValueName: ""
      }],
    }
    this.$emit('modifyOwnerClick',data, this.action);
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
      let resoure = res.data.find((d: any) => d.isMain)
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
