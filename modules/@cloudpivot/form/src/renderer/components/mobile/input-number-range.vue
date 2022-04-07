<template>
  <div>
    <h3-input
      :value="begin"
      :required="ctrl.required"
      :title="label"
      :placeholder="placeholder"
      :showKeyboard="showKeyboard"
      type="money"
      :moneyKeyboardAlign="'left'"
      :targetName="beginId"
      @onChange="onBeginChange"
      @onFocus="onFocus"
    ></h3-input>

    <h3-input
      :value="end"
      :required="ctrl.required"
      :title="label"
      :placeholder="placeholder"
      :showKeyboard="showKeyboard"
      type="money"
      :moneyKeyboardAlign="'left'"
      :targetName="endId"
      @onChange="onEndChange"
      @onFocus="onFocus"
    ></h3-input>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  NumberOptions,
  NumberFormatType
} from "../../typings";

import { NumberInputControl } from "../../controls";

import { H3Input } from "h3-mobile-vue";

import PcInputNumber from "../pc/input-number.vue";

@Component({
  name: "input-number-range",
  components: {
    H3Input
  }
})
export default class InputNumberRange extends NumberInputControl {

  //是否显示数字键盘
  showKeyboard: boolean =  false

  //给每一个h3-input组件加上唯一标志 
  id: any = new Date().getTime()

  get begin() {
    if (this.ctrl.value && this.ctrl.value.length > 1) {
      const val = this.ctrl.value[0];
      if(val !== null){
        return  val && val.toString();
      }
      return '';
    }
  }

  get end() {
    if (this.ctrl.value && this.ctrl.value.length === 2) {
      const val = this.ctrl.value[1];
      if(val !== null){
        return val && val.toString();
      }
      return '';
    }
  }

  get beginId() {
    return this.id + 'begin';
  }

  get endId() {
    return this.id + 'end';
  }

  onBeginChange(val: string) {
    if(val){
      const value = Number(val);
      if(!isNaN(value)){
        if (!this.ctrl.value || this.ctrl.value.length === 0) {
          this.ctrl.value = [value];
        } else {
          this.ctrl.value.splice(0, 1, value);
        }
      }
    }else{
      this.ctrl.value.splice(0, 1, val);
    }
  }

  onEndChange(val: string) {
    if(val){
      const value = Number(val);
      if(!isNaN(value)){
        if (!this.ctrl.value || this.ctrl.value.length === 0) {
          this.ctrl.value = [null, value];
        } else if (this.ctrl.value.length === 1) {
          this.ctrl.value.push(value);
        } else {
          this.ctrl.value.splice(1, 1, value);
        }
      }
    }else{
      this.ctrl.value.splice(1, 1, val);
    }
  }
  onFocus() {
    this.showKeyboard = true
  }

  mounted() {
    this.$nextTick(() =>{
      const headerEl = document.querySelector('.search-header') as HTMLDivElement;
      headerEl && headerEl.addEventListener('click',this.hideKeyBoard,true)
    })
  }

  hideKeyBoard(){
    this.showKeyboard = false;
  }
}
</script>

<style lang="less" scoped>
</style>