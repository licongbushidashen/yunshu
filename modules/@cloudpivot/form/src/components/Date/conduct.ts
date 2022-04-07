/*
 * @Author: Fan
 * @Date: 2020-04-19 19:31:21
 * @description:
 * @LastEditors: Fan
 */
import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { utils } from "@cloudpivot/common";
const DateHandle = utils.DateHandle;
import { form } from "../../../../api";

export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips", "widgetType"],
    },
    controller: {
      label: "控制属性",
      keys: [
        "defaultValue",
        "readonlyFormula",
        "format1",
        "requiredFormula",
        "dataLinkage",
        "syncFormate"
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
    widgetType: {
      ...baseAttribute.widgetType,
      value: "日期",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "日期",
    },
    defaultValue: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "none",
            label: "空",
          },
          {
            value: "current",
            label: "当前时间",
          },
          // {
          //   value: "dataItemDefault",
          //   label: "数据项默认值",
          // },
        ],
      },
    },
    displayFormula: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "showRule",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    requiredFormula: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterRequiredFormula,
      },
    },
    dataLinkage: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/data-linkage2.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "YYYY",
            label: DateHandle.dateFormat(new Date(), "YYYY"),
            title: DateHandle.dateFormat(new Date(), "YYYY"),
          },
          {
            value: "YYYY-MM",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM"),
            title: DateHandle.dateFormat(new Date(), "YYYY-MM"),
          },
          // {
          //   value: "MM-DD",
          //   label: DateHandle.dateFormat(new Date(), "MM-DD"),
          //   title: DateHandle.dateFormat(new Date(), "MM-DD"),
          // },
          {
            value: "YYYY-MM-DD",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD"),
            title: DateHandle.dateFormat(new Date(), "YYYY-MM-DD"),
          },
          {
            value: "YYYY-MM-DD HH:mm",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm"),
            title: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm"),
          },
          {
            value: "YYYY-MM-DD HH:mm:ss",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm:ss"),
            title: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm:ss"),
          },
          {
            value: "YYYY-MM-DD CN-APM",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM"),
            title: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM"),
          },
          {
            value: "YYYY-MM-DD CN-APM HH:mm",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM HH:mm"),
            title: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM HH:mm"),
          },
          {
            value: "YYYY-MM-DD EN-APM",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM"),
            title: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM"),
          },
          {
            value: "YYYY-MM-DD EN-APM HH:mm",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM HH:mm"),
            title: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM HH:mm"),
          },
          // {
          //   value: "HH:mm",
          //   label: DateHandle.dateFormat(new Date(), "HH:mm"),
          //   title: DateHandle.dateFormat(new Date(), "HH:mm"),
          // },
          // {
          //   value: "HH:mm:ss",
          //   label: DateHandle.dateFormat(new Date(), "HH:mm:ss"),
          //   title: DateHandle.dateFormat(new Date(), "HH:mm:ss"),
          // },
        ],
      },
    },
    format1: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/formate-default-modal.vue"),      
      options: {
        // getValue(value: any, attrs:any, assitAttrs: any){
        //   let formatVal: any = "";
        //   if (Array.isArray(assitAttrs)) {
        //     let formatItem: any = assitAttrs.find(x => x.field === 'format');
        //     if (formatItem) {
        //       formatVal = formatItem.value;
        //     }
        //   }
        //   return value || formatVal;
        // },
        formatter: (attr: any, attrs: any, assitAttrs: any, control: any, flag: any) => {
          console.log('attr', attr)
          console.log('attrs', attrs)
          console.log('attrs', assitAttrs)
          console.log('cont', control)
          // 是否开启同步,默认开启
          const syncFormate = control.options && control.options.syncFormate

          //开启同步则从default取值
          if(syncFormate && flag) {
            if (Array.isArray(assitAttrs)) {
              // debugger
              let formatItem: any = assitAttrs.find(x => x.field === 'format');
              if(formatItem.value.includes('APM')) {
                return DateHandle.dateFormatApm(new Date(), formatItem.value)
              } else {
                return DateHandle.dateFormat(new Date(), formatItem.value)
              }
            }
            if(attr) {
              if(attr.includes('APM')) {
                return DateHandle.dateFormatApm(new Date(), attr)
              } else {
                return DateHandle.dateFormat(new Date(), attr)
              }
            }
          } else {
            // debugger
            if(attr && attr !== '') {
              if(attr.includes('APM')) {
                return DateHandle.dateFormatApm(new Date(), attr)
              } else {
                return DateHandle.dateFormat(new Date(), attr)
              }
            } else {
              return ''
            }
          }
        },
        // tip: {
        //   content: '23',
        //   icon: "question-circle-o",
        // } as any,
        hideField: ['syncFormate'],
        list: [
          {
            value: "YYYY",
            label: DateHandle.dateFormat(new Date(), "YYYY"),
          },
          {
            value: "YYYY-MM",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM"),
          },
          {
            value: "YYYY-MM-DD",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD"),
          },
          {
            value: "YYYY-MM-DD HH:mm",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm"),
          },
          {
            value: "YYYY-MM-DD HH:mm:ss",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm:ss"),
          },
          {
            value: "YYYY-MM-DD CN-APM",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM"),
          },
          {
            value: "YYYY-MM-DD CN-APM HH:mm",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM HH:mm"),
          },
          {
            value: "YYYY-MM-DD EN-APM",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM"),
          },
          {
            value: "YYYY-MM-DD EN-APM HH:mm",
            label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM HH:mm"),
          },
        ],
      },
      tip: {
        content: '文字为绿色的时候，表示和默认格式同步',
        icon: "question-circle-o",
      } as any
    },
    syncFormate: {
      inputMethod: ControlAttributeType.String,
      value: ''
    },
    verifyFormula: {
      inputMethod: ControlAttributeType.Modal,
      attrType: "verifyFormula",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/regular-modal2.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      }
    },
  },
} as ControllerConduct;
