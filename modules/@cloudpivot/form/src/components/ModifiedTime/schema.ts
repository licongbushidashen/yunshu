import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { styleControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "modifiedTime",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    format1: {
      type: DataType.String,
      title: "显示格式",
      default: "YYYY-MM-DD HH:mm:ss",
    },
    format: {
      type: DataType.String,
      title: "默认格式",
      default: "YYYY-MM-DD HH:mm:ss",
    },
    syncFormate: {
      type: DataType.Boolean,
      title: "同步默认格式",
      default: true,
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
