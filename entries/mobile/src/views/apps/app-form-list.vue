<template>
  <apps-list @setTitle="setApplicationTitle"/>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
// import { setTitle } from '@/utils/dingtalk';

import * as platform from '@cloudpivot/platform';

import list from '@cloudpivot/list/mobile'

import '@/config/h3-form';

@Component({
  name: 'FormList',
  components: {
   AppsList: list.components.ApplicationList
  }
})

export default class FormList extends Vue {
  setApplicationTitle(title:string) {
    // setTitle(title);
    platform.service.setTitle(title);
  }
  
}
</script>

<style lang="less" scoped>

</style>
