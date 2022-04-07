<template>
  <div id="MyUnfinishedWorkItem" class="workitem-box" ref="workItem">
    <div class="content-top">
      <h2>
        {{ $t("cloudpivot.flowCenter.pc.todoList") }}
        <!-- <span
          class="toggle-batch"
          v-if="mode === 'standalone'"
          @click="toggleMode"
          >{{ $t("cloudpivot.flowCenter.pc.toggleBatch") }}</span
        >
        <span
          class="toggle-batch"
          v-if="mode === 'batch'"
          @click="toggleMode"
          >{{ $t("cloudpivot.flowCenter.pc.toggleStandalone") }}</span
        > -->
        <p>
          <span @click="listTypeChange('all')" :class="{'active': listType === 'all'}">{{ $t("cloudpivot.flowCenter.pc.all") }}</span>
          <span @click="listTypeChange('transfer')" :class="{'active': listType === 'transfer'}">{{ $t("cloudpivot.flowCenter.pc.systemTransfer") }}</span>
        </p>
      </h2>
      <div class="content-right">
        <!-- 批量同意 -->
        <a-button
          v-if="mode == 'batch'"
          :disabled="!batchDisable"
          @click="batchDialog('batchInfo')"
        >
          {{ $t("cloudpivot.flowCenter.pc.batchAgree") }}
        </a-button>

        <!-- 批量转办 -->
        <a-button
          style="margin-left: 8px;"
          v-if="mode == 'batch' && listType === 'transfer'"
          :disabled="!batchDisable"
          @click="showBatchTransfer = true"
        >
          {{ $t("cloudpivot.flowCenter.pc.batchTransfer") }}
        </a-button>

        <a-button
          class="search-input"
          v-if="originate"
          type="primary"
          @click="startWorkflow"
          >{{ $t("cloudpivot.flowCenter.pc.startFlow") }}</a-button
        >
        <filterCard
          @clear="clear"
          v-if="queryConditionSource.length === 1"
          :source="queryConditionSource"
        />
        <filterCard
          class="mr"
          @item-click="toggleQuery"
          @clear="clear"
          v-else-if="queryConditionSource.length > 1"
          :source="queryConditionSource"
        />
        <a-tooltip v-if="queryConditionSource.length <= 1">
          <template slot="title">
            {{ $t("cloudpivot.list.pc.Screen") }}
          </template>
          <i
            class="icon aufontAll  h-icon-all-filter-o mr"
            :class="{ 'high-light': isShowQueryItem }"
            @click="toggleQuery"
          ></i>
        </a-tooltip>
        <div @click="toggleMode" class="toggle-mode-icon">
          <a-tooltip :arrowPointAtCenter="true">
            <template slot="title">
              {{ $t("cloudpivot.flowCenter.pc.toggleBatch") }}
            </template>
            <i
              class="icon aufontAll h-icon-all-Batch-processing-2 batch-icon"
              :class="mode == 'batch' ? 'batch-mode' : 'single-mode'"
            ></i>
          </a-tooltip>
          <span class="batch-tip-mask" v-if="mode == 'batch'"></span>
        </div>
      </div>
    </div>

    <PageLoading
      v-model="isLoading"
      shadeColor="#F4F6FC"
      :shadeOpacity="1"
      :loadingText="
        mode == 'batch' ? $t('cloudpivot.flowCenter.pc.batchWaiting') : ''
      "
    />

    <div class="table-box" v-if="isShowTableBox">
      <div class="filters-box" v-show="isShowQueryItem">
        <query-workitem
          ref="queryWorkitem"
          :isShowInstanceState="false"
          :isShowOriginator="true"
          :isShowActivityName="true"
          :isShowParticipant="true"
          :isShowTimeRange="false"
          :timeLable="$t('cloudpivot.flowCenter.pc.reciveTime')"
          @reset="onReset"
          @search="onSearch"
          @hide="hideQueryItem"
        />
      </div>
      <!-- <div class="search-result" v-if="searchNumber >= 0">{{ $t('cloudpivot.flowCenter.pc.searchRzt') }} <span>{{ searchNumber }}</span> {{ $t('cloudpivot.flowCenter.pc.items') }}</div> -->
      <div class="table" ref="table">
        <common-table
          v-if="mode === 'standalone'"
          :dataSource="tableData"
          :minTableWidth="1060"
          :columns="columns"
        >
          <!-- 序号 单个-->
          <span style="text-align: center; display: block;" slot="indexTitle">{{
            $t("cloudpivot.flowCenter.pc.orderNuber")
          }}</span>
          <span style="text-align: center; display: block;" slot="orderNumber" slot-scope="{text, record}">
            <img
              class="delegation-icon"
              v-if="record.beTrust && !record.currentTrustor"
              src="./assets/icons/entrusted.png"
            />
            <span :class="record.isRead ? 'gray middle' : 'middle'">{{
              text
            }}</span>
          </span>

          <!-- 流程名称 -->
          <span slot="instanceNameTitle">{{
            $t("cloudpivot.flowCenter.pc.flowName")
          }}</span>
          <template slot="instanceName" slot-scope="{text, record}">
            <span
              :class="
                record.isRead
                  ? 'gray fake-btn text-ellipsis'
                  : 'fake-btn text-ellipsis'
              "
              @click="openDetail(record)"
              v-html="text"
              :title="delHtmlTag(record.instanceName)"
            ></span>
          </template>

          <!-- 模板名称 -->
          <span slot="workflowNameTitle">
            {{ $t("cloudpivot.flowCenter.pc.flowTemplate") }}
          </span>
          <template slot="workflowName" slot-scope="{text, record}">
            <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
          </template>

          <!-- 单据号 -->
          <span slot="sequenceNoTitle" >
            {{ $t("cloudpivot.flowCenter.pc.sequenceNo") }}
          </span>
          <template slot="sequenceNo" slot-scope="{text, record}">
            <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
          </template>

          <!-- 当前节点 -->
          <span slot="activityNameTitle">{{
            $t("cloudpivot.flowCenter.pc.curActivity")
          }}</span>
          <template slot="activityName" slot-scope="{text, record}">
            <span
              v-if="isChinese"
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
              >{{ text }}</span
            >
            <span
              v-else
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
              >{{ record.name_i18n[$i18n.locale] }}</span
            >
          </template>

          <!-- 停留时间 -->
          <span slot="stayTimeTitle">{{
            $t("cloudpivot.flowCenter.pc.stayTime")
          }}</span>
          <template slot="stayTime" slot-scope="{text, record}">
            <span :class="record.isRead ? 'gray' : ''" 
              :title="record.time"
              >{{ record.time
              }}<span
                v-if="
                  record.workItemTimeoutStatus === 'RED' ||
                    record.workItemTimeoutStatus === 'ORANGE'
                "
                >{{ $t("cloudpivot.flowCenter.pc.timeOutAfter") }}</span
              >
            </span>
            <span class="deadline-tip">
              <i class="overtime beUrged" v-if="record.urgeCount > 0">{{
                $t("cloudpivot.flowCenter.pc.beUrged")
              }}</i>
              <i
                class="overtime"
                v-if="record.workItemTimeoutStatus === 'TIMEOUT'"
                >{{ $t("cloudpivot.flowCenter.pc.timeout") }}</i
              >
              <img
                v-else-if="record.workItemTimeoutStatus === 'RED'"
                class="overtime-icon"
                src="./assets/icons/warning01.png"
              />
              <img
                v-else-if="record.workItemTimeoutStatus === 'ORANGE'"
                class="overtime-icon"
                src="./assets/icons/warning02.png"
              />
            </span>
          </template>

          <!-- 发起人 -->
          <span slot="originatorNameTitle">{{
            $t("cloudpivot.flowCenter.pc.originatorName")
          }}</span>
          <template slot="originatorName" slot-scope="{text, record}">
            <span
              :class="
                record.isRead
                  ? 'gray fake-btn text-ellipsis'
                  : 'fake-btn text-ellipsis'
              "
              @click.stop="showDrawer(record.originator)"
              v-html="text"
            ></span>
          </template>

          <!-- 发起人组织 -->
          <span slot="departmentNameTitle">{{
            $t("cloudpivot.flowCenter.pc.departmentName")
          }}</span>
          <template slot="departmentName" slot-scope="{text, record}">
            <span
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
              :title="text"
              >{{ text }}</span
            >
          </template>
          <!-- 处理人 -->
          <span slot="resolverTitle">{{
            $t("cloudpivot.flowCenter.pc.resolver")
          }}</span>
          <template slot="participantName" slot-scope="{text, record}">
            <a-tooltip :arrowPointAtCenter="true">
            <template slot="title">
              {{ text }}
            </template>
            <span
              :class="
                record.isRead
                  ? 'gray fake-btn text-ellipsis'
                  : 'fake-btn text-ellipsis'
              "
              @click.stop="showDrawer(record.participant)"
              v-html="text"
            ></span>
          </a-tooltip>
          </template>
        </common-table>
        <common-table
          v-if="mode === 'batch'"
          :dataSource="tableData"
          :minTableWidth="1060"
          :columns="columns"
        >
          <!-- 序号 单个-->
          <!-- <template >
            <span slot="indexTitle" class="resize resize-first" >{{
              $t("cloudpivot.flowCenter.pc.orderNuber")
            }}</span>
            <span slot="orderNumber" slot-scope="{text, record}">
              <img
                class="delegation-icon"
                v-if="record.beTrust && !record.currentTrustor"
                src="./assets/icons/entrusted.png"
              />
              <span :class="record.isRead ? 'gray middle' : 'middle'">{{text}}</span>
            </span>
          </template>   -->
          <!-- 序号批量 -->
          <span slot="indexTitle" style="text-align: center; display: block;">
            <a-checkbox
              @change="selectAll"
              v-model="isSelectAll"
              :disabled="!tableData || !tableData.length"
            ></a-checkbox>
          </span>
          <span
            slot="orderNumber"
            class="index"
            slot-scope="{text, record}"
            @mouseenter="record.hover = true"
            @mouseleave="record.hover = false"
            style="text-align: center; display: block;"
          >
            <a-checkbox
              v-show="record.hover || record.checked"
              v-model="record.checked"
              @change.stop="onItemCheckboxChange"
            ></a-checkbox>
            <img
              v-if="record.beTrust && !record.currentTrustor"
              v-show="!record.hover && !record.checked"
              class="delegation-icon"
              src="./assets/icons/entrusted.png"
            />
            <span class="text" v-show="!record.hover && !record.checked">{{
              text
            }}</span>
          </span>
          <!-- 流程名称 -->
          <span slot="instanceNameTitle" >{{
            $t("cloudpivot.flowCenter.pc.flowName")
          }}</span>
          <template slot="instanceName" slot-scope="{text, record}">
            <span
              :class="
                record.isRead
                  ? 'gray fake-btn text-ellipsis'
                  : 'fake-btn text-ellipsis'
              "
              @click="openDetail(record)"
              v-html="text"
              :title="record.instanceName"
            ></span>
          </template>

          <!-- 模板名称 -->
          <span slot="workflowNameTitle" >
            {{ $t("cloudpivot.flowCenter.pc.flowTemplate") }}
          </span>
          <template slot="workflowName" slot-scope="{text, record}">
            <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
          </template>

          <!-- 当前节点 -->
          <span slot="activityNameTitle">{{
            $t("cloudpivot.flowCenter.pc.curActivity")
          }}</span>
          <template slot="activityName" slot-scope="{text, record}">
            <span
              v-if="isChinese"
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
              >{{ text }}</span
            >
            <span
              v-else
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
              >{{ record.name_i18n[$i18n.locale] }}</span
            >
          </template>

          <!-- 停留时间 -->
          <span slot="stayTimeTitle">{{
            $t("cloudpivot.flowCenter.pc.stayTime")
          }}</span>
          <template slot="stayTime" slot-scope="{text, record}">
            <span :class="record.isRead ? 'gray' : ''"
              >{{ record.time
              }}<span
                v-if="
                  record.workItemTimeoutStatus === 'RED' ||
                    record.workItemTimeoutStatus === 'ORANGE'
                "
                >{{ $t("cloudpivot.flowCenter.pc.timeOutAfter") }}</span
              >
            </span>
            <span class="deadline-tip">
              <i class="overtime beUrged" v-if="record.urgeCount > 0">{{
                $t("cloudpivot.flowCenter.pc.beUrged")
              }}</i>
              <i
                class="overtime"
                v-if="record.workItemTimeoutStatus === 'TIMEOUT'"
                >{{ $t("cloudpivot.flowCenter.pc.timeout") }}</i
              >
              <img
                v-else-if="record.workItemTimeoutStatus === 'RED'"
                class="overtime-icon"
                src="./assets/icons/warning01.png"
              />
              <img
                v-else-if="record.workItemTimeoutStatus === 'ORANGE'"
                class="overtime-icon"
                src="./assets/icons/warning02.png"
              />
            </span>
          </template>

          <!-- 发起人 -->
          <span slot="originatorNameTitle">{{
            $t("cloudpivot.flowCenter.pc.originatorName")
          }}</span>
          <template slot="originatorName" slot-scope="{text, record}">
            <span
              :class="
                record.isRead
                  ? 'gray fake-btn text-ellipsis'
                  : 'fake-btn text-ellipsis'
              "
              @click.stop="showDrawer(record.originator)"
              v-html="text"
            ></span>
          </template>

          <!-- 发起人组织 -->
          <span slot="departmentNameTitle">{{
            $t("cloudpivot.flowCenter.pc.departmentName")
          }}</span>
          <template slot="departmentName" slot-scope="{text, record}">
            <span
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
              :title="text"
              >{{ text }}</span
            >
          </template>
          <!-- 处理人 -->
          <span slot="resolverTitle">{{
            $t("cloudpivot.flowCenter.pc.resolver")
          }}</span>
          <template slot="participantName" slot-scope="{text, record}">
            <span
              :class="
                record.isRead
                  ? 'gray fake-btn text-ellipsis'
                  : 'fake-btn text-ellipsis'
              "
              @click.stop="showDrawer(record.participant)"
              v-html="text"
            ></span>
          </template>
        </common-table>
        <div class="no-data">
          <PageNoData
            v-if="mode === 'standalone'"
            :isShowNoData="isShowNoData"
            :isShowSearchNoData="isShowSearchNoData"
            :tipText="$t('cloudpivot.flowCenter.pc.noDataText')"
          />
          <div v-if="mode === 'batch' && isShowNoData" class="empty-data">
            {{$i18n.locale === 'en' ? 'The to-do list does not contain batch-capable tasks. please switch to' : '待办列表未包含可批量处理的任务，请切换至'}}<span
              class="standalone"
              @click="toggleMode"
              >{{$i18n.locale === 'en' ? ' individual processing mode' : '单一处理模式'}}</span
            >
          </div>
        </div>
      </div>

      <div class="pagination-box">
        <a-pagination
          :current="curPage"
          :total="total"
          :showTotal="
            total => $t('cloudpivot.flowCenter.pc.total', { num: total })
          "
          :pageSize="pageSize"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="onPaginationChange"
          @showSizeChange="onSizeChange"
        />
      </div>
    </div>

    <div class="load-fail-box">
      <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload" />
    </div>

    <common-drawer v-model="isShowDrawer" :data="userInfo" />
    <batch-fail-list
      v-model="showBatchFailListModal"
      :listData="failListData"
      @batchRefresh="conditionReload"
    ></batch-fail-list>

    <batch-info
      v-model="showBatchInfoModal"
      @batchHandle="batchHandle"
    ></batch-info>

    <customPop @OK="transferOK" width="566px" height="auto" :zIndex="100" v-model="showBatchTransfer">
      <template slot="title">批量转办</template>
      <template slot="content">
        <div class="transfer-list">
          <label><font>*</font>转办人员</label>
          <div>
            <StaffSelector
              v-model="transferUser"
              :options="transferUserOptions"
            />
          </div>
        </div>
        <div class="transfer-list">
          <label><font>*</font>转办意见</label>
          <div ><a-textarea placeholder="请输入" :rows="4" v-model="remark"/></div>
        </div>
      </template>
    </customPop>


    <batch-success-info
      v-model="showBatchSuccessModal"
      :successNum="failListData.successNum"
      @batchRefresh="conditionReload"
    ></batch-success-info>


    <div class="iframe-shadow" v-if="showIframeForm"></div>
    <transition name="fade-down">
    <div v-if="showIframeForm" class="iframe-form-warp">
      <div class="icon-close" @click="showIframeForm = false">
        <!-- <span><a-icon type="close" /></span> -->
        <span class="icon aufontAll">&#xe996;</span>
      </div>
      <iframe ref="iframe" class="iframe-form-warp--page" :src="IframeFormUrl"></iframe>
    </div>
    </transition>


  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { mixins } from "vue-class-component";
import customPop from '@cloudpivot/form/src/common/components/customPop.vue'
import formPc from "@cloudpivot/form/src/renderer/components/pc";

import {
  Button,
  Input,
  Pagination,
  Icon,
  Checkbox,
  Tooltip
} from "@h3/antd-vue";

import WorkItemMixin from "./mixins/workitem";
import Store from '@/store/index';
import CommonDrawer from "./components/modals/drawer.vue";
import BatchInfo from "./components/modals/batch-extra-info.vue";
import BatchFailList from "./components/modals/batch-fail-list.vue";
import BatchSuccessInfo from "./components/modals/batch-success-info.vue";
import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams
} from "@cloudpivot/api";

import * as WorkflowCenterNS from "./typings/workflow-center";

import * as WorkflowCenterHelper from "./helper/helper";

import filterCard from "@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue";

import QueryWorkitem from "./components/query-condition/query-workitem.vue";

import * as utils from "@cloudpivot/common/src/utils/pc/utils";

import common from "@cloudpivot/common/pc";

import CommonTable from "./components/common-table/table.vue";
import { ConfigType } from "@h3/antd-vue/types/message";

@Component({
  name: "MyUnfinishedWorkItem",
  components: {
    filterCard: filterCard,
    QueryWorkitem,
    AButton: Button,
    AInputSearch: Input.Search,
    ACheckbox: Checkbox,
    AInput: Input,
    APagination: Pagination,
    ATooltip: Tooltip,
    AIcon: Icon,
    CommonDrawer,
    BatchInfo,
    BatchFailList,
    BatchSuccessInfo,
    PageLoading: common.components.PageLoading,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    CommonTable,
    customPop,
    ATextarea: Input.TextArea,
    StaffSelector: formPc.StaffSelector,
  }
})
export default class MyUnfinishedWorkItem extends mixins(WorkItemMixin) {
  /**
   * 单应用集成属性,集成时不显示title
   */
  @Prop({
    default: true
  })
  showTitle!: boolean;

  /**
   * 单应用集成属性,集成时不显示发起流程按钮
   */
  @Prop({
    default: true
  })
  originate!: boolean;

  /**
   * 单应用集成属性,集成时表格高度
   */
  @Prop() scrollHeight!: number;

  /**
   * 单应用集成属性,单应用appCode
   */
  @Prop() appCode!: string;

  /**
   * 自定义表格的列
   */
  @Prop() tableColumns!: any;

  mode: string = "standalone";

  showBatchTransfer:boolean = false; // 显示批量转办弹窗
  remark:string =  ''; // 转办意见
  transferUser:any[] = []; // 转办人
  transferUserOptions = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  }
  @Watch('showBatchTransfer')
  onShowBatchTransferChange(){
    this.remark = ''
    this.transferUser = []
  }

  async transferOK(){
    if(this.transferUser.length === 0){
      this.$message.error('转办人员不能为空！')
      return
    }
    if(this.remark === ''){
      this.$message.error('转办意见不能为空！')
      return
    }
    let taskIds = [] as any;
    this.tableData.forEach(({ checked, id }) => {
      if (checked) {
        taskIds.push(id);
      }
    });
    const res = await workflowCenterApi.batchForwardWorkItem({
      participantors: this.transferUser.map(el => el.id),
      workItemIds: taskIds,
      comment: this.remark
    })

    if(res.errcode === 0){
      this.$message.success(res.errmsg as string)
      this.showBatchTransfer = false
      this.getUnfinishedWorkflowItems()
    }else{
      this.$message.error(res.errmsg as string)
    }

  }


  listType:string = 'all'; // 列表类型 all: 全部；transfer: 系统转办
  listTypeChange(type){
    this.curPage = 1
    this.listType = type
    this.mode = 'standalone'
    this.getUnfinishedWorkflowItems()
  }


  isSelectAll: boolean = false;
  wd: string = "";
  searchParams: any = {
    workflowName: "",
    workflowCode: "",
    originator: "",
    //workflowTplName:{},
    unitType: undefined,
    appCode: this.appCode
  };
  showBatchInfoModal: boolean = false;
  showBatchFailListModal: boolean = false;
  showBatchSuccessModal: boolean = false;
  failListData: any = {};

  defaultTableColumns: any = [
    {
      dataIndex: "orderNumber",
      width: 80,
      align: "left",
      hSlot: "indexTitle",
      bSlot: "orderNumber",
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
      dataIndex: "activityName",
      width: 130,
      hSlot: "activityNameTitle",
      bSlot: "activityName"
    },
    {
      dataIndex: "stayTime",
      width: 300,
      hSlot: "stayTimeTitle",
      bSlot: "stayTime"
    },
    {
      dataIndex: "originatorName",
      width: 100,
      hSlot: "originatorNameTitle",
      bSlot: "originatorName"
    },
    {
      dataIndex: "departmentName",
      width: 170,
      hSlot: "departmentNameTitle",
      bSlot: "departmentName"
    },
    {
      dataIndex: "participantName",
      width: 100,
      hSlot: "resolverTitle",
      bSlot: "participantName"
    }
  ];

  get scrollYHeight() {
    if (this.scrollHeight) {
      return this.scrollHeight;
    }
    return this.scrollY;
  }

  get columns() {
    if (this.tableColumns) {
      return this.tableColumns;
    }
    return this.defaultTableColumns;
  }

  get rootAdmin() { 
    return this.$store && this.$store.state.System.System.isRootAdmin;
  }

  mounted() {
    localStorage.removeItem('isShowEmailResquest');
    setTimeout(() => {
      if(localStorage.getItem('temp')) {
        let tempArr = JSON.parse(localStorage.getItem('temp') || '[]')
        tempArr.forEach(item => {
          // @ts-ignore
          if(item.id === Store.state.System.System.loginedUserInfo.id) {
            this.searchParams = item.d
          }
        });
        const vals: any = this.dataTranslateToFilterCard(this.searchParams, "myReadWorkItem");
        this.queryConditionSource = vals;
      } else if(localStorage.getItem('daily')) {
        let dailyArr = JSON.parse(localStorage.getItem('daily') || '[]')
        dailyArr.forEach(item => {
          // @ts-ignore
          if(item.id === Store.state.System.System.loginedUserInfo.id) {
            this.searchParams = item.d
          }
        });
        const vals: any = this.dataTranslateToFilterCard(this.searchParams, "myReadWorkItem");
        this.queryConditionSource = vals;
      }
      this.getUnfinishedWorkflowItems();
    },500)
    // window.addEventListener("resize", this.setTableMaxHeight);
    window.addEventListener("message", this.reloadMessage, false);
  }
  onReset() {
    this.queryConditionSource = [];
    this.resetParams();
    this.reload();
    // this.curPage = 1;
    // this.resetParams();
    // this.getMyReadWorkitem();
  }
  resetParams() {
    this.searchParams = {
      workflowName: "",
      workflowCode: "",
      originator: "",
      unitType: undefined,
      appCode: this.appCode
    };
  }
  reloadMessage(event: any) {
    if(event.data === 'close'){
      this.showIframeForm = false
      this.IframeFormUrl = ''
      this.getUnfinishedWorkflowItems()
      return
    }
    if (event.source === window) return;
    if (
      event.data.indexOf("/workflow-center/my-unfinished-workitem") !== -1 ||
      event.data.indexOf("%2Fworkflow-center%2Fmy-unfinished-workitem") !== -1
    ) {
      this.showIframeForm = false
      this.IframeFormUrl = ''
      this.getUnfinishedWorkflowItems();
    }
  }

  destroyed() {
    // window.removeEventListener("resize", this.setTableMaxHeight);
    window.removeEventListener("message", this.reloadMessage, false);
  }

  // 清空关键字
  clearKeyword() {
    this.wd = "";
    this.curPage = 1;
    this.getUnfinishedWorkflowItems();
  }

  // 点击搜索
  onSearch(params) {
    const vals: any = this.dataTranslateToFilterCard(params, "myReadWorkItem");
    this.queryConditionSource = vals;
    this.curPage = 1;
    this.searchParams = {
      ...params
    };
    delete this.searchParams.workflowTplName;
    //this.curPage = 1;
    this.getUnfinishedWorkflowItems("search");
  }

  // 分页改变
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.getUnfinishedWorkflowItems();
  }

  // 分页pageSize改变
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getUnfinishedWorkflowItems("pageChange");
  }

  // 打开发起流程
  startWorkflow() {
    const isAdmin = localStorage.getItem('_isAdmin') === 'true'
    if (this.rootAdmin || isAdmin) {
      // 暂时规定admin不能发起流程
      // this.$message.warn("admin 不能发起流程");
      this.$message.warn(this.$t("cloudpivot.flowCenter.pc.adminNewWorkflowErr") as ConfigType);
      return;
    }
    this.$router.push({ name: "startWorkflow" }).catch((err: any) => {err});
  }
  toggleMode() {
    this.mode = this.mode === "standalone" ? "batch" : "standalone";
    if (this.mode == "batch") {
      let msg = '已为你切换至批量处理模式' 
      if(this.$i18n.locale === 'en'){
        msg = 'Switch to batch processing mode'
      }
      this.$message.success(msg); 
    }
    this.reload();
  }
  //批量处理
  batchDialog(type?) {
    if (type == "batchInfo") this.showBatchInfoModal = true;
    if (type == "failList") this.showBatchFailListModal = true;
    if (type == "batchSuccess") this.showBatchSuccessModal = true;
  }
  async batchHandle({ remark, resources }) {
    this.$message.loading('批量处理中,请稍后...', 5);
    let taskIds = [] as any;
    this.tableData.forEach(({ checked, id }) => {
      if (checked) {
        taskIds.push(id);
      }
    });
    const res = await workflowCenterApi.batchUnfinishWorkflow({
      approval: { content: remark, resources },
      taskIds
    });
    if (!res) return;
    const { errcode, data } = res;
    this.showBatchInfoModal = false;
    this.$message.destroy();
    if (errcode === 0 && data.failNum === 0) {
      this.failListData = data;
      this.batchDialog("batchSuccess");
      //this.mode = 'standalone';
      //this.reload();
    } else if (errcode === 0) {
      let { failResults } = data;
      (data.failResults as any) = failResults.map(
        (item: any, index: number) => {
          item["orderNumber"] = index + 1;
          return item;
        }
      );
      this.failListData = data;
      this.batchDialog("failList");
    } else {
      this.$message.error(res.errmsg as string);
    }
  }
  get batchDisable() {
    return this.tableData.some((d: any) => d.checked);
  }
  /*
   * 当checkbox选择change时事件
   */
  onItemCheckboxChange() {
    const isCheckedItems = this.tableData.filter((d: any) => d.checked);
    if (isCheckedItems.length < this.tableData.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }
  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;
    if (isChecked) {
      this.tableData.forEach((item: any) => {
        item.checked = true;
      });
    } else {
      this.tableData.forEach((item: any) => {
        item.checked = false;
      });
    }
  }
  // 重新加载
  reload() {
    this.wd = "";
    this.curPage = 1;
    this.pageSize = 20;
    this.isSelectAll = false;
    this.getUnfinishedWorkflowItems();
  }
  conditionReload(hasFailedData?: boolean) {
    if (!this.isSelectAll || hasFailedData) {
      // 一种是没有全部选中,另一种是选中后有错误信息
      this.reload();
    } else {
      this.getBatchList().then((data: any)=>{
        if(data.flag){ //查询条件全部完成后看非条件下的批量处理是否还有数据
          this.queryConditionSource = [];
          this.resetParams();
          this.reload();
        }else{
          this.mode = "standalone";
          this.reload();
        }
      })
     
    }
  }
  async getBatchList(){ // 检测条件处理下的批量完后是否还有批量处理的数据
    const res = await workflowCenterApi.searchWorkitems({
      wd: '',// 以前接口参数
      workflowName: '',
      workflowCode: '',
      originator: '',
      unitType: undefined,
      batchOperate: true,
      page: 0,
      size: 20
    }) as any;
    if(res.errcode === 0 && res.data.totalElements > 0) return {flag: true}
    return {flag: false}
  }
  setTime(item: any) {
    if (
      item.workItemTimeoutStatus === "NORMAL" ||
      item.workItemTimeoutStatus === "TIMEOUT"
    ) {
      item.time = WorkflowCenterHelper.timeTranslate(item.stayTime);
    } else if (
      item.workItemTimeoutStatus === "ORANGE" ||
      item.workItemTimeoutStatus === "RED"
    ) {
      item.time = WorkflowCenterHelper.timeTranslate(item.remainingTime);
    }
    return item;
  }

  /**
   * 获取待办列表
   * type: search 搜索的时候内容为空展示不同的img pageChange 页码改变的时候
   * */
  async getUnfinishedWorkflowItems(type?: string) {
    const params = {
      ...this.searchParams,
      wd: '',//以前接口需要的参数
      // workflowName: '',
      // workflowCode: '',
      // originator: '',
      // workflowTplName:'',
      // appCode: this.appCode,
      batchOperate: this.mode === "batch" ? this.listType === 'all' ? true: false : false,
      page: this.curPage - 1,
      size: this.pageSize,
      workItemSource: this.listType === 'all' ? undefined : 1
    };

    // 数据处理函数
    this.dataHandler = (data: any) => {
      data.forEach((item: any, index: number) => {
        item.orderNumber = index + 1;
        item.key = index;
        item.hover = false;
        item.checked = false;
        item.isRead = item.state === WorkflowCenterNS.WorkItemStatus.INPROGESS;
        item = this.setTime(item);
        item.departmentName = WorkflowCenterHelper.departmentNameTranslator(
          item.departmentName
        );

        // 设置高亮
        item.originatorName = utils.searchHighLight(
          this.wd,
          item.originatorName
        );
        item.instanceName = utils.searchHighLight(
          this.searchParams.workflowName,
          item.instanceName
        );

        // 判断是否为委托任务
        item.beTrust = item.workItemTrust ? item.workItemTrust.trust : false;
        // 判断当前用户是否为委托人
        item.currentTrustor = item.workItemTrust
          ? item.workItemTrust.currentTrustor
          : false;

        // 国际化兼容
        item = utils.compatible(item, "activityName");
      });
      return data;
    };

    this.isLoading = true;
    const res = await workflowCenterApi.searchWorkitems(params);
    this.commonHandler(res, type);
    this.$store.dispatch("WorkflowCenterStore/getWorkCount");
  }

  @Watch("$i18n.locale")
  onLanguageChange() {
    this.tableData.forEach((item: any) => {
      item = this.setTime(item);
    });
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
  }

  delHtmlTag(str) {
    return str.replace(/<[^>]+>/g, "")
  }
}
</script>

<style lang="less" scoped>
@import "./style/index.less";

.transfer-list{
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  label{
    width: 114px;
    display: inline-block;
    text-align: left;
    height: 32px;
    line-height: 32px;
    font{
      color: red;
    }
  }
  &>div{
    flex: 1;
  }
}

.content-top{
  h2{
    p{
      margin: 0;
      padding: 0;
      margin-left: 44px;
      display: inline-block;
    }
    span{
      display: inline-block;
      padding: 0 16px;
      height: 32px;
      line-height: 32px;
      font-size: 12px;
      color: #232324;
      border-radius: 16px;
      cursor: pointer;
      &.active{
        color: #fff;
        background-color: #2970ff;
      }
    }
  } 
}
.table {
  max-height: calc(100% - 58px);
}
.filters-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45px;
  z-index: 99;
}
.search-result {
  padding: 0 0 16px 16px;
  color: @light-color-2;
  & span {
    color: @primary-color;
  }
}
.toggle-batch {
  background: rgba(255, 255, 255, 1);
  border-radius: 16px;
  border: 1px solid rgba(41, 112, 255, 1);
  display: inline-block;
  padding: 2px 8px;
  color: #2970ff;
  margin-left: 8px;
  cursor: pointer;
}
.search-input {
  margin-right: 16px;
}
.batch-icon{
  font-size: 18px;
}
.batch-mode {
  color: @primary-color;
}
.single-mode:hover {
  color: @primary-color;
  cursor: pointer;
}
.toggle-mode-icon {
  margin-right: 16px;
  position: relative;
}
.batch-tip-mask{
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  opacity: 0;;
}
.empty-data {
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  .standalone {
    color: #2870fd;
    cursor: pointer;
  }
}
</style>
