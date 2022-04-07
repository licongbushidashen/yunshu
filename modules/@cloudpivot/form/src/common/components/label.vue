
<template>
  <h3 v-if="isGroup">{{ label }}</h3>
  <label style="height:100%;align-items:center" v-else-if="isDescription" v-html="label"></label>
  <label style="display:flex;height:100%;align-items:center" v-else>{{label}}</label>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";

import {
  FormControl,
  FormControlType,
  FormHtmlControl,
} from "@cloudpivot/form/schema";

@Component({
    name: 'h-label'
})
export default class HLabel extends Vue {

  @Prop()
  control!: FormControl;

  @Prop({default:''})
  text!: string

  get isGroup(){
    return this.control && this.control.type === FormControlType.Group
  }
  get isDescription(){
    return this.control && this.control.type === FormControlType.Description
  }

  get label() {
    if (!this.control || !this.control.options) {
      return this.text;
    }
    let name = this.control.options.name;
    const name_i18n = this.control.options.name_i18n;
    if (name_i18n) {
      // const map = JSON.parse(name_i18n);
      const map = name_i18n;
      const locale = (this as any).$i18n.locale;
      if (map[locale]) {
        name = map[locale];
      }
    }

    return name;
  }
  // created() {
  // console.log(this.control)
  // }
}
</script>

<style lang="less" scoped>
  /deep/ em {
    font-style: italic;
  }
  /deep/ s {
    font-style: inherit;
    text-decoration: line-through;
  }
</style>
