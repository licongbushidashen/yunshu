import Decimal, { Numeric } from 'decimal.js-light';
import toString from 'lodash/toString';
import uniq from 'lodash/uniq';
import { Formula } from './type';
import { generateError, ParserError } from './error';

// 精度为8 舍入方式为四舍五入  //https://my.oschina.net/sunchp/blog/670909
Decimal.config({ precision: 23, rounding: Decimal.ROUND_HALF_UP });

export function toDecimal (value: Numeric) {
  try {
    return new Decimal(value);
  } catch (e) {
    throw generateError('转换数字时发生错误', {
      extraMessage: e.message,
    });
  }
}

export function validDigitCheck (value: string) {
  const valid = /^[0-9]{1,15}([.][0-9]{0,8})?$/;
  return valid.test(value);
}

export const paramTypeValues = {
  [Formula.ParamType.TEXT]: '单行文本',
  [Formula.ParamType.NUMBER]: '数值',
  [Formula.ParamType.DATE]: '日期',
  [Formula.ParamType.BOOL]: '逻辑',
  [Formula.ParamType.ADDRESS]: '地址',
  [Formula.ParamType.Radio]: '单选框',
  [Formula.ParamType.Checkbox]: '复选框',
  [Formula.ParamType.Dropdown]: '下拉单选框',
  [Formula.ParamType.DropdownMulti]: '下拉多选框',
  [Formula.ParamType.STAFFSINGLE]: '人员单选',
  [Formula.ParamType.STAFFMULTI]: '人员多选',
  [Formula.ParamType.DEPTSINGLE]: '部门单选',
  [Formula.ParamType.DEPTMULTI]: '部门多选',
  [Formula.ParamType.STAFFDEPTMIX]: '混合选人控件',
  [Formula.ParamType.ANY]: '不限',
};

export function getParamTypeValue (key: Formula.ParamType) {
  return paramTypeValues[key] || '未知';
}

export const fieldTypeValues = {
  [Formula.FieldType.BASIC]: '基本',
  [Formula.FieldType.SUBLIST]: '明细表',
  [Formula.FieldType.RELEVANCE]: '关联数据',
};

export function getFieldTypeValue (key: Formula.FieldType) {
  return fieldTypeValues[key] || '未知';
}

export function checkParamType (claimType: Formula.ParamType, incomingType: Formula.ParamType) {
  if (claimType === Formula.ParamType.ANY) {
    return true;
  }
  return claimType === incomingType;
}

export function checkSourceType (claimType: Formula.SourceType, incomingType: Formula.SourceType) {
  if (claimType === Formula.SourceType.ANY) {
    return true;
  }
  return claimType === incomingType;
}

export function checkParam (claim: Formula.Param, incoming: Formula.Param) {
  const paramType = checkParamType(claim.paramType as Formula.ParamType,
    incoming.paramType as Formula.ParamType);
  const sourceType = checkSourceType(claim.sourceType, incoming.sourceType);

  const paramTypeInfo = paramType ? ['', ''] : [
    `类型：${getParamTypeValue(claim.paramType as Formula.ParamType)}`,
    `类型：${getParamTypeValue(incoming.paramType as Formula.ParamType)}`,
  ];
  const sourceTypeInfo = sourceType ? ['', ''] : [
    '来源：字段',
    '来源：非字段',
  ];

  return {
    paramType,
    paramTypeInfo,
    sourceType,
    sourceTypeInfo,
  };
}

export function checkContainsParam (claim: Formula.Param, incoming: Formula.Param) {
  const paramType = ["text", "radio", "checkbox", "dropdown", "dropdownmulti"].indexOf(incoming.paramType) > -1;
  const sourceType = checkSourceType(claim.sourceType, incoming.sourceType);

  const paramTypeInfo = paramType ? ['', ''] : [
    `类型：文本、单选框、复选框、下拉单选框、下拉多选框`,
    `类型：${getParamTypeValue(incoming.paramType as Formula.ParamType)}`,
  ];
  const sourceTypeInfo = sourceType ? ['', ''] : [
    '来源：字段',
    '来源：非字段',
  ];

  return {
    paramType,
    paramTypeInfo,
    sourceType,
    sourceTypeInfo,
  };
}

export function checkDateString (claim: Formula.Param, incoming: Formula.Param) {
  const paramType = ["text", "date"].indexOf(incoming.paramType) > -1;
  const sourceType = checkSourceType(claim.sourceType, incoming.sourceType);

  const paramTypeInfo = paramType ? ['', ''] : [
    `类型：文本、日期`,
    `类型：${getParamTypeValue(incoming.paramType as Formula.ParamType)}`,
  ];
  const sourceTypeInfo = sourceType ? ['', ''] : [
    '来源：字段',
    '来源：非字段',
  ];

  return {
    paramType,
    paramTypeInfo,
    sourceType,
    sourceTypeInfo,
  };
}

// 请保证传入都是明细表字段
export function validateSubFromSame (params: Formula.FieldParam[]) {
  return uniq(params.map(param => {
    const [parId] = param.id.split('.');
    return parId;
  })).length === 1;
}

export const extraRelevanceFuncs = ['LOOKUP', 'ROLLUP']; // 'SUMIFS',

export function checkFieldParamFromRelevance (identifier:Formula.Identifier, params:Formula.Param[]) {
  const _params = params.filter(param => param.sourceType === Formula.SourceType.FIELD &&
     (param as Formula.FieldParam).fieldType === Formula.FieldType.RELEVANCE);
  if (_params.length > 0 && !extraRelevanceFuncs.includes(identifier.name)) {
    throw generateError(`关联数据字段${
      _params.map(_param => getFieldName(_param)).join(', ')
    }只允许在函数 ${
      extraRelevanceFuncs.map(func => `${func}()`).join('，')
    }中使用，不允许在${
      identifier.type === Formula.IdentifierType.FUNC ? `函数 ${identifier.name}() 中` : `操作符 "${identifier.name}" `
    }使用`);
  }
}

export const extraSublistFuncs = ['SUM', 'AVG', 'MIN', 'MAX']; // 'SUMIFS',

export function checkFieldParamFromSublist (identifier:Formula.Identifier, params:Formula.Param[]) {
  const _params = params.filter(param => param.sourceType === Formula.SourceType.FIELD &&
     (param as Formula.FieldParam).fieldType === Formula.FieldType.SUBLIST);
  if (_params.length > 0 && !extraSublistFuncs.includes(identifier.name)) {
    throw generateError(`明细表字段${
      _params.map(_param => getFieldName(_param)).join(', ')
    }只允许在函数 ${
      extraSublistFuncs.map(func => `${func}()`).join('，')
    }中使用，不允许在${
      identifier.type === Formula.IdentifierType.FUNC ? `函数 ${identifier.name}() 中` : `操作符 "${identifier.name}" `
    }使用`);
  }
}

export function validateParamNull (param: Formula.Param) {
  const { value } = param;
  const _value = trimValue(value);
  return _value === '' || _value === null || _value === undefined;
}

export function validateSubParamNull (param: Formula.Param) {
  const { value } = param;
  return !value || !value.length;
}

export function trimValue (value: any) {
  return typeof value === 'string' ? value.trim() : value;
}

export function toText (param: Formula.Param) {
  const { value, paramType } = param;
  let _value = value;
  switch (paramType) {
    case Formula.ParamType.BOOL:
      _value = typeof value !== 'boolean' ? '' : (value ? '是' : '否');
      break;
    case Formula.ParamType.NUMBER:
      _value = value instanceof Decimal ? value.toString() : toString(value);
      break;
    case Formula.ParamType.DATE:
    case Formula.ParamType.TEXT:
      break;
  }
  _value = _value || ''; // 空值转成空字符串
  return {
    ...param,
    value: _value,
  };
}

export function formatParamValue (param: Formula.Param) {
  const { value, paramType } = param;
  let _value = value;
  switch (paramType) {
    case Formula.ParamType.DATE:
      _value = trimValue(value);
      break;
    case Formula.ParamType.BOOL:
      _value = typeof value === 'boolean' ? value : null;
      break;
    case Formula.ParamType.NUMBER:
      // 判定是否能转成数字
      if (isNaN(value)) {
        throw generateError(`存在字段${getFieldName(param)}无法转成数字类型`);
      }
      const unary = param.unary || 1;
      _value = toDecimal(value).mul(unary);
      break;
    case Formula.ParamType.TEXT:
      _value = toString(value).trim();
      break;
  }
  return {
    ...param,
    value: _value,
  };
}

export function paramDefaultValue (paramType: Formula.ParamType) {
  switch (paramType) {
    case Formula.ParamType.DATE:
      // return '1900-01-01 00:00:00';
      return '';
    case Formula.ParamType.BOOL:
      return false;
    case Formula.ParamType.NUMBER:
      return 0;
    case Formula.ParamType.TEXT:
    default:
      return '';
  }
}

/** 来自于字段的时间类型 格式仅支持 YYYY-MM-DD YYYY-MM-DD HH:mm */
export function getDateFormat (value: string) {
  return value.length > 10 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
}

/** 来自于字段的时间类型 格式仅支持 YYYY-MM-DD YYYY-MM-DD HH:mm */
export function compleDate (value: string) {
  if (!value || typeof value !== 'string') {
    return value;
  }
  let _value = value.trim();
  if (_value.length === 10) {
    _value = `${_value} 00:00:00`;
  } else if (_value.length === 16) {
    _value = `${_value}:00`;
  }
  return _value;
}

/** 来自于字段的时间类型 格式仅支持 YYYY-MM-DD YYYY-MM-DD HH:mm */
export function getDateInstanceFromParam (value: string) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const _value = compleDate(value);
  return getDateInstance(_value);
}

export function getDateInstance (date: any) {
  let target = date;
  if (target instanceof Date && target.toUTCString() !== 'Invalid Date') return target;
  switch (typeof target) {
    case 'string':
      if (target.length >= 20) {
        target = target.substring(0, 19);
      }
      target = new Date(target.replace(/-/gi, '/'));
      break;
    case 'number':
      target = new Date(target);
      break;
  }
  return target instanceof Date && target.toUTCString() !== 'Invalid Date' ? target : null;
}

export function checkDate (year: number, month: number, day: number) {
  const _year = Math.floor(year);
  const _month = Math.floor(month) - 1;
  const _day = Math.floor(day);
  var date = new Date(_year, _month, _day);
  if (date.getFullYear() !== _year || date.getMonth() !== _month || date.getDate() !== _day) {
    return false;
  }
  return true;
}

export function dateFormat (date: Date| null, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return 'invalid time';
  }
  const o = {
    'Y+': date.getFullYear(),
    'M+': date.getMonth() + 1,
    'D+': date.getDate(),
    // 'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getTime(),
  };
  const week = {
    0: '\u65e5',
    1: '\u4e00',
    2: '\u4e8c',
    3: '\u4e09',
    4: '\u56db',
    5: '\u4e94',
    6: '\u516d',
  };
  let res = fmt;
  if (/(Y+)/.test(res)) {
    res = res.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
  }
  let tmp: string;
  if (/(E+)/.test(res)) {
    if (RegExp.$1.length > 1) {
      if (RegExp.$1.length > 2) {
        tmp = '\u661f\u671f';
      } else {
        tmp = '\u5468';
      }
    } else {
      tmp = '';
    }
    res = res.replace(RegExp.$1, `${tmp}${week[date.getDay()]}`);
  }

  for (const k of Object.keys(o)) {
    if (new RegExp(`(${k})`).test(res)) {
      res = res.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
    }
  }
  return res;
}

type StrInfo = {
  value: string;
  start: number;
  end: number;
};

export function parseFormulaStrInfo (formula: string): StrInfo[] {
  const strRegExp = /(?<value>"(\\["]|[^"])*")/g;
  const strInfo : StrInfo[] = [];
  let match: RegExpExecArray | null;
  while ((match = strRegExp.exec(formula))) {
    // @ts-ignore
    const { groups: { value }, index } = match;
    strInfo.push({
      value,
      start: index,
      end: index + value.length - 1,
    });
  }
  return strInfo;
}

export function parseFormulaFieldIds (formula: string) {
  const strInfo = parseFormulaStrInfo(formula);
  const strRegExp = /[{](?<id>[A-Za-z0-9.]+)[}]/g;
  const fieldIds : string[] = [];
  let match: RegExpExecArray | null;
  while ((match = strRegExp.exec(formula))) {
    // @ts-ignore
    const { groups: { id }, index } = match;
    if (strInfo.every(info => index < info.start || index > info.end) && !fieldIds.includes(id)) {
      fieldIds.push(id);
    }
  }
  return fieldIds;
}

export function getFieldName (field: Formula.Param, defaultName: string = '') {
  const fieldName = field && (field as Formula.FieldParam).name ? (field as Formula.FieldParam).name
    : (defaultName || (field.sourceType === Formula.SourceType.FIELD ? '暂无名称' : ''));
  return fieldName ? ` {${fieldName}} ` : '';
}

/**
 * 公式是否嵌套判断
 * @param formula
 * @param fieldId
 * @param fields
 * @param formulaIds
 */
export function validateFormulaNested (
  formula: string, fieldId: string|undefined, fields: Record<string, Formula.FieldParam> = {},
  formulaIds?: string[]): null | ParserError {
  if (!fieldId || !fields || Object.keys(fields).length === 0) {
    return null;
  }

  const _formulaIds = formulaIds ? [...formulaIds, fieldId] : [fieldId];
  const fieldIds = parseFormulaFieldIds(formula);
  let err: ParserError | null = null;

  for (const _fieldId of fieldIds) {
    const filed = fields[_fieldId];
    const [targetId, ...subFormulaIds] = _formulaIds;
    const name = getFieldName(filed, '当前公式');
    if (_formulaIds.includes(_fieldId)) {
      if (targetId === _fieldId && _formulaIds.length === 1) {
        err = generateError(`公式中嵌套了公式字段${name}，不允许公式嵌套公式字段自身`);
        if (err) {
          break;
        }
      }
      err = generateError(`公式中存在公式字段${
        subFormulaIds.map(id => `${getFieldName(fields[id])},`).join(' => ')
      }嵌套了公式字段${name}，不允许公式循环嵌套`);
      if (err) {
        break;
      }
    }
    if (filed.formula) { // 公式字段
      err = validateFormulaNested(filed.formula, _fieldId, fields, _formulaIds);
    }
    if (err) {
      break;
    }
  }
  return err;
}

export function validateFormulaNestedEx(formula: string): null | ParserError {
  let err: ParserError | null = null;
  if (!formula) {
    return err
  }
  if (/[A-Z]+\(.*[A-Z]+\(.*\).*\)/g.test(formula)) {
    err = generateError(`公式中嵌套了公式，不允许公式中嵌套公式`);
  }

  if (/[A-Z]+\(.*[\+\-\*\/]+.*\)/g.test(formula)) {
    err = generateError(`公式中嵌套了公式，不允许公式中嵌套运算`);
  } 

  if (/[A-Z]+\(.*(AND)+.*(OR)+.*\)/g.test(formula)) {
    err = generateError(`公式中暂不支持AND OR混合条件`);
  } 
  
  return err;
}
