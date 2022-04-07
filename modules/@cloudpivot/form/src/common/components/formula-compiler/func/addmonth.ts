import { Formula } from '../type';
import {
  getDateInstanceFromParam, dateFormat, getDateFormat, getFieldName,
} from '../utils';
import { generateError } from '../error';

const ADDMONTH: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'ADDMONTH',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [_date, month] = _params;
    const date = getDateInstanceFromParam(_date.value);
    if (!date) {
      throw generateError(`函数 ${identifier.name}() 中时间参数${getFieldName(_date)}转成时间时出现错误`);
    }
    date.setMonth(month.value.toint().plus(date.getMonth()));
    const value = dateFormat(date, getDateFormat(_date.value));
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default ADDMONTH;
