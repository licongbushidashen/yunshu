<template>
  <div class="content-box">
    <h2 class="top-opt"><span style="width:50px" @click="goBack">返回</span></h2>
    <div class="content-top">
      <h2>历史运行流程</h2>
      <div class="tabs">
        <div
          class="tab"
          v-for="tab in tabs"
          :key="tab.key"
          :class="tab.key === curTab ? 'active' : ''"
          @click="tabChange(tab.key)"
        >
          {{ tab.name }}
        </div>
      </div>
      <div class="content-top-right-box">
        <a-tooltip v-if="queryConditionSource.length <= 1">
          <template slot="title">
            筛选
          </template>
          <i
            class="icon aufontAll  h-icon-all-filter-o mr"
            :class="{ 'high-light': isShowQueryItem }"
            @click="toggleQuery"
          ></i>
        </a-tooltip>
        <div class="btn" @click="addNewWorkflow">
          新增运行流程
        </div>
      </div>
    </div>
    <div class="spec">
      （注:单条历史运行流程数据仅可保存30天）
    </div>
    <page-loading
      v-model="isLoading"
      shadeColor="#F4F6FC"
      :shadeOpacity="1"
      loadingText="加载中..."
    />
    <div class="table-box" v-if="isShowTableBox">
      <div class="filters-box" v-show="isShowQueryItem">
        <query-workitem
          ref="queryWorkitem"
          :isShowInstanceState="false"
          :isShowOriginator="true"
          :isShowTimeRange="true"
          timeLable=""
          @reset="onReset"
          @search="onSearch"
          @hide="hideQueryItem"
        />
      </div>
      <div class="table" ref="table" style="height:100%">
        <!--  -->
        <a-table
          :scroll="isTrident ? {} : { y: scrollY }"
          :dataSource="tableData"
          :pagination="false"
          :rowKey="(record, index) => index"
          :columns="curTab == 'PROCESSING'? defaultColumns: customColumns"
        >
          <!-- 序号 -->
          <span slot="indexTitle" class="resize resize-first">序号</span>
          <template slot="index" slot-scope="text">
            <span class="middle default-color">{{ text }}</span>
          </template>

          <!-- 流程名称 -->
          <span slot="instanceNameTitle" class="resize">流程名称</span>
          <template slot="instanceName" slot-scope="text, record">
            <span
              class="fake-btn text-ellipsis workflow-hover default-color"
              @click.stop="openDetail(record)"
              v-html="text"
              :title="record.instanceName"
            ></span>
          </template>
          <!-- 流程模板 -->
          <span slot="workflowNameTitle" class="resize">流程模板</span>
          <template slot="workflowName" slot-scope="text, record">
            <span
              :class="record.isRead ? 'gray text-ellipsis default-color' : 'text-ellipsis default-color'"
              :title="text"
            >{{ text }}</span
            >
          </template>
          <!-- 当前处理人 -->
          <span slot="participantNameTitle" class="resize">当前处理人</span>
          <template slot="participantName" slot-scope="text, record">
            <span class="default-color">{{ record.participants.name }}</span>
          </template>
          <!-- 已用时 -->
          <span slot="stayTimeTitle" class="resize">已用时</span>
          <template slot="stayTime" slot-scope="stayTime">
            <span class="default-color">{{ dateProcess(stayTime) }}</span>
          </template>
          <!-- 流程状态 -->
          <span slot="stateTitle" class="resize">流程状态</span>
          <template slot="state" slot-scope="status">
            <span class="default-color">{{ parseWorkflowProcess(status) }}</span>
          </template>
          <!-- 发起人 -->
          <span slot="originatorNameTitle" class="resize">发起人</span>
          <template slot="originatorName" slot-scope="text">
            <span class="text-ellipsis fake-btn default-color" v-html="text"></span>
          </template>
          <!-- 发起时间 -->
          <span slot="startTimeTitle" class="resize">发起时间</span>
          <template slot="startTime" slot-scope="text">
            <span class="default-color" v-html="text"></span>
          </template>
        </a-table>
      </div>
      <div class="pagination-box">
        <a-pagination
          :current="queryParams.page + 1"
          :total="queryParams.total"
          :pageSize="queryParams.size"
          :showTotal="(total) => '共' + total + '条'"
          @change="pageChange"
        />
      </div>
    </div>

    <!-- 流程运行弹窗 -->
    <StartWorkflow v-model="isShowRunModal" :rules="workflowResult.rules" :activities="workflowResult.activities"/>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import filterCard from '@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue';
import common from '@cloudpivot/common/pc';
import QueryWorkitem from '@/components/shared/query-condition/query-workitem.vue';
import StartWorkflow from '@/components/global/workflow-mock/modals/start-workflow.vue';

import WorkflowApi from '@/apis/workflow';
import * as WorkflowProcessTypes from '@/typings/workflow';
import DateHandle from '@cloudpivot/common/src/utils/date';

@Component({
  name: 'mock-history-workflow',
  components: {
    filterCard: filterCard,
    QueryWorkitem,
    PageLoading: common.components.PageLoading,
    PageLoadFail: common.components.LoadFail,
    StartWorkflow
  },
})
export default class MockHistoryWorkflow extends Vue {
  tabs = [
    {
      name: '进行中',
      key: 'PROCESSING', //,EXCEPTION,DRAFT
    },
    {
      name: '已完成',
      key: 'COMPLETED',
    },
    {
      name: '已作废',
      key: 'CANCELED',
    },
  ];
  queryConditionSource: any = [];
  isShowQueryItem = false;
  curTab = 'PROCESSING';
  isLoading: boolean = false; // 是否显示加载中
  isShowTableBox: boolean = true;
  isShowRunModal:boolean = false;
  workflowResult:any = {};
  queryParams = {
    workflowName: '',
    workflowCode: '',
    startTime: '',
    endTime: '',
    simulative: true,
    instanceState: 'PROCESSING',
    page: 0,
    size: 20,
    total: 0,
  };
  scrollY = 0;
  defaultColumns: any = [
    {
      // 序号
      slots: { title: 'indexTitle' },
      dataIndex: 'index',
      width: 80,
      align: 'center',
      scopedSlots: { customRender: 'index' },
    },
    {
      // 流程名称
      dataIndex: 'instanceName',
      width: 296,
      slots: { title: 'instanceNameTitle' },
      scopedSlots: { customRender: 'instanceName' },
    },
    {
      // 流程模板
      dataIndex: 'workflowName',
      width: 130,
      slots: { title: 'workflowNameTitle' },
      scopedSlots: { customRender: 'workflowName' },
    },
    {
      // 当前处理人
      dataIndex: 'participants',
      width: 130,
      slots: { title: 'participantNameTitle' },
      scopedSlots: { customRender: 'participantName' },
    },
    {
      // 已用时
      width: 180,
      dataIndex: 'stayTime',
      slots: { title: 'stayTimeTitle' },
      scopedSlots: { customRender: 'stayTime' },
    },
    {
      // 流程状态
      width: 130,
      dataIndex: 'state',
      slots: { title: 'stateTitle' },
      scopedSlots: { customRender: 'state' },
    },
    {
      // 发起人
      dataIndex: 'originatorName',
      width: 130,
      slots: { title: 'originatorNameTitle' },
      scopedSlots: { customRender: 'originatorName' },
    },
    {
      // 发起时间
      width: 180,
      dataIndex: 'startTime',
      slots: { title: 'startTimeTitle' },
      scopedSlots: { customRender: 'startTime' },
    },
  ];
  customColumns: any = [
    {
      // 序号
      slots: { title: 'indexTitle' },
      dataIndex: 'index',
      width: 80,
      align: 'center',
      scopedSlots: { customRender: 'index' },
    },
    {
      // 流程名称
      dataIndex: 'instanceName',
      width: 296,
      slots: { title: 'instanceNameTitle' },
      scopedSlots: { customRender: 'instanceName' },
    },
    {
      // 流程模板
      dataIndex: 'workflowName',
      width: 130,
      slots: { title: 'workflowNameTitle' },
      scopedSlots: { customRender: 'workflowName' },
    },
    // {
    //   // 当前处理人
    //   dataIndex: 'participants',
    //   width: 130,
    //   slots: { title: 'participantNameTitle' },
    //   scopedSlots: { customRender: 'participantName' },
    // },
    {
      // 已用时
      width: 180,
      dataIndex: 'stayTime',
      slots: { title: 'stayTimeTitle' },
      scopedSlots: { customRender: 'stayTime' },
    },
    {
      // 流程状态
      width: 130,
      dataIndex: 'state',
      slots: { title: 'stateTitle' },
      scopedSlots: { customRender: 'state' },
    },
    {
      // 发起人
      dataIndex: 'originatorName',
      width: 130,
      slots: { title: 'originatorNameTitle' },
      scopedSlots: { customRender: 'originatorName' },
    },
    {
     // 发起时间
      width: 180,
      dataIndex: 'startTime',
      slots: { title: 'startTimeTitle' },
      scopedSlots: { customRender: 'startTime' },
    },
  ];
  tableData = [];
  created() {
    let { workflowCode } = this.$route.params;
    this.queryParams.workflowCode = workflowCode;
    this.getTableData();
    this.setTableScrollY();
    //this.parseWorkflowProcess()
  }
  getTableData() {
    this.isLoading = true;
    this.$nextTick(() => {
      (document.querySelector('.ant-table-body') as HTMLElement).scrollTop = 0;
    });
    WorkflowApi.getMockHistoryWorkflow(this.queryParams).then((res: any) => {
      this.isLoading = false;
      let { data, errcode } = res;
      if (errcode === 0) {
        this.queryParams.total = data.totalElements;
        this.tableData = data.content.map((item: any, index: number) => {
          item['index'] = index + 1;
          return item;
        });
      } else {
        this.$message.error(res.errmsg);
        this.tableData = [];
        this.queryParams.total = 0;
      }
    });
  }
  goBack() {
    this.$router.back();
  }
  toggleQuery() {
    this.isShowQueryItem = !this.isShowQueryItem;
  }
  onSearch(params) {
    let { workflowName, workflowCode, endTime, startTime } = params;
    this.queryParams['workflowName'] = workflowName;
    this.queryParams['workflowCode'] = workflowCode;
    this.queryParams['endTime'] = endTime;
    this.queryParams['startTime'] = startTime;
    this.getTableData();
    this.hideQueryItem();
  }
  onReset() {
    this.queryConditionSource = [];
    this.resetParams();
    this.getTableData();
    this.hideQueryItem();
  }

  dateProcess(timestamp) {
    return DateHandle.timeTranslate(timestamp);
  }
  get isTrident() {
    return window.navigator.userAgent.indexOf('Trident') !== -1;
  }
  setTableScrollY() {
    this.$nextTick(() => {
      let clientHeight = (document.querySelector('.table-box') as HTMLElement)
        .clientHeight;
      console.log(clientHeight, 'clientHeight---->');
      this.scrollY = clientHeight + 30;
      if (this.isTrident) {
        (document.querySelector(
          '.ant-table-body'
        ) as HTMLElement).style.overflow = 'scroll';
        (document.querySelector(
          '.ant-table-body'
        ) as HTMLElement).style.maxHeight = this.scrollY + 'px';
      }
    });
  }
  parseWorkflowProcess(status) {
    const workflowInstanceState = WorkflowProcessTypes.WorkflowInstanceState;
    let label = '';
    switch (status) {
      case workflowInstanceState.CANCELED:
        label = '已作废';
        break;
      case workflowInstanceState.COMPLETED:
        label = '已完成';
        break;
      case workflowInstanceState.DRAFT:
        label = '草稿';
        break;
      case workflowInstanceState.EXCEPTION:
        label = '异常';
        break;
      case workflowInstanceState.PROCESSING:
        label = '进行中';
        break;
      default:
        label = '--';
    }
    return label;
  }
  resetParams() {
    let { workflowCode } = this.$route.params;
    this.queryParams = {
      // instanceState 需要保持当前状态
      workflowName: '',
      workflowCode: workflowCode,
      startTime: '',
      endTime: '',
      simulative: true,
      instanceState: this.queryParams.instanceState,
      page: 0,
      size: 20,
      total: 0,
    };
  }
  hideQueryItem() {
    if (this.isShowQueryItem) {
      this.isShowQueryItem = false;
    }
  }
  pageChange(page) {
    this.queryParams['page'] = page - 1;
    this.getTableData();

  }
  openDetail(obj: any) {
    const { appCode, bizSchemaCode, workflowCode } = this.$route.params;
    this.$router.push({
      name: 'mockDetail',
      params: {
        appCode,
        bizSchemaCode,
        workflowCode,
      },
      query: {
        workflowInstanceId: obj.id,
        workflowMock: 'true',
      },
    }).catch((err: any) => {err});
    // window.open(href, '_blank');
  }

  addNewWorkflow() {
    const { workflowCode } = this.$route.params;
    // const { href } = this.$router.resolve({
    //   name: 'mockForm',
    //   params: {
    //     appCode,
    //     bizSchemaCode,
    //     workflowCode,
    //   },
    //   query: {
    //     startWorkflowCode: workflowCode,
    //     workflowMock: 'true',
    //     firstPage: 'true',
    //   },
    // });
    // window.open(href, '_blank');
    WorkflowApi.getWorkflowDraft({ workflowCode }).then((res:any) => {
      if (res.errcode === 0 && res.data) {
        this.workflowResult = res.data;
        this.isShowRunModal = true;
      } else {
        this.$message.error('获取模拟流程数据失败！');
      }
    });
  }
  tabChange(key) {
    this.curTab = key;
    this.resetParams();
    this.queryParams.instanceState = key;
    this.getTableData();
  }
}
</script>
<style lang="less" scoped>
.aufontAll{
  color: rgba(0, 0, 0, 0.65);
}
.content-box {
  overflow-y: hidden;
  .top-opt {
    height: 64px;
    box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.1);
    span {
      color: #17bc94;
      cursor: pointer;
      font-size: 18px;
      margin-left: 24px;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
  .content-top {
    height: 64px;
    display: flex;
    //margin-bottom: 16px;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    h2 {
      color: rgba(0, 0, 0, 0.85);
      font-size: @font-size-18;
      font-weight: 600;
    }
    .tabs {
      flex-grow: 1;
      margin-left: 40px;
      flex: 1;
      display: flex;
      .tab {
        padding: @base4-padding-base @base4-padding-md;
        border-radius: @border-radius-base*4;
        margin-right: 8px;
        font-size: @font-size-14;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.65);
      }
      .active {
        background-color: @primary-color;
        color: @white-background;
      }
    }
    .content-top-right-box {
      display: flex;
      align-items: center;
      justify-content: center;
      .h-icon-all-filter-o {
        font-size: @font-size-18;
        cursor: pointer;
      }
      .btn {
        font-size: @font-size-14;
        width: 116px;
        height: @line-height-3;
        text-align: center;
        line-height: @line-height-3;
        color: @white-background;
        background-color: @primary-color;
        margin-left: 16px;
        border-radius: @border-radius-base;
        cursor: pointer;
      }
    }
  }
  .spec{
    color:rgba(0,0,0,0.65);
    font-size: 14px;
    margin-left: 16px;
    margin-bottom: 8px;
  }
  .page-loading {
    top: 155px;
  }
  .table-box {
    padding: 0 @base4-padding-lg;
    margin-bottom: 10px;
    height: calc(100% - 230px);
    position: relative;
    .resize{
      font-weight: 600;
      color:rgba(0,0,0,0.85);
    }
    /deep/ .ant-table-header {
      overflow: hidden;
    }
    /deep/ .ant-empty-image {
      display: none;
    }
    /deep/ .ant-table-thead > tr > th,
    /deep/ .ant-table-tbody > tr > td {
      padding: 0 @base4-padding-md;
      height: @line-height-2;
    }
    .filters-box {
      position: absolute;
      top: -30px;
      left: 0px;
      width: 100%;
      height: @line-height-base;
      z-index: 99;
    }
    .default-color{
      color:rgba(0,0,0,0.85);
    }
    .workflow-hover {
      &:hover {
        color: @primary-color;
        cursor: pointer;
      }
    }
    .pagination-box {
      text-align: right;
      margin-top: 8px;
    }
  }
}
</style>
