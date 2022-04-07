// import { AppInfo, PageGroupInfo, PageInfo } from '@cloudpivot-shared/ui-designer-common';
// // import * as page from '@cloudpivot-shared/ui-designer/page-data-provider';
// import API from '@cloudpivot-shared/domain-api';
//
// import { OpenAPI3 } from '@cloudpivot-shared/ui-designer-common/open-api';

export enum SystemPropCode {
  ID = 'id',

  CreatedDept = 'createdDept',
  CreatedTime = 'createdTime',
  CreatedBy = 'createdBy',

  Owner = 'owner',
  OwnerDept = 'ownerDept',

  ModifiedTime = 'modifiedTime',
  ModifiedBy = 'modifiedBy',

  Status = 'status',

  /**
   * 单据号
   */
  Document = 'document',
}

export enum ModelPropertyOperator {
  Equal = 'EQ',

  Like = 'LIKE',

  LLike = 'LLike',

  GreaterThan = 'GT',

  LessThan = 'LT',

  GreaterThanOrEqual = 'GTE',

  In = 'IN',

  LessThanOrEqual = 'LTE',

  NotEqual = 'NOT_EQ',
}

export enum ModelPropertyValueType {
  /**
   * 短文本
   */
  SHORT_TEXT = 'SHORT_TEXT',

  BOOLEAN = 'BOOLEAN',

  /**
   * 长文本
   */
  LONG_TEXT = 'LONG_TEXT',

  NUMBER = 'NUMBER',

  DATE = 'DATE',

  /**
   * 地址
   */
  ADDR_TYPE = 'ADDR_TYPE',

  /**
   * 人员单选
   */
  RADIO_PERSON = 'RADIO_PERSON',

  /**
   * 附件
   */
  ATTACHMENT = 'ATTACHMENT',

  /**
   * 关联外键
   */
  REF_TYPE = 'REF_TYPE',

  /**
   * 子模型
   */
  CHILD_TABLE = 'CHILD_TABLE',

  /**
   * 单选文本
   */
  RADIO_TEXT = 'RADIO_TEXT',

  /**
   * 文本多选
   */
  MULTI_SELECT_TEXT = 'MULTI_SELECT_TEXT',

  /**
   * 富文本
   */
  RICH_TEXT = 'RICH_TEXT',

  /**
   * 数值，带小数类型
   */
  DECIMAL = 'DECIMAL',

  /**
   * 人员多选
   */
  MULTI_SELECT_PERSON = 'MULTI_SELECT_PERSON',

  /**
   * 地图
   */
  MAP_TYPE = 'MAP_TYPE',

  /**
   * 部门单选
   */
  RADIO_DEPARTMENT = 'RADIO_DEPARTMENT',

  /**
   * 部门多选
   */
  MULTI_SELECT_DEPARTMENT = 'MULTI_SELECT_DEPARTMENT',

  /**
   * 人员部门混选
   */
  PERSON_DEPARTMENT_SELECT = 'PERSON_DEPARTMENT_SELECT',

  /**
   * 图片
   */
  IMAGE = 'IMAGE',

  /**
   * 关联连接属性
   */
  RELATION_KEY = 'RELATION_KEY',
}

export interface AppDetailInfo {
  appCode: string;

  enabled: boolean;

  homepage: {
    groupCode: string;
    moduleCode: string;
    pageCode: string;
  };

  logoUrl: string;

  name: string;

  appId: string;

  projectCode: string;

  groupVOS: AppGroup[];
}

export interface AppGroup {
  groupCode: string;
  groupName: string;
  pageGroups: any[];
  pages: any[];
  domainModels: DomainModel[];
}

export interface ModelFitler {
  operation: ModelPropertyOperator;

  propertyCode: string;

  propertyValue: any[];

  valueType: ModelPropertyValueType;
}

export interface QueryCondition {
  nature: 'AND' | 'OR';

  conditions: Array<QueryConditionItem | QueryCondition>;
}

export interface QueryConditionItem {
  operator: ModelPropertyOperator;

  field: string;

  value: any;
}

export interface ModelQuery {
  pageIndex: number;

  pageSize: number;

  sortings?: {
    [key: string]: SortingType;
  };

  filters?: ModelFitler[];
}

export enum SortingType {
  Asc = 'asc',

  Desc = 'desc',
}

export enum BoServiceOperationId {

  Load = 'loadBO',

  Create = 'createBO',

  Update = 'updateBO',

  List = 'listBO',

  Delete = 'deleteBO',

  BatchDelete = 'batchDeleteBO',

}

export interface ModelSchemaGetParams {
  domainModelCode: string;
}

export interface ModelInfoBase {
  // appCode: string;

  // groupCode: string | null

  //   moduleCode: string

  schemaCode: string;

  domainCode: string;

  name: string;
}

export interface ModelPropertyDataSource {
  daimainCode: string;

  schemaCode: string;

  propertyCode: string;

  fkCode: string;
}

export interface ModelParamsBase {
  appCode: string;

  // bizModuleCode: string

  // bizGroupCode: string | null

  schemaCode: string;

  domainCode: string;
}

// export interface ModelGetParams extends ModelParamsBase {
//   bizObjectId: string;
// }

// export interface ModelDeleteParams extends ModelParamsBase {
//   bizObjectId: string[];
// }

// export interface ModelListParams extends ModelQuery {
//   appCode: string;

//   // moduleCode: string

//   schemaCode: string;
// }

// export interface ModelSaveParams extends ModelParamsBase {
//   data: any;
// }

export interface ModelImportBase extends ModelParamsBase {}

export interface ModelImportParams extends ModelImportBase {
  override: boolean;
  queryColumn: string;
  domainModelCode: string;
  bizSchemaCode: string;
  save: boolean;
  // file: any
}

export interface PageData {
  total: number;

  data: any[];
}

export interface DomainModelTree extends ModelSchemaGetParams {
  bizSchema: ModelSchemaInfo;

  subSchemas: ModelSchemaInfo[];

  referenceSchemas: ModelSchemaInfo[];
}

export enum ModelValidationType {
  Unique = 'UNIQUE',

  Regexp = 'REG',

  Password = 'PASSWORD',

  Number = 'NUMBER',

  TextLength = 'TEXT_LONG',

  Date = 'DATE',

  CustomRegexp = 6,

  JavaScript = 'JAVASCRIPT',
}

export enum LogicalOperator {
  And = 'AND',
  Or = 'OR',
}

export enum OperationType {
  Equal = 'EQ',

  NotEqual = 'NOT_EQ',

  Contains = 'CONTAINS',

  NotContains = 'NOT_CONTAINS',

  Null = 'NULL',

  NotNull = 'NOTNULL',

  GreaterThan = 'GT',

  LessThan = 'LT',

  GreaterThanOrEqual = 'GTE',

  LessThanOrEqual = 'LTE',

  Of = 'MEMBER_OF',

  NotOf = 'NOT_MEMBER_OF',
}

export interface ModelValidation {
  logicalOperator: LogicalOperator;

  validationProperty: {
    schemaCode: string;

    propertyCode: string;
  };

  validatedType: ModelValidationType;

  ruleConditions: ModelValidationRule[];
}

export enum ModelValidationRuleType {
  MinValue = 'MIN_VALUE',

  MaxValue = 'MAX_VALUE',

  Scope = 'SCOPE',
}

export enum ModelValidationHandleType {
  TipAndEnd = 'TIP_AND_END',

  Tip = 'TIP',
}

export enum DateFormatType {
  Date = 'yyyy-MM-dd',

  Time = 'HH:mm:ss',

  Datetime = 'yyyy-MM-dd HH:mm:ss',
}

export interface ModelMandatoryRule {
  mandatoryProperties: ModelRequireRuleResult[];

  ruleCondition: ModelRequireRuleContent;
}

export interface ModelRequireRuleBinaryOperation {
  propertyCode: string;

  schemaCode: string;

  value: any;

  operationType: OperationType;
}

export interface ModelRequireRuleContent {
  logicalOperator: LogicalOperator;

  binaryOperations: ModelRequireRuleBinaryOperation[];
}

export interface ModelRequireRuleResult {
  failedTip: string;

  // required: boolean

  nullable: boolean;

  propertyCode: string;

  schemaCode: string;
}

// 下拉选项规则
export interface ModelOptionRules {
  schemaCode: string;

  propertyCode: string;

  ruleDetails: ModelOptionRuleDetails[];
}

export interface ModelOptionRuleDetails {
  controlType: string;

  conditions: OptionRuleCondition[];

  options: any[];
}

export interface OptionRuleCondition {
  propertyCode: string;

  value: string;
}

export enum StaffPickerDefaultType {
  CreatedBy = '1',

  Owner = '2',

  CreatedDept = '3',

  OwnerDept = '4',
}

export interface ModelValidationRule {
  failedTip: string;

  handleType: ModelValidationHandleType;

  ruleType?: ModelValidationRuleType;

  max?: string;

  min?: string;

  minValueType?: 'FIX' | 'DYNAMIC';

  maxValueType?: 'FIX' | 'DYNAMIC';

  minDynamicValue?: {
    propertyCode: string;
    schemaCode: string;
  };

  maxDynamicValue?: {
    propertyCode: string;
    schemaCode: string;
  };

  regType?: {
    id: string;

    name: string;

    expression: string;
  };

  pwdRuleType?: Array<{
    id:
      | 'Letter'
      | 'Long'
      | 'Capitalize'
      | 'CapitalizeOrLowercase'
      | 'Number'
      | 'Symbol';
    name: string;
    regularContent: string;
    min?: string;
    max?: string;
  }>;

  jsRule?: {
    jsContent: string;
    methodName: string;
    param: string;
    jsValue: string;
  };
}

export interface ModelCalculationRule {
  bindProperty: {
    schemaCode: string;
    propertyCode: string;
  };

  expression: string;
}

export interface DomainSchemaBizRule {
  calculationRules: ModelCalculationRule[];

  validationRules: ModelValidation[];

  mandatoryRules: ModelMandatoryRule[];

  optionRules: ModelOptionRules[]; // 选项规则
}

export enum HttpMethod {
  Post = 'POST',

  Get = 'GET',

  Put = 'PUT',

  Delete = 'DELETE',
}

// export enum BizServiceParamDataType {
//   Int = 'INT',
//   Long = 'LONG',
//   Double = 'DOUBLE',
//   String = 'STRING',
//   Date = 'DATE',
//   Boolean = 'BOOLEAN',
//   Map = 'MAP',
// }

// export interface DomainBizService {
//   appCode: string;

//   applevel: string;

//   code: string;

//   description: string;

//   domainCode: string;

//   method: HttpMethod;

//   name: string;

//   requestPath: string;

//   returnDescription: string;

//   returnList: boolean;

//   returnPage: boolean;

//   returnType: BizServiceParamDataType;

//   parameters: DomainBizServiceParameter[];

//   isModelServer: boolean;
// }

// export interface ModelServiceInfo {
//   schemaCode: string;

//   serviceType: ModelStandardServiceType;

//   serviceList: ModelStandardService[];
// }

// export interface ModelStandardService {
//   triggerType: ModelServiceTriggerType;

//   serviceName: string;

//   code: string;

//   method: HttpMethod;

//   requestPath: string;

//   returnList: boolean;

//   returnPage: boolean;

//   returnType: BizServiceParamDataType;

//   parameters: DomainBizServiceParameter[];

//   mapStructure: DomainBizServiceParameterBase[];
// }

// export enum ModelStandardServiceType {
//   Standard = 'STANDARD_SERVICE',
// }

// export enum ModelServiceTriggerType {
//   Insert = 'INSERT',

//   Delete = 'DELETE',

//   List = 'LIST',

//   Update = 'UPDATE',

//   Get = 'GET',

//   Load = 'LOAD',
// }

// export enum BizServiceParamType {
//   Header = 'HEADER',

//   Query = 'QUERY',

//   Body = 'BODY',
// }

// export interface DomainBizServiceParameterBase {
//   description: string;

//   name: string;

//   paramDataType: BizServiceParamDataType;

//   paramList: boolean;

//   required: boolean;

//   /**
//    * paramDataType === MAP
//    */
//   mapStructure?: DomainBizServiceParameterBase[];
// }

// export interface DomainBizServiceParameter
//   extends DomainBizServiceParameterBase {
//   paramType: BizServiceParamType;
// }

export interface DomainSchema {
  bizSchemas: ModelSchemaInfo[];

  bizRule: DomainSchemaBizRule;

  relations: DomainSchemaRelation[];

  // bizServices: DomainBizService[];
}

export interface DomainSchemaRelation {
  bizType: ModelRelationBizType;

  relationType: ModelRelationType;

  source: DomainSchemaRelationSource;

  target: DomainSchemaRelationTarget;
}

export interface DomainSchemaRelationSource {
  appCode: string;

  domainCode: string;

  propertyCode: string;

  modelId: string;

  /**
   * 关联模型展示字段
   */
  displayProperty: string;

  // 显示字段的类型
  displayValueType: string;

  schemaCode: string;
}

export interface DomainSchemaRelationTarget extends DomainSchemaRelationSource {
  // bizGroupCode: string
}

export interface DomainModel {
  code: string;

  name: string;

  mainSchema: string;

  bizSchemas: ModelSchemaInfo[];

  bizRule: DomainSchemaBizRule;

  relations: DomainSchemaRelation[];

  // bizServices: DomainBizService[];

  // modelServices: ModelServiceInfo[];
}

export enum ModelRelationBizType {
  /**
   * 主从
   */
  MainChild = 'MAIN_CHILD',

  /**
   * 引用
   */
  Reference = 'REFERENCE',
}

export enum ModelRelationType {
  /**
   * 一对多
   */
  OneToMany = 'ONE_TO_MANY',

  /**
   * 一对一
   */
  OneToOne = 'ONE_TO_ONE',
}

export enum ModelBindServiceType {

  Create = 'create',

  Update = 'update',

  Get = 'get',

  Delete = 'delete',

  List = 'list',

  BatchDelete = 'batchDelete'

}

export interface ModelBindService {

  bindSchemaCode: string;

  bindServceCode: string;

  bindServiceName: string;

  bindServiceType: ModelBindServiceType;

  serviceType: 'INTEGRATE_SERVICE';

  category: string;

}

export interface ModelSchemaInfo extends ModelInfoBase {
  appCode: string;

  modelId: string;

  modelType: ModelSchemaType;

  code: string;

  icon: string;

  name: string;

  moduleCode: string;

  enabled: boolean;

  properties: ModelProperty[];

  $sub?: boolean;

  $ref?: boolean;

  $sourceSchema?: ModelSchemaInfo;

  /**
   * 引用模型的源属性
   */
  $sourceProperty?: ModelProperty;

  $displayPropertyCode?: string;

  /**
   * 关联表单多选
   */
  $multiple?: boolean;

  /**
   * 主键属性的code
   */
  primaryProperty: string;

  // 显示字段的类型
  displayValueType: string;

  /**
   * 模型绑定的服务，集成模型才有
   */
  bindServices?: ModelBindService[];
}

export enum ModelSchemaType {
  IntegationModel = 'INTEGRATION_MODEL',

  StandardModel = 'STANDARD_MODEL',
}

export interface ModelPropertyExtensions {
  /**
   * 值选项
   */
  valueRange: Array<{
    key: string;
    text: string;
  }>;

  /**
   * 单据号长度 默认为6
   */
  documentDefaultLength?: number;

  /**
   * 单据号重置类型
   */
  resetType: string;

  /**
   * 单据号前缀
   */
  prefix: string;

  /**
   * 单据号连接符号
   */
  documentDash: string;

  /**
   * 状态类型
   */
  docStatusType: Array<{
    key: string;
    text: string;
  }>;

  /**
   * 是否编辑
   */

  editable: boolean;
}

export interface ModelProperty {
  code: string;

  /**
   * 是否是系统属性
   */
  isSystemProperty: boolean;

  propertyId: string;

  name: string;

  defaultValue?: any;

  required: boolean;

  editable: boolean;

  // isPrimaryKey: boolean

  indexed: boolean;

  propertyLength: number;

  uiControl: string;

  isMultiSelect: boolean;

  subSchema?: ModelSchemaInfo;

  valueType: ModelPropertyValueType;

  description: string;

  format: string;

  referenceProperty?: ModelSchemaInfo;

  selfRefProperty?: ModelProperty;

  isTree?:boolean;

  dataSource?: ModelPropertyDataSource;

  extensions: ModelPropertyExtensions;
}

export enum AppGetType {
  /**
   * 查询UI，模型，流程全部元数据
   */
  All = 0,

  /**
   * 只查询模型
   */
  Model = 1,

  /**
   * 只查询流程
   */
  Flow = 2,

  /**
   * 只查询页面
   */
  Page = 3,
}

export enum AppGetOption {
  /**
   * 页面不返回前端页面元数据，模型不返回layout
   */
  Retrench = 0,

  /**
   * 返回完整数据
   */
  Full = 1,
}

export interface AppGetParams {
  appCode: string;

  type: AppGetType;

  option: AppGetOption;

  version?: string;
}

export interface AppServiceGetParams {

  appCode: string;

}
