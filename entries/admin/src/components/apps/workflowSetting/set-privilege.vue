<template>
  <div class="set-privilege">
    <div class="setting-title">
      <span>流程运维特权人
         <!-- <font class="title-small">最多设置5条</font> -->
      </span>
      <a-button
        type="primary"
        class="add-item"
        @click="changeModalType('add')"
        >
        <i class="icon aufontAll h-icon-all-plus-o" />新增
      </a-button>
    </div>

    <a-table
      :columns="tableColums"
      :dataSource="scopeList"
      :pagination="false"
      class="scope-list"
    > 
      
      <div slot="adminScopes" slot-scope="text, record">
        {{getAdminScopesName(record.adminScopes)}}
      </div>
      <div slot="manageScopes" slot-scope="text, record" :title="getManageScopesName(record.manageScopes)">
        {{getManageScopesName(record.manageScopes)}}
      </div>

      <div class="operation" slot="operation" slot-scope="text, record">
        <span @click="changeModalType('edit', record)">修改</span>
        <span @click="deleteWorkflowAdmin(record)">删除</span>
      </div>
    </a-table>

    <custom-pop v-model="modalShow" overHidden="hidden">
      <template slot="title">
        {{modalType === 'add' ? '新建' : '修改'}}流程运维特权人
      </template>

      <template slot="content">
        <div class="label">
          <span></span>
          <div>用户范围</div> 
          <a-radio-group class="radio-group" v-model="currentItemData.adminType" @change="adminTypeChange">
            <a-radio :value="1">{{ $t('languages.appSettings.AsOrg') }}/{{ $t('languages.appSettings.personnel') }}</a-radio>
            <a-radio :value="2">{{ $t('languages.appSettings.AsRole') }}</a-radio>
          </a-radio-group>
        </div>

        <div class="select-wrapper" v-if="currentItemData.adminType === 1">
          <label>组织</label>
          <!-- 按组织 -->
          <staff-selector
              v-model="currentItemData.adminScopes"
              :options="userAndDepOpts"
              :visiblePart = "true"
          ></staff-selector>
        </div>

        <div class="select-wrapper" v-else>
          <label>角色</label>
          <!-- 按角色 -->
          <role-select
            :defaultValue="currentItemData.adminScopes"
            :showParent="true"
            :expandAll="true"
            defaultValueKey="id"
            :params="{}"
            :multiple="true"
            :showAuthority="true"
            :filterDefaultRoleGroup="true"
            :filterDD="true"
            @select="selectRole"
            :keepRoles="keepRolesList"
            :filterKey="codeProp"
            :visiblePart = "true"
            :maxTagCount="1"
          ></role-select>
        </div>

        <div class="label"><span></span>流程运维范围</div>
        <a-checkbox-group v-model="currentItemData.manageScopes">
          <div class="label-small">流程操作</div>
          <a-checkbox value="CANCELED_WORKFLOW">作废流程</a-checkbox>
          <a-checkbox value="COMPLETED_WORKFLOW" style="margin: 0 27px;">结束流程</a-checkbox>
          <a-checkbox value="DELETE_WORKFLOW">删除流程</a-checkbox>

          <div class="label-small">节点操作</div>
          <a-checkbox value="ADJUST_PARTICIPANT" >调整当前处理人</a-checkbox>
          <a-checkbox value="CANCELED_ACTIVITY_WORKITEM" style="margin: 0 27px;">取消当前节点所有任务</a-checkbox>
          <a-checkbox value="ACTIVATE_ACTIVITY">激活其他节点</a-checkbox>

          <div class="label-small">流程数据操作</div>
          <a-checkbox value="MODIFY_OWNER">修改拥有者</a-checkbox>
        </a-checkbox-group>         
      </template>

      <template slot="footer">
        <a-button @click="modalShow = false">取消</a-button>
        <a-button type="primary" @click="determine" class="determine">确定</a-button>
      </template>
    </custom-pop>
    
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import common from "@cloudpivot/common/pc";
import WorkflowApi from '@/apis/workflow';
import { workflowApi } from '@cloudpivot/api';

import customPop from '@cloudpivot/form/src/common/components/customPop.vue';

enum ModalTypes {
  add = 'add',
  edit = 'edit'
}

const currentItemData:any = {
  adminScopes: [],
  adminType: 1,
  manageScopes: [],
  workflowCode: '',
  id: ''
}

@Component({
  name: 'setPrivilege',
  components: {
    StaffSelector,
    RoleSelect: common.components.RoleSelect,
    customPop
  }
})
export default class setPrivilege extends Vue {
  modalShow:boolean = false;
  modalType: string = ModalTypes.add;
 

  currentItemData:any = {
    adminScopes: [],
    adminType: 1,
    manageScopes: [],
    workflowCode: '',
    id: ''
  }

  // 修改/新增确认
  determine(){
    // if(this.modalType === 'add' && this.scopeList.length >=5){
    //   this.$message.error('最多设置5条!')
    //   return
    // }
    if(!this.currentItemData.adminScopes || this.currentItemData.adminScopes.length === 0){
      this.$message.error('用户范围不能为空！')
      return
    }
    if(!this.currentItemData.manageScopes || this.currentItemData.manageScopes.length === 0){
      this.$message.error('流程运维范围不能为空！')
      return
    }

    let adminScopes = this.currentItemData.adminScopes.map(el => {
      return {
        unitType: el.unitType || el.type,
        unitId: el.id
      }
    })
    let params:any = {
      adminType: this.currentItemData.adminType,
      workflowCode: this.$route.params.workflowCode,
      manageScopes: this.currentItemData.manageScopes,
      id: this.currentItemData.id,
      adminScopes,
    }
    this.createWorkflowAdmin(params)
  }

  // 限制组织范围只能选择5个
  // userAndDepOptsChange(opts){
  //   if(opts.length > 5){
  //     this.$message.warning('组织范围只能选择最多5个')
  //     this.currentItemData.department = this.currentItemData.department.slice(0, 5)
  //   }
  // }

  // 删除特权人
  deleteWorkflowAdmin(record){
    let that = this
    this.$confirm({
      title: '请确认是否删除，删除后会影响已在途的流程和新建流程！',
      okText: '确定',
      cancelText: '取消',
      onOk(){
        workflowApi.deleteWorkflowAdmin({id: record.id}).then((res:any) => {
          if(res.errcode === 0){
            that.getListWorkflowAdmin()
            that.postMeg()
          }else{
            that.$message.error(res.errmsg)
          }
        })
      }
    })
  }
  // 新增特权人
  createWorkflowAdmin(params){
    workflowApi.createWorkflowAdmin(params).then((res:any) => {
      if(res.errcode === 0){
        this.getListWorkflowAdmin()
        this.$message.success(`${this.modalType === 'add' ? '新增' : '修改'}成功`)

        this.postMeg()

      }else{
        this.$message.error(res.errmsg)
      }
      this.modalShow =  false
    })
  }

  postMeg(){
    window.opener.postMessage('workflowAdminChange', '*')
  }

  // 获取特权人列表
  getListWorkflowAdmin(){
    workflowApi.getListWorkflowAdmin({
      workflowCode: this.$route.params.workflowCode
    }).then((res:any) => {
      if(res.errcode === 0){
        res.data.forEach((element:any, key:number) => {
          element.index = key + 1
        });
        this.scopeList = res.data
      }
    })
  }

  created(){
    this.getListWorkflowAdmin()
  }

  adminTypeChange(){
    this.currentItemData.adminScopes = []
  }
  changeModalType(type: ModalTypes, item ?:any){
    if(!item){
      this.currentItemData = JSON.parse(JSON.stringify(currentItemData))
    }else{
      this.currentItemData = JSON.parse(JSON.stringify(item))
    }
    this.modalType = type
    this.modalShow = true
  }

  getManageScopesName(manageScopes: string[]){
    const ManageScopes = {
      CANCELED_WORKFLOW: '作废流程',
      COMPLETED_WORKFLOW: '结束流程',
      DELETE_WORKFLOW: '删除流程',
      ADJUST_PARTICIPANT: '调整当前处理人',
      CANCELED_ACTIVITY_WORKITEM: '取消当前节点任务',
      ACTIVATE_ACTIVITY: '激活节点',
      MODIFY_OWNER: '修改拥有者'
    }
    return manageScopes.map(el => ManageScopes[el]).join('、')
  }

  getAdminScopesName(adminScopes: any[]){

    return adminScopes.map(el => el.name).join('、')
  }

  /*
   * 选择角色
   */
  selectRole(value: any[]) {
    if (!value || !value.length) {
      this.currentItemData.adminScopes = [];
      return;
    }
    this.currentItemData.adminScopes = value
  }

  codeProp: string = "code";
  keepRolesList: any = [{code: "SYS_2000000"}, {code: "SYS_1000000"}];
  userOpts:any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  }

  depOpts:any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  }

  userAndDepOpts:any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  }

  scopeList:any[] = []

  tableColums: any = [{
    title: '序号',
    dataIndex: 'index',
    align: 'center',
    width: 64,
  }, {
    title: '用户范围',
    dataIndex: 'adminScopes',
    scopedSlots: { customRender: 'adminScopes' }
  }, {
    title: '流程运维范围',
    dataIndex: 'manageScopes',
    scopedSlots: { customRender: 'manageScopes' }
  }, {
    width: 120,
    dataIndex: 'operation',
    title: '操作',
    align: 'right',
    scopedSlots: { customRender: 'operation' }
  }];
}
</script>
<style lang="less" scoped>
  .set-privilege{
    padding: 40px 24px 0;
    .setting-title{
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      margin-bottom: 16px;
      .title-small{
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }

  .label{
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    margin-top: 24px;
    width: 100%;
    white-space: nowrap;
    span{
      display: inline-block;
      width: 3px;
      height: 12px;
      background: #00C293;
      margin-right: 10px;
    }
    /deep/.radio-group{
      padding-bottom: 0;
      margin-left: 12px;
    }
  }

  .select-wrapper{
    display: flex;
    align-items: center;
    margin-top: 20px;
    height: 34px;
    overflow: hidden;
    /deep/.h3-organization__label.show-select.has-val{
      max-height: 34px;
      overflow: auto;
    }
    /deep/.role-selector__wrap{
      max-height: 34px;
      overflow: hidden;
      .role-selector__input{
        max-height: 32px;
        overflow: auto;
        &::-webkit-scrollbar{
          width: 0;
        }
      }
    }
    &>div{
      flex: 1;
      margin-left: 24px;
    }
  }

  .radio-group{
    width: 100%;
    padding-bottom: 18px;
  }

  .label-small{
    font-size: 12px;
    color: rgba(0, 0, 0, 0.25);
    margin-top: 18px;
    margin-bottom: 9px;
  }

  .pop-footer{
    display: flex;
    justify-content: flex-end;
    padding: 42px 24px 0;
    .determine{
      margin-left: 8px;
    }
  }

  .scope-list {
    /deep/.ant-table-thead {
      th {
        padding: 8px 16px;
      }
    }
    .head {
      font-weight: 500;
      white-space: nowrap;
    }
    /deep/.ant-table-row {
      td {
        padding: 8px 16px;
      }
      .delete {
        margin-left: 7px;
        font-size: 14px;
        cursor: pointer;
        &:hover {
          color: #ff4d4e;
        }
      }
    }
  }

  .operation{
    color: #00C293;
    font-size: 14px;
    span{
      margin: 0 5px;
      cursor: pointer;
    }
  }
</style>

<style lang="less">
.role-selector__input.auto{
  vertical-align: top;
}
</style>
