import { Formula } from '../type';
import { generateError } from '../error';
import {
  checkFieldParamFromRelevance,
  validateSubFromSame,
  checkParam,
  validateParamNull,
  validateSubParamNull,
  formatParamValue,
  getFieldName,
} from '../utils';

const COUNT: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'COUNT',
  type: Formula.IdentifierType.FUNC,
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    checkFieldParamFromRelevance(identifier, params);
    if (params.length !== 1) {
      throw generateError(`函数 ${identifier.name}() 只需要1个参数，但传入了${params.length}个参数`);
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
    return {
      ...identifier.outputType,
      value: candidate.length > 0 ? candidate.length : 0,
    } as Formula.Param;
  },
};

export default COUNT;
