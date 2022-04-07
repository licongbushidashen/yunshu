
<template>
  <div 
    class="property-panel"
    :class="`property-panel-${css}`"
  >

    <collapse 
      v-if="groups && groups.length > 0" 
      :groups="groups" 
      :activeKey="activeKey"
    >

      <template v-slot="{ group }">

        <property-item 
          v-for="(key, i) in group.keys"
          :key="key"
          :propKey="key"
          :data="controls[key]"
          :settings="getDisplaySettings(key)"
          :propInfo="schema.properties[key]"
          :titleSlot="titleSlot"
          :formatText="formatTexts[key]"
          @change="val => onItemValueChange(key, val)"
        >

          <slot name="title" :property="{key, item: controls[key]}" />
        </property-item>

        <div
          :key="key"
          class="last-none-item"
          v-if="(group.keys.length -1 === i) && !controls[key].display"
        ></div>

      </template>

    </collapse>

    <template v-else-if="schema.properties">
      <template  v-for="(item, key, index) in controls">
        <property-item 
          :key="key"
          :propKey="key"
          :data="item"
          :settings="getDisplaySettings(key)"
          :propInfo="schema.properties[key]"
          :titleSlot="titleSlot"
          :formatText="formatTexts[key]"
          @change="val => onItemValueChange(key, val)"
          
        >

          <slot name="title" :property="{key, item}" />

        </property-item>
        <div
          :key="key"
          class="last-none-item"
          v-if="(Object.keys(controls).length - 1 === index) && !item.display"
        ></div>
        <!--  -->
      </template>
      

    </template>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";

import { register } from '../register';
import { register as propRegister } from './register';

import { ObjectPropertyInfo, ComponentSettings, PropertyData, PropertiesData, DataType  } from '../typings';

import PropertyItem from './property-item.vue'

import * as forms from 'h3-forms'

@Component({
  components: {
    PropertyItem
  }
})
export default class PropertyPanel extends Vue {

  get controls(){
    if(this.data && this.data.children){
      return this.data.children;
    }
    return {};
  }
  
  @Provide()
  getController(){
    return this.data;
  }

  @Prop({
    default: ''
  })
  uid!: string

  @Prop({
    default: () => ({})
  })
  schema!: ObjectPropertyInfo;

  @Prop({
    default: () => ({})
  })
  settings!: ComponentSettings;

  @Prop()
  data!: forms.FormGroup;

  @Prop({
    default: 'cell'
  })
  css!: string

  @Prop({
    default: false
  })
  titleSlot!: boolean

  get properties(){
    return this.settings.properties;
  }

  get groups() {
    if (this.properties) {
      return this.properties.groups || [];
    }
    return [];
  }

  get activeKey() {
    return this.groups.map((g: any) => g.value);
  }
  
  getDisplaySettings(key: string){
    return this.properties && this.properties.display ? this.properties.display[key] : null;
  }

  formatTexts : { [key:string] : string } = {} 

  @Watch('data', {
    immediate: true
  })
  onDataChange(){
    this.formatTexts = {};

    for(const key in this.controls){
      this.callFunc(true, key, this.controls[key].value);
    }
  }

  onItemValueChange(key: string, obj: any) {
      let value:any;

      const control = this.controls[key];
      if (!(control as any).children) {
          control.value = obj;
          value = obj;
      } else {
          value = obj.value;
      }

      this.callFunc(false, key, value);

    this.$emit('change', key, value ,this.data);
  }

  callFunc(initial:boolean, key: string, value: any){
    
    if(this.properties){

      const subscription = this.properties.subscription;
      if (subscription && subscription.dataChange) {
        const fn = subscription.dataChange;
        if (typeof fn === "function") {
          fn(key, value, this.data, this.schema, initial);
        }
      }

      const displaySettings = this.getDisplaySettings(key);
      if (displaySettings) {
        const fn = displaySettings.formatter;
        if (typeof fn === "function") {
          this.formatTexts[key] = fn(key, value, this.data, this.schema, this.$i18n);
        }
      }

    }
  }

  beforeCreate() {
    (this.$options as any).components.Collapse = propRegister.components.Collapse || register.components.Collapse
  }
}
</script>