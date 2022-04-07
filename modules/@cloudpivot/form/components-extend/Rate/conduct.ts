/*
 * @Author: Fan
 * @Date: 2020-04-26 12:12:53
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
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "visible", "style", "tips", "dataItemName"],
    },
    controller: {
      label: "控制属性",
      keys: ["count", "allowClear"],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    style: {
      ...baseAttribute.style,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    count: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: () => {
          let s: any = [];
          let i = 1;
          while (i <= 10) {
            s.push({ label: i, value: i });
            i++;
          }
          return s;
        },
      },
    },
  },
} as ControllerConduct;
