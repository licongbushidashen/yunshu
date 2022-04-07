import {
  ControllerConduct,
  ControlAttributeType,
  DataType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import ShortText from "../ShortText";
import Radio from "../Radio";
import Checkbox from "../Checkbox";
import Dropdown from "./index";
import LongText from "../LongText";
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
        "displayEmpty",
        "emptyValue",
        "requiredFormula",
        "dataLinkage",
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
      value: "下拉单选框",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "下拉单选框",
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
    dataLinkage: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/data-linkage2.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 默认值
    defaultValue: {
      options: {
        transaction({ attr, attrs, displayFields }: any) {
          // const type = 0;
          if (attr.dataItem && attr.dataItem.type === 1) {
            delete attr.options.regexps;
          }
          // ;
        },
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
      attrType: "dropdownOption",
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/biz-option-data-model2.vue"
        ),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 是否显示空选项
    displayEmpty: {
      options: {
        hideField: (value: string) => {
          if (!value) {
            return ["emptyValue"];
          } else {
            return [];
          }
        },
      },
    },
    // 空选项显示值
    emptyValue: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
      },
    },
  },
} as ControllerConduct;
