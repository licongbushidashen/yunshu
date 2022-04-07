import { workflow }  from '@cloudpivot/api';

export interface ChartCardOptions {
  data?: workflow.WorkflowTrackLog | any// 流程跟踪日志纪律
  rect?: DOMRect// 需要定位元素的Rect,
  cardType?: string // 弹框类型
  title?:string// 弹框名称
}
