import { Formula } from '../type';
import { generateError } from '../error';
import {
  checkFieldParamFromSublist, getFieldName, validateSubParamNull, formatParamValue,
} from '../utils';

const LOOKUP: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'LOOKUP',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.FIELD,
  }],
  outputType: {
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    checkFieldParamFromSublist(identifier, params);
    const { name, inputType, outputType } = identifier;
    if (!inputType) {
      throw generateError(`未传入参数`);
    }
    if (inputType.length !== params.length) {
      throw generateError(`函数 ${name}() 需要${inputType.length}个参数，但传入了${params.length}个参数`);
    }
    const [relevance] = params;

    if (relevance.sourceType !== Formula.SourceType.FIELD ||
      (relevance as Formula.FieldParam).fieldType !== Formula.FieldType.RELEVANCE) {
      throw generateError(`函数 ${name}() 参数只支持关联数据中的字段，参数${
        getFieldName(relevance)
      }并不是关联数据中的字段`);
    }

    return {
      ...outputType,
      paramType: relevance.paramType,
    } as Formula.Param;
  },
  calculate: (identifier, params) => {
    let fieldParams = [];
    const [relevance] = params;
    if (relevance) {
      const checkNull = validateSubParamNull(relevance);
      if (!checkNull) {
        fieldParams = (relevance.value.map(_value => ({
          ...fieldParams,
          value: _value,
        })).map(_value => formatParamValue(_value).value));
      }
    }
    const value = fieldParams.length === 1 ? fieldParams[0] : '';
    return {
      ...identifier.outputType,
      paramType: relevance.paramType,
      value,
    } as Formula.Param;
  },
};

export default LOOKUP;
