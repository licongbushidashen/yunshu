
import * as numberFormatter from "../utils/number-formatter";
let getValue = (key, controls, idx) => {
  function dateFtt(date, fmt = 'YYYY-MM-DD HH:mm') { //author: meizz 
    var o = {
      "M+": date.getMonth() + 1,     //月份 
      "DD+": date.getDate(),     //日 
      "HH+": date.getHours(),     //小时 
      "m+": date.getMinutes(),     //分 
      "s+": date.getSeconds(),     //秒 
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds()    //毫秒 
    };
    if (/(Y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }

  let reg = /\w+\.\w+/ig;
  // 子表需要做处理
  if (reg.test(key)) {
    let keys = key.split('.');
    
    // 子表
    let ctrl = controls.find(c => c.key == keys[0]);
    if (idx === '-1') {
      idx = ctrl.idx
    }

    let value = ctrl.controller.value[idx];
    
    // Colum
    let subKey = keys[1];
    let col = ctrl.columns.find(col => col.key === subKey) || {};

    let {
      type = 1,
    } = col;
    if (value[subKey]) {
      let { format = '' } = col.options
      if (type === 3) {// 日期组件格式化
        return dateFtt(value[subKey], format)
      } else if (type === 4 && format) { // number控件需要格式化
        return numberFormatter.format(format, value[subKey])
      } else if ([60, 61, 50, 51].includes(type)) {
        return value[subKey].map(item => item.name).join('')
      }
      return value[subKey]
    }
    return "$_$";
  }
  let ctrl = controls.find(c => c.key == key);
  if (!!ctrl) {
    let {
      value,
    } = ctrl.controller;
    if (!!value) {
      // 保持字符串拼接和显示相同
      let {
        options: {
          format,
        },
        type
      } = ctrl;
      if (type == 3) {
        return dateFtt(value, format)
      } else if (type === 4 && format) {
        return numberFormatter.format(format, value)
      } else if ([60, 61, 50, 51].includes(type)) {
        return value.map(item => item.name).join('')
      }
      return `${value}`;

    }
  }
  return "$_$";
}

let str = (...args) => {
  
  let res = args.map(key => {
    if (Array.isArray(key)) {
      return str.apply(null, key)
    }
    // let regKey = /\{\w+(\.\w+)?\}/ig;
    // 用户输入的值直接返回
    // if (!regKey.test(key)) {
    //   console.log('kkkk', key)
    //   return key
    // }
    let k = key.replace(/[\{\}]/ig, '')

    return controls.getValue(k, controls, idx)
  });
 
  return res.filter(s => s !== '$_$').join('');
}
let subStr = (...args) => {
  let start = 0;
  let end = 0;
  let str = args[0];
  
  
  
  // 处理变量字符串
  let r = /\{\w+\}/ig;
  if (r.test(str)) {
    let key = str.replace(/[\{|\}]/ig, '')
    str = controls.getValue(key, controls, idx)
  }
  if (args.length === 2) {
    start = args[1]
    end = str.length;
  } else if (args.length === 3) {
    start = args[1];
    end = args[2]
  }
  let res = str.replace(/\$\_\$/ig, '').slice(start, end);
  console.log('res', res)
  return res
}

export default {
  str,
  subStr,
  getValue
}
