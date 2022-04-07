
<template>
  
  <a-range-picker
    v-if="!readonly"
    v-model="dates"
    :placeholder="['开始时间','结束时间']"
    style="width:100%"
    :ranges="getRanges"
    :showTime="getShowTime"
    :format="getFormat"
    :mode="getMode"
    @change="onChange"
    @panelChange="onPanelChange"
    :open="open"
    @openChange="onOpenChange"
  >
    <!-- 当日期控件为月份控件时，页脚添加确定按钮 -->
    <template slot="renderExtraFooter" v-if="getMode.length > 0">
      <a-button type="primary" size="small" class="footer-btn" :disabled="disabled" @click="handleFooterBtn">确定</a-button>
    </template>
  </a-range-picker>

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

import { DateOptions } from '../../typings';

import { DateInputControl } from '../../controls';

import { ControlPropertyChange,DateControl } from "h3-forms";

import { dateFormatter } from "../../utils/date-formatter";

import {
  DatePicker
} from '@h3/antd-vue';


@Component({
  name: "input-date-range",
  components: {
    ARangePicker: DatePicker.RangePicker
  }
})
export default class InputDateRange extends DateInputControl {

  dates : moment.Moment[] = [];

  open: boolean = false;

  get getMode(){
    let displayFormat: string = this.control.options.displayFormat || '';
    switch(Number(displayFormat)){
      case 4:
        return ['month','month']
      case 5:
        return ['year','year']
      default:
        return [];
    }
  }

  get getShowTime(){
    let displayFormat: string = this.control.options.displayFormat || '';
    switch(Number(displayFormat)){
      case 2:
        return { format: 'HH:mm:ss' };
      case 3:
        return { format: 'HH:mm' };
      case 4:
        return false;
      case 9:
        return { format: 'HH:mm' };
      case 10:
        return { format: 'HH:mm' };
      case 11:
        return { format: 'HH:mm' };
      case 12:
        return { format: 'HH:mm' };
      default:
        return false;
    }
  }

  get getFormat(){
    let displayFormat: string = this.control.options.displayFormat || '';
    switch(Number(displayFormat)){
      case 2:
        return 'YYYY-MM-DD HH:mm:ss';
      case 3:
        return 'YYYY-MM-DD HH:mm';
      case 4:
        return "YYYY-MM";
      case 5:
        return "YYYY";
      case 6:
        return "MM-DD";
      case 7:
        return "HH:mm";
      case 8:
        return "HH:mm:ss";
      case 9:
        return "YYYY-MM-DD HH:mm"
      case 10:
        return "YYYY-MM-DD HH:mm"
      case 11:
        return "YYYY-MM-DD HH:mm"
      case 12:
        return "YYYY-MM-DD HH:mm"
      default:
        return "YYYY-MM-DD";
    }
  }

  get getRanges(){
    let displayFormat = this.control.options.displayFormat || '';
    switch(Number(displayFormat)){
      case 4:
        return { 
          '本月': [moment().startOf('month'), moment().endOf('month')], 
          '上月': [moment().month(moment().month() - 1).startOf('month'), moment().month(moment().month() - 1).endOf('month')], 
          '本季度': [moment().startOf('quarter'), moment().endOf('quarter')], 
          '本年度': [moment().startOf('year'), moment().endOf('year')]
        };
      case 5:
        return { 
          '本年度': [moment().startOf('year'), moment().endOf('year')]
        };
      default:
        return { 
          '当天': [moment().startOf('days'), moment().endOf('days')], 
          '昨天': [moment().add(-1, 'days').startOf('days'), moment().add(-1, 'days').endOf('days')],
          '本周': [moment().startOf('week'), moment().endOf('week')], 
          '上周': [moment().week(moment().week() - 1).startOf('week'), moment().week(moment().week() - 1).endOf('week')], 
          '本月': [moment().startOf('month'), moment().endOf('month')], 
          '上月': [moment().month(moment().month() - 1).startOf('month'), moment().month(moment().month() - 1).endOf('month')], 
          '本季度': [moment().startOf('quarter'), moment().endOf('quarter')], 
          '本年度': [moment().startOf('year'), moment().endOf('year')]
        };
    }
  }

  get disabled(){
    return !(this.dates[0] && this.dates[1]);
  }

  setDates(){
    if(this.ctrl && this.ctrl.value){
      this.dates = this.ctrl.value.map((s:string) => {
        if(s){
          return moment(s);
        }
        return s;
      });
    }else{
      this.dates = [];
    }
  }

  setControl() {
    this.setDates();
  }

  handleValueChange(value: any): void {
    this.setDates();
  }

  onChange(dates: moment.Moment[], dateStrings: string[]) {
    this.ctrl.value = dateStrings && dateStrings.length > 0 ? dateStrings : null;
  }

  onPanelChange(value, mode){
    this.ctrl.value = value.map((v: any) =>{
      return dateFormatter(v._d,this.getFormat)
    })
  }

  onOpenChange(status){
    if(status){
      this.open = true;
    }else{
      this.open = false;
    }
  }

  handleFooterBtn(){
    this.open = false;
  }

}
</script>

<style lang="less">
  .footer-btn{
    position: absolute;
    right: 12px;
    bottom:7px;
  }
</style>