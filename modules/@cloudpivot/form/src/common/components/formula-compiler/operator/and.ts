import { Formula } from '../type';

const AND: Formula.Identifier<Formula.IdentifierType.OPERATOR> = {
  name: 'AND',
  type: Formula.IdentifierType.OPERATOR,
  inputType: [{
    paramType: Formula.ParamType.BOOL,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.BOOL,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.BOOL,
    sourceType: Formula.SourceType.EDIT,
  },

  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [prev, next] = _params;
    const value = prev.value && next.value;
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default AND;
