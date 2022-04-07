<template>
  <start-workflow/>
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'vue-property-decorator';

import flowCenter from '@cloudpivot/flow-center/pc';

@Component({
  name: 'StartWorkflow',
  components: {
    startWorkflow: flowCenter.components.StartWorkflow
  }
})

export default class StartWorkflow extends Vue {

}
</script>

<style lang="less" scoped>

</style>
