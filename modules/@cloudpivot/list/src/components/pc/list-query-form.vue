
<template>
  <div
    class="query-form"
    :class="{ collapsed: collapsed, showmore: showMore, showall: showAll }"
    v-if="(fields && fields.length) || IsShowAdd"
  >
    <div class="query-form-left">
      <pc-form-renderer ref="formRenderer" :controls="controls" :schemaCode="schemaCode"></pc-form-renderer>
    </div>
    <div class="query-form-right">
      <!-- 关联查询展开的时候事全部，取消展开按钮 -->
      <span v-if="showMore && !showAll" @click="toggle">
        {{
        collapsed
        ? $t("cloudpivot.list.pc.More")
        : $t("cloudpivot.list.pc.TakeUp")
        }}
        <a-icon type="down" :class="{ collapsed: collapsed }" />
      </span>
      <div
        v-if="listConfigData && listConfigData.queryColumns"
        style="display: inline; cursor: pointer"
      >
        <a-tooltip>
          <template slot="title">{{ $t("cloudpivot.list.pc.SetDisplayItems") }}</template>
          <i class="icon aufontAll h-icon-all-setting-o" @click="columnSetting"></i>
        </a-tooltip>
      </div>
      <a-button @click="resetFilters" v-if="fields && fields.length">
        {{
        $t("cloudpivot.list.pc.Reset")
        }}
      </a-button>
      <a-button @click="query" v-if="fields && fields.length">
        {{
        $t("cloudpivot.list.pc.Query")
        }}
      </a-button>
      <a-button type="primary" @click="addData" v-if="IsShowAdd">
        {{
        $t("cloudpivot.list.pc.Add")
        }}
      </a-button>
    </div>
    <formColumnSetting
      v-model="showColumnSetting"
      :columns="listConfigData && listConfigData.queryColumns"
      @confirm="reRenderTable"
      @recovery="recovery"
    />
  </div>
</template>


<script lang='ts'>
import { Component, Vue, Prop, Watch, Provide } from "vue-property-decorator";

import { renderer } from "@cloudpivot/form";
import formPc from "@cloudpivot/form/src/renderer/components/pc";

import { Button, Icon, Tooltip } from "@h3/antd-vue";
import * as ControlFactory from "./helper/control-factory";

import { form } from "@cloudpivot/api";
import onActionClick from "./scripts/onActionClick";
import formColumnSetting from "./formColumnSetting.vue";
import moment from "moment";

@Component({
  name: "query-form",
  components: {
    PcFormRenderer: formPc.FormRenderer,
    AButton: Button,
    AIcon: Icon,
    ATooltip: Tooltip,
    formColumnSetting: formColumnSetting,
  },
})
export default class QueryForm extends Vue {
  @Prop()
  fields!: any[];

  @Prop({ default: false})
  isRelevanceQuery ?: boolean

  @Prop({
    default: 3,
  })
  cols!: number;
  @Prop()
  schemaCode!: string;

  @Prop()
  listConfigData!: any;

  // 判断当前是否是中文版本
  // get isChinese() {
  //   return this.$i18n.locale === 'zh';
  // }

  showMore = false;

  controls = "" as any;

  collapsed = true;
  showColumnSetting: boolean = false;

  @Prop({
    default: false,
  })
  showAll!: boolean;
  addActionData: any;

  staffMap: any = {
    0: "all",
    1: "user",
    2: "org",
  };

  staffSelectorDefaultMap: any = {
    0: "",
    1: "originator",
    2: "originatorDept",
  };

  addressFormatMap: any = {
    "0": "pp-cc-aa",
    "1": "pp-cc",
    "2": "pp",
  };

  toggle() {
    this.collapsed = !this.collapsed;
    this.$emit("toggle", this.collapsed);
  }

  @Watch("fields", {
    immediate: true,
  })
  setFields(fields: any[]) {
    setTimeout(() => {
      this.init();
    }, 1);
  }

  // @Watch('$i18n.locale')
  // onLanguageChange() {
  //   setTimeout(() => {
  //     this.init();
  //   }, 1);
  // }

  get IsShowAdd() {
    return (() => {
      if (this.listConfigData && this.listConfigData.queryActions) {
        const addBtn = this.listConfigData.queryActions.find(
          (val: any) => val.actionCode === "add"
        );
        addBtn ? (this.addActionData = addBtn) : (this.addActionData = null);
        return !!addBtn;
      } else {
        return false;
      }
    })();
  }

  init() {
    if (!this.fields || !this.fields.length) {
      return;
    }
    const controls: any = {};
    this.fields.forEach((field: any) => {
      // const fieldData = JSON.parse(JSON.stringify(field));
      // if (!this.isChinese) {
      //   fieldData.name = fieldData.name_i18n[this.$i18n.locale];
      // }
      controls[field.propertyCode] = this.toFormControl(field);

      controls[field.propertyCode].isRelevanceQuery = !!this.isRelevanceQuery
      if(this.isRelevanceQuery){
        controls[field.propertyCode].op = field.op || 'eq'

        if(field.propertyCode === 'sequenceStatus'){
          const statusType = {
            PROCESSING: '进行中',
	          COMPLETED: '已完成',
          }
          controls[field.propertyCode].options.defaultValue = statusType[controls[field.propertyCode].options.defaultValue] || controls[field.propertyCode].options.defaultValue
        }
        
      }
    });

    const rows = Math.ceil(this.fields.length / this.cols);

    const layout = Array(rows)
      .fill(0)
      .map((_, i) => {
        const start = i * this.cols;
        return Array(this.cols)
          .fill(0)
          .map((__, colIdx) => {
            const field: any = this.fields[start + colIdx];
            return field ? field.propertyCode : "";
          });
      });

    this.showMore = layout.length > 1;

    const arr: any[] = renderer.components.FormRendererHelper.convertDesign(
      controls,
      layout
    );

    const formControls: any[] = [];
    renderer.components.FormRendererHelper.findFormControl(arr, formControls);
    renderer.components.FormRendererHelper.mergeValue(formControls, {}, true);
    console.log("arr==>>", arr);
    this.controls = arr;
    // debugger --777777
    this.callQuery();
  }

  callQuery() {
    setTimeout(() => {
      const formRenderer = this.$refs.formRenderer as any;
      if (formRenderer) {
        formRenderer.edit();
        this.query();
      } else {
        this.callQuery();
      }
    }, 300);
  }

  // 重置查询条件
  resetFilters() {
    this.collapsed = true;
    const formRenderer = this.$refs.formRenderer as any;
    formRenderer.reset();
    const data = formRenderer.getValue();
    // const data:any = [];
    this.$emit("setFilterData", data);
    this.$emit("toggle", true);
  }

  /**
   * 展示项设置弹窗
   */
  columnSetting() {
    this.showColumnSetting = true;
  }

  reRenderTable(columns: any) {
    this.$emit("reRenderTable", columns);
  }

  recovery() {
    this.$emit("recovery");
  }

  // 查询
  query() {
    this.$nextTick(() => {
      const formRenderer = this.$refs.formRenderer as any;
      let data = [];
      let opValue = []
      if (formRenderer) {
        data = formRenderer.getValue();
        opValue = formRenderer.getOpValue()
        let flag: boolean = false;
        //配合后端修改，将data中的四位年份修改为带年月日时间格式
        for (const key in data) {
          let dataItem = this.fields.find((i)=>{return i.propertyCode===key});
          let displayFormat = dataItem ? dataItem.displayFormat:'';
          if(displayFormat && displayFormat === '5'){
            if(Array.isArray(data[key])){
              // @ts-ignore
              (data[key]) = (data[key]).map((item,index)=>{
                if(typeof(item) !=='string'){
                  item = moment(item).format('YYYY-MM-DD');
                }
                if(index === 0){
                  item = item?`${item.substring(0,4)}-01-01`:'';
                } else if(index === 1){
                  item = item?`${item.substring(0,4)}-12-31`:'';
                }else{
                  item = '';
                }
                return item;
              });
            }
          }   
        }

        Object.values(data).some((a: any) => {
          if ((Array.isArray(a) && a[0]) || (!Array.isArray(a) && a)) {
            flag = true;
            return true;
          }
          return false;
        });
        
        Object.keys(data).forEach((key:any) => {
          if(key === 'sequenceStatus'){
            const operatorTypes = {
              已完成: 'COMPLETED',
              进行中: 'PROCESSING'
            }
            data[key] = operatorTypes[data[key]] || data[key]
          }
        })
      }
      this.$emit("setFilterData", data, opValue);
      this.$emit("toggle", true);
      this.collapsed = true;
    });
  }

  toFormControlType(field: any) {
    switch (field.propertyType) {
      case renderer.DataItemType.Date:
        return renderer.FormControlType.DateRange;
      case renderer.DataItemType.Number:
        return renderer.FormControlType.NumberRange;

      case renderer.DataItemType.StaffSingle:
        return renderer.FormControlType.StaffSelector;

      case renderer.DataItemType.StaffMulti:
        return renderer.FormControlType.StaffMultiSelector;

      case renderer.DataItemType.StaffDeptMix:
        return renderer.FormControlType.StaffDeptMixed;

      case renderer.DataItemType.DeptMulti:
        return renderer.FormControlType.DepartmentMultiSelector;
        
      case renderer.DataItemType.DeptSingle:
        return renderer.FormControlType.DepartmentSelector;



      case renderer.DataItemType.RelevanceForm:
        return renderer.FormControlType.RelevanceForm;
      case renderer.DataItemType.RelevanceFormEx:
        return renderer.FormControlType.RelevanceFormEx;
      case renderer.DataItemType.Logic:
        return renderer.FormControlType.Logic;
      case renderer.DataItemType.Address:
        return renderer.FormControlType.Address;
      case renderer.DataItemType.Time:
        return renderer.FormControlType.TimeRange;
    }

    switch (field.displayType) {
      case 0:
      default:
        return renderer.FormControlType.Text;
      case 1:
        return renderer.FormControlType.Radio;
      case 2:
        return renderer.FormControlType.Checkbox;
      case 3:
        return renderer.FormControlType.Dropdown;
    }
  }

  toFormControl(field: any) {
    // 
    const type:any = this.toFormControlType(field);
    const sourceOpts = {
      visible: field.visible,
      name: field.name,
      defaultValue: field.defaultValue,
      options: field.options,
    };
    // console.log('11111111111111111111111',field.name_i18n)

    const options = ControlFactory.buildControlOptions(type, sourceOpts);

    switch (type) {
      case renderer.FormControlType.StaffSelector: // 人员单选 50
        options.deptVisible = this.staffMap[1];
        options.multi = false;
        break;
      case renderer.FormControlType.StaffMultiSelector: // 人员多选 51
        options.deptVisible = this.staffMap[1];
        options.multi = true;
        break;
      case renderer.FormControlType.DepartmentSelector: // 部门单选 60
        options.deptVisible = this.staffMap[2];
        options.multi = false;
        break;
      case renderer.FormControlType.DepartmentMultiSelector: // 部门多选
        options.deptVisible = this.staffMap[2];
        options.multi = true;
        break;
      case renderer.FormControlType.StaffDeptMixed: // 混合
        options.deptVisible = this.staffMap[0];
        options.multi = true;
        break;

      case renderer.FormControlType.RelevanceForm:
      case renderer.FormControlType.RelevanceFormEx:
        options.queryCode = field.associationCode;
        options.schemaCode = field.relativeSchemaCode;
        options.showStyle = JSON.parse(field.options).showStyle;
        options.selectMode =
          field.choiceType === 2
            ? renderer.RelevanceFormSelectMode.Popup
            : renderer.RelevanceFormSelectMode.Dropdown;
        break;
      case renderer.FormControlType.Address:
        options.addressDetail = "false";
        options.showEmpty = `${!field.accurateSearch}`;
        options.locationType = this.addressFormatMap[field.displayFormat];
        break;
      case renderer.FormControlType.Dropdown:
      case renderer.FormControlType.DropdownMulti:
        options.multi = true;
        options.displayEmpty = false;

        if (field.propertyCode === "sequenceStatus") {
          if (this.$i18n.locale === "zh" && field.defaultValue) {
            field.defaultValue = field.defaultValue
              .split(";")
              .map((val: any) => form.sequenceStatusZh[val])
              .join(";");
          }
        }
        break;
      case renderer.FormControlType.DateRange:
        let displayFormat: string = field.displayFormat || "";
        options.displayFormat = displayFormat;
        switch (Number(displayFormat)) {
          case 2:
            options.format1 = "YYYY-MM-DD HH:mm:ss";
            break;
          case 3:
            options.format1 = "YYYY-MM-DD HH:mm";
            break;
          case 4:
            options.format1 = "YYYY-MM";
            break;
          case 5:
            options.format1 = "YYYY";
            break;
          case 6:
            options.format1 = "MM-DD";
            break;
          case 7:
            options.format1 = "hh:mm";
            break;
          case 8:
            options.format1 = "hh:mm:ss";
            break;
          default:
            options.format1 = "YYYY-MM-DD";
            break;
        }
        break;
      default:
        break;
    }

    const dv = field.defaultValue;
    if (dv !== undefined && dv !== null && dv !== "") {
      if (
        type === renderer.FormControlType.StaffSelector &&
        typeof field.defaultValue === "string"
      ) {
        options.defaultValueType = this.staffSelectorDefaultMap[
          field.defaultValue
        ];
      } else {
        options.defaultValue = field.defaultValue;
      }
    } else {
      switch (type) {
        case renderer.FormControlType.StaffSelector:
          options.defaultValueType = this.staffSelectorDefaultMap[
            field.defaultValue
          ];
          break;
        case renderer.FormControlType.DateRange:
        case renderer.FormControlType.NumberRange:
          options.defaultValue = [field.startValue, field.endValue];
          break;
        case renderer.FormControlType.Logic:
          options.defaultValue = field.defaultState;
          break;
        default:
          break;
      }
    }

    // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',typeof field.name_i18n)
    // 
    if (typeof field.name_i18n === "object" && field.name_i18n !== null) {
      field.name_i18n = JSON.stringify(field.name_i18n);
    }

    options.name_i18n = field.name_i18n;

    const control = {
      key: field.propertyCode,
      writable: true,
      type,
      options,
    };
    return control;
  }

  // 新增关联表单数据
  addData() {
    onActionClick.handleAdd(this, this.addActionData, this.schemaCode, true);
    console.log(this);
    
  }
}
</script>

<style lang="less" scoped>
.query-form {
  display: flex;
  // padding: 0 8px 16px 8px;

  box-shadow: 0px 4px 8px 0px rgba(30, 85, 255, 0.1);

  &-left {
    width: 100%; // 兼容IE11
    flex-grow: 1;
    /deep/ .field__control {
      & > div {
        width: 100%;
      }
    }
  }

  &-right {
    flex-shrink: 0;
    // padding: 8px;
    text-align: right;

    & > button {
      margin-left: 8px;
    }

    & > span {
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      user-select: none;
      margin-right: 16px;

      & > i {
        transform: rotate(180deg);
      }
      & > i.collapsed {
        transform: rotate(0);
      }
    }
  }

  &.collapsed {
    height: 40px;
    box-shadow: none;
  }

  &.collapsed.showmore {
    overflow: hidden;
  }

  /deep/.field {
    padding-top: 0px !important;
    padding-left: 0px !important;
  }
  /deep/.field__label {
    min-width: 1em;
    max-width: 6em;

    & > div {
      display: flex;
      align-items: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  /deep/.h3-organization {
    max-height: 34px;
    overflow: auto;
  }
}
// 关联查询展开的时候事全部，取消展开按钮
.showall.query-form {
  display: block;
  height: auto;
  .query-form-right {
    text-align: center;
  }
}


</style>

<style lang="less">
.query-form .numberrange .number{
  display: flex;
  .h3-input-number{
    flex: 1;
  }
}
</style>
