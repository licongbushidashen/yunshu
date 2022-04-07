import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import { formatterValueToSetStatus } from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";

export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name"],
    },
    controller: {
      label: "控制属性",
      keys: ["displayFormula"],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "描述",
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
  },
} as ControllerConduct;
