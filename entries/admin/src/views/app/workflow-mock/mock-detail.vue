<template>
  <div class="mock-detail">
    <div class="mock-detail-header">
      <div class="back"><span v-if="showBack" @click="back">返回</span></div>
      <div class="mock-detail-header_actions">
        <!-- <a-button class="mock-action" @click="loadData">撤回</a-button> -->
        <a-button 
          class="mock-action" 
          v-if="showBtn"
          @click="cancel">作废</a-button>
        <a-button class="mock-action" @click="deleteForm">删除</a-button>
      </div>
    </div>
    <div class="mock-detail-content">
      <div class="content">
        <!-- 基本信息 -->
        <BaseInfo
          :baseInfo="baseInfo"
          :workflowInstanceId="workflowInstanceId"
        ></BaseInfo>
        <!-- 流程图 -->
        <div class="workflow-chart-header">
          <span>流程图</span>
          <div class="mock-chart">
            <div class="mock-chart-item">
              <i class="mock-chart__finish"></i>
              <span>已办节点</span>
            </div>
            <div class="mock-chart-item">
              <i class="mock-chart__processing"></i>
              <span>进行中节点</span>
            </div>
            <div class="mock-chart-item">
              <i class="mock-chart__wrong"></i>
              <span>异常节点</span>
            </div>
            <div class="mock-chart-item">
              <i class="mock-chart__default"></i>
              <span>未开始节点</span>
            </div>
          </div>
        </div>
        <div class="workflow-chart-content">
          <Chart
            v-if="chart && chart.activities"
            :chart="chart"
            :workflowStatus="baseInfo.status"
            @clickActivity="clickActivity"
            @getFullScreen="getFullScreen"
            :hideStatus="true"
            bgColor="#FAFAFA"
            wrapContainClass=".workflow-chart-content"
            scrollContainClass=".mock-detail-content"
          />
        </div>
        <!-- 审批记录 -->
        <div class="log-header">
          <span>审批记录</span>
        </div>
        <Log :logs="logs"></Log>
      </div>
    </div>
    <reject-modal
      v-model="showRejectModal"
      :list="rejectActivityInfo.list"
      :record="rejectActivityInfo.record"
      @rejectAction="rejectHandle"
    ></reject-modal>

    <!-- 提示弹窗 -->
    <a-modal
      v-model="showTipModal"
      class="mock-tip-modal"
      :width="440"
      :closable="false"
    >
      <div class="tip-content">
        <i class="icon aufontAll h-icon-all-exclamation-circle"></i>
        <div>当前你处于流程模拟运行模式下，点击流程图节点可快速审批</div>
      </div>
      <template slot="footer">
        <div class="no-tips">
          <a-checkbox class="check" v-model="noMoreTips"></a-checkbox>不再提示
        </div>
        <a-button
          type="primary"
          @click="tipCancel"
        >知道了</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator';
import BaseInfo from '@/components/global/workflow-mock/base-info.vue';
import flow from '@cloudpivot/flow/pc';
import ChartCard from '@/components/shared/chart-card';
import RejectModal from '@/components/global/workflow-mock/modals/reject-modal.vue';

import { workflowCenterApi, workflowApi, workflow } from '@cloudpivot/api';

import WorkflowApi from '@/apis/workflow';

@Component({
  name: 'MockDetail',
  components: {
    Chart: flow.components.WorkflowChart,
    Log: flow.components.WorkflowLogs,
    BaseInfo,
    RejectModal,
  },
})
export default class MockDetail extends Vue {
  workflowInstanceId: string = '';

  baseInfo: workflow.InstanceBaseInfo = {}; // 流程基础信息

  chart: workflow.Chart = {}; // 流程图

  logs: workflow.WorkflowTrackLog[] = []; // 审批日志

  maxLoadTime: number = 0; // 轮询最大加载次数50

  timer: any = null;

  showRejectModal = false;

  rejectActivityInfo: any = {}; //可驳回的节点列表

  isFullScreen: boolean = false; // 流程图是否全屏

  showTipModal:any = false;

  noMoreTips:boolean = false;

  processNodeDialogDisable: boolean = true;

  @Provide()
  getProcessNodeDialogDisable() {
    return this.processNodeDialogDisable;
  }

  get showBack() {
    return !(this.$route.query as any).firstPage;
  }

  get showBtn() {
    return this.baseInfo && this.baseInfo.status !== 'CANCELED';
  }

  created() {
    this.workflowInstanceId = (this.$route.query as any).workflowInstanceId;
    window.addEventListener('message', this.reloadMessage, false);
    this.loadData();
    const noMore = window.localStorage.getItem('workflow-mock-tips');
    if (!noMore && this.showBack) {
      this.showTipModal = true;
    }
  }

  reloadMessage(event: any) {
    if (event.source === window) return;
    this.loadData();
  }

  destroyed() {
    window.removeEventListener('message', this.reloadMessage, false);
  }

  loadData() {
    // 模拟数据
    // 获取流程基本信息
    this.getBaseInfo(true);
    // 获取流程图数据
    this.chart = {};
    this.isFullScreen = false;
    workflowApi
      .getWorkflowChart({ workflowInstanceId: this.workflowInstanceId })
      .then((res: any) => {
        if (res.errcode === 0 && res.data) {
          this.chart = res.data || {};
        }
      });
    // 获取流程审批日志
    workflowApi
      .getWorkflowLogs({ workflowInstanceId: this.workflowInstanceId })
      .then((res: any) => {
        if (res.errcode === 0 && res.data) {
          this.logs = res.data.reverse() || [];
        }
      });
  }

  getBaseInfo(setData?: boolean) {
    workflowApi
      .getWorkflowBaseInfo({ workflowInstanceId: this.workflowInstanceId })
      .then((res: any) => {
        if (res.errcode === 0 && res.data) {
          if (setData) {
            this.baseInfo = res.data || {};
          }
          if (this.baseInfo.runMode !== 'AUTO') {
            return;
          }
          // 运行模式为自动，轮询查询流程状态
          if (
            !['COMPLETED', 'CANCELED', 'EXCEPTION'].includes(res.data.status) &&
            this.maxLoadTime < 50
          ) {
            clearTimeout(this.timer);
            this.maxLoadTime += 1;
            this.timer = setTimeout(() => {
              this.getBaseInfo();
            }, 3000);
          } else if (!setData) {
            this.loadData();
          }
        }
      });
  }

  /*
   * 获取流程图全屏状态
   */
  getFullScreen(fullScreen: boolean) {
    this.isFullScreen = fullScreen;
  }

  /* 
  * 流程模拟运行详情提示窗关闭
  */
 tipCancel() {
   this.showTipModal = false;
   if (this.noMoreTips) {
     window.localStorage.setItem('workflow-mock-tips', 'true');
   }
 }

  /*
   * 返回
   */
  back() {
    this.$router.back();
  }

  /**
   * 撤回
   */
  retrieve() {
    const params: any = {
      workflowInstanceId: this.workflowInstanceId,
      activityCode: '',
      workItemId: '',
    };
    workflowApi.revokeWorkItem(params).then((res) => {
      this.$message.success('撤回成功', 3);
      // todo
    });
  }

  /**
   * 作废
   */
  cancel() {
    const vm: any = this;
    vm.$confirm({
      title: '确定要作废该流程吗？',
      content: '作废流程后将停止流转',
      okText: vm.$t('languages.Apps.Ok').toString(),
      cancelText: vm.$t('languages.Apps.Cancel').toString(),
      onOk() {
        workflowApi.abortInstance(vm.workflowInstanceId, '', 0).then((res: any) => {
          if (res.errcode === 0) {
            vm.backWorkflowDesign();
          } else {
            vm.$message.error(res.errmsg);
          }
        });
      },
    });
  }

  /**
   * 删除
   */
  deleteForm() {
    const vm: any = this;
    vm.$confirm({
      title: '确定要删除该流程吗？',
      icon: 'close-circle',
      class: 'detail-delete-icon',
      okText: vm.$t('languages.Apps.Ok').toString(),
      cancelText: vm.$t('languages.Apps.Cancel').toString(),
      onOk() {
        workflowApi.deleteInstance(vm.workflowInstanceId, '', 0).then((res: any) => {
          if (res.errcode === 0) {
            vm.backWorkflowDesign();
          } else if (res.errcode === 550006) {
            const msg = '校验数据不存在！';
            vm.$message.error(msg);
          } else {
            vm.$message.error(res.errmsg);
          }
        });
      },
    });
  }

  /*
   * 返回流程设计页面
   */
  backWorkflowDesign() {
    const { href } = this.$router.resolve({
      name: 'workflowDesign',
      params: {
        appCode: this.$route.params.appCode,
        bizSchemaCode: this.$route.params.bizSchemaCode,
        workflowCode: this.$route.params.workflowCode,
      },
    });
    window.location.href = href;
  }

  /**
   * 流程点击回调
   * @params activity 流程原型数据
   * @params e        触发的Element Event
   */
  async clickActivity(activity: any, e: MouseEvent) {
    const rect: DOMRect = (e.currentTarget as HTMLElement).getBoundingClientRect() as DOMRect;
    if (['START', 'END'].includes(activity.activityType)) return;
    if (this.checkWorkflowErr(activity)) {
      // 先检测是否有流程异常逻辑
      return this.getInstanceErrLog().then((data: any) => {
        data && this.flowErrDialog(activity, rect, data);
      });
      // 流程异常逻辑
    }
    let processAndExceptionNode = this.logs.filter((item: any) => {
      const subInstanceCondition = // 子流程已完成和进行中都展示
        item.activityCode === activity.activityCode &&
        (item.workItemStatus === 2 || item.workItemStatus === 3) &&
        activity.activityType === 'SUB_INSTANCE';
      const condition = // 其他流程只有进行中才展示
        item.activityCode === activity.activityCode && item.workItemStatus === 2;
      if (subInstanceCondition) return true;
      else if (condition) return true;
    });
    if (!processAndExceptionNode || !processAndExceptionNode.length) return; // 没有活动节点
    let startNextActivityCode = null; // 开始节点的下一个节点
    (this.chart as any).rules.some((item: any) => {
      if (
        (this.chart as any).activities[0].activityCode === item.preActivityCode
      ) {
        startNextActivityCode = item.postActivityCode;
        return true;
      }
      return false;
    });
    if (activity.activityCode === startNextActivityCode) {
      // 流程开始节点弹框
      this.initialNodeDialog(activity, rect);
    } else if (activity.activityType === 'SUB_INSTANCE') {
      //子流程弹框
      this.subInstanceNodeDialog(activity, rect);
    } else if (activity.activityType === 'CIRCULATE') {
      // 传阅节点弹框
      this.circulateNodeDialog(activity, rect);
    } else {
      // 流程进行中的弹框
      this.processNodeDialog(activity, rect);
    }
  }
  rejectHandle(params) {
    WorkflowApi.rejectWorkItem({
      ...params,
      workflowInstanceId: this.workflowInstanceId,
    }).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success('操作成功');
        setTimeout(()=>{
          this.loadData();//间隔500保证后台异步流程处理完
        },500)
        
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }
  initialNodeDialog(activity: any, rect: DOMRect) {
    //启动节点,开始节点的下一个节点
    this.getMockTaskListByActivity(activity.activityCode).then((data: any) => {
      if (!data) return;
      ChartCard(
        {
          data,
          rect,
          title: activity.activityName,
          cardType: 'initial',
        },
        this.nodeProcess
      );
    });
  }
  subInstanceNodeDialog(activity: any, rect: DOMRect) {
    this.getMockTaskListByActivity(activity.activityCode).then((data: any) => {
      if (!data) return;
      // 子流程弹框
      ChartCard(
        {
          data,
          title: activity.activityName,
          rect,
          cardType: 'subInstance',
        }
        //this.nodeProcess
      );
    });
  }
  flowErrDialog(activity: any, rect: DOMRect, data) {
    ChartCard(
      {
        data: { summary: data.summary, detail: data.detail },
        title: activity.activityName,
        rect,
        cardType: 'flowErr',
      }
      //this.nodeProcess
    );
  }
  processNodeDialog(activity: any, rect: DOMRect) {
    this.processNodeDialogDisable = false;
    this.getMockTaskListByActivity(activity.activityCode).then((data: any) => {
      if (!data) return;
      // 进行中的节点可能是传阅过来的节点
      let isCiculateNode = false;
      data.some((item: any) => {
        if (item.activityCode === activity.activityCode && item.circulate) {
          isCiculateNode = true;
        }
        return isCiculateNode;
      });
      this.processNodeDialogDisable = true;
      if (isCiculateNode) {
        ChartCard(
          {
            data,
            title: activity.activityName,
            rect,
            cardType: 'circulate',
          },
          this.nodeProcess
        );
      } else {
        ChartCard(
          {
            data,
            title: activity.activityName,
            rect,
            cardType: 'processing',
          },
          this.nodeProcess
        );
      }
    });
  }
  circulateNodeDialog(activity: any, rect: DOMRect) {
    this.getMockTaskListByActivity(activity.activityCode).then((data: any) => {
      if (!data) return;
      ChartCard(
        {
          data,
          title: activity.activityName,
          rect,
          cardType: 'circulate',
        },
        this.nodeProcess
      );
    });
  }
  getMockTaskListByActivity(activityCode: string) {
    // TODO mock logic start
    // TODO mock logic end
    return WorkflowApi.getMockTaskList({
      activityCode,
      workflowInstanceId: this.workflowInstanceId,
    }).then((res: any) => {
      if (res.errcode === 0) {
        return res.data;
      } else {
        this.$message.error(res.errmsg);
        return '';
      }
    });
  }
  /**
   * 节点弹出框处理逻辑
   * @params type 按钮类型
   * @params record 对应的行数据
   */
  nodeProcess({ type, record }, cb?: any) {
    let _context = this as any; // reject eslint check
    // 同意 不同意 传阅 每条数据操作完后需要继续在弹框操作
    if (type === 'more') {
      // 跳到mockForm
      const { appCode, bizSchemaCode, workflowCode } = this.$route.params;
      const { href } = this.$router.resolve({
        name: 'mockForm',
        params: {
          appCode,
          bizSchemaCode,
          workflowCode,
        },
        query: {
          workflowInstanceId: record.instanceId,
          workitemId: record.id,
          return: `${location.hash}`,
          workflowMock: 'true',
          hideBtn: 'true',
        },
      });
      window.open(href, '_blank');
    } else if (type === 'approve' || type === 'submit' || type === 'disagree') {
      // submit approve 都是同意
      WorkflowApi.submitMockData({
        agree: type === 'disagree' ? false : true,
        taskId: record.id,
      }).then((res: any) => {
        if (res.errcode === 0) {
          // setTimeout(() => {
          //   _context.loadData();
          // }, 100);
          _context.loadBaseInfo(record.activityCode).then((obj: any) => {
            if (obj) {
              cb('', { isFlowNext: !obj.flag, fullScreen: this.isFullScreen });
              _context.loadData();
            }
          });
          this.$message.success('操作成功');
        } else {
          cb('error',{isFlowNext: false,fullScreen: false});
          this.$message.error(res.errmsg);
        }
      });
    } else if (type === 'circulate') {
      workflowCenterApi
        .updateCirculateReaded({
          circulateItemIds: [record.id],
        })
        .then((res) => {
          if (res.errcode === 0) {
            // setTimeout(() => {
            //   _context.loadData();
            // }, 100);
            _context.loadBaseInfo(record.activityCode).then((obj: any) => {
              if (obj) {
                cb('', {
                  isFlowNext: false, // 传阅节点保持当前状态,坑爹
                  fullScreen: this.isFullScreen,
                });
                _context.loadData();
              }
            });
            this.$message.success('操作成功');
          } else {
            cb('error',{isFlowNext: false,fullScreen: false});
            this.$message.error(res.errmsg as string);
          }
        });
    } else if (type === 'reject') {
      WorkflowApi.getRejectActivity({
        workflowInstanceId: this.workflowInstanceId,
        activityCode: record.activityCode,
      }).then((res: any) => {
        if (res.errcode === 0) {
          this.rejectActivityInfo = { list: res.data, record };
          this.showRejectModal = true;
        } else {
          this.$message.error(res.errmsg);
        }
      });
    }
  }
  checkWorkflowErr(activity: any) {
    // 判断当前节点是否是异常节点
    const activityStatus = this.chart.activityStatus as any;
    let flag = false;
    activityStatus.some((item: any) => {
      if (activity.activityCode === item.activityCode && item.status === 2) {
        // 异常节点
        flag = true;
      }
      return flag;
    });
    return flag;
  }
  getInstanceErrLog() {
    //查询指定流程实例的异常日志
    return  workflowApi.getWorkflowInstanceErrInfo(this.workflowInstanceId).then(
      (res: any) => {
        if (res.errcode === 0) {
          return res.data;
        } else {
          this.$message.error(res.errmsg);
          return '';
        }
      }
    );
  }
  loadBaseInfo(activityCode: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        workflowApi
          .getWorkflowBaseInfo({ workflowInstanceId: this.workflowInstanceId })
          .then((res: any) => {
            if (res.errcode === 0) {
              let participants = res.data.participants;
              let flag = false;
              participants.some((item: any) => {
                if (item.activityCode === activityCode) {
                  flag = true;
                }
                return flag;
              });
              resolve({ flag }); // 判断当前节点是否是流程中的处理中的节点
            }
            resolve('');
          });
      }, 500);
    });
  }
}
</script>

<style lang="less" scoped>
@finish-bg-color: rgba(0, 255, 156, 0.1);
@finish-border-color: rgba(23, 188, 148, 0.5);

@process-bg-color: rgba(64, 41, 255, 0.08);
@process-border-color: rgba(64, 41, 255, 1);

@wrong-bg-color: rgba(245, 34, 45, 0.08);
@wrong-border-color: rgba(245, 34, 45, 1);

@default-border-color: rgba(217, 217, 217, 1);
.mock-detail {
  display: flex;
  flex-direction: column;
  min-width: 1024px;
  &-header {
    display: flex;
    flex: 0 0 64px;
    width: 100%;
    padding: 0 24px;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.1);
    z-index: 99;
    .back {
      font-size: 18px;
      color: @primary-color;
      cursor: pointer;
    }
    &_actions {
      display: flex;
      margin-left: 16px;
      text-align: right;
      .mock-action {
        margin-left: 8px;
      }
    }
  }
  &-content {
    flex: none !important;
    display: flex;
    flex-direction: column;
    position: relative;
    height: calc(100vh - 128px);
    overflow: auto;
    & > .content {
      padding: 24px 24px 100px;
      align-self: center;
      height: auto;
      width: 1024px !important;
      .workflow-chart-header {
        height: 56px;
        line-height: 56px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        & > span {
          font-size: 18px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.85);
        }
      }
      .log-header {
        height: 56px;
        line-height: 56px;
        margin-top: 8px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        & > span {
          font-size: 18px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.85);
        }
      }
    }
  }
  .mock-chart {
    display: flex;
    text-align: right;
    &-item {
      display: flex;
      align-items: center;
      margin-left: 24px;
      i {
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: 8px;
        border-radius: 2px;
      }
      span {
        flex: 1 1;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
      }
    }
    &__finish {
      background-color: @finish-bg-color;
      border: 1px solid @finish-border-color !important;
    }
    &__wrong {
      background-color: @wrong-bg-color;
      border: 1px solid @wrong-border-color !important;
    }
    &__processing {
      background-color: @process-bg-color;
      border: 1px solid @process-border-color !important;
    }
    &__default {
      border: 1px solid @default-border-color !important;
    }
  }
}
</style>

<style lang="less">
.detail-delete-icon {
  .ant-modal-confirm-body {
    i.anticon {
      color: #f4454e !important;
    }
  }
}
.mock-tip-modal{
  .tip-content{
    display: flex;
    margin: 8px;
    i{
      font-size: 22px;
      color: #FAAD14;
      margin-right: 16px;
      vertical-align: top;
      &:hover{
        color: #FAAD14;
      }
    }
    &>div{
      font-size: 16px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .ant-modal-footer{
    border-top: none;
    padding: 24px;
    .no-tips{
      display: inline-block;
      color: rgba(0,0,0,0.65);
      font-size: 14px;
      margin-right: 16px;
      .check{
        margin-right: 8px;
      }
    }
  }
}
</style>
