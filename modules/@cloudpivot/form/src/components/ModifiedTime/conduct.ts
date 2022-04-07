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
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips", "widgetType"],
    },
    controller: {
      label: "控制属性",
      keys: ["format1", 'syncFormate'],
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
      value: "修改时间",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "日期",
    },
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
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
              let formatItem: any = assitAttrs.find(x => x.field === 'format');
              if(formatItem.value.includes('APM')) {
                // @ts-ignore
                return DateHandle.dateFormatApm(new Date(), formatItem.value)
              } else {
                return DateHandle.dateFormat(new Date(), formatItem.value)
              }
            }
            if(attr) {
              if(attr.includes('APM')) {
                // @ts-ignore
                return DateHandle.dateFormatApm(new Date(), attr)
              } else {
                return DateHandle.dateFormat(new Date(), attr)
              }
            }
          } else {
            if(attr && attr !== '') {
              if(attr.includes('APM')) {
                // @ts-ignore
                return DateHandle.dateFormatApm(new Date(), attr)
              } else {
                // @ts-ignore
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
  },
} as ControllerConduct;
