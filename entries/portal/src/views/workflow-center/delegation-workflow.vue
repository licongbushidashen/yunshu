<template>
  <delegation-workflow @openForm="openForm"/>
</template>

<script lang="ts">

// 初始化表单组件配置
import "@/config/h3-form";


import { Component, Prop, Vue } from 'vue-property-decorator';


import flowCenter from '@cloudpivot/flow-center/pc';

@Component({
  name: 'DelegationWorkflow',
  components: {
    delegationWorkflow: flowCenter.components.DelegationWorkflow
  }
})
export default class DelegationWorkflow extends Vue {
  /**
   * 查看表单详情
   */
  openForm(obj:any) {
    const url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${obj.instanceId}&return=${location.pathname + location.search}&workitemType=delegationWorkflow`;
    if (this.isDingTalk) {
      this.$router.push({
        path: url
      }).catch((err: any) => {err});
    } else {
      const newWindow: any = window.open();
      newWindow.location.href = url;
    }
  }
}

</script>
<style lang='less' scoped>

</style>