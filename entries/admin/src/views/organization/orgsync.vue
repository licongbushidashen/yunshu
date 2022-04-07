<template>
  <div class="org-synchronize-wrapper">
    <div class="org-tabs">
      <a-tabs defaultActiveKey="1" :animated="false" @change="toggleTab">
        <a-tab-pane tab="组织同步" key="1">
          <div class="org-synchronize">
            <img src="../../assets/images/synchronize.png" alt />
            <div v-if="!isCloudPivot" @click="startOrgsync">
              <span>{{ $t("languages.SynchronizeNow") }}</span>
            </div>

            <orgsync-form ref="orgsync" v-model="orgsyncFormVisible" @handleClose="handleClose"></orgsync-form>
          </div>
        </a-tab-pane>

        <a-tab-pane tab="同步日志" key="2">
          <smart-search @reset="resetParams" @search="onSearch">
            <div slot="search">
              <div class="header__item">
                <span>姓名/账号:</span>
                <a-input class="w" :placeholder="'请输入姓名/账号'" v-model="dataRuleName" />
              </div>

              <div class="header__item">
                <span>执行状态:</span>
                <a-select show-search class="w" placeholder="请选择" v-model="executState">
                  <a-select-option
                    v-for="(item, index) in executStateList"
                    :key="index"
                    :value="item.code"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </div>

              <div class="header__item">
                <span>执行时间:</span>
                <a-range-picker class="w" :placeholder="['开始时间','结束时间']" v-model="executTime" />
              </div>
            </div>
          </smart-search>
          <div class="log-table">
            <a-table
              :columns="tableHead"
              :pagination="false"
              :loading="loading"
              :scroll="{ y: 600 }"
              :dataSource="dataSource"
              :rowKey="(record) => record.id"
            >
              <span slot="customIndex" class="title">序列</span>
              <span slot="customName" class="title">姓名</span>
              <span slot="customAccount" class="title">用户账号</span>
              <span slot="customStatus" class="title">执行状态</span>
              <span slot="customStartTime" class="title">开始时间</span>
              <span slot="customEndTime" class="title">结束时间</span>
              <span slot="customAction" class="title">操作</span>
              <span slot="action" slot-scope="text, record">
                <a-button class="detail" type="link" block @click="openLogDetail(record.id)">打开详情</a-button>
              </span>
              <span slot="customStatusOpen" slot-scope="text, record">
                <a href="javascript:;" @click="openLogDetail(record.id)">{{text}}</a>
              </span>
            </a-table>
          </div>

          <div class="log-footer">
            <div v-show="totalPage > 0">
              <a-pagination
                :defaultPageSize="params.size"
                :total="totalPage"
                :showTotal="(total) => `共${totalPage}条`"
                :current="params.page + 1"
                :pageSizeOptions="pageSizeOptions"
                showSizeChanger
                showQuickJumper
                @change="pageChange"
                @showSizeChange="pageSizeChange"
              />
            </div>
          </div>

          <log-detail :id="logId" v-model="isShowLogDetailVisible"></log-detail>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<style lang="less">
.org-synchronize-wrapper {
  .org-tabs {
    .ant-tabs-bar {
      margin: 0;
      padding: 0 23px;
    }
    .smart-search {
      margin: 8px 0;
    }
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

  .org-synchronize {
    margin: 99px auto;
    width: 315px;
    text-align: center;
    border-radius: 10px;
    color: #fff;
    & > div {
      margin-top: 22px;
      background-color: @primary-color;
      border-radius: 8px;
      cursor: pointer;
      span {
        font-size: 16px;
        line-height: 48px;
        color: #fff;
        padding-left: 4px;
      }
    }
    & > div.loading-btn {
      opacity: 0.5;
      filter: Alpha(opacity=50);
      -moz-opacity: 0.1;
      cursor: not-allowed;
    }
    img {
      width: 250px;
    }
  }

  .log-table {
    padding: 0 25px 0px 25px;
    min-width: 1200px;

    .ant-table-wrapper {
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .ant-table-thead {
      box-shadow: 0px -1px 0px 0px rgba(232, 232, 232, 1);
      border-radius: 4px 4px 0px 0px;
      overflow: hidden;
    }

    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 8px 16px;
      padding-top: 9px;
    }

    .ant-table-thead > tr > th {
    }

    .ant-table-tbody > tr > td {
      .detail {
        color: #17bc94;
        text-align: left;
      }

      // padding-left: 34px;

      &:first-child {
        padding-left: 16px;
      }
    }

    .title {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);

      .line {
        display: inline-block;
        vertical-align: middle;
        width: 1px;
        height: 22px;

        margin-right: 16px;
        background: rgba(232, 232, 232, 1);
      }
    }

    /deep/.ant-table-body {
      color: rgba(0, 0, 0, 0.85);
      // max-height: 600px !important;
      max-height: calc(100vh - 258px) !important;
      height: calc(100vh - 258px) !important;
      /deep/.ant-table-row:last-child td {
        border-bottom: none !important;
      }
      // max-height: calc(100vh - 300px)!important;
      // @media screen and (min-width: 1670px) {
      // }
    }
  }

  .log-footer {
    border-top: 1px solid rgba(232, 232, 232, 1);
    & > div {
      float: right;
      padding: 8px 0;
      margin-right: 24px;
    }
    /deep/.ant-pagination-options-quick-jumper input {
      vertical-align: top;
    }
    /deep/.ant-pagination-options {
      height: 32px;
    }
  }
  &__link {
    color: @primary-color;
  }
  /deep/.ant-pagination-total-text {
    margin-right: @base4-padding-md;
  }
}
</style>
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator';
import organizationApi from '../../apis/organization';
import OrgsyncForm from './import/orgsync-form.vue'; // 同步组织弹窗
import LogDetail from './import/log-detail.vue'; // 同步组织弹窗
import SmartSearch from '@/components/global/smart-search.vue';
import { getNearWork } from '../system/log/data-rule-info/typings/help';
import moment from 'moment';
interface IexecutState {
  code: number | string | boolean;
  name: string;
}
enum Estate {
  Success = 1,
  Fail = 2,
  All = 0,
}
interface OrgsyncParams {
  /**姓名/账号 */
  name: string;
  /**执行状态 */
  executeStatus: number | string | boolean;
  /**开始时间 */
  startTime: string;
  /**结束时间 */
  endTime: string;
  page: number;
  size: number;
}

@Component({
  name: 'Orgsync',
  components: {
    OrgsyncForm,
    SmartSearch,
    LogDetail,
  },
})
export default class Synchronize extends Vue {
  $message: any;
  orgsyncFormVisible: boolean = false;
  isShowLogDetailVisible: boolean = false;
  loading: boolean = true;
  selectOptions: any = [];
  logId: string = '';

  executStateList: Array<IexecutState> = [
    { code: Estate.All, name: '全部' },
    { code: Estate.Success, name: '成功' },
    { code: Estate.Fail, name: '失败' },
  ];
  executState: Estate = Estate.All;
  executTime: any[] = []; // 执行时间
  dataRuleName: string = ''; // 姓名/账号

  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  params: any = {
    page: 0,
    size: 20,
  };

  nextClick = true;
  dataSource = [];

  totalPage: number = 9;
  searchKey: string = '';

  tableHead: Array<object> = [
    {
      dataIndex: 'index',
      slots: { title: 'customIndex' },
      width: 60,
      align: 'center',
    },
    {
      dataIndex: 'createrName',
      slots: { title: 'customName' },
      scopedSlots: { customRender: 'customStatusOpen' },
      width: 150,
    },
    {
      dataIndex: 'createrUserName',
      slots: { title: 'customAccount' },
      scopedSlots: { customRender: 'customStatusOpen' },
      width: 200,
    },
    {
      dataIndex: 'executeStatus',
      slots: { title: 'customStatus' },
      scopedSlots: { customRender: 'customStatusOpen' },
      sorter: (a: any, b: any) => a.executeStatus.length - b.executeStatus.length,
      width: 150,
    },
    {
      dataIndex: 'startTime',
      slots: { title: 'customStartTime' },
      width: 210,
    },
    {
      dataIndex: 'endTime',
      slots: { title: 'customEndTime' },
      width: 210,
    },
    {
      slots: { title: 'customAction' },
      scopedSlots: { customRender: 'action' },
    },
  ];

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  /**
   * 打开日志详情
   */
  openLogDetail(id: string) {
    this.isShowLogDetailVisible = true;
    this.logId = id;
  }

  /**
   * 点击立即同步按钮
   */
  async startOrgsync() {
    const orgsync:any = (this as any).$refs.orgsync;
    const syncTaskId:any = (window as any).localStorage.getItem('syncTaskId');
    const orgPartSync:any = (window as any).localStorage.getItem('orgPartSync');
    if (syncTaskId || orgPartSync) {
     return this.$message.warn('正在同步中,请等待同步完成后再操作...');
    }
    console.log(orgsync.syncLoadingStatus, 'orgsync');
    if(this.nextClick) this.orgsyncFormVisible = true;
  }

  /**
   * 切换组织同步与同步日志
   */
  toggleTab(activeKey: string) {
    if (activeKey === '1') return;

    this.params.page = 0;
    this.getLogList();
  }

  handleClose(nextClick:boolean){
    console.log(nextClick, 'nextClick');
    this.nextClick = nextClick;
  }

  /**
   * 获取同步日志
   */
  async getLogList() {
    this.loading = true;
    const res: any = await organizationApi.getLogList(this.getParams());
    this.loading = false;

    if (res.errcode === 0) {
      this.dataSource = res.data.content;
      this.dataSource.forEach((item: any, index: number) => {
        item.index = index + 1 + this.params.page * this.params.size;
        item.executeStatus =
          item.executeStatus === 1 ? '成功' : '失败 ';

        Object.entries(item).forEach((data: any) => {
          const [key, value] = data;

          if (typeof value !== 'boolean' && !value) {
            item[key] = '- -';
          }
        });
      });
      this.totalPage = res.data.totalElements;
    }
  }

  // 查询
  onSearch() {
    this.params.page = 0;
    console.log(this.getParams())
    this.getLogList();
  }

  // 重置
  resetParams() {
    const nearWeek = getNearWork();
    this.executTime = [moment(nearWeek[0]), moment(nearWeek[1])];
    this.executState = Estate.All;
    this.dataRuleName = '';
    this.onSearch();
  }

  // 组装查询参数
  getParams(): OrgsyncParams {
    let startTime: string = "";
    let endTime: string = "";
    if (this.executTime.length > 0) {
      startTime = moment(this.executTime[0]).format("YYYY-MM-DD");
      endTime = moment(this.executTime[1]).format("YYYY-MM-DD");
    }
    const param: OrgsyncParams = {
      startTime,
      endTime,
      name: this.dataRuleName,
      executeStatus: this.executState,
      page: this.params.page,
      size: this.params.size
    };
    return param;
  }

  /**
   * 翻页
   */
  pageChange(page: number, pageSize: number) {
    this.params.page = page - 1;
    this.params.size = pageSize;
    this.getLogList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.params.page = 0;
    this.params.size = pageSize;
    this.getLogList();
  }

  created(){
    (window as any).localStorage.removeItem('syncTaskId');
    (window as any).localStorage.removeItem('orgPartSync');
  }
}
</script>
