import { Formula } from '../type';
import { dateFormat } from '../utils';

const TODAY: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'TODAY',
  type: Formula.IdentifierType.FUNC,
  inputType: [],
  parameterless: true,
  outputType: {
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier) => {
    const value = dateFormat(new Date(), 'YYYY-MM-DD');
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default TODAY;
