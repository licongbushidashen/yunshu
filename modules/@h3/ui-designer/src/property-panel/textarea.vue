
<template>
  <a-textarea 
    :value="value" 
    :disabled="disabled" 
    @change="evt => emitChange(evt.target.value)" 
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

import { Input } from '@h3/antd-vue';

import { PropertyComponent } from '@h3/designer-core/property-panel';

@Component({
  components:{
    ATextarea: Input.TextArea
  }
})
export default class TextareaProperty extends Mixins(PropertyComponent) {
  
}
</script>
