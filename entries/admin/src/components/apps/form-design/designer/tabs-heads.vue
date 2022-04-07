
<template>
  <div class="tabs-heads">
    <div
      v-for="head in heads"
      :key="head.key"
      class="tabs-head"
      :class="{ active : activeKey === head.key }"
      @click="setActiveKey(head.key)"
    >{{ head.title }}</div>
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue,
  Prop,
  Emit,
  Watch,
  Inject,
  Provide,
  Model
} from "vue-property-decorator";

import { FormTabs, FormTabsPanel, FormControlType } from "../typings";

@Component({
  name: "tabs-heads",
  components: {
    TabsPanel: () => import("./tabs-panel.vue")
  }
})
export default class TabsHeads extends Vue {
  @Prop({
    default: () => []
  })
  readonly heads!: Array<{ key: string; title: string }>;

  @Model('change')
  readonly activeKey!: string;

  setActiveKey(key: string) {
    this.$emit("change", key);
  }
}
</script>

<style lang="less" scoped>
.tabs {
  // border: 1px solid black;
  width: 100%;
}

.tabs-heads {
  display: flex;
  border-bottom:1px solid @normal-color;
}

.tabs-head {
  display: inline-block;
  padding: @base4-padding-xs @base4-padding-md;
  background: #fff;
  border-radius: @border-radius-base @border-radius-base 0 0;
  margin-left: @base4-padding-base; 
  position: relative;
  word-break: keep-all;
  
//   &:not(:first-child){
        // margin-left: @base4-padding-base;
//   }

  &.active {
    color: @primary-color;
    font-weight: 500;

    &::after{
      content: '';
      display: inline-block;
      height: 2px;
      background-color: @primary-color;
      width: 100%;
      position: absolute;
      left: 0;
      bottom: -1px;
    }

  }
}
</style>