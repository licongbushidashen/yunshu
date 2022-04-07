

import * as WorkflowCenter from '@cloudpivot/list/src/typings/workflow-center';

import common from '@cloudpivot/common';

import moment from "moment";

import { dateFormatter } from '@cloudpivot/form/src/renderer/utils';
import * as numberFormatter1 from "@cloudpivot/form/utils/number-formatter";

const DateHandle = common.utils.DateHandle;

const GetDateHandle = common.utils.GetDateHandle;

export const timeTranslate = (time:number) => {
  const _t:any = DateHandle.msecToTimeSpan(time);

  let str:string = '';

  if (time === 0) return '1分钟';

  const _day:string = `${_t.day === 0 ? '' : `${Math.abs(_t.day)}天`}`;

  let _hour:string = `${Math.abs(_t.hour)}时`;
  if (_t.day === 0 && _t.hour === 0) {
    _hour = '';
  }

  const _minute = `${_t.minute === 0 ? 1 : Math.abs(_t.minute)}分钟`;

  str = `${_day}${_hour}${_minute}`;

  return str;
};

/*
  * 动态计算表格最大高度以设置表头固定
  * @params config: vm 当前组件实例
  * @params config: type 当前是哪个组件
*/
export const setTableMaxHeight = (config:WorkflowCenter.TableHeaderFix) => {
  const vm = config.vm;
  const dom = vm.$refs.workItem as HTMLElement;
  let scrollY:number = 0;
  let _h:number = 0; // 需要减去的高度 默认值为头部title的高度
  const type = config.type;
  if (!type) return 0;
  switch (type) {
    case 'onlyTable': // 只有表格
      _h += 114;
      break;
    case 'hasBtns': // 表格上方操作按钮
      _h += 164;
      break;
    case 'hasFilters': // 带有过滤条件
      _h += 162;
      break;
    case 'hasTabsAndFilters':
      _h += 208;
      break;
    default: break;
  }

  vm.$nextTick(() => {
    if (vm.isShowPagination) {
      scrollY = dom.clientHeight - (_h + 50);
    } else {
      scrollY = dom.clientHeight - _h;
    }
    vm.scrollY = scrollY;
  });
};

/**
 * 处理结果转换
*/

export const ApprovalTranslator = (state:number) => {
  if (!state) return;
  switch (state) {
    case WorkflowCenter.ApprovalState.AGREE:
      return '同意';
    case WorkflowCenter.ApprovalState.REJECT:
      return '驳回';
    case WorkflowCenter.ApprovalState.FORWARD:
      return '转办';
    case WorkflowCenter.ApprovalState.CANCELLED:
      return '被取消';
    case WorkflowCenter.ApprovalState.UNDO:
      return '未处理';
  }
};


/**
 * 流程状态转换
*/
export const workflowStateTranslator = (state:string) => {
  if (!state) return;
  switch (state) {
    case WorkflowCenter.WorkflowInstanceState.DRAFT:
      return '草稿';
    case WorkflowCenter.WorkflowInstanceState.PROCESSING:
      return '进行中';
    case WorkflowCenter.WorkflowInstanceState.COMPLETED:
      return '已完成';
    case WorkflowCenter.WorkflowInstanceState.CANCELED:
      return '已作废';
  }
};

/**
 * 去除后台传值的秒
*/
export const removeSeconds = (time:string) => {
  if (!time) return '';
  if (typeof time === 'string') {
    return time.substring(0, time.lastIndexOf(':'));
  } else if (typeof time === 'number') {
    const timeStr:string = new Date(time).toISOString().replace('T',' ');
    return timeStr.substring(0, timeStr.lastIndexOf(':'));
  } else {
    return ''
  }
};

export const numberTypeName = [
  {
    text: 'none',
    type: 0
  },
  {
    text: 'integer',
    type: 1
  },
  {
    text: 'tenths',
    type: 2
  },
  {
    text: 'percentile',
    type: 3
  },
  {
    text: 'Millimeter',
    type: 11
  },
  {
    text: 'tenThousand',
    type: 12
  },
  {
    text: 'hundredThousand',
    type: 23
  },
  {
    text: 'millionDecimals',
    type: 24
  },
  {
    text: 'tenMillionDecimals',
    type: 25
  },
  {
    text: 'billionDecimals',
    type: 26
  },
  {
    text: 'ratio',
    type: 4
  },
  {
    text: 'ratio.tenths',
    type: 5
  },
  {
    text: 'ratio.percentile',
    type: 6
  },
  {
    text: 'ratio.Millimeter',
    type: 13
  },
  {
    text: 'ratio.tenThousand',
    type: 14
  },
  {
    text: 'ratio.hundredThousand',
    type: 27
  },
  {
    text: 'ratio.millionDecimals',
    type: 28
  },
  {
    text: 'ratio.tenMillionDecimals',
    type: 29
  },
  {
    text: 'ratio.billionDecimals',
    type: 30
  },
  {
    text: 'RMB.percentile',
    type: 7
  },
  {
    text: 'RMB.Millimeter',
    type: 15
  },
  {
    text: 'RMB.tenThousand',
    type: 16
  },
  {
    text: 'RMB.hundredThousand',
    type: 31
  },
  {
    text: 'RMB.millionDecimals',
    type: 32
  },
  {
    text: 'RMB.tenMillionDecimals',
    type: 33
  },
  {
    text: 'RMB.billionDecimals',
    type: 34
  },
  {
    text: 'dollar.percentile',
    type: 8
  },
  {
    text: 'dollar.Millimeter',
    type: 17
  },
  {
    text: 'dollar.tenThousand',
    type: 18
  },
  {
    text: 'dollar.hundredThousand',
    type: 35
  },
  {
    text: 'dollar.millionDecimals',
    type: 36
  },
  {
    text: 'dollar.tenMillionDecimals',
    type: 37
  },
  {
    text: 'dollar.billionDecimals',
    type: 38
  },
  {
    text: 'euro.percentile',
    type: 9
  },
  {
    text: 'euro.Millimeter',
    type: 19
  },
  {
    text: 'euro.tenThousand',
    type: 20
  },
  {
    text: 'euro.hundredThousand',
    type: 39
  },
  {
    text: 'euro.millionDecimals',
    type: 40
  },
  {
    text: 'euro.tenMillionDecimals',
    type: 41
  },
  {
    text: 'euro.billionDecimals',
    type: 42
  },
  {
    text: 'HK.percentile',
    type: 10
  },
  {
    text: 'HK.Millimeter',
    type: 21
  },
  {
    text: 'HK.tenThousand',
    type: 22
  },
  {
    text: 'HK.hundredThousand',
    type: 43
  },
  {
    text: 'HK.millionDecimals',
    type: 44
  },
  {
    text: 'HK.tenMillionDecimals',
    type: 45
  },
  {
    text: 'HK.billionDecimals',
    type: 46
  }
];

/**
 * 部门最多显示三级 部门1/部门2/部门3/部门4 =>部门1/部门2/.../部门4
 * 一级 部门1
*/

export const departmentNameTranslator = (departmentName:string) => {
  if (!departmentName) return;

  if (departmentName.indexOf('/') === -1) return departmentName;

  const departmentArr:Array<string> = departmentName.split('/');
  if (departmentArr.length > 3) {
    return `${departmentArr[0]}/.../${departmentArr[departmentArr.length - 2]}/${departmentArr[departmentArr.length - 1]}`;
  }

  return departmentName;
};

export function numberToDisplayModel(value:any, column:any) {
  const arr = numberTypeName.filter(i => i.text === column);
  if(arr && arr[0]){
    return numberToDisplay(value,{displayFormat:arr[0].type})
  }
  return false
}

 /*
  * 数值数据项展示格式处理
  */
 export function numberToDisplay(value:any, column:any) {
  let result:any = value;
  switch (column.displayFormat) {
    case 0:
      break;
    case 1:
      result = parseInt(result, 10).toLocaleString();
      break;
    case 2:
      result = addZero(Number(result.toFixed(2).slice(0,-1)).toLocaleString(), 1);
      break;
    case 3:
      result = addZero(Number(result.toFixed(3).slice(0,-1)).toLocaleString(), 2);
      break;
    case 4:
      result = `${parseInt(`${result}`, 10)}%`;
      break;
    case 5:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 1,
      });
      break;
    case 6:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 2,
      });
      break;
    case 7:
      result = `￥${addZero(Number(result.toFixed(3).slice(0,-1)).toLocaleString(), 2)}`;
      break;
    case 8:
      result = `$${addZero(Number(result.toFixed(3).slice(0,-1)).toLocaleString(), 2)}`;
      break;
    case 9:
      result = `€${addZero(Number(result.toFixed(3).slice(0,-1)).toLocaleString(), 2)}`;
      break;
    case 10:
      result = `HK$${addZero(Number(result.toFixed(3).slice(0,-1)).toLocaleString(), 2)}`;
      break;
    case 11:
      result = addZero(numberFormatter(result.toFixed(4).slice(0,-1)), 3);
      break;
    case 12:
      result = addZero(numberFormatter(result.toFixed(5).slice(0,-1)), 4);
      break;
    case 13:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 3,
      });
      break;
    case 14:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 4,
      });
      break;
    case 15:
      result = `￥${addZero(numberFormatter(result.toFixed(4).slice(0,-1)), 3)}`;
      break;
    case 16:
      result = `￥${addZero(numberFormatter(result.toFixed(5).slice(0,-1)), 4)}`;
      break;
    case 17:
      result = `$${addZero(numberFormatter(result.toFixed(4).slice(0,-1)), 3)}`;
      break;
    case 18:
      result = `$${addZero(numberFormatter(result.toFixed(5).slice(0,-1)), 4)}`;
      break;
    case 19:
      result = `€${addZero(numberFormatter(result.toFixed(4).slice(0,-1)), 3)}`;
      break;
    case 20:
      result = `€${addZero(numberFormatter(result.toFixed(5).slice(0,-1)), 4)}`;
      break;
    case 21:
      result = `HK$${addZero(numberFormatter(result.toFixed(4).slice(0,-1)), 3)}`;
      break;
    case 22:
      result = `HK$${addZero(numberFormatter(result.toFixed(5).slice(0,-1)), 4)}`;
      break;
    case 23:
      result = addZero(numberFormatter(result.toFixed(6).slice(0,-1)), 5);
      break;
    case 24:
      result = addZero(numberFormatter(result.toFixed(7).slice(0,-1)), 6);
      break;
    case 25:
      result = addZero(numberFormatter(result.toFixed(8).slice(0,-1)), 7);
      break;
    case 26:
      result = addZero(numberFormatter(result.toFixed(9).slice(0,-1)), 8);
      break;
    case 27:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 5,
      });
      break;
    case 28:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 6,
      });
      break;
    case 29:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 7,
      });
      break;
    case 30:
      result = numberFormatter1.ratio.formatter(result*100, {
        precision: 8,
      });
      break;
    case 31:
      result = `￥${addZero(numberFormatter(result.toFixed(6).slice(0,-1)), 5)}`;
      break;
    case 32:
      result = `￥${addZero(numberFormatter(result.toFixed(7).slice(0,-1)), 6)}`;
      break;
    case 33:
      result = `￥${addZero(numberFormatter(result.toFixed(8).slice(0,-1)), 7)}`;
      break;
    case 34:
      result = `￥${addZero(numberFormatter(result.toFixed(9).slice(0,-1)), 8)}`;
      break;
    case 35:
      result = `$${addZero(numberFormatter(result.toFixed(5).slice(0,-1)), 5)}`;
      break;
    case 36:
      result = `$${addZero(numberFormatter(result.toFixed(7).slice(0,-1)), 6)}`;
      break;
    case 37:
      result = `$${addZero(numberFormatter(result.toFixed(8).slice(0,-1)), 7)}`;
      break;
    case 38:
      result = `$${addZero(numberFormatter(result.toFixed(9).slice(0,-1)), 8)}`;
      break;
    case 39:
      result = `€${addZero(numberFormatter(result.toFixed(6).slice(0,-1)), 5)}`;
      break;
    case 40:
      result = `€${addZero(numberFormatter(result.toFixed(7).slice(0,-1)), 6)}`;
      break;
    case 41:
      result = `€${addZero(numberFormatter(result.toFixed(8).slice(0,-1)), 7)}`;
      break;
    case 42:
      result = `€${addZero(numberFormatter(result.toFixed(9).slice(0,-1)), 8)}`;
      break;
    case 43:
      result = `HK$${addZero(numberFormatter(result.toFixed(6).slice(0,-1)), 5)}`;
      break;
    case 44:
      result = `HK$${addZero(numberFormatter(result.toFixed(7).slice(0,-1)), 6)}`;
      break;
    case 45:
      result = `HK$${addZero(numberFormatter(result.toFixed(8).slice(0,-1)), 7)}`;
      break;
    case 46:
      result = `HK$${addZero(numberFormatter(result.toFixed(9).slice(0,-1)), 8)}`;
      break;
    default:
      break;
  }
  return result;
}

/*
* 数值格式化（转为1,234,567.89格式）
*/
export function numberFormatter(str: string) {
  const sList = str.split('.');
  if (sList.length === 1) {
    str = sList[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    str = `${sList[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${sList[1]}`
  }
  return str;
}

/*
* 小数点后补0函数
*/
export function addZero(str:string, num:number) {
  if (str.indexOf('.') === -1) {
    let zero:string = '';
    for (var i = 0; i < num; i++) {
      zero += '0';
    }
    return `${str}.${zero}`;
  } else {
    const numLength = str.split('.')[1].length;
    if (numLength < num) {
      let zero:string = '';
      for (var i = 0; i < num - numLength; i++) {
        zero += '0';
      }
      return `${str}${zero}`;
    }
    return str;
  }
}

/*
* 时间dateType格式化
*/
export function setDateByDateType(type: any,format: string) {
  let start: string = "";
  let end: string = "";
  let date: Array<string> = [];
  switch (type) {
    /* 最近一周 */
    case 1:
      start = dateFormatter(moment(GetDateHandle.getLatelyWeek()).startOf('days').toString(), format);
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 最近一月 */
    case 2:
      start = dateFormatter(moment(GetDateHandle.getLatelyMonth()).startOf('days').toString(), format);
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 最近一季度 */
    case 3:
      start = dateFormatter(moment(GetDateHandle.getLatelyQuarter()).startOf('days').toString(), format);
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 最近一年 */
    case 4:
      start = dateFormatter(moment(GetDateHandle.getLatelyYear()).startOf('days').toString(), format);
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 本周 */
    case 5:
      date = GetDateHandle.getThisWeek();
      start = date[0];
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 本月 */
    case 6:
      date = GetDateHandle.getThisMonth();
      start = date[0];
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 本季度 */
    case 7:
      date = GetDateHandle.getThisQuarter();
      start = date[0];
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 本年 */
    case 8:
      date = GetDateHandle.getThisYear();
      start = date[0];
      end = dateFormatter(moment().endOf('days').toString(),format);
      break;
    /* 当天 */
    case 9:
      start = dateFormatter(moment().toString(),format);
      end = start;
      break;
    /* 默认值 */
    default:
      break;
  }
  return [start, end];
}
