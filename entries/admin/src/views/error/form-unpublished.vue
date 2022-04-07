
<template>
  <div class="page-header">
    <div class="header">
      <div>
        <img src="@/assets/images/yslogo.png">
      </div>
    </div>

    <div class="unpublished-main">
      <img src="@/assets/images/form-unpublished.png">
      <p>该表单未发布，请先在后台发布表单或者联系管理员处理</p>
    </div>
  </div>
</template>

<script lang="ts">

import {
  Component, Vue,
} from 'vue-property-decorator';

@Component({
  name: 'fromUnpublished',
})
export default class FromUnpublished extends Vue {

}
</script>

<style lang="less" scoped>
.page-header{
  position: fixed!important;
  top: 0!important;
  left: 0!important;
  width: 100%!important;
  height: 100%!important;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  &>.header{
    width: 100%;
    height: 64px;
    line-height: 64px;
    padding-left: 24px;
    position: absolute;
    text-align: left;
    top: 0;
    left: 0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(30,85,255,.1);
    img {
      height: 30px;
    }
  }
  .unpublished-main{
    flex: 1 1;
    width: 100%;
    overflow: auto;
    background:rgba(244,246,252,1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    p{
      font-size:14px;
      font-weight:500;
      color:rgba(0,0,0,0.45);
      line-height:20px;
    }
  }
}
</style>
