<template>
  <div class="workitem-box my-workflow" ref="workItem">
    <!-- <div class="content-top">
      <h2>{{ $t("cloudpivot.flowCenter.pc.instanceSearch") }}</h2>
      <div class="tabs">
        <div
          class="tab-btn"
          v-for="(tab, index) in tabs"
          :key="index"
          :class="tab.key === curKey ? 'active' : ''"
          @click="tabChange(tab.key)"
        >
          {{ tab.name }}
        </div>
      </div>
      <div class="content-top-right-box">
        <filterCard
          @clear="clear('tab')"
          v-if="queryConditionSource.length === 1"
          :source="queryConditionSource"
        />
        <filterCard
          class="mr"
          @item-click="toggleQuery"
          @clear="clear('tab')"
          v-else-if="queryConditionSource.length > 1"
          :source="queryConditionSource"
        />
        <a-tooltip v-if="queryConditionSource.length <= 1">
          <template slot="title">{{
            $t("cloudpivot.list.pc.Screen")
          }}</template>
          <i
            class="icon aufontAll h-icon-all-filter-o mr"
            :class="{ 'high-light': isShowQueryItem }"
            @click="toggleQuery"
          ></i>
        </a-tooltip>
        <a-button
          :disabled="!deleteDisable"
          @click="deleteDelegation"
          v-if="instanceState === 'CANCELED'"
          >{{ $t("cloudpivot.flowCenter.pc.delete") }}</a-button
        >

        <a-button
          :disabled="batchOperationAndMaintenanceDisable"
          @click="batchOperationAndMaintenance"
          v-if="instanceState==='PROCESSING'"
          >
          {{ $t('cloudpivot.flowCenter.pc.BatchOperationAndMaintenance') }}
        </a-button>
      </div>
    </div> -->

    <PageLoading v-model="isLoading" shadeColor="#F4F6FC" :shadeOpacity="1" />

    <div class="table-box" v-if="isShowTableBox">
      <div
        :class="
          $i18n.locale === 'zh' ? 'my-workflow-tabs' : 'my-workflow-tabs en'
        "
      >
        <div class="table-tab" ref="table">
          <!-- 全部 -->
          <div v-if="curKey === ''">
            <tab-table
              ref="tabTable"
              tabType="instance"
              :timeLable="$t('cloudpivot.flowCenter.pc.initiationTime')"
              v-if="isShowTableBox && instanceState === ''"
              :instanceState="'ALL'"
              :isShowInstanceState="false"
              :isShowOriginator="true"
              :resetFields="isResetFields"
              :columns="allColumns"
              :dataSource="tableData"
              :scrollY="scrollY"
              :isShowLoadAll="isShowLoadAll"
              :isShowNoData="isShowNoData"
              :isShowSearchNoData="isShowSearchNoData"
              :isShowQueryItem="isShowQueryItem"
              :isShowSequenceNo="false"
              @onReset="onReset"
              @onSearch="onSearch"
              @hide="hideQueryItem"
              :vm="this"
            ></tab-table>
          </div>

          <!-- 进行中 -->
          <div v-if="curKey === 'PROCESSING'">
            <tab-table
              tabType="instance"
              ref="tabTable"
              :timeLable="$t('cloudpivot.flowCenter.pc.initiationTime')"
              v-if="isShowTableBox && instanceState === 'PROCESSING'"
              :resetFields="isResetFields"
              :instanceState="'PROCESSING'"
              :isShowInstanceState="false"
              :isShowOriginator="true"
              :columns="processingColumns"
              :dataSource="tableData"
              :scrollY="scrollY"
              :isShowLoadAll="isShowLoadAll"
              :isShowNoData="isShowNoData"
              :isShowSearchNoData="isShowSearchNoData"
              :isShowQueryItem="isShowQueryItem"
              :isShowSequenceNo="false"
              :isShowWorkFlowNode="true"
              :isShowParticipantId="true"
              @onReset="onReset"
              @onSearch="onSearch"
              @hide="hideQueryItem"
              :vm="this"
            ></tab-table>
          </div>

          <!-- 已完成 -->
          <div v-if="curKey === 'COMPLETED'">
            <tab-table
              ref="tabTable"
              tabType="instance"
              :timeLable="$t('cloudpivot.flowCenter.pc.initiationTime')"
              v-if="isShowTableBox && instanceState === 'COMPLETED'"
              :instanceState="'COMPLETED'"
              :resetFields="isResetFields"
              :isShowInstanceState="false"
              :isShowOriginator="true"
              :columns="completedColumns"
              :dataSource="tableData"
              :scrollY="scrollY"
              :isShowLoadAll="isShowLoadAll"
              :isShowNoData="isShowNoData"
              :isShowSearchNoData="isShowSearchNoData"
              :isShowQueryItem="isShowQueryItem"
              :isShowSequenceNo="false"
              @onReset="onReset"
              @onSearch="onSearch"
              @hide="hideQueryItem"
              :vm="this"
            ></tab-table>
          </div>

          <!-- 已作废 -->
          <div v-if="curKey === 'CANCELED'">
            <tab-table
              tabType="instance"
              ref="tabTable"
              :timeLable="$t('cloudpivot.flowCenter.pc.cancelTime')"
              v-if="isShowTableBox && instanceState === 'CANCELED'"
              :instanceState="'CANCELED'"
              :resetFields="isResetFields"
              :isShowInstanceState="false"
              :isShowOriginator="true"
              :columns="canceledColumns"
              :dataSource="tableData"
              :scrollY="scrollY"
              :isShowLoadAll="isShowLoadAll"
              :isShowNoData="isShowNoData"
              :isShowSearchNoData="isShowSearchNoData"
              :isShowQueryItem="isShowQueryItem"
              :isShowSequenceNo="false"
              @onReset="onReset"
              @onSearch="onSearch"
              @hide="hideQueryItem"
              :vm="this"
            ></tab-table>
          </div>

          <!-- 流程异常 -->
          <div v-if="curKey === 'EXCEPTION'">
            <tab-table
              tabType="instance"
              ref="tabTable"
              :timeLable="$t('cloudpivot.flowCenter.pc.initiationTime')"
              v-if="isShowTableBox && instanceState === 'EXCEPTION'"
              :resetFields="isResetFields"
              :isShowInstanceState="false"
              :instanceState="'EXCEPTION'"
              :isShowOriginator="true"
              :columns="exceptionColumns"
              :dataSource="tableData"
              :scrollY="scrollY"
              :isShowLoadAll="isShowLoadAll"
              :isShowNoData="isShowNoData"
              :isShowSearchNoData="isShowSearchNoData"
              :isShowQueryItem="isShowQueryItem"
              :isShowSequenceNo="false"
              @onReset="onReset"
              @onSearch="onSearch"
              @hide="hideQueryItem"
              :vm="this"
            ></tab-table>
          </div>

          <!-- 草稿 -->
          <!-- <a-tab-pane tab="草稿" key="DRAFT">
            <tab-table
              timeLable="发起时间"
              :isShowInstanceState="false"
              :isShowOriginator="true"
              :columns="draftColumns"
              :dataSource="tableData"
              :scrollY="scrollY"
              @onReset="onReset"
              @onSearch="onSearch"
            ></tab-table>
          </a-tab-pane>-->
        </div>

        <div class="pagination-box">
          <a-pagination
            :total="total"
            :showTotal="
              total => $t('cloudpivot.flowCenter.pc.total', { num: total })
            "
            :current="curPage"
            :pageSize="pageSize"
            :pageSizeOptions="pageSizeOptions"
            showSizeChanger
            showQuickJumper
            @change="onPaginationChange"
            @showSizeChange="onSizeChange"
          />
        </div>
      </div>
    </div>

    <div class="load-fail-box">
      <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload" />
    </div>

    <div class="iframe-shadow" v-if="showIframeForm"></div>
    <transition name="fade-down">
      <div v-if="showIframeForm" class="iframe-form-warp">
        <div class="icon-close" @click="showIframeForm = false">
          <!-- <span><a-icon type="close" /></span> -->
          <span class="icon aufontAll">&#xe996;</span>
        </div>
        <iframe
          ref="iframe"
          class="iframe-form-warp--page"
          :src="IframeFormUrl"
        ></iframe>
      </div>
    </transition>

    <!-- <batchOperationAndMaintenance :data="checkedListData" v-model="batchOperationVisible" /> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Table, Pagination, Button, Icon, Tooltip } from "@h3/antd-vue";
import { mixins } from "vue-class-component";
// import batchOperationAndMaintenance from '@cloudpivot/flow-center/src/components/pc/components/batchOperationAndMaintenance.vue';

import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
  workflowApi
} from "@cloudpivot/api";

import * as WorkflowCenterTypes from "@cloudpivot/flow-center/src/components/pc/typings/workflow-center";

import * as utils from "@cloudpivot/common/src/utils/pc/utils";

import filterCard from "@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue";

import WorkItemMixin from "@cloudpivot/flow-center/src/components/pc/mixins/workitem";
import * as Helper from "@cloudpivot/flow-center/src/components/pc/helper/helper";

import QueryWorkitem from "@cloudpivot/flow-center/src/components/pc/components/query-condition/query-workitem.vue";

import TabTable from "@cloudpivot/flow-center/src/components/pc/components/tab-table.vue";

import common from "@cloudpivot/common/pc";

import Store from "@/store/index";

@Component({
  name: "query-instance",
  components: {
    filterCard: filterCard,
    AButton: Button,
    AIcon: Icon,
    ATable: Table,
    APagination: Pagination,
    ATooltip: Tooltip,
    QueryWorkitem,
    TabTable,
    PageLoading: common.components.PageLoading,
    PageLoadFail: common.components.LoadFail
    // batchOperationAndMaintenance
  }
})
export default class QueryInstance extends mixins(WorkItemMixin) {
  /**
   * 自定义表格的列
   */
  @Prop() tableAllColumns!: any;
  @Prop() tableProcessingColumns!: any;
  @Prop() tableCompletedColumns!: any;
  @Prop() tableCanceledColumns!: any;
  @Prop() tableExceptionColumns!: any;
  // @Prop() tableDraftColumns!: any;

  searchParams: workflowCenterParams.ListInstancesParams = {
    workflowName: "",
    workflowCode: "",
    startTime: "",
    endTime: "",
    originator: "",
    unitType: ""
  };

  batchOperationVisible: boolean = false;
  // 批量运维
  batchOperationAndMaintenance() {
    this.batchOperationVisible = true;
  }
  get batchOperationAndMaintenanceDisable() {
    return this.checkedListData.length === 0;
  }
  get checkedListData() {
    return this.tableData.filter(el => el.checked);
  }

  instanceState: string = ""; // 流程实例状态

  isResetFields: boolean = false;

  defaultAllColumns: any = [
    {
      dataIndex: "index",
      width: 80,
      align: "center",
      hSlot: "indexTitle"
    },
    {
      dataIndex: "instanceName",
      width: 220,
      hSlot: "instanceNameTitle",
      bSlot: "instanceName"
    },
    {
      dataIndex: "workflowName",
      width: 130,
      hSlot: "workflowNameTitle",
      bSlot: "workflowName"
    },
    {
      dataIndex: "sequenceNo",
      width: 130,
      hSlot: "sequenceNoTitle",
      bSlot: "sequenceNo"
    },
    {
      dataIndex: "startTime",
      width: 180,
      hSlot: "startTimeTitle"
    },
    {
      dataIndex: "originatorName",
      width: 130,
      hSlot: "originatorNameTitle",
      bSlot: "originatorName"
    },
    {
      dataIndex: "departmentName",
      width: 130,
      hSlot: "departmentNameTitle",
      bSlot: "originatorName"
    },
    {
      dataIndex: "stateTxt",
      width: 130,
      hSlot: "stateTitle",
      bSlot: "stateTxt"
    }
  ];

  defaultProcessingColumns: any = [
    {
      dataIndex: "index",
      width: 80,
      align: "center",
      hSlot: "indexTitle",
      bSlot: "index"
    },
    {
      dataIndex: "instanceName",
      width: 220,
      hSlot: "instanceNameTitle",
      bSlot: "instanceName"
    },
    {
      dataIndex: "workflowName",
      width: 130,
      hSlot: "workflowNameTitle",
      bSlot: "workflowName"
    },
    {
      dataIndex: "sequenceNo",
      width: 130,
      hSlot: "sequenceNoTitle",
      bSlot: "sequenceNo"
    },
    {
      dataIndex: "participants",
      width: 130,
      hSlot: "participantNameTitle",
      bSlot: "participantName"
    },
    {
      dataIndex: "stayTime",
      width: 180,
      hSlot: "stayTimeTitle"
    },
    {
      dataIndex: "startTime",
      width: 180,
      hSlot: "startTimeTitle"
    },
    {
      dataIndex: "originatorName",
      hSlot: "originatorNameTitle",
      bSlot: "originatorName",
      width: 130
    }
  ];

  defaultCompletedColumns: any = [
    {
      dataIndex: "index",
      width: 80,
      align: "center",
      hSlot: "indexTitle"
    },
    {
      dataIndex: "instanceName",
      width: 296,
      hSlot: "instanceNameTitle",
      bSlot: "instanceName"
    },
    {
      dataIndex: "workflowName",
      width: 130,
      hSlot: "workflowNameTitle",
      bSlot: "workflowName"
    },
    {
      dataIndex: "sequenceNo",
      width: 130,
      hSlot: "sequenceNoTitle",
      bSlot: "sequenceNo"
    },
    {
      dataIndex: "startTime",
      width: 180,
      hSlot: "startTimeTitle"
    },
    {
      dataIndex: "finishTime",
      width: 180,
      hSlot: "finishedTimeTitle"
    },
    {
      dataIndex: "costTime",
      width: 180,
      hSlot: "costTimeTitle"
    },
    {
      dataIndex: "originatorName",
      hSlot: "originatorNameTitle",
      bSlot: "originatorName",
      width: 130
    }
  ];

  defaultCanceledColumns: any = [
    {
      dataIndex: "index",
      width: 80,
      align: "center",
      hSlot: "indexTitle",
      bSlot: "index"
    },
    {
      dataIndex: "instanceName",
      width: 220,
      hSlot: "instanceNameTitle",
      bSlot: "instanceName"
    },
    {
      dataIndex: "workflowName",
      width: 130,
      hSlot: "workflowNameTitle",
      bSlot: "workflowName"
    },
    {
      dataIndex: "sequenceNo",
      width: 130,
      hSlot: "sequenceNoTitle",
      bSlot: "sequenceNo"
    },
    {
      dataIndex: "startTime",
      width: 180,
      hSlot: "startTimeTitle"
    },
    {
      dataIndex: "finishTime",
      width: 180,
      hSlot: "cancellationTime"
    },
    {
      dataIndex: "originatorName",
      width: 180,
      hSlot: "originatorNameTitle",
      bSlot: "originatorName"
    },
    {
      dataIndex: "departmentName",
      bSlot: "departmentName",
      width: 180,
      hSlot: "departmentNameTitle"
    }
  ];

  defaultExceptionColumns: any = [
    {
      dataIndex: "index",
      width: 80,
      align: "center",
      hSlot: "indexTitle"
    },
    {
      dataIndex: "instanceName",
      width: 220,
      hSlot: "instanceNameTitle",
      bSlot: "instanceName"
    },
    {
      dataIndex: "workflowName",
      width: 130,
      hSlot: "workflowNameTitle",
      bSlot: "workflowName"
    },
    {
      dataIndex: "sequenceNo",
      width: 130,
      hSlot: "sequenceNoTitle",
      bSlot: "sequenceNo"
    },
    {
      dataIndex: "stayTime",
      width: 180,
      hSlot: "stayTimeTitle"
    },
    {
      dataIndex: "startTime",
      width: 180,
      hSlot: "startTimeTitle"
    },
    {
      dataIndex: "originatorName",
      hSlot: "originatorNameTitle",
      bSlot: "originatorName",
      width: 130
    }
  ];

  // 所有tab按钮
  tabs: Array<any> = [];

  curKey: string = "";

  get allColumns() {
    if (this.tableAllColumns) {
      return this.tableAllColumns;
    }
    return this.defaultAllColumns;
  }

  get deleteDisable() {
    return this.tableData.some((d: any) => d.checked);
  }

  get processingColumns() {
    if (this.tableProcessingColumns) {
      return this.tableProcessingColumns;
    }
    return this.defaultProcessingColumns;
  }

  get completedColumns() {
    if (this.tableCompletedColumns) {
      return this.tableCompletedColumns;
    }
    return this.defaultCompletedColumns;
  }

  get canceledColumns() {
    console.log(this.tableCanceledColumns);
    if (this.tableCanceledColumns) {
      return this.tableCanceledColumns;
    }
    return this.defaultCanceledColumns;
  }

  get exceptionColumns() {
    if (this.tableExceptionColumns) {
      return this.tableExceptionColumns;
    }
    return this.defaultExceptionColumns;
  }

  mounted() {
    this.setTabBtns();
    this.curKey = this.tabs[1].key;
    setTimeout(() => {
      if (localStorage.getItem("temp")) {
        let tempArr = JSON.parse(localStorage.getItem("temp") || "[]");
        tempArr.forEach(item => {
          // @ts-ignore
          if (item.id === Store.state.System.System.loginedUserInfo.id) {
            this.searchParams = item.d;
          }
        });
        const vals: any = this.dataTranslateToFilterCard(
          this.searchParams,
          "myReadWorkItem"
        );
        this.queryConditionSource = vals;
      } else if (localStorage.getItem("daily")) {
        let dailyArr = JSON.parse(localStorage.getItem("daily") || "[]");
        dailyArr.forEach(item => {
          // @ts-ignore
          if (item.id === Store.state.System.System.loginedUserInfo.id) {
            this.searchParams = item.d;
          }
        });
        const vals: any = this.dataTranslateToFilterCard(
          this.searchParams,
          "myReadWorkItem"
        );
        this.queryConditionSource = vals;
      }
      this.listInstances();
    }, 500);

    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener("message", this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.data === "close") {
      this.showIframeForm = false;
      this.IframeFormUrl = "";
      this.listInstances();
      return;
    }
    if (event.source === window) return;
    if (
      event.data.indexOf("/workflow-center/query-instance") !== -1 ||
      event.data.indexOf("%2Fworkflow-center%2Fquery-instance") !== -1
    ) {
      this.showIframeForm = false;
      this.IframeFormUrl = "";
      this.listInstances();
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener("message", this.reloadMessage, false);
  }

  /**
   * 设置tab按钮
   */
  setTabBtns() {
    this.tabs = [
      {
        name: this.$t("cloudpivot.flowCenter.pc.all"),
        key: ""
      },
      {
        name: this.$t("cloudpivot.flowCenter.pc.processing"),
        key: "PROCESSING"
      },
      {
        name: this.$t("cloudpivot.flowCenter.pc.completed"),
        key: "COMPLETED"
      },
      {
        name: this.$t("cloudpivot.flowCenter.pc.canceled"),
        key: "CANCELED"
      },
      {
        name: this.$t("cloudpivot.flowCenter.pc.exception"),
        key: "EXCEPTION"
      }
    ];
  }

  /*
   * tab页栏切换
   */
  tabChange(key: any) {
    this.queryConditionSource = [];
    this.curKey = key;
    this.curPage = 1;
    this.pageSize = 20;
    this.isResetFields = true;
    this.instanceState = key;
    this.resetParams();
    this.listInstances();

    setTimeout(() => {
      this.isResetFields = false;
    }, 100);
  }

  /*
   * 分页改变
   */
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.listInstances("pageChange");
  }

  /*
   * 分页pageSize改变
   */
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.listInstances("pageChange");
  }

  /*
   * 重置查询参数
   */
  resetParams() {
    this.searchParams = {
      workflowName: "",
      workflowCode: "",
      unitType: "",
      startTime: "",
      endTime: "",
      originator: ""
    };
  }

  /*
   * 查询条件重置事件
   */
  onReset() {
    this.queryConditionSource = [];
    this.curPage = 1;
    this.resetParams();
    this.listInstances();
  }

  /*
   * 查询条件搜索事件
   */
  onSearch(params: workflowCenterParams.ListInstancesParams) {
    let type: string = "";
    if (
      this.curKey === "PROCESSING" ||
      this.curKey === "" ||
      this.curKey === "COMPLETED" ||
      this.curKey === "EXCEPTION"
    ) {
      type = "processing";
    } else {
      type = "canceled";
    }
    const vals: any = this.dataTranslateToFilterCard(params, type);
    this.queryConditionSource = vals;

    this.curPage = 1;
    this.searchParams = {
      ...params
    };
    this.listInstances("search");
  }

  /*
   * 重新加载
   */
  reload() {
    this.listInstances();
  }

  i18nHandle(item: any) {
    switch (item.state) {
      case WorkflowCenterTypes.WorkflowInstanceState.DRAFT:
        item.stateTxt = this.$t("cloudpivot.flowCenter.pc.workflowState.draft");
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.PROCESSING:
        item.stateTxt = this.$t(
          "cloudpivot.flowCenter.pc.workflowState.processing"
        );
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.COMPLETED:
        item.stateTxt = this.$t(
          "cloudpivot.flowCenter.pc.workflowState.completed"
        );
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.EXCEPTION:
        item.stateTxt = this.$t(
          "cloudpivot.flowCenter.pc.workflowState.exception"
        );
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.CANCELED:
        item.stateTxt = this.$t(
          "cloudpivot.flowCenter.pc.workflowState.canceled"
        );
        break;
    }
    return item;
  }

  /*
   * 获取流程实例列表
   */
  async listInstances(type?: string) {
    const params = {
      ...this.searchParams,

      page: this.curPage - 1,
      size: this.pageSize
    };

    // 数据处理函数
    this.dataHandler = (data: any) => {
      data.forEach((item: any, index: number) => {
        item.index = index + 1;
        item.key = index;
        item.checked = false;
        item.hover = false;
        item.departmentName = Helper.departmentNameTranslator(
          item.departmentName
        );

        item.startTime = Helper.removeSeconds(item.startTime);
        item.finishTime = Helper.removeSeconds(item.finishTime);
        item.costTime = Helper.timeTranslate(item.costTime);
        item.stayTime = Helper.timeTranslate(item.stayTime);
        // item.state = Helper.workflowStateTranslator(item.state);

        item = this.i18nHandle(item);

        // 设置高亮
        item.instanceName = utils.searchHighLight(
          this.searchParams.workflowName,
          item.instanceName
        );

        // 国际化兼容
        item = utils.compatible(item, "workflowName");
      });
      return data;
    };

    this.isLoading = true;
    const res: any = await workflowCenterApi.listInstances(params);
    this.commonHandler(res, type);
  }

  @Watch("$i18n.locale")
  onLanguageChange() {
    this.tableData.forEach((item: any) => {
      item = this.i18nHandle(item);
    });
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
    this.setTabBtns();
  }

  /*
   * 已作废批量删除
   */
  deleteDelegation(record?: any) {
    const vm: any = this;
    const _ids: any = [];
    if (record.id) {
      _ids.push(record.id);
    } else {
      this.tableData.forEach((data: any) => {
        if (data.checked) {
          _ids.push(data.id);
        }
      });
    }
    this.$confirm({
      title: `是否确定删除${_ids.length}条作废流程`,
      okText: vm.$t("cloudpivot.flowCenter.pc.ok").toString(),
      cancelText: vm.$t("cloudpivot.flowCenter.pc.cancel").toString(),
      onOk() {
        workflowCenterApi
          .deleteCanceledWorkflowInstances(_ids)
          .then((res: any) => {
            if (res.errcode) {
              vm.$message.error(
                `${vm.$t("cloudpivot.flowCenter.pc.deleteFailed")}`
              );
              return;
            }

            vm.$message.success(
              `${vm.$t("cloudpivot.flowCenter.pc.deleteSuccess")}`
            );
            vm.listInstances();
          });
      }
    });
  }
}
</script>

<style lang="less" scoped>
@import "./style/index.less";
.my-workflow {
  .table-box {
    padding: 0;
    .table-tab {
      height: 100%;
      max-height: calc(100% - 58px);
      &::after {
        content: "*";
        font-size: 0;
        display: block;
        clear: both;
      }
      &.has-pager {
        max-height: calc(100% - 16px);
      }
    }
    /deep/.my-workflow-tabs {
      height: 100%;
      .ant-tabs-nav-container {
        height: 48px;
        .ant-tabs-tab:first-child {
          margin-left: @base4-padding-md;
        }
        .ant-tabs-tab {
          margin-right: 0;
          border: 1px solid @dark-color-1;
          border-bottom: 0;
          background: @dark-color-1;
          transition: none;
          width: 88px;
          line-height: 46px;
          text-align: center;
        }
        .ant-tabs-tab-active {
          font-weight: @font-weight-md;
          color: @primary-color;
          border: 1px solid #e8e8e8;
          &::after {
            content: "";
            position: absolute;
            height: 0;
            width: 100%;
            top: 0;
            left: 0;
            border-top: 2px solid @primary-color;
          }
        }
      }
      .table {
        margin-top: 0;
      }
      &.en {
        .ant-tabs-tab {
          width: 110px;
        }
      }
    }
  }
}
</style>
