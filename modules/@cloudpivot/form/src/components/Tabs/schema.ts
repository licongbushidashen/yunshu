/*
 * @Date: 2020-05-19 13:53:54
 * @LastEditors: zhuqiu
 * @LastEditTime: 2020-06-16 16:08:38
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Tabs\schema.ts
 */ 
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
export default {
  $id: "tabs",
  type: DataType.Object,
  properties: {
    heads: {
      type: DataType.Array,
      title: "选项",
    },
    tabDefaultValue: {
      type: DataType.String,
      title: "默认选项",
      default: "",
    },
  },
} as ObjectPropertyInfo;
