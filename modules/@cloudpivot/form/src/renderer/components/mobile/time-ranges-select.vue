<template>
  <ul class="ranges-items">
    <li 
      v-for="(item,index) in optionsList" 
      :key="index"
      @click="onClick(item,index)" 
      :class="{ 'active': curIndex === index }"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import moment from 'moment';

@Component({
  name: "time-ranges-select",
  components: {}
})

export default class TimeRangesSelect extends Vue {

  @Prop({
    default: '1'
  })
  displayFormat!: string

  options: any[] = [{
    value:1,
    label: '当天'
  },{
    value:2,
    label: '昨天'
  },{
    value:3,
    label: '本周'
  },{
    value:4,
    label: '上周'
  },{
    value:5,
    label: '本月'
  },{
    value:6,
    label: '上月'
  },{
    value:7,
    label: '本季度'
  },{
    value:8,
    label: '本年度'
  }];

  curIndex: any = '';

  val: any = '';

  get optionsList (){
    switch(Number(this.displayFormat)){
      case 4:
        return this.options.filter((o: any) => o.value > 4);
      case 5:
        return this.options.filter((o: any) => o.value == 8);
      default:
        return this.options;
    }
  }
  created() {
    this.setMomentLocale(this.$i18n.locale)
  }

  //语言为中文时自然周从周一开始。
  setMomentLocale(lang: string) {
    if (lang === 'en') {
      moment.locale('en-US');
    } else {
      moment.locale('zh-cn');
    }
  }

  // 日期控件国际化
  @Watch('$i18n.locale')
  onLanguageChange(val: any) {
    this.setMomentLocale(val);
  }

  onClick(item, index){
    this.curIndex = index;
    this.val = {};
    switch (item.value) {
      case 1: 
      this.val.start = moment().startOf('days');
      this.val.end = moment().endOf('days');
      break;
      case 2: 
      this.val.start = moment().add(-1, 'days').startOf('days');
      this.val.end = moment().add(-1, 'days').endOf('days');
      break;
      case 3: 
      this.val.start = moment().startOf('week');
      this.val.end = moment().endOf('week');
      break;
      case 4: 
      this.val.start = moment().week(moment().week() - 1).startOf('week');
      this.val.end = moment().week(moment().week() - 1).endOf('week');
      break;
      case 5: 
      this.val.start = moment().startOf('month');
      this.val.end = moment().endOf('month');
      break;
      case 6: 
      this.val.start = moment().month(moment().month() - 1).startOf('month');
      this.val.end = moment().month(moment().month() - 1).endOf('month');
      break;
      case 7: 
      this.val.start = moment().startOf('quarter');
      this.val.end = moment().endOf('quarter');
      break;
      case 8: 
      this.val.start = moment().startOf('year');
      this.val.end = moment().endOf('year');
      break;
    }

    this.$emit('onChange',this.val)
  }

  clear(){
    this.curIndex = '';
  }
}

</script>

<style lang="less" scoped>
.ranges-items{
  display:flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  margin-bottom:15px;
  li{
    font-size: 15px;
    padding: 0 12px;
    height: 32px;
    line-height: 32px;
    margin-top: 15px;
    margin-left: 15px;
    background:rgba(247,248,252,1);
    color:rgba(102,102,102,1);
    border-radius:4px;
  }
  li.active{
    background:rgba(233,240,255,1);
    color:rgba(51,51,51,1);
  }
}
</style>