export interface Workitems {
  content: Array<Content>,
  totalElements: number,
  totalPages: number
}

export interface Content {
  activityCode: string,
  activityName: string,
  approval: string,
  finishTime: string,
  originator: string,
  originatorName: string,
  ownerId: string,
  ownerName: string,
  processingTime: string,
  receiveTime: string,
  state: string,
  stayTime: number,
  usedTime: number,
  workItemId: string,
  workItemName: string,
  workflowCode: string,
  workflowName?: string,
  workflowInstanceId: string,
  workflowInstanceName: string,
  workflowInstanceState: string,
  workItemTimeoutStatus?: string
}

export interface SearchParams {
  wd: string,
  appCode?: string,
  workflowName?: string,
  workflowCode?: string,
  originator?: string,
  //workflowTplName:{},
  unitType?: number | undefined,
  batchOperate?: boolean,//新增批量处理逻辑
  page: number,
  size: number
}

export interface WorkflowFolderParams {
  id: string
}

export interface SearchWorkflowParams {
  workflowName: string
  isMobile: boolean
  language?: string
}

export interface UserInfoSchema {
  id: string
}
export interface WorkflowParams {
  workflowCode: string,
  appCode?: string
}

export interface CirculateItemIds {
  circulateItemIds: Array<string>
}

// 发起流程应用数据
export interface WorkflowList {
  size: number,
  appName: string,
  dataList: Array<WorkflowContent>
}
// 流程列表数据
export interface WorkflowContent {
  code: string,
  name: string,
  id: string,
  type: string,
  favorites: boolean,
  size?: number
}
export interface OrgTreeParams {
  // 定义组织机构树请求参数结构
  deptId: string
}


export interface OrgNode {
  id: string,
  code: string,
  name: string,
  leaf: boolean,
  unitType: UnitType,
  parentId: string,
  sortKey: number,
  childrenUsers: number,
  managerId: string,
  employees: number,
  children: Array<OrgNode>
}

enum UnitType {
  Deaprtment = 1,
  Role = 2,
  User = 3,
}

export interface FinishedWorkItemParams {
  appCode?: string,
  workflowName: string,
  workflowCode: string,
  originator?: string,
  unitType?: string,
  instanceState?: string,
  startTime: string,
  endTime: string,
  page?: number,
  size?: number
}

export interface CommentParams {
  id: string
}

export interface GetCommentParams {
  page: number,
  size: number
}

export interface CreateCommentParams {
  content: string
}

export interface UpdateCommentParams {
  content: string,
  id: string,
  sortKey: number,
}

export interface participantParams {
  workflowInstanceId: string,
  circulateResource: string,
}

export interface trustParams {
  startTime: string,
  endTime: string,
  rangeType: string, // 流程范围
  trustType: string, // 委托类型
  trustee: string, // 被委托人id
  trusteeName: string, // 被委托人name
  trustor: string, // 委托人id
  trustorName: string, // 委托人name
  workflowTrusts?: Array<any> // 委托流程
}

export interface deleteTrustParams {
  workflowTrustRuleId?: any,
  workflowTrustRuleIds?: any
}

export interface deleteInstances {
  workflowInstanceIds?: any
}

export interface getTrustParams {
  trustor?: string,
  page: number,
  size: number,
}

export interface ListInstancesParams {
  workflowName: string,
  workflowCode: string,
  startTime: string,
  endTime: string,
  originator: string,
  unitType: string,
  page?: number,
  size?: number,
  instanceState?: string
}
