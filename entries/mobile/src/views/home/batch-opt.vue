<template>
  <batch-info-add/>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

import flowCenter from '@cloudpivot/flow-center/mobile';

@Component({
  name: 'batch-opt',
  components: {
    BatchInfoAdd: flowCenter.components.BatchInfoAdd
  },
})
export default class BatchOpt extends Vue {
}
</script>

<style lang="less" scoped>
</style>
