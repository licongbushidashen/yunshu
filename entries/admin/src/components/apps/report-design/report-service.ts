import { Component } from "vue";
import ReportOptions from "@h3/report/dist/options";
import { FieldColumn } from "@h3/report";
import { DataItemType } from "@cloudpivot/form/schema";
import ReportSelectSimple from "./report-select-simple.vue";
import ReportCustomSelector from "./report-custom-selector.vue"
import ReportAddress from "./report-address.vue";
import ReportDropdown from "./report-dropdown.vue";
// import PcSelect from "./pc-select.vue";


import env from "@/env";

let inited = false;

export function init() {
  if (inited) {
    return;
  }

  inited = true;

  ReportOptions.baseUrl = env.portalHost;
  ReportOptions.charts = { list: { dimension: 50 } };

  ReportOptions.download.list = true;
  ReportOptions.download.pivotTable = true;

  ReportOptions.requestHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    return {
      // 二次开发
      Authorization: "Bearer " + token
    };
  };

  /**
   * 字段类型分类
   */
  ReportOptions.classification = (field: FieldColumn) => {
    return [field.dataType];
    // let arr: Array<number> = [];
    // // 通过field.dataType判断业务对象值类型 返回同类型值对象的dataType值
    // switch (field.dataType) {
    //     case 7:
    //         arr = [1, 2, 7];
    //         break;
    // }
    // return arr;
  };

  ReportOptions.integrateComponents = (
    field: FieldColumn,
    formula: string,
    format: string,
  ): Component | null => {
    console.log(field.dataType);
    console.log(format);
    // debugger
    let components: any = null;
    switch (field.dataType) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        components = ReportCustomSelector;
        break;
      case DataItemType.Address:
        components = ReportAddress;
        break;
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        if(format === '2'){
          components = ReportDropdown;
        }
        break;
    }
    switch (field.field) {
      case 'sequenceStatus':
        components = ReportSelectSimple;
        break;
    }
    return components;
  };
}

init();
