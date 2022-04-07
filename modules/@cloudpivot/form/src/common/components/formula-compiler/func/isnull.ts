import { Formula } from '../type';
import { validateParamNull } from '../utils';
import { generateError } from '../error';

const ISNULL: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'ISNULL',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.BOOL,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params, compiler) {
    const outputType = compiler._funcValidate(identifier, params);
    const [param] = params;
    if (param.sourceType !== Formula.SourceType.FIELD) {
      throw generateError(`函数 ${identifier.name}() 要求参数是字段`);
    }
    return outputType;
  },
  calculate: (identifier, params) => {
    const [param] = params;
    const value = validateParamNull(param);
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default ISNULL;
