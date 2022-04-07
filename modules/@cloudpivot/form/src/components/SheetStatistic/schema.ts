import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { editableControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "description",
  type: DataType.Object,
  properties: {
    name: {
      type: DataType.String,
      title: "控件名称",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    dataItemName: {
      type: DataType.String,
      title: "绑定数据项编码",
    },
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    statisticMode: {
      type: DataType.String,
      title: "统计模式",
      default: "sum",
    },
    format: {
      type: DataType.String,
      title: "显示格式",
    },
  },
} as ObjectPropertyInfo;
