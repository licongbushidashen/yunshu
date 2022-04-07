import { Formula } from '../type';

const UPPERMONEY: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'UPPERMONEY',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [_param] = _params;
    // 整数和小数
    let [integer, decimal] = `${_param.value.abs()}`.split('.', 2);
    // 整数部分最长支持76位，超出部分将被截断
    if (integer.length > 76) {
      integer.slice(-76);
    }
    const chineseNum: string[] = [
      '零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖',
    ];
    const chineseUint: string[] = [
      '元', '万', '亿', '兆', '京', '垓', '秭', '穣', '沟', '涧', '正', '版载',
      '极', '恒河沙', '阿僧只', '那由他', '不可思议', '无量', '大数',
    ];
    const ret: any[] = [];
    // 整数要大于零
    if (Number(integer) > 0) {
      // 当每一段（零到万、万到亿）数据，只有低位出现过非零数字，高位才能出现零
      // 例如：100，十位为零，但是个位不是非零，所以十位这个零也不需要添加。转换后为壹佰元
      // 例如：101，个位是非零，十位的零需要添加，则为壹佰零壹元
      // i 每迭代4次，刷新 hasNonZero 为 false
      let hasNonZero = false;
      integer = integer
        .split('')
        .reverse()
        .join('');
      for (let i = 0; i < integer.length; i++) {
        const num = integer[i];
        const mod = i % 4;
        if (mod === 0) {
          // 出现两个连续的 chineseUint，需要剔掉一个;
          // '元'不需要剔除
          if (chineseUint.indexOf(ret[0]) >= 1) {
            ret.shift();
          }
          ret.unshift(chineseUint[Math.floor(i / 4)]);
          hasNonZero = false;
        }
        // 第一次出现0，并且（当前段）已出现过非0数字，
        // 例如：1001，当个位是非0，十位是0，这种情形
        // 需要把“零”入队，否则不需要。
        // 零不能连续出现
        if (num === '0') {
          if (ret[0] !== '零' && hasNonZero) {
            ret.unshift('零');
          }
          continue;
        }
        // 零和非零需要分开处理;
        if (mod >= 1) {
          ret.unshift(['', '拾', '佰', '仟'][mod]);
        }
        hasNonZero = true;
        ret.unshift(chineseNum[+num]);
      }
    }
    // 处理小数部分，目前暂时支持2位
    // 不存在小数: undefined, 长度为0, '00', '0'
    if (!decimal || decimal.length === 0 || +decimal - 0 === 0) {
      ret.length > 0 ? ret.push('整') : ret.push('零元整');
    } else {
      ret.push(chineseNum[+decimal[0]]);
      if (decimal[0] !== '0') {
        ret.push('角');
      }
      if (decimal[1] && decimal[1] !== '0') {
        ret.push(chineseNum[+decimal[1]] + '分');
      }
    }
    let value = ret.join('');
    value = _param.value < 0 ? `负${value}` : value;
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default UPPERMONEY;
