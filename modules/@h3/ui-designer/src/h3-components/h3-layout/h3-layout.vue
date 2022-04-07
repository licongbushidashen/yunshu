
<template>
  <div :class="[name]">

    <slot></slot>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

const name = 'h3-layout'

@Component({
  components: {
  
  }
})
export default class H3Layout extends Vue {

  get name(){
    return name;
  }

}
</script>

<style lang="less" scoped>
.h3-layout{
    display: flex;
    flex-direction: row;
    height: 100%;
    flex-grow: 1;
}
</style>