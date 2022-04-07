import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
  formatterUploadImgNumber,
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
        "limit",
        "batch",
        "number",
        "addWatermark",
        "watermarkFontSize",
        "imageQuality",
        "compressible",
        "onlyShoot",
        "dataLinkage",
      ],
    },
    scripts: {
      label: "控件事件",
      keys: ["onUpload", "onDelete"],
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
      value: FormControlType.Image,
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: FormControlType.Attachment,
            label: "附件",
          },
          {
            value: FormControlType.Image,
            label: "图片",
          },
          {
            value: FormControlType.Signature,
            label: "手写签名",
          },
        ],
      },
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "附件",
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
    limit: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "1M",
            label: "1M",
          },
          {
            value: "5M",
            label: "5M",
          },
          {
            value: "10M",
            label: "10M",
          },
          {
            value: "20M",
            label: "20M",
          },
          {
            value: "50M",
            label: "50M",
          },
          {
            value: "100M",
            label: "100M",
          },
          {
            value: "200M",
            label: "200M",
          },
          // {
          //   value: '512M',
          //   label: '512M'
          // },
          // {
          //   value: '1G',
          //   label: '1G'
          // }
        ],
      },
    },
    number: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/update-img-num.vue"),
      options: {
        formatter: formatterUploadImgNumber,
      },
    },
    compressible: {
      options: {
        hideField: (attr: any) => (attr ? [] : ["imageQuality"]),
      },
    },
    watermarkFontSize:{
      inputMethod: ControlAttributeType.Dropdown,
      value: 16,
      options: {
        list: [
          {
            value: 16,
            label: "小",
          },
          {
            value: 32,
            label: "中",
          },
          {
            value: 48,
            label: "大",
          },
          {
            value: 72,
            label: "特大",
          },
        ],
      }
    },

    imageQuality: {
      inputMethod: ControlAttributeType.Dropdown,
      value: 30,
      options: {
        list: [
          {
            value: 30,
            label: "30%",
          },
          {
            value: 40,
            label: "40%",
          },
          {
            value: 50,
            label: "50%",
          },
          {
            value: 60,
            label: "60%",
          },
          {
            value: 70,
            label: "70%",
          },
          {
            value: 80,
            label: "80%",
          },
          {
            value: 90,
            label: "90%",
          },
        ],
      },
    },
    onUpload: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/script-input.vue"),
    },
    onDelete: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/script-input.vue"),
    },
  },
} as ControllerConduct;
