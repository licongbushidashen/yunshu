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
      :placeholder="emptyValue"
      @focus="getOPt"
      :class="hasSelectBatchImport && 'batch-import-select-not-value'"
    >
      <a-select-option :disabled="true" v-if="hasEmpty" key ><span style="color: #bfbfbf;">{{
        emptyValue
      }}</span></a-select-option>

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
  name: "dropdown",
  components: {
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class Dropdown extends DropdownControl {

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
    console.log(this.control)
    // debugger
    // 如果是单选，复选的业务模型 , 3种数据格式，注意，大坑！！！！！！！！！
    if(this.control.type == 7) {
      //console.log(JSON.parse(this.control.options.options))
      if(this.control.options) {
        const data = this.control.options.options
        if(data.indexOf('schemaCode') != -1) {
          console.log(JSON.parse(data))
          if(JSON.parse(data).labels && JSON.parse(data).labels.length > 0) {
            const sheetDataItem = JSON.parse(data).sheetDataItem
            const labels = JSON.parse(data).labels
            const options = labels.map(item => {
              return item.data[sheetDataItem]
            })
            this.control.options.options = options.join(';')
          } else {
            super.getOptions();
          }
        } else {

           try {
             if(JSON.parse(JSON.parse(data).options).labels && JSON.parse(JSON.parse(data).options).labels.length > 0) {
                const sheetDataItem = JSON.parse(JSON.parse(data).options).sheetDataItem
                const labels = JSON.parse(JSON.parse(data).options).labels
                const options = labels.map(item => {
                  return item.data[sheetDataItem]
                })
                this.control.options.options = options.join(';')
              }else {
                super.getOptions();
              }
           } catch (error) {
             this.options = data.split(";");
           }
        }
      }
    } else {
      super.getOptions();
    }
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
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      padding-right: 27px;
      color: rgba(0,0,0,.65) ;
    }
  }
}

</style>

