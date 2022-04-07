<template>
  <div>
    <a-select
      v-model="currentValue"
      showSearch
      @change="onChange"
      style="width: 100%"
      placeholder="请选择"
      :mode="mode"
      optionFilterProp="children"
      :filter-option="filterOption"
    >
      <!-- <a-select-option :disabled="true" v-if="hasEmpty" key ><span style="color: #bfbfbf;">{{
        emptyValue
      }}</span></a-select-option> -->

      <a-select-option v-for="opt in options" :key="opt">
        <span :title="opt" class="select-drop-item">{{ opt }}</span>
      </a-select-option>
      <!-- <a-select-option value="value1">选项1</a-select-option> -->
      <!-- <a-select-option value="value2">选项2</a-select-option> -->
    </a-select>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Model,
  Prop,
  Watch,
  Inject,
} from "vue-property-decorator";
import { Select, Tooltip } from "@h3/antd-vue";
import { DataItemType } from "@cloudpivot/form/schema";

@Component({
  name: "report-dropdown",
  components: {
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class ReportDropdown extends Vue {
  @Prop({
    default() {
      return [];
    },
  })
  value!: any[];

  @Model("change")
  @Prop({
    default: () => ({}),
  })
  field!: any;

  @Prop({
    default: "",
  })
  formula!: string;
  get mode() {
    if (this.isMultiple) {
      return "multiple";
    }
    return "default";
  }

  get isMultiple() {
    console.log(this.field);
    // debugger     
    return ["In", "NotIn"].includes(this.formula) ||  this.field.dataType === DataItemType.DropdownMulti;
  }
  

  get currentValue() {
    return this.value;
  }

  set currentValue(value) {
    // debugger
    console.log(value);
    this.$emit("input", value);
  }

  created() {
    this.init();
  }

  async init() {
    this.options = [];
    console.log('options',this.options);
    
  }

  options: any[] = [];
  onChange(val: any[]) {
    console.log("onChange", val);
  }

  filterOption(input: any, option: any) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }
}
</script>

<style lang="less">
</style>

