import { Formula } from '../type';
import { dateFormat } from '../utils';

const NOW: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'NOW',
  type: Formula.IdentifierType.FUNC,
  inputType: [],
  parameterless: true,
  outputType: {
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier) => {
    const value = dateFormat(new Date(), 'YYYY-MM-DD HH:mm');
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default NOW;
