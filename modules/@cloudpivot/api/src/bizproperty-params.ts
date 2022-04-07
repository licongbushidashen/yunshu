/**
 * 数据项排序
 */

export interface SortkeysParams {
  schemaCode: string // 模型编码
  codes: string // code 数组
 }

export interface SchemaCode {
  schemaCode: string
}

export interface BusinessRuleId {
  businessRuleId: string
}

export interface Id {
  id: string
}

export interface CheckSheetMappingParam {
  schemaCode: string,
  relativeCode: string,
  mappings: any[]
}

export interface dataRlueParam {
  schemaCode: string,
  dataRuleType?: number
}