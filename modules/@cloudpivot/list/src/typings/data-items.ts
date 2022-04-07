
export interface DataItem {

  code: string

  name: string

  type: DataItemType

  isSystem: boolean

  published: boolean

  properties?: DataItem[]

  parentCode?: string

  defaultValue?:any

}

/**
 * 数据项类型
 */
export enum DataItemType {
  /**
   * 短文本
   */
  ShortText = 0,
  /**
   * 长文本
   */
  LongText = 1,
  /**
   * 数值
   */
  Number = 2,
  /**
   * 日期
   */
  Date = 3,

  /**
   * 逻辑
   */
  Logic = 4,
  /**
   * 人员单选
   */
  StaffSingle = 50,
  /**
   * 附件
   */
  Attachment = 6,

  /**
   * 审批意见
   */
  ApprovalOpinion = 7,

  /**
   * 子表
   */
  Sheet = 8,

  /**
   * 关联单选
   */
  RelevanceForm = 9,

  /**
   * 地理位置
   */
  Address = 10,

  /**
   * 关联多选
   */
  RelevanceFormEx = 11,
  /**
   * 单选框
   */
  Radio = 12,
  /**
   * 复选框
   */
  Checkbox = 13,
  /**
   * 下拉框单选
   */
  Dropdown = 14,
  /**
   * 下拉框多选
   */
  DropdownMulti = 15,
  /**
   * 人员多选
   */
  StaffMulti = 51,
  /**
   * 部门单选
   */
  DeptSingle = 60,

  /**
   * 部门多选
   */
  DeptMulti = 61,
  /**
   * 混合选人控件
   */
  StaffDeptMix = 5,
  /**
   * 时间
   */
  Time = 20
}
