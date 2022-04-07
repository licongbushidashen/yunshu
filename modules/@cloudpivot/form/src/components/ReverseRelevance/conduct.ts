/*
 * @Author: Fan
 * @Date: 2020-04-13 17:06:58
 * @LastEditTime: 2020-05-27 20:24:14
 * @LastEditors: Fan
 * @Description:
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/ShortText/setting.ts
 */
import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
// import { DataItemType } from "../../typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
// import RequiredCondition from "@cloudpivot/form/src/common/components/required-condition.vue";
import { FormControlType, DataItemType } from "@cloudpivot/form/schema";

import { listApi, formApi } from "@cloudpivot/api";
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips"],
    },
    controller: {
      label: "控件属性",
      keys: [
        "schemaCode",
        "fieldCode",
        "relativeType",
        "displayMode",
        "listCode",
        "listDisplayMode",
        "conditions",
        // "mobileConditions",
        "requiredFormula"
      ],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    style: {
      ...baseAttribute.style,
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "关联查询",
    },

    schemaCode: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        dataList: (attr: any, attrs: any, vm: any) => {
          const selfSchemaCode = vm.$route.params.bizSchemaCode;
          return formApi.listRelatives(selfSchemaCode).then(
            (res: any) => {
              if (res.errcode === 0) {
                return res.data.map((x: any) => ({
                  value: x.code,
                  label: x.name,
                }));
              }
              return [];
            },
            () => Promise.resolve([])
          );
        },
        // disabled: true
        hideField: (value: string) => {
          return !value
            ? ["listCode", "fieldCode", "appPackageCode", "appFunctionCode", "relativeFieldType"]
            : ["appPackageCode", "appFunctionCode"];
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          vm.updateAttribute(key, "listCode", "");
          vm.updateAttribute(key, "fieldCode", "");
        },
      },
    },
    fieldCode: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        dataList: (attr: any, attrs: any, vm: any) => {
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;

          return formApi
            .getDataItemList({
              schemaCode,
              isPublish: true,
            })
            .then(
              (res) => {
                if (res.errcode === 0) {
                  // if (res.data.length > 0) {
                  //   attr.value = res.data[0].code;
                  // }
                  return res.data
                    .filter((x: any) => {
                      return (
                      (x.propertyType === DataItemType.RelevanceForm || x.propertyType === DataItemType.RelevanceFormEx) &&
                        x.relativeCode === vm.$route.params.bizSchemaCode
                      );
                    })
                    .map((x: any) => ({
                      value: x.code,
                      type: x.propertyType,
                      label: `${x.name}[${x.code}]`,
                    }));
                }
                return [];
              },
              () => Promise.resolve([])
            );
        },
        callback: (key: string, attr: any, attrs: any, vm: any, extra = null) => {
          vm.updateAttribute(key, "relativeType", extra);
        },
      },
    },
    relativeType: {
      label: "关联字段类型",
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "9",
            label: "关联单选",
          },
          {
            value: "11",
            label: "关联多选",
          },
        ],
      },
      value: "",
      dispaly: false,
    },
    displayMode: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "list",
            label: "列表",
          },
          {
            value: "link",
            label: "链接",
          },
        ],
        hideField: (value: string) => {
          return value === "link"
            ? ["listCode", "conditions", "listDisplayMode"]
            : [];
        },
      },
    },
    listCode: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        dataList: (attr: any, attrs: any, vm: any) => {
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          let appCode = vm.$route.params.appCode; // 集成组要求 加入当前应用code
          return listApi.getListConfigList(schemaCode, undefined, appCode).then(
            (res) => {
              if (res.errcode === 0) {
                // if (res.data.length > 0) {
                //   attr.value = res.data[0].code;
                // }
                return res.data
                  .filter((l: any) => l.publish)
                  .map((x: any) => ({
                    value: x.code,
                    label: x.name,
                  }));
              }
              return [];
            },
            () => Promise.resolve([])
          );
        },
        // hideField: (value: string) => {
        //   return !value ? ['conditions', 'mappings'] : [];
        // },
        // callback: (key: string, attr: any, attrs: any, vm: any) => {

        // }
        hideField: (value: string) => {
          return !value ? ["conditions", "mobileConditions"] : [];
        },
      },
    },
    listDisplayMode: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "tabs",
            label: "页签形式",
          },
          {
            value: "table",
            label: "详情列表",
          },
        ],
      },
    },
    conditions: {
      modalType: "onlyQuery",
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/query-condition.vue"),
      options: {
        importModal: (attr: any, attrs: any) => {
          const queryCodeAttr = attrs.find((a: any) => a.field === "listCode");
          const queryCode = queryCodeAttr ? queryCodeAttr.value : '';
          const schemaCodeAttr = attrs.find((a: any) => a.field === "schemaCode");
          const schemaCode = schemaCodeAttr ? schemaCodeAttr.value:'';
          // const mapping = attrs.find((a: any) => a.field === 'mappings').value;

          return {
            schemaCode,
            queryCode,
            dataItem: queryCodeAttr.options.dataList,
            type: "onlyQuery",
            value: {
              query: attr.value,
              // mapping: mapping
            },
          };
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: any
        ) => {
          return data.value.query;
        },
        formatter: formatterValueToSetStatus,
      },
    },
    mobileConditions: {
      modalType: "onlyQuery",
      clientType: "APP",
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/query-condition.vue"),
      options: {
        importModal: (attr: any, attrs: any) => {
          const queryCodeAttr = attrs.find((a: any) => a.field === "listCode");
          const queryCode = queryCodeAttr.value;
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          // const mapping = attrs.find((a: any) => a.field === 'mappings').value;

          return {
            schemaCode,
            queryCode,
            dataItem: queryCodeAttr.options.dataList,
            type: "onlyQuery",
            clientType: "APP",
            value: {
              query: attr.value,
              // mapping: mapping
            },
          };
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: any
        ) => {
          return data.value.query;
        },
        formatter: formatterValueToSetStatus,
      },
    },
    // isAuthorize: {

    // }
  },
} as ControllerConduct;
