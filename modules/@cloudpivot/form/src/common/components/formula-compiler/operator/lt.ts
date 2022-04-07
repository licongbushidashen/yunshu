import { Formula } from '../type';
import {
  checkFieldParamFromSublist,
  checkFieldParamFromRelevance,
  getParamTypeValue,
  getDateInstanceFromParam,
  getFieldName,
} from '../utils';
import { generateError } from '../error';

const LT: Formula.Identifier<Formula.IdentifierType.OPERATOR> = {
  name: '<',
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
    if (params.some(param => param.paramType !== Formula.ParamType.NUMBER &&
      param.paramType !== Formula.ParamType.DATE)) {
      const [prev, next] = params;
      throw generateError(`操作符 "${identifier.name}" 要求参数类型是${
        getParamTypeValue(Formula.ParamType.NUMBER)
      }或${
        getParamTypeValue(Formula.ParamType.DATE)
      }，现在传入为 参数类型：${
        getParamTypeValue(prev.paramType)
      } ${identifier.name} 参数类型：${
        getParamTypeValue(next.paramType)
      }`);
    }
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
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [prev, next] = _params;
    let value = false;
    if (prev.paramType === Formula.ParamType.NUMBER) {
      // value = prev.value < next.value;
      value = prev.value.lt(next.value);
    } else if (prev.paramType === Formula.ParamType.DATE) {
      const prevDate = getDateInstanceFromParam(prev.value);
      const nextDate = getDateInstanceFromParam(next.value);
      if (!prevDate || !nextDate) {
        throw generateError(`操作符 "${identifier.name}" 中时间参数${
          !prevDate ? getFieldName(prev) : ''
        }${
          !nextDate ? getFieldName(next) : ''
        }转成时间时出现错误`);
      }
      value = prevDate.getTime() < nextDate.getTime();
    }
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default LT;
