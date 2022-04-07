<template>
  <my-unfinished-workItem :appcode="appCode" @openForm="openForm"/>
</template>
<script lang="ts">

import { Component, Vue, Watch } from 'vue-property-decorator';

import { State } from 'vuex-class';

import flowCenter from '@cloudpivot/flow-center/mobile';

@Component({
  name: 'workitems',
  components: {
    MyUnfinishedWorkItem: flowCenter.components.MyUnFinishedWorkItem
  }
})
export default class Workitems extends Vue {
  @State('appCode') appCode!: any;

  openForm(workitem:any) {
    this.$router.push({
      name: 'form-detail',
      query: {
        workitemId: workitem.id,
        workflowInstanceId: workitem.instanceId,
        return: this.$route.fullPath,
        workitemType: 'unfinishedWorkitem'
      }
    }).catch((err: any) => {err});
  }
}
</script>
<style lang="less" scoped>
</style>
