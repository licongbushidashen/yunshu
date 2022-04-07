
<template>
  <div
    class="designer-page"
    @click="setActiveSelf"
  >
    <designe-zone
      :style="style"
      :id="id"
      :isRoot="true"
      :childIds="childIds"
    ></designe-zone>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide, Mixins } from "vue-property-decorator";

import { Layout, Icon } from "@h3/antd-vue";

import { PropertyPanel, factory } from "@h3/designer-core/property-panel";

import { register, DesigneZone, DesignerNodeVue } from '@h3/designer-core'


@Component({
  components: {
    DesigneZone
  }
})
export default class DesignerPage extends DesignerNodeVue {

  @Prop({
    default: () => ({})
  })
  backgroundSetter!: {
    opacity: any,
    width: any,
    height: any,
    color: any
  }

  @Prop({
    default: () => ({})
  })
  borderSetter!: any
  
  
  get style(){
    const style: any = {};
    for (const key in this.backgroundSetter) {
      style[key === 'color' ? 'background' : key] = (this.backgroundSetter as any)[key];
    }
    for (const key in this.borderSetter) {
      if(key.indexOf('raduis') != -1){
        style[key] = this.borderSetter[key];
      }
    }
    let borderSides = this.borderSetter.borderSides;
    borderSides && borderSides.forEach((item: string)=>{
      let colorName = 'border-' + item + '-color';
      let styleName = 'border-' + item + '-style';
      let widthName = 'border-' + item + '-width';
      style[colorName] = this.borderSetter['border-color'];
      style[styleName] = this.borderSetter['border-style'];
      style[widthName] = this.borderSetter['border-width'];
    })
    return style;
  }

}
</script>

<style lang="less" scoped>
  .designer-page,/deep/.designe-zone{
    height: 100%;
  }
</style>