<template>
  <div class="activity-box">
    <div
      v-for="(instance,idx) in activities"
      :key="idx"
      :class="[
        'activity-instance',
        setFlowStatus(instance.activityCode),
        ['START','END'].includes(instance.activityType) && setStartOrEndStatus(instance)
      ]"
      :style="{
        left: instance.x + 'px',
        top: instance.y + 'px',
        width: Number(instance.width) + 'px',
        height: instance.height + 'px'
      }"
      :title="lang === 'zh'? instance.activityName: instance.name_i18n[lang]"
      @mousedown="mouseDown"
      @mouseup="mouseUp($event, instance)"
    >
      <div class="activity-content">
        <div class="content-wrap">
          <i class="icon aufontAll" v-html="instance.icon"></i>
          <span>{{ lang === 'zh'? instance.activityName: instance.name_i18n[lang] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator';
import { Activity } from '../typings/workflow';
import { workflowApi, workflow } from '@cloudpivot/api';

@Component({
  name: 'ActivityInstance',
})
export default class ActivityInstance extends Vue {
  @Prop() activities!: Activity[];
  @Prop() workflowStatus?: string;
  @Prop({ type: Array, default: () => [] }) flowStatus!: any;
  logs: workflow.WorkflowTrackLog[] = [];

  @Inject()
  getProcessNodeDialogDisable!: Function;
  /**
   * 获取当前语言状态
   */
  get lang() {
    return localStorage.getItem('locale')
      ? localStorage.getItem('locale')
      : 'zh';
  }

  //上下布局模式
  get getProcessNodeDialogDisableNew(){
    if(this.getProcessNodeDialogDisable){
      return this.getProcessNodeDialogDisable();
    }else{
      return true
    }
  }

  /**
   * 读取当前节点的状态
   */
  setFlowStatus(activityCode: string) {
    const flowState = this.flowStatus.find(
      (state: any) => state.activityCode == activityCode
    );
    const findLogs = this.logs.find(
      (d: any) => d.activityCode === activityCode
    );
    if (findLogs && findLogs.subInstanceActivity && !findLogs.originator) {
      return '';
    } else {
      return flowState ? flowState.status : '';
    }
  }
  /**
   * 设置开始节点/结束节点 与 流程状态相关联状态：
   * 流程开始：开始节点呈完成颜色
   * 流程结束：结束节点呈完成颜色
   */
  setStartOrEndStatus(activity: any) {
    let startState: string = '',
      endState: string = '';
    switch (this.workflowStatus) {
      case 'PROCESSING':
        startState = 'finish';
        endState = '';
        break;
      case 'COMPLETED':
      case 'CANCELED':
        startState = 'finish';
        endState = 'finish';
        break;
    }
    if (activity.activityType === 'START') {
      return startState;
    }
    return endState;
  }
  async loadLogs() {
    const RouteParam:any = (this as any).$route;
    const res = await workflowApi.getWorkflowLogs({
      workflowInstanceId: RouteParam.params.workflowInstanceId,
    });
    if (res.errcode === 0 && res.data) {
      this.logs = res.data || [];
    }
  }
  /**
   * 节点单击事件
   */
  onActivity(activity: Activity, e: Event) {
    if (!this.hasMouseMove &&  this.getProcessNodeDialogDisableNew) {
      this.$emit('click', activity, e);
    }
    // this.hasMouseMove = false;
  }
  mouseX: number = 0;
  mouseY: number = 0;
  mouseThresold: number = 10;
  hasMouseMove: boolean = false;
  mouseDown(e) {
    e = e || window.event;
    this.mouseX = e.pageX;
    this.mouseY = e.pageY;
    this.hasMouseMove = false;
  }
  mouseMove(e) {
    e = e || window.event;
    let { mouseX, mouseY, mouseThresold } = this;
    if (
      Math.abs(e.pageX - mouseX) > mouseThresold ||
      Math.abs(e.pageY - mouseY) > mouseThresold
    ) {
      this.hasMouseMove = true;
    }
  }
  mouseUp(e, instance) {
    if (!this.hasMouseMove) {
      this.onActivity(instance, e);
    }
  }
  created() {
    document.addEventListener('mousemove', this.mouseMove);
    this.loadLogs();
    // document.addEventListener('mouseup', this.mouseUp);
  }
  destroyed() {
    document.removeEventListener('mousemove', this.mouseMove);
    // document.removeEventListener('mouseup', this.mouseUp);
  }
}
</script>
<style lang="less">
.activity-instance {
  position: absolute;
  z-index: 9;
  padding: 5px;
  width: 158px;
  height: 40px;
  line-height: 30px;
  background: #fff;
  border-radius: 2px;
  border: 1px solid #052535;
  font-size: 14px;
  color: #000;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    border: 1px solid #70c922;
  }
  .activity-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: Center;
    word-break: break-all;
    i {
      font-size: 14px;
      margin-right: 5px;
    }
    .content-wrap {
      max-height: 100%;
    }
  }
}
</style>
