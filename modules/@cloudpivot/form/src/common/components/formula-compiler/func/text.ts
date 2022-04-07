import { Formula } from '../type';
import { toText, formatParamValue } from '../utils';

const TEXT: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'TEXT',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier, params) => {
    const [_param] = params;
    const value = toText(formatParamValue(_param)).value;
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default TEXT;
