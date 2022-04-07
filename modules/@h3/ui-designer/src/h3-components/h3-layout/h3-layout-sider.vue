
<template>
  <h3-size-slider
    :left="left"
    :right="!left"
    :minWidth="minWidth"
    :maxWidth="maxWidth"
    @resize="onResize"
    :class="[name]"
    :style="style"
  >
    <div :class="[`${name}--body`]">
      <slot></slot>
    </div>

    <div
      v-if="collapsible"
      :class="[`${name}--toggle`]"
      @click="toggle"
    >
    </div>
  </h3-size-slider>
</template>

<script lang="ts">
import { Component, Prop, Vue, Model } from "vue-property-decorator";

import H3SizeSlider from '../size-slider.vue';

const name = 'h3-layout-sider'

@Component({
  components: {
    H3SizeSlider
  }
})
export default class H3LayoutSider extends Vue {
  
  @Prop({
    default : true
  })
  left !: boolean

  /**
   * 初始宽度
   */
  @Model('resize', {
    default : 100
  })
  // @Prop()
  value!: number

  /**
   * 最小宽度
   */
  @Prop({
    default : 1
  })
  minWidth!: number

  /**
   * 最大宽度
   */
  @Prop({
    default : -1
  })
  maxWidth!: number

  /**
   * 可收缩的
   */
  @Prop({
    default : true
  })
  collapsible!: boolean

  /**
   * 是否收起
   */
  @Prop({
    default : false
  })
  collapsed!: boolean

  /**
   * 可调整大小
   */
  @Prop({
    default : true
  })
  slider!: boolean

  lastWidth = 0

  get name(){
    return name;
  }

  get style(){
    return {
      width: this.value + 'px'
    };
  }

  onResize(data:{
    width : number
  }){
    this.lastWidth = data.width;
    this.$emit('resize', data.width);
  }


  toggle(){}
}
</script>


<style lang="less" scoped>
.h3-layout-sider--body{
  height:100%;
}
</style>