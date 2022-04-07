<template>
  <apps-item :appCode="appCode" :signAppCode="signAppCode"/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import * as apps from '@cloudpivot/application';

import { State } from 'vuex-class';

import common from '@cloudpivot/common/mobile';

import * as platform from '@cloudpivot/platform';

@Component({
  name: 'app-item',
  components: {
    AppsItem: apps.components.mobile.AppsItem
  }
})
export default class AppItem extends Vue {
  @State('appName') appName!: any;

  appCode:string = '';

  created() {
    this.appCode = this.$route.params.appCode;
    platform.service.setTitle(this.appName||'');
  }
}
</script>

<style lang="less" scoped>
</style>
