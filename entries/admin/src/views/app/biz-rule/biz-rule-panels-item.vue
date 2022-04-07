<!--
 * @Author: your name
 * @Date: 2020-05-07 11:40:42
 * @LastEditTime: 2020-05-07 19:36:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\views\app\biz-rule\biz-rule-panels-item.vue
 -->
<template>
  <div class="model-item">
    <i class="icon aufontAll" v-html="item.icon"></i>
    <div>{{ item.nodeName }}</div>
    <!-- <div>{{ $i18n.locale === 'zh' ? item.activityName : item.name_i18n[$i18n.locale] }}</div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { H3Draggable } from '@/directives/drag';

@Component({
  name: 'ModelItem',
})

export default class ModelItem extends Vue implements H3Draggable {
  @Prop()
  item!: any;
  // created() {
  //   
  // }
  onDragstart(evt: DragEvent) {
    if (evt.dataTransfer) {
      evt.dataTransfer.setData('nodeType', this.item.nodeType);
      evt.dataTransfer.setData('item-data', JSON.stringify(this.item));
      evt.dataTransfer.setData('workflow-element-type', 'activityModel');
      evt.dataTransfer.setData('origin-offsets', JSON.stringify({
        x: evt.offsetX,
        y: evt.offsetY
      }));
    }
  }
}
</script>

<style lang="less" scoped>
.model-item {
  margin: 0 24px;
  height: 32px;
  cursor: move;
  background: rgba(0, 0, 0, 0.02);
  border: 1px dashed #d1d1d1;
  margin-left: 24px;
  text-align: center;
  margin-top: 8px;
  line-height: 32px;
  font-size: 14px;
  color: rgba(0,0,0,0.85);
  & > .icon {
    color: rgba(0,0,0,0.65);
  }
  &.disabled, &.disabled > .icon {
    cursor: not-allowed;
    color: #d1d1d1;
  }
  &:hover {
    color: @primary-color;
    border-color: @primary-color;
  }
  &:first-child {
    margin-top: 16px;
  }
  i {
    margin-right: 5px;
    font-size: 14px;
  }
  div {
    display: inline-block;
    width: 60px;
    text-align: center;
  }
}
</style>
