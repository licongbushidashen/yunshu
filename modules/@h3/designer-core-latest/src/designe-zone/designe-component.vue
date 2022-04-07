
<template>
  <div
    draggable
    class="designe-component"
    @dragover.stop="onDragover"
    @drop.stop="onDrop"
    @dragleave.stop="onDragleave"
    @dragstart.stop="onDragstart"
    @dragend.stop="onDragend"
  >

      <div 
        @click.stop="() => setActive(node)"
        class="designe-component-operation"
      >
        <span
          @click.stop="() => onRemove(node.id)"
          class="designe-component-operation--remove"
        >
          <slot name="icon-remove">DEL</slot> 
        </span>
      </div>

      <component
        :is="node.type"
        v-bind="node.getRuntimeData()"
        :parentId="node.id"
        :node="node"
      />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Mixins } from "vue-property-decorator";

import DesignerNode from "./designe-node";

@Component
export default class DesignerComponent extends DesignerNode {
  
}


</script>

<style lang="less" scoped>
.designe-component{
  // display: inline-flex;
  position: relative;
  // border: 1px solid #000;

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
      border: 1px dotted #333;

      & > span{
        display: inline-block;
        background-color: rgba(0, 0, 0, 0.5);
        position: absolute;
        left: 50%;
      }
    }

    & > span{
      color: #fff;  
      cursor: pointer;
      display: none;
      z-index: 2;
      
      &:hover{
        display: inline-block;
      }
    }
  }

  &.entry-top::before{
    content: '';
    display: block;
    height: 20px;
    border: 1px solid red;
    // position: absolute;
    width: 100%;
    z-index: -1;
    // top:-20px;
  }
  
  &.entry-bottom::after{
    content: '';
    display: block;
    height: 20px;
    border: 1px solid red;
    // position: absolute;
    width: 100%;
    z-index: -1;
    // bottom:-20px;
  }


}


.designe-component-active{
  & > .designe-component-operation{
    border: 1px dotted #333;
  }
}
</style>