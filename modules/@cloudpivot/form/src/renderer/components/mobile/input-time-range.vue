
<template>
  <div :class="{ 'ranges': visible }">
    <h3-datetime
      class="start-range"
      v-control-back
      :title="beginLabel"
      :required="ctrl.required"
      :readonly="readonly"
      :locale="locale"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :confirmText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      currentText
      :format="format"
      :value="begin"
      :show="false"
      @on-show="show(0)"
      @on-hide="close(0)"
      @onConfirm="(value) => onConfirm(0,value)"
      @on-clear="clearVal(0)"
    ></h3-datetime>

    <h3-datetime
      v-control-back
      :title="endLabel"
      :required="ctrl.required"
      :readonly="readonly"
      :locale="locale"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :confirmText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      currentText
      :format="format"
      :value="end"
      :show="showModals[1]"
      @on-show="show(1)"
      @on-hide="close(1)"
      @onConfirm="(value) => onConfirm(1,value)"
      @on-clear="clearVal(1)"
    ></h3-datetime>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import { RendererFormControl, FormControlType } from "../../typings";

import { DateInputControl } from "../../controls";

import { H3Input, H3Datetime } from "h3-mobile-vue";

import { dateFormatter } from '@cloudpivot/form/utils/date-formatter';

import TimeRangesSelect from "./time-ranges-select.vue"

import ControlBack from "../../directives/control-back";

import moment from 'moment';

const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否ios终端

@Component({
  name: "input-time-range",
  components: {
    H3Input,
    H3Datetime,
    TimeRangesSelect
  },
  directives: {
    ControlBack
  }
})
export default class InputTimeRange extends DateInputControl {

  showModals = [false, false];

  visible: boolean = false;

  show(index: number) {
    this.showModals.splice(index, 1, true);
  }

  close(index: number) {
    this.showModals.splice(index, 1, false);
  }

  onConfirm(index: number, value: string) {
    const vals = this.ctrl.value.map((x: any) => x);
    vals[index] = value;
    this.ctrl.value = vals;
  }

  change(val){
    if (this.ctrl.value && this.ctrl.value.length > 1) {
      this.ctrl.value[0] = this.dateFormat(val.start.format(this.format));
      this.ctrl.value[1] = this.dateFormat(val.end.format(this.format));
      this.ctrl.value = this.ctrl.value.slice(0); //触发计算属性更新
    }
  }

  get begin() {
    if (this.ctrl.value && this.ctrl.value.length > 1) {
      const val = this.ctrl.value[0];
      if (moment.isMoment(val)) {
        return val.format(this.format || "HH:mm:ss");
      } else if (typeof(val) === 'string') {
        return val;
      }
    }
    return "";
  }

  get end() {
    if (this.ctrl.value && this.ctrl.value.length === 2) {
      const val = this.ctrl.value[1];
      if (moment.isMoment(val)) {
        return val.format(this.format || "HH:mm:ss");
      } else if (typeof(val) === 'string') {
        return val;
      }
    }
    return "";
  }

  get beginLabel() {
    return this.control.options.name + '开始';
  }

  get endLabel() {
    return this.control.options.name + '结束';
  }

  dateFormat(val: any) {
    let date;
    let ymd = '1970-01-01 ';
    if (isiOS) {
      date = new Date(`${ymd}${val}`.replace(/-/g, '/'));
    } else {
      date = new Date(`${ymd}${val}`.replace(/-s/g, 'T'));
    }
    return dateFormatter(date, this.format || 'HH:mm:ss');
  }

  clearVal(index:number) {
    // ;
    this.ctrl.value[index] = '';
    this.ctrl.value = [...this.ctrl.value];
    // this.val =  '';
    // this.ctrl.value = null;
  }
  
}
</script>

<style lang="less">
.ranges .start-range .h3-field-line:before{
  content: "";
  position: absolute;
  background-color: #eee;
  display: block;
  z-index: 1;
  top: 0;
  right: auto;
  bottom: auto;
  left:106px;
  width: calc(100% - 106px);
  height: 1PX;
  -webkit-transform-origin: 50% 100%;
  transform-origin: 50% 100%;
  -webkit-transform: scaleY(.5);
  transform: scaleY(.5);
}
.ranges .start-range .h3-field-line:after{
  left:106px !important;
  width: calc(100% - 106px) !important;
}
</style>

