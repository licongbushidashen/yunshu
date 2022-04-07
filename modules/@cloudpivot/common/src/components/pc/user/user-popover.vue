
<template>

  <a-popover
    trigger="click"
    :visible="isShowPop && !isExternal && !isWorlflowMock"
    @visibleChange="onVisibleChange($event)"
  >
    <user-card :userId="user.id" slot="content"></user-card>
    <a class="user-name" @click.stop="() => {}">
      <div class="cur-trust" v-if="showCur"></div>
      {{ isTrust && trustorVO && trustorVO.id ? `${user.name}${$t('cloudpivot.cloudpivotCommon.pc.trust', {name: trustorVO.name})}`:user.name }}
    </a>
  </a-popover>

</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { Popover } from '@h3/antd-vue';
import UserCard from './user-card.vue';


@Component({
  name: 'user-popover',
  components: {
    APopover: Popover,
    UserCard
  }
})
export default class UserPopover extends Vue {
  @Prop({
    default : {}
  })
  user !: any

  @Prop({ default: false }) isTrust?: boolean; // 是否被委托

  @Prop() trustorVO?: any; // 委托人

  @Prop() trustorId?: any;

  @Prop() workItemId?: any;

  // 是否为流程模拟
  get isWorlflowMock() {
    if (this.$route.query && this.$route.query.workflowMock) {
      return true;
    }
    return false;
  }

  get showCur() {
    if (this.trustorVO && this.trustorVO.id) {
      return this.isTrust && this.workItemId === this.trustorId;
    } 
    return false
  }

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  isShowPop:boolean = false;

  onVisibleChange(visible: boolean) {
    this.isShowPop = visible;
  }
}
</script>

<style lang="less" scoped>
.cur-trust{
  width: 0;
  height: 0;
  display: inline-block;
  vertical-align: middle;
  border-top: 5px solid transparent;
  border-left: 10px solid #32B683;
  border-bottom: 5px solid transparent;
}
</style>
