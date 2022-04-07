
<template>
  <h3-size-slider
    :bottom="true"
    :minHeight="minHeight"
    :maxHeight="maxHeight"
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
import { Component, Prop, Vue, Inject, Model } from "vue-property-decorator";

import H3SizeSlider from '../size-slider.vue';

const name = 'h3-layout-header'

@Component({
  components: {
    H3SizeSlider
  }
})
export default class H3LayoutHeader extends Vue {
  /**
   * 初始宽度
   */
  @Model('resize',{
    default : 0
  })
  value!: number

  /**
   * 最小宽度
   */
  @Prop({
    default : 1
  })
  minHeight!: number

  /**
   * 最大宽度
   */
  @Prop({
    default : -1
  })
  maxHeight!: number

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

  last = 0

  get name(){
    return name;
  }

  get style(){
    return {
      height: this.value + 'px'
    };
  }

  onResize(data:{
    height : number
  }){
    this.last = data.height;
    this.$emit('resize', data.height);
  }

  toggle(){}

}
</script>

<style lang="less" scoped>
.h3-layout-header--body{
  height:100%;
}
</style>