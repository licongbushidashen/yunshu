
<template>
  <div>
    <div class="query-form">
      <div class="query-form-left">
        <pc-form-renderer
          ref="formRenderer"
          :controls="controls"
          :relevanceDataList="relevanceDataList"
          sourceType="portal"
        ></pc-form-renderer>
      </div>
      <div class="query-form-right">
        <!-- <span v-if="showMore" @click="toggle">
        {{ collapsed ? $t('cloudpivot.list.pc.More') : $t('cloudpivot.list.pc.TakeUp') }}
        <a-icon type="down" :class="{ collapsed : collapsed }"/>
        </span>-->
        <a-button
          @click="resetFilters"
          v-if="fields && fields.length"
        >{{ $t('cloudpivot.list.pc.Reset') }}</a-button>
        <a-button type="primary" @click="query">{{ $t('cloudpivot.list.pc.Query') }}</a-button>
        <!-- <a-checkbox style="margin-left: 20px" v-model="daily" @change="onChange">设为常用</a-checkbox> -->
      </div>
    </div>
    <div class="filter-mask" @click="closeQueryItem"></div>
  </div>
</template>


<script lang='ts'>
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { renderer } from "@cloudpivot/form";
import formPc from "@cloudpivot/form/src/renderer/components/pc";

import { Button, Icon } from "@h3/antd-vue";
import * as ControlFactory from "../helper/control-factory";
import zhToEn from "@cloudpivot/list/src/components/pc/locales/zhToEn"
import { listApi } from "@cloudpivot/api";
import * as Bus from '@cloudpivot/form/schema';

@Component({
  name: "query-form",
  components: {
    PcFormRenderer: formPc.FormRenderer,
    AButton: Button,
    AIcon: Icon,
  },
})
export default class QueryForm extends Vue {
  @Prop()
  fields!: any[];

  @Prop()
  dataItemList!: any[];

  @Prop({
    default: 3,
  })
  cols!: number;

  @Prop()
  relevanceDataList!: [];

  // 判断当前是否是中文版本
  // get isChinese() {
  //   return this.$i18n.locale === 'zh';
  // }

  showMore = false;

  controls = "" as any;

  collapsed = true;

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

  daily = false

  toggle() {
    this.collapsed = !this.collapsed;
  }

  @Watch("fields", {
    immediate: true,
  })
  setFields(fields: any[]) {
    setTimeout(() => {
      if(localStorage.getItem('form-temp')) {
        let tempArr = JSON.parse(localStorage.getItem('form-temp') || '[]')
        tempArr.forEach(item => {
          if(item.id === this.$store.state.System.System.loginedUserInfo && this.$store.state.System.System.loginedUserInfo.id || undefined) {
            this.controls = item.data
          }
        });
      } else if(localStorage.getItem('form-daily')) {
        let dailyArr = JSON.parse(localStorage.getItem('form-daily') || '[]')
        dailyArr.forEach(item => {
          if(item.id === this.$store.state.System.System.loginedUserInfo && this.$store.state.System.System.loginedUserInfo.id || undefined) {
            this.controls = item.data
          }
        });
      }
      this.init();
    }, 1000);
  }

  // @Watch('$i18n.locale')
  // onLanguageChange() {
  //   setTimeout(() => {
  //     this.init();
  //   }, 1);
  // }

  async init() {
    this.$emit("getRelevanceDataList");
    if (!this.fields || !this.fields.length) {
      return;
    }

    let {schemaCode} = this.$route.params
    if(!schemaCode){
      schemaCode = this.$route.params.bizSchemaCode
    }
    if (!schemaCode) {
      schemaCode = this.$route.query.schemaCode as string;
    }
    let res:any = {}
    if (schemaCode) {
      res = await listApi.getDataItemList({
        schemaCode
      });
    }
    const controls: any = {};
    this.fields.forEach((field: any) => {
      // const fieldData = JSON.parse(JSON.stringify(field));
      // if (!this.isChinese) {
      //   fieldData.name = fieldData.name_i18n[this.$i18n.locale];
      // }
      const control = this.toFormControl(field);
      let source = this.dataItemList.find((d) => d.code === field.propertyCode);
      if (source) {
        control.options.displayField = source.relativePropertyCode;
      }


      // 关联表单设置可见字段
      if(control.type == 80){
        control.options.relativePropertyCode = res.data.filter((el:any) => control.key === el.code)[0]['relativePropertyCode']
      }

      controls[field.propertyCode] = control;
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

    this.controls = arr;
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
    }, 50);
  }

  onChange(e) {
    if(e.target.checked) {
      this.daily = true
    }
  }

  // 重置查询条件
  resetFilters() {
    this.collapsed = true;
    const formRenderer = this.$refs.formRenderer as any;
    formRenderer.reset();
    const data = formRenderer.getValue();
    // const data:any = [];
    this.$emit("setFilterData", data);
  }

  // 清空值
  clearFilters() {
    const formRenderer = this.$refs.formRenderer as any;
    formRenderer.clear();
    const data = formRenderer.getValue();
    this.$emit("setFilterData", data);
  }

  // 查询
  query() {
    this.$nextTick(() => {
      console.log(this.controls)
      const formRenderer = this.$refs.formRenderer as any;
      let data = [];
      if (formRenderer) {
        data = formRenderer.getValue();
        let flag: boolean = false;
        for (const key in data) {
          let dataItem = this.fields.find((i)=>{return i.propertyCode===key});
          let displayFormat = dataItem ? dataItem.displayFormat:'';
          if(displayFormat && displayFormat === '5'){
            if(Array.isArray(data[key])){
              // @ts-ignore
              (data[key]) = (data[key]).map((item,index)=>{
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
      }
      console.log(data);
      const newData = {data, id: this.$store.state.System.System.loginedUserInfo && this.$store.state.System.System.loginedUserInfo.id || undefined}
      if(this.daily) {
        let dailyArr = localStorage.getItem('form-daily') ? JSON.parse(localStorage.getItem('form-daily') || '[]') : []
        const index = dailyArr.findIndex(item => item.id === this.$store.state.System.System.loginedUserInfo.id)
        index >= 0 ? dailyArr[index] = newData : dailyArr.push(newData)
        localStorage.setItem('form-daily', JSON.stringify(dailyArr))
      }else {
        let tempArr = localStorage.getItem('form-temp') ? JSON.parse(localStorage.getItem('form-temp') || '[]') : []
        const index = tempArr.findIndex(item => item.id === this.$store.state.System.System.loginedUserInfo && this.$store.state.System.System.loginedUserInfo.id || undefined)
        index >= 0 ? tempArr[index] = newData : tempArr.push(newData)
        localStorage.setItem('form-temp', JSON.stringify(tempArr))
      }
      this.$emit("setFilterData", data);
      this.collapsed = true;
    });
  }

  toFormControlType(field: any) {
    console.log('字段：', field)
    switch (field.propertyType) {
      case renderer.DataItemType.Date:
        return renderer.FormControlType.DateRange;
      case renderer.DataItemType.Number:
        return renderer.FormControlType.NumberRange;
      case renderer.DataItemType.StaffSingle:
        return renderer.FormControlType.StaffSelector;
      case renderer.DataItemType.StaffMulti:
        return renderer.FormControlType.StaffMultiSelector;
      case renderer.DataItemType.DeptSingle:
        return renderer.FormControlType.DepartmentSelector;
      case renderer.DataItemType.DeptMulti:
        return renderer.FormControlType.DepartmentMultiSelector;
      case renderer.DataItemType.StaffDeptMix:
        return renderer.FormControlType.StaffDeptMixed;
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
        return renderer.FormControlType.DropdownMulti;
    }
  }

  toFormControl(field: any) {
    const type:any = this.toFormControlType(field);
    const sourceOpts = {
      visible: field.visible,
      name: field.name,
      defaultValue: field.defaultValue,
      options: field.options,
    };

    const options = ControlFactory.buildControlOptions(type, sourceOpts);
    if(type === 1 && field.options && field.options.includes('dictionaryData')){
      options.dictionaryData = field.options
    }
    switch (type) {
      case renderer.FormControlType.StaffSelector:
          options.deptVisible = 'user';
          options.multi = false;
        break;
        case renderer.FormControlType.StaffMultiSelector:
          options.deptVisible = 'user';
          options.multi = true;
        break;
        case renderer.FormControlType.DepartmentSelector:
          options.deptVisible = 'org';
          options.multi = false;
        break;
        case renderer.FormControlType.DepartmentMultiSelector:
          options.deptVisible = 'org';
          options.multi = true;
        break;
        case renderer.FormControlType.StaffDeptMixed:
          options.deptVisible ='all';
          options.multi = true;
        break;
      case renderer.FormControlType.RelevanceForm:
      case renderer.FormControlType.RelevanceFormEx:
        options.queryCode = field.associationCode || field.relativeQueryCode;
        options.schemaCode = field.relativeSchemaCode;
        options.showStyle = JSON.parse(field.options).showStyle;
        options.selectMode =
          field.choiceType === 2
            ? renderer.RelevanceFormSelectMode.Popup
            : renderer.RelevanceFormSelectMode.Dropdown;

        options.treeView = field.choiceType === 3 ? true: false;  //判断树形视图是不是为树形外部显示样式。是的话不在表单控件展示，放在门户左边展示。
        break;
      case renderer.FormControlType.Address:
        options.addressDetail = "false";
        options.showEmpty = `${!field.accurateSearch}`;
        options.locationType = this.addressFormatMap[field.displayFormat];
        break;
      case renderer.FormControlType.Dropdown:
        options.displayEmpty = false;
        break;
      case renderer.FormControlType.DropdownMulti:
        // 单行文本下拉框模式 支持多选 @Fan
        // if (field.propertyCode === "sequenceStatus") {
        options.multi = true;
        options.displayEmpty = false;
        // }
        break;
      case renderer.FormControlType.DateRange:
      case renderer.FormControlType.TimeRange:
        let displayFormat: string = field.displayFormat || "";
        options.displayFormat = displayFormat;
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
        case renderer.FormControlType.TimeRange:
          options.defaultValue = [field.startValue, field.endValue];
          break;
        case renderer.FormControlType.Logic:
          options.defaultValue = field.defaultState;
          break;
        default:
          break;
      }
    }

    if (typeof field.name_i18n === "object" && field.name_i18n !== null) {
      field.name_i18n.en = zhToEn[field.name_i18n.en] || field.name_i18n.en;
      field.name_i18n = JSON.stringify(field.name_i18n);
    } else if (typeof field.name_i18n === "string") {
      field.name_i18n = JSON.parse(field.name_i18n);
      field.name_i18n.en = zhToEn[field.name_i18n.en] || field.name_i18n.en;
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

  findControl(key: string) {
    const formRenderer = this.$refs.formRenderer as any;
    if (formRenderer) {
      const ctrl = formRenderer.controller.findChild(key);
      return ctrl;
    }
  }

  backWriteData(value: any) {
    const formRenderer = this.$refs.formRenderer as any;
    if (formRenderer) {
      formRenderer.controller.value = value;
    }
  }

  closeQueryItem() {
    this.$emit("hide");
  } 
}
</script>

<style lang="less" scoped>
/deep/ .query-form .field .field__control {
  overflow: inherit !important;
}
.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 1;
}
.query-form {
  // display: flex;
  padding: 10px 8px;
  box-shadow: 0px 4px 8px 0px rgba(30, 85, 255, 0.1);
  border-radius: 4px;
  background: #fff;
  max-height: 510px;
  overflow-y: auto;
  position: relative;
  z-index: 9;
  &-left {
    flex-grow: 1;
    /deep/ .field__control {
      & > div {
        width: 100%;
      }
    }
  }

  &-right {
    flex-shrink: 0;
    padding: 8px;
    text-align: center;

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
    height: 48px;
    box-shadow: none;
  }

  &.collapsed.showmore {
    overflow: hidden;
  }
  /deep/.field__label {
    min-width: 1em;
    max-width: 6em;

    & > div {
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
</style>
