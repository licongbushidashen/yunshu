
<template>
  <div class="page-header">
    <div class="header">
      <div>
        <img src="@/assets/images/yslogo.png">
      </div>
    </div>

    <div class="emtpy__body">
      <img src="@/assets/images/success.png">
      <p>操作成功</p>
      <p>
        <a-button 
          @click="onClose()" 
          v-if="showClose" 
          type="primary">关闭当前页面</a-button>
      </p>
    </div>
  </div>
</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { Button } from '@h3/antd-vue';

import * as platform from '@cloudpivot/platform';


@Component({
  name: 'empty',
  components: {
    AButton: Button
  }
})
export default class Empty extends Vue {
  onClose() {
    window.close();
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
            window.opener = null; window.close();
        }
        else {
            window.open('', '_top'); window.top.close();
        }
    }
    else if (navigator.userAgent.indexOf("Firefox") > 0 || navigator.userAgent.indexOf("Chrome") > 0) {
        window.location.href = 'about:blank';
        window.close();
        //window.history.go(-2);  
    }
    else if (navigator.userAgent.indexOf("DingTalk") > 0){
        window.close();
    }
    else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
    }
  }

  get showClose(){
    return true;
  }

  get isExternalLink() {
    const token = (window as any).externalLinkToken;
    return Boolean(token);

  }

  get isDingtalk(){
    return platform.IS_DINGTALK;
  }
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
}

.emtpy__body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  color: @light-color-1;
  font-size: 18px;

  & > p:last-child {
    margin-top: 1.25em;
  }
}
</style>
