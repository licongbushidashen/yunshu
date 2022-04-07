/*
 * @Author: Fan
 * @Date: 2020-04-16 19:44:30
 * @description:
 * @LastEditors: Fan
 */
import { DataType, ObjectPropertyInfo } from "@cloudpivot/form/typings";
import { editableControlOptions } from ".";
export const inputControlOptions = {
  $id: "inputControlOptions",
  type: DataType.Object,
  $ref: editableControlOptions.$id,
  properties: {
    requiredFormula: {
      type: DataType.String,
      title: "是否必填",
    },
    readonlyFormula: {
      type: DataType.Boolean,
      title: "是否只读",
      default: false,
    },
  },
} as ObjectPropertyInfo;
