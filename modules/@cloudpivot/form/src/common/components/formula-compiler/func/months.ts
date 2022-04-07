import { Formula } from '../type';
import { getDateInstanceFromParam, getFieldName } from '../utils';
import { generateError } from '../error';

const MONTHS: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'MONTHS',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [prev, next] = _params;
    const prevDate = getDateInstanceFromParam(prev.value);
    const nextDate = getDateInstanceFromParam(next.value);
    if (!prevDate || !nextDate) {
      throw generateError(`函数 ${identifier.name}() 中时间参数${
        !prevDate ? getFieldName(prev) : ''
      }${
        !nextDate ? getFieldName(next) : ''
      }转成时间时出现错误`);
    }
    const prevMonths = prevDate.getFullYear() * 12 + prevDate.getMonth();
    const nextMonths = nextDate.getFullYear() * 12 + nextDate.getMonth();
    const value = Math.abs(prevMonths - nextMonths);
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default MONTHS;
