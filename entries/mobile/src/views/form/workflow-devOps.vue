<template>
<!-- 流程运维 -->
  <div class="devOps-wrapper">
    <div class="choice-node" v-if="currentOptions.length">
      <h3-radio-list
        class="cur-other"
        showMode="0"
        :defaultValue="activityCode"
        :options="currentOptions"
        title="当前节点"
        :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
        :clearText="$t('cloudpivot.form.renderer.clear')"
        :confirmText="$t('cloudpivot.form.renderer.ok')"
        @onChange="currentActivityCodeChange"
      >
      </h3-radio-list>

      <div class="choice-node-inner" v-if="activityCode">
        <label>当前处理人</label>
        <div>
          <p>{{getShowText(participants.map(el => el.name).join('、'))}}<font v-show="!showAll && participants.map(el => el.name).join('、').length > 40">...</font><span v-show="showAll" @click="showAll = false">收起</span>
          </p>
          <span @click="toggleShowAll" v-show="!showAll && participants.map(el => el.name).join('、').length > 40">展开</span>
        </div>
      </div>
      
    </div>

    <div class="inner">
      <h3-radio-list
        class="cur-other"
        showMode="0"
        :defaultValue="autoSelect"
        :options="options"
        title="流程操作"
        :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
        :clearText="$t('cloudpivot.form.renderer.clear')"
        :confirmText="$t('cloudpivot.form.renderer.ok')"
        @onChange="onChange"
      >
      </h3-radio-list>

      <template v-if="manage === 'ADJUST_PARTICIPANT'">
        <!-- 调整当前处理人 -->
        <mobile-staff-selector
          v-model="userValue"
          :required="true"
          :options="staffSelectorOpts" 
          :params="{sourceType: 'portal' }"
          title="处理人"
        ></mobile-staff-selector>
      </template>

      <template v-if="manage === 'ACTIVATE_ACTIVITY'">
        <!-- 激活其他节点 -->
        <h3-radio-list
          class="cur-other"
          showMode="0"
          :defaultValue="autoSelect"
          :options="nodeOptions"
          :title="$t('cloudpivot.form.renderer.ChooseNode')"
          :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
          :clearText="$t('cloudpivot.form.renderer.clear')"
          :confirmText="$t('cloudpivot.form.renderer.ok')"
          @onChange="nodeChange"
        >
        </h3-radio-list>
      </template>

      <template v-if="manage === 'MODIFY_OWNER'">
        <!-- 修改拥有者 -->
        <mobile-staff-selector
          v-model="owner"
          :required="true"
          :options="taffSelectorOpts" 
          :params="{sourceType: 'portal' }"
          title="拥有者"
          @change="onValueChange"
        ></mobile-staff-selector>

        <h3-radio-list
          v-if="owner.length"
          class="cur-other"
          showMode="0"
          :defaultValue="departments"
          :options="departmentsList"
          title="拥有者部门"
          v-model="departments"
          :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
          :clearText="$t('cloudpivot.form.renderer.clear')"
          :confirmText="$t('cloudpivot.form.renderer.ok')"
          @onChange="departmentsChange"
        >
        </h3-radio-list>
      </template>

      <template v-if="!['DELETE_WORKFLOW'].includes(manage)">
        <h3-textarea
          v-model="comment"
          :required="false"
          type="text"
          title="处理意见"
          :placeholder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
          :maxLength="200"
        ></h3-textarea>

        <h3-upload
          listType="file"
          :title="$t('cloudpivot.form.renderer.attachment')"
          :maxSize="10"
          :multiple="true"
          :headers="headers"
          :action="uploadUrl"
          :showErrorToast="true"
          :placehloder="$t('cloudpivot.form.renderer.clickUpload')"
          :onChange="onFileChange"
        ></h3-upload>

        <signatrue
          v-model="basaImg"
          @change="upLoad"
          :title="$t('cloudpivot.form.renderer.sign')"
          :required="false"
        />
      </template>
    </div>

    <div class="is-batch" v-if="workItemSource === 1 && total && !['CANCELED_ACTIVITY_WORKITEM','ACTIVATE_ACTIVITY'].includes(manage)">
      <h3-list-item :hasExtra="true">
        批量处理
        <h3-switch
          slot="extra"
          v-model="isMultiplexing"
          color="#2970ff"
        ></h3-switch>
      </h3-list-item>

      <div class="tips">
        <h1>批量处理是将当前操作复用于以下同类型的无参与者流程</h1>
        <p>1、“无参与者”指当前节点处理人离职或被删除；</p>
        <p>2、“同类型”指同一流程模版、同一版本、同一节点、同一状态的流程</p>
      </div>

      <h3-list-item :hasExtra="true" class="to-batch" @click="toNoParticipantsList">
        <div @click="toNoParticipantsList">
          批量处理流程 【{{$route.params.workflowName}}】无参与者流程{{total}}条
        </div>
        <span slot="extra" class="icon aufontAll h-icon-all-right-o"></span>
      </h3-list-item>
    </div>

    <div class="border-top">
      <h3-button class="border-top-btn" @click="ok">{{
        $t("cloudpivot.form.runtime.biz.ok")
      }}</h3-button>
    </div>


    <div class="noParticipantsList" v-if="noParticipantsListVisible">
      <div class="header">
        <span @click="noParticipantsListVisible = false">返回</span>
        <span>批量处理流程</span>
      </div>



      <div class="list-wrapper">
        <unfinished-work-item
          v-for="(workitem, index) in noParticipantsList"
          :key="index"
          :rowKey="index"
          :workitem="workitem"
        />
      </div>
      <!-- <h3-scroll
        ref="scroll"
        :loadMore="loadMore"
      >
        
      </h3-scroll> -->
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Watch } from "vue-property-decorator";

import { H3RadioList, H3Button, H3Textarea, H3Upload, H3Switch,H3ListItem } from "h3-mobile-vue";
import mobile from "@cloudpivot/form/src/renderer/components/mobile";

import common from "@cloudpivot/common/mobile";
import MobileStaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/mobile/mobile-staff-selector.vue';
import { workflowApi, userApi } from "@cloudpivot/api";
import { DefaultFileService } from "@/config/h3-form/file-service";
import signatrue from "@cloudpivot/form/src/renderer/components/shared/signatrue.vue"
import OAuthApi from '@/views/login/oauth-api'
import UnfinishedWorkItem from "@cloudpivot/flow-center/src/components/mobile/components/unfinished-workitem.vue";

@Component({
  name: "devOps",
  components: {
    H3RadioList,
    H3Button,
    CheckBox: common.components.Checkbox,
    MobileStaffSelector,
    H3Textarea,
    H3Upload,
    signatrue,
    H3Switch,
    H3ListItem,
    H3Scroll: mobile.H3Scroll,
    UnfinishedWorkItem
  },
})

export default class devOps extends Vue {
  autoSelect: any = "";
  manage:string = '' // 操作类型
  userValue:any[] = []; // 当前处理人
  activationActivityCode: string = '' // 激活节点
  owner: Array<any> = []; // 拥有者
  departments:string = ''; // 拥有者部门
  comment: string = ''; // 审批意见
  basaImg: string = "";
  signatrue: any = null; // 签名
  fileList:any[] = []; // 附件
  isMultiplexing:boolean = false; // 是否批量处理
  total: any = 0; // 无参与者总数
  activityCode:string = ''; //当前节点
  noParticipantsListVisible:boolean = false;

  departmentsChange(e){
    this.departments = e.value
  }

  toNoParticipantsList(){
    this.noParticipantsListVisible = true
    this.getListInstances(0, 9999)
  }

  showAll:boolean = false;
  toggleShowAll(){
    this.showAll = !this.showAll
  }
  getShowText(text:string){
    if(!text){
      return ''
    }
    if(this.showAll){
      return text
    }else{
      return text.slice(0, 40)
    }
    return ''
  }


  tips: string = ''
  ok(){
    let activityName = '';
    let errorList:any[] = [];
    switch (this.manage) {
      case 'ACTIVATE_ACTIVITY':
        if(this.activationActivityCode === ''){
          errorList.push('激活节点不能为空！')
        }else{
          // @ts-ignore
          activityName = this.nodeOptions.find(el => el.value === this.activationActivityCode).label;
        }
        break;
      case 'ADJUST_PARTICIPANT': 
        if(!this.userValue.length){
          errorList.push('当前处理人不能为空！')
        }
        break
      case 'MODIFY_OWNER': 
        // 修改拥有者
        if(this.owner.length === 0){
          errorList.push('拥有者不能为空！')
        }
        if(this.departments.length === 0){
          errorList.push('拥有者部门不能为空！')
        }
        break
      default:
        break;
    }

    if(errorList.length){
      this.$h3.toast.show({
        text: errorList[0],
        iconType: "",
      });
      return;
    }
    const Obj = {
      DELETE_WORKFLOW: '流程删除后该流程所有数据将删除，且删除后不可恢复，确定要删除？',
      COMPLETED_WORKFLOW: '是否提前结束流程？',
      ADJUST_PARTICIPANT: '是否调整当前处理人？',
      MODIFY_OWNER: '是否修改拥有者？',
      ACTIVATE_ACTIVITY: `是否激活${activityName}节点？`,
      CANCELED_ACTIVITY_WORKITEM: '取消当前节点所有任务后流程会停滞，确定要取消？',
      CANCELED_WORKFLOW: '作废后该流程将停止流转，确定要作废？'
    }
    this.tips = Obj[this.manage] || ''

    this.$h3.modal.show({
      type: 'alert',
      content: this.tips,
      actions: [
        {
          text: this.$t('languages.common.cancel'),
          onPress:()=>{
            console.log('取消')
          }
        },
        {
          text: '确定',
          onPress:()=>{
            this.tipsOk()
          }
        },
      ]
    })
  }

  tipsOk(){
    let params: any = {
      activityCode: this.activityCode,
      approval: this.getApproval(),
      batchOperation: this.isMultiplexing,
      operationType: this.manage,
      workflowInstanceId: this.$route.params.workflowInstanceId
    }

    switch (this.manage) {
      case 'ADJUST_PARTICIPANT': // 调整当前处理人
        params.participantors = this.userValue.map(el => el.id)
        break;
      case 'MODIFY_OWNER': // 修改拥有者
        params.ownerDeptId = this.departments
        params.ownerId = this.owner[0].id
        break;
      case 'ACTIVATE_ACTIVITY': // 激活其他节点
        params.activityCode = this.activationActivityCode
      default:
        break;
    }
    this.workflowOperation(params)
  }

  // 提交运维数据
  async workflowOperation(params){
    await workflowApi.workflowOperation(params).then((res:any) => {
      if(res.errcode === 0){
        this.isReturn()
      }else{
        this.$h3.toast.show({
          text: res.errmsg,
          iconType: "",
        });
      }
    })
  }

  isReturn() {
    this.$h3.toast.show({
      text: "操作成功",
      iconType: "check",
    });
    setTimeout(() => {
      const url: any = this.$route.query.return;
      this.$router.push({ path: url + "?" + new Date().getTime() });
    }, 1000);
  }

  noParticipantsList:any[] = [];
  async getListInstances(page: number, size: number){
    await workflowApi.getListInstances({
      instanceState: 'PROCESSING',
      workflowCode: this.$route.params.workflowCode,
      workflowVersion: this.$route.params.workflowVersion,
      activityCode: this.activityCode,
      filterWorkflowInstanceId: this.$route.params.workflowInstanceId,
      workItemSource: 1,
      page: page,
      size: size
    }).then((res: any) => {
      console.log(res)
      if(res.errcode === 0){
        this.total = res.data.totalElements
        this.noParticipantsList = res.data.content
      }else{
        this.$message.error(res.errmsg)
      }
    })
  }

  // 获取审批意见参数：意见、附件和签名
  getApproval(){
    let resources:any[] = []
    if(this.signatrue){
      resources = [...this.fileList, this.signatrue]
    }else{
      resources = [...this.fileList]
    }

    return {
      activityCode: this.activityCode,
      commonSet: false,
      deleted: false,
      resources: resources,
      content: this.comment || null
    }
  }

  upLoad(file: any) {
    this.DefaultFileService.upFile(file).then((res: any) => {
      if (res.errcode === 0) {
        this.signatrue = res.data
      }
    });
  }


  DefaultFileService: any = new DefaultFileService();
  get headers() {
    return this.DefaultFileService.getHeaders();
  }
  get uploadUrl() {
    return this.DefaultFileService.getUploadUrl();
  }

  onFileChange(info: { value: any }, files: any[]): void {
    this.fileList = files.filter((f) => f.status === 2).map((f) => f.response.data);
  }

  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: ''
  }

  taffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择'
  }

  nodeChange(e){
    this.activationActivityCode = e.value;
  }

  @Watch('activityCode')
  onActivityCodeChange(val){
    if(val){
      this.getListInstances(0, 1)
    }
  }

  onChange(e) {
    this.manage = e.value;
  }
  options:any[] = []


  nodeOptions:any[] = []

  async getListWorkflow() {
    const res: any = await workflowApi.getWorkflowNodes({
      workflowInstanceId: this.$route.params.workflowInstanceId,
    });
    if (res.errcode === 0) {
      let optList = {};
      res.data.forEach((r: any) => {
        if (r.status === 0) {
          optList = {
            key: r.activityCode,
            value: r.activityCode,
            label: r.activityName,
          };
          this.nodeOptions.push(optList);
        }
      });
    }
  }
  departmentsList:any[] = [];
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
      let list:any[] = []
      res.data.forEach((r:any) => {
        list.push({
          key: r.deptId,
          value: r.deptId,
          label: r.deptName,
        })
      });
      this.departmentsList = list;
      let resoure = res.data.find((d: any) => d.isMain);
      this.departments = resoure.deptId;
    }else{
      this.$message.error(res.errmsg);
    }
  }

  currentOptions:any[] = []
  created(){
    this.getUserInfo()
    this.getListWorkflow()
    console.log(this.$route.params.participants)
    // @ts-ignore
    this.currentOptions = Array.isArray(this.$route.params.participants) && this.$route.params.participants.map(el => {
      return {
        key: el.activityCode,
        value: el.activityCode,
        label: el.activityName
      }
    })
    // @ts-ignore
    this.activityCode = Array.isArray(this.$route.params.participants) && this.$route.params.participants[0] && this.$route.params.participants[0].activityCode || ''
    // @ts-ignore
    this.participants = Array.isArray(this.$route.params.participants) && this.$route.params.participants[0] && this.$route.params.participants[0].participants || ''
    // @ts-ignore
    this.workItemSource = Array.isArray(this.$route.params.participants) && this.$route.params.participants[0] && this.$route.params.participants[0].workItemSource || 0

    this.initScope() // 初始化流程操作范围
    
  }
  participants:any[] = []
  
  workItemSource:number = 0;
  currentActivityCodeChange(e){
    this.activityCode = e.value
    // @ts-ignore
    this.participants = Array.isArray(this.$route.params.participants) && this.$route.params.participants.find(el => el.activityCode === this.activityCode).participants
    // @ts-ignore
    this.workItemSource = Array.isArray(this.$route.params.participants) && this.$route.params.participants.find(el => el.activityCode === this.activityCode).workItemSource
  }


  isWORKFLOW_ADMIN:boolean = false;
  async getUserInfo(){
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes("APP_MNG");
      const isSysAdmin: boolean = info.permissions.includes("SYS_MNG");
      const isRootAdmin: boolean = info.permissions.includes("ADMIN");
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;

      const isWORKFLOW_ADMIN:boolean = info.permissions.includes("WORKFLOW_ADMIN"); // 特权人
      if(!isRootAdmin && !isSysAdmin){
        // 不是管理员，只是特权人
        this.isWORKFLOW_ADMIN = true
        this.getWorkflowAdminManageScopes()
      }else{

      }
      
    }
  }



  workflowAdminManageScopes:any[] = []
  async getWorkflowAdminManageScopes(){
    await workflowApi.getWorkflowAdminManageScopesByWorkflowInstanceId({
      workflowInstanceId: this.$route.params.workflowInstanceId || ''
    }).then((res:any) => {
      if(res.errcode === 0){
        this.workflowAdminManageScopes = res.data || []
        this.setOptions()
      }
    })
  }

  setOptions(){
    this.options = this.options.filter(el => this.workflowAdminManageScopes.includes(el.value))
  }

  initScope(){
    let res:any = [
      {
        value: 'CANCELED_WORKFLOW',
        label: '作废流程',
      },{
        value: 'ADJUST_PARTICIPANT',
        label: '调整当前处理人',
      },{
        value: 'COMPLETED_WORKFLOW',
        label: '结束流程',
      },{
        value: 'CANCELED_ACTIVITY_WORKITEM',
        label: '取消当前节点所有任务',
      },{
        value: 'ACTIVATE_ACTIVITY',
        label: '激活其他节点',
      },{
        value: 'DELETE_WORKFLOW',
        label: '删除流程',
      },{
        value: 'MODIFY_OWNER',
        label: '修改拥有者',
      },
    ]
    let headerAction:any =  this.$route.params.headerAction;
    if(this.$route.params.status === 'COMPLETED'){ // 已完成: 调整当前处理人、取消当前节点所有任务、结束流程  操作不存在
      res = res.filter(el => !['ADJUST_PARTICIPANT', 'CANCELED_ACTIVITY_WORKITEM','COMPLETED_WORKFLOW'].includes(el.value))
    }
    if(!headerAction.showAdjust){ // 不允许调整节点
      res = res.filter(el => !['ADJUST_PARTICIPANT', 'CANCELED_ACTIVITY_WORKITEM','COMPLETED_WORKFLOW','ACTIVATE_ACTIVITY'].includes(el.value))
    }

    if(!headerAction.showCancel || this.$route.params.status === 'CANCELED'){ // 不允许作废/流程已作废 已作废不显示 取消节点任务、调整当前处理人
      res = res.filter(el => !['CANCELED_WORKFLOW', 'ADJUST_PARTICIPANT', 'CANCELED_ACTIVITY_WORKITEM'].includes(el.value))
    }

    if(!headerAction.showRemove){ // 不允许删除
      res = res.filter(el => !['DELETE_WORKFLOW'].includes(el.value))
    }

    if(!headerAction.showEditOwner){ // 不允许修改拥有者
      res = res.filter(el => !['MODIFY_OWNER'].includes(el.value))
    }

    this.options = res

  }

  

}
</script>
<style lang='less' scoped>
@import "~@/styles/mixins.less";
.devOps-wrapper{
  width: 100vw;
  height: 100%;
  .px2rem(padding-bottom, 89px);
  overflow: auto;
}
.inner{
  background-color: #fff;
}

.choice-node{
  background-color: #fff;
  .choice-node-inner{
    padding: 11px 15px;
    background-color: #fff;
    display: flex;
    position: relative;
    &::after{
      content: "";
      position: absolute;
      background-color: #eee;
      display: block;
      z-index: 1;
      top: auto;
      right: auto;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      -webkit-transform-origin: 50% 100%;
      transform-origin: 50% 100%;
      transform: scaleY(.5);
    }
    label{
      width: 106px;
      white-space: nowrap;
      line-height: 1.5;
      font-size: 15px;
      min-width: 106px;
      text-align: left;
    }
    &>div{
      padding: 0;
      margin: 0;
      position: relative;
      flex: 1;
      span{
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: 15px;
        line-height: 1.5;
        color: #2970ff;
      }
    }
    p{
      text-align: justify;
      white-space: pre-wrap;
      word-wrap: break-word;
      padding: 0;
      margin: 0;
      line-height: 1.5;
      font-size: 15px;
    }
  }
}

.border-top {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  .px2rem(height, 88px);
  .border-top-btn {
    color: #2970ff;
    .px2rem(font-size, 30px);
  }
}
.is-batch{
  .px2rem(margin-top, 24px);
}
.tips{
  .px2rem(font-size, 24px);
  color: #666;
  text-align: left;
  .px2rem(padding-top, 20px);
  .px2rem(padding-bottom, 20px);
  .px2rem(padding-left, 30px);
  .px2rem(padding-right, 30px);
  text-align: justify;
  p,h1{
    padding: 0;
    margin: 0;
    .px2rem(line-height, 46px);
  }
}
.noParticipantsList{
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  .header{
    position: relative;
    .px2rem(line-height, 88px);
    .px2rem(height, 88px);
    color: rgba(0, 0, 0, 0.85);
    padding: 0 15px;
    text-align: center;
    span:nth-child(1){
      position: absolute;
      left: 15px;
      .px2rem(font-size, 24px);
    }
    span:nth-child(2){
      .px2rem(font-size, 36px);
    }

  }
}
</style>
<style lang="less">
@import "~@/styles/mixins.less";
.devOps-wrapper .mescroll{
  background-color: #f7f8fc;
  .px2rem(top, 98px);
  bottom: 0;
}

.list-wrapper{
  position: absolute;
  background-color: #f7f8fc;
  width: 100%;
  .px2rem(top, 98px);
  bottom: 0;
  overflow-y: auto;
}


.devOps-wrapper .signatrue--row .row__file{
  padding: 14px 15px;
}
.to-batch .h3-list-line .h3-list-extra{
  flex: 0;
  height: 44px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>