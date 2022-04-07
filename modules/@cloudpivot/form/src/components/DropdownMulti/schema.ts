/*
 * @Author: your name
 * @Date: 2020-04-22 10:08:34
 * @LastEditTime: 2020-04-29 18:29:18
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Dropdown\schema.ts
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { selectControlOptions } from "@cloudpivot/form/component-schema";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  $id: "dropdown",
  type: DataType.Object,
  $ref: selectControlOptions.$id,
  properties: {
    options: {
      type: DataType.String,
      title: "选项",
      default: "",
    },
    widgetType: {
      type: DataType.Number,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    displayEmpty: {
      type: DataType.Boolean,
      title: "是否显示空选项",
      default: true,
    },
    emptyValue: {
      type: DataType.String,
      title: "空选项显示值",
      default: "请选择",
    },
    multi: {
      type: DataType.Boolean,
      title: "是否多选",
      default: true,
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
