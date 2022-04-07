<template>
  <div class="biz-models">
    <p
      class="biz-models__title"
      v-if="title"
      @click="collapse"
    >{{ title }}</p>
    <apps-list
      :list="list"
      :grid="col"
      :recent="true"
      colorKey="code"
      @onItem="$emit('onItem',$event)"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import common from '@cloudpivot/common/mobile';

@Component({
  name: 'biz-models',
  components: {
    // GridList: common.components.GridList,
    AppsList: common.components.AppsList,
  }
})
export default class BizModels extends Vue {
  @Prop() title!: string;

  @Prop() collapsable?: boolean;

  @Prop({
    default: 3
  }) col!: number;

  @Prop() list!: Array<any>;

  opened: boolean = true;

  collapse() {
    if (!this.collapsable) {
      return;
    }
    this.opened = !this.opened;
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.biz-models {
  .px2rem(margin-top, @horizontal-padding-md);
  .px2rem(margin-bottom, @horizontal-padding-md);
  .px2rem(border-radius, @border-radius-lg);
  padding-top: 0;
  text-align: left;
  background: @white-background;
  &__title {
    .px2rem(padding-top, 24px);
    .px2rem(padding-left, @horizontal-padding-lg);
    .px2rem(padding-right, @horizontal-padding-lg);
    .px2rem(line-height, 40px);
    .px2rem(font-size, 28px);
    margin-bottom: 0;
    color: rgba(0,0,0,0.85);
    font-weight: 500;
    i {
      float: right;
      transition: all .3s;
      &.closed {
        transform: rotate(-90deg);
      }
    }
    .counts {
      display: inline-block;
      .px2rem(margin-left, 20px);
      .px2rem(font-size, 24px);
      font-weight: 400;
      color:#999;
    }
  }
}
</style>
