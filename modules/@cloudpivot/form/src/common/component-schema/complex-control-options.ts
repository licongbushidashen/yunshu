/*
 * @Author: Fan
 * @Date: 2020-04-19 21:42:40
 * @description:
 * @LastEditors: Fan
 */
import {
  FormControlOptions,
  StyleControlOptions,
  InputControlOptions,
  NumberFormatType,
} from "./form-control-options";
import { DataType, ObjectPropertyInfo } from "@cloudpivot/form/typings";
import { inputControlOptions } from ".";
/**
 * 选人控件可选类型
 */
export enum StaffSelectorSelectType {
  /**
   * 所有
   */
  All = "all",

  /**
   * 用户
   */
  User = "user",

  /**
   * 部门
   */
  Org = "org",
}
/**
 * 选人控件值类型
 */
export enum StaffSelectorValueType {
  /**
   * 空，取设置的固定值
   */
  None = "",

  /**
   * 创建人，前发起人
   */
  Originator = "originator",

  /**
   * 创建人部门，前发起人部门
   */
  OriginatorDept = "originatorDept",

  /**
   * 引用控件值
   */
  Ref = "ref",
}
export enum DisplayType {
  Text = "text",

  Tag = "tag",
}
/**
 * 选人控件
 */
export const staffSelectorOptions = {
  $id: "staffSelectorOptions",
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    deptVisible: {
      type: DataType.String,
      title: "可选类型",
      default: StaffSelectorSelectType.All,
    },
    roles: {
      type: DataType.String,
      title: "角色范围",
      default: "",
    },
    mappings: {
      type: DataType.String,
      title: "映射关系",
      default: "",
    },
    displayType: {
      type: DataType.String,
      title: "displayType",
      default: DisplayType.Tag,
    },
    multi: {
      type: DataType.Boolean,
      title: "是否多选",
      default: false,
    },
    recursive: {
      type: DataType.Boolean,
      title: "是否递归展示",
      default: false,
    },
    defaultValue: {
      type: DataType.Array,
      title: "默认值",
      default: [],
    },
    defaultValueType: {
      type: DataType.String,
      title: "默认值类型",
      default: StaffSelectorValueType.None,
    },
  },
} as ObjectPropertyInfo;

/**
 * 上传限制
 */
export enum UploadLimitType {
  "1M" = "1M",

  "5M" = "5M",

  "10M" = "10M",

  "20M" = "20M",

  "50M" = "50M",

  "100M" = "100M",

  "200M" = "200M",
  // '512M' = '512M',

  // '1G' = '1G'
}
/**
 * 子表显示模式
 */
export enum SheetDisplayMode {
  /**
   * 瀑布
   */
  Waterfall = "waterfall",

  /**
   * 分页
   */
  Page = "page",

  /**
   * 二维
   */
  Table = "table",
}

export const uploadOptions = {
  $id: "uploadOptions",
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    displayFormula: {
      type: DataType.String,
      title: "显示条件",
      default: "",
    },
    requiredFormula: {
      type: DataType.String,
      title: "是否必填",
      default: "",
    },
    limit: {
      type: DataType.String,
      title: "文件大小限制",
      default: "5M",
    },
    batch: {
      type: DataType.Boolean,
      title: "批量下载",
      default: true,
    },
  },
} as ObjectPropertyInfo;
export const baseUploadOptions = {
  $id: "baseUploadOptions",
  type: DataType.Object,
  $ref: uploadOptions.$id,
  properties: {
    onUpload: {
      type: DataType.String,
      title: "上传事件",
      default: "",
    },
    onDelete: {
      type: DataType.String,
      title: "删除事件",
      default: "",
    },
  },
} as ObjectPropertyInfo;
