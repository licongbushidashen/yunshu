<template>
  <section class="main">
    <div class="content">
      <p class="version">{{ $t('cloudpivot.flow.pc.Version') }}：V{{ baseInfo.workflowVersion }}</p>
      <BaseInfo ref="baseInfo" :baseInfo="baseInfo"></BaseInfo>
      <a-tabs class="form-track__tabs" defaultActiveKey="chart">
        <a-tab-pane :tab="$t('cloudpivot.flow.pc.WorkflowChart')" key="chart">
          <Chart
            v-show="chart && chart.activities"
            :chart="chart"
            :workflowStatus="baseInfo.status"
            @clickActivity="clickActivity"
            @overLine="overLine"
            @leaveLine="leaveLine"
          >
          </Chart>
        </a-tab-pane>
        <a-tab-pane v-if="!isExternal" :tab="$t('cloudpivot.flow.pc.ApprovalLog')" key="logs">
          <Log :logs="logs"></Log>
        </a-tab-pane>
      </a-tabs>
      <PageLoading v-model="loading"></PageLoading>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Tabs } from "@h3/antd-vue";
import { mixins } from "vue-class-component";
import WorkflowMixin from "./mixins/workflow";
import BaseInfo from "./base-info.vue";
import Chart from "./chart.vue";
import Log from "./logs.vue";
import ChartCard from "./chart-card";
import ChartDescribe from "./chart-describe";

import common from "@cloudpivot/common/pc";
import { workflowApi, workflow } from "@cloudpivot/api";
import Store from '@/store/index';

@Component({
  name: "workflow-track",
  components: {
    BaseInfo,
    Chart,
    Log,
    PageLoading: common.components.PageLoading,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane
  }
})
export default class FormWorkflowTrack extends mixins(WorkflowMixin) {

  @Prop({
    default: {}
  })
  baseInfo !: workflow.InstanceBaseInfo; // 流程跟踪基础信息

  @Prop({
    default: {}
  })
  chart!: workflow.Chart; // 流程图

  @Prop({
    default: []
  })
  logs !: workflow.WorkflowTrackLog[]; // 审批日志

  record: workflow.WorkflowTrackLog[] = [];

  @Prop({
    default: true
  })
  loading !: boolean;

  @Prop({
    default: ""
  })
  workflowInstanceId!: string; // 流程实例Id

  // @Prop({
  //   default: ""
  // })
  // workItemId!: string; // 流程Id

  i18n: any = {};


  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  param: any =null;
  currentLine : any=null;
  currentRect: any =null;


  //监听模态框状态

  @Watch("$store.state.motalflag")
  getPiedata(newVal:any,oldVal:any) {
    const flag= newVal;
    if(typeof flag === 'boolean' && flag){
      if(!this.param)return;
      clearTimeout(this.param); //清除定时器
      this.param=null;
      return flag;
    }
    if(flag === false && this.currentRect && this.currentLine){
      const rect= this.currentRect;
      const line= this.currentLine;
      ChartDescribe({ rect, type: 'leave', line, estimate: true })
    }
  }

  mounted() {
    this.i18n = {
      receiverTime: `${this.$t('cloudpivot.flow.pc.ReceiveTime')}:`,
      finishTime: `${this.$t('cloudpivot.flow.pc.FinishTimes')}:`,
      predictor: `${this.$t('cloudpivot.flow.pc.Predictor')}`,
      assist: `${this.$t('cloudpivot.flow.pc.Assist')}`,
      addWorkitem: `${this.$t('cloudpivot.flow.pc.AddWorkitem')}`,
      circulate: `${this.$t('cloudpivot.flow.pc.Circulate')}`,
      forward: `${this.$t('cloudpivot.flow.pc.Forward')}`,
      nothing: `${this.$t('cloudpivot.flow.pc.Nothing')}`,
      trust: `${this.$t('cloudpivot.flow.pc.trust2')}`,
    };
  }


  /**
   * 流程点击回调
   * @params activity 流程原型数据
   * @params e        触发的Element Event
   */
  async clickActivity(activity: any, e: MouseEvent) {
    // 系统活动、开始、结束节点暂不生成chartCard
    if (activity.activityType === 'SYSTEM_ACTIVITY' || activity.activityType === 'START' || activity.activityType === 'END') {
      return;
    }
    this.record = [];
    const rect: DOMRect = (e.currentTarget as HTMLElement).getBoundingClientRect() as DOMRect;
    this.record = this.logs.filter(
      (log: workflow.WorkflowTrackLog) => log.activityCode === activity.activityCode
    );
    if (this.record && this.record.length) {
      ChartCard({ record: this.record.reverse(), rect, fn: this.goSubWorkflowForm, i18n: this.i18n, statusFn: this.chartCardStatus });
    } else {
      const res: any = await workflowApi.getActivityPreprocessors({
        workflowInstanceId: this.workflowInstanceId,
        activityCode: activity.activityCode
      });
      if (!res.errcode) {
        ChartCard({ record: res.data, rect, estimate: true, i18n: this.i18n, statusFn: this.chartCardStatus });
      }
    }
  }

  async overLine(line: any, e: MouseEvent) {
    // debugger
    const rect: DOMRect = (e.currentTarget as HTMLElement).getBoundingClientRect() as DOMRect;
    ChartDescribe({ rect, type: 'over', line, estimate: true })
  }

  async leaveLine (line: any, e: MouseEvent) {
    // debugger
    const rect: DOMRect = (e.currentTarget as HTMLElement).getBoundingClientRect() as DOMRect;
      if(!this.param){
      this.currentLine=line;
      this.currentRect=rect;
    }
     this.param=setTimeout(()=>{
      ChartDescribe({ rect, type: 'leave', line, estimate: true })
    },750)

  }

  /**
   * 打开子流程表单
   */
  goSubWorkflowForm(log: any) {
    this.$router.push({
      name: "form-detail",
      query: {
        workflowInstanceId: log.subWorkflowInstanceId,
        workitemId: log.subWorkItemId,
        return: `${location.pathname + location.search}`
      }
    }).catch((err: any) => {err});
  }

  // ChartCard状态多语言
  chartCardStatus(value: any, type: string) {
    if (type === 'subInstance') {
      return this.getSubWorkflowActionStatus(value);
    } else {
      return this.getWorkflowActionStatus(value);
    }
  }

}
</script>
<style lang="less">
.ant-popover-inner {
  box-shadow: 0 2px 8px 0 rgba(30, 85, 255, 0.15);
}
</style>
<style lang="less">
@import "../style.less";

.form-track {
  .main {
    flex:none!important;
    display: flex;
    flex-direction: column;
    position: relative;
    height:calc(100vh - 64px);
    .version {
      padding-right: 2px;
      font-size:12px;
      line-height: 20px;
      text-align: right;
      color: rgba(0,0,0,0.45);
    }
    > .content {
      padding: 35px 0 100px;
      align-self: center;
      height: auto;
      width: @layout-min-width !important;
    }
  }
  &__tabs {
    margin-top: @base4-padding-sm;
  }
}
</style>
