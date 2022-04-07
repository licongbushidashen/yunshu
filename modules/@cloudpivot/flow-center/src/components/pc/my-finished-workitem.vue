<template>
  <div
    id="MyFinishedWorkitem"
    class="workitem-box"
    ref="workItem"
  >
    <div class="content-top">
      <h2>{{ $t('cloudpivot.flowCenter.pc.doneList') }}</h2>
      <div class="content-top-right-box">
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
            {{ $t('cloudpivot.list.pc.Screen') }}
          </template>
          <i 
            class="icon aufontAll  h-icon-all-filter-o mr icon-shake" 
            :class="{'high-light': isShowQueryItem}" 
            @click="toggleQuery"
          ></i>
        </a-tooltip>
      </div>
    </div>

    <PageLoading
      v-model="isLoading"
      shadeColor="#F4F6FC"
      :shadeOpacity="1"
    />

    <div class="table-box" v-if="isShowTableBox">
      <div class="filters-box" v-show="isShowQueryItem">
        <query-workitem
          class="query-box"
          ref="queryWorkitem"
          :isShowInstanceState="true"
          :isShowOriginator="true"
          :isShowActivityName="true"
          :isShowParticipant="true"
          :timeLable="$t('cloudpivot.flowCenter.pc.resolveTime')"
          @reset="onReset"
          @search="onSearch"
          @hide="hideQueryItem"
        />
      </div>
      <div class="table" ref="table">
        
        <common-table
          :dataSource="tableData"
          :columns="columns"
          :minTableWidth="1060"
        >
          <!-- 自定义标题 -->
          <span
            slot="indexTitle"
          >{{ $t('cloudpivot.flowCenter.pc.orderNuber') }}</span>
          <template slot="orderNumber" slot-scope="{text,record}">
            <img
              v-if="record.beTrust && !record.currentTrustor"
              class="delegation-icon"
              src="./assets/icons/entrusted.png"
            >
            <img
              v-else-if="record.beTrust && record.currentTrustor"
              class="delegation-icon"
              src="./assets/icons/entrust.png"
            >
            <span class="middle">{{ text }}</span>
          </template>

          <!-- 流程名称 -->
          <span
            slot="instanceTitle"         
          >{{ $t('cloudpivot.flowCenter.pc.flowName') }}</span>
          <template slot="instanceName" slot-scope="{text,record}">
            <span
              class="fake-btn text-ellipsis"
              v-html="text"
              :title="delHtmlTag(record.instanceName)"
              @click="openDetail(record)"
            ></span>
          </template>

          <!-- 单据号 -->
          <span slot="sequenceNoTitle" >
            {{ $t("cloudpivot.flowCenter.pc.sequenceNo") }}
          </span>
          <template slot="sequenceNo" slot-scope="{text, record}">
            <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
          </template>

          <!-- 审批节点 -->
          <span
            slot="activityNameTitle"
          >{{ $t('cloudpivot.flowCenter.pc.approvalNode') }}</span>
          <template slot="activityName" slot-scope="{text,record}">
            <span v-if="isChinese" :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
            <span v-else :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ record.name_i18n[$i18n.locale] }}</span>
          </template>

          <!-- 处理结果 -->
          <span
            slot="approvalTxtTitle"   
          >{{ $t('cloudpivot.flowCenter.pc.resolveRzt') }}</span>
          <template slot="approvalTxt" slot-scope="{text,record}">
            <span class="text-ellipsis">{{ text }}</span>
          </template>


          <!-- 处理时间 -->
          <span
            slot="finishTimeTitle"           
          >{{ $t('cloudpivot.flowCenter.pc.resolveTime') }}</span>
          <template slot="finishTime" slot-scope="{text,record}">
            <span class="text-ellipsis">{{ text }}</span>
          </template>

          <!-- 发起人 -->
          <span
            slot="originatorNameTitle"          
          >{{ $t('cloudpivot.flowCenter.pc.originatorName') }}</span>
          <template slot="originatorName" slot-scope="{text,record}">
            <span
              class="text-ellipsis fake-btn"
              @click.stop="showDrawer(record.originator)"
              v-html="text"
            ></span>
          </template>

          <!-- 流程状态 -->
          <span
            slot="workflowInstanceStateTitle"
          >{{ $t('cloudpivot.flowCenter.pc.flowStatus') }}</span>
          <template slot="workflowInstanceStateTxt" slot-scope="{text,record}">
            <span class="text-ellipsis">{{ text }}</span>
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
            :isShowNoData="isShowNoData"
            :isShowSearchNoData="isShowSearchNoData"
            :tipText="$t('cloudpivot.flowCenter.pc.noContent')"
          />
        </div>
      </div>

      <div class="pagination-box">
        <a-pagination
          :total="total"
          :showTotal="total => $t('cloudpivot.flowCenter.pc.total', { num: total })"
          :pageSize="pageSize"
          :current="curPage"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="onPaginationChange"
          @showSizeChange="onSizeChange"
        />
      </div>

      <common-drawer
        v-model="isShowDrawer"
        :data="userInfo"
      />
    </div>

    <div class="load-fail-box">
      <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload"/>
    </div>

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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  Button, Modal, Pagination, Icon, Tooltip
} from '@h3/antd-vue';

import { mixins } from 'vue-class-component';

import QueryWorkitem from './components/query-condition/query-workitem.vue';

import { workflowCenterApi, workflowCenter as workflowCenterParams, workflowApi }  from '@cloudpivot/api';

import * as WorkflowCenterTypes from './typings/workflow-center';

import WorkItemMixin from './mixins/workitem';

import * as Helper from './helper/helper';

import * as utils  from '@cloudpivot/common/src/utils/pc/utils';

import common from '@cloudpivot/common/pc';

import CommonDrawer from './components/modals/drawer.vue';

import filterCard from '@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue';

import CommonTable from "./components/common-table/table.vue";
import Store from '@/store/index';

@Component({
  name: 'MyFinishedWorkitem',
  components: {
    filterCard: filterCard,
    AButton: Button,
    AModal: Modal,
    APagination: Pagination,
    AIcon: Icon,
    ATooltip: Tooltip,
    QueryWorkitem,
    CommonDrawer,
    PageLoading: common.components.PageLoading,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    CommonTable
  }
})
export default class MyFinishedWorkitem extends mixins(WorkItemMixin) {
  /**
   * 单应用集成属性,集成时不显示title
   */
  @Prop({
    default: true
  }) showTitle!: boolean;

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

  searchParams:workflowCenterParams.FinishedWorkItemParams = {
    workflowName: '',
    workflowCode: '',
    originator: '',
    unitType: '',
    instanceState: '',
    startTime: '',
    endTime: '',
    appCode: this.appCode
  }

  defaultTableColumns:any = [
    {
      dataIndex: 'orderNumber',
      width: 80,
      align: 'center',
      hSlot: 'indexTitle',
      bSlot: 'orderNumber'
    },
    {
      dataIndex: 'instanceName',
      width: 220,
      hSlot: 'instanceTitle',
      bSlot: 'instanceName'
    },
    {
      dataIndex: "sequenceNo",
      width: 130,
      hSlot: "sequenceNoTitle",
      bSlot: "sequenceNo"
    },
    {
      dataIndex: 'activityName',
      width: 130,
      hSlot: 'activityNameTitle',
      bSlot: 'activityName'
    },
    {
      dataIndex: 'approvalTxt',
      width: 130,
      hSlot: 'approvalTxtTitle',
      bSlot: 'approvalTxt'
    },
    {
      dataIndex: 'finishTime',
      width: 180,
      hSlot: 'finishTimeTitle',
      bSlot: 'finishTime'
    },
    {
      dataIndex: 'originatorName',
      width: 130,
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName'
    },
    {
      dataIndex: 'workflowInstanceStateTxt',
      width: 130,
      hSlot: 'workflowInstanceStateTitle',
      bSlot: 'workflowInstanceStateTxt'
    },
    {
      dataIndex: "participantName",
      width: 130,
      hSlot: "resolverTitle",
      bSlot: "participantName"
    }
  ]

  get scrollYHeight() {
    if (this.scrollHeight) {
      return this.scrollHeight;
    }
    return this.scrollY;
  }

  get columns() {
    if(this.tableColumns) {
      return this.tableColumns;
    }
    return this.defaultTableColumns;
  }

  mounted() {
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
      this.getMyFinishWorkitem();
    },500)
    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event:any) {
    if(event.data === 'close'){
      this.showIframeForm = false
      this.IframeFormUrl = ''
      this.getMyFinishWorkitem()
      return
    }

    if (event.source === window) return;
    if (event.data.indexOf('/workflow-center/my-finished-workitem') !== -1 || event.data.indexOf('%2Fworkflow-center%2Fmy-finished-workitem') !== -1) {
      this.showIframeForm = false
      this.IframeFormUrl = ''
      this.getMyFinishWorkitem();
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);
  }

  resetParams() {
    this.searchParams = {
      workflowName: '',
      workflowCode: '',
      originator: '',
      unitType: '',
      instanceState: '',
      startTime: '',
      endTime: '',
      appCode: this.appCode
    };
  }

  onReset() {
    this.queryConditionSource = [];
    this.curPage = 1;
    this.resetParams();
    this.getMyFinishWorkitem();
  }

  onSearch(params:workflowCenterParams.FinishedWorkItemParams) {
    const vals:any = this.dataTranslateToFilterCard(params);
    this.queryConditionSource = vals;

    this.curPage = 1;
    this.searchParams = {
      ...params
    };
    this.getMyFinishWorkitem('search');
  }

  // 分页改变
  onPaginationChange(page:number, size:number) {
    this.curPage = page;
    this.getMyFinishWorkitem('pageChange');
  }

  // 分页pageSize改变
  onSizeChange(current:number, size:number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getMyFinishWorkitem('pageChange');
  }

  // 加载失败重新加载
  reload() {
    this.curPage = 1;
    this.pageSize = 20;
    this.resetParams();

    this.getMyFinishWorkitem();
  }

  i18nHandle(item:any){
      switch (item.approval) {
        case WorkflowCenterTypes.ApprovalState.AGREE:
          item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.agree');
          break;
        case WorkflowCenterTypes.ApprovalState.REJECT:
          item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.reject');
          break;
        case WorkflowCenterTypes.ApprovalState.FORWARD:
          item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.forward');
          break;
        case WorkflowCenterTypes.ApprovalState.CANCELLED:
          item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.canceled');
          break;
        case WorkflowCenterTypes.ApprovalState.UNDO:
          item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.undo');
          break;
      };
      // item.workflowInstanceState = Helper.workflowStateTranslator(item.workflowInstanceState);
      switch (item.workflowInstanceState) {
        case WorkflowCenterTypes.WorkflowInstanceState.DRAFT:
          item.workflowInstanceStateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.draft');
          break;
        case WorkflowCenterTypes.WorkflowInstanceState.PROCESSING:
          item.workflowInstanceStateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.processing');
          break;
        case WorkflowCenterTypes.WorkflowInstanceState.COMPLETED:
          item.workflowInstanceStateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.completed');
          break;
        case WorkflowCenterTypes.WorkflowInstanceState.EXCEPTION:
          item.workflowInstanceStateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.exception');
          break;
        case WorkflowCenterTypes.WorkflowInstanceState.CANCELED:
          item.workflowInstanceStateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.canceled');
          break;
      }
      return item;
  }

  // 获取已办列表
  async getMyFinishWorkitem(type?:string) {
    const p = {
      ...this.searchParams,
      page: this.curPage - 1,
      size: this.pageSize,
      appCode: this.appCode
    };

    // 数据处理函数
    this.dataHandler = (data:any) => {
      data.forEach((item:any, index:number) => {
        item.orderNumber = index + 1;
        item.key = index;
        // 处理结果
        
        item = this.i18nHandle(item);

        item.finishTime = Helper.removeSeconds(item.finishTime);

        // 判断是否为委托任务
        item.beTrust = item.workItemTrust ? item.workItemTrust.trust:false;
        // 判断当前用户是否为委托人
        item.currentTrustor = item.workItemTrust ? item.workItemTrust.currentTrustor:false;

        // 设置高亮
        item.instanceName = utils.searchHighLight(this.searchParams.workflowName, item.instanceName);
        
        // 国际化兼容
        item = utils.compatible(item, 'activityName');
      });
      return data;
    };

    this.isLoading = true;
    const res:any = await workflowCenterApi.listFinishedWorkitems(p);
    this.commonHandler(res, type);
  }


  @Watch('$i18n.locale')
  onLanguageChange(){
    this.tableData.forEach((item:any) => {
      item = this.i18nHandle(item);
    });
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
  }

  delHtmlTag(str) {
    return str.replace(/<[^>]+>/g, "")
  }
}

</script>
<style lang='less' scoped>
@import './style/index.less';
.filters-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45px;
  z-index: 99;
}
.workitem-box .table-box{
  .table {
    max-height: calc( 100% - 58px );
  }
}
</style>
