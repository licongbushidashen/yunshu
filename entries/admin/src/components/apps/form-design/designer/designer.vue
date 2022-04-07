
<template>
  <div class="designer">
    <div :class="warpCls">
      <div :class="`${warpCls}-header`"></div>

      <grid
        ref="grid"
        :class="`${warpCls}-content`"
        :controls="controls"
        :layout="layout"
        @change="onGridChange"
        @control-add="emitControlAdd"
        @control-delete="emitControlDelete"
      ></grid>
    </div>
    <div class="designer-drag-tips" v-if="showDragTips">
      <div>
        <img src="~@/assets/images/drag-tips.svg" />
        <p>请从左侧拖入控件</p>
      </div>
    </div>
  </div>
</template>


<script lang='ts'>
import {
  Component,
  Vue,
  Prop,
  Emit,
  Watch,
  Provide
} from "vue-property-decorator";
//import { namespace } from 'vuex-class';

// import ControlContainer from "./control-container.vue";

import Grid from "./grid.vue";

import {
  FormControl,
  DataItem,
  FormControlType,
  FormSheet,
  FormTabs
} from "../typings";

import * as ControlFactory from "../typings/control-factory";

import { Layouter } from "./layouter";

const empty_Key = ".";

@Component({
  name: "designer",
  components: {
    // ControlContainer,
    Grid
  }
})
export default class Designer extends Vue {
  @Prop()
  readonly controls!: { [key: string]: FormControl };

  @Prop()
  readonly initLayout!: string[][];

  @Prop()
  readonly device!: string;

  @Prop() warpCls!: string;

  @Prop() formData: any;

  @Prop() showDragTips!: boolean;

  selected: any = "";

  ctrlCKey = "";

  @Provide()
  isSelected(control: FormControl) {
    const selected = this.selected;
    if (!selected) {
      return false;
    }
    return (
      selected.key === control.key && selected.parentKey === control.parentKey
    );
  }

  @Provide()
  isMobile() {
    return this.device === "mobile";
  }

  @Provide()
  layoutTypeFn() {
    this.$set(this.formData, "layoutTypeFn", true); //请勿删除 ---作用为触发计算属性重新计算
    return localStorage.getItem("layoutType") === "vertical"; //使用本地缓存 防止上下布局发布时渲染数据先左右布局
  }

  @Provide()
  setCtrlCKey(key: string) {
    this.ctrlCKey = key;
  }

  @Provide()
  getCtrlCKey() {
    return this.ctrlCKey;
  }

  layout: string[][] = [];

  getLayout() {
    return this.layout;
  }

  @Watch("initLayout")
  setInitLayout(val: any) {
    this.layout = val;
  }

  onGridChange(layout: string[][]) {
    this.layout = layout;
  }

  emitControlAdd(control: FormControl, copyKey?: string) {
    ControlFactory.setControlPath(control, null);
    this.$emit("control-add", control, copyKey);
  }

  emitControlDelete(controlKey: string) {
    this.$emit("control-delete", controlKey);
  }

  @Provide()
  emitControlUpdate(key: string, properties: { [key: string]: any }, ...otherParams) {
    // tabs中的子表内的控件 需要传 path
    this.$emit("control-update", key, properties,...otherParams);
  }

  @Provide()
  emitControlSelect(control?: FormControl) {
    this.selected = control;
    this.$emit("control-select", control);
    if (control && this.$el) {
      let parentkey = control.parentKey ? control.parentKey : "";
      if (!parentkey || !/^Sheet/.test(parentkey)) {
        this.$nextTick(() => {
          const item = this.$el.querySelector(
            `[id="${control.key}"]`
          ) as HTMLDivElement;
          if (item) {
            item.focus();
          }
        });
      }
    }
  }

  @Provide()
  emitDataItemAdd(item: DataItem) {
    this.$emit("dataitem-add", item);
  }

  @Provide()
  emitDataItemDelete(code: string, parentCode?: string) {
    this.$emit("dataitem-delete", code, parentCode);
  }

  @Provide()
  clearParentShowEmptyTask() {
    const grid = this.$refs.grid as any;
    if (grid && grid.clearShowEmptyTask) {
      grid.clearShowEmptyTask();
    }
  }
}
</script>


<style lang="less" scoped>
.designer {
  position: relative;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  .designer-drag-tips {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 290px;
    width: 100%;
    & > div {
      width: 160px;
      p {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
        margin-top: 14px;
        font-weight: 400;
      }
    }
  }

  & > .web-view {
    flex-grow: 1;
    display: flex;

    & > .web-view-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0 10px;
    }
  }

  /deep/.h-icon-all-down-o {
    font-size: 12px;
  }
}

/deep/.ant-radio-wrapper {
  white-space: pre-wrap;
}
</style>
