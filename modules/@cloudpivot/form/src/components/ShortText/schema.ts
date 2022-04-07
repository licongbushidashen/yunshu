/*
 * @Author: Fan
 * @Date: 2020-04-13 15:36:59
 * @LastEditTime: 2020-06-17 11:01:37
 * @LastEditors: zhuqiu
 * @Description: 控件拥有的属性和属性的值类型和在设计端属性栏名称. 属性独特的行为是在 conduct文件配置.
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\ShortText\schema.ts
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  $id: "shortText",
  type: DataType.Object,
  properties: {
    name: {
      type: DataType.String,
      title: "控件名称",
      default: "",
    },
    name_i18n: {
      type: DataType.Object,
      title: "多语言",
    },
    visible: {
      type: DataType.Boolean,
      title: "是否可见",
      default: true,
    },
    dataItemName: {
      type: DataType.String,
      title: "绑定数据项编码",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    dictionaryData: {
      type: DataType.String,
      title: "数据字典",
    },
    widgetType: {
      type: DataType.Number,
      title: "控件类型",
    },
    style: {
      type: DataType.String,
      title: "控件样式",
    },
    tips: {
      type: DataType.String,
      title: "控件Tips",
    },
    displayFormula: {
      type: DataType.String,
      title: "显示条件",
    },
    onChange: {
      type: DataType.String,
      title: "变更事件",
    },
    requiredFormula: {
      type: DataType.String,
      title: "是否必填",
    },
    readonlyFormula: {
      type: DataType.Boolean,
      title: "是否只读",
      default: false,
    },
    defaultValue: {
      type: DataType.String,
      title: "默认值",
    },
    regexp: {
      type: DataType.String,
      title: "正则校验",
    },
    regexpText: {
      type: DataType.String,
      title: "正则错误提示",
    },
    placeholder: {
      type: DataType.String,
      title: "提示文字",
      default: "请输入",
    },
    maxLength: {
      type: DataType.Integer,
      title: "最大长度",
      maximum: 200,
      default: 200,
    },
    noRepeat: {
      type: DataType.Boolean,
      title: "去重校验",
      default: false,
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
    shortTextStitch: {
      type: DataType.String,
      title: "计算规则",
    },
    isScan: {
      type: DataType.Boolean,
      title: "扫码输入",
      default: false,
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
