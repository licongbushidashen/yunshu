/**
 * 流程行为状态
 */
export const workflowActionStatus: { [key: string]: string } = {
  '0': 'Submit',
  '1': 'Submits',
  '2': 'Cancel',
  '3': 'Agree',
  '4': 'DisAgree',
  '5': 'AdjustParticipant',
  '6': 'Assist',
  '7': 'Forward',
  '8': 'Reject',
  '9': 'FinishInstance',
  '10': 'UnRead',
  '11': 'Read',
  '14': 'BeCanceled', // 后端标记为‘Revoke撤回’，前端显示为‘BeCanceled被取消’
  '15': 'AutoCanceled', // 多人并行节点同意或驳回其他任务显示为‘自动取消’
  '16': 'Circularize',
  '99': 'Empty',
  '18': 'ActivateActivity',
  '19': 'ADJUST_PARTICIPANT',
  '20': 'CANCELED_ACTIVITY_WORKITEM',
  '17': 'MODIFY_OWNER',
};
/**
 * 流程任务状态
 */
export const workItemStatus: { [key: string]: string } = {
  '1': 'NotStarted',
  '2': 'Processing',
  '3': 'Completed',
  '4': 'Canceled',
  '5': 'Draft',
  '6': 'BeCanceled', // 后端标记为‘Revoke撤回’，前端显示为‘BeCanceled被取消’
};
/**
 * 子流程任务状态
 */
export const subWorkItemStatus: { [key: string]: string } = {
  '0': 'NotStarted',
  '1': 'Processing',
  '2': 'Completed',
  '3': 'Canceled',
  '4': 'Exception',
  '6': 'BeCanceled', // 后端标记为‘Revoke撤回’，前端显示为‘BeCanceled被取消’
};
/**
 * 流程的节点状态
 */
export const workflowNode: { [key: string]: string } = {
  '0': '已办节点',
  '1': '进行中节点',
  '2': '异常节点',
};

/**
 * 流程状态
 */
export enum WorkflowState {
  DRAFT = 'Draft',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled',
  EXCEPTION = 'Exception'
}

//@workflowActionClassName: gray, green, blue, red;
/**
 * 流程行为样式
 */
export enum WorkflowAction {
  DRAFT = 'gray',
  PROCESSING = 'green',
  COMPLETED = 'blue',
  CANCELED = 'red'
}

/**
 * 参与者的类型
 */
export enum WorkflowParticipantType  {
  MORMAL = 0,
  FORWARD = 1,
  ASSIST = 2,
  ADD_WORKITEM = 3,
  CIRCULATE_ITEM = 4
}
