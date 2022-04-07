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
import {
  StaffSelectorSelectType,
  StaffSelectorValueType,
  DisplayType,
} from "@cloudpivot/form/src/common/component-schema/complex-control-options";
export default {
  $id: "staffMultiSelector",
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
    multi: {
      type: DataType.String,
      title: "是否多选",
      default: "true",
    },
    deptVisible: {
      type: DataType.String,
      title: "可选类型",
      default: StaffSelectorSelectType.User,
    },
    defaultValue: {
      type: DataType.Array,
      title: "默认值",
      default: [],
    },
    defaultValueType: {
      type: DataType.String,
      title: "默认值",
      default: StaffSelectorValueType.None,
    },
    orgRoot: {
      type: DataType.Array,
      title: "组织根节点",
      default: [],
    },
    orgRootValueType: {
      type: DataType.String,
      title: "组织根节点",
      default: StaffSelectorValueType.None,
    },
    recursive: {
      type: DataType.Boolean,
      title: "是否递归展示",
      default: true,
    },
    roles: {
      type: DataType.String,
      title: "角色范围",
      default: "",
    },
    mappings: {
      type: DataType.String,
      title: "映射关系",
    },
    displayType: {
      type: DataType.String,
      title: "displayType",
      default: DisplayType.Tag,
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
