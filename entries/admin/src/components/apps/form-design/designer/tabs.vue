
<template>
  <div class="tabs">

    <tabs-heads
      v-model="activeKey"
      :heads="heads"
      @change="onActiveKeyChange"
    ></tabs-heads>

    <tabs-panel
      v-for="panel in panels"
      v-show="activeKey === panel.key"
      :key="panel.key"
      :panel="panel"
    ></tabs-panel>
    
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue,
  Prop,
  Emit,
  Watch,
  Inject,
  Provide
} from "vue-property-decorator";

import { FormTabs, FormTabsPanel, FormControlType } from "../typings";

@Component({
  name: "tabs",
  components: {
    TabsHeads : () => import("./tabs-heads.vue"),
    TabsPanel : () => import("./tabs-panel.vue")
  }
})
export default class Tabs extends Vue {
  @Prop({
    default : () => {}
  })
  readonly control!: FormTabs;

  panels: FormTabsPanel[] = [];

  activeKey = '';
  
  @Inject()
  emitControlUpdate!: Function;

  get heads(){
    if(!this.control.options){
      return [];
    }

    return this.control.options.heads || [];
  }
  
  @Watch("control", {
    immediate: true
  })
  setControl(val: any) {
    if (val.panels) {
      this.panels = val.panels;
    }

    if(this.heads.length > 0){
      let head = this.heads.find(h => h.active);
      if(!head){
        head = this.heads[0];
      }
      this.activeKey = head.key;
    }
  }

  onActiveKeyChange(activeKey:string){
    let head = this.heads.find(h => h.key === activeKey);
    this.heads.forEach(h => h.active = false);
    head.active = true;
  }

}
</script>

<style lang="less" scoped>
.tabs{
  flex-grow: 1;
}

</style>