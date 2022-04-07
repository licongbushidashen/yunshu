/*
 * @Author: Fan
 * @Date: 2020-04-16 20:44:13
 * @description:
 * @LastEditors: Fan
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { selectControlOptions } from "@cloudpivot/form/component-schema";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  $id: "checkbox",
  type: DataType.Object,
  $ref: selectControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    direction: {
      type: DataType.String,
      title: "web端方向",
      default: "horizontal",
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
    displaySetting: {
      type: DataType.String,
      title: "显示设置",
      default: "showSelected"
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
