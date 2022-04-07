
<template>
  <div
    v-show="data.display"
    class="property-item"
    :class="{ required: data.required }"
  >

    <div
      class="property-label"
    >
      <template v-if="titleSlot">
        <slot />
      </template>

      <template v-else-if="propInfo.title">
        <a-tooltip placement="top">
          <template slot="title">
            <span>{{ propInfo.title }}</span>
          </template>
          <label>{{ propInfo.title }}</label>
        </a-tooltip>
      </template>
      
      
      <!-- <label v-else-if="propInfo.title">{{ propInfo.title }}</label> -->
    </div>

    <div class="property-field">
      <component
        :is="componentName"
        :settings="settings"
        :value="data.children ? data.children : data.value"
        :hidden="!data.display"
        :disabled="data.disabled"
        :required="data.required"
        :formatText="formatText"
        :propKey="propKey"
        :propInfo="propInfo"
        v-bind="props"
        @change="onChange"
      ></component>
    </div>
    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

import { register } from './register';

import { PropertyDisplaySettings, PropertyData, PropertyInfo, RefPropertyInfo } from '../typings';


@Component({
  // components: {
  // }
})
export default class PropertyItem extends Vue {

  @Prop({
    default: ''
  })
  propKey!: string

  @Prop({
    default: () => ({})
  })
  propInfo!: PropertyInfo

  @Prop({
    default: () => ({})
  })
  settings!: PropertyDisplaySettings;

  @Prop({
    default: () => ({})
  })
  data!: PropertyData;

  @Prop({
    default: false
  })
  titleSlot!: boolean

  @Prop({
    default: ''
  })
  formatText!:string

  get componentName() {
    const { $ref } = this.propInfo as any as RefPropertyInfo;
    if($ref && register.packages[$ref]){
      return $ref;
    }
    const name = register.componentMap(this.propInfo, this.settings);
    return name;
  }

  get componentOptions(){
    if(this.settings){
      const component = this.settings.component;
      if(component && component.options){
        return component.options;
      }
    }
    return {};
  }

  get props(){
    return Object.assign({}, this.componentOptions)
  }

  beforeCreate() {
    const { components } = this.$options;
    if(components){
      
      for(const name in register.components){
        components[name] = register.components[name];
      }

      for(const name in register.packages){
        components[name] = register.packages[name].component;
      }

    }
  }

  onChange(value: any){
    // todo 根据元数据校验来自外部控件的数据

    this.$emit('change', value);
  }

}
</script>