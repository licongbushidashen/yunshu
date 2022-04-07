<template>
  <div class="base-info">
    <div class="base-info-header">
      <span>基本信息</span>
      <a-tooltip placement="top">
        <template slot="title">
          <span>表单详情</span>
        </template>
        <i class="icon aufontAll h-icon-all-text-file-o" @click="goForm"></i>
      </a-tooltip>
      <a-tooltip placement="top">
        <template slot="title">
          <span>历史运行流程</span>
        </template>
        <i class="icon aufontAll h-icon-all-resumption-applicati" @click="goHistoryWorkflow"></i>
      </a-tooltip>
    </div>
    <div class="base-info-content">
      <a-row class="base-info-content__row">
        <a-col :span="2"><label>流程状态</label></a-col>
        <a-col :span="10"><span>{{ getStatus(baseInfo.status) }}</span></a-col>
        <a-col :span="2"><label>发起人</label></a-col>
        <a-col :span="10"><span>{{ baseInfo.originatorName }}</span></a-col>
      </a-row>
      <a-row class="base-info-content__row">
        <a-col :span="2"><label>发起时间</label></a-col>
        <a-col :span="10"><span>{{ baseInfo.startTime }}</span></a-col>
        <a-col :span="2"><label>结束时间</label></a-col>
        <a-col :span="10"><span>{{ finishTime }}</span></a-col>
      </a-row>
      <a-row class="base-info-content__row">
        <a-col :span="2"><label>流程模版</label></a-col>
        <a-col :span="10"><span>{{ baseInfo.workflowName }}</span></a-col>
        <a-col :span="2"><label>运行方式</label></a-col>
        <a-col :span="10"><span>{{ baseInfo.runMode === 'AUTO' ? '自动运行': '手动运行' }}</span></a-col>
      </a-row>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  name: 'BaseInfo',
})
export default class BaseInfo extends Vue {
  @Prop() baseInfo!: any;

  @Prop() workflowInstanceId!: string;

  get finishTime() {
    return this.baseInfo.status === 'CANCELED' ? this.baseInfo.cancelTime:this.baseInfo.finishTime;
  }

  /* 
  * 获取流程状态  
  */
  getStatus(status:string) {
    let stateTxt:string = '';
    switch (status) {
      case 'EXCEPTION':
        stateTxt = '异常';
        break;
      case 'PROCESSING':
        stateTxt = '进行中';
        break;
      case 'COMPLETED':
        stateTxt = '已完成';
        break;
      case 'CANCELED':
        stateTxt = '已作废';
        break;
      case 'DRAFT':
        stateTxt = '草稿';
        break;
    }
    return stateTxt;
  }

  /* 
  * 跳转到表单详情页
  */
  goForm() {
    this.$router.push({
      name: 'mockForm',
      params: {
        appCode: this.$route.params.appCode,
        bizSchemaCode: this.$route.params.bizSchemaCode,
        workflowCode: this.$route.params.workflowCode
      },
      query: {
        workflowInstanceId: this.workflowInstanceId,
        workflowMock: 'true',
        onlyView: 'true',
      }
    }).catch((err: any) => {err});
  }

  /* 
  * 跳转到历史运行流程
  */
  goHistoryWorkflow() {
    this.$router.push({
      name: 'mockHistory',
      params: {
        appCode: this.$route.params.appCode,
        bizSchemaCode: this.$route.params.bizSchemaCode,
        workflowCode: this.$route.params.workflowCode
      },
      query: {
        workflowMock: 'true',
      }
    }).catch((err: any) => {err});
  }
 
}
</script>

<style lang="less" scoped>
.base-info{
  &-header{
    height: 56px;
    line-height: 56px;
    margin-bottom: 16px;
    &>span{
      font-size: 18px;
      font-weight: 600;
      color:rgba(0,0,0,0.85);
    }
    i{
      color:rgba(0,0,0,0.45);
      font-size: 14px;
      margin-left: 18px;
      cursor: pointer;
      &:hover{
        color: @primary-color;
      }
    }
  }
  &-content{
    margin-bottom: 3px;
    &__row{
      margin-bottom: 20px;
      /deep/.ant-col-2{
        color: rgba(0,0,0,0.65);
      }
      /deep/.ant-col-10{
        color: rgba(0,0,0,0.85);
      }
    }
  }
}
</style>