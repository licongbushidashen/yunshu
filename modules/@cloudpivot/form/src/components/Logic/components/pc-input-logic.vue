<!--
 * @Author: your name
 * @Date: 2020-04-22 18:40:45
 * @LastEditTime: 2020-04-22 19:03:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Logic\components\pc-input-logic.vue
 -->

<template>
  <a-switch
    v-if="!readonly"
    :disabled="readonly"
    :checked="ctrl.value"
    @change="onChange"
  />
  <div v-else>
    <span v-if="ctrl.value"> {{ $t('cloudpivot.form.renderer.sheet.logicTrueValue') }} </span>
    <span v-else> {{ $t('cloudpivot.form.renderer.sheet.logicFalseValue') }} </span>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import { RendererFormControl, LogicOptions } from "@cloudpivot/form/schema";

import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";

import {
  Switch
} from '@h3/antd-vue';

@Component({
  name: "input-logic",
  components:{
    ASwitch: Switch
  }
})
export default class InputLogic extends BaseControl<LogicOptions> {
  
  onChange(evt : boolean){
      if(this.ctrl){
        // this.ctrl.value = evt;
        this.setValue(evt);
      }
  }

}
</script>

<style lang="less" scoped>
</style>

