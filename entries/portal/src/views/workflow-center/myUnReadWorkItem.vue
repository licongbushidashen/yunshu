<template>
  <my-unread-work-item @openForm="openForm"/>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';


import {
  Action, namespace
} from 'vuex-class';

import flowCenter from '@cloudpivot/flow-center/pc';


@Component({
  name: 'UnReadWorkItem',
  components: {
    MyUnreadWorkItem: flowCenter.components.MyUnReadWorkItem
  }
})

export default class UnReadWorkItem extends Vue {
  /**
   * 查看表单详情
   */
  openForm(obj:any) {
    const url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${obj.instanceId}&return=${location.pathname + location.search}&workitemType=unreadWorkitem`;
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
