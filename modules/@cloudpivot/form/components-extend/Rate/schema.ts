/*
 * @Author: Fan
 * @Date: 2020-04-26 12:12:42
 * @description:
 * @LastEditors: Fan
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { styleControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "exRate",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    count: {
      type: DataType.Number,
      title: "star总数",
      default: 5,
    },
    allowClear: {
      type: DataType.Boolean,
      title: "是否允许半选",
      default: true,
    },
  },
} as ObjectPropertyInfo;
