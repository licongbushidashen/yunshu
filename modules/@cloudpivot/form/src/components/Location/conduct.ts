/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:29
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
  formatterLocations
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips","widgetType"],
    },
    controller: {
      label: "控件属性",
      keys: [
        "readonlyFormula",
        "range",
        "displayMode",
        "autoGetLocation",
        "defaultValue",
        "showSearch"
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
      inputMethod: ControlAttributeType.Dropdown,
      value: FormControlType.Location,
      options: {
        list: [
          {
            value: FormControlType.Location,
            label: "地图定位",
          },
          {
            value: FormControlType.Address,
            label: "地址",
          },
        ],
      },
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "地址",
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
    range: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "500m",
      options: {
        list: [
          {
            value: "1km",
            label: "1km",
          },
          {
            value: "500m",
            label: "500m",
          },
          {
            value: "200m",
            label: "200m",
          },
        ],
      },
    },
    // 提示文字
    displayMode: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "accurate",
            label: "准确定位",
          },
          {
            value: "arbitrary",
            label: "任意位置",
          },
        ],
        hideField: (value: string) => {
          if (value != "accurate") {
            return ["range"];
          } else {
            return [];
          }
        },
      },
    },
    // 文本最大长度
    autoGetLocation: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "true",
            label: "true",
          },
          {
            value: "false",
            label: "false",
          },
        ],
      },
    },
    defaultValue: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "loacationModal",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/location-modal.vue"),
      options: {
        formatter: formatterLocations
      },
    },
    showSearch: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "true",
      options: {
        list: [
          {
            value: "true",
            label: "true",
          },
          {
            value: "false",
            label: "false",
          },
        ],
      }
    }    
  },
} as ControllerConduct;
