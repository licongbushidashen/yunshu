/*
 * @Author: your name
 * @Date: 2020-04-07 18:21:58
 * @LastEditTime: 2020-05-07 16:07:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\api\src\system-manage-params.ts
 */

export interface Page {
  page: number
  size: number
}

export interface ListBizRuleLog extends Page {
  schemaCode: string // 模型编码
  ruleName: string
  startTime: string
  endTime: string
  status: string
}

/**
 * 业务规则运行日志列表查询参数
 */
export interface IbusinessRuleLogResParams extends Page {
  /**模型编码 */
  schemaCode: string;
  /**业务规则名称 */
  businessRuleName: string;
  /**执行状态 */
  success: string | boolean;
  /**开始时间 */
  startTime: string;
  /**结束时间 */
  endTime: string;
  /**业务规则编码 */
  businessRuleCode?: string;
  /**业务规则实例id */
  flowInstanceId?: string;
  /**操作人id */
  originator?: string;
}