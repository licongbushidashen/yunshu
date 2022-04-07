<template>
  <div class="form-track">
    <div class="header form-header">
      <!-- <div class="back"> -->
<!--        <a href="javascript:;" class="link" @click="back">{{ $t('languages.common.back') }}</a>-->
        <!-- <i @click="back" class="back-icon icon aufontAll h-icon-all-arrow-left-o router-link-active"></i> -->
<!--        <span class="line">|</span>-->
        <!-- <label>{{ $t('languages.common.workflowTrack') }}</label> -->
      <!-- </div> -->
      <h4>
<!--        <a href="javascript:;" class="link" @click="back">{{ $t('languages.common.back') }}</a>-->
        <i @click="back" class="back-icon icon aufontAll h-icon-all-arrow-left-o router-link-active"></i>
<!--        <span class="line">|</span>-->
        <label>{{ $t('languages.common.workflowTrack') }}</label>
      </h4>
      <div>&nbsp;</div>
    </div>
    <workflow-track-main
      :workflowInstanceId="workflowInstanceId"
      :loading="loading"
      :baseInfo="baseInfo"
      :chart="chart"
      :logs="logs"
    ></workflow-track-main>
    <div class="header form-header form-footer">
      <div class="back">
      </div>
      <workflow-track-actions
        :headerAction="headerAction"
        :workflowInstanceId="workflowInstanceId"
        :workItemId="workItemId"
        :currentActivityCode="currentActivityCode"
        :workflowVersion = "baseInfo.workflowVersion"
        :formVersion="baseInfo.version"
        :workflowState="workflowState"
        @edit="onEdit"
        @logs="onLogs"
        @loadData="loadData"
        @processOperationAndMaintenanceHandle="processOperationAndMaintenanceHandle"
        :isWORKFLOW_ADMIN="isWORKFLOW_ADMIN"
        :workflowAdminManageScopes = "workflowAdminManageScopes"
      ></workflow-track-actions>
    </div>
    <template v-if="processOperationAndMaintenanceVisible">
      <operationAndMaintenance 
        @operationOver="loadData" 
        :data="baseInfo" 
        v-model="processOperationAndMaintenanceVisible"
        :isWORKFLOW_ADMIN="isWORKFLOW_ADMIN"
        :workflowAdminManageScopes = "workflowAdminManageScopes"
        :workflowState="workflowState"
        :headerAction="headerAction"
      />
    </template>
  </div>
</template>

<script lang="ts">
// 初始化表单组件配置
import "@/config/h3-form";

import { Component, Vue } from "vue-property-decorator";

import flow from "@cloudpivot/flow/pc";

import common from "@cloudpivot/common";

import { workflowApi, workflow } from "@cloudpivot/api";

import operationAndMaintenance from './operationAndMaintenance.vue'
import OAuthApi from "@/apis/oauth";
import * as dd from "dingtalk-jsapi"

@Component({
  name: "workflow-track",
  components: {
    WorkflowTrackMain: flow.components.WorkflowTrack,
    WorkflowTrackActions: flow.components.WorkflowTrackActionsNew,
    operationAndMaintenance
  }
})
export default class WorkflowTrack extends Vue {
  workflowInstanceId: string = ""; // 流程实例Id

  workItemId: string = ""; // 流程Id

  baseInfo: workflow.InstanceBaseInfo = {}; // 流程跟踪基础信息

  chart: workflow.Chart = {}; // 流程图

  logs: workflow.WorkflowTrackLog[] = []; // 审批日志

  loading = true;


  processOperationAndMaintenanceVisible:boolean = false;
  processOperationAndMaintenanceHandle(){
    this.processOperationAndMaintenanceVisible = true
  }

  /**
   * 获取头部控制
   */
  get headerAction() {
    return this.baseInfo.headerAction ? this.baseInfo.headerAction : [];
  }

  /**
   * 获取异常流程的异常节点，其下一个节点作为当前节点
   */
  get currentActivityCode() {
    const flowStatus: any = this.baseInfo.status;
    if (flowStatus !== "EXCEPTION") {
      return "";
    }
    if (this.chart && Array.isArray(this.chart.activityStatus)) {
      let targetActivityIdx;
      this.chart.activityStatus.some((act: any, idx: number) => {
        if (act.status === 2) {
          targetActivityIdx = idx + 1;
          return true;
        }
        return false;
      });
      if (targetActivityIdx) {
        let targetActivity = this.chart.activityStatus[targetActivityIdx];
        return targetActivity ? targetActivity.activityCode : "";
      }
    }
    return "";
  }

  /**
   * 流程装填
   */
  get workflowState() {
    if (this.baseInfo) {
      return this.baseInfo.status
    }
  }

  /**
   * 返回点击事件
   */
  back() {
    if (this.workItemId !== "") {
      // this.$router.push({
      //   name: 'form-detail',
      //   query: {
      //     workflowInstanceId: this.workflowInstanceId,
      //     workitemId: this.workItemId,
      //     return: this.$route.query.return
      //   }
      // });
      this.$router.go(-1);
    } else {
      this.closePage();
    }
  }
  IsPC() {
      var userAgentInfo = navigator.userAgent;
      var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
      var flag = true;
      for (var v = 0; v < Agents.length; v++) {
          if (userAgentInfo.indexOf(Agents[v]) > 0) {
              flag = false;
              break;
          }
      }
      return flag;
  }
  /**
   * 关闭当前页面
   */
  closePage() {
    window.opener = null;
    window.open("", "_self");
    window.close();
  }

  /**
   * 跳转日志
   */
  onLogs() {
    this.$router.push({
      name: "flowTrackOperationLogs",
      params: { workflowInstanceId: this.workflowInstanceId }
    }).catch((err: any) => {err});
  }

  /**
   * 编辑事件
   */
  onEdit() {
    this.$router.push({
      name: "form-detail",
      query: {
        workflowInstanceId: this.workflowInstanceId,
        workitemId: this.workItemId,
        edit: "true",
        return: this.$route.query.return
      }
    }).catch((err: any) => {err});
  }

  closePopDetail(){
    if(window.top !== window.self){
      window.parent.postMessage('close', '*')
    }else{
      /**
       * 钉钉浏览器不支持close(),单独处理
       */
      if(dd.biz && (dd.android || dd.ios)) {
        dd.biz.navigation.goBack({
          onSuccess : ()=> {
            console.log('关闭成功!');
          },
          onFail : ()=> {
            console.error('关闭失败');
          }
        });
      } else if(dd && dd.pc && this.IsPC()) { // pc钉钉
        this.back();
      } else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
      }
    }
  }

  /**
   * 加载数据
   */
  loadData(type?:string) {
    if(type === 'DELETE_WORKFLOW'){
      this.closePopDetail()
      return
    }

    this.loading = true;
    const params: workflow.GetWorkflowTrackParams = {
      workflowInstanceId: this.workflowInstanceId
    };

    this.loadBaseInfo(params).then(() => this.loading = false);

    this.loadChart(params);

    this.loadLogs(params);

    // let res: any = {};
    // res = await workflowApi.getWorkflowBaseInfo(workflowInstanceId);
    // common.utils.compatible(res.data || {}, 'workflowName');
    // if (res.data && Array.isArray(res.data.participants)) {
    //   res.data.participants.forEach((d:any) => {
    //     common.utils.compatible(d, 'activityName');
    //   });
    // }
    // this.baseInfo = res.data;
    // console.log('-----------', this.baseInfo);
    // res = await workflowApi.getWorkflowChart(workflowInstanceId);
    // if (res.data && Array.isArray(res.data.activities)) {
    //   res.data.activities.forEach((d:any) => {
    //     d = common.utils.compatible(d, 'activityName');
    //   });
    // }
    // this.chart = res.data;
    // res = await workflowApi.getWorkflowLogs(workflowInstanceId);
    // if (res.data && Array.isArray(res.data)) {
    //   res.data.forEach((d:any) => {
    //     common.utils.compatible(d, 'activityName');
    //     // 发起节点接收时间优化-不展示接收时间、耗时
    //     if (d.tokenId === 0) {
    //       d.receiveTime = '--';
    //       d.usedTime = 0;
    //     }
    //   });
    // }
    // this.logs = res.data;
  }

  async loadBaseInfo(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowBaseInfo(params);
    if (res.errcode === 0 && res.data) {
      common.utils.compatible(res.data || {}, "workflowName");
      if (Array.isArray(res.data.participants)) {
        res.data.participants.forEach((d: any) => {
          common.utils.compatible(d, "activityName");
          // 委托数据格式化
          if (Array.isArray(d.participantRelations)) {
            d.participantRelations = d.participantRelations.map((tru:any) => {
              const user = { ...tru.participantVO, workitemId: tru.workitemId, isTrust: tru.isTrust, trustorProcessor: tru.trustorVO };
              return user;
            });
          }
        });
      }
      this.baseInfo = res.data || {};
      this.getUserInfo()
    }

  }

  async loadChart(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowChart(params);
    if (res.errcode === 0 && res.data) {
      if (Array.isArray(res.data.activities)) {
        res.data.activities.forEach((d: any) => {
          d = common.utils.compatible(d, "activityName");
        });
      }
      this.chart = res.data || {};
    }
  }

  async loadLogs(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowLogs(params);
    if (res.errcode === 0 && res.data) {
      if (Array.isArray(res.data)) {
        res.data.forEach((d: any) => {
          common.utils.compatible(d, "activityName");
          // 发起节点接收时间优化-不展示接收时间、耗时
          if (d.tokenId === 0) {
            d.receiveTime = "--";
            d.usedTime = 0;
          }
        });
      }
      this.logs = res.data || [];
    }
  }

  /**
   * 初始化
   */
  created() {
    this.workflowInstanceId = (this.$route.params as any).workflowInstanceId;
    this.workItemId = (this.$route.params as any).workItemId;
    if (this.workItemId) {
      this.loadData();
    }
  }
  
  
  isWORKFLOW_ADMIN:boolean = false;
  async getUserInfo(){
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes("APP_MNG"); // 子管理员
      const isSysAdmin: boolean = info.permissions.includes("SYS_MNG"); // 系统管理员
      const isRootAdmin: boolean = info.permissions.includes("ADMIN"); // 超级管理员
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;

      const isWORKFLOW_ADMIN:boolean = info.permissions.includes("WORKFLOW_ADMIN"); // 特权人
      if(!isRootAdmin && !isSysAdmin){
        // 是特权人
        this.isWORKFLOW_ADMIN = true
        this.getWorkflowAdminManageScopes()
      }
      
    }
  }

  workflowAdminManageScopes:any[] = []
  async getWorkflowAdminManageScopes(){
    await workflowApi.getWorkflowAdminManageScopesByWorkflowInstanceId({
      workflowInstanceId: this.workflowInstanceId || ''
    }).then((res:any) => {
      if(res.errcode === 0){
        this.workflowAdminManageScopes = res.data || []
      }
    })
  }

}
</script>

<style lang="less" scoped>
.form-header {
  display: flex;
  justify-content: space-between;
  padding: 0 24px !important;

  h4 {
    font-size: 16px;
    color: #000;
    margin-bottom: 0;
    font-weight: 500;
  }
}
.back-icon{
  cursor: pointer;
  color: rgba(0,0,0,0.65);
  margin-right: 8px;
  &:hover{
    color: #2970ff;
  }
}
.form-track {
  .main {
    display: flex;
    flex-direction: column;
    > .content {
      padding: 60px 0 100px;
      align-self: center;
      height: 2000px;
      width: @layout-min-width !important;
    }
  }
  &__tabs {
    margin-top: @base4-padding-sm;
  }
  .back {
    flex: 0 0 250px !important;
    &::before {
      display: none;
    }
  }
}
.form-footer{
  position: fixed;
  left: 0;
  bottom: 0;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  height: 52px;
  padding: 0 24px !important;
}
</style>
