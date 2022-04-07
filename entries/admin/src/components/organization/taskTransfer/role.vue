<template>
  <div class="apps-data" :style="heightStyle">
    <div>
      <div class="row-title">
        <span>1</span>
        交接人
      </div>
      <div class="search-head">
        <div class="row">
          <div>
            <label>
              <span class="red">*</span>
              <span class="title right">{{ $t('languages.TaskTransfer.Delegatee') }}</span>
            </label>
            <staff-selector
              :options="taffSelectorOpts"
              v-model="targetUser"
              @change="addTargetUser"
              class="user org-user"
              :params="handleParams"
            ></staff-selector>
          </div>
          <!-- <div class="transfer-org">
            <label>
              <span class="red">*</span>
              <span class="title right">{{ $t('languages.TaskTransfer.DelegateeOrg') }}</span>
            </label>
            <a-select show-search placeholder="请选择" v-model="transferDept" class="input-select">
              <a-select-option
                v-for="(select,index) in departmentList"
                :key="index"
                :value="select.deptId"
              >{{ select.deptName }}</a-select-option>
            </a-select>
          </div> -->
        </div>
      </div>
      <div class="row-title is-last">
        <span>2</span>
        角色范围
      </div>
      

      <div class="table-wrapper">
        <role-scope-item :syncUserFlag = "true" v-model="adminManagerFlag" v-if="roleData.adminManagerFlag" :data="roleData" title="管理员"></role-scope-item>
        <template v-if="roleData.syncUserFlag === false">
          <p class="tips" style="margin-left: 42px; margin-top: 24px;margin-bottom: 16px;">
          <span class="icon aufontAll h-icon-all-Components_Warning"></span>
          请前往第三方组织源交接角色数据
        </p>
        </template>

        <role-scope-item :syncUserFlag = "roleData.syncUserFlag"  v-model="deptManagerFlag" v-if="roleData.deptManagerFlag" :data="roleData.deptList" title="部门主管"></role-scope-item>
        <role-scope-item :syncUserFlag = "roleData.syncUserFlag" v-model="userRoleFlag" v-if="roleData.userRoleFlag" :data="roleData.userRoleItemList" title="角色"></role-scope-item>
      </div>
    </div>
    <div class="sub-btn">
      <div>
        <template >
          <a-button
            class="btn"
            type="primary"
            :ghost="true"
            @click="toHandover('checked')"
            :disabled="targetUser.length === 0 || (!adminManagerFlag && !deptManagerFlag && !userRoleFlag)"
          >交接已选角色</a-button>
        </template>
        <template >
          <a-button
            class="btn"
            type="primary"
            :ghost="true"
            @click="toHandover('all')"
            :disabled="targetUser.length === 0"
          >交接全部角色</a-button>
        </template>
      </div>
    </div>

    <a-modal
      :title="modalTitle"
      width="480px"
      :visible="visible"
      @cancel="visible = false"
      @ok="handleOk"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      :maskClosable="false"
      :keyboard="false"
    >
      <p class="tips"><span class="icon aufontAll h-icon-all-Components_Warning"></span>交接任务后不能撤回，请谨慎操作</p>
      <div class="handover-opinions">
        <label>交接意见</label>
        <a-textarea
          v-model="handoverOpinions"
          placeholder="请输入"
          :auto-size="{ minRows: 4, maxRows: 4 }"
          :maxLength="200"
        />
      </div>
    </a-modal>

    <PageLoading
      v-model="isLoading"
      shadeColor="#FFF"
      text="工作正在交接中，请稍后…"
      :shadeOpacity="0.8"
      :shadeGlobal="true"
    ></PageLoading>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch, Emit
} from 'vue-property-decorator';
import {
  State, Action, Mutation, namespace
} from 'vuex-class';
import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import bizModelsSelector from '@/components/global/biz-models-selector/index.vue';
import PageLoading from '@/components/shared/loading/page-loading/page-loading.vue';


import OrgApi from '@/apis/organization';
import * as OrganizationApi from '@/apis/organization';
import common from "@cloudpivot/common/pc";

import { locale } from 'moment';

const TaskTransferModule = namespace('Organization/taskTransfer');

import roleScopeItem from './role-scope-item.vue'
@Component({
  name: 'Role',
  components: {
    StaffSelector,
    bizModelsSelector,
    PageLoading,
    RoleSelect: common.components.RoleSelect,
    roleScopeItem
  }
})
export default class Role extends Vue {
  @Prop() userid!: string;
  @Prop() deptIds?: string;
  @Prop() corpid?: string

  adminManagerFlag:boolean = false;
  deptManagerFlag:boolean = false;
  userRoleFlag:boolean = false;

  visible:boolean = false;
  modalTitle:string = '交接全部角色'
  isLoading:boolean = false

  @Watch('corpid', {immediate: true})
  onDeptIdsChange(val){
    this.handleParams = {
      corpid: val
    }
  }

  handleParams:any = {}

  reset(){
    this.adminManagerFlag = false;
    this.deptManagerFlag = false;
    this.userRoleFlag = false;
    this.handoverOpinions = ''
  }

  toHandover(type){
    if(!(this.targetUser && this.targetUser[0])){
      this.$message.error('接收人不能为空！')
      return
    }
    if(type === 'all'){
      // 移交全部
      this.modalTitle = '交接全部角色'
    }else{
      // 移交选中
      this.modalTitle = '交接已选角色'
    }

    this.visible = true
  }
  handleOk(){

    let params = {
      sourceUserId: this.userid,
      // @ts-ignore
      targetUserId: this.targetUser[0].id ,

      adminManagerFlag: false,
      deptManagerFlag: false,
      userRoleFlag: false,
      deptIdList: [],
      comment: this.handoverOpinions,
      userRoleItemList:[
        {	
          roleId: '',
          list: []
        }
      ]
    }
    if(this.modalTitle === '交接全部角色'){
      params.adminManagerFlag = true;
      params.deptManagerFlag = true;
      params.userRoleFlag = true;
      params.deptIdList = this.roleData.deptList && this.roleData.deptList.map(el => el.id);
      params.userRoleItemList = this.roleData.userRoleItemList && this.roleData.userRoleItemList.map(el => {
        return {
          roleId: el.roleId,
          list: el.list || []
        }
      })

      if(!this.roleData.syncUserFlag){
        delete params.userRoleFlag
        delete params.deptIdList
        params.deptManagerFlag = false;
        params.userRoleFlag = false;
      }

    }else{
      params.adminManagerFlag = this.adminManagerFlag;
      params.deptManagerFlag = this.deptManagerFlag;
      params.userRoleFlag = this.userRoleFlag;

      params.deptIdList = this.roleData.deptList && this.roleData.deptList.filter(el => el.checked).map(el => el.id);
      params.userRoleItemList = this.roleData.userRoleItemList && this.roleData.userRoleItemList.filter(el => el.checked || el.indeterminate).map(el => {
        return {
          roleId: el.roleId,
          roleName: el.roleName,
          list: el.list.filter(el => el.checked) || []
        }
      })
    }
    this.transferRole(params)
  }
  transferRole(params){
    this.isLoading = true
    OrganizationApi.transferRole(params).then((res:any) => {
      this.isLoading = false
      if(res.errcode === 0){
        this.$message.success(res.errmsg as string)
        this.reset()
        this.queryUserMaintainRole()
        this.visible = false
      }else{
        this.$message.error(res.errmsg as string)
      }
    })
  }


  handoverRole:any[] = []; // 交接角色
  transferDept: string = ''; // 交接部门
  targetUser = []; // 交接人
  handoverOpinions: string = ''; // 交接意见
  departmentList:any[] = [];
  selectRole(value: any[]) {
    if (!value || !value.length) {
      this.handoverRole = [];
      return;
    }
    this.handoverRole = value
  }
  codeProp: string = "code";
  keepRolesList: any = [{code: "SYS_2000000"}, {code: "SYS_1000000"}];
  taffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true,

  }
  addTargetUser(user: any, filterType?: string) {
    return
    if (Array.isArray(user) && user.length) {
      this.getDepartmentList(user[0].id, 'admin');
    } else {
      this.departmentList = [];
      this.transferDept = '';
    }
  }

  heightStyle:any = {}
  mounted(){
    if(document.querySelector('.ant-tabs.ant-tabs-top.ant-tabs-line')){
      this.heightStyle = {
        // @ts-ignore
        height: document.querySelector('body').offsetHeight - 155 + 'px'
      }
    }

  }

  created(){
    this.queryUserMaintainRole()
  }


  roleData:any = {}
  queryUserMaintainRole(){
    OrganizationApi.queryUserMaintainRole({
      userId: this.userid
    }).then((res:any) => {
      if(res.errcode === 0){
        console.log('res==>',res)
        this.roleData = res.data
      }
    })
  }

  /*
  * 获取当前用户的所属部门列表
  */
  getDepartmentList(userid: any, filterType?: string) {
    const params = {
      id: userid,
      filterType: 'admin'
    };
    OrganizationApi.getDepartmentList(params).then((res: any) => {
      if (res.errcode === 0 && Array.isArray(res.data)) {
        this.departmentList = res.data;
        if (this.departmentList.length) {
          this.transferDept = this.departmentList[0].deptId;
        }
      }
    });
  }
}
</script>
<style lang="less" scoped>
.tips{
  height: 40px;
  line-height: 38px;
  background: #FFFBE6;
  border-radius: 4px;
  border: 1px solid #FFE58F;
  padding: 0 16px;
  color: rgba(0, 0, 0, 0.65);
  span{
    margin-right: 10px;
    color: #FAAD14;
  }
}

.apps-data {
  overflow-y: auto;
  padding-bottom: 75px;
  .row {
    padding: 0 0 20px 0;
    position: relative;
    display: flex;
    white-space: nowrap;
    &>div {
      line-height: 30px;
      width: 366px;
      &:first-child{
        margin-right: 20px;
      }
      display: flex;
      input {
        border-radius: 4px;
        padding: 5px 12px;
        width: 245px;
      }
      .user {
        width: 314px;
        vertical-align: middle;
        &::before{
          content: "";    // 解决未知样式污染
        }
      }
      .org-user {
        font-size: 0;
      }
      span.title {
        // margin-right: 22px;
        display: inline-block;
        width: 86px;
      }
      span.ant-input-affix-wrapper {
        width: auto;
      }
      .red {
        color: #f00;
        margin-right: 0px;
        position: absolute;
        top: 2px;
        left: -7px;
      }
      .btn {
        vertical-align: top;
        padding: 0 12px;
        text-align: center;
        span {
          margin: 0 0 0 4px;
        }
      }
    }
    .transfer-org {
      // float: left !important;
      position: relative;
      .input-select {
        width: 314px;
      }
      .red {
        color: #f00;
        margin-right: 0px;
        position: absolute;
        top: 2px;
        left: -7px;
      }
    }
    .biz-models {
      width: 314px;
      vertical-align: middle;
    }
  }
  
  .selected-count {
    padding: 6px 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  /deep/.ant-btn-background-ghost.ant-btn-primary[disabled] {
    background: #f5f5f5 !important;
  }
  /deep/.ant-table-placeholder {
    color: rgba(0, 0, 0, 0.45);
  }
  /deep/.ant-table-thead > tr > th {
    color: rgba(0, 0, 0, 0.65);
  }
  /deep/.ant-table-body {
    max-height: calc(100vh - 430px - 17px) !important;
    overflow-x: hidden !important;
    color: rgba(0, 0, 0, 0.85);
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      height: 24px;
      line-height: 24px;
      padding: 6px 10px;
    }
    table {
      padding: 0 !important;
    }
  }
}
.role-scopes{
  display: flex;
  align-items: center;
}
.question{
  display: inline-block;
  width: 12px;
  height: 12px;
  text-align: center;
  line-height: 12px;
  border: 1px solid rgba(0, 0, 0, 0.45);
  position: relative;
  margin-left: -19px;
  margin-right: 5px;
  vertical-align: center;
  i{font-size: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0.75);
    color: rgba(0, 0, 0, 0.85);
  }
}

.role-scope-child{
  padding-left: 90px;
  border-bottom: 1px solid #e8e8e8;
  .item{
    display: flex;
    height: 38px;
    line-height: 38px;
    align-items: center;
    .item-text{
      margin-left: 10px;
    }
  }
}
.handover-opinions{
  display: flex;
  margin-top: 16px;
  label{
    display: inline-block;
    margin-right: 12px;
    white-space: nowrap;
    line-height: 1.5;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);

  }
}
.sub-btn {
    width: 100%;
    text-align: center;
    padding: 10px 0;
    position: absolute;
    bottom: 0;
    z-index: 100;
    margin-left: -24px;
    background: #fff;
    border-top: 1px solid rgba(232, 232, 232, 1);
    & > div {
      width: 802px;
      margin: 0 auto;
    }
    .btn {
      &:last-child {
        margin-left: 6px;
      }
      span {
        font-weight: 400;
      }
    }
    .transfer-all {
      float: right;
      color: @primary-color;
      line-height: 32px;
      cursor: pointer;
      &.disabled {
        color: rgba(0, 0, 0, 0.25);
        cursor: not-allowed;
      }
    }
  }

  .search-head{
    padding-left: 50px;
  }

  .row-title{
    display: flex;
    align-items: center;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 10px;
    span{
      display: inline-block;
      width: 26px;
      height: 26px;
      line-height: 24px;
      border: 1px solid #ccc;
      font-size: 14px;
      text-align: center;
      color: #ccc;
      border-radius: 50%;
      margin-right: 16px;
      position: relative;
      &::after{
        content: '';
        position: absolute;
        width: 1px;
        height: 54px;
        background-color: #ccc;
        left: 50%;
        transform: translateX(-50%);
        top: 100%;
        margin-top: 5px;
        z-index: 1;
      }
    }
    &.is-last{
      span::after{
        display: none;
      }
    }
  }
</style>

<style lang="less">
.row .role-selector__input.auto{
  vertical-align: top;
  height: 32px;
  padding: 0 !important;
  box-sizing: border-box;
}
.row {
  span.role-selector__input--placeholder{
    padding-top: 0;
  }
}
</style>
