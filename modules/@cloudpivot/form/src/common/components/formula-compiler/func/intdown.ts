import { Formula } from '../type';

const INTDOWN: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'INTDOWN',
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
    const value = _param.value.toint();
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default INTDOWN;
