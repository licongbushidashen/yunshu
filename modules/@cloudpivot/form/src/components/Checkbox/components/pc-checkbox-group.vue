
<template>
  <div
    :class="{
      verticalLayout: layoutType && !ctrl.readonly,
      edit: !ctrl.readonly,
    }"
  >
    <div :class="hasBatchImport && 'batch-import-not-value'">
      <template v-if="!ctrl.readonly">
        <a-radio-group
          v-if="isRadio"
          :value="val"
          :options="options"
          :class="{ vertical: isVertical }"
          @change="onRadioChange"
        />
        <a-checkbox-group
          v-else
          :value="val"
          :options="checkboxOptions"
          :class="{ vertical: isVertical }"
          @change="onChange"
        >
        </a-checkbox-group>
      </template>
      <div class="items" v-else>
        <!-- <span v-if="isRadio">{{ text }}</span> -->
        <!-- <template v-else>{{ text }}</template> -->
        <!-- <a-radio-group v-if="isRadio" v-model="text" :options="options" disabled  /> -->
        <!-- <a-checkbox-group v-else :options="checkboxOptions" disabled :value="val"/> -->
        <template v-if="isRadio">
          <span v-if="!isShowAllOption">{{ text }}</span>
          <a-radio-group v-else v-model="text" :options="options" disabled  />
        </template>
        <template v-else>
          <span v-if="!isShowAllOption">{{ text }}</span>
          <a-checkbox-group v-else :options="checkboxOptions" disabled :value="val"/>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  CheckboxOptions,
  FormControlType,
} from "@cloudpivot/form/schema";

import { CheckboxGroupControl } from "@cloudpivot/form/src/common/controls/checkbox-group-control";

import { Radio, Checkbox } from "@h3/antd-vue";

@Component({
  name: "checkbox-group",
  components: {
    ARadioGroup: Radio.Group,
    ACheckboxGroup: Checkbox.Group,
  },
})
export default class CheckboxGroup extends CheckboxGroupControl {
  @Inject()
  layoutTypeFn?: () => void;

  get layoutType() {
    if (this.layoutTypeFn) {
      return this.layoutTypeFn();
    }
  }


  onChange(value: string[]) {
    this.hasBatchImport = false;
    const val = value && value.length > 0 ? value.filter((x) => !!x) : null;
    this.setValue(val);
    super.resetCheckboxOptionDisabled();
  }

  onRadioChange(evt: MouseEvent) {
    this.hasBatchImport = false;
    const val = (evt.target as HTMLInputElement).value;
    this.setValue(val);
  }
}
</script>

<style lang="less" scoped>
/deep/.ant-radio-group,
/deep/.ant-checkbox-group {
  &.vertical > label {
    display: block;
  }
}
/deep/.ant-radio-group,
/deep/.ant-checkbox-group {
  width: 100%;
}

/deep/.ant-radio-wrapper {
  // overflow: hidden;
  line-height: 32px;
  position: relative;
  top: -4px;
  word-break: break-all;
  span {
    display: inline-flex;
    position: relative;
    white-space: normal;
    top: -1px;
  }
  >.ant-radio-disabled .ant-radio-inner::after {
    background-color: black;
  }
  >.ant-radio-disabled + span {
    color: black;
  }
}

/deep/.ant-checkbox-wrapper {
  line-height: 32px;
  position: relative;
  top: -4px;
  // overflow: hidden;
  word-break: break-all;
  >.ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner::after {
    border-color: black;
  }
  >.ant-checkbox-disabled + span {
    color: black;
  }
}

// .items > span::after{
//   // margin-right: 0.5em;
//   content: ';'
// }

.verticalLayout {
  margin-left: 12px;
}
.batch-import-not-value {
  /deep/ .ant-checkbox {
    border-color: #f5222d;
    border-right-width: 1px !important;
    outline: 0;
    // box-shadow: 0 0 20px rgba(245, 34, 45, 0.2);
    
    .ant-checkbox-inner {
      border-color: #f5222d;
    }
  }
  /deep/ .ant-checkbox-checked {
    background-color: #2970ff !important;
    border-color: #2970ff !important;
    box-shadow: 0 0 0;
    .ant-checkbox-inner {
      border-color: #2970ff !important;
    }
  }
}
</style>

