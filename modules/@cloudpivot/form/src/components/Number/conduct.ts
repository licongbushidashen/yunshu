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
  formatterRequiredFormula
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { utils } from "@cloudpivot/common";

const DateHandle = utils.DateHandle;
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips", "widgetType", "syncFormate"],
    },
    controller: {
      label: "控制属性",
      keys: [
        "defaultValue",
        "readonlyFormula",
        "placeholder",
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
      value: "数值",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "数值",
    },
    defaultValue: {
      options: {
        regexps: {
          regexps: [
            {
              regexp: /^-?(\.|(0|(\d){0,19}))?(\.\d{0,3})?$/,
              message: "只能输入数值类型，最大长度19位数，精度3位数",
            },
          ],
        },
      },
    },
    placeholder: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
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
    shortTextStitch: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/short-text-rouls.vue"),
      options: {
        formatter: formatterValueToSetStatus,
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
            value: "none",
            label: "空",
          },
          {
            value: "integer",
            label: "2000",
          },
          {
            value: "tenths",
            label: "2,000.0",
          },
          {
            value: "percentile",
            label: "2,000.00",
          },
          {
            value: "Millimeter",
            label: "2,000.000",
          },
          {
            value: "tenThousand",
            label: "2,000.0000",
          },
          {
            value: "hundredThousand",
            label: "2,000.00000",
          },
          {
            value: "millionDecimals",
            label: "2,000.000000",
          },
          {
            value: "tenMillionDecimals",
            label: "2,000.0000000",
          },
          {
            value: "billionDecimals",
            label: "2,000.00000000",
          },
          {
            value: "ratio",
            label: "20%",
          },
          {
            value: "ratio.tenths",
            label: "20.0%",
          },
          {
            value: "ratio.percentile",
            label: "20.00%",
          },
          {
            value: "ratio.Millimeter",
            label: "20.000%",
          },
          {
            value: "ratio.tenThousand",
            label: "20.0000%",
          },
          {
            value: "ratio.hundredThousand",
            label: "20.00000%",
          },
          {
            value: "ratio.millionDecimals",
            label: "20.000000%",
          },
          {
            value: "ratio.tenMillionDecimals",
            label: "20.0000000%",
          },
          {
            value: "ratio.billionDecimals",
            label: "20.00000000%",
          },
          {
            value: "RMB.percentile",
            label: "￥2,000.00",
          },
          {
            value: "RMB.Millimeter",
            label: "￥2,000.000",
          },
          {
            value: "RMB.tenThousand",
            label: "￥2,000.0000",
          },
          {
            value: "RMB.hundredThousand",
            label: "￥2,000.00000",
          },
          {
            value: "RMB.millionDecimals",
            label: "￥2,000.000000",
          },
          {
            value: "RMB.tenMillionDecimals",
            label: "￥2,000.0000000",
          },
          {
            value: "RMB.billionDecimals",
            label: "￥2,000.00000000",
          },
          {
            value: "dollar.percentile",
            label: "$2,000.00",
          },
          {
            value: "dollar.Millimeter",
            label: "$2,000.000",
          },
          {
            value: "dollar.tenThousand",
            label: "$2,000.0000",
          },
          {
            value: "dollar.hundredThousand",
            label: "$2,000.00000",
          },
          {
            value: "dollar.millionDecimals",
            label: "$2,000.000000",
          },
          {
            value: "dollar.tenMillionDecimals",
            label: "$2,000.0000000",
          },
          {
            value: "dollar.billionDecimals",
            label: "$2,000.00000000",
          },
          {
            value: "euro.percentile",
            label: "€2,000.00",
          },
          {
            value: "euro.Millimeter",
            label: "€2,000.000",
          },
          {
            value: "euro.tenThousand",
            label: "€2,000.0000",
          },
          {
            value: "euro.hundredThousand",
            label: "€2,000.00000",
          },
          {
            value: "euro.millionDecimals",
            label: "€2,000.000000",
          },
          {
            value: "euro.tenMillionDecimals",
            label: "€2,000.0000000",
          },
          {
            value: "euro.billionDecimals",
            label: "€2,000.00000000",
          },
          {
            value: "HK.percentile",
            label: "HK$2,000.00",
          },
          {
            value: "HK.Millimeter",
            label: "HK$2,000.000",
          },
          {
            value: "HK.tenThousand",
            label: "HK$2,000.0000",
          },
          {
            value: "HK.hundredThousand",
            label: "HK$2,000.00000",
          },
          {
            value: "HK.millionDecimals",
            label: "HK$2,000.000000",
          },
          {
            value: "HK.tenMillionDecimals",
            label: "HK$2,000.0000000",
          },
          {
            value: "HK.billionDecimals",
            label: "HK$2,000.00000000",
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
        //   debugger
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
          console.log('attrsA', assitAttrs)
          console.log('cont', control)
          // 是否开启同步,默认开启
          const syncFormate = control.options && control.options.syncFormate
          
          // 获取list
          // debugger
          const formate1 = attrs.find((item: any) => item.field ==="format1")
          const mappingList = formate1.options && formate1.options.list
          console.log(mappingList)

          //开启同步则从default取值
          if(syncFormate && flag) {
            if (Array.isArray(assitAttrs)) {
              let formatItem: any = assitAttrs.find(x => x.field === 'format');
              const tar:any = mappingList.find((item: any) => item.value === formatItem.value)
              return tar.label || formatItem.value
            }
          } else {
            if(attr && attr !== '') {
              const tar:any = mappingList.find((item: any) => item.value === attr)
              return tar.label || attr 
            } else {
              return ''
            }
          }
        },
        hideField: ['syncFormate'],        
        list: [
          {
            value: "none",
            label: "空",
          },
          {
            value: "integer",
            label: "2000",
          },
          {
            value: "tenths",
            label: "2,000.0",
          },
          {
            value: "percentile",
            label: "2,000.00",
          },
          {
            value: "Millimeter",
            label: "2,000.000",
          },
          {
            value: "tenThousand",
            label: "2,000.0000",
          },
          {
            value: "hundredThousand",
            label: "2,000.00000",
          },
          {
            value: "millionDecimals",
            label: "2,000.000000",
          },
          {
            value: "tenMillionDecimals",
            label: "2,000.0000000",
          },
          {
            value: "billionDecimals",
            label: "2,000.00000000",
          },
          {
            value: "ratio",
            label: "20%",
          },
          {
            value: "ratio.tenths",
            label: "20.0%",
          },
          {
            value: "ratio.percentile",
            label: "20.00%",
          },
          {
            value: "ratio.Millimeter",
            label: "20.000%",
          },
          {
            value: "ratio.tenThousand",
            label: "20.0000%",
          },
          {
            value: "ratio.hundredThousand",
            label: "20.00000%",
          },
          {
            value: "ratio.millionDecimals",
            label: "20.000000%",
          },
          {
            value: "ratio.tenMillionDecimals",
            label: "20.0000000%",
          },
          {
            value: "ratio.billionDecimals",
            label: "20.00000000%",
          },
          {
            value: "RMB.percentile",
            label: "￥2,000.00",
          },
          {
            value: "RMB.Millimeter",
            label: "￥2,000.000",
          },
          {
            value: "RMB.tenThousand",
            label: "￥2,000.0000",
          },
          {
            value: "RMB.hundredThousand",
            label: "￥2,000.00000",
          },
          {
            value: "RMB.millionDecimals",
            label: "￥2,000.000000",
          },
          {
            value: "RMB.tenMillionDecimals",
            label: "￥2,000.0000000",
          },
          {
            value: "RMB.billionDecimals",
            label: "￥2,000.00000000",
          },
          {
            value: "dollar.percentile",
            label: "$2,000.00",
          },
          {
            value: "dollar.Millimeter",
            label: "$2,000.000",
          },
          {
            value: "dollar.tenThousand",
            label: "$2,000.0000",
          },
          {
            value: "dollar.hundredThousand",
            label: "$2,000.00000",
          },
          {
            value: "dollar.millionDecimals",
            label: "$2,000.000000",
          },
          {
            value: "dollar.tenMillionDecimals",
            label: "$2,000.0000000",
          },
          {
            value: "dollar.billionDecimals",
            label: "$2,000.00000000",
          },
          {
            value: "euro.percentile",
            label: "€2,000.00",
          },
          {
            value: "euro.Millimeter",
            label: "€2,000.000",
          },
          {
            value: "euro.tenThousand",
            label: "€2,000.0000",
          },
          {
            value: "euro.hundredThousand",
            label: "€2,000.00000",
          },
          {
            value: "euro.millionDecimals",
            label: "€2,000.000000",
          },
          {
            value: "euro.tenMillionDecimals",
            label: "€2,000.0000000",
          },
          {
            value: "euro.billionDecimals",
            label: "€2,000.00000000",
          },
          {
            value: "HK.percentile",
            label: "HK$2,000.00",
          },
          {
            value: "HK.Millimeter",
            label: "HK$2,000.000",
          },
          {
            value: "HK.tenThousand",
            label: "HK$2,000.0000",
          },
          {
            value: "HK.hundredThousand",
            label: "HK$2,000.00000",
          },
          {
            value: "HK.millionDecimals",
            label: "HK$2,000.000000",
          },
          {
            value: "HK.tenMillionDecimals",
            label: "HK$2,000.0000000",
          },
          {
            value: "HK.billionDecimals",
            label: "HK$2,000.00000000",
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
