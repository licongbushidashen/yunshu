<template>
  <div
    id="DelegationWorkflow"
    class="workitem-box"
    ref="workItem"
  >
    <div class="content-top">
      <h2>{{ $t('cloudpivot.flowCenter.pc.delegationFlow') }}</h2>
      <div class="content-top-right-box">
        <a-button type="primary" @click="showDelegationDrawer(0)">{{ $t('cloudpivot.flowCenter.pc.add') }}</a-button>
        <a-button :disabled="!deleteDisable" @click="deleteDelegation">{{ $t('cloudpivot.flowCenter.pc.delete') }}</a-button>
      </div>
    </div>

    <PageLoading
      v-model="isLoading"
      shadeColor="#F4F6FC"
      :shadeOpacity="1"
    />

    <div class="table-box" v-if="isShowTableBox">
      <div class="table" ref="table">
        <common-table
          :dataSource="tableData"
          :columns="columns"
          :minTableWidth="1060"
        >
          <!-- 序号 -->
          <span
            slot="indexTitle"
          >
            <a-checkbox
              @change.stop="selectAll"
              v-model="isSelectAll"
              :disabled="!tableData.length"
            ></a-checkbox>
            <!-- <label class="text" v-show="!showSelectAllBox && !isSelectAll">{{ $t('cloudpivot.flowCenter.pc.orderNuber') }}</label> -->
          </span>
          <span
            slot="index"
            class="index"
            slot-scope="{text,record}"
            @mouseenter="record.hover = true"
            @mouseleave="record.hover = false"
          >
            <a-checkbox
              v-show="record.hover || record.checked"
              v-model="record.checked"
              @change.stop="onItemCheckboxChange"
            ></a-checkbox>
            <span class="text" v-show="!record.hover && !record.checked">{{ text }}</span>
          </span>

          <!-- 委托人 -->
          <span
            slot="trustorNameTitle"           
          >{{ $t('cloudpivot.flowCenter.pc.delegation.client') }}</span>
          <template slot="trustorName" slot-scope="{text,record}">
            <span
              :title="text"
              class="text-ellipsis"
            >{{ text }}</span>
          </template>

          <!-- 被委托人 -->
          <span
            slot="trusteeNameTitle"         
          >{{ $t('cloudpivot.flowCenter.pc.delegation.consignor') }}</span>
          <template slot="trusteeName" slot-scope="{text,record}">
            <span 
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'" 
              :title="text"
            >{{ text }}</span>
          </template>

          <!-- 委托类型 -->
          <span
            slot="trustTypeTitle"          
          >{{ $t('cloudpivot.flowCenter.pc.delegation.delegateType') }}</span>
          <template slot="trustType" slot-scope="{text,record}">
            <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
          </template>

          <!-- 受托期限 -->
          <span
            slot="timeRangeTitle"            
          >{{ $t('cloudpivot.flowCenter.pc.delegation.entrustedPeriod') }}</span>
          <template slot="timeRange" slot-scope="{text,record}">
            <span class="text-ellipsis">{{ text }}</span>
          </template>

          <!-- 操作 -->
          <span
            slot="operationTitle"           
          >{{ $t('cloudpivot.flowCenter.pc.delegation.operation') }}</span>
          <template slot="operation" slot-scope="{text,record}">
            <i class="icon aufontAll h-icon-all-edit-o edit" @click="showDelegationDrawer(1, record.id)"></i>
            <i class="icon aufontAll h-icon-all-delete-o delete" @click="deleteDelegation(record)"></i>
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

      <delegation-drawer
        v-model="isShowDelegationDrawer"
        :type="drawerType"
        :drawerId="drawerId"
        @reloadList="getDelegationWorkflowList"
      />
    </div>

    <div class="load-fail-box">
      <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  Button, Modal, Pagination, Icon, Tooltip, Checkbox
} from '@h3/antd-vue';

import { mixins } from 'vue-class-component';

import common from '@cloudpivot/common/pc';

import { workflowCenterApi, workflowCenter as workflowCenterParams, workflowApi }  from '@cloudpivot/api';

import WorkItemMixin from './mixins/workitem';

import CommonDrawer from './components/modals/drawer.vue';

import DelegationDrawer from './components/delegation-drawer.vue';

import CommonTable from "./components/common-table/table.vue";

import * as Helper from './helper/helper';

@Component({
  name: 'DelegationWorkflow',
  components: {
    AButton: Button,
    AModal: Modal,
    APagination: Pagination,
    AIcon: Icon,
    ATooltip: Tooltip,
    ACheckbox: Checkbox,
    CommonDrawer,
    DelegationDrawer,
    PageLoading: common.components.PageLoading,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    CommonTable
  }
})
export default class DelegationWorkflow extends mixins(WorkItemMixin) {
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

  isShowDelegationDrawer:boolean = false;

  drawerType:number = 0;

  drawerId:string = '';

  isSelectAll:boolean = false;

  showSelectAllBox:boolean = false;

  defaultTableColumns:any = [
    {
      dataIndex: 'index',
      width: 80,
      align: 'center',
      hSlot: 'indexTitle',
      bSlot: 'index',
    },
    {
      dataIndex: 'trustorName',
      width: 100,
      hSlot: 'trustorNameTitle',
      bSlot: 'trustorName'
    },
    {
      dataIndex: 'trusteeName',
      width: 100,
      hSlot: 'trusteeNameTitle',
      bSlot: 'trusteeName'
    },
    {
      dataIndex: 'trustType',
      width: 100,
      hSlot: 'trustTypeTitle',
      bSlot: 'trustType'
    },
    {
      dataIndex: 'timeRange',
      width: 260,
      hSlot: 'timeRangeTitle',
      bSlot: 'timeRange'
    },
    {
      dataIndex: 'operation',
      width: 60,
      hSlot: 'operationTitle',
      bSlot: 'operation'
    }
  ]

  get columns() {
    if(this.tableColumns) {
      return this.tableColumns;
    }
    return this.defaultTableColumns;
  }

  get deleteDisable() {
    return this.tableData.some((d:any) => d.checked);
  }

  mounted() {
    this.getDelegationWorkflowList();
    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event:any) {
    if (event.source === window) return;
    if (event.data.indexOf('/workflow-center/my-read-workitem') !== -1 || event.data.indexOf('%2Fworkflow-center%2Fmy-read-workitem') !== -1) {
      this.getDelegationWorkflowList();
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);
  }

  /* 
  * show委托抽屉-- 0：新增，1：编辑
  */
  showDelegationDrawer(type: number, id?:any) {
    this.drawerType = type;
    if (id) {
     this.drawerId = id;
   }
    this.isShowDelegationDrawer = true
  }

  /* 
  * 删除委托
  */
 deleteDelegation(record?:any) {
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
      title: vm.$t("cloudpivot.flowCenter.pc.deleteTrustTips1").toString(),
      okText: vm.$t("cloudpivot.flowCenter.pc.ok").toString(),
      cancelText: vm.$t("cloudpivot.flowCenter.pc.cancel").toString(),
      content: vm.$t("cloudpivot.flowCenter.pc.deleteTrustTips2").toString(),
      onOk() {
        const params = {
          workflowTrustRuleIds: _ids.join(',')
        };
        workflowCenterApi.deleteWorkflowTrust(params).then((res:any) => {
          if (res.errcode) {
            vm.$message.error(`${vm.$t("cloudpivot.flowCenter.pc.deleteFailed")}`);
            return;
          }

          vm.$message.success(`${vm.$t("cloudpivot.flowCenter.pc.deleteSuccess")}`);
          vm.getDelegationWorkflowList();
        });
      }
    });
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

  indexMouseenter() {
    this.showSelectAllBox = true;
  }

  indexMouseleave() {
    this.showSelectAllBox = false;
  }

  // 分页改变
  onPaginationChange(page:number, size:number) {
    this.curPage = page;
    this.getDelegationWorkflowList('pageChange');
  }

  // 分页pageSize改变
  onSizeChange(current:number, size:number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getDelegationWorkflowList('pageChange');
  }

  // 加载失败重新加载
  reload() {
    this.curPage = 1;
    this.pageSize = 20;

    this.getDelegationWorkflowList();
  }


  // 获取委托列表
  async getDelegationWorkflowList(type?:string) {
    const p = {
      page: this.curPage - 1,
      size: this.pageSize
    };
    const vm: any = this;

    // 数据处理函数
    this.dataHandler = (data:any) => {
      data.forEach((item:any, index:number) => {
        item.index = index + 1;
        item.key = index;
        item.checked = false;
        item.hover = false;
        item.trustType = item.trustType === 0 ? vm.$t('cloudpivot.flowCenter.pc.delegation.workflowApproval'): vm.$t('cloudpivot.flowCenter.pc.delegation.startWorkflow');

        item.timeRange = `${vm.$t('cloudpivot.flowCenter.pc.timeRange', { start: item.startTime, end: item.endTime })}`;
      });
      return data;
    };

    this.isLoading = true;
    const res:any = await workflowCenterApi.getWorkflowTrustList(p);
    if(res.data && res.data.totalElements === 0 ){
      this.isSelectAll = false;// 删除到没有可选项时候用
    }
    this.commonHandler(res, type);
  }


  @Watch('$i18n.locale')
  onLanguageChange(){
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
  }
}

</script>
<style lang='less' scoped>
@import './style/index.less';
.workitem-box .table-box{
  .table {
    max-height: calc( 100% - 58px );
  }
}
.ant-table-tbody{
  td>i{
    cursor: pointer;
    font-size: 14px;
    color: rgba(0,0,0,0.65);
    &:hover{
      color: @primary-color;
    }
  }
}
.index{
  width: 100%;
  height: 100%;
  display: inline-block;
  .text{
    padding: 0;
  }
}
.delete{
  margin-left: 16px;
}
</style>
