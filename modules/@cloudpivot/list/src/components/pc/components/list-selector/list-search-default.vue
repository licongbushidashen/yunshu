<template>
  <div class="list-search-deafult">
    <div
      class="filters-box"
      :class="{'showMore': showMore}"
    >
      <!-- <query-form
        :cols="cols"
        :fields="queryConditions"
        @setFilterData="setFilterData"
        @toggle="(val) => showMore = !val"
      /> -->
      <slot name="form"></slot>
    </div>
    <slot name="action"></slot>
  </div>
</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch, Model
} from 'vue-property-decorator';
@Component({
    name: 'list-searct-default'
})
export default class ListSearchDefault extends Vue {
  /**
  * 目前用来区分是反向查询还是关联表单
  */
  @Prop({
    default: true
  })
  showSearch !: boolean;

  @Prop({
    default: false
  })
  isShowFilterBox !: boolean;
  
  @Prop({
    default: false
  })
  showMore !: boolean;
   @Prop({
    default: []
  })
  queryConditions !:Array<Object>;
}
</script>

<style lang="less">
.list-search-deafult {
  & {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    // top: -56px;
    background: #fff;
    z-index: 99;
  }
  .filters-box{
    min-height: 45px;
    // padding: 0 4px 8px;
    overflow: auto;
    &.showMore{
      height: 100%;
      overflow: auto;
    }
  }
}
</style>