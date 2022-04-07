
<template>
  <a-input :placeholder="'请输入'" :value="value" :disabled="disabled" @change="evt => emitChange(evt.target.value)" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

import { Input } from '@h3/antd-vue';

import { PropertyComponent } from '@h3/designer-core/property-panel';

@Component({
  components:{
    AInput: Input
  }
})
export default class InputProperty extends Mixins(PropertyComponent) {
  
}
</script>
