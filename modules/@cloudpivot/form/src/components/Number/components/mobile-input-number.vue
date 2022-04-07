<template>
  <h3-field
    :label="label"
    :labelStyle="style"
    :required="ctrl.required"
    :tip="controlOpts.tips"
    :showIcon="false"
  >
    <div class="field__control">
      <pc-input-number
        :control="control"
        :mobile="true"
        @focus="onFocus"
        @blur="onBlur"
        @change="onChange"
        class="input-number"
      ></pc-input-number>
    </div>
    <!-- <i
      class="icon aufont icon-base-close-circle"
      v-show="showClear"
      @click="onClear"
    ></i> -->
  </h3-field>
</template>

<script lang="ts">

import { Subscription } from 'rxjs';

import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
 RendererFormControl, NumberOptions,NumberFormatType
} from "@cloudpivot/form/schema";

import { NumberInputControl } from "@cloudpivot/form/src/common/controls/input-controls/number-input-control";

import numberFilter from "@cloudpivot/form/utils/number-filter";

import { NumberControl } from 'h3-forms';

import PcInputNumber from './pc-input-number.vue';

import { H3Field } from 'h3-mobile-vue';
@Component({
  name: "input-number",
  components:{
    PcInputNumber,
    H3Field
  },
  filters: {
    number: numberFilter
  }
})
export default class MobileInputNumber extends NumberInputControl {

  value = '';
  hasValue = false;

  subscription?: Subscription

  get showClear() {
    return !this.readonly && this.hasValue;
  }

  onFocus() {
    this.onChange();
  }

   onBlur(evt : Event){
    this.$emit('blur', evt);
  }

  onChange() {
    const _ctrl = this.ctrl as NumberControl;
    this.hasValue = _ctrl.hasValue;
  }

  destroyed() {
    super.destroyed();
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }
}
</script>

<style lang="less" scoped>
/deep/.ant-input-number input {
  color: #333;
  font-size: 15px;
  line-height: 25px;
  width: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
.input-number {
  box-shadow:0 0 2px #fff;
}


.field > .icon {
  font-size: 16px;
  margin-right: 2px;
  height: 16px;
}

.field.vertical{
  display: block !important;
  .field__label{
    padding: 10px 0;
  }
  //兼容移动端与admin端mobile预览页面 相等高度
  .input-number{
    padding-bottom: 10px;
  }
  .icon-base-close-circle{
    position: absolute;
    right: 20px;
    bottom: 8px;
  }
}
</style>

