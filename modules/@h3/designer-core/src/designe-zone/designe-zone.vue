
<template>
  <div 
    class="designe-zone"
    @dragover.stop="onDragover"
    @drop.stop="onDrop"
  >

    <designer-element
      v-for="(child, index) in children"
      :key="child.id"
      :index="index"
      :id="child.id"
      :parentId="id"
      :childIds="child.childIds"
    >
    </designer-element>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide, Mixins } from 'vue-property-decorator';

import DesignerNodeVue from "./designer-node-vue";

@Component({
  components: {
  }
})
export default class DesigneZone extends DesignerNodeVue {
  
}

</script>