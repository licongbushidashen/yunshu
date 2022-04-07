<template>
  <batch-info-add />
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

import flowCenter from '@cloudpivot/flow-center/mobile';

@Component({
  name: 'batchTransfer',
  components: {
    BatchInfoAdd: flowCenter.components.BatchTransferInfo
  },
})
export default class batchTransfer extends Vue {
  
}
</script>

<style lang="less" scoped>
</style>
