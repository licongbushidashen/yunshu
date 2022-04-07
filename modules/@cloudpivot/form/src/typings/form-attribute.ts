/*
 * @Author: Fan
 * @Date: 2020-04-14 10:27:17
 * @LastEditTime: 2020-04-14 10:50:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/@cloudpivot/form/src/typings/form-attribute.ts
 */
export enum ControlAttributeType {
  Boolean,
  String,
  Dropdown,
  Modal,
  Date,
  SelectTree,
  Tree,
  Userpicker,
  Array,
}
export enum ModalAttributeType {
  // 单选选项框
  RadioOption = "radioOption",
  // 多选选项框
  CheckboxOption = "checkboxOption",

  BizRadioOption = "bizRadioOption",
  // 最小日期
  MinDate = "min-yyyy-mm-dd",
  // 最大日期
  MaxDate = "max-yyyy-mm-dd",
  // 正则弹框
  RegexpFormula = "regularModal",
  // 必填条件
  RequiredFormula = "requiredCondition",
  // 显示条件
  DisplayFormula = "showRule",
  // 计算规则
  ComputeFormula = "calculateRule",
  // 选人控件映射关系
  UserSelectionMap = "userSelectionMap",
  // 查询条件
  QueryFormula = "queryCondition",
  // 事件脚本输入
  ScriptInput = "ScriptInput",
  // 映射子表
  SheetMappings = "sheetMappings",
  // 表单外链接
  ExternalLink = "ExternalLink",
  // 数值类型 校验
  VerifyFormulaNumber = "VerifyFormulaNumber",
  // 日期类型 校验
  VerifyFormulaDate = "VerifyFormulaDate",
  // 图片上传数量
  UpdateImgNum = "UpdateImgNum",
  /**
   * 选人控件值设置
   */
  UserSelectValueSetting = "UserSelectValueSetting",
  /**
   * 选人控件组织根节点设置
   */
  UserSelectOrgValueSetting = "UserSelectOrgValueSetting",

  Print = "Print",
  // 关联表单默认值
  RelevanceFormDefaultVal = "RelevanceFormDefaultValue",
  // 短文本几算规则
  shortTextStitchRouls = "ShortTextStitchRouls",
  // 短文本几算规则
  SelectReportData = "SelectReportData",
  /**
   * 标签页头部
   */
  TabsHeadsSetting = "TabsHeadsSetting",
  dataLinkage = "dataLinkage"
}
