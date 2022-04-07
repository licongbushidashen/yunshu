<!--
 * @Date: 2020-03-28 10:47:20
 * @LastEditors: zhuqiu
 * @LastEditTime: 2020-07-02 19:32:40
 * @FilePath: \frontend\modules\@cloudpivot\form\src\renderer\components\layout\pc-form-tabs.vue
-->

<template>
  <a-tabs v-model="activeKey" @change="handleChange" class="pc-tabs">
    <slot></slot>
  </a-tabs>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Inject,
} from 'vue-property-decorator';

import { RendererFormControl, StyleControlOptions } from '../../typings';

import { BaseControl } from '../../controls';

import { Tabs } from '@h3/antd-vue';

import * as typings from '@cloudpivot/form/schema';

@Component({
  name: 'form-tabs',
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class FormTabs extends BaseControl<typings.TabsOptions> {
  @Prop({
    default: '-1',
  })
  defaultActiveKey!: string;

  activeKey: string = '';

  created() {
    if (this.ctrl && this.ctrl.value) {
      this.activeKey = this.ctrl.value;
    } else {
      this.activeKey = this.defaultActiveKey;
    }
    if (this.ctrl) {
      this.setValue(this.activeKey);
    }
  }

  handleChange(key) {
    this.setValue(key);
  }

  handleValueChange() {
    console.log('值变化时我执行了', this.ctrl ? this.ctrl.value : '空');
    this.activeKey = this.ctrl ? this.ctrl.value : '-1';
    typings.EventBus.$emit('activeKey', {
      data: this.activeKey,
    });
  }
}
</script>

<style lang="less" scoped>
.has-form-border{
  .pc-tabs{
    padding-left: 0;
  }
}
</style>

