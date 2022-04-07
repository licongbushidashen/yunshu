/*
 * @Author: Fan
 * @Date: 2020-04-16 19:34:28
 * @description:
 * @LastEditors: Fan
 */
import { DataType, ObjectPropertyInfo } from "@cloudpivot/form/typings";
import { styleControlOptions } from ".";
export const editableControlOptions = {
  $id: "editableControlOptions",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    displayFormula: {
      type: DataType.String,
      title: "显示条件",
    },
    onChange: {
      type: DataType.String,
      title: "变更事件",
    },
  },
} as ObjectPropertyInfo;
