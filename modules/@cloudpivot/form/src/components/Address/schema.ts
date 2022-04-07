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
  $id: "address",
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
    locationType: {
      type: DataType.String,
      title: "地址格式",
      default: 'pp-cc-aa'
    },
    addressDetail: {
      type: DataType.String,
      title: "显示详细地址",
      default: "true",
    },
    showEmpty: {
      type: DataType.String,
      title: "显示空选项",
      default: "false",
    },
    emptyValue: {
      type: DataType.String,
      title: "空值",
      default: '请选择'
    },
    autoGetLocation: {
      type: DataType.String,
      title: "自动获取位置",
      default: "false",
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
    defaultValue: {
      type: DataType.Object,
      title: "默认值"
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
