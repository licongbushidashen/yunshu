<!--
 * @Author: panwl
 * @Date: 2020-04-22 14:33:35
 * @LastEditTime: 2020-04-22 15:03:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Date\components\input-date-range.vue
 -->

<template>
  
  <a-range-picker
    v-if="!readonly"
    v-model="dates"
    :placeholder="['开始时间','结束时间']"
    style="width:100%"
    :ranges="ranges"
    @change="onChange"
  ></a-range-picker>

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

import { DateOptions } from "@cloudpivot/form/schema";

import { DateInputControl } from "@cloudpivot/form/src/common/controls/input-controls/date-input-control";

import { ControlPropertyChange,DateControl } from "h3-forms";

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

  ranges : any;

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

  created(){
    this.ranges = { 
      '当天': [moment(), moment()], 
      '昨天': [moment().add(-1, 'days'), moment().add(-1, 'days')],
      '本周': [moment().startOf('week'), moment().endOf('week')], 
      '上周': [moment().week(moment().week() - 1).startOf('week'), moment().week(moment().week() - 1).endOf('week')], 
      '本月': [moment().startOf('month'), moment().endOf('month')], 
      '上月': [moment().month(moment().month() - 1).startOf('month'), moment().month(moment().month() - 1).endOf('month')], 
      '本季度': [moment().startOf('quarter'), moment().endOf('quarter')], 
      '本年度': [moment().startOf('year'), moment().endOf('year')]
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

}
</script>

<style lang="less">

</style>