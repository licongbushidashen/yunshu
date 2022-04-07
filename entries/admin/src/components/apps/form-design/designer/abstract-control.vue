
<template>

  <tabs v-if="isTabs" :control="control"></tabs>

  <h3-moible-view v-else-if="mobile" :control="control"></h3-moible-view>

  <sheet v-else-if="isSheet" :control="control"></sheet>
  
  <h-label v-else-if="isLabel" :control="control"></h-label>
  
  <base-control v-else :control="control"></base-control>

</template>

<script lang='ts'>
import { Vue, Prop, Component, Inject } from "vue-property-decorator";

import {
  FormControl,
  FormControlType
} from "@/components/apps/form-design/typings";

import Sheet from "./sheet.vue";
import Tabs from "./tabs.vue";
import BaseControl from "./base-control.vue";
import H3MoibleView from "./mobile-compontents.vue";

import HLabel from './label.vue';

@Component({
  name: "abstract-control",
  components: {
    BaseControl,
    H3MoibleView,
    Sheet,
    Tabs,
    HLabel
  }
})
export default class AbstractControl extends Vue {
  //functional = true;

  @Prop()
  control!: FormControl;

  @Prop()
  span!: number;

  @Inject()
  isMobile!: Function;

  get mobile(){
    return this.isMobile();
  }
  
  get isTabs(){
    return this.control && this.control.type === FormControlType.Tabs;
  }
  
  get isSheet(){
    return this.control && this.control.type === FormControlType.Sheet;
  }
  
  get isLabel(){
    if(this.control){
      const type = this.control.type
      const is = type === FormControlType.Group
       || type === FormControlType.SheetStatistic;
      return is;
    }
    return false;
  }

  // render(h: Function) {
  //   let opts = {
  //     attrs: {
  //       control: this.control
  //     }
  //   };

  //   if (this.isMobile()) {
  //     return h("h3-moible-view", opts);
  //   } else {
  //     const createSheet = () => h("sheet", opts);

  //     const createBase = () => h("base-control", opts);

  //     const createTabs = () => h("tabs", opts);

  //     const type = this.control.type;

  //     if (type === FormControlType.Sheet) {
  //       return createSheet();
  //     }else if(type === FormControlType.Tabs){
  //       return createTabs();
  //     }else if(type === FormControlType.Description || type === FormControlType.SheetStatistic){
  //       return h('h-label', opts);
  //     }

  //     return createBase();
  //   }
  // }
}
</script>


<style lang="less" scoped>
</style>

