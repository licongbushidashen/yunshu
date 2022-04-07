
<template>
  <div 
    class="h3-input-number"
    :class="{ 
      'h3-input-number-focused' : focused,
      'h3-input-number-disabled' : disabled,
    }"
  >
    <input
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="e => $emit('keydown',e)"
      @keyup="e => $emit('keyup',e)"
      @input="onChange"
      autocomplete="off"
    ></input>

    <div v-if="!disabled" class="h3-input-number-steps">
      <span @click="stepUp">
        <i
          class="aufontAll h-icon-all-up-o"
        ></i>
      </span>
      <span @click="stepDown">
        <i
          class="aufontAll h-icon-all-down-o"
        ></i>
      </span>
    </div>
  </div>
</template>


<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Inject,
  Model
} from "vue-property-decorator";

import {
  RendererFormControl,
  FormControlType,
  TextOptions
} from "../../typings";

import { TextInputControl } from "../../controls";

import { Input } from "@h3/antd-vue";

@Component({
  name: "h3-input-number",
  components: {
    
  }
})
export default class H3InputNumber extends Vue {
  
  @Prop({
    default: ''
  })
  placeholder !: string

  @Prop({
    default : false
  })
  disabled !: boolean

  @Model('change')
  value !: number | null

  @Prop({
    default : 1 
  })
  step !: number

  focused = false

  get inputValue(){
    const val = typeof this.value === 'number' ? this.value.toString() : '';
    return val;
  }

  onFocus(evt : Event){
    this.focused = true;
    this.$emit('focus', evt);
  }

  onBlur(evt : Event){
    this.focused = false;
    this.$emit('blur', evt);
  }

  stepUp(){
    if(this.value !== null){
      const val = this.value + this.step;
      this.$emit('change', val);
    }
  }

  stepDown(){
    if(this.value !== null){
      const val = this.value - this.step;
      this.$emit('change', val);
    }
  }

  onChange(evt : Event){
    const inputVal = (evt.target as HTMLInputElement).value;
    var val = /^-?\d+(\.{1}\d*)?$/.test(inputVal) ? Number(inputVal) : null;
    if (val) {
      // 正数最大只能输入 13位
      let inter = inputVal.split('.')
      if (inter[0].length > 13) {
        inter[0] = inter[0].slice(0,13);
        val = +inter.join('.');
        (evt.target as HTMLInputElement).value = val+'';
        console.log(val)
      }
    }
    this.$emit('change', val);

  }

}
</script>

<style lang="less" scoped>
.h3-input-number {
  position: relative;
  border: 1px solid @border-color;
  border-radius: @border-radius-base;
  transition: all 0.3s;
  background-color: #fff;
  background-image: none;
  display: inline-block;
  line-height: 1.5;
  height: 32px;
  font-size: 14px;
  font-variant: tabular-nums;
  list-style: none;
  font-feature-settings: 'tnum';
  position: relative;

  & > input{
    width: 100%;
    height: 30px;
    padding: 0 11px;
    text-align: left;
    background-color: transparent;
    border: 0;
    outline: 0;
    transition: all 0.3s linear;
    color: @light-color-2;
    font-size: 14px;

    &::-moz-placeholder{
      color: @light-color-4;
    }

    &::-webkit-input-placeholder{
      color: @light-color-4;
    }

    &:-ms-input-placeholder{
      color: @light-color-4;
    }

  }

  &:hover {
    border: 1px solid @primary-color;

    & .h3-input-number-steps{
      opacity: 1;
    }

  }

  &-disabled{
    background: rgb(245, 245, 245);

    & > input{
      cursor: not-allowed;
    }

    &:hover{
      border-color: rgb(217, 217, 217);
    }

  }

  &-focused {
    box-shadow: 0px 0px 0px 2px @primary-light-color;
    border: 1px solid @primary-color;
    
    & .h3-input-number-steps{
      opacity: 1;
    }

  }

  &-steps{
    position: absolute;
    right: 0;
    top: 0;
    opacity: 0;
    width: 22px;
    display: inline-flex;
    flex-direction: column;
    height: 100%;
    border-radius: 0 @border-radius-base @border-radius-base 0;
    border-left:1px solid @border-color; 
    transition: opacity .24s linear .1s;
    background: #fff;

    & > span{
      text-align: center;
      height: 50%;
      line-height: 14px;
      cursor: pointer;
      transition: all .1s linear;

      &:hover{
        color: @primary-color;
      }

      &:first-child{
        border-bottom: 1px solid @border-color;
      }

      & > i{
        font-size: 12px;
        font-weight: 700;
        transform: scale(0.6);
        display: inline-block;
      }
    }

  }
}
</style>

