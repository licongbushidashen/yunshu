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
  $id: "location",
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    range: {
      type: DataType.String,
      title: "精确范围",
    },
    displayMode: {
      type: DataType.String,
      title: "显示模式",
      default: "accurate",
    },
    autoGetLocation: {
      type: DataType.String,
      title: "自动获取位置",
      default: "false",
    },
    defaultValue: {
      type: DataType.Object,
      title: "默认值"
    },
    showSearch: {
      type: DataType.String,
      title: "定位搜索"
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
