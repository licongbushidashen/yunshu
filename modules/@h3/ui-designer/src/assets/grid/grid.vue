
<template>
  <a-row :class="{
    [name] : true
  }">

    <a-col 
      v-for="(col, index) in children" 
      :key="col.id" 
      :span="spans[index]" 
      :style="style"
    >

      <designer-element 
        :id="col.id" 
        :parentId="id" 
        :transmitStyle="style" 
        :translateTo="id"
      ></designer-element>

    </a-col>

  </a-row>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
  Inject,
  Provide,
  Watch
} from "vue-property-decorator";

import * as schema from "./schema";

import {
  register,
  DesignerNodeVue,
  uniqueId,
  Direction
} from "@h3/designer-core";

import { factory } from "@h3/designer-core/property-panel";

import { Row, Col } from "@h3/antd-vue";

const name = "designer-grid";

@Component({
  components: {
    ARow: Row,
    ACol: Col
  }
})
export default class DesignerGrid extends DesignerNodeVue {
  get name() {
    return name;
  }

  @Prop()
  minHeightSwitch!: boolean;

  @Prop()
  minHeight!: string;

  @Prop()
  spanType!: string;

  get style() {
    const style: any = {};

    if (this.minHeightSwitch) {
      style["min-height"] = this.minHeight;
    }

    return style;
  }

  get spans() {
    return this.spanType.split(":");
  }

  newCol() {
    const data = factory.build(schema.gridCol);
    const id = uniqueId();
    this.store.insert({
      id,
      parentId: this.id,
      type: "gridCol",
      data,
      index: -1
    });
  }

  @Watch("spanType", {
    immediate: true
  })
  onSpanTypeChange(value: string, oldValue: string) {
    const diff = this.spans.length - this.children.length;
    if (diff > 0) {
      Array(diff)
        .fill(0)
        .forEach(() => this.newCol());
    } else if (diff < 0) {

      const parentId = this.children[this.children.length + diff - 1].id;

      this.children.slice(diff)
        .forEach(child => {

        this.store.getChildren(child.id)
          .forEach(child2 => {
            this.store.move({
              id: child2.id,
              parentId,
              index: -1 
            });
          })

        this.store.remove({
          id: child.id
        });
      });
    }
  }
}
</script>

<style lang="less" scoped>
.designer-layout {
  display: flex;
  flex-direction: row;
  height: 100%;

  &--content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  &--center {
    flex-grow: 1;
  }
}
</style>