<template>
  <div 
    class="workflow-info" 
    v-if="isLoaded" 
    :class="{ collapsed : collapsed }"
  >

    <div v-if="completed" class="workflow-info__col1">{{ $t('cloudpivot.flow.pc.FinishTime', { time: info.finishTime }) }}</div>

    <div v-else-if="canceled" class="workflow-info__col1">{{ $t('cloudpivot.flow.pc.CancelTime', { time: info.cancelTime }) }}</div>

    <div 
      v-else 
      class="workflow-info__col1" 
      :class="{ hidden : collapsed }"
    >
      <table ref="workflow">
        <thead>
          <tr>
            <td style="width:144px">{{ $t('cloudpivot.flow.pc.CurNode') }}</td>
            <td>{{ $t('cloudpivot.flow.pc.CurHandler') }}</td>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(node,index) in info.participants"
            :key="index"
            :class="{'cur-node': node.activityCode === curNode && info.participants.length > 1}"
          >
            <td style="vertical-align:top" :class="{'cur-node-name': node.activityCode === curNode && info.participants.length > 1}">{{ isChinese ? node.activityName : node.name_i18n[$i18n.locale] }}</td>

            <td>
              <user-popover
                v-for="(participant,index) in node.participantRelations"
                :key="index"
                :user="participant.participantVO"
                :isTrust="participant.isTrust"
                :trustorVO="participant.trustorVO"
                :trustorId="participant.workitemId"
                :workItemId="itemId"
              ></user-popover>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="workflow-info__col2">
      <div v-if="!completed && !canceled">{{ $t('cloudpivot.flow.pc.UsedTime', { time: usedTime }) }}</div>
      <a v-if="!mockMode" @click="linkTrack">{{ $t('cloudpivot.flow.pc.WorkflowTrack') }}</a>
    </div>

    <div>
      <workflow-status class="workflow-info__status" :status="status"></workflow-status>
    </div>

    <a-icon
      v-if="collapsible"
      type="double-right"
      :class="{ collapsed : collapsed }"
      @click="toggle"
    ></a-icon>
  </div>
</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { Icon } from '@h3/antd-vue';
import common from '@cloudpivot/common/pc';

import { timeTranslate } from '@cloudpivot/common/src/utils/date';

import { workflowApi,workflow }  from '@cloudpivot/api';

import WorkflowStatus from '../shared/workflow-status/workflow-status.vue';


@Component({
  name: 'workflow-info',
  components: {
    AIcon: Icon,
    UserPopover: common.components.UserPopover,
    WorkflowStatus
  }
})
export default class WorkflowInfo extends Vue {
  @Prop()
  id !: string

  @Prop()
  itemId !: string

  @Prop()
  curNode !: string

  @Prop({ default: false }) mockMode?: any;

  info: workflow.InstanceBaseInfo = {} as any

  collapsed = true;

  collapsible = false;

  isLoaded = false;

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  // get collapsible() {
  //   // const x = this.info;
  //   // console.log('participants', x.participants);
  //   // return x && x.participants && x.participants.length > 3;
  // }

  get status() {
    return this.info ? this.info.status : '';
  }

  get completed() {
    return this.status === 'COMPLETED';
  }

  get canceled() {
    return this.status === 'CANCELED';
  }

  get usedTime() {
    if (!this.info || !this.info.usedTime) {
      return '';
    }
    return timeTranslate(this.info.usedTime);
  }

  getCollapsible() {
    if (!this.info.participants) {
      return;
    }
    // 超过三个节点直接展示下拉按钮
    if (this.info.participants.length > 3) {
      this.collapsible =  true;
      return;
    }
    const count: number = this.info.participants.reduce((p:any,n:any) => n.participants.length > p ? n.participants.length : p, 0);
    setTimeout(() => {
      const dom = this.$refs.workflow as HTMLElement;
      if (dom) {
        this.collapsible = dom.clientHeight > 116;
      }
    }, 100 * count > 2000 ? 2000: 100 * count);
  }


  linkTrack() {
    if (!this.itemId) {
      this.$message.warn("workItemId为空。或者页面未加载完成，请稍后")
      return;
    }
    this.$emit('flowTrack');
  }

  @Watch('id', {
    immediate: true
  })
  setId() {
    if (this.id) {  
      workflowApi.getWorkflowBaseInfo({
        workflowInstanceId: this.id
      }).then((res) => {
        if (res.errcode === 0) {
          common.utils.compatible(res.data || {}, 'workflowName');
          if (res.data && Array.isArray(res.data.participants)) {
            res.data.participants.forEach((d:any) => {
              common.utils.compatible(d, 'activityName');
            });
          }
          this.info = res.data || {};
          if (res.data && res.data.status === 'CANCELED') {
            this.$emit('setFinishTime', res.data.cancelTime);
          } else if (res.data && res.data.status === 'COMPLETED') {
            this.$emit('setFinishTime', res.data.finishTime);
          }
          this.$nextTick(() => {
            this.getCollapsible();
          });
        } else if (res.errcode === 402500) {
          this.$message.error('数据已被删除！');
        } else {
          this.$message.error(res.errmsg as string);
        }
        this.isLoaded = true;
      }); 
    }
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }
}

</script>
<style lang="less" scoped>
// @import "~@/styles/themes/default.less";

.workflow-info {
  display: flex;
  background: @main-background;
  position: relative;

  &.collapsed > &__col1 {
    flex-grow: 1;
  }

  &__col1 {
    margin: @base10-padding-md @base10-padding-lg;
    overflow: hidden;

    a {
      color: @light-color-1;
    }

    table{
      width: 100%;
      table-layout: fixed;
    }

    table td {
      padding: 4px;
    }

    tbody td {
      color: @light-color-1;

      & > a:not(:last-child)::after {
        content: "、";
      }
    }

    .cur-node{
      background: linear-gradient(90deg,rgba(41,112,255,0.1) 0%,rgba(255,255,255,0) 100%);
      &-name{
        font-weight: bold;
      }
    }
  }

  &__col2 {
    padding: @base10-padding-md @base4-padding-md;
    flex-grow: 1;
    flex-shrink: 0;
    text-align: right;

    div {
      margin-bottom: @base4-padding-xs;
    }

    a {
      color: @primary-color;
    }
  }

  .workflow-info__status {
    width: 90px;
    height: 72px;
  }

  & > i {
    cursor: pointer;
    position: absolute;
    transform: rotate(270deg);
    color: @light-color-3;
    bottom: 6px;
    left: 50%;

    &.collapsed {
      transform: rotate(90deg);
    }
  }

  .hidden{
    max-height: 116px !important;
  }

  .user-name{
    color: rgba(0,0,0,0.85);
    &:hover{
      color: @primary-color;
    }
  }
}
</style>
