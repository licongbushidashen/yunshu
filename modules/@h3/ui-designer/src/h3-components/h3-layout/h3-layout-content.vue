
<template>
  <div
    :class="[name]"
  >

    <slot></slot>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

const name = 'h3-layout-content'

@Component({
  components: {
  }
})
export default class H3LayoutContent extends Vue {

  get name(){
    return name;
  }

}
</script>

<style lang="less" scoped>
.h3-layout-content{
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}
</style>