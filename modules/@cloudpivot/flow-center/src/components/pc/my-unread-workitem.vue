<template>
  <div
    id="MyUnReadWorkItem"
    class="workitem-box"
    ref="workItem"
  >
    <div class="content-top">
      <h2>{{ $t('cloudpivot.flowCenter.pc.toreadList') }}</h2>
      <div class="content-right">
        <div class="circulate-btns actions-btn">
          <a-button
            type="primary"
            :disabled="isCirculateSingle"
            @click="updateCirculateReaded(false)"
          >{{ $t('cloudpivot.flowCenter.pc.circulated') }}</a-button>
          <!-- <a-button :disabled="isCirculateAll" @click="updateCirculateReaded(true)">全部已阅</a-button> -->
        </div>
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
      <div class="table" ref="table">
        <div class="filters-box" v-show="isShowQueryItem">
          <query-workitem
            ref="queryWorkitem"
            :isShowInstanceState="false"
            :isShowOriginator="true"
            :isShowTimeRange="false"
            :timeLable="$t('cloudpivot.flowCenter.pc.reciveTime')"
            @reset="onReset"
            @search="onSearch"
            @hide="hideQueryItem"
          />
        </div>
        <common-table
          :dataSource="tableData"
          :columns="columns"
          :minTableWidth="1060"
        >
          <!-- 序号 -->
          <span
            class="order-number-box"
            slot="indexTitle"
          >
            <a-checkbox
              @change="selectAll"
              v-model="isSelectAll"
              :disabled="isCirculateAll"
            ></a-checkbox>
            {{ $t('cloudpivot.flowCenter.pc.orderNuber') }}
          </span>
          <template slot="orderNumber" slot-scope="{text,record}">
            <a-checkbox
              class="item-checkbox"
              v-model="record.isChecked"
              @change="onItemCheckboxChange"
            ></a-checkbox>
            <span>{{ text }}</span>
          </template>

          <!-- 模板名称 -->
          <span
            slot="instanceNameTitle"
          >{{ $t('cloudpivot.flowCenter.pc.flowName') }}</span>
          <template slot="instanceName" slot-scope="{text,record}">
            <span
              class="fake-btn text-ellipsis"
              v-html="text"
              :title="delHtmlTag(record.instanceName)"
              @click="openDetail(record)"
            ></span>
          </template>

          <!-- 流程类型 -->
          <span
            slot="workflowNameTitle"
          >{{ $t('cloudpivot.flowCenter.pc.flowTemplate') }}</span>
          <template slot="workflowName" slot-scope="{text,record}">
            <span v-if="isChinese" :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
            <span v-else :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ record.name_i18n[$i18n.locale] }}</span>
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
            slot="startTimeTitle"           
          >{{ $t('cloudpivot.flowCenter.pc.reciveTime') }}</span>
          <template slot="startTime" slot-scope="{text,record}">
            <span class="text-ellipsis">{{ text }}</span>
          </template>

          <!-- 发起人 -->
          <span
            slot="originatorNameTitle"          
          >{{ $t('cloudpivot.flowCenter.pc.originatorName') }}</span>
          <template slot="originatorName" slot-scope="{text,record}">
            <span
              class="fake-btn text-ellipsis"
              @click.stop="showDrawer(record.originator)"
              v-html="text"
            ></span>
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
            :tipText="$t('cloudpivot.flowCenter.pc.noDataText')"
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
    </div>

    <div class="load-fail-box">
      <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload"/>
    </div>
    <common-drawer
      v-model="isShowDrawer"
      :data="userInfo"
    />

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
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import {
  Button, Input, Pagination, Icon, Checkbox,Tooltip
} from '@h3/antd-vue';

import { mixins } from 'vue-class-component';

import "@/config/h3-form"; // 不清楚原因，否则发起人节点service null

import WorkItemMixin from './mixins/workitem';

import CommonDrawer from './components/modals/drawer.vue';

import { workflowCenterApi, workflowCenter as workflowCenterParams }  from '@cloudpivot/api';


import * as Helper from './helper/helper';


import * as utils  from '@cloudpivot/common/src/utils/pc/utils';

import common from '@cloudpivot/common/pc';

import filterCard from '@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue';

import QueryWorkitem from './components/query-condition/query-workitem.vue';

import CommonTable from "./components/common-table/table.vue";
import Store from '@/store/index';

@Component({
  name: 'MyUnReadWorkItem',
  components: {
    filterCard: filterCard,
    QueryWorkitem,
    ATooltip: Tooltip,
    AButton: Button,
    AInputSearch: Input.Search,
    AInput: Input,
    APagination: Pagination,
    AIcon: Icon,
    ACheckbox: Checkbox,
    CommonDrawer,
    PageLoading: common.components.PageLoading,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    CommonTable
  }
})

export default class MyUnReadWorkItem extends mixins(WorkItemMixin) {
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

  wd:string = '';

  searchParams:any = {
    workflowName: '',
    workflowCode: '',
    originator: '',
    workflowTplName:{},
    unitType: '',
    appCode: this.appCode
  }

  defaultTableColumns:any = [
    {
      dataIndex: 'orderNumber',
      width: 120,
      align: 'left',
      hSlot: 'indexTitle',
      bSlot: 'orderNumber'
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
      dataIndex: 'startTime',
      width: 180,
      hSlot: 'startTimeTitle',
      bSlot: 'startTime'
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

  // 全选按钮
  isSelectAll:boolean = false;

  // 控制已阅按钮置灰
  isCirculateSingle:boolean = true;


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
      this.getMyUnReadWorkItem();
    },500)
    
    this.$store.dispatch('WorkflowCenterStore/getWorkCount');

    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);

    this.$message.config({
      maxCount: 1,
      duration: 2
    });
  }

  reloadMessage(event:any) {
    if (event.source === window) return;
    if (event.data.indexOf('/workflow-center/my-unread-workitem') !== -1 || event.data.indexOf('%2Fworkflow-center%2Fmy-unread-workitem') !== -1) {
      this.showIframeForm = false
      this.IframeFormUrl = ''
      this.getMyUnReadWorkItem();
      this.$store.dispatch('WorkflowCenterStore/getWorkCount');
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);
    this.$message.destroy();
  }

  // 全选
  selectAll(e:Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.tableData.forEach((item:any, index:number) => {
        item.isChecked = true;
      });
      this.isCirculateSingle = false;
    } else {
      this.tableData.forEach((item:any, index:number) => {
        item.isChecked = false;
      });
      this.isCirculateSingle = true;
    }
  }

  onItemCheckboxChange() {
    const isCheckedItems = this.tableData.filter((d:any) => d.isChecked);
    if (isCheckedItems.length > 0) {
      this.isCirculateSingle = false;
    } else {
      this.isCirculateSingle = true;
    }
    if (isCheckedItems.length < this.tableData.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  // 清空关键字
  clearKeyword() {
    this.wd = '';
    this.curPage = 1;
    this.getMyUnReadWorkItem();
  }

  // 点击搜索
  onSearch(params) {
    const vals:any = this.dataTranslateToFilterCard(params, 'myReadWorkItem');
    this.queryConditionSource = vals;
    this.curPage = 1;
    this.searchParams = {
       ...params
    };
    this.curPage = 1;
    this.getMyUnReadWorkItem('search');
  }
  onReset(){
    this.queryConditionSource = [];
    this.resetParams();
    this.reload()
  }
  resetParams(){
    this.searchParams = {
      workflowName: '',
      workflowCode: '',
      originator: '',
      unitType: '',
      appCode: this.appCode
    };
  }

  // 分页改变
  onPaginationChange(page:number, size:number) {
    this.curPage = page;
    this.getMyUnReadWorkItem('pageChange');
  }

  // 分页pageSize改变
  onSizeChange(current:number, size:number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getMyUnReadWorkItem('pageChange');
  }

  // 重新加载
  reload() {
    this.wd = '';
    this.curPage = 1;
    this.pageSize = 20;

    this.getMyUnReadWorkItem();
  }

  /**
   * 获取待办列表
   * type: search 搜索的时候内容为空展示不同的img
   *       pageChange 页码改变的时候
   * */
  async getMyUnReadWorkItem(type?:string) {
    const params = {
      ...this.searchParams,
      page: this.curPage - 1,
      size: this.pageSize,
      appCode: this.appCode
    };

    // 重置全选、删除按钮
    this.isSelectAll = false;
    this.isCirculateSingle = true;

    // 数据处理函数
    this.dataHandler = (data:any) => {
      // 生成key 以及序号
      data.forEach((item:any, index:number) => {
        item.orderNumber = index + 1;
        item.key = index;
        item.isChecked = false;
        item.departmentName = Helper.departmentNameTranslator(item.departmentName);
        item.startTime = Helper.removeSeconds(item.startTime);

        // 设置高亮
        item.originatorName = utils.searchHighLight(this.wd, item.originatorName);
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
    const res = await workflowCenterApi.searchCirculates(params);
    this.isSelectAll = false;
    this.commonHandler(res, type);
  }

  /**
   * 更新已阅
   * isCirculateAll true 批量 false 一条或者多条
   * */
  async updateCirculateReaded(isCirculateAll:boolean) {
    const ids:string[] = [];
    if (!isCirculateAll) { // 一条或者多条
      this.tableData.forEach((item:any) => {
        if (item.isChecked) {
          ids.push(item.id);
        }
      });
    }
    const params:any = { circulateItemIds: ids };
    const res = await workflowCenterApi.updateCirculateReaded(params);
    this.isSelectAll = false;
    if (res.errcode === 0) {
      this.$message.success(this.$t('languages.common.tip.operationSucceed') as string);
      // 重新获取一下列表
      this.getMyUnReadWorkItem();

      // 重新获取一下消息数
      this.$store.dispatch('WorkflowCenterStore/getWorkCount');
    } else {
      this.$message.error(this.$t('languages.common.tip.operationFailed') as string);
    }
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

<style lang="less" scoped>
@import './style/index.less';
.table {
    max-height: calc( 100% - 58px );
}
.filters-box{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45px;
  z-index: 99;
}
.circulate-btns {
  margin-left: @base4-padding-xs;
  // margin: 0 @base4-padding-md;
  button {
    // margin: 0 @base4-padding-md @base4-padding-md 0;
  }
}

.order-number-box {
  .ant-checkbox-wrapper {
    margin-right: @base4-padding-lg;
  }
}
.suffix-icon {
  cursor: pointer;
}
.close-icon {
  margin-right: @base4-padding-xs;
}
.item-checkbox {
  margin-right: 30px;
}
.actions-btn{
  margin-right:16px;
}
/deep/.ant-checkbox-inner{
  &:after{
    margin-left: 0px !important;
  }
} 
</style>
