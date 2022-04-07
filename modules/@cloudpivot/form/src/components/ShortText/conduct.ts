/*
 * @Author: Fan
 * @Date: 2020-04-13 17:06:58
 * @LastEditTime: 2020-04-27 22:06:41
 * @LastEditors: Fan
 * @Description:
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/ShortText/setting.ts
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
// import RequiredCondition from "@cloudpivot/form/src/common/components/required-condition.vue";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips", "widgetType"]
    },
    controller: {
      label: "控件属性",
      keys: [
        "defaultValue",
        "readonlyFormula",
        "placeholder",
        "isScan",
        "requiredFormula",
        "dataLinkage"
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
      value: "单行文本",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "单行文本",
    },
    dictionaryData: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/dictionary-setting.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 显示条件
    displayFormula: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "showRule",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 是否必填
    requiredFormula: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "requiredRule",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterRequiredFormula,
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          if(attr.value === 'true'){
            const readonlyFormula = attrs.find((a: any) => a.field === "readonlyFormula")
              .value;
            if(readonlyFormula){
              vm.updateAttribute(
                key,
                "readonlyFormula",
                'false'
              );
            }
          }
        },
      },
    },
    // 默认值
    defaultValue: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
      },
    },
    // 正则校验
    regexp: {
      inputMethod: ControlAttributeType.Modal,
      attrType: "regularModal",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/regular-modal2.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    //正则错误提示
    regexpText: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
      },
    },
    // 提示文字
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
    // 文本最大长度
    maxLength: {
      options: {
        regexps: {
          required: "最大长度不能为空",
          regexps: [
            {
              regexp: /^[1-9]\d*$/,
              message: "只能输入正整数",
            },
            {
              regexp: (value: string) => parseFloat(value) <= 200,
              message: "最大长度不能超过200",
            },
          ],
        },
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
    shortTextStitch: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/short-text-rouls.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
  },
} as ControllerConduct;
