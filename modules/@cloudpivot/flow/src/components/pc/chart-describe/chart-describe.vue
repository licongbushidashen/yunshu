<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-06 17:48:30
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-09-18 15:04:01
-->
<template>
  <div :class="`chart-describe-wrap line-${ line.ID }`" :style="positionStyle" @mouseenter="chartOver" @mouseleave="chartLeave">
    <p>描述：</p>
    <p class="content">{{ !line.description ? '无' : line.description }}</p>
    <div class="arrow"></div>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop
} from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import WorkflowMixin from '../mixins/workflow';
import Participants from '../participants.vue';
import Store from '@/store/index';
// 不兼容ie
// import { closest } from '@cloudpivot/common/src/utils/dom';

import { workflow } from "@cloudpivot/api";

@Component({
  name: 'flow-track-chart-card',
  components: {
    Participants
  }
})
export default class FormWorkflowTrackChartCard extends mixins(WorkflowMixin) {
  @Prop({ default: () => [] }) record!: workflow.WorkflowTrackLog | any;

  @Prop({ default: () => ({}) }) rect?: DOMRect;

  @Prop({ default: false }) estimate?: Boolean;

  @Prop({ default: {} }) line?: any;

  /**
   * 获取元素位置
   */
  get positionStyle() {
    const windowWidth:number = document.documentElement ? document.documentElement.clientWidth : 0;
    const mainScrollTop:number = document.getElementsByClassName('main')[0] ? document.getElementsByClassName('main')[0].scrollTop - 64 : 0;

    let rect:any = this.rect;
    let pageX:number = 0;
    let pageY:number = 0;
    let boxWidth:number = this.record.length > 1 ? 278 : 154;
    if (rect && rect.right && rect.left) {
      pageX = windowWidth / 2 < rect.right ? rect.left - (this.estimate ? boxWidth : 310) : rect.right + 30;
      // 在 ie 上只有 rect.top, 没有 rect.y
      pageY = mainScrollTop ? mainScrollTop + (rect.y||rect.top) : (rect.y||rect.top);
      pageX = rect.left + (rect.right - rect.left)
    }
    if(pageX + 20 + 400 > windowWidth){
      return `top:${pageY}px; right: 0`;
    }
    
    return `top:${pageY}px;left:${pageX+20}px`;
  }

  chartOver(){
    Store.commit("setMotalflag", true);
  }

  chartLeave(){
    Store.commit("setMotalflag", false);
  }

  destroy() {
    this.$emit('destroy');
  }

  mounted() {
  }

}
</script>
<style lang="less">
.chart-describe-wrap {
  position: absolute;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  max-width: 400px;
  z-index: 999;
  max-height: 450px;
  overflow: auto;
  color: rgba(0,0,0,0.45);
  .content {
    font-size: 14px;
    color: rgba(0,0,0,0.85);
    word-break: break-all;
  }
  .arrow {
    left: 0px;
    transform: translateX(-50%) rotate(45deg);
    border-color: #fff #fff #fff #fff;
    box-shadow: -3px 3px 8px rgba(0,0,0,0.07);
    position: absolute;
    display: block;
    width: 12px;
    height: 12px;
    border-style: solid;
    border-width: 6px;
    top: 12px;
  }
}

</style>
