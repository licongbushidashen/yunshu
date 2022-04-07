export interface ColumnOption {
  width: number,
  column: Column,
  parentColumn?: any
}

/**
 * 列宽数据接口
*/
export interface WidthRecords {
  key: string,
  value: Array<Record>
}

export interface Record {
  [key: string]: number
}

export interface DisplayedColumn {
  dataIndex: string
  displayFormat: number
  id: string
  isShortText: boolean,
  isShow: boolean
  key: string
  name_i18n: any
  propertyType: number
  vcTitle: string
  width: number
  childColumns?: any
}

interface Column {
  id: string,
  [key: string]: any
}