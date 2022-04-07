import { Formula } from '../type';

const ABS: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'ABS',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [_param] = _params;
    const value = _param.value.abs();
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default ABS;
