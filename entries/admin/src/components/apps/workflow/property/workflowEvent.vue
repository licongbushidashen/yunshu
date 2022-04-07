<template>
  <div class="workflow-event-panel">
    <!-- 流程启动事件- -->
    <property-widget label="流程启动事件" tip="流程表单由发起人保存/提交后将触发本事件">
      <template>
        <ellipsis-input
          slot="right"
          :value="eventSetting.startEventHandler ? '已设置':''"
          @click="workflowEvent('start')"
        />
      </template>
    </property-widget>

    <!-- 流程结束事件- -->
    <property-widget label="流程结束事件" tip="流程在结束（正常结束或提前结束流程）后将触发本事件">
      <ellipsis-input
        slot="right"
        :value="eventSetting.endEventHandler ? '已设置':''"
        @click="workflowEvent('end')"
      />
    </property-widget>

    <!-- 流程作废事件- -->
    <property-widget label="流程作废事件" tip="流程在被作废后将触发本事件">
      <ellipsis-input
        slot="right"
        :value="eventSetting.cancelEventHandler ? '已设置':''"
        @click="workflowEvent('cancel')"
      />
    </property-widget>

    <!-- 流程激活事件- -->
    <property-widget label="流程激活事件" tip="流程在被作废或已完成状态被管理员重新激活后将触发本事件">
      <ellipsis-input
        slot="right"
        :value="eventSetting.activateEventHandler ? '已设置':''"
        @click="workflowEvent('activate')"
      />
    </property-widget>

    <event-handler
      v-model="isShowEventHandler"
      :eventObj="eventObj"
      type="workflow"
      @saveEvent="afterSetEvent"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';

import Bus from '@/utils/bus';

import PropertyWidget from '../base/propertyWidget.vue';
import EllipsisInput from '../base/ellipsisInput.vue';

import EventHandler from '../modals/eventHandler.vue';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'WorkflowEvent',
  components: {
    PropertyWidget,
    EllipsisInput,
    EventHandler
  }
})

export default class WorkflowEvent extends Vue {
@Prop() label !:any;

@WorkflowModule.State('workflowData') workflowData :any;

isShowEventHandler:boolean = false;
eventObj:any = {};


eventSetting: any = {
  startEventHandler: false,
  endEventHandler: false,
  cancelEventHandler: false,
  activateEventHandler: false,
};

mounted() {
  this.dataMounted();
  Bus.$on('initWorkflowEvent', this.dataMounted);
}

dataMounted() {
  Object.keys(this.eventSetting).forEach((key:any) => {
    const data = this.workflowData[key];
    if (data) {
      if ( (data.smsDisposal && data.smsDisposal.smsCode && data.smsDisposal.receiver) || data.receiver || (data.dataDisposals && data.dataDisposals.length) || (data.bizActions && data.bizActions.length)) {
        this.eventSetting[key] = true;
      }
    }
  });
}
workflowEvent(eventType){
  const eventMap = {
    'start': '启动',
    'end': '结束',
    'cancel': '作废',
    'activate': '激活'
  }
  this.isShowEventHandler = true;
  this.eventObj = {
    eventTitle: `流程${eventMap[eventType]}事件`,
    eventCode: `${eventType}EventHandler`
  }
}
// 流程启动事件
// workflowStartEvent() {
//   this.isShowEventHandler = true;
//   this.eventObj = {
//     eventTitle: '流程启动事件',
//     eventCode: 'startEventHandler'
//   };
// }

// workflowEndEvent() {
//   this.isShowEventHandler = true;
//   this.eventObj = {
//     eventTitle: '流程结束事件',
//     eventCode: 'endEventHandler'
//   };
// }

// workflowCancelEvent() {
//   this.isShowEventHandler = true;
//   this.eventObj = {
//     eventTitle: '流程作废事件',
//     eventCode: 'cancelEventHandler'
//   };
// }

// workflowActiveEvent() {
//   this.isShowEventHandler = true;
//   this.eventObj = {
//     eventTitle: '流程激活事件',
//     eventCode: 'activateEventHandler'
//   };
// }

afterSetEvent(obj:any) {
  Object.keys(this.eventSetting).some((s:any) => {
    if (s === obj.code) {
      this.eventSetting[s] = obj.isSetting;
      return true;
    }
    return false;
  });
}
}
</script>

<style lang="less" scoped>
.right-box{
  width: 100%;
  display: flex;
  align-items: center;
}
/deep/.task-select{
    width: 100%;
    border: none;
    /deep/.ant-select-selection{
      border: none;
      box-shadow: none;
    }
  }
</style>

