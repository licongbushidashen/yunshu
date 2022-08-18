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

      <template v-for="opt in options">
        <a-select-option v-if="(typeof opt !== 'object')" :key="opt">
          <span :title="opt" class="select-drop-item">{{ opt }}</span>
        </a-select-option>
        <a-select-option v-else-if="(typeof opt === 'object')" :key="opt.name">
          <span :title="opt" class="select-drop-item">{{ opt.name }}</span>
        </a-select-option>
      </template>
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
// import appsApi from "../../../apis/apps";
import axios from "axios";

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
    const value:any[] = [];
    this.value.forEach((i:any) => {
      if(this.options.includes[i]){
        value.push(i);
      } else {
        value.push(...(i.split(";")));
      }
    })
    return value;
    // return this.value;
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
    const vm: any = this;
    const params = {
      schemaCode: this.field.parentSchemaCode || this.field.schemaCode
    };
    axios.get("/api/app/bizproperty/list", {params}).then(res => {
      const data = res.data;
      if(Array.isArray(data)){
        let item = data.filter((i:any) => {
          return i.code === (vm.field.mainField || vm.field.field)
        })
        if(vm.field.mainField){
          const subData = item[0].subSchema && item[0].subSchema.properties;
          item = subData.filter((i:any) => {
            return i.code === vm.field.field;
          })
        }
        const options = JSON.parse(item[0].options);
        if(!/^(\{).*(\})$/.test(options.options)){
          vm.options = options.options.split(";");
        } else {
          vm.options = JSON.parse(options.options).useDictionariesData.map((i:any) => {
            return i.name
          })
          console.log(vm.options)
        }
        console.log('options',vm.options);
      } else {
        return
      }
    });
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

