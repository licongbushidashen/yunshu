import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { editableControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "group",
  type: DataType.Object,
  properties: {
    name: {
      type: DataType.String,
      title: "控件名称",
    },
    style: {
      type: DataType.String,
      title: "控件样式",
    },
    tips: {
      type: DataType.String,
      title: "控件Tips",
    },
    expand: {
      type: DataType.Boolean,
      title: "默认展开",
      default: true,
    },
    align: {
      type: DataType.String,
      title: "对齐",
    },
  },
} as ObjectPropertyInfo;
