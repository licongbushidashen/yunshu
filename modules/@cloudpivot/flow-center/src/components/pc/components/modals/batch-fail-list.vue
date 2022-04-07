<template>
  <a-modal
    v-model="showModal"
    :title="$t('cloudpivot.flowCenter.pc.batchHandleFlow')"
    :width="600"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="specification"><i class="icon aufontAll h-icon-all-exclamation-circle"></i>{{listData.successNum}}条待办任务已批量处理完成，以下{{listData.failNum}}条任务未处理完成</div>
    <div class="table dialog-table" ref="table">
      <a-table
        :dataSource="tableData"
        :pagination="false"
        :columns="defaultTableColumns"
        :rowKey="(record,index)=>index"
      >
        <!-- 自定义标题 -->
        <span slot="indexTitle" >{{
          $t("cloudpivot.flowCenter.pc.orderNuber")
        }}</span>
        <template slot="orderNumber" slot-scope="text">
          <span class="middle">{{ text }}</span>
        </template>

        <!-- 流程名称 -->
        <span slot="instanceTitle">{{
          $t("cloudpivot.flowCenter.pc.flowName")
        }}</span>
        <template slot="instanceName" slot-scope="text, record">
          <span
            class="fake-btn text-ellipsis"
            v-html="text"
            :title="record.instanceName"
          ></span>
        </template>

        <!-- 发起人 -->
        <span slot="originatorNameTitle">{{
          $t("cloudpivot.flowCenter.pc.originatorName")
        }}</span>
        <template slot="originatorName" slot-scope="text">
          <span class="text-ellipsis fake-btn" v-html="text"></span>
        </template>
        <!-- 原因 -->
        <span slot="reasonTitle">{{
          $t("cloudpivot.flowCenter.pc.reason")
        }}</span>
        <template slot="reason" slot-scope="text">
          <span class="text-ellipsis fake-btn" v-html="text" :title="text"></span>
        </template>
      </a-table>
    </div>
    <div class="pagination-box">
      <a-pagination
        :current="curPage"
        :total="total"
        :pageSize="pageSize"
        :showTotal="
          (total) => $t('cloudpivot.flowCenter.pc.total', { num: total })
        "
        @change="pageChange"
      />
    </div>
    <!-- <div class="load-fail-box">
      <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload" />
    </div> -->
    <template slot="footer">
      <a-button key="back" type="primary" @click="onClose">{{
        $t("languages.common.ok")
      }}</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Modal, Button,Pagination,Table} from "@h3/antd-vue";
import common from '@cloudpivot/common/pc';

@Component({
  name: "BatchFailList",
  components: {
    AModal: Modal,
    AButton: Button,
    ATable: Table,
    ATableColumn: Table.Column,
    APagination: Pagination,
    PageLoading: common.components.PageLoading,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail
  },
})
export default class BatchFailList extends Vue {
  @Prop() value: boolean = false;

  @Prop() data: any;

  @Prop({default: []}) listData:any;

  defaultTableColumns:any = [
    {
      dataIndex: 'orderNumber',
     // width: 100,
      align: 'center',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'orderNumber' }
    },
    {
      dataIndex: 'instanceName',
     // width: 130,
      slots: { title: 'instanceTitle' },
      scopedSlots: { customRender: 'instanceName' }
    },
    {
      dataIndex: 'originatorName',
      //width: 130,
      slots: { title: 'originatorNameTitle' },
      scopedSlots: { customRender: 'originatorName' }
    },
    {
      dataIndex: 'reason',
      //width: 130,
      slots: { title: 'reasonTitle' },
      ellipsis: true,
      scopedSlots: { customRender: 'reason' }
    },
  ]
  isShowModal: boolean = false;

  isShowLoadFailBox:boolean = false;

  showModal = false;
  
  curPage: number = 1;
  pageSize: number = 5;
  total: number = 100;
  tableData:any = [];
  failNum: number = 0;
  successNum: number = 0;

  @Watch('value')
  valueChange(val){
    this.showModal = val;
    if(val){
      this.calTable();
    }
  }
  calTable(){
    let failResults = this.listData.failResults || [];
    let curPage = this.curPage;
    let pageSize = this.pageSize;
    this.total = failResults.length;
    this.tableData = failResults.slice((curPage-1)*pageSize,curPage*pageSize)
  }
  onClose() {
    this.resetTable();
    this.$emit('input',false);
     this.$emit('batchRefresh',true)
  }
  pageChange(curPage){
    this.curPage = curPage;
    this.calTable();
  }
  mounted(){
    
  }
  
  resetParams(){
    this.curPage = 1;
    this.pageSize = 5
  }
  resetTable() {
    this.curPage = 1;
    this.pageSize = 5;
    this.tableData = [];
    //this.getMyFinishWorkitem();
  }
  

}
</script>

<style lang="less" scoped>
.specification{
  color: #000000;
  margin-bottom: 24px;
  .h-icon-all-exclamation-circle{
    color: #FAAD14;
    margin-right: 16px;
  }
}
.pagination-box{
  margin-top: 9px;
  margin-bottom: -15px;
  text-align: right;
}
.text-ellipsis{
  display: block;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
