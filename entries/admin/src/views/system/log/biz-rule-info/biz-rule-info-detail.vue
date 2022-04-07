<!--
 * @Author: panwl
 * @Date: 2020-05-07 11:02:54
 * @LastEditTime: 2020-05-21 17:18:30
 * @LastEditors: Please set LastEditors
 * @Description: 业务规则日志
 * @FilePath: \frontend\entries\admin\src\views\system\log\biz-rule-info\biz-rule-inf.vue
 -->
 
<template>
  <div class="biz-rule-info-detail">
    <p class="biz-rule-info-detail-title">详细信息</p>
    <div class="biz-rule-info-detail-msg">
      <a-row>
        <a-col class="info-label" :span="4">应用名称：</a-col>
        <a-col :span="8">{{ selectData.appName }}</a-col>
        <a-col class="info-label" :span="4">业务模型：</a-col>
        <a-col :span="8">{{ selectData.functionName }}</a-col>
      </a-row>
      <a-row>
        <a-col class="info-label" :span="4">业务规则名称：</a-col>
        <a-col :span="8">{{ detailData.businessRuleLogHeaderModel.businessRuleName }}</a-col>
        <a-col class="info-label" :span="4">业务规则编码：</a-col>
        <a-col :span="8">{{ detailData.businessRuleLogHeaderModel.businessRuleCode }}</a-col>
      </a-row>
      <a-row>
        <a-col class="info-label" :span="4">执行状态：</a-col>
        <a-col :span="8" :class="[detailData.businessRuleLogHeaderModel.success?'success':'fail']">{{ detailData.businessRuleLogHeaderModel.success ? '成功' : '失败' }}</a-col>
        <a-col class="info-label" :span="4">异常节点：</a-col>
        <a-col :span="8">{{ !detailData.businessRuleLogContentModel.exceptionNodeName?'-': detailData.businessRuleLogContentModel.exceptionNodeName}}</a-col>
      </a-row>
      <a-row>
        <a-col class="info-label" :span="4">执行结束时间：</a-col>
        <a-col :span="8">{{ detailData.businessRuleLogHeaderModel.endTime }}</a-col>
        <a-col class="info-label" :span="4">执行开始时间：</a-col>
        <a-col :span="8">{{ detailData.businessRuleLogHeaderModel.startTime }}</a-col>
      </a-row>
      <a-row>
        <a-col class="info-label" :span="4">执行动作：</a-col>
        <a-col :span="8">{{detailData.businessRuleLogHeaderModel.repair?'修复动作':'系统调用'  }} </a-col>
      </a-row>
    </div>
    <a-divider />
    <p class="biz-rule-info-detail-title">异常信息</p>
    <div class="biz-rule-info-detail-implementstate">
      <a-row>
        <a-col class="info-label" :span="4">异常信息详情：</a-col>
        <a-col :span="20">{{ !detailData.businessRuleLogContentModel.exceptionContent?'无':detailData.businessRuleLogContentModel.exceptionContent }}</a-col>
      </a-row>
    </div>
    <div class="biz-rule-info-detail__footer">
      <a-button type="default" @click=" $emit('close')">关闭</a-button>
      <a-button type="primary" @click="rollBack" style="margin-left:5px" v-if="detailData.businessRuleLogHeaderModel.showRetryBtn">重新执行</a-button>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator';
import { systemManageApi } from '@cloudpivot/api';

@Component({
  name: 'biz-rule-info-detail',
})
export default class BizRuleInfoDetail extends Vue {
  @Prop()
  selectData!: any;
  detailData: any = {};

  created() {
    this.getDetail(this.selectData.flowInstanceId);
  }

  getDetail(id: string) {
    if (!id) return;
    const vm: any = this;
    systemManageApi.getBusinessRuleLog(id).then(res => {
      if (res.errcode === 0) {
        vm.detailData = res.data;
      }
    })
  }

  isRollBack: boolean = false;
  rollBack() {
    if (this.detailData && this.detailData.businessRuleLogHeaderModel) {
      if (!this.isRollBack) {
        const rollBackLoading = (this.$message as any).loading("", 0);
        const flowInstanceId: string = this.detailData.businessRuleLogHeaderModel.flowInstanceId || '';
        flowInstanceId && systemManageApi.retryBusinessRule(flowInstanceId).then(res => {
          if (res && res.errcode === 0) {
            this.detailData.businessRuleLogHeaderModel.showRetryBtn = false;
            this.$message.success('执行成功');
          }
          else {
            this.$message.error('执行失败');
          }
          rollBackLoading();
          setTimeout(() => {
            this.isRollBack = false;
          }, 1000)
        }, err => {
          rollBackLoading();
          setTimeout(() => {
            this.isRollBack = false;
          }, 1000)
        })
        this.isRollBack = true;
      }
    }
  }
}
</script>

<style lang='less' scoped>
.biz-rule-info-detail {
  &-title {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    line-height: 22px;
    margin-bottom: 16px;
  }
  &-msg {
    /deep/.ant-row {
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
      .info-label {
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
  &-implementstate {
    /deep/.ant-row {
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
      .info-label {
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
  &__footer {
    position: absolute;
    z-index: 5;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    text-align: center;
    border-top: 1px solid #e8e8e8;
    background-color: #fff;
  }
}
.fail {
  color: #f4454e;
}
.success {
  color: #17bc94;
}
</style>