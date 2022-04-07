
<template>
  <a-input-number :value="value" :disabled="disabled" @change="val => emitChange(val)" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

import { InputNumber } from '@h3/antd-vue';

import { PropertyComponent } from '@h3/designer-core/property-panel';

@Component({
  components:{
    AInputNumber: InputNumber
  }
})
export default class InputProperty extends Mixins(PropertyComponent) {
  
}
</script>
