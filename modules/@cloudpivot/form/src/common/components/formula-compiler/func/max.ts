import { Formula } from '../type';
import { generateError } from '../error';
import {
  checkFieldParamFromRelevance,
  checkParam,
  validateParamNull,
  validateSubParamNull,
  formatParamValue,
  getFieldName,
  validateSubFromSame,
} from '../utils';

const MAX: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'MAX',
  type: Formula.IdentifierType.FUNC,
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    checkFieldParamFromRelevance(identifier, params);
    if (params.length < 1) {
      throw generateError(`函数 ${identifier.name}() 至少需要1个参数，但传入了${params.length}个参数`);
    }

    const result: any[] = [];
    params.forEach((incoming, index) => {
      const {
        paramType, paramTypeInfo, sourceType, sourceTypeInfo,
      } = checkParam({
        paramType: Formula.ParamType.NUMBER,
        sourceType: Formula.SourceType.ANY,
      }, incoming);
      if (!paramType || !sourceType) {
        result.push(`第${index + 1}个参数要求是【${
            [paramTypeInfo[0], sourceTypeInfo[0]].filter(str => str).join('，')
          }】，传入的是${getFieldName(incoming)}【${
            [paramTypeInfo[1], sourceTypeInfo[1]].filter(str => str).join('，')
          }】`);
      }
    });
    if (result.length > 0) {
      throw generateError(`函数 ${identifier.name}() 参数错误：\n${result.join('\n')}`);
    }

    const sublistParams = params.filter(param =>
      param.sourceType === Formula.SourceType.FIELD &&
      (param as Formula.FieldParam).fieldType === Formula.FieldType.SUBLIST);

    if (params.length > 1 && sublistParams.length > 0) {
      throw generateError(`函数 ${identifier.name}() 多个参数时不支持明细表字段${
        sublistParams.map(_param => getFieldName(_param)).join(', ')
      }`);
    }

    if (sublistParams.length > 0 && !validateSubFromSame(sublistParams as Formula.FieldParam[])) {
      throw generateError(`函数 ${identifier.name}() 参数不支持不同明细表下的字段，${
        sublistParams.map(_param => getFieldName(_param)).join(', ')
      }`);
    }

    return identifier.outputType;
  },
  calculate: (identifier, params) => {
    const basicParams: any[] = [];
    const subFieldParams: any[] = [];
    for (let index = 0, len = params.length; index < len; index++) {
      const param = params[index];
      const isSubField = param.sourceType === Formula.SourceType.FIELD &&
       (param as Formula.FieldParam).fieldType === Formula.FieldType.SUBLIST;
      const checkNull = isSubField ? validateSubParamNull(param) : validateParamNull(param);
      if (!checkNull) {
        isSubField ? subFieldParams.push(param.value.map(_value => ({
          ...param,
          value: _value,
        })).filter(_value => !validateParamNull(_value))
          .map(_value => formatParamValue(_value).value)) : basicParams.push(formatParamValue(param).value);
      }
    }
    const candidate: any[] = [...subFieldParams.flat(), ...basicParams];
    candidate.sort((prev, next) => prev.lt(next) ? 1 : -1);
    return {
      ...identifier.outputType,
      value: candidate.length > 0 ? candidate[0] : 0,
    } as Formula.Param;
  },
};

export default MAX;
