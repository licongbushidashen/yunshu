
<template>
  <div class="tabs-panel">
    <grid
      :controls="controls"
      :layout="layout"
      :clearParentShowEmptyTask="clearParentShowEmptyTask"
      :path="path"
      @change="onGridChange"
      @control-add="onControlAdd"
      @control-delete="onControlDelete"
    ></grid>
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

import { FormControl, FormTabsPanel, FormControlType, DataItem } from "../typings";
import { schema } from "@cloudpivot/form";

import * as ControlFactory from "../typings/control-factory";

@Component({
  name: "tabs-panel",
  components: {
    Grid: () => import("./grid.vue")
  }
})
export default class TabsPanel extends Vue {
  @Prop()
  readonly panel!: FormTabsPanel;

  @Inject()
  clearParentShowEmptyTask!: () => void;
  
  @Inject()
  setDataitemUesdFor!: (controls : { [key:string] : schema.FormControl}, used:boolean,key : string) => void;

  controls = {} as any;

  layout: string[][] = [];

  @Inject()
  emitControlSelect!: Function;

  @Inject()
  copyDataItemFrom!: (control : FormControl, copyKey: string) => void;

  @Inject()
  emitDataItemDelete!: (code: string) => void;

  get path(){
    const tabs = (this.$parent as any).control as schema.FormTabs;
    if(tabs.path){
      return tabs.path.concat([this.panel.key]);
    }else{
      return [tabs.key, this.panel.key];
    }
  }

  // get ignoreTypes(){
  //   return [schema.FormControlType.ReverseRelevance];
  // }

  @Watch("panel", {
    immediate: true
  })
  setControl(val: any) {
    if (val.controls) {
      this.controls = val.controls;
    }

    if (val.layout) {
      this.layout = val.layout;
    }
  }

  onGridChange(layout: string[][]) {
    this.layout = layout;
  }

  onControlAdd(control: FormControl, copyKey?: string) {
    console.log('onControlAdd =>', control, copyKey, this.controls)
    ControlFactory.setControlPath(control, this.path);

    this.controls[control.key] = control;

    if(control.key !== '.'){
      this.setDataitemUesdFor(this.controls, true, control.key);
    }

    if(copyKey){
      this.copyDataItemFrom(control, copyKey);
    }
  }

  onControlDelete(controlKey: string) {
    if(controlKey !== '.'){
      this.setDataitemUesdFor(this.controls, false, controlKey);
    }

    delete this.controls[controlKey];
    this.emitDataItemDelete(controlKey);
    this.emitControlSelect();
  }
}
</script>

<style lang="less" scoped>
.tabs-panel {
  background: #fff;
  // border: 1px solid black;
  width: 100%;
}
</style>