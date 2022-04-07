<!--
 * @Author: Fan
 * @Date: 2020-04-26 12:13:17
 * @description: 
 * @LastEditors: Fan
 -->
<template>
  <div>
    <a-rate v-model="ctrl.value" :allowHalf="allowHalf" :count="count" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import {BaseControl} from "@cloudpivot/form/src/renderer/controls"
import * as typings from "@cloudpivot/form/schema";
import { Rate } from "@h3/antd-vue";
@Component({
  name: "Rate",
  components: {
    ARate: Rate,
  }
})
export default class ETRate extends BaseControl<typings.FormControlOptions> {
  // this.ctrl 组件的控制器. 组件的value 通过 this.ctrl获取
  get allowHalf() {
    return this.options.allowHalf
  }
  get count() {
    return this.options.count
  }
  // 那组件配置的属性
  get options() {
    return this.control.options
  }
  created() {
  }
}
</script>