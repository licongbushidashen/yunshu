/*
 * @Author: panwl
 * @Date: 2020-05-07 11:15:00
 * @LastEditTime: 2020-05-27 17:24:17
 * @LastEditors: Please set LastEditors
 * @Description: 业务模块导出声明
 * @FilePath: \frontend\entries\admin\src\views\system\log\biz-rule-info\biz-rule-info-typings.ts
 */

export interface IexecutState {
    code: string | boolean
    name: string
}

export enum Estate {
    Success = 'true',
    Fail = 'false',
    All = ''
}

/**
 * 日志执行状态
 */
export const executionStates: Array<IexecutState> = [
    { code: Estate.All, name: '全部' },
    { code: Estate.Success, name: '成功' },
    { code: Estate.Fail, name: '失败' }
]

interface Icolumn {
    dataIndex: string;
    slots: { title: string };
    scopedSlots: { customRender: string },
    width: number | string,
    key: string,
    align: string
}

enum Ealign {
    left = 'letf',
    center = 'center',
    rigth = 'rigth'
}

export const columns: Array<Icolumn> = [
    { dataIndex: 'index', slots: { title: 'indexTitle' }, scopedSlots: { customRender: 'index' }, width: 80, key: 'index', align: Ealign.center },
    { dataIndex: 'appName', slots: { title: 'appNameTitle' }, scopedSlots: { customRender: 'appName' }, width: '10%', key: 'appName', align: Ealign.left },
    { dataIndex: 'functionName', slots: { title: 'bizModelName' }, scopedSlots: { customRender: 'functionName' }, width: '10%', key: 'functionName', align: Ealign.left },
    { dataIndex: 'businessRuleName', slots: { title: 'bizRuleName' }, scopedSlots: { customRender: 'businessRuleName' }, width:'10%', key: 'businessRuleName', align: Ealign.left },
    { dataIndex: 'businessRuleCode', slots: { title: 'bizRuleCode' }, scopedSlots: { customRender: 'businessRuleCode' }, width: '10%', key: 'businessRuleCode', align: Ealign.left },
    { dataIndex: 'state', slots: { title: 'executState' }, scopedSlots: { customRender: 'state' }, width: 100, key: 'state', align: Ealign.left },
    { dataIndex: 'startTime', slots: { title: 'executStartDate' }, scopedSlots: { customRender: 'startTime' }, width: '15%', key: 'startTime', align: Ealign.left },
    { dataIndex: 'endTime', slots: { title: 'executEndDate' }, scopedSlots: { customRender: 'endTime' }, width: '15%', key: 'endTime', align: Ealign.left },
    { dataIndex: 'exceptionNodeName', slots: { title: 'exceptionNode' }, scopedSlots: { customRender: 'exceptionNodeName' }, width: '10%', key: 'exceptionNodeName', align: Ealign.center },
    { dataIndex: 'action', slots: { title: 'actionTitle' }, scopedSlots: { customRender: 'action' }, width: 80, key: 'action', align: Ealign.center }
]


