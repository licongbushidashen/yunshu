
<template>
  <a-switch :checked="value" :disabled="disabled" @change="val => emitChange(val)" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

import { Switch } from '@h3/antd-vue';

import { PropertyComponent } from '@h3/designer-core/property-panel';

@Component({
  components:{
    ASwitch: Switch
  }
})
export default class SwitchProperty extends Mixins(PropertyComponent) {
  
}
</script>
