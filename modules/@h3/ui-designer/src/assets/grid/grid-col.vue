
<template>
<div>
  <designer-element 
    v-for="child in children"
    :key="child.id"
    :id="child.id" 
    :parentId="id"
  />
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

import {
  register,
  DesignerNodeVue,
  Direction
} from "@h3/designer-core";

import { Col } from '@h3/antd-vue';

const name = 'designer-grid-col'

@Component({
  components: {
    ACol: Col
  }
})
export default class DesignerGridCol extends DesignerNodeVue {

  
}
</script>

<style lang="less" scoped>

</style>