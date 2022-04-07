/*
 * @Author: Fan
 * @Date: 2020-04-19 19:31:12
 * @description:
 * @LastEditors: Fan
 */
/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:13
 * @description:
 * @LastEditors: Fan
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import {
  inputControlOptions,
  DateValueType,
} from "@cloudpivot/form/component-schema";
export default {
  $id: "calendar",
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
     * 0 YYYY-MM-DD
     * 1 YYYY-MM-DD hh:mm
     * 2 YYYY-MM-DD hh:mm:ss
     */
    format1: {
      type: DataType.Integer,
      title: "显示格式",
    },
    syncFormate: {
      type: DataType.Boolean,
      title: "同步默认格式",
      default: true,
    },
    format: {
      type: DataType.Integer,
      title: "默认格式",
      default: "YYYY-MM-DD",
    },
    minDate: {
      type: DataType.String,
      title: "最小值",
    },
    maxDate: {
      type: DataType.String,
      title: "最大值",
    },
    verifyFormula: {
      type: DataType.String,
      title: "提交校验规则",
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
