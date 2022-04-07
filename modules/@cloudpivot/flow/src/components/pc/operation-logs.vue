<template>
  <div class="form-operation-logs">
    <div class="header form-header">
      <div class="back">
<!--        <a-->
<!--          href="javascript:"-->
<!--          class="link"-->
<!--          @click="back"-->
<!--        >{{ $t('cloudpivot.flow.pc.Back') }}</a>-->
<!--        <span class="line">|</span>-->
        <i @click="back" class="back-icon icon aufontAll h-icon-all-arrow-left-o router-link-active"></i>
        <label>{{ $t('cloudpivot.flow.pc.OperationLogs') }}</label>
      </div>
    </div>
    <section class="main">
      <a-table
        class="bpm-table"
        :columns="columns"
        :rowKey="rowKey"
        :dataSource="this.data"
        :pagination="false"
        size="small"
      >
        <a
          slot="approval"
          slot-scope="text,record"
          href="javascript:void(0)"
          @click="showDetail(record)"
        >{{ $t('cloudpivot.flow.pc.View') }}</a>

        <!-- 序号 -->
        <span
          slot="codeTitle"
        >{{ $t('cloudpivot.flow.pc.Number') }}</span>

        <!-- 操作类型 -->
        <span
          slot="operationTypeNameTitle"
          class="resize"
        >{{ $t('cloudpivot.flow.pc.OperationType') }}</span>

        <!-- 操作时间 -->
        <span
          slot="timeTitle"
          class="resize"
        >{{ $t('cloudpivot.flow.pc.OperationTime') }}</span>

        <!-- 用户 -->
        <span
          slot="usernameTitle"
          class="resize"
        >{{ $t('cloudpivot.flow.pc.User') }}</span>

        <!-- 操作对象 -->
        <span
          slot="operateNodeTitle"
          class="resize"
        >{{ $t('cloudpivot.flow.pc.Operations') }}</span>

        <!-- 平台 -->
        <span
          slot="clientTitle"
          class="resize"
        >{{ $t('cloudpivot.flow.pc.Platform') }}</span>

        <!-- ip -->
        <span
          slot="ipTitle"
          class="resize"
        >IP</span>

        <!-- 详细 -->
        <span
          slot="approvalTitle"
          class="resize"
        >{{ $t('cloudpivot.flow.pc.Detail') }}</span>
      </a-table>
      <PageLoading v-model="loading"></PageLoading>
    </section>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue
} from 'vue-property-decorator';
import {
  Table
} from '@h3/antd-vue';

import confirm from './confirm';
import { ConfirmOptions } from './confirm/confirm';
import common from '@cloudpivot/common/pc';
import { workflowApi }  from '@cloudpivot/api';

@Component({
  name: 'form-operation-logs',
  components: {
    ATable: Table,
    PageLoading: common.components.PageLoading
  }
})
export default class FormOperationLogs extends Vue {
  loading: Boolean = true;

  data: any[] = [];

  columns: any[] = [
    {
      dataIndex: 'code',
      width: 50,
      slots: { title: 'codeTitle' },
      customRender: (text: any, record: any, index: number) => index + 1
    },
    {
      dataIndex: 'operationTypeName',
      slots: { title: 'operationTypeNameTitle' },
      width: 150
    },
    {
      dataIndex: 'time',
      slots: { title: 'timeTitle' },
      width: 150
    },
    {
      dataIndex: 'username',
      slots: { title: 'usernameTitle' },
      width: 100
    },
    {
      dataIndex: 'operateNode',
      slots: { title: 'operateNodeTitle' },
      width: 150
    },
    {
      dataIndex: 'client',
      slots: { title: 'clientTitle' },
    },
    {
      dataIndex: 'ip',
      slots: { title: 'ipTitle' },
      width: 120,
    },
    {
      dataIndex: 'approval',
      slots: { title: 'approvalTitle' },
      width: 80,
      scopedSlots: { customRender: 'approval' }
    }
  ];

  created() {
    const workflowInstanceId: any = {
      workflowInstanceId: (this.$route.params as any).workflowInstanceId
    };
    workflowApi.getWorkflowOperationLog(workflowInstanceId).then((res: any) => {
      this.data = res.data || [];
      this.loading = false;
    });
  }

  /**
   * 回退事件
   */
  back() {
    this.$router.go(-1);
  }

  /**
   * row key
   * @param record
   * @param index
   */
  rowKey(record: any, index: number) {
    return index;
  }

  /**
   * 打开详情
   * @param data
   * NOTE: 同意: 1, 驳回: 2, 转办: 3, 被取消: 4, 打开表单: 5, 暂存: 6, 撤回: 7, 提交: 8, 不同意: 9, 协办: 10, 加签: 11, 传阅: 12,结束流程: 13,作废: 14,下载附件: 15,打印: 16,编辑: 17,管理员激活节点: 18,管理员调整当前处理人: 19,管理员提前结束流程: 20,管理员取消当前节点所有任务: 21
   */
  showDetail(data: any) {
    if (data.operationType === 26 || data.operationType === 6 || data.operationType === 8) {
      const id:string = data.id;
      window.open('/from/operation-log-compare/' + id);
      return ;
    }
    const formOptions: ConfirmOptions = {
      title: `${this.$t('cloudpivot.flow.pc.DetailInfo')}`,
      content: `${ data.detail ? data.detail : this.$t('cloudpivot.flow.pc.NoDetail')}`,
      buttons: ['ok'],
      align: 'center',
      buttonsText: [`${this.$t('cloudpivot.flow.pc.Cancel')}`, `${this.$t('cloudpivot.flow.pc.OK')}`]
    };
    confirm(formOptions);
  }
}
</script>

<style lang="less">
  // @import "../../../styles/themes/default.less";
  .form-operation-logs{
    .bpm-table{
      padding: 32px @base4-padding-xs;
    }
    .back{
      flex: 0 0 250px !important;
    }
    .ant-table-thead{
      >tr>th{
        color: @light-color-2;
        font-weight: @font-weight-lg;
      }
    }
    .ant-table-body {
      > table {
        color: @light-color-1;
      }
    }
    .back-icon{
      cursor: pointer;
      color: rgba(0,0,0,0.65);
      margin-right: 8px;
      &:hover{
        color: #2970ff;
      }
    }
  }
</style>
