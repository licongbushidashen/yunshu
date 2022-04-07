<template>
  <div id="app">
    <transition name="slide-fade">
      <router-view v-if="hideFootbar || isSingleApp"/>
      <nav-viewer v-else/>
    </transition>
  </div>
</template>
<style lang="less">
@import '../../styles/index.less';
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  text-align: center;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavViewer from '@/views/nav-viewer.vue';

import { externalLinkApi, listApi } from '@cloudpivot/api';
import * as platform from "@cloudpivot/platform";
import {  backStack, BackOptions } from './back';

@Component({
  name: 'App',
  components: {
    NavViewer
  },
  // NOTE: 每次进入路由前判定是否展示底部导航栏，在路由加载完毕后再展示
  // beforeRouteUpdate(to, from, next) {
  //   console.log('......');
  //   const hide = to.meta && to.meta.hideFootbar === true;
  //   const vm = this as any;
  //   vm.hideFootbar = hide;
  //   // next((vm: any) => {
  //   //   vm.hideFootbar = hide;
  //   // });
  // }
})
export default class App extends Vue {
  hideFootbar:boolean = true;

  created() {
    platform.service.setTitle(' ');
  }

  get params () {

    const url = location.search;
    const theRequest:any = new Object();
    if (url.indexOf("?") !== -1) {
      const str:string = url.substr(1);
      const strs:string[] = str.split("&");
      strs.forEach((res:string) => {
        theRequest[res.split("=")[0]] = decodeURI(res.split("=")[1]);
      })
    }
    // 
    return theRequest;

  }

  get isSingleApp() {
    if (window.Environment.appCode) {
      return true;
    }
    return false;
  }

  beforeMount() {
    const vm = this as any;
    this.$router.afterEach((to, from) => {
      const hide = to.meta && to.meta.hideFootbar === true;
      vm.hideFootbar = hide;
    });
  }
}
</script>
