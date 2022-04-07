<template>
  <div>
    <h1>
      <slot name="title"></slot>
      <i class="icon aufontAll h-icon-all-close" @click="$emit('destroy')"></i>
    </h1>
    <div class="box-content">
      <slot name="table"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop
} from 'vue-property-decorator';
@Component({
  name: 'BasicBox'
})
export default class BasicBox extends Vue {

}
</script>
<style lang="less" scoped>
h1{
  height: @line-height-xl*2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: @font-size-16;
  color: @text-color-selected;
  .h-icon-all-close {
    opacity: 0.5;
  }
}
</style>

