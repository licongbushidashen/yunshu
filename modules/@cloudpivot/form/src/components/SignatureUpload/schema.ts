import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { baseUploadOptions } from "@cloudpivot/form/component-schema";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  $id: "attachment",
  type: DataType.Object,
  $ref: baseUploadOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    displayEnd: {
      type: DataType.String,
      title: "显示端",
      default: "移动端",
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
