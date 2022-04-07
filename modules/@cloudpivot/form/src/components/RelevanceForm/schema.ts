/*
 * @Author: Fan
 * @Date: 2020-04-13 15:36:59
 * @LastEditTime: 2020-07-06 18:15:24
 * @LastEditors: zhuqiu
 * @Description: 控件拥有的属性和属性的值类型和在设计端属性栏名称. 属性独特的行为是在 conduct文件配置.
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\RelevanceForm\schema.ts
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { FormControlType } from "@cloudpivot/form/schema";
/**
 * 属性根据类型有要一下几种输入框:
 * string默认显示为input:text
 * string format:date、date-time、time默认显示为input:date
 * string format:binary默认显示为input:file
 * boolean默认显示为select
 * integer默认显示为无小数点input:number
 * number默认显示为带小数点input:number
 *
 * 如果需要定制属性的输入框(比如弹框),则应该在conduct文件配置
 */
export default {
  $id: "RelevanceForm",
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
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    style: {
      type: DataType.String,
      title: "控件样式",
    },
    tips: {
      type: DataType.String,
      title: "控件Tips",
    },
    searchFormula: {
      type: DataType.String,
      title: "数据限定范围",
      default: "",
    },
    displayFormula: {
      type: DataType.String,
      title: "显示条件",
    },
    schemaCode: {
      type: DataType.String,
      title: "选择业务模型",
    },
    showStyle: {
      type: DataType.String,
      title: '显示样式',
      default: 'list'
    },
    queryCode: {
        type: DataType.String,
        title: '查询列表'
    },
    displayField: {
        type: DataType.String,
        title: '显示字段'
    },
    mappings: {
        type: DataType.String,
        title: '映射字段'
    },
    conditions: {
        type: DataType.String,
        title: '查询条件'
    },
    mobileConditions: {
        type: DataType.String,
        title: 'mobile查询条件'
    },
    linkMode: {
        type: DataType.Boolean,
        title: '显示链接模式',
        default: true
    },
    selectMode: {
        type: DataType.String,
        title: '选择方式',
        default:'popup'

    },
    showField: {
      type: DataType.Array,
      title: '弹出框字段',
    },
    isAuthorize: {
        type: DataType.Boolean,
        title: '临时授权',
        default: true
    },
    defaultVal: {
        type: DataType.String,
        title: '默认值'
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
    isScan: {
      type: DataType.Boolean,
      title: "扫码输入",
      default: false,
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
