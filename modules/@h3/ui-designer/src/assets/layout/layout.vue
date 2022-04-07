
<template>
  <h3-layout :class="{
    [name] : true
  }">

    <designer-element 
      v-if="east"
      :id="east.id" 
      :parentId="id"
      :full="true"
      :draggable="false"
      @click="() => setActive(east)"
    >
    </designer-element>

    <h3-layout-content>

      <designer-element
        v-if="north"
        :id="north.id" 
        :parentId="id"
        :draggable="false"
      >
      </designer-element>
      
      <designer-element
        v-if="center"
        :id="center.id" 
        :parentId="id"
        :full="true"
        :translateTo="id"
      >
      </designer-element>
      
      <designer-element
        v-if="south"
        :id="south.id"
        :parentId="id"
        :draggable="false"
      >
      </designer-element>

    </h3-layout-content>

    <designer-element
      v-if="west"
      :id="west.id" 
      :parentId="id"
      :full="true"
      :draggable="false"
    >
    </designer-element>

  </h3-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

import * as schema from './schema';

import {
  register,
  uniqueId,
  DesignerNodeVue,
  Direction
} from "@h3/designer-core";

import { factory } from "@h3/designer-core/property-panel";

import { H3Layout, H3LayoutContent } from "../../h3-components/h3-layout";

const name = 'designer-layout'

@Component({
  components: {
    H3Layout,
    H3LayoutContent
  }
})
export default class DesignerLayout extends DesignerNodeVue {

  get name(){
    return name;
  }

  get east(){
    return this.children.find(c => c.data.children.direction.value === Direction.East);
  }

  get west(){
    return this.children.find(c => c.data.children.direction.value === Direction.West);
  }

  get north(){
    return this.children.find(c => c.data.children.direction.value === Direction.North);
  }

  get center(){
    return this.children.find(c => c.data.children.direction.value === Direction.Center);
  }
  
  get south(){
    return this.children.find(c => c.data.children.direction.value === Direction.South);
  }

  created() {
    const store = register.store;
    if (this.children.length === 0 && store) {

      const keys = Object.keys(Direction);
      
      for (const key of keys) {
        const direction = (Direction as any)[key];
        if(direction === Direction.None){
          continue;
        }

        const data = factory.build(schema.panel);
        data.children.direction.value = direction;
        
        const id = uniqueId();
        store.insert({
          id,
          parentId: this.id,
          type: "layoutPanel",
          data,
          index: -1
        });
      }

    }
  }
}
</script>

<style lang="less" scoped>
  .designer-layout{
    display: flex;
    flex-direction: row;
    height: 100%;

    &--content{
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    
    &--center{
      flex-grow: 1;
    }

  }
</style>