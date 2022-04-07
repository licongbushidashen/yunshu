import {typeF, typeFun} from './findTypes';

//转换
/* 1.按字段查找主管 (经理 0 主管 1) type 0
*  FindDepHeadByField({Originator.OU},'noSupervisor','initiator', '0')
* 2.按指定部门查找主管 type 1
* FindDepHeadByDep({StaffSelector1618222095345},'noSupervisor','initiator')
* 3.按角色查找人(不变) type 2
* FindUserByRole({StaffSelector1618222095345}, 'SYS210408043317803')
* 4.按组织查找人 type 3
* {StaffSelector1618222095345}
* 5.按直属主管查找人 type 4
* FindUsersByDirectSupervisor({StaffSelector1618222095345}, '2','noSupervisor','initiator')plainOptions
* */
export function convertExpress(list:any) {
    const dataList:any = list;
    const listExpress:any = [];
    if (Array.isArray(dataList) && dataList.length > 0) {
        dataList
            .filter((item: any) => item)
            .forEach((item: any) => {
                if (item.type === typeF.FindDepHeadByField) {
                    const manager = item.manager.selectValue;
                    const department = item.department.selectValue;
                    let value: any = '';
                    if (item.value === item.manager.value) {
                        value = manager;
                    } else if (item.value === item.department.value) {
                        value = department;
                    }
                    const _express: any = `{${value}}` + `,` + (item.checkedList[0] || null) + `,` + (item.checkedList[1] || null) + `,` + item.value;
                    const findFun: any = `${typeFun.FindDepHeadByField}(` + _express + `)`;
                    listExpress.push(findFun);
                } else if (item.type === typeF.FindDepHeadByDep) {
                    let value: any = null;
                    if (Array.isArray(item.manager) && item.manager.length > 0) {
                        value = item.manager.map((item: any) => {
                            return {
                                id: item.id,
                                type: item.type,
                                name: item.name,
                                email: item.email
                            }
                        });
                        value = JSON.stringify(value);
                    }
                    const _express: any = value + `,` + (item.checkedList[0] || null) + `,` + (item.checkedList[1] || null);
                    const findFun: any = `${typeFun.FindDepHeadByDep}(` + _express + `)`;
                    listExpress.push(findFun);
                } else if (item.type === typeF.FindUserByRole) {
                    let roleCode: string = '';
                    if (Array.isArray(item.role) && item.role.length > 0) {
                        roleCode = item.role[0].code;
                    } else if (item.role) {
                        roleCode = item.role
                    }
                    const _express = `{${item.manage}},"${roleCode}"`;
                    const findFun: any = `${typeFun.FindUserByRole}(` + _express + `)`;
                    listExpress.push(findFun);
                } else if (item.type === typeF.FindOrg) {
                    let value: any = '';
                    if (Array.isArray(item.org) && item.org.length > 0) {
                        value = item.org.map((item: any) => {
                            return {
                                id: item.id,
                                type: item.type,
                                name: item.name,
                                email: item.email
                            }
                        });
                        value = JSON.stringify(value);
                    } else {
                        listExpress.push([]);
                    }
                    const _express = value;
                    listExpress.push(_express);
                } else if (item.type === typeF.FindUsersByDirectSupervisor) {
                    const _express: any = `{${item.initiator}},${item.level},${(item.checkedList[0] || null)},${(item.checkedList[1] || null)}`;
                    const findFun: any = `${typeFun.FindUsersByDirectSupervisor}(` + _express + `)`;
                    listExpress.push(findFun);
                }
            });
    }
    console.log(listExpress, 'listExpress');
    return listExpress;
}

// 表达式转换为数组
export function convertList(express:any) {
    if (!express) {
        return [];
    }
    const list:any = express.split('+');
    console.log(list, 'list');
    const dataList:any = [];
    list.forEach((item:any) => {
        const arrMatch: any = item.match(/^([a-zA-Z]+)\((.+?)\)$/);
        if (item.indexOf(typeFun.FindUserByRole) > -1) {
            const arrList = arrMatch[2].split(',');
            const role:any = arrList[1].replace(/"/g, '');
            const manage:any = arrList[0].replace(/[{}]/g, '');
            const inner:any =  {
                type: typeF.FindUserByRole,
                manage,
                role,
            };
            dataList.push(inner);
        }
        else if (item.indexOf(typeFun.FindDepHeadByField) > -1) {
            const arrList = arrMatch[2].split(',').filter((item:any) => item);
            const funValue:any = arrList[0].replace(/[{}]/g, '');
            // 数字
            const valueType:any = arrList.find((item:any) => {
                if (parseFloat(item).toString() !== 'NaN') {
                    return item;
                }
            }) || NaN;
            const type = valueType ? Number(valueType) : '';
            const checkedList:any[] = arrList.filter((item:any) => {
                if (parseFloat(item).toString() === 'NaN' && item.indexOf('{') < 0) {
                    return item;
                }
            });
            const inner:any =  {
                type: typeF.FindDepHeadByField,
                value: type,
                manager: {
                    value: 0,
                    selectValue: type === 0 ? funValue : ''
                },
                department: {
                    value: 1,
                    selectValue: type === 1 ? funValue : ''
                },
                checkedList,
            };
            dataList.push(inner);
        }
        else if (item.indexOf(typeFun.FindDepHeadByDep) > -1) {
            // 根据'['来截取第一个参数 为选人控件
            const first:any = item.lastIndexOf("[") + 1;
            const last:any = item.lastIndexOf("]");
            const Inner:any = item.substring(first, last);
            let json:any;
            let depList:any = [];
            try {
                json = (new Function("return " + Inner))();
            } catch {
                throw new Error('转换错误');
            }
            if (json) {
                depList = [json];
            }
            // 根据'], )'来截取后面的参数
            const lastOther:any = item.lastIndexOf(")");
            const arr: any = item.substring(last + 1, lastOther);
            const arrList = arr.split(',').filter((item:any) => item);
            const checkedList:any[] = arrList.filter((item:any) => {
                if(item.indexOf('{') < 0) {
                    return item;
                }
            });
            const inner:any = {
                type: typeF.FindDepHeadByDep,
                manager: depList,
                checkedList,
            };
            dataList.push(inner);
        }
        else if (item.indexOf(typeFun.FindUsersByDirectSupervisor) > -1) {
            const arrList = arrMatch[2].split(',').filter((item:any) => item);
            const initiator:any = arrList[0].replace(/[{}]/g, '') || '';
            // 数字
            const level:any = arrList.find((item:any) => {
                if (parseFloat(item).toString() !== 'NaN') {
                    return item;
                }
            }) || null ;
            const checkedList:any = arrList.filter((item:any) => {
                if (parseFloat(item).toString() === 'NaN' && item.indexOf('{') < 0) {
                    return item;
                }
            }) || [];
            const inner:any = {
                type: typeF.FindUsersByDirectSupervisor,
                initiator,
                level,
                checkedList,
            };
            dataList.push(inner);
        }
        else {
            if (item) {
                const inner:any = {
                    type: typeF.FindOrg,
                    org: JSON.parse(item),
                };
                dataList.push(inner);
            }
        }
    });

    return dataList;
}
