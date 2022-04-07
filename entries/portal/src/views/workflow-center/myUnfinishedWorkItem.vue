<template>
  <my-unfinished-work-item @openForm="openForm"/>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

import flowCenter from '@cloudpivot/flow-center/pc';

@Component({
  name: 'UnfinishedWorkItem',
  components: {
    MyUnfinishedWorkItem: flowCenter.components.MyUnFinishedWorkItem
  }
})

export default class UnfinishedWorkItem extends Vue {
  /**
   * 查看表单详情
   */
  openForm(obj:any) {
    const url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${obj.instanceId}&return=${location.pathname + location.search}&workitemType=unfinishedWorkitem`;
    if (this.isDingTalk) {
      this.$router.push({
        path: url
      }).catch((err: any) => {err});
    } else {
      // const newWindow: any = window.open();
      // newWindow.location.href = url;
      obj.vm.IframeFormUrl = url;
      obj.vm.showIframeForm = true;
    }
  }
}
</script>

<style lang="less" scoped>
</style>
