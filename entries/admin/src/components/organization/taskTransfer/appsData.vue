<template>
  <div class="apps-data">
    <div>
      <div class="search-head">
        <div class="search-tips">说明：批量更改数据的拥有者，交接后数据拥有者对数据有查看、编辑权限</div>
        <div class="row first">
          <div>
            <label>
              <span class="red">*</span>
              <span class="title right">{{ $t('languages.TaskTransfer.Delegatee') }}</span>
            </label>
            <staff-selector
              :options="taffSelectorOpts"
              v-model="targetUser"
              @change="addTargetUser"
              class="user org-user"
            ></staff-selector>
          </div>
          <div class="transfer-org">
            <label>
              <span class="red">*</span>
              <span class="title right">{{ $t('languages.TaskTransfer.DelegateeOrg') }}</span>
            </label>
            <a-select show-search placeholder="请选择" v-model="transferDept" class="input-select">
              <a-select-option
                v-for="(select,index) in departmentList"
                :key="index"
                :value="select.deptId"
              >{{ select.deptName }}</a-select-option>
            </a-select>
          </div>
        </div>
        <div class="row">
          <div>
            <span class="red">*</span>
            <span class="title">{{ $t('languages.TaskTransfer.BizModel') }}</span>
            <biz-models-selector
              v-model="schemaCode"
              class="biz-models"
              :appManagerFilter="true"
              :canSelectAll="true"
              :organization="true"
              usePage="handover"
              :allOption="allModelOption"
              @change="onWorkflowChange"
              :placeholder="'请选择'"
            />
          </div>
          <div>
            <span class="title">{{ $t('languages.TaskTransfer.SequenceStatus') }}</span>
            <a-select
              mode="multiple"
              placeholder="请选择"
              class="user"
              v-model="sequenceStatus"
              @change="onStatusChange"
            >
              <a-select-option
                v-for="(item, index) in sequenceStatusList"
                :value="item.status"
                :key="index"
              >{{ item.name }}</a-select-option>
            </a-select>
          </div>
        </div>
        <!-- <div class="change-originator">
          <a-checkbox
            v-model="isSyncInstance"
            class="checkbox"
          ></a-checkbox>
          <span>交接流程数据时，同步批量修改流程发起人为交接对象</span>
        </div>-->
      </div>
      <div class="selected-count">
        <span>{{ $t('languages.TaskTransfer.Selected') }}：</span> &nbsp;
        <span>{{ hasSelected }}</span>/
        <span>{{ totalElements }}</span>
      </div>
      <div :class="{'no-bizmodel': noBizModel}">
        <a-table
          :columns="columns"
          size="small"
          :dataSource="myTask"
          :pagination="false"
          :loading="false"
          :scroll="{ y: 300 }"
          :locale="{emptyText: $t('languages.NoRelevantData')}"
        >
          <span
            slot="indexTitle"
            class="index"
            @mouseenter="indexMouseenter"
            @mouseleave="indexMouseleave"
          >
            <a-checkbox
              v-show="showSelectAllBox || isSelectAll"
              @change.stop="selectAll"
              v-model="isSelectAll"
            ></a-checkbox>
            <span class="text" v-show="!showSelectAllBox && !isSelectAll">{{ $t('languages.NO') }}</span>
          </span>
          <span slot="nameTitle" class="resize">{{ $t('languages.TaskTransfer.Name') }}</span>
          <span slot="ownerDeptTitle" class="resize">{{ $t('languages.TaskTransfer.OwnerDept') }}</span>
          <span
            slot="createdTimeTitle"
            class="resize"
          >{{ $t('languages.TaskTransfer.CreatedTime') }}</span>
          <span slot="moduleNameTitle" class="resize">{{ $t('languages.TaskTransfer.SchemaCode') }}</span>
          <span
            slot="sequenceStatusTitle"
            class="resize"
          >{{ $t('languages.TaskTransfer.SequenceStatus') }}</span>

          <span
            slot="index"
            class="index"
            slot-scope="text,record"
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
          <template v-for="(item,index) in tableColumns">
            <span
              :key="index"
              class="text-ellipsis"
              :slot="item.dataIndex"
              slot-scope="text,record"
            >
              <a-tooltip v-if="item.dataIndex !== 'index'" placement="top">
                <template slot="title">
                  <span>{{ text }}</span>
                </template>
                <span
                  class="cursor"
                  v-if="item.dataIndex === 'instanceName'"
                  @click="openForm(record)"
                >{{ text }}</span>
                <span v-else>{{ text }}</span>
              </a-tooltip>
            </span>
          </template>
        </a-table>
      </div>
      <div class="apps-data__page clearfix" v-if="totalElements>0">
        <div>
          <a-pagination
            @change="pageChange"
            size="small"
            :pageSizeOptions="pageSizeOptions"
            :total="totalElements"
            :showTotal="total => `共${totalElements}条`"
            showSizeChanger
            showQuickJumper
            :defaultPageSize="20"
            :current="params.page"
            @showSizeChange="showSizeChange"
          />
        </div>
      </div>
      <div class="biz-model_tip" v-if="selectAllModel">
        <span>交接全部数据量较大，系统将后台执行交接动作</span>
      </div>
      <div class="biz-model_tip" v-else-if="noBizModel && !myTask.length">
        <span>请先选择业务模型</span>
      </div>
      <!-- <div class="load-more">
        <span>{{ $t('languages.NoRelevantData') }}</span>
      </div>-->
    </div>
    <div class="sub-btn">
      <div>
        <template v-if="selectAllModel">
          <a-button
            class="btn"
            type="primary"
            :disabled="noTransferAll"
            @click="toTransferTask('every')"
          >交接全部数据</a-button>
        </template>
        <template v-else>
          <a-button
            class="btn"
            :disabled="transferSelected"
            type="primary"
            :ghost="true"
            @click="toTransferTask('section')"
          >{{ $t('languages.TaskTransfer.TransferSelected2') }}</a-button>
          <a-button
            class="btn"
            :disabled="transferAllItems"
            type="primary"
            :ghost="true"
            @click="toTransferTask('all')"
          >{{ $t('languages.TaskTransfer.TransferAll2', { num: totalElements }) }}</a-button>
        </template>
      </div>
    </div>
    <PageLoading
      v-model="isLoading"
      shadeColor="#FFF"
      text="工作正在交接中，请稍后…"
      :shadeOpacity="0.8"
      :shadeGlobal="true"
    ></PageLoading>

    <a-modal
      width="480px"
      :visible="visible"
      @cancel="visible = false"
      @ok="handleOk"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      :maskClosable="false"
      :keyboard="false"
    >
      <span slot="title">
        {{modalTitle}}
        <small style="margin-left: 12px;">已选{{hasSelected}}条任务</small>
      </span>

      <p class="tips"><span class="icon aufontAll h-icon-all-Components_Warning"></span>交接任务后不能撤回，请谨慎操作</p>
      <div class="handover-opinions">
        <label>交接意见</label>
        <a-textarea
          v-model="handoverOpinions"
          placeholder="请输入"
          :auto-size="{ minRows: 4, maxRows: 4 }"
          :maxLength="200"
        />
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch, Emit
} from 'vue-property-decorator';
import {
  State, Action, Mutation, namespace
} from 'vuex-class';
import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import bizModelsSelector from '@/components/global/biz-models-selector/index.vue';
import PageLoading from '@/components/shared/loading/page-loading/page-loading.vue';

import OrgApi from '@/apis/organization';
import * as OrganizationApi from '@/apis/organization';

import { locale } from 'moment';

const TaskTransferModule = namespace('Organization/taskTransfer');
@Component({
  name: 'AppsData',
  components: {
    StaffSelector,
    bizModelsSelector,
    PageLoading
  }
})
export default class AppsData extends Vue {
  @Prop() userid!: string


  visible:boolean = false
  modalTitle: string = '';
  handoverOpinions: string = '';
  type:string = 'section';
  toTransferTask(type){ // type: section / all
    this.type = type
    this.modalTitle = type === 'all' ? '交接全部数据' : '交接已选数据'
    this.visible = true
  }
  handleOk(){
    if(this.type === 'section'){
      this.transferTask('section')
    }else if(this.type === 'all'){
      this.showTransferTips('all')
    }else if(this.type === 'every'){
      this.showTransferTips('every')
    }
  }

  get tableColumns() {
    return this.columns.filter((c: any) => c.dataIndex !== 'index');
  }

  get transferSelected() {
    return !this.hasSelected || !this.targetUser.length || !this.transferDept || !this.schemaCode;
  }

  get transferAllItems() {
    return !this.myTask.length || !this.targetUser.length || !this.transferDept || !this.schemaCode;
  }

  get noTransferAll() {
    return !this.targetUser.length || !this.transferDept;
  }

  columns: Array<Organization.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'index' },
      align: 'center',
      width: 60
    }, {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: { customRender: 'name' },
      width: 186
    }, {
      dataIndex: 'ownerDept',
      slots: { title: 'ownerDeptTitle' },
      scopedSlots: { customRender: 'ownerDept' },
      width: 145
    }, {
      dataIndex: 'createdTime',
      slots: { title: 'createdTimeTitle' },
      scopedSlots: { customRender: 'createdTime' },
      width: 165
    }, {
      dataIndex: 'moduleName',
      slots: { title: 'moduleNameTitle' },
      scopedSlots: { customRender: 'moduleName' },
      width: 150
    }, {
      dataIndex: 'sequenceStatus',
      slots: { title: 'sequenceStatusTitle' },
      scopedSlots: { customRender: 'sequenceStatus' },
    }
  ]

  isDisable: boolean = false;

  targetUser = [];

  myTask = [];

  schemaCode: string = '';

  isLoading: boolean = false;

  transferDept: string = '';

  isSelectAll: boolean = false;

  showSelectAllBox: boolean = false;

  noBizModel: boolean = true;

  params = {
    userId: this.userid as string,
    schemaCode: '',
    sequenceStatus: '',
    page: 1,
    size: 20
  }

  totalElements: number = 0;

  hasSelected: number = 0;

  isSyncInstance: boolean = false;

  taffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true,
  }

  sequenceStatus: any = [];

  departmentList: any = [];

  sequenceStatusList: any = [
    {
      name: '进行中',
      checked: false,
      status: 'PROCESSING'
    },
    {
      name: '已完成',
      checked: false,
      status: 'COMPLETED'
    },
    {
      name: '已作废',
      checked: false,
      status: 'CANCELED'
    },
    {
      name: '草稿',
      checked: false,
      status: 'DRAFT'
    }
  ];

  /**
   * 分页参数
   */
  pageSizeOptions: Array<string> = [
    '10',
    '20',
    '50',
    '100'
  ]

  /**
   * 可选择“全部模型”时，传入的全部选项的代码
   */
  allModelOption: any = {
    title: '交接全部',
    value: 'authineAllModel',
  }

  /**
   * 是否选择了交接全部模型，如果是，则展示全部按钮
   */
  selectAllModel: boolean = false;

  /**
   * 加载待办任务
   */
  getTasks() {
    const vm: any = this;
    const params = { ...vm.params };
    params.page -= 1;
    params.schemaCode = vm.schemaCode;
    params.sequenceStatus = vm.sequenceStatus.join(';');
    vm.hasSelected = 0;
    vm.isSelectAll = false;
    OrgApi.getBusinessTaskByUser(params).then((res: any) => {
      if (res.errcode === 0 && res.data && res.data.content) {
        vm.totalElements = res.data.totalElements;
        const pageStart: number = (vm.params.page - 1) * vm.params.size;
        res.data.content.forEach((t: any, index: number) => {
          t.index = pageStart + index + 1;
          t.key = t.id;
          t.checked = false;
          t.hover = false;
          Object.entries(t).forEach((data: any) => {
            const [key, value] = data;
            if (typeof value !== 'boolean' && !value) {
              t[key] = '- -';
            } else if (key === 'sequenceStatus') {
              switch (value) {
                case 'DRAFT':
                  t[key] = '草稿';
                  break;
                case 'PROCESSING':
                  t[key] = '进行中';
                  break
                case 'COMPLETED':
                  t[key] = '已完成';
                  break
                case 'CANCELED':
                  t[key] = '已作废';
                  break
                default:
                  break;
              }
            }
          });
        });
        vm.myTask = res.data.content;
      } else {
        vm.totalElements = 0;
        vm.myTask = [];
      }
    });
  }

  addTargetUser(user: any, filterType?: string) {
    if (Array.isArray(user) && user.length) {
      this.getDepartmentList(user[0].id, 'admin');
    } else {
      this.departmentList = [];
      this.transferDept = '';
    }
  }

  /*
  * 获取当前用户的所属部门列表
  */
  getDepartmentList(userid: any, filterType?: string) {
    const params = {
      id: userid,
      filterType: 'admin'
    };
    OrganizationApi.getDepartmentList(params).then((res: any) => {
      if (res.errcode === 0 && Array.isArray(res.data)) {
        this.departmentList = res.data;
        if (this.departmentList.length) {
          this.transferDept = this.departmentList[0].deptId;
        }
      }
    });
  }

  /*
  * 交接任务提示窗
  */
  showTransferTips(type: string) {
    if (type === 'every' && this.noTransferAll) {
      return;
    }
    const vm: any = this;
    let confirmTitle = '';
    let confirmContent = '';
    let okText = '';
    if (type === 'every') {
      confirmTitle = vm.$t('languages.TaskTransfer.TransferAllAppData');
      confirmContent = vm.$t('languages.TaskTransfer.TransferAllContent');
      okText = vm.$t('languages.TaskTransfer.ContinueTransfer');
    } else {
      confirmTitle = vm.$t('languages.TaskTransfer.TranferTips', { num: vm.totalElements });
      // 交接完成后不可撤回，请谨慎操作
      confirmContent = vm.$t('languages.TaskTransfer.TranferTips3');
      okText = vm.$t('languages.Ok');
    }
    vm.transferTask(type);
    return

    vm.$confirm({
      title: confirmTitle,
      okText,
      cancelText: vm.$t('languages.Cancel'),
      content: confirmContent,
      onOk() {
        vm.transferTask(type);
      },
    });
  }

  /**
   * 交接任务
   */
  transferTask(type: string) {
    if (this.noTransferAll) {
      return;
    }

    const vm: any = this;
    const params = {
      transferAll: true,
      transferUserId: vm.targetUser[0].id,
      transferDeptId: vm.transferDept,
      userId: vm.userid,
      workItemIds: [],
      isBusiness: true,
      isSyncInstance: vm.isSyncInstance,
      schemaCode: vm.schemaCode,
      sequenceStatus: vm.sequenceStatus.join(';'),
      comment: this.handoverOpinions
    };

    if (type === 'every') {
      params.schemaCode = '';
    }

    if (type === 'section') {
      params.transferAll = false;
      const _ids: any = [];
      vm.myTask.forEach((data: any) => {
        if (data.checked) {
          _ids.push(data.id);
        }
      });
      params.workItemIds = _ids;
      this.isLoading = true;
    }

    OrgApi.taskTransfer(params).then((res: any) => {
      if (res.errcode === 0) {
        if (type === 'every') {
          this.$emit('showTip', true);
        } else {
          vm.$message.success('交接成功！', 2);
          vm.params.page = 1;
          vm.params.size = 20;
          vm.getTasks();
        }
        this.visible = false
        this.handoverOpinions = ''
      } else {
        /*
          errcode : 101002
          errmsg : 当前有业务正在交接，请等待上次交接结束后再发起交接。
         */
        this.$message.error(res.errmsg, 2);
      }
      this.isLoading = false;
      
    });
  }

  /**
    * 全选
    */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.myTask.forEach((item: any) => {
        item.checked = true;
      });
      this.hasSelected = this.myTask.length;
    } else {
      this.myTask.forEach((item: any) => {
        item.checked = false;
      });
      this.hasSelected = 0;
    }
  }

  /*
  * 当checkbox选择change时事件
  */
  onItemCheckboxChange() {
    const isCheckedItems = this.myTask.filter((d: any) => d.checked);
    this.hasSelected = isCheckedItems.length;
    if (isCheckedItems.length < this.myTask.length) {
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

  /**
   * 单据状态change事件
   */
  onStatusChange(value: string) {
    if (this.selectAllModel) {
      return;
    }

    this.params.page = 1;
    this.params.size = 20;
    this.getTasks();
  }

  /*
  * 业务模型、单据状态change事件
  */
  onWorkflowChange(value: any) {
    console.log('业务模型change', value);
    if (value === 'authineAllModel') {
      this.selectAllModel = true;
      this.myTask = [];
      this.totalElements = 0;
      this.schemaCode = value;
      this.noBizModel = this.schemaCode === '' || this.schemaCode === 'authineAllModel';
      return;
    } 

    this.selectAllModel = false;

    this.schemaCode = value;
    this.noBizModel = this.schemaCode === '';
    this.params.page = 1;
    this.params.size = 20;
    this.getTasks();
  }

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.params.page = page;
    this.params.size = pageSize;
    this.getTasks();
  }

  showSizeChange(current: number, size: number) {
    this.params.page = 1;
    this.params.size = size;
    this.getTasks();
  }

  /**
  * 打开表单
  */
  openForm(item: any) {
    const token = localStorage.getItem('token');
    if (token) {
      const url = `/form/detail?workitemId=${item.id}&workflowInstanceId=${item.instanceId}`;
      window.open(url);
    }
  }
}
</script>
<style lang="less" scoped>
.apps-data {
  &__page {
    padding-top: 10px;
    padding-bottom: 10px;
    & > div {
      float: right;
    }
    // 分页器高度调整
    /deep/.ant-pagination-options {
      height: 26px;
      .ant-pagination-options-size-changer {
        margin-top: 1px;
      }
    }
  }
  .search-tips {
    font-size: 12px;
    line-height: 22px;
    color: rgba(0, 0, 0, 0.45);
    margin-top: -11px;
    margin-bottom: 5px;
  }
  .change-originator {
    margin-left: 72px;
    margin-bottom: 6px;
    color: rgba(0, 0, 0, 0.85);
  }
  .row {
    padding: 0 0 20px 0;
    position: relative;
    &:after {
      content: "";
      display: block;
      clear: both;
    }
    &.first {
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e8e8e8;
    }
    div {
      line-height: 32px;
      float: left;
      &:first-child {
        margin-right: 23px;
      }
      &:last-child {
        float: right;
      }
      input {
        border-radius: 4px;
        padding: 5px 12px;
        width: 245px;
      }
      .user {
        width: 314px;
        vertical-align: middle;
        &::before{
          content: "";    // 解决未知样式污染
        }
      }
      .org-user {
        font-size: 0;
      }
      span.title {
        // margin-right: 22px;
        display: inline-block;
        width: 72px;
      }
      span.ant-input-affix-wrapper {
        width: auto;
      }
      .red {
        color: #f00;
        margin-right: 0px;
        position: absolute;
        top: 2px;
        left: -7px;
      }
      .btn {
        vertical-align: top;
        padding: 0 12px;
        text-align: center;
        span {
          margin: 0 0 0 4px;
        }
      }
    }
    .transfer-org {
      // float: left !important;
      position: relative;
      .input-select {
        width: 314px;
      }
      .red {
        color: #f00;
        margin-right: 0px;
        position: absolute;
        top: 2px;
        left: -7px;
      }
    }
    .biz-models {
      width: 314px;
      vertical-align: middle;
    }
  }
  .load-more {
    text-align: center;
    padding: 11px 0;
    span {
      padding: 11px 0;
      color: rgba(0, 0, 0, 0.45);
      font-weight: 400;
      font-size: 12px;
      cursor: pointer;
    }
  }
  .biz-model_tip {
    text-align: center;
    color: rgba(0, 0, 0, 0.45);
    line-height: calc(100vh - 420px - 17px);
    min-height: 21px;
    margin-top: 10px;
  }
  .no-bizmodel {
    /deep/.ant-table-placeholder {
      display: none;
    }
  }
  /deep/.ant-table-placeholder {
    color: rgba(0, 0, 0, 0.45);
  }
  /deep/.ant-table-thead > tr > th {
    color: rgba(0, 0, 0, 0.65);
  }
  /deep/.ant-table-body {
    max-height: calc(100vh - 430px - 17px) !important;
    overflow-x: hidden !important;
    color: rgba(0, 0, 0, 0.85);
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 0 10px;
    }
    table {
      padding: 0 !important;
    }
  }
  .index {
    width: 100%;
    height: 100%;
    display: inline-block;
    .text {
      padding: 0;
    }
  }
  .selected-count {
    padding: 6px 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  /deep/.ant-btn-background-ghost.ant-btn-primary[disabled] {
    background: #f5f5f5 !important;
  }
  .sub-btn {
    width: 100%;
    text-align: center;
    padding: 10px 0;
    position: absolute;
    bottom: 0;
    z-index: 100;
    margin-left: -24px;
    background: #fff;
    border-top: 1px solid rgba(232, 232, 232, 1);
    & > div {
      width: 802px;
      margin: 0 auto;
    }
    .btn {
      &:last-child {
        margin-left: 6px;
      }
      span {
        font-weight: 400;
      }
    }
    .transfer-all {
      float: right;
      color: @primary-color;
      line-height: 32px;
      cursor: pointer;
      &.disabled {
        color: rgba(0, 0, 0, 0.25);
        cursor: not-allowed;
      }
    }
  }
}
.cursor {
  cursor: pointer;
}

.tips{
  height: 40px;
  line-height: 38px;
  background: #FFFBE6;
  border-radius: 4px;
  border: 1px solid #FFE58F;
  padding: 0 16px;
  color: rgba(0, 0, 0, 0.65);
  span{
    margin-right: 10px;
    color: #FAAD14;
  }
}
.handover-opinions{
  display: flex;
  margin-top: 16px;
  label{
    display: inline-block;
    margin-right: 12px;
    white-space: nowrap;
    line-height: 1.5;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);

  }
}
</style>
