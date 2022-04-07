/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:13
 * @description:
 * @LastEditors: Fan
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import {
  inputControlOptions,
  TextAreaType,
} from "@cloudpivot/form/component-schema";
export default {
  $id: "longText",
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
    },
    textAreaType: {
      type: DataType.String,
      title: "输入框样式",
      default: TextAreaType.LongText,
    },
    maxLength: {
      type: DataType.Integer,
      title: "最大长度",
      default: 2e3,
    },
    currentMaxLength: {
      type: DataType.Integer,
      title: "字数限制",
      default: 2e6,
    },
    placeholder: {
      type: DataType.String,
      title: "提示文字",
      default: "请输入",
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
