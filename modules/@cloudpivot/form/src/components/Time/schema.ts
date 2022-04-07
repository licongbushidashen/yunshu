import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import {
  inputControlOptions,
  DateValueType,
} from "@cloudpivot/form/component-schema";
export default {
  $id: "time",
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    defaultValue: {
      type: DataType.String,
      title: "默认值",
      default: DateValueType.None,
    },
    dataItemDefault: {
      type: DataType.String,
      title: "数据项默认值",
      default: "",
    },
    /**
     * 显示模式
     * 0 hh:mm
     * 1 hh:mm:ss
     */
    format: {
      type: DataType.Integer,
      title: "显示模式",
      default: "HH:mm:ss",
    },
    verifyFormula: {
      type: DataType.String,
      title: "提交校验规则",
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
  },
} as ObjectPropertyInfo;
