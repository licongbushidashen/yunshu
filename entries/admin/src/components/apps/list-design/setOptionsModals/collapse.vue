<template>
  <div class="collapse">
    <div class="collapse-header" @click="toggle">
        <span v-if="show" class="icon aufontAll h-icon-all-down-o"></span>
        <span v-else class="icon aufontAll h-icon-all-right-o"></span>
        <slot name="title">
          <font style="margin-left: 8px;font-weight: 700;">{{title}}</font>
        </slot>
    </div>
    <div class="slot" v-show="show">
        <slot />
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

@Component({
  name: 'collapse',
  components: {
  }
})
export default class collapse extends Vue {
    @Prop({ default: '' }) title?:string;
    show:boolean = true
    toggle(){
        this.show = !this.show
    }
}
</script>
<style lang="less" scoped>
.collapse-header{
    color: #262626;
    font-size: 12px;
    cursor: pointer;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    span{
        font-size: 12px;
    }
}
.slot{
    padding-left: 10px;
}
</style>
