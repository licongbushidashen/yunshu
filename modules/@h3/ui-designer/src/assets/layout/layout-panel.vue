
<template>
  <h3-layout-sider
    v-if="isEast || isWest"
    :left="isWest"
    :value="basis"
    @resize="onResize"
  >
      
    <designer-element 
      v-for="child in children"
      :key="child.id"
      :id="child.id" 
      :parentId="id"
    />

  </h3-layout-sider>
  
  <h3-layout-header
    v-else-if="isNorth"
    :value="basis"
    @resize="onResize"
  >
      
    <designer-element 
      v-for="child in children"
      :key="child.id"
      :id="child.id" 
      :parentId="id"
    />

  </h3-layout-header>

  <h3-layout-footer
    v-else-if="isSouth"
    :value="basis"
    @resize="onResize"
  >
      
    <designer-element 
      v-for="child in children"
      :key="child.id"
      :id="child.id" 
      :parentId="id"
    />

  </h3-layout-footer>
  
  <h3-layout-content
    v-else-if="isCenter"
  >
      
    <designer-element 
      v-for="child in children"
      :key="child.id"
      :id="child.id" 
      :parentId="id"
    />

  </h3-layout-content>

</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

import {
  register,
  DesignerNodeVue,
  Direction
} from "@h3/designer-core";

import { H3LayoutHeader, H3LayoutContent, H3LayoutFooter, H3LayoutSider } from "../../h3-components/h3-layout";

const name = 'designer-layout-panel'

@Component({
  components: {
    H3LayoutContent,
    H3LayoutHeader,
    H3LayoutFooter,
    H3LayoutSider
  }
})
export default class DesignerLayoutPanel extends DesignerNodeVue {

  get isNorth(){
    return this.direction === Direction.North;
  }
  
  get isCenter(){
    return this.direction === Direction.Center;
  }
  
  get isSouth(){
    return this.direction === Direction.South;
  }
  
  get isEast(){
    return this.direction === Direction.East;
  }

  get isWest(){
    return this.direction === Direction.West;
  }

  @Prop()
  basis!:number

  @Prop()
  direction!: Direction

  // get css(){
  //   return {
  //     [name] : true,
  //     [`${name}--${this.direction}`] : true
  //   }
  // }
  
  get style(){
    return {};
    // return {
    //   'flex-basis': `${this.instance.data.basis.value}px` 
    // }
  }

  onResize(value: number){
    this.properties.basis.value = value;
  }
}
</script>

<style lang="less" scoped>

</style>