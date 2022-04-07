import system from '@/store/modules/system';


export enum NodeType {
    Start = 'START',
    End = 'END',
    Message = 'MESSAGE',
    Create = 'CREATE',
    Update = 'UPDATE',
    Delete = 'DELETE',
    LogicVerify = 'LOGIC_VERIFY',
    BizAction = 'BIZ_ACTION',
    Assign = "ASSIGN",
    DataCheck = "DATA_CHECK",
    GetList = 'GET_LIST',
    DataVerify = 'DATA_VERIFY',
    ExistVerify = 'EXIST_VERIFY',
    // 定时作业
    Scheduler = 'SCHEDULER',
    SystemCreate = 'SYSTEM_CREATE',
    Load = 'LOAD',
    SystemDelete = 'SYSTEM_DELETE',
    SystemUpdate = 'SYSTEM_UPDATE',
    Cancel = 'CANCEL',
    // 流程生效
    Available = 'AVAILABLE',
    // 代码执行
    ExecuteCode = 'EXECUTE_CODE',
    // 自定义节点
    CustomNode = 'CUSTOM_NODE',

    VirtualNode = 'VIRTUAL'
}
// export  enum NodeType {
//     Start = 1,
//     End = 2,
//     Message = 3,
//     Create = 8,
//     Update = 7,
//     Delete = 6,
//     LogicVerify = 4,
//     BizAction = 9,
//     GetList = 10,
//     DataVerify = 5,
//     // 定时作业
//     Scheduler = 14,
// }

export enum BizRuleType  {
    // 数据操作
    DataOperation = 0,
    // 获取集合
    GetList = 1,
    // 定时作业
    RegularOperation = 2
}

export const systemNode = [NodeType.Start, NodeType.End, NodeType.GetList, NodeType.SystemCreate, NodeType.Load, NodeType.SystemDelete,NodeType.Cancel, NodeType.Available, NodeType.SystemUpdate, NodeType.VirtualNode]

export const propertyNode = [ NodeType.Start, NodeType.End, NodeType.SystemCreate, NodeType.Load, NodeType.SystemDelete,NodeType.Cancel, NodeType.Available, NodeType.SystemUpdate, NodeType.VirtualNode]