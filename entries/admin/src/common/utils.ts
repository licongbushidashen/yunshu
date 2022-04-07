import store from '@/store';

export const getRealLength = (str: any) => {
  if (!str) {
    return 0;
  }
  let realLength: number = 0;
  const len: number = str.length;
  let charCode: number = -1;
  for (let i: number = 0; i < len; i += 1) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
    }
  }
  return realLength;
};

export const parseUrlParam = (urls: string, param: string) => {
  let url = urls;
  const searchIndex = url.indexOf('?');
  const jhIndex = url.indexOf('#');
  if (jhIndex > -1) {
    url = url.substr(0, jhIndex);
  }
  const searchParams = url.slice(searchIndex + 1).split('&');
  for (let i = 0; i < searchParams.length; i += 1) {
    const items = searchParams[i].split('=');
    if (items[0].trim().toLowerCase() === param.toLowerCase()) {
      return items[1].trim();
    }
  }
  return null;
};

export const getParamObj = (url: string, param: string) => {
  const searchIndex = url.indexOf('?');
  const searchParams = url.slice(searchIndex + 1).split('&');
  for (let i = 0; i < searchParams.length; i += 1) {
    const items = searchParams[i].split('=');
    if (items[0].trim().toLowerCase() === param.toLowerCase()) {
      return items[1].trim();
    }
  }
  return null;
};

export const parseSearch = (search: string) => {
  search = search.substr(1);
  const obj: any = {};
  search.split('&').forEach((arr) => {
    const [key, value] = arr.split('=');
    obj[key] = value;
  });
  return obj;
};

/* 正则规则 */
export const pattern = (type: string) => {
  switch (type) {
    case 'code':
      /* 以字母开头不超过28个字符，仅支持字母、数字、下划线 */
      return /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/;
    case 'tablecode':
      /* 以字母开头不超过40个字符，仅支持字母、数字、下划线 */
      return /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/;
    case 'modelcode':
      /* 以字母开头不超过28个字符，仅支持字母、数字、下划线 */
      return /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/; //导入创建模型的时候，自动生成的模型编码可以达到28位
    case 'name':
      /* 仅限50个字符以内，并不能以空格开头 */
      return /^\S(.{0,49})?$/;
    case 'number':
        /* 仅限数字 */
        return /^[1-9][0-9]{0,8}$/;
    case 'clientId':
      /** 仅限中英文 */
      return /^[a-zA-Z\u4e00-\u9fa5]+$/;
    default:
      break;
  }
};

export const nameValidator = (
  rules: any,
  value: any,
  callback: any,
  length: number
) => {
  let maxLen: number = length || rules.maxLength || 50;
  if(typeof length !== 'number'){
    maxLen = rules.maxLength || 50
  }
  debugger
  const reg = /^ /;
  const len = getRealLength(value);
  if (reg.test(value) || len > maxLen) {
    callback('');
  }
  callback();
};
export const roleCodeValidator = (
  rules: any,
  value: any,
  callback: any,
  length: number
) => {
  let maxLen: number = length || rules.maxLength || 28;
  if(typeof length !== 'number'){
    maxLen = rules.maxLength || 28
  }

  const reg = /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/;
  const len = getRealLength(value);
  if (!reg.test(value) && value !== '') {
    callback('');
  }
  callback();
}
export const bizModelNameValidator = (
  rules: any,
  value: any,
  callback: any,
  length: number
) => {
  const reg = /^ /;
  const reg2 = /^_/;
  const reg3 = /[^\u4e00-\u9fa5a-zA-Z\d-_]+/; // 模型名称 只能匹配 汉字英文字符数字和‘-’、‘_’字符 字符之间不能输入空格!
  const len = getRealLength(value);
  if (
    reg.test(value) ||
    len > (length | 50) ||
    reg2.test(value) ||
    reg3.test(value)
  ) {
    callback('');
  }
  callback();
};
export const sliceString = (value: any, length: number) => {
  // const reg = /^ /;
  if (!value) {
    return '';
  }
  let charCode = -1;
  let realLength: number = 0;
  const len: number = value.length;
  for (let i: number = 0; i < len; i += 1) {
    charCode = value.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
    }
    if (realLength > length) {
      return value.substring(0, i);
    }
  }
  return value;
};
function deepClone(source, hash = new WeakMap()) {
  //拷贝vue实例会有问题
  const isObject = (obj) => obj != null && typeof obj === 'object';
  const isFunction = (obj) => typeof obj === 'function';
  if (hash.has(source)) return hash.get(source); // 循环引用
  if (!isObject(source) || isFunction(source)) return source;
  let cloneObj;
  let Constructor = source.constructor;
  switch (
    Constructor // 基础数据类型全部转为引用数据类型
  ) {
    case Boolean:
    case Date:
    case Number:
    case String:
    case RegExp:
      return new Constructor(source);
    default:
      cloneObj = new Constructor();
      hash.set(source, cloneObj);
  }
  [
    ...Object.getOwnPropertyNames(source),
    ...Object.getOwnPropertySymbols(source),
  ].forEach((key) => {
    cloneObj[key] = deepClone(source[key], hash);
  });
  return cloneObj;
}

function deepClones(o) {
  // 判断如果不是引用类型，直接返回数据即可
  if (
    typeof o === 'string' ||
    typeof o === 'number' ||
    typeof o === 'boolean' ||
    typeof o === 'undefined'
  ) {
    return o;
  } else if (Array.isArray(o)) {
    // 如果是数组，则定义一个新数组，完成复制后返回
    // 注意，这里判断数组不能用typeof，因为typeof Array 返回的是object
    let _arr: any = [];
    o.forEach((item) => {
      _arr.push(item);
    });
    return _arr;
  } else if (typeof o === 'object') {
    let _o = {};
    for (let key in o) {
      if (o.hasOwnProperty(key)) {
        _o[key] = o && typeof o[key] === 'object' ? deepClones(o[key]) : o[key];
      }
    }
    return _o;
  }
}
function _getDataType(data) {
  return Object.prototype.toString.call(data).slice(8, -1);
}
function copyRegExp(regExp) {
  let attrs = '';
  if (regExp.global) attrs += 'g';
  if (regExp.ignoreCase) attrs += 'i';
  if (regExp.multiline) attrs += 'm';
  let newRegExp = new RegExp(regExp, attrs);
  newRegExp.lastIndex = regExp.lastIndex;
  return newRegExp;
}
function clone(x) {
  // String Number Boolean Undefined Null 返回自身
  if (x == null || typeof x !== 'object') return x;
  // RegExp Date Function 克隆
  let type = _getDataType(x);
  let root;
  switch (type) {
    case 'RegExp':
      return copyRegExp(x);
    case 'Date':
      return new Date(x.getTime());
    case 'Function':
      return x;
    case 'Array':
      root = [];
      break;
    default:
      root = Object.create(Object.getPrototypeOf(x));
  }
  // Array Object 克隆
  // 用来去重 解决原数据中多个属性引用同一对象克隆后不相同问题
  const uniqueList: any = [];
  // 使用栈结构解决递归爆栈问题
  const stack: any = [
    {
      parent: root,
      key: undefined,
      data: x,
    },
  ];
  // 深度优先循环
  while (stack.length) {
    const { parent, key, data } = stack.pop();
    // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
    let res = parent;
    if (typeof key !== 'undefined') {
      let type = _getDataType(data);
      switch (type) {
        case 'RegExp':
          parent[key] = copyRegExp(data);
          continue;
        case 'Date':
          parent[key] = new Date(data.getTime());
          continue;
        case 'Function':
          parent[key] = data;
          continue;
        case 'Array':
          res = parent[key] = [];
          break;
        default:
          let proto = Object.getPrototypeOf(data);
          res = parent[key] = Object.create(proto);
      }
    }
    //数据引用已经存在则赋值并退出本次循环,不存在则缓存
    let uniqueData: any = uniqueList.find((item) => item.source === data);
    if (uniqueData) {
      parent[key] = uniqueData.target;
      continue;
    } else {
      uniqueList.push({
        source: data,
        target: res,
      });
    }
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        if (data[k] == null || typeof data[k] !== 'object') {
          // 基础类型克隆
          let descriptor: any = Object.getOwnPropertyDescriptor(data, k);
          Object.defineProperty(res, k, descriptor);
        } else {
          // 引用类型加入stack循环处理
          stack.push({
            parent: res,
            key: k,
            data: data[k],
          });
        }
      }
    }
  }
  return root;
}

// Apps/Workflow 这种格式，在取值时需要转化为Apps.Workflow
// state 根store 中的state ,最终state.Apps.Workflow
export const pathToObj = (storePath: string, state) => {
  const arr = (storePath && storePath.split('/')) || [];
  let cloneData = state//deepClone(state);
  arr.forEach((key: string) => {
    cloneData = Object.freeze(cloneData[key]);
  })
  return cloneData;
};
