<template>
  <div>
    <a-select
      showSearch
      v-if="!readonly"
      :value="val"
      :mode="mode"
      @change="onChange"
      style="width: 100%"
      :allowClear="true"
      :disabled="readonlyFormula"
      :getPopupContainer="getPopupContainer()"
      :placeholder="hasEmpty ? emptyValue : ''"
      @focus="getOPt"
      :class="hasSelectBatchImport && 'batch-import-select-not-value'"
    >
      <a-select-option :disabled="true" v-if="hasEmpty" key>{{
        emptyValue
      }}</a-select-option>

      <a-select-option
        v-for="(opt, index) in options"
        :key="opt"
        :disabled="disableds[index]"
      >
        <span :title="opt" class="select-drop-item">{{ opt }}</span>
        <!-- <a-tooltip :title="opt">
        <div class="h3-from-select-opinion">{{ opt }}</div>
      </a-tooltip> -->
      </a-select-option>
    </a-select>
    <!-- </div> -->

    <div class="items" v-else>
      <span v-if="!multiple">{{ text }}</span>

      <template v-else>
        <!-- <span v-for="(x, index) in val" :key="index">{{ x }}</span> -->
        {{ text }}
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  DropdownOptions,
  FormControlType,
} from "@cloudpivot/form/schema";

import { DropdownControl } from "../control/dropdown-control";

import { H3Dropdown } from "@h3/awesome-ui";

// import { Select, Tooltip } from "@h3/antd-vue";

import { Select, Tooltip } from "@h3/antd-vue";

@Component({
  name: "dropdownMulti",
  components: {
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class dropdownMulti extends DropdownControl {
  // testVal:any
  onChange(val: any[]) {
    this.hasSelectBatchImport = false;
    if (val && val.length > 0) {
      this.setValue(Array.isArray(val) ? val.slice() : val);
    } else {
      this.ctrl.value = null;
    }
    this.val = val;

    if (!this.multiple) {
      return;
    }
    super.resetDisableds();
  }

  getOPt() {
    super.getOptions();
  }
  clearOption(change: any) {
    this.options = [];
    this.ctrl.value = null;
  }

  destroyed() {
    super.destroyed()
  }
}
</script>

<style lang="less">
.h3-from-select-opinion {
  display: inline-block;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
}
.ant-tooltip {
  max-width: 800px;
}
.items {
  word-break: break-all;
}
.batch-import-select-not-value .ant-select-selection {
  border-color: #f5222d;
  border-right-width: 1px !important;
  outline: 0;
  // box-shadow: 0 0 20px rgba(245, 34, 45, 0.2);
}
// .items > span::after {
//   // margin-right: 0.5em;
//   content: ";";
// }
.has-form-border{
  .dropdown{
    div {
      height: 100%;
      .items{
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 10px;
      }
    }
    .ant-select-selection--single .select-drop-item{
      line-height: 50px;
    }
  }
}

</style>

