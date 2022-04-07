/*
 * @Author: Fan
 * @Date: 2020-04-16 17:51:26
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
import { FormControlType } from "@cloudpivot/form/schema";
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
        "direction",
        "dataLinkage",
        "displaySetting"
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
      value: "单选框",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "单选框",
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
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterRequiredFormula,
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
    // 选项
    options: {
      inputMethod: ControlAttributeType.Modal,
      attrType: "radioOption",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/biz-option-data-model2.vue"),
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
    direction: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "horizontal",
            label: "横向",
          },
          {
            value: "vertical",
            label: "纵向",
          },
        ],
      },
    },
    // 显示设置
    displaySetting: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "showSelected",
            label: "勾选项",
          },
          {
            value: "showAllOption",
            label: "全部项",
          },
        ],
      },
    }
  },
} as ControllerConduct;
