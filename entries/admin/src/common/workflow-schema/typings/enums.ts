/**
 * 节点类型
 */
export enum ActivityTypes {
  Start = 'START',
  End = 'END',
  User = 'PARTICIPANT',
  System = 'SYSTEM_ACTIVITY',
  SubInstance = 'SUB_INSTANCE',
  Connection = 'CONNECTION',
  Circulate = 'CIRCULATE',
}

/**
 * 消息通知类型
 */
export enum NotifyType {
  // 系统通知
  Default = 0,
  // 自定义通知
  Customerize = 1
}

/**
 * 参与者弹窗类型
 */
export enum ParticipantModalType {
  // 公式视图
  Function = 'FUNCTION',
  // 表达式视图
  Expression = 'EXPRESSION'
}

/**
 * 参与者类型
 */
export enum ParticipantType {
  // 单人
  Single = 'SINGLE_PARTICIPANT',
  // 多人
  Multiple = 'MULTI_PARTICIPANT'
}

/**
 * 审核下一个节点参与者
 */
export enum CheckNextNodeParticipant {
  // 参与者选择
  Participant = 'PARTICIPANT',
  // 组织机构选择
  Organization = 'ORGANIZATION'
}

/**
 * 参与方式
 */
export enum PraticipantMode {
  // 并行
  Parallel = 'PARALLEL',
  // 串行
  Serial = 'SERIAL',
}

/**
 * 无参与者时处理方式
 */
export enum NoParticipantHandler {
  // 转交管理员
  ToAdmin = 'TO_ADMIN',
  // 直接通过
  DirectApprove = 'APPROVE'
}

/**
 * 子表触发对象
 */
export enum TriggerObjMap {
  MainSheet = 0,
  ChildSheet = 1,
}
