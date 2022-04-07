<template>
  <div class="list-item">
    <div class="item-label">
      <i v-if="showRequire">*</i>
      {{label}}
    </div>
    <div class="wrapper">
      <slot/>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "groupTitle",
})
export default class groupTitle extends Vue {
  @Prop() label!: string;
  @Prop() showRequire!: boolean;
}
</script>
<style lang="less" scoped>
.list-item{
  height: auto;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 1px 0;
  .item-label{
    width: 4em;
    margin-right: 12px;
    box-sizing: content-box;
    // padding-left: 5px;
    position: relative;
    i{
      color: red;
      position: absolute;
      left: -8px;
      font-size: 14px;
    }
  }
  .wrapper{
    flex: 1;
  }
}
</style>
