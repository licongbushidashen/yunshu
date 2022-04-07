<!--
 * @Author: panwl
 * @Date: 2020-05-07 11:02:54
 * @LastEditTime: 2020-05-09 16:52:38
 * @LastEditors: Please set LastEditors
 * @Description: 业务规则日志
 * @FilePath: \frontend\entries\admin\src\views\system\log\biz-rule-info\biz-rule-inf.vue
 -->

<template>
  <div class="biz-rule-info">
    <div class="biz-rule-info__header">
      <div class="clearfix">
        <smart-search @reset="resetParams" @search="query">
          <div slot="search">
            <div class="header__item">
              <span>模型名称:</span>
              <biz-models-selector class="w" :width="216" @change="treeSelect" ref="datarule" />
            </div>
            <div class="header__item">
              <span>规则名称:</span>
              <a-input class="w" :placeholder="'请输入'" v-model="dataRuleName" />
            </div>

            <div class="header__item">
              <span>执行时间:</span>
              <a-range-picker class="w" :placeholder="['开始时间','结束时间']" v-model="executTime" />
            </div>

            <div class="header__item">
              <span>执行状态:</span>
              <a-select show-search class="w" placeholder="请选择" v-model="executState">
                <a-select-option v-for="(item, index) in executStateList" :key="index" :value="item.code">{{ item.name }}</a-select-option>
              </a-select>
            </div>
          </div>
        </smart-search>
      </div>
    </div>
    <div class="biz-rule-info__content">
      <div>
        <a-table :columns="columnList" size="small" :pagination="false" :loading="false" :locale="{ emptyText: $t('languages.NoRelevantData') }" :scroll="{ y: 500 }" :dataSource="dataSource" class="table">
          <!-- 表格头部 -->
          <span slot="indexTitle">{{ $t('languages.NO') }}</span>
          <span slot="appNameTitle" class="text-ellipsis resize">应用名称</span>
          <span slot="bizModelName" class="text-ellipsis resize">业务模型</span>
          <span slot="bizRuleName" class="text-ellipsis resize">业务规则名称</span>
          <span slot="bizRuleCode" class="text-ellipsis resize">业务规则编码</span>
          <span slot="executState" class="text-ellipsis resize">执行状态</span>
          <span slot="executStartDate" class="text-ellipsis resize">执行开始时间</span>
          <span slot="executEndDate" class="text-ellipsis resize">执行结束时间</span>
          <span slot="exceptionNode" class="text-ellipsis resize">异常节点</span>
          <span slot="actionTitle" class="text-ellipsis resize">操作</span>

          <!-- 表格内容 -->
          <span class="action right text-ellipsis" slot="action" slot-scope="text, record" @click="openDetail(record)">打开详情</span>
        </a-table>
      </div>
    </div>
    <!-- <span @click="openDetail"> 详情 </span> -->
    <div class="biz-rule-info__footer">
      <div>
        <a-pagination :defaultPageSize="size" :total="totalPage" :showTotal="total => `共${totalPage}条`" :current="page + 1" :pageSizeOptions="pageSizeOptions" showSizeChanger showQuickJumper @change="pageChange" @showSizeChange="pageSizeChange" />
      </div>
    </div>

    <!-- 详情 -->
    <a-drawer :title="'详情'" width="850" placement="right" @close="showDrawer = false" :closable="true" :visible="showDrawer" wrapClassName="user-info-drawer">
      <biz-rule-info-detail :selectData="selectData" @close="close" v-if="showDrawer" />
    </a-drawer>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import moment from "moment";
import SmartSearch from "@/components/global/smart-search.vue";
import BizModelsSelector from '@/components/global/biz-models-selector/index.vue'
import { getNearWork } from "../data-rule-info/typings/help";
import { executionStates, IexecutState, Estate, columns } from './typings';
import { systemManageApi, systemManage } from "@cloudpivot/api";
import BizRuleInfoDetail from './biz-rule-info-detail.vue';

@Component({
  name: 'biz-rule-info',
  components: {
    BizModelsSelector,
    SmartSearch,
    BizRuleInfoDetail
  }
})

export default class BizRuleInfo extends Vue {
  executStateList: Array<IexecutState> = executionStates;
  executState: Estate = Estate.All;
  executTime: any[] = []; // 执行时间

  columnList = columns;
  dataSource: any[] = [];

  page = 0;
  size = 20;
  totalPage = 0;
  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  schemaCode: string = ""; // 模型编码
  dataRuleName: string = ""; // 数据规则名称

  showDrawer = false; // 抽屉显隐
  selectData: any = null;

  mounted() {
    this.resetParams()
    this.getList(this.getParams());
  }

  resetParams() {
    const nearWeek = getNearWork();
    this.executTime = [moment(nearWeek[0]), moment(nearWeek[1])];
    this.executState = Estate.All;
    this.schemaCode = "";
    this.dataRuleName = "";
    this.clearTree();
    this.query();
  }

  query() {
    this.page = 0;
    this.getList(this.getParams());
  }

  getParams(): systemManage.IbusinessRuleLogResParams {
    let startTime = "";
    let endTime = "";
    if (this.executTime.length > 0) {
      startTime = moment(this.executTime[0]).format("YYYY-MM-DD");
      endTime = moment(this.executTime[1]).format("YYYY-MM-DD");
    }
    const params = {
      startTime,
      endTime,
      businessRuleName: this.dataRuleName,
      schemaCode: this.schemaCode,
      success: this.executState === Estate.All ? '' : this.executState,
      page: this.page,
      size: this.size
    };
    return params;
  }

  getList(params: systemManage.IbusinessRuleLogResParams) {
    const vm: any = this;
    systemManageApi.getBusinessRuleLogList(params).then((res: any) => {
      if (res.errcode === 0) {
        vm.dataSource = res.data.content;
        vm.totalPage = res.data.totalElements;
        vm.dataSource.forEach((item: any, index: number) => {
          item.index = index + 1 + params.page * params.size;
          item.state = item.success ? "成功" : "失败";
          item.exceptionNodeName = !item.exceptionNodeName ? '-' : item.exceptionNodeName;
        });
      }
    })
  }

  pageChange(page: number, pageSize: number) {
    this.page = page - 1;
    this.size = pageSize;
    this.getList(this.getParams());
  }

  pageSizeChange(current: number, pageSize: number) {
    this.page = 0;
    this.size = pageSize;
    this.getList(this.getParams());
  }

  treeSelect(val: any) {
    this.schemaCode = val;
  }

  clearTree() {
    (this.$refs.datarule as any).clearVal();
  }

  openDetail(model) {
    this.showDrawer = !this.showDrawer;
    this.selectData = model;
  }
  close() {
    this.showDrawer = false;
  }
}
</script>

<style lang='less' scoped>
.biz-rule-info {
  position: relative;
  height: calc(100vh - 122px);
  &__header {
    & > div {
      margin: 0 -23px;
      .header__item {
        height: 32px;
        margin-bottom: 16px;
        margin-right: 16px;
        float: left;
        font-size: 0;
        > span:first-child {
          display: inline-block;
          vertical-align: middle;
          min-width: 4.2em;
          font-size: 14px;
        }
        .w {
          width: 240px;
          margin-left: 8px;
          display: inline-block;
          vertical-align: middle;
        }
      }
    }
  }
  &__content {
    margin-top: 16px;
    /deep/.ant-table-thead > tr {
      background-color: rgba(250, 250, 250, 1);
      > th {
        font-weight: 600 !important;
        font-family: "PingFangSC-Regular,PingFang SC";
        > div {
          height: 22px;
          border-right: 1px solid rgba(232, 232, 232, 1);
        }
      }
      > th:last-child {
        > div {
          border-right: none;
        }
      }
    }
    /deep/.ant-table-body {
      color: rgba(0, 0, 0, 0.85);
      max-height: calc(100vh - 272px) !important;
      .action {
        cursor: pointer;
        color: @primary-color;
      }
    }
  }
  &__footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin-left: -24px;
    margin-right: -24px;
    border-top: 1px solid rgba(232, 232, 232, 1);
    padding: 8px 24px;
    & > div {
      float: right;
    }
  }
}
.ant-table-thead > tr > th {
  font-weight: 600 !important;
}
</style>