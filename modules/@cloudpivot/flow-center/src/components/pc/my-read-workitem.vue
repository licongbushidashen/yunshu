<template>
  <div
    id="MyReadWorkitem"
    class="workitem-box"
    ref="workItem"
  >
    <div class="content-top">
      <h2>{{ $t('cloudpivot.flowCenter.pc.readList') }}</h2>
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
            class="icon aufontAll  h-icon-all-filter-o mr" 
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
          ref="queryWorkitem"
          :isShowInstanceState="false"
          :isShowOriginator="true"
          :timeLable="$t('cloudpivot.flowCenter.pc.reciveTime')"
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
          <!-- 序号 -->
          <span
            slot="indexTitle"
          >{{ $t('cloudpivot.flowCenter.pc.orderNuber') }}</span>

          <!-- 流程名称 -->
          <span
            slot="instanceNameTitle"          
          >{{ $t('cloudpivot.flowCenter.pc.flowName') }}</span>
          <template slot="instanceName" slot-scope="{text,record}">
            <span
              v-html="text"
              :title="delHtmlTag(record.instanceName)"
              @click="openDetail(record)"
              class="fake-btn text-ellipsis"
            ></span>
          </template>

          <!-- 流程模板 -->
          <span
            slot="workflowNameTitle"           
          >{{ $t('cloudpivot.flowCenter.pc.flowTemplate') }}</span>
          <template slot="workflowName" slot-scope="{text,record}">
            <span 
              v-if="isChinese" 
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'" 
              :title="text"
            >{{ text }}</span>
            <span 
              v-else 
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'" 
              :title="record.name_i18n[$i18n.locale]"
            >{{ record.name_i18n[$i18n.locale] }}</span>
          </template>

          <!-- 单据号 -->
          <span slot="sequenceNoTitle" >
            {{ $t("cloudpivot.flowCenter.pc.sequenceNo") }}
          </span>
          <template slot="sequenceNo" slot-scope="{text, record}">
            <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
          </template>

          <!-- 传阅来源 -->
          <span
            slot="sourceNameTitle"           
          >{{ $t('cloudpivot.flowCenter.pc.sourceName') }}</span>
          <template slot="sourceName" slot-scope="{text,record}">
            <div v-if="record.activitySource && record.sourceName_i18n">
              <span v-if="isChinese" :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
              <span v-else :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ record.sourceName_i18n[$i18n.locale] }}</span>
            </div>
            <div v-else>
              <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
            </div>
          </template>
          

          <!-- 接收时间 -->
          <span
            slot="receiveTimeTitle"        
          >{{ $t('cloudpivot.flowCenter.pc.reciveTime') }}</span>
          <template slot="receiveTime" slot-scope="{text,record}">
            <span class="text-ellipsis">{{ text }}</span>
          </template>

          <!-- 发起人 -->
          <span
            slot="originatorNameTitle"           
          >{{ $t('cloudpivot.flowCenter.pc.originatorName') }}</span>
          <template slot="originatorName" slot-scope="{text,record}">
            <span class="fake-btn text-ellipsis" @click.stop="showDrawer(record.originator)">{{ text }}</span>
          </template>

          <!-- 发起人组织 -->
          <span
            slot="departmentNameTitle"
          >{{ $t('cloudpivot.flowCenter.pc.departmentName') }}</span>
          <template slot="departmentName" slot-scope="{text,record}">
            <span class="text-ellipsis" :title="text">{{ text }}</span>
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
          :current="curPage"
          :total="total"
          :showTotal="total => $t('cloudpivot.flowCenter.pc.total', { num: total })"
          :pageSize="pageSize"
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

import * as utils  from '@cloudpivot/common/src/utils/pc/utils';

import common from '@cloudpivot/common/pc';

import filterCard from '@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue';

import { workflowCenterApi, workflowCenter as workflowCenterParams, workflowApi }  from '@cloudpivot/api';

import WorkItemMixin from './mixins/workitem';

import CommonDrawer from './components/modals/drawer.vue';

import * as Helper from './helper/helper';

import CommonTable from "./components/common-table/table.vue";

import Store from '@/store/index';

@Component({
  name: 'MyReadWorkitem',
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
export default class MyReadWorkitem extends mixins(WorkItemMixin) {
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
      hSlot: 'indexTitle'
    },
    {
      dataIndex: 'instanceName',
      width: 220,
      hSlot: 'instanceNameTitle',
      bSlot: 'instanceName'
    },
    {
      dataIndex: 'workflowName',
      width: 130,
      hSlot: 'workflowNameTitle',
      bSlot: 'workflowName'
    },
    {
      dataIndex: "sequenceNo",
      width: 130,
      hSlot: "sequenceNoTitle",
      bSlot: "sequenceNo"
    },
    {
      dataIndex: 'sourceName',
      width: 130,
      hSlot: 'sourceNameTitle',
      bSlot: 'sourceName'
    },
    {
      dataIndex: 'receiveTime',
      width: 180,
      hSlot: 'receiveTimeTitle',
      bSlot: 'receiveTime'
    },
    {
      dataIndex: 'originatorName',
      width: 130,
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName'
    },
    {
      dataIndex: 'departmentName',
      width: 200,
      hSlot: 'departmentNameTitle',
      bSlot: 'departmentName'
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
      this.getMyReadWorkitem();
    },500)
    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event:any) {
    if(event.data === 'close'){
      this.showIframeForm = false
      this.IframeFormUrl = ''
      this.getMyReadWorkitem()
      return
    }

    if (event.source === window) return;
    if (event.data.indexOf('/workflow-center/my-read-workitem') !== -1 || event.data.indexOf('%2Fworkflow-center%2Fmy-read-workitem') !== -1) {
      this.showIframeForm = false
      this.IframeFormUrl = ''
      this.getMyReadWorkitem();
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
      startTime: '',
      endTime: '',
      appCode: this.appCode
    };
  }

  onReset() {
    this.queryConditionSource = [];
    this.curPage = 1;
    this.resetParams();
    this.getMyReadWorkitem();
  }

  onSearch(params:workflowCenterParams.FinishedWorkItemParams) {
    const vals:any = this.dataTranslateToFilterCard(params, 'myReadWorkItem');
    this.queryConditionSource = vals;

    this.curPage = 1;
    this.searchParams = {
      ...params
    };
    this.getMyReadWorkitem('search');
  }

  // 分页改变
  onPaginationChange(page:number, size:number) {
    this.curPage = page;
    this.getMyReadWorkitem('pageChange');
  }

  // 分页pageSize改变
  onSizeChange(current:number, size:number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getMyReadWorkitem('pageChange');
  }

  // 加载失败重新加载
  reload() {
    this.curPage = 1;
    this.pageSize = 20;
    this.resetParams();

    this.getMyReadWorkitem();
  }


  // 获取已阅列表
  async getMyReadWorkitem(type?:string) {
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
        item.departmentName = Helper.departmentNameTranslator(item.departmentName);

        // 去掉秒钟
        if (item.receiveTime) {
          item.receiveTime = Helper.removeSeconds(item.receiveTime);
        }

        // 设置高亮
        item.instanceName = utils.searchHighLight(this.searchParams.workflowName, item.instanceName);

        if (item.sourceName_i18n) {
          item.sourceName_i18n = JSON.parse(item.sourceName_i18n);
        }

        item = utils.compatible(item, 'sourceName', 'sourceName_i18n');

        // 国际化兼容
        item = utils.compatible(item, 'workflowName');
      });
      return data;
    };

    this.isLoading = true;
    const res:any = await workflowCenterApi.listReadWorkitems(p);

    this.commonHandler(res, type);
  }


  @Watch('$i18n.locale')
  onLanguageChange(){
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
