
<template>
  <div
    class="rich-text"
    :style="{ 'text-align' : align}"
    :class="{ collapsed : collapsed, vertical : layoutType }"
  >
    <div style="padding-bottom:11px;overflow-x: scroll"  :style="labelStyle" v-html="text"></div>
    <span v-show="showAll" @click="toggle">
      <template v-if="collapsed">
        <span>{{ $t('cloudpivot.form.renderer.expand') }}</span>
      </template>
      <template v-else>
        <span>{{ $t('cloudpivot.form.renderer.collapse') }}</span>
      </template>
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Inject } from "vue-property-decorator";

@Component({
  name: "rich-text"
})
export default class MutilText extends Vue {
  showAll = true;

  collapsed = false;

  @Prop({
    default: ""
  })
  text!: string;

  @Prop({
    default: "left"
  })
  align!: string;
  
  @Prop({
    default : ''
  })
  labelStyle !: string

  taskRef: any;

  @Inject()
  layoutTypeFn?: () => void;

  get layoutType() {
    if(this.layoutTypeFn){
      return this.layoutTypeFn()
    }
  }

  scroll() {
    const el = this.$el as HTMLDivElement;
    this.showAll = !(el.scrollHeight > el.offsetHeight + 3)&&(el.scrollHeight>74);
    // console.log('rich-text',el.scrollHeight,el.offsetHeight);
    if (el.offsetHeight === 0) {
      clearTimeout(this.taskRef);
      this.taskRef = setTimeout(() => {
        this.scroll();
      }, 500);
    }
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  mounted() {
    this.$nextTick(() => {
      this.scroll();
    });
  }

  destroyed() {
    clearTimeout(this.taskRef);
  }
}
</script>

<style lang="less" scoped>
.vertical:not('.collapsed'){
  padding-left: 20px !important;
}
.rich-text {
  position: relative;
  line-height: 1.5;

  &.collapsed {
    max-height: 4.5em;
    overflow: hidden;
  }

  & > span {
    right: 0;
    bottom: 0;
    cursor: pointer;
    position: absolute;
    background-color: #fff;

    & > span {
      color: @primary-color;
    }
  }
}
/deep/ em {
  font-style: italic;
}
/deep/ s {
  font-style: inherit;
  text-decoration: line-through;
}
</style>

