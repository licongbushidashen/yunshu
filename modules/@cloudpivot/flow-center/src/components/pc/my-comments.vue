<template>
  <div id="myComments" class="workitem-box" ref="workItem">
    <div class="content-top">
      <h2>
      </h2>
      <div class="content-right">
        <a-button type="primary" @click="visible = true">
          {{ $t("cloudpivot.flowCenter.pc.add") }}
        </a-button>

        <a-button class="batch-del" @click="batchDel" :disabled="!checkedItems.length">
          {{ $t("cloudpivot.flowCenter.pc.batchDelete") }}
        </a-button>
      </div>
    </div>

    <div class="table-box" v-if="isShowTableBox">
      <div class="table" ref="table">
        <common-table
          :dataSource="tableData"
          :minTableWidth="600"
          :columns="columns"
          @sortEnd="sortEnd"
        >
          <!-- 序号批量 -->
          <span slot="indexTitle" 
            slot-scope="{record}" 
            @mouseenter="$set(record, 'hover', true)"
            @mouseleave="$set(record, 'hover', false)"
          >
            <a-checkbox
              @change="selectAll"
              v-model="isSelectAll"
              :disabled="!tableData || !tableData.length"
              :indeterminate="indeterminate"
              v-show="record.hover || isSelectAll || indeterminate"
            ></a-checkbox>
            <span class="text" v-show="!record.hover && !isSelectAll && !indeterminate">序号</span>
          </span>
          <span
            slot="orderNumber"
            class="index"
            slot-scope="{text, record}"
            @mouseenter="$set(record, 'hover', true)"
            @mouseleave="$set(record, 'hover', false)"
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
          <!-- 模板内容 -->
          <span slot="contentTitle" >{{
            $t("cloudpivot.flowCenter.pc.TemplateContent")
          }}</span>
          <template slot="contentName" slot-scope="{text, record}">
            <span class="handles" v-if="record.listhover">
              <i class="icon aufontAll h-icon-all-drag"></i>
            </span>
            
            <span>{{text}}</span>
          </template>

          <!-- 操作 -->
          <span slot="operationTitle">{{
            $t("cloudpivot.flowCenter.pc.delegation.operation")
          }}</span>
          <template slot="operationName" slot-scope="{record}">
            <span class="operation-btn edit" @click="editComments(record)">
              <i class="icon aufontAll h-icon-all-edit-o edit"></i>
            </span>
            <span class="operation-btn del" @click="delComments(record)">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </span>
          </template>
        </common-table>
      </div>
      <div class="noData" v-if="tableData.length == 0">
          <PageNoData
            v-if="mode === 'standalone'"
            :isShowNoData="true"
            :isShowSearchNoData="isShowSearchNoData"
            :tipText="'暂无内容'"
          />
        </div>
      <p class="list-info">共<span>{{this.tableData.length}}</span>条</p>
    </div>

    <a-modal
      :visible="visible"
      :width="600"
      :title="currentEdit ? '编辑' : '新增'"
      @cancel="closeModal"
    >
      <div class="modal-wrapper">
        <p>审批意见</p>
        <textarea @input="commentChange" v-model="currentComment" placeholder="请输入" :rows="4" />
        <div>
          <span>{{currentComment.length}}</span>/450
        </div>
      </div>
      <template slot="footer">
        <a-button @click="visible = false">{{ $t("cloudpivot.flowCenter.pc.cancel") }}</a-button>
        <a-button @click="modalOK" type="primary">{{ $t("cloudpivot.flowCenter.pc.ok") }}</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { mixins } from "vue-class-component";

import {
  Button,
  Input,
  Pagination,
  Icon,
  Checkbox,
  Tooltip,
  Modal
} from "@h3/antd-vue";

import WorkItemMixin from "./mixins/workitem";

import CommonDrawer from "./components/modals/drawer.vue";
//import BatchInfo from "./components/modals/batch-extra-info.vue";
// import BatchFailList from "./components/modals/batch-fail-list.vue";
// import BatchSuccessInfo from "./components/modals/batch-success-info.vue";
import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams
} from "@cloudpivot/api";

// import * as WorkflowCenterNS from "./typings/workflow-center";

// import * as WorkflowCenterHelper from "./helper/helper";

// import filterCard from "@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue";

// import QueryWorkitem from "./components/query-condition/query-workitem.vue";

import * as utils from "@cloudpivot/common/src/utils/pc/utils";

import common from "@cloudpivot/common/pc";

import CommonTable from "./components/common-table/table.vue";

@Component({
  name: "myComments",
  components: {
    // filterCard: filterCard,
    // QueryWorkitem,
    AButton: Button,
    AInputSearch: Input.Search,
    ACheckbox: Checkbox,
    AInput: Input,
    APagination: Pagination,
    ATooltip: Tooltip,
    AIcon: Icon,
    CommonDrawer,
    // BatchFailList,
    // BatchSuccessInfo,
    PageLoading: common.components.PageLoading,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    CommonTable,
    AModal: Modal
  }
})
export default class myComments extends mixins(WorkItemMixin) {
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

  visible:boolean = false
  currentComment:string = ''

  closeModal(){
    this.visible=false;
  }
  
  async modalOK(){
    if(this.currentComment === ''){
      this.$message.error('审批意见不能为空！')
      return
    }

    let params:any = {
      content: this.currentComment,
      sortKey: 0
    }
    if(this.currentEdit){
      params.id = this.currentEdit.id
      params.sortKey = this.currentEdit.sortKey
    }else{
      if(this.tableData.length === 10){
        this.$message.error('最多设置10条常用审批意见！')
        return
      }
    }
    let res:any = await workflowCenterApi.saveCommonComment(params)
    if(res.errcode === 0){
      this.getList()
      this.visible = false
    }else{
      this.$message.error(res.errmsg)
    }
  }

  currentEdit: any  = ''
  editComments(record){
    this.currentComment = record.content
    this.currentEdit = record
    this.visible = true
  }

  delComments(record){
    let _this = this
    this.$confirm({
      title: '确定要删除？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.deleteCommonComment(record.id)
      }
    });
  }

  async deleteCommonComment(ids){
    let res:any = await workflowCenterApi.deleteCommonComment({
      ids: ids
    })
    const vm: any = this;
    if(res.errcode === 0){
      vm.$message.success('删除成功');
      this.getList()
    }else{
      this.$message.error(res.errmsg)
    }
  }
  

  batchDel(){
    let _this = this
    this.$confirm({
      title: '确定要删除？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        let ids = _this.checkedItems.map(el => el.id)
        this.deleteCommonComment(ids.join(';'))
      }
    });
  }

  async sortEnd(data){
    let resParams:any[] = []
    data.forEach((el, index) => {
      resParams.push({
        id: el.id,
        sortKey: index
      })
    });
    let res:any = await workflowCenterApi.updateCommonComment({
      list: resParams
    })
    if(res.errcode === 0){
      this.getList()
    }else{
      this.$message.error(res.errmsg)
    }
  }


  @Watch('visible')
  onVisibleChange(val){
    if(!val){
      this.currentEdit = ''
      this.currentComment = ''
    }
  }

  commentChange(){
    if(this.currentComment.length > 450){
      this.currentComment = this.currentComment.substr(0, 450)
    }
  }

  tableData:any[] = [] 
  async getList(){
    let res:any = await workflowCenterApi.getCommonCommentList({})
    if(res.errcode === 0){
      res.data.forEach((e,index) => {
        e.orderNumber = index + 1
      });
      this.tableData = res.data
    }else{
      this.$message.error(res.errmsg)
    }

    //判断当前常用审批意见是否超过十条（历史数据）如果超过删除多余部分
    if(res.data.length > 10) {
      for(let i=10;i<res.data.length;i++) {
        this.deleteCommonComment(res.data[i].id);
      }
    }
  }
  created(){
    this.getList()
    // for (let index = 0; index < 50; index++) {
    //   this.currentComment = index + ''
    //   this.modalOK()
    // }
  }



  mode: string = "standalone";

  isSelectAll: boolean = false;

  defaultTableColumns: any = [
    {
      dataIndex: "orderNumber",
      width: 24,
      align: "left",
      hSlot: "indexTitle",
      bSlot: "orderNumber"
    },
    {
      dataIndex: "content",
      width: 400,
      hSlot: "contentTitle",
      bSlot: "contentName"
    },
    {
      dataIndex: "operation",
      width: 60,
      hSlot: "operationTitle",
      bSlot: "operationName"
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


  checkedItems:any[] = []
  indeterminate:boolean = false;
  /*
   * 当checkbox选择change时事件
   * 半选全选
   */
  onItemCheckboxChange() {
    const isCheckedItems = this.tableData.filter((d: any) => d.checked);
    this.checkedItems = isCheckedItems;
    this.indeterminate = !!this.checkedItems.length && this.checkedItems.length < this.tableData.length;
    if(!isCheckedItems.length) {
      this.isSelectAll = false;
      this.indeterminate = false;
    }
    else if (isCheckedItems.length < this.tableData.length) {
      this.isSelectAll = false;
      this.indeterminate = true;
    } else {
      this.isSelectAll = true;
      this.indeterminate = false;
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
      this.checkedItems = this.tableData
    } else {
      this.tableData.forEach((item: any) => {
        item.checked = false;
      });
      this.checkedItems = []
    }
  }


  @Watch("$i18n.locale")
  onLanguageChange() {
    this.setLoadAllTxt();
  }
}
</script>

<style lang="less" scoped>
@import "./style/index.less";

/deep/ .ant-checkbox-indeterminate .ant-checkbox-inner::after {
    left: 40%;
}
/deep/ .ant-checkbox-inner::after {
    left: 15%;
}

.noData{
  position: relative;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.table-box {
  box-shadow: none !important;;
}
.table {
  max-height: calc(100% - 58px);
}
.empty-data {
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  .standalone {
    color: #2870fd;
    cursor: pointer;
  }
}

.modal-wrapper{
  p{
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 0;
  }
  textarea{
    width: 100%;
    border: 1px solid rgba(217,217,217,1);
    border-radius: 4px;
    padding: 8px;
    line-height: 1.5;
    margin: 8px 0 0;
    &:hover{
      border: 1px solid #40a9ff;
    }
    &:focus{
      outline: 0;
      border: 1px solid #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  div{
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  }
}

.operation-btn{
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
  &.del{
    margin-left: 8px;
  }
}

.batch-del{
  margin-left: 8px;
}

.handles{
  cursor: move;
  position: absolute;
  left: 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 10px;
  top: 50%;
  transform: translateY(-50%);
  i{
    font-size: 12px;
  }
}
.list-info{
  border-top: 1px solid #e0e0e0;
  height: 58px;
  line-height: 58px;
  text-align: right;
  padding: 0 16px;
}
</style>
