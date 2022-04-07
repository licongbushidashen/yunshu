
<template> 
  <h3 v-if="isGroup">{{ label }}</h3>
  <label v-else>{{ label }}</label>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";

import {
  FormControl,
  FormControlType,
  FormHtmlControl,
} from "../typings";

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

  get label() {
    if (!this.control || !this.control.options) {
      return this.text;
    }
    let name = this.control.options.name;
    const name_i18n = this.control.options.name_i18n;
    if (name_i18n) {
      // const map = JSON.parse(name_i18n);
      const map = name_i18n;
      const locale = this.$i18n.locale;
      if (map[locale]) {
        name = map[locale];
      }
    }
    
    return name;
  }
  created() {
    console.log(this.control)
  }
}
</script>

<style lang="less" scoped>


</style>