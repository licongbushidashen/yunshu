import toNumber from 'lodash/toNumber';
import { Formula } from '../type';
import { getDateInstance, dateFormat, checkDate } from '../utils';
import { generateError } from '../error';

const DATE: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'DATE',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params, compiler) {
    const outputType = compiler._funcValidate(identifier, params);
    const [year, month, day] = params;
    let _year: number = 0, _month: number = 0, _day: number = 0;
    if (!isNaN(year.value)) {
      const unary = year.unary || 1;
      _year = toNumber(year.value) * unary;
      if (_year < 1970 || _year > 9999) {
        throw generateError(`函数 ${identifier.name}() 年份只支持1970 ~ 9999`);
      }
    }
    if (!isNaN(month.value)) {
      const unary = month.unary || 1;
      _month = toNumber(month.value) * unary;
      if (_month < 1 || _month > 12) {
        throw generateError(`函数 ${identifier.name}() 月份只支持1 ~ 12`);
      }
    }
    if (!isNaN(day.value)) {
      const unary = day.unary || 1;
      _day = toNumber(day.value) * unary;
      if (_day < 1 || _day > 31) {
        throw generateError(`函数 ${identifier.name}() 日期只支持1 ~ 31`);
      }
    }

    if (!isNaN(_year) && !isNaN(_month) && !isNaN(_day) && !checkDate(_year, _month, _day)) {
      throw generateError(`函数 ${identifier.name} (${year.value}, ${month.value}, ${day.value})的日期不是合法日期`);
    }

    return outputType;
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [year, month, day] = _params;
    if (year.value.lt(1970) || year.value.gt(9999)) {
      throw generateError(`函数 ${identifier.name}() 年份只支持1970 ~ 9999`);
    }
    if (month.value.lt(1) || month.value.gt(12)) {
      throw generateError(`函数 ${identifier.name}() 月份只支持1 ~ 12`);
    }
    if (day.value.lt(1) || day.value.gt(31)) {
      throw generateError(`函数 ${identifier.name}() 日期只支持1 ~ 31`);
    }
    const _year = year.value.toNumber();
    const _month = month.value.toNumber();
    const _day = day.value.toNumber();
    if (!checkDate(_year, _month, _day)) {
      throw generateError(`函数 ${identifier.name} (${_year}, ${_month}, ${_day})的日期不是合法日期`);
    }

    const date = getDateInstance(`${Math.floor(_year)}-${Math.floor(_month)}-${Math.floor(_day)}`);
    if (!date) {
      throw generateError(`函数 ${identifier.name} (${_year}, ${_month}, ${_day})时间参数转成时间时出现错误`);
    }
    const value = dateFormat(date, 'YYYY-MM-DD');
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default DATE;
