<template>
  <div class="biz-model" @click="$emit('onItem', modelData)">
    <i class="icon aufontAll" :class="[modelData.icon || 'h-icon-all-subordinate-o']"></i>
    <span
      class="biz-model__text"
      v-if="searchWord"
      v-html="splitKeyword(modelData)"
    ></span>
    <span class="biz-model__text" v-else>{{ getName(modelData) }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { utils } from '@cloudpivot/common';

@Component({
  name: 'biz-model',
  components: {
   }
})
export default class bizModel extends Vue {
  @Prop() modelData!: any;

  @Prop() searchWord?: string

  getName(block:any){
    return utils.BusinessFunctions.getLangName(block);
  }

  /**
   * 高亮匹配文字
   */
  splitKeyword(block: any) {
    // 提取当前应用的国际化语言对应显示名
    let str:string = utils.BusinessFunctions.getLangName(block);
    if (this.searchWord && str) {
      const reg:RegExp = new RegExp(`${this.searchWord}`, 'g');
      const arr: any = str.replace(reg, `<span class="highlight">${this.searchWord}</span>`);
      return arr;
    }
    return str;
  }
}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.biz-model {
  background: #fff;
  display: flex;
  border-bottom: 1px solid #EBEDF2;
  .px2rem(padding-left, 30px);
  .px2rem(padding-right, 30px);
  .px2rem(height, 112px);
  .px2rem(line-height, 112px);
  i{
    .px2rem(font-size, 41px);
    .px2rem(margin-right, 30px);
    color: @primary-color;
  }
  &__text{
    .px2rem(font-size, 32px);
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /deep/.highlight {
    color: @primary-color;
  }
}
</style>
