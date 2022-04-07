<template>
  <div class="app-home">
    <app-home-content :appCode="appCode"></app-home-content>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
// import { State } from 'vuex-class';
import Application from '@cloudpivot/application/pc';
// import AppHomeContent from '../../components/single-app/app-home-content.vue';
// import { parseUrlParam } from '../../utils/utils';

@Component({
  name: 'app-home',
  components: {
    AppHomeContent: Application.AppHomeContent
  }
})
export default class AppHome extends Vue {
  // @State('appCode') appCode!: string;

  appCode: string = '';

  // get code() {
  //   if (!this.appCode) {
  //     return window.Environment.appCode || parseUrlParam(window.location.href, 'appCode') || '';
  //   }
  //   return this.appCode;
  // }

  get code(){
    return window.Environment.appCode || this.$route.query.appCode
  }

  created() {

    if (this.code) {
      this.appCode = this.code;
      localStorage.setItem('appCode', this.code);
    } else {
      const appCode = localStorage.getItem('appCode');

      if (appCode) {
        this.appCode = appCode;
      }
    }
  }

}

</script>
<style lang='less' scoped>
@import "../../styles/themes/default.less";
.app-home {
  position: absolute;
  left: @base4-padding-md;
  right: @base4-padding-md;
  bottom: @base4-padding-md;
  top: @base4-padding-md;
  // top: 14px;
  overflow: hidden;
}
</style>
