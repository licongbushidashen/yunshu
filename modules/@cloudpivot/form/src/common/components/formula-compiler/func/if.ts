import { Formula } from '../type';
import { getFieldName, getParamTypeValue } from '../utils';
import { generateError } from '../error';

const IF: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'IF',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.BOOL,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params, compiler) {
    let outputType = compiler._funcValidate(identifier, params);

    const [, ..._params] = params;
    if (_params.some(param => _params[0].paramType !== param.paramType)) {
      throw generateError(`函数 ${identifier.name}() 要求返参类型一致，现在传入为${identifier.name} (条件, ${
        _params.map(param => `返参类型：${getFieldName(param)}${getParamTypeValue(param.paramType)}`).join(', ')
      })`);
    }
    outputType = {
      ...outputType,
      paramType: _params[0].paramType,
    } as Formula.Param;
    return outputType;
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [condition, prev, next] = _params;
    const value = condition.value ? prev.value : next.value;
    return {
      ...identifier.outputType,
      paramType: prev.paramType,
      value,
    } as Formula.Param;
  },
};

export default IF;
