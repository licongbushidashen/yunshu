import toNumber from 'lodash/toNumber';
import { Formula } from '../type';
import { generateError } from '../error';
import {
  checkFieldParamFromSublist, getParamTypeValue, getFieldName, validateParamNull,
  validateSubParamNull, paramDefaultValue, formatParamValue, getDateInstanceFromParam,
  getDateInstance, dateFormat,
} from '../utils';

const ROLLUP: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'ROLLUP',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    checkFieldParamFromSublist(identifier, params);
    const { inputType, outputType } = identifier;
    if (!inputType) {
      throw generateError(`未传入参数`);
    }
    if (inputType.length !== params.length) {
      throw generateError(`函数 ${identifier.name}() 需要${inputType.length}个参数，但传入了${params.length}个参数`);
    }
    const [relevance, summarize] = params;
    if (relevance.sourceType !== Formula.SourceType.FIELD ||
      (relevance as Formula.FieldParam).fieldType !== Formula.FieldType.RELEVANCE) {
      throw generateError(`函数 ${identifier.name}() 第一个参数只支持关联数据中的字段，第一个参数${
        getFieldName(relevance)
      }并不是关联数据中的字段`);
    }
    const summarizes = [1, 2, 3, 4, 5, 6, 7];
    const _summarize = !isNaN(summarize.value) ? toNumber(summarize.value) * (summarize.unary || 1) : summarize.value;
    if (!summarizes.includes(_summarize)) {
      throw generateError(`函数 ${identifier.name}() 第二个参数只允许是 1 ~ 7 的整数`);
    }
    let paramType = Formula.ParamType.NUMBER;
    switch (relevance.paramType) {
      case Formula.ParamType.TEXT:
      case Formula.ParamType.BOOL:
        if ([4, 5, 6, 7].includes(_summarize)) {
          throw generateError(`函数 ${identifier.name}() 第一个参数是${
            getParamTypeValue(relevance.paramType)
          }类型，第二个参数只允许是 1 ~ 3 的整数`);
        }
        break;
      case Formula.ParamType.DATE:
        if ([6, 7].includes(_summarize)) {
          throw generateError(`函数 ${identifier.name}() 第一个参数是${
            getParamTypeValue(relevance.paramType)
          }类型，第二个参数只允许是 1 ~ 5 的整数`);
        }
        if ([4, 5].includes(_summarize)) {
          paramType = Formula.ParamType.DATE;
        }
        break;
      default:
        break;
    }
    return {
      ...outputType,
      paramType,
    } as Formula.Param;
  },
  calculate: (identifier, params) => {
    const { outputType } = identifier;
    const [relevance, summarize] = params;
    const _summarize = toNumber(summarize.value);
    const paramType = relevance.paramType === Formula.ParamType.DATE && [4, 5].includes(_summarize)
      ? Formula.ParamType.DATE : Formula.ParamType.NUMBER;
    let value = paramDefaultValue(paramType);
    if (!validateSubParamNull(relevance)) {
      const relevanceValue = relevance.value;
      const values = relevanceValue.filter(_value => !validateParamNull({
        ...relevance,
        value: _value,
      })).map(_value => formatParamValue({
        ...relevance,
        value: _value,
      }).value);
      switch (_summarize) {
        case 1: // 计数
          value = relevanceValue.length;
          break;
        case 2: // 已填写
          value = values.length;
          break;
        case 3: // 未填写
          value = relevanceValue.length - values.length;
          break;
        case 4: // 最大值
        case 5: // 最小值
          if (!values.length) {
            break;
          }
          const compare = _summarize === 4 ? Math.max : Math.min;
          const _values = relevance.paramType === Formula.ParamType.DATE
            ? values.map(_value => {
              const date = getDateInstanceFromParam(_value);
              if (!date) {
                throw generateError(`函数 ${identifier.name}() 中第一个参数${getFieldName(relevance)}内转成时间时出现错误`);
              }
              return date.getTime();
            }) : values;
          value = relevance.paramType === Formula.ParamType.DATE
            ? dateFormat(getDateInstance(compare(..._values))) : compare(..._values);
          break;
        case 6: // 平均值
          if (!values.length) {
            break;
          }
          value = values.reduce((count, num) => count + num, 0) / values.length;
          break;
        case 7: // 求和
          if (!values.length) {
            break;
          }
          value = values.reduce((count, num) => count + num, 0);
          break;
        default:
          throw generateError(`函数 ${identifier.name}() 第二个参数只允许是 1 ~ 7 的整数`);
      }
    }
    return {
      ...outputType,
      paramType,
      value,
    } as Formula.Param;
  },
};

export default ROLLUP;
