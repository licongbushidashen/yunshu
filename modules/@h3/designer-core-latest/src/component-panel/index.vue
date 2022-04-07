
<template>
  <div 
    class="component-panel"
  >

    <collapse 
      v-if="groups && groups.length > 0" 
      :groups="groups" 
      :activeKey="activeKey"
    >

      <template v-slot="{ group }">

        <div
          v-for="item in group.list"
          :key="item.type"
          draggable
          @dragstart="evt => onDragstart(evt, item)"
          @dragend="evt => onDragend(evt, item)"
          class="component-item"
        >

          <slot :item="item" />

        </div>

      </template>

    </collapse>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

import { register } from '../register';

import { GroupInfo, ComponentInfo } from '../typings';

@Component({
  components: {
  }
})
export default class ComponentPanel extends Vue {

  get groups(){
    const keys = Object.keys(register.assets);
    return register.groups.map(g => {
      const infos = keys.map(key => register.assets[key].info)
        .filter(info => info.group === g.value);

      const group = Object.assign({}, g) as any;
      group.list = infos;

      return group;
    })
  }

  get activeKey() {
    return this.groups.map((g: any) => g.value);
  }

  onDragstart(evt: DragEvent, info: ComponentInfo) {
    register.dragging = register.assets[info.type];
  }

  onDragend(evt: DragEvent, info: ComponentInfo) {
    register.dragging = null;
  }
  
  beforeCreate() {
    const components = register.components as any;
    if(components){
      for(const name in components){
        (this.$options as any).components[name] = components[name];
      }
    }
  }

}
</script>