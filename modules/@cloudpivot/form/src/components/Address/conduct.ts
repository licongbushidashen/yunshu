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
  formatterAddress,
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
      label: "控件属性",
      keys: [
        "readonlyFormula",
        "locationType",
        "addressDetail",
        "showEmpty",
        "emptyValue",
        "autoGetLocation",
        "requiredFormula",
        "dataLinkage",
        "defaultValue"
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
      value: FormControlType.Address,
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
    // 地址格式
    locationType: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "pp-cc-aa",
            label: "省/市/县区",
          },
          {
            value: "pp-cc",
            label: "省/市",
          },
          {
            value: "pp",
            label: "省",
          },
        ],
      },
    },
    // 显示详细地址
    addressDetail: {
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
    //自动获取位置
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
    dataLinkage: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/data-linkage2.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 显示空选项
    showEmpty: {
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
        transaction: ({ attr, attrs, displayFields }: any) => {
          if (attr.value === "false") {
            displayFields.push("emptyValue");
          } else {
            displayFields = displayFields.map((res: any) => {
              return res.field !== "emptyValue";
            });
          }
        },
      },
    },
    emptyValue: {
      options: {
        disabled: true,
      },
    },
    defaultValue: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "loacationModal",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/location-modal.vue"),
      options: {
        formatter: formatterAddress
      },
    }
  },
} as ControllerConduct;
