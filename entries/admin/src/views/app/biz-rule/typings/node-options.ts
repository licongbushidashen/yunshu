import { update } from '@/apis/data-rule'
import { BizRuleType } from './node-type';
export interface NodeOptions {
    [key: string]: any
}

export interface MessageReceiver {
    departments: Array<any>
    users: any[] 
    roles: any[] 
    selections: any[]
}

export enum RuleTriggerType {
    Create = 'CREATE',
    Update = 'UPDATE',
    Delete = 'DELETE'
}
export class BaseNodeOptions implements NodeOptions {
    // name: string = ''
    // code: string = ''
}
export class DataNode extends BaseNodeOptions {
    // 触发模型
    triggerObjectCode: string = ''

    // 子表触发条件
    childTriggerConditionType: any | null = null

    // 数据条件 
    dataCondition: any | null = null

    // 目标模型编码
    targetSchema: string = ''

    // 目标对象编码
    targetObjectCode: string = ''

    // 过滤条件
    filterCondition: any | null = null

}

/**
 * 消息节点
 */
export class NodeMessage extends BaseNodeOptions{
    // 接收人
    receiver: MessageReceiver | null = null
    // 标题
    title: string = ''
    // 内容
    content: string = ''

    // 默认表单链接
    linkType: string = 'FORM_LINKS'

    url:string = ''

    //表单编码--code
    sheetCode:string = ''

    isLogic:boolean = false
}

/**
 * 创建节点
 */
export class NodeCreate extends DataNode {
    // 触发动作
    dataTriggerType: RuleTriggerType = RuleTriggerType.Create
    // 数据动作
    createDataAction: null | any = null

    isLogic:boolean = false
}
/**
 * 更新节点
 */
export class NodeUpdate extends DataNode {
    // 触发动作
    dataTriggerType: RuleTriggerType = RuleTriggerType.Update

    dataActions: null | any = null

    isLogic:boolean = false
}
/**
 * 删除节点
 */
export class NodeDelete extends DataNode {
    dataTriggerType: RuleTriggerType = RuleTriggerType.Delete
    isLogic:boolean = false
}
/**
 * 逻辑校验节点
 */
export class NodeLogicVerify extends BaseNodeOptions {
    // 验证模型编码
    verifySchemaCode: string = ''

    // 目标模型
    targetSchema: string = ''

    // 判断条件
    judgeCondition: any | null = null

    // 验证条件
    verifyConditions: any | null = null

    isLogic:boolean = true

}
/**
 * 业务动作节点
 */
export class NodeBizAction extends BaseNodeOptions {
    // 执行条件
    execCondition: any | null = null

    // 业务方法

    methodMapping: any | null = null

}
/**
 * 获取数据节点
 */
export class NodeGetList extends BaseNodeOptions {
}

export class NodeDataVerify extends BaseNodeOptions {

    verifyExpression:any | null = ''

    isLogic:boolean = true
}

export class DataOperation {
    id:string = ''
    name: string = ''
    code: string = ''
    bizRuleType: BizRuleType = BizRuleType.DataOperation
}

export class RegularOperation {
    id:string = ''
    name: string = ''
    code: string = ''
    bizRuleType: BizRuleType = BizRuleType.RegularOperation
    // 定时作业设置
    schedulerSetting:string = ''
}