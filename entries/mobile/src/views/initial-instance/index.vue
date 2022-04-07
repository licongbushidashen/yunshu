<template>
  <initial-instance/>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

import flowCenter from '@cloudpivot/flow-center/mobile';

@Component({
  name: 'initial-instances',
  components: {
    InitialInstance: flowCenter.components.InitialInstance
  },
})
export default class InitialInstance extends Vue {
}
</script>

<style lang="less" scoped>
</style>
