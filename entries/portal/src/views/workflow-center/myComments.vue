<template>
  <myComments />
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

import flowCenter from '@cloudpivot/flow-center/pc';

@Component({
  name: 'Comments',
  components: {
    myComments: flowCenter.components.myComments
  }
})

export default class Comments extends Vue {

}
</script>

<style lang="less" scoped>
</style>
