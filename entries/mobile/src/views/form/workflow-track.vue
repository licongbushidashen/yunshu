<template>
  <div class="workflow-track" :class="{ external: isExternal }">
    <h3-tab :lineWidth="2" :customBarWidth="'24px'" v-model="index">
      <h3-tab-item v-show="!isExternal" :selected="index === 0">{{
        $t("languages.common.approval")
      }}</h3-tab-item>
      <h3-tab-item :selected="index === 1">{{
        $t("languages.common.workflowChart")
      }}</h3-tab-item>
    </h3-tab>
    <div class="tab-content">
      <div class="scroll">
        <Approvals
          v-if="!isExternal"
          :approvals="approvals"
          :creater="creater"
          :workflowInfo="workflowInfo"
          :participants="participants"
          v-show="!index"
          @goSubInstance="goSubInstance"
          @preview="onPreview"
          @detail="onDetail"
        ></Approvals>
        <!-- 流程图 -->
        <Chart
          v-if="index"
          :chart="chart"
          :show="!!index"
          :workflowStatus="workflowInfo.status"
          >1 Container
        </Chart>
      </div>
    </div>
    <!-- 干扰流程功能 -->
    <!-- <form-actions
      class="form-foot border-top"
      :actions="mobileActions"
      v-show="mobileActions.length > 0 && index === 0"
      @action="onAction"
    ></form-actions> -->

    <!-- <template v-if="headerAction.showEditable || headerAction.showAdjust || headerAction.showCancel || headerAction.showRemove || headerAction.showEditOwner">
      <a-button @click="processOperationAndMaintenanceHandle">{{ $t('cloudpivot.flow.pc.ProcessOperationAndMaintenance') }}</a-button>
    </template> -->

    <div class="devOps form-actions" v-if="devOpsVisible" @click="toDevOps">
      流程运维
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import { H3Tab, H3TabItem, H3Swiper, H3SwiperItem } from "h3-mobile-vue";

import flow from "@cloudpivot/flow/mobile";

import { renderer } from "@cloudpivot/form";

import common from "@cloudpivot/common";

import { workflowApi, workflow } from "@cloudpivot/api";

import * as mobileForm from "@cloudpivot/form/mobile";

@Component({
  name: "workflow-track",
  components: {
    H3Tab,
    H3TabItem,
    H3Swiper,
    H3SwiperItem,
    Approvals: flow.components.Approval,
    Chart: flow.components.WorkflowChart,
    FormActions: mobileForm.runtime.FormActions,
  },
})
export default class WorkflowTrack extends Vue {
  index = 0;

  approvals: workflow.ApprovalInstance[] = [];

  creater = {} as any;

  chart: workflow.Chart = {}; // 流程图

  chartSize = { width: 0, height: 0 };

  workflowInfo: any = {};

  participants = [];

  workflowInstanceId = "";

  workItemId:string = "";

  toDevOps(){
    this.$router
      .push({
        name: "devOps",
        params: {
          workflowInstanceId: this.workflowInstanceId,
          workflowVersion: this.workflowInfo.workflowVersion,
          workflowCode: this.workflowInfo.workflowCode,
          workflowName: this.workflowInfo.workflowName,
          participants: this.workflowInfo.participants,
          headerAction: this.workflowInfo.headerAction,
          status: this.workflowInfo.status
        },
        query: {
          return: this.$route.query.return,
          workItemId: this.workItemId,
        },
      })
      .catch((err: any) => {
        err;
      });
  }


  get devOpsVisible(){
    return this.mobileActions.some(el => el.visible)
  }

  mobileActions: any[] = [
    {
      code: "showEditable",
      disabled: false,
      visible: true,
      loading: false,
      text: "编辑",
    },
    {
      code: "showAdjust",
      disabled: false,
      visible: true,
      loading: false,
      text: "调整节点",
    },
    {
      code: "showRemove",
      disabled: false,
      visible: true,
      loading: false,
      text: "删除",
    },
    {
      code: "showCancel",
      disabled: false,
      visible: true,
      loading: false,
      text: "作废",
    },
    {
      code: "showEditOwner",
      disabled: false,
      visible: true,
      loading: false,
      text: "修改拥有者",
    },
  ];

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  created() {
    // this.load();
    if ((window as any).isExternal) {
      this.index = 1;
    }
    this.loadAsync();
    this.getLoadData();
  }

  /**
   * 获取按钮权限
   */
  async getLoadData(){
    const res:any=  await workflowApi.getOpinionState({
      workitemId: this.workItemId,
      workflowInstanceId: this.workflowInstanceId,
    });
    if(res.errcode!==0){
      this.$h3.toast.show({
         text: res.errmsg as string,
         iconType: "close",
      });
      return;
    }
    console.log(res);
    if(res.data.forPermission && res.data.forPermission.actionPermission){
      Object.keys(this.mobileActions).forEach(key=>{
         this.mobileActions[key].visible=res.data.forPermission.actionPermission[key];
      })
    }
    
  }

  /**
   * 流程处理
   */
  onAction(ac: any) {
    console.log(ac);
    switch(ac.code){
       case 'showRemove'://删除
       this.deleteForm();
       break;
       case 'showCancel'://作废
       this.nullify();
       break; 
       case 'showEditOwner'://修改拥有者
       this.editOwner();
       break;
       case 'showEditable'://编辑
       this.edit();
       break;
       case 'showAdjust'://调整节点
        this.adjustNode();
       break;
    }
  }
  
/**
 * 编辑
 */
edit(){
  this.$router.push({
      name: 'form-detail',
      query: {
        workitemId: this.workItemId,
        workflowInstanceId: this.workflowInstanceId,
        edit:'true',
        return: '/',
      }
    }).catch((err: any) => {err});
}


/**
 * 调整节点
 */

adjustNode(){
  this.$router
      .push({
        name: "WorkflowAdjustment",
        params: {
          workflowInstanceId: this.workflowInstanceId,
        },
        query: {
          return: this.$route.query.return,
          workItemId: this.workItemId,
        },
      })
      .catch((err: any) => {
        err;
      });
}
/**
 * 修改拥有者
 */
  editOwner(){
    this.$router
      .push({
        name: "WorkflowUpdateTenedor",
        params: {
          workflowInstanceId: this.workflowInstanceId,
          workItemId: this.workItemId,
        },
        query: {
          return: this.$route.query.return,
        },
      })
      .catch((err: any) => {
        err;
      });
  }
  /**
   * 作废
   */
  async nullify(){
    this.$h3.modal.show({
      title: `${this.$t('cloudpivot.flow.pc.NullifyTips1')}`,
      content:
        `${this.$t('cloudpivot.flow.pc.NullifyTips2')}`,
      actions: [
        {
          //@ts-ignore
          text: this.$t("cloudpivot.form.renderer.cancel").toString(),
          onPress() {},
        },
        {
          //@ts-ignore
          text: this.$t("cloudpivot.form.renderer.ok").toString(),
          onPress: async () => {
            const res = await workflowApi.abortInstance(this.workflowInstanceId, this.workItemId, 1);
            if (res.errcode === 0) {
              const url: any = this.$route.query.return;
              this.$router.push({ path: url+'?' + new Date().getTime() });
            }else {
                 this.$h3.toast.show({
                  text: res.errmsg as string,
                  iconType: "close",
                });
            }
          },
        },
      ],
    });
  }

  /**
   * 删除
   */
  async deleteForm() {
    this.$h3.modal.show({
      title: `${this.$t('cloudpivot.flow.pc.DeleteTips3')}`,
      content:
        `${this.$t('cloudpivot.flow.pc.DeleteTips1')}<span style="color:#F4454E">${this.$t('cloudpivot.flow.pc.DeleteTips2')}</span>`,
      actions: [
        {
          //@ts-ignore
          text: this.$t("cloudpivot.form.renderer.cancel").toString(),
          onPress() {},
        },
        {
          //@ts-ignore
          text: this.$t("cloudpivot.form.renderer.ok").toString(),
          onPress: async () => {
            const res = await workflowApi.deleteInstance(this.workflowInstanceId, this.workItemId, 1);
            if (res.errcode === 0) {
              const url: any = this.$route.query.return;
              this.$router.push({ path: url+'?' + new Date().getTime() });
            } else if (res.errcode === 550006) {
              const msg = this.$t(
                "cloudpivot.form.runtime.tip.errTips13"
              ).toString();
              this.$message.error(msg);
                   this.$h3.toast.show({
                  text: msg,
                  iconType: "close",
                });
            } else {
                 this.$h3.toast.show({
                  text: res.errmsg as string,
                  iconType: "close",
                });
            }
          },
        },
      ],
    });
  }

  /**
   * #23812-临时修复流程图表不居中的问题;
   * 现有方案使用scale方式进行缩放, 会有损清晰度. 建议后期使用svg的无损放大, 因此这个修复仅作为临时解决办法
   */
  // @Watch('index', {immediate: true})
  // @Watch('chart', {immediate: true})
  // onTabChange() {
  //   if ( this.index!==1 || !this.chart.length ) return;

  //   this.$nextTick(()=>{
  //     console.log('_______ next')
  //     console.log( !!document.body );
  //     console.log( document.querySelector('.flow-track-chart__drawer') )
  //     let body            = document.body;
  //     let drawerWrapper   = body.querySelector('.flow-track-chart__drawer') as any;
  //     let designerWrapper = drawerWrapper.querySelector('.workflow-designer') as any;
  //     drawerWrapper.scrollTop = drawerWrapper.scrollHeight/2 - designerWrapper.clientHeight*(body.clientWidth/designerWrapper.clientWidth);
  //   })
  // }

  loadAsync() {
    let workflowInstanceId = (this.workflowInstanceId =
      this.$route.params.workflowInstanceId);
    this.workItemId=this.$route.params.workItemId;
    

    // 获取审批日志
    workflowApi
      .getApproval({ workflowInstanceId })
      .then((resp: any) => {
        if (resp.errcode !== 0) throw resp.errmsg;
        resp.data = (
          !!resp.data && Array.isArray(resp.data) ? resp.data : []
        ).map((item: any) => common.utils.compatible(item, "activityName"));
        // 赋值
        this.approvals = resp.data;
        try {
          this.creater = resp.data[0].nodes[0].approvaler;
        } catch {}
      })
      // 报错
      .catch((err) => this.$h3.toast.show({ text: err.toString() }));

    // 获取流程实例信息
    workflowApi
      .getWorkflowBaseInfo({ workflowInstanceId })
      .then((resp) => {
         if (resp.errcode !== 0) throw resp.errmsg;
        this.workflowInfo = resp.data || {};
        this.participants = this.workflowInfo.participants;
        //获取菜单权限
        if (resp.data && resp.data.headerAction && typeof resp.data.headerAction === "object") {
          const dataMap = new Map()
            .set("showEditable", "languages.common.edit")
            .set("showAdjust", "languages.common.adjust")
            .set("showRemove", "languages.common.delete")
            .set("showCancel", "languages.common.void")
            .set("showEditOwner", "languages.common.updateOwner");
          this.mobileActions.forEach((item) => {
              item.visible = this.workflowInfo.headerAction[item.code];
              item.text = this.$t(`${dataMap.get(item.code)}`);
          });
          this.mobileActions = this.mobileActions.filter(
            (item) => item.visible
          );
        }
      })
      .catch((err) => this.$h3.toast.show({ text: err.toString() }));
  }

  onPreview(file: any) {
    if (!file) {
      return;
    }
    console.log(file, "dsdsd");
    renderer.UploadControl.service.preview(file, [file]);
  }

  onDetail(params: any) {
    this.$router
      .push({
        name: "FormApprovalDetails",
        params,
      })
      .catch((err: any) => {
        err;
      });
  }

  /*
   * 点击审批记录子流程
   */
  goSubInstance(log: any) {
    this.$router
      .push({
        name: "form-detail",
        query: {
          workflowInstanceId: log.workflowInstanceId,
          workitemId: log.workItemId,
          return: `${location.pathname + location.search}`,
        },
      })
      .catch((err: any) => {
        err;
      });
  }
}
</script>


<style lang="less">
@import "~@/styles/mixins.less";

.devOps{
  .px2rem(height,88px);
  background-color: #fff;
  .px2rem(line-height,88px);
  .px2rem(font-size,30px);
  color: #2970FF;
  cursor: pointer;
}

.workflow-track {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f7f8fc;
  overflow: hidden;
  .h3-tab {
    flex: 0 0;
    .px2rem(flex-basis, 88px);
    z-index: 2;
    &-item {
      color: #999;
    }
    &-selected {
      .px2rem(font-size,@font-size-base);
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }
    &-ink-bar {
      .px2rem(height,6px);
    }
    &-bar-inner {
      .px2rem(margin-top,-2px);
      .px2rem(height,6px);
      .px2rem(border-radius,3px);
    }
  }
  .tab-content {
    flex: 1 1;
    height: 100%;
    overflow: hidden;
    .scroll {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}
.external {
  .h3-tab-bar-inner {
    width: 0 !important;
  }
}
</style>
