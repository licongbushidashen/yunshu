
<template>
  <div
    :style="style"
    class="designer-container"
  >
    
    <designer-element
      v-for="child in children"
      :key="child.id"
      :id="child.id"
      :parentId="id"
    />
    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide, Mixins  } from "vue-property-decorator";

import { Layout, Icon } from "@h3/antd-vue";

import { register, DesignerNodeVue } from '@h3/designer-core'

@Component({
  components: {
  }
})
export default class DesignerContainer extends DesignerNodeVue {
  
  @Prop()
  minHeightSwitch!: boolean
  
  @Prop()
  minHeight!: string
  
  @Prop()
  autoWidth!: boolean
  
  @Prop()
  width!: string
  
  get style(){
    const style: any = {};

    style['min-height'] = this.minHeight;

    if(this.autoWidth || !this.width){
      style['width'] = 'auto';
    }else{
      style['width'] = this.width;
    }

    return style;
  }

}
</script>

<style lang="less" scoped>
// .designer-container{
//   border:1px solid red;
// }
</style>