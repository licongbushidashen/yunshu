
<template>
  <div 
    class="text"
    :style="style"
  >
    {{ content }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

// import { Icon } from '@h3/antd-vue';

// import { ComponentItem } from '@h3/designer-core/property-panel';

@Component({
  components:{
    // AIcon: Icon
  }
})
export default class AText extends Vue {
  
  @Prop({
    default: ''
  })
  content!: string

  @Prop()
  fontColor!: string

  @Prop()
  textAlign!: string

  @Prop()
  fontSize!: string

  @Prop()
  lineHight!: string

  @Prop()
  textDecoration!: string

  @Prop()
  boxModal!: any

  @Prop()
  borderStyle!: string

  @Prop()
  borderColor!: string

  get style(){
    const style: any = {};

    if(this.fontColor){
      style.color = this.fontColor;
    }

    if(this.textAlign){
      style['text-align'] = this.textAlign;
    }

    if(this.fontSize){
      style['font-size'] = this.fontSize;
    }

    if(this.lineHight){
      style['line-height'] = this.lineHight;
    }
    
    if(this.textDecoration){
      style['text-decoration'] = this.textDecoration;
    }
    
    if(this.borderStyle){
      style['border-style'] = this.borderStyle;
    }
    
    if(this.borderColor){
      style['border-color'] = this.borderColor;
    }

    for (const key in this.boxModal) {
      if(key === 'width' || key === 'height'){
        style[key] = this.boxModal[key];
      }else{
        style[key] = this.boxModal[key] + 'px';
      }
    }
    return style;
  }

}
</script>
