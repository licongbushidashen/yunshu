
<template>
  <a-select
    :value="value"
    :disabled="disabled"
    :options="options"
    @change="val => emitChange(val)"
  >

  </a-select>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Inject, Mixins } from "vue-property-decorator";

import { Select } from "@h3/antd-vue";

import { PropertyComponent, EnumPropertyInfo } from '@h3/designer-core/property-panel';

import { SelectPropertySettings } from './typings';

import * as forms from 'h3-forms'

@Component({
  components: {
    ASelect: Select,
    ASelectOption: Select.Option
  }
})
export default class SelectProperty extends Mixins(PropertyComponent) {

  @Inject()
  controller!: forms.FormGroup

  get enum(){
    return (this.propInfo as EnumPropertyInfo).enum;
  }

  get options(){
    const settings = this.settings as SelectPropertySettings;
    if(settings && settings.selectOptions){
      if(Array.isArray(settings.selectOptions)){
        return settings.selectOptions;
      }else {
        return settings.selectOptions(this.propKey, this.value, this.controller, this.propInfo, this.$i18n);
      }
    }

    if(Array.isArray(this.enum)){
      return this.enum.map(value => ({ value, label: value }));
    }

    return [];
  }

}
</script>
