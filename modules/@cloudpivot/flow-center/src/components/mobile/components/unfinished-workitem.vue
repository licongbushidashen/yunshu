<template>
  <div @click="goForm">
    <base-item
      class="work-item"
      :title="workitem.instanceName"
      :searchWord="searchWord"
      :searchUser="true"
      :summary="summary"
      :time="stayTime"
      :itemTitle="$t('cloudpivot.flowCenter.mobile.templateName')"
      :beTrust="workitem.beTrust"
      :currentTrustor="workitem.currentTrustor"
      :avatar="workitem.imgUrl"
      :username="workitem.originatorName"
      :avatarPlacehold="true"
      :hasCheckbox="mode == 'batch' ? true: false"
      :isShowUrged="workitem.urgeCount > 0"
    >
      <div class="item-status" slot="right">
        <img
          v-if="status"
          :class="classname"
          :src="status ? require(`../assets/images/${status}.png`):''"
        >
      </div>
      <span class="template-name" slot="template"> 
        {{workitem.workflowName || '--'}}
      </span>
      <span class="batch-item-checkbox" slot="checkbox" v-if="mode === 'batch'">
        <div class="work-item-checkbox" @click="checkBoxContainerClick">
          <checkbox-item :defaultChecked="workitem.isChecked" @change="checkboxChange"/>
        </div>
      </span>
    </base-item>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import BaseItem from './base-item.vue';

import { mobileHome }  from '@cloudpivot/api';

import common from "@cloudpivot/common/mobile";


@Component({
  name: 'UnfinishedWorkItem',
  components: {
    BaseItem,
    checkboxItem: common.components.Checkbox,
  }
})
export default class UnfinishedWorkItem extends Vue {
  @Prop() workitem!: mobileHome.Workitem;

  @Prop() searchWord?: string;
  
  @Prop() template?: string;

  @Prop() mode?:string

  @Prop() rowKey?:number;

  status: string = '';

  classname: string = '';

  stayTime: string = '';

  stayTimeArray:Array<number> = [];

  get summary(){
    if(this.$i18n) {
      const locale:string = this.$i18n.locale as string;
      return this.$i18n.locale === 'zh' ?  this.workitem.activityName : this.workitem.name_i18n[locale];
    }
    return '';
  }
  checkboxChange(isChecked){
    this.$emit('checkboxChange',{
      index: this.rowKey,
      isChecked 
    })
  }
  setTimeType() {
    let day: number = 0;
    let hour: number = 0;
    let min: number = 0;
    if (this.workitem.stayTime) {
      const { stayTime } = this.workitem;
      const { remainingTime } = this.workitem;
      if (this.workitem.workItemTimeoutStatus === 'RED' || this.workitem.workItemTimeoutStatus === 'ORANGE') {
        day = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
        hour = Math.floor(remainingTime % (24 * 60 * 60 * 1000) / (60 * 60 * 1000));
        min = Math.floor(remainingTime % (24 * 60 * 60 * 1000) % (60 * 60 * 1000) / (60 * 1000));
      } else {
        day = Math.floor(stayTime / (24 * 60 * 60 * 1000));
        hour = Math.floor(stayTime % (24 * 60 * 60 * 1000) / (60 * 60 * 1000));
        min = Math.floor(stayTime % (24 * 60 * 60 * 1000) % (60 * 60 * 1000) / (60 * 1000));
      }
    }
    const getTimerString:Array<number> = [day, hour, min];
    switch (this.workitem.workItemTimeoutStatus) {
      case 'TIMEOUT':
        this.stayTime = `${this.$t('cloudpivot.flowCenter.mobile.timeOut')} ${this.getTimerString(getTimerString)}`;
        // if (day > 0) {
        //   this.stayTime = `已超时${day}天${hour}小时`;
        // } else {
        //   this.stayTime = `已超时${hour}小时${min}分钟`;
        // }
        break;
      case 'RED':
      case 'ORANGE':
        this.stayTime = ` ${this.getTimerString(getTimerString)} ${this.$t('cloudpivot.flowCenter.mobile.timeoutLater')}`;
        // if (day > 0) {
        //   this.stayTime = `${day}天${hour}小时后超时`;
        // } else {
        //   this.stayTime = `${hour}小时${min}分钟超时`;
        // }
        break;
      default:
        this.stayTime = ` ${this.$t('cloudpivot.flowCenter.mobile.haveWaitFor')} ${this.getTimerString(getTimerString)}`;
        // if (day > 0) {
        //   this.stayTime = `已等待${day}天${hour}小时`;
        // } else {
        //   this.stayTime = `已等待${hour}小时${min}分钟`;
        // }
        break;
    }
  }

  getTimerString(list: Array<number>): string {
    let str = '';

    let count = 0;
    list.forEach((res:number, index:number) => {
      count += res;
      if (index === 0 && res > 0) {
        str += ` ${res} ${this.$t('cloudpivot.flowCenter.mobile.days')}`;
      }
      if (index === 1 && res > 0) {
        str += ` ${res} ${this.$t('cloudpivot.flowCenter.mobile.hours')}`;
      }
      if (index === 2 && res > 0) {
        str += ` ${res} ${this.$t('cloudpivot.flowCenter.mobile.minutes')}`;
      }
    });
    if (count === 0) {
      return this.$t('cloudpivot.flowCenter.mobile.lessOneMinute').toString();
    }
    return str;
  }

  getTimerStr(number: number, type: string) {
    if (!number) return '';
    let str = '';
    switch (type) {
      case 'day':
        str = `${number}${this.$t('cloudpivot.flowCenter.mobile.days')}`;
        break;
      case 'hour':
        str = `${number}${this.$t('cloudpivot.flowCenter.mobile.hours')}`;
        break;
      case 'min':
        str = `${number}${this.$t('cloudpivot.flowCenter.mobile.minutes')}`;
        break;
      default:
        break;
    }
  }

  goForm() {
    this.$emit('openForm');
  }
  checkBoxContainerClick(event){
    let current = event.target;
    let child = current.firstChild;
    event.stopPropagation();
    this.checkboxChange((this.workitem.isChecked? false: true))
    return false;
  }
  beforeMount() {
    this.setTimeType();
    let randomIdx: number = 3;
    switch (this.workitem.workItemTimeoutStatus) {
      case 'TIMEOUT':
        randomIdx = 0;
        break;
      case 'RED':
        randomIdx = 1;
        break;
      case 'ORANGE':
        randomIdx = 2;
        break;
      default:
        randomIdx = 3;
        break;
    }
    const locale:string = this.$i18n.locale as string;
    this.status = [
      locale === 'zh' ? 'timeout' : 'timeout-en',
      'warning-red',
      'warning-orange',
      '', // 正常
      locale === 'zh' ? 'pending' : 'pending-en',
      locale === 'zh' ? 'complete' : 'complete-en',
      locale === 'zh' ? 'draft' : 'draft-en',
      locale === 'zh' ? 'closure' : 'closure-en',
    ][randomIdx];
    this.classname = randomIdx > 0 && randomIdx < 4 ? 'warning' : 'status';
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
@timeout-width: 120px;
@timeout-height: 96px;
@warning-size: 30px;
.work-item {
  .item-status {
    .px2rem(margin-left, @horizontal-padding-sm);
    .px2rem(width, @timeout-width);
    .status {
      .px2rem(width, @timeout-width);
      .px2rem(height, @timeout-height);
    }
    .warning {
      .px2rem(height, @warning-size);
      .px2rem(width, @warning-size);
    }
  }
  .template-name{
    .px2rem(margin-left, 4px)
  }
}
.work-item-checkbox{
  .px2rem(width, 70px);
  .px2rem(padding-top,80px);
  .px2rem(padding-bottom,80px);
}
.batch-item-checkbox{
  margin-right: 0.2rem;
}
</style>
