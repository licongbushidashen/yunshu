
<template>
  <span v-if="!readonly" class="input-time-range-wrap">
        <a-time-picker
          v-model="begin"
          :format="controlOpts.format1"
          :placeholder="placeholder"
          @change="onChangeStart"
        ></a-time-picker>
        ~
        <a-time-picker
          v-model="end"
          :format="controlOpts.format1"
          :placeholder="placeholder"
          @change="onChangeEnd"
        ></a-time-picker>
    </span>
  <div v-else>

    <template v-if="ctrl.value">
      <span>{{ ctrl.value[0] }}</span> ~ <span>{{ ctrl.value[1] }}</span>
    </template>

  </div>

</template>

<script lang="ts">

import { Subscription } from 'rxjs';

import moment from 'moment';

import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import { TimeInputControl } from '../../controls';

import { ControlPropertyChange,DateControl } from "h3-forms";

import { dateFormatter } from "../../utils/date-formatter";

import {
  DatePicker
} from '@h3/antd-vue';


@Component({
  name: "input-time-range",
  components: {
    ARangePicker: DatePicker.RangePicker
  }
})
export default class InputTimeRange extends TimeInputControl {

  get begin() {
    if (this.ctrl.value && this.ctrl.value.length > 0 ) {
      return this.ctrl.value[0];
    }
  }

  get end() {
    if (this.ctrl.value && this.ctrl.value.length === 2 ) {
      return this.ctrl.value[1];
    }
  }

  get getFormat(){
    let displayFormat: string = this.control.options.displayFormat || '';
    switch(Number(displayFormat)){
      case 7:
        return "HH:mm";
      case 8:
        return "HH:mm:ss";
      default:
        return "HH:mm:ss";
    }
  }

  onChangeStart(dates: moment.Moment[], dateStrings: string[]) {
    if (!this.ctrl.value || this.ctrl.value.length === 0) {
      this.ctrl.value = [dates];
    } else {
      this.ctrl.value.splice(0, 1, dates);
      this.ctrl.value = this.ctrl.value.slice();
    }
  }

  onChangeEnd(dates: moment.Moment[], dateStrings: string[]) {
    // this.ctrl.value[1] = dateStrings && dateStrings.length > 0 ? dateStrings : null;
    if (!this.ctrl.value || this.ctrl.value.length === 0) {
      this.ctrl.value = [null, dates];
    } else if (this.ctrl.value.length === 1) {
      this.ctrl.value.push(dates);
      this.ctrl.value = this.ctrl.value.slice();
    } else {
      this.ctrl.value.splice(1, 1, dates);
      this.ctrl.value = this.ctrl.value.slice();
    }
  }

}
</script>

<style lang="less">
  .footer-btn{
    position: absolute;
    right: 12px;
    bottom:7px;
  }

  .input-time-range-wrap{
    display:flex;
    align-items: center;
    .ant-time-picker-input{
      padding:0;
      font-size:12px;
      
    }
    .ant-time-picker-icon{
            
            right: 2px;
      }
    .anticon-close-circle{
      position:absolute;
      right:2px;
    }
  }
</style>