<template>
  <div class="group-title">
    <i></i>
    <span><slot/></span>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import systemApi from "@/apis/system/system-manager.api";
import common from "@cloudpivot/common/pc";

@Component({
  name: "groupTitle",
})
export default class groupTitle extends Vue {
}
</script>
<style lang="less" scoped>
.group-title{
  height: 20px;
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 600;
  color: #000000;
  line-height: 20px;
  margin: 0 0 12px 0;
  position: relative;
  box-sizing: content-box;
  i{
    position: absolute;
    width: 2px;
    height: 10px;
    background: @primary-color;
    border-radius: 1px;
    border: 1px solid @primary-color;
    margin-right: 3px;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
  }
  small{
    margin-left: 8px;
    font-size: 12px;
    color: rgba(0,0,0,0.65);
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
  }
}
</style>
