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
    displayFormula: {
      type: DataType.String,
      title: "显示条件",
    },
  },
} as ObjectPropertyInfo;
