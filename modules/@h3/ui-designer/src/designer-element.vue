
<template>
  <div
    :class="css"
  >
    <div
      draggable
      @dragstart.stop="onDragstart"
      @dragend.stop="onDragend"
    >

      <div
        @drop.stop="onDrop"
        @dragover.stop="onDragover"
        @dragleave.stop="onDragleave"
        @click.stop="setActiveSelf"
        class="designer-element-operation"
      >
        <span
          v-if="removable"
          @click.stop="removeSelf"
          class="designer-element-operation--remove"
        >
          <a-icon type="delete" />
        </span>
        
        <div v-show="isContainer && children.length === 0">
          {{ $t('designer.tips.dragIn') }}
        </div>
      </div>

      <component
        :is="node.type"
        :id="id"
        :parentId="parentId"
        :childIds="node.childIds"
        :style="style"
        v-bind="getRuntimeData()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Mixins, Watch } from "vue-property-decorator";

import { Layout, Icon } from "@h3/antd-vue";

import { DesignerNodeVue, DataType } from '@h3/designer-core'

const name = 'designer-element';

@Component({
  components:{
    AIcon: Icon
  }
})
export default class DesignerElement extends DesignerNodeVue {

  @Prop({
    default: () => ({})
  })
  transmitStyle!: object

  get isFull(){
    return this.defaultFull || this.full;
  }

  get css(){
    return {
      [name]: true,
      [`${name}__full`]: this.isFull,
      [`${name}__active`]: this.isActive,
      [`${name}__entry-top`]: this.pointerInNorth,
      [`${name}__entry-in`]: this.pointerInCenter,
      [`${name}__entry-bottom`]: this.pointerInSouth,
    };
  }

  get style(){
    let style = {} as any;
    if(this.isFull){
      style.height = '100%';
    }
    if(this.transmitStyle){
      style = Object.assign(style,this.transmitStyle);
    }
    return style;
  }

  // getRuntimeData(){
  //   const data = {} as any;//this._runtimeData

  //   if (this.node) {
  //     for (const key in this.node.data) {
  //       const prop = this.node.data[key];
  //       if (prop.type === DataType.Object || (prop as any).$ref) {
  //         const temp = {} as any;
  //         const val = prop.value;
  //         if (val) {
  //           for (const key2 in val) {
  //             temp[key2] = val[key2].value;
  //           }
  //           data[key] = temp;
  //         }
  //       } else {
  //         data[key] = prop.value;
  //       }
  //     }
  //   }

  //   return data;
  // }

  getRuntimeData(){
    return this.node.data.value;
  }

}


</script>

<style lang="less" scoped>
.designer-element{
  border: 1px dotted #333;

  & > div{
    position: relative;
  }

  &-operation{
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: absolute;    
    height: calc(100% + 2px);
    width: calc(100% + 2px);
    margin: -1px;
    z-index: 10;
    left: 0;
    top: 0;

    &:hover{
      // border: 1px dotted #333;

      & > span{
        display: inline-block;
        position: absolute;
        left: 50%;
      }
    }

    & > span{ 
      cursor: pointer;
      display: none;
      z-index: 2;
      background: #fff;
      
      &:hover{
        display: inline-block;
      }
    }
  }

  &__entry-top{
    & > div::before{
      content: '';
      display: block;
      height: 20px;
      border: 1px solid red;
      // position: absolute;
      width: 100%;
      z-index: -1;
      // top:-20px;
    }
  }
  
  &__entry-bottom::after{
    content: '';
    display: block;
    height: 20px;
    border: 1px solid red;
    // position: absolute;
    width: 100%;
    z-index: -1;
    // bottom:-20px;
  }

  &__entry-in{
    & > div > .designer-element-operation{
      border: 1px dotted red !important;
    }
  }

  &__active{
    & > div > .designer-element-operation{
      // border: 1px dotted #333;
    }
  }

  &__full{
    height: 100%;
    & > div{
      height: 100%;
    }
  }

}
</style>