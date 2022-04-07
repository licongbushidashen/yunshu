import { Formula } from '../type';
import { generateError } from '../error';
import {
  getParamTypeValue,
  validateParamNull,
  formatParamValue,
  getDateInstanceFromParam,
  checkFieldParamFromSublist,
  checkFieldParamFromRelevance,
  getFieldName,
} from '../utils';

const NEQ: Formula.Identifier<Formula.IdentifierType.OPERATOR> = {
  name: '<>',
  type: Formula.IdentifierType.OPERATOR,
  inputType: [{
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.BOOL,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    checkFieldParamFromSublist(identifier, params);
    checkFieldParamFromRelevance(identifier, params);
    if (params.some(param => params[0].paramType !== param.paramType)) {
      const [prev, next] = params;
      throw generateError(`操作符 "${identifier.name}" 要求参数类型一致，现在传入为 参数类型：${
        getParamTypeValue(prev.paramType)
      } ${identifier.name} 参数类型：${
        getParamTypeValue(next.paramType)
      }`);
    }
    return identifier.outputType;
  },
  calculate: (identifier, params) => {
    if (params.every(param => validateParamNull(param))) {
      return {
        ...identifier.outputType,
        value: false,
      } as Formula.Param;
    }
    if (params.some(param => validateParamNull(param))) {
      return {
        ...identifier.outputType,
        value: true,
      } as Formula.Param;
    }
    const _params = params.map(param => formatParamValue(param));
    const [prev, next] = _params;
    let value = true;
    switch (prev.paramType) {
      case Formula.ParamType.NUMBER:
        value = !prev.value.eq(next.value);
        break;
      case Formula.ParamType.BOOL:
      case Formula.ParamType.TEXT:
        value = prev.value !== next.value;
        break;
      case Formula.ParamType.DATE:
        const prevDate = getDateInstanceFromParam(prev.value);
        const nextDate = getDateInstanceFromParam(next.value);
        if (!prevDate || !nextDate) {
          throw generateError(`操作符 "${identifier.name}" 中时间参数${
            !prevDate ? getFieldName(prev) : ''
          }${
            !nextDate ? getFieldName(next) : ''
          }转成时间时出现错误`);
        }
        value = prevDate.getTime() !== nextDate.getTime();
        break;
    }

    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default NEQ;
