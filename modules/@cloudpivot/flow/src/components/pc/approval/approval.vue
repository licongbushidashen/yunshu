
<template>
  <div class="form-approval">
    <!-- 已完成流程增加结束 -->
    <div class="form-approval__item" v-if="completed || canceled">
      <div class="form-approval__workflow">
        <div class="form-approval__title">
          <label>{{ $t('cloudpivot.flow.pc.Finish') }}</label>
        </div>
        <div class="form-approval__trail">
          <div class="form-approval__line"></div>
          <i class="icon aufontAll form-approval__line-icon PASS"></i>
          <div class="form-approval__line"></div>
        </div>
      </div>
      <div class="form-approval__instances">
        <div class="form-approval__instance">
          <div class="form-approval__progress">
            <div class="form-approval__date end">{{ finishTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-for="(approval, i) in approvalsData" :key="i" class="form-approval__item">
      <div class="form-approval__workflow">
        <div class="form-approval__title">
          <label>{{ isChinese ? approval.activityName : approval.name_i18n[$i18n.locale] }}</label>
        </div>
        <div class="form-approval__trail">
          <div class="form-approval__line"></div>
          <!-- <i :class="`form-approval__line-icon ${approval.activityStatus}`"></i> -->
          <i :class="`icon aufontAll form-approval__line-icon ${approval.activityStatus}`"></i>
          <div class="form-approval__line"></div>
        </div>
      </div>
      <div class="form-approval__instances">
        <template v-if="approval.nodes.length > 1">
          <a-collapse :bordered="false">
            <a-collapse-panel :showArrow="false" class="approval-item-collapse">
              <template v-slot:header="props">
                <a-icon :type="props.isActive ? 'minus-circle-o' : 'plus-circle-o'" />
                <span v-show="!props.isActive">{{ approvalStats(approval.nodes) }}</span>
              </template>
              <template v-for="(node, g) in approval.nodes">
                <approval-item
                  :key="g"
                  :node="node"
                  :isCirculate="approval.isCirculate"
                  :mockMode="mockMode"
                  :subInstanceActivity="approval.subInstanceActivity"
                  @download="download"
                  @previewImage="previewImage"
                />
              </template>
            </a-collapse-panel>
          </a-collapse>
        </template>
        <template v-else v-for="(node, g) in approval.nodes">
          <approval-item
            :key="g"
            :node="node"
            :isCirculate="approval.isCirculate"
            :mockMode="mockMode"
            :subInstanceActivity="approval.subInstanceActivity"
            @download="download"
            @previewImage="previewImage"
          />
        </template>
      </div>
    </div>
    <a-modal
      v-model="isPreviewImage"
      :footer="null"
      :maskClosable="false"
      :keyboard="false">
      <img style="width: 100%" :src="img" />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Modal, Collapse, Icon } from "@h3/antd-vue";
// import { renderer } from "@cloudpivot/form";
import common from '@cloudpivot/common';

import { workflow, workflowApi, user } from "@cloudpivot/api";

import ApprovalItem from './approval-item.vue';

import { workflowActionStatus } from '@cloudpivot/flow/src/typings/workflow-enum'

@Component({
  name: "form-approval",
  components: {
    AModal: Modal,
    AIcon: Icon,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ApprovalItem
  }
})
export default class FormApproval extends Vue {
  //@Prop({ default: () => [] })
  approvals: workflow.ApprovalInstance[] = []; // 流程实例

  @Prop({
    default: ''
  })
  workflowInstanceId !: string

  @Prop({
    default: false
  })
  completed !: boolean

  @Prop({
    default: false
  })
  canceled !: boolean

  @Prop()
  finishTime !: string

  @Prop({ default: false }) mockMode?: any;

  @Prop()
  getFileUrlFn !: (file: any) => string;

  isPreviewImage: boolean = false;

  img: string = "";

  @Watch('workflowInstanceId', {
    immediate: true
  })
  onWorkflowInstanceIdChange(id: string) {
    if (id) {
      workflowApi.getApproval({
        workflowInstanceId: id
      }).then(res => {
        if (res.errcode === 0) {
          if (Array.isArray(res.data)) {
            res.data.forEach((d: any) => {
              common.utils.compatible(d, 'activityName');
            });
          }
          this.approvals = res.data || [];
        } else {
          this.approvals = [];
        }
      });
    } else {
      this.approvals = [];
    }
  }

  previewImage(file: any) {
    this.isPreviewImage = true;
    this.img = file.img;
  }



  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  get approvalsData() {
    const approvals = Object.assign([], this.approvals);
    approvals.forEach((item: workflow.ApprovalInstance) => {
      if (!item.subInstanceActivity) {
        if (item.nodes && item.nodes.length) {
          const noStartedApprovaler: user.Info[] = [];
          const inProgressApprovaler: user.Info[] = [];
          item.nodes = item.nodes.map((node: any) => {
            if (node.resources && node.resources.length) {
              node.resources = node.resources.map((signatrue: any) => {
                const s: any = {
                  img: "",
                  file: signatrue,
                  hover: false
                };
                if (this.getFileUrlFn && signatrue.name === "signsture.png") {
                  s.img = this.getFileUrlFn(
                    signatrue
                  );
                }
                return s;
              });
            }

            // 过滤 1 未启动 和 2 进行中的节点, 进行数据重组
            if (node.workItemStatus === 1 || node.workItemStatus === 2) {
              node.approvaler.trustor = node.trustor;
              node.approvaler.circulations = node.circulations;
              node.approvaler.from = node.from;
              node.from = node.from;
              node.workItemStatus === 1 ? noStartedApprovaler.push(node.approvaler) : inProgressApprovaler.push(node.approvaler);
              return;
            }
            return node;
          }).filter(Boolean);

          if (noStartedApprovaler.length) {
            item.nodes.push({ workItemStatus: 1, approvaler: noStartedApprovaler } as workflow.ApprovalNode);
          }
          if (inProgressApprovaler.length) {
            item.nodes.push({ workItemStatus: 2, approvaler: inProgressApprovaler } as workflow.ApprovalNode);
          }
        }
      }
    });
    return approvals.reverse();
  }

  download(refId: string) {
    // const token = localStorage.getItem('token') || '';
    // const url = `${env.apiHost}/api/aliyun/download?refId=${refId}&T=${token}`;
    // window.open(url);
    this.$emit("download", {
      refId
    });
  }

  /**
   * 统计多个审批节点workActionType的状态信息
   */
  approvalStats(nodes: Array<any>) {
    if (!Array.isArray(nodes) || !nodes.length) {
      return '';
    }

    const stats: Array<{ action: string, total: number, label: string }> = [];

    Object.entries(workflowActionStatus).forEach(([action, label]) => {
      const sameActionItems: Array<any> = nodes.filter((node: any) => `${node.workActionType}` === action);
      if (sameActionItems.length) {
        stats.push({
          action,
          label,
          total: sameActionItems.length
        });
      }
    });

    const statsMessage: string = stats.map((stat: any) => (stat.total + '人' + this.$t(`cloudpivot.flow.pc.WorkflowActionStatus.${stat.label}`))).join('；');

    return statsMessage;

  }
}
</script>


<style lang="less">
// @import "../../../../styles/themes/default.less";
@import "../../style";
.form-approval {
  // width: 1024px;
  margin: auto;
  &__item {
    display: flex;
  }
  &__item:first-child {
    .form-approval__trail {
      padding-top: 10px;
      .form-approval__line:first-child {
        display: none;
      }
    }
  }
  &__item:last-child {
    .form-approval__trail {
      .form-approval__line:last-child {
        display: none;
      }
    }
  }
  &__workflow {
    display: flex;
    flex: 0 0 148px;
  }
  &__title {
    display: flex;
    justify-content: flex-end;
    flex: 0 0 90px;
    width: 90px;
    // margin-top: @base4-padding-xs;
    margin-top: @base10-padding-sm;
    color: @light-color-1;
    label {
      display: block;
      word-wrap: break-word;
      word-break: break-all;
    }
  }
  &__instances {
    flex: 1 1;
  }
  &__trail {
    flex: 0 0 10px;
    margin: 0 @base4-padding-lg;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  // &__line-icon {
  //   flex: 0 0 10px;
  //   margin: @base4-padding-base 0;
  //   width: 10px;
  //   border: 2px solid rgba(50, 182, 131, 1);
  //   border-radius: 50%;
  //   &.UNPASS {
  //     border-color: #f4454e;
  //   }
  //   &.INPROGRESS {
  //     border-color: #2970ff;
  //   }
  // }
  &__line-icon {
    flex: 0 0 14px;
    width: 14px;
    height: 14px;
    line-height: 14px;
    margin: @base4-padding-base 0;
    color: #ffffff;
    background-color: #32b683;
    border-radius: 50%;
    text-align: center;
    font-size: 10px;
    &.UNPASS {
      background-color: #f5222d;
    }
    &.INPROGRESS {
      background-color: #ffffff;
    }
    &.END {
      background-color: rgba(0, 0, 0, 0.45);
    }
    &.PASS:before {
      content: "\e98f";
    }
    &.UNPASS:before {
      content: "\e996";
    }
    &.END:before {
      content: "\e8d5";
    }
    &.INPROGRESS:before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-top: 2px;
      border: 2px solid #2970ff;
      border-radius: 50%;
    }
  }
  &__line {
    flex: 1 1;
    width: 2px;
    background: rgba(232, 232, 232, 1);
  }
  &__line:first-child {
    flex: 0 0 10px;
  }
  &__instance {
    display: flex;
  }
  &__avatar {
    flex: 0 0 40px;
    margin-right: @base4-padding-md !important;
    border: 1px solid #eaedf3;
  }
  &__coming {
    border: 1px solid #32B683;
    span {
      color: #fff;
    }
  }
  &__content {
    flex: 1 1;
    padding-bottom: @base4-padding-lg;
    > *:first-child {
      margin-bottom: @base4-padding-base;
    }
    > * {
      margin-bottom: @base4-padding-xs;
    }
    > *:last-child {
      margin: 0;
    }
  }
  &__org,
  &__date {
    font-size: @font-size-12;
    display: inline-block;
  }
  &__date {
    color: @light-color-3;
    margin-left: @base4-padding-md;
  }
  .end {
    margin-left: 0;
    &:before {
      display: none;
    }
  }
  &__info label {
    margin-right: @base4-padding-xs;
    color: @light-color-1;
  }
  &__text {
    padding: @base4-padding-xs;
    color: @light-color-1;
    font-size: @font-size-12;
    background-color: #f4f6fc;
    border-radius: @border-radius-lg;
    word-break: break-all;
  }
  &__opinion {
    margin-right: @base4-padding-base;
    color: @light-color-3;
  }
  &__participant {
    display: inline-block;
    background-color: #b1bbc5;
    padding: 2px @base4-padding-xs;
    margin-right: @base4-padding-base;
    color: #fff;
    border-radius: @border-radius-lg;
  }
  &__progress {
    display: flex;
    flex-grow: 1;
    margin-top: 12px;
    label {
      flex: 0 0 60px;
      font-size: @font-size-12;
      color: @light-color-3;
    }
  }
  &__progress-users {
    flex: 1;
    flex-shrink: 0;
    max-width: 80%;
    padding-bottom: @base4-padding-base;
    color: @light-color-1;
    font-size: @font-size-12;

    & > span:not(:last-child)::after {
      content: "、";
    }
  }
  &__instance:last-child &__progress-users {
    padding-bottom: 24px;
    //margin-left: 8px;
  }

  .resources {
    &__item {
      color: rgba(0, 0, 0, 0.85);
      padding: 15px 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:hover {
        background-color: #f0f7ff;
      }

      & > i {
        color: @primary-color;
        cursor: pointer;
        font-size: 1em;
      }
    }
  }
  &__signsture {
    padding-top: 8px;
    & > div {
      float: left;
    }
    position: relative;
    img {
      width: 64px;
      height: 64px;
      border-radius: 2px;
      border: 1px solid rgba(221, 221, 221, 1);
      margin-right: 8px;
      cursor: url("./enlarge-o.png"), pointer;
    }
    .icon {
      position: absolute;
      left: 50px;
      top: 36px;
      cursor: pointer;
      font-size: 14px;
    }
  }
  &__org {
    color: @light-color-1;
  }
  &__link {
    font-size: @font-size-12;
  }
}
</style>

<style lang="less" scoped>
.approval-item-collapse {
  background: #fff;
  /deep/.ant-collapse-header {
    font-size: 14px;
    font-weight: normal;
    padding: 10px 0 !important;
    &:hover{
      background: #fff!important;
    }
    i {
      margin-right: 40px;
      color: rgba(0, 0, 0, 0.45);
      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
