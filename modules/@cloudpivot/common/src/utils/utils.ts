/**
 * 将毫秒数转成天时分
 * @param msec
 */
export const msecToTimeSpan: Function = (msec: number) => {
  if (msec) {
    const days = Math.floor(msec / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msec % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.ceil((msec % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.ceil((msec % (1000 * 60)) / 1000);
    return {
      day: days, hour: hours, minute: minutes, second: seconds
    };
  }
  return '';
};

/**
 * 将毫秒数直接转换为字符串
 * @param msec
 */
export const msesToTimeStr = (msec: number) => {
  const dateObj: any = msecToTimeSpan(msec);
  let dateStr = '';
  if (dateObj) {
    if (dateObj.day !== 0) {
      dateStr += `${dateObj.day}天`;
    }
    if (dateObj.hour !== 0) {
      dateStr += `${dateObj.hour}时`;
    }
    if (dateObj.minute !== 0) {
      dateStr += `${dateObj.minute}分`;
    }
  }
  return dateStr;
};

/**
 * 格式化毫秒数为day-hour-minute
 * @param time
 */
export const timeTranslate = (time: number) => {
  const _t: any = msecToTimeSpan(time);

  let str: string = '';

  if (time === 0) return '1分钟';

  const _day: string = `${_t.day === 0 ? '' : `${Math.abs(_t.day)}天`}`;

  let _hour: string = `${Math.abs(_t.hour)}时`;
  if (_t.day === 0 && _t.hour === 0) {
    _hour = '';
  }

  const _minute = `${_t.minute === 0 ? 1 : Math.abs(_t.minute)}分钟`;

  str = `${_day}${_hour}${_minute}`;

  return str;
};

/**
 * @desc 时间位数不够补0
 */
export const zeroFormat = (str: any) => {
  if (typeof str !== 'number') return null;
  str = str.toString();
  return str.length === 1 ? `0${str}` : str;
};

/*
  * 小数点后不足位补0函数
  */
export const addZero = (str:string, num:number) => {
  if (str.indexOf('.') === -1) {
    let zero: string = '';
    for (var i = 0; i < num; i++) {
      zero += '0';
    }
    return `${str}.${zero}`;
  } else {
    const numLength = str.split('.')[1].length;
    if (numLength < num) {
      let zero: string = '';
      for (var i = 0; i < num - numLength; i++) {
        zero += '0';
      }
      return `${str}${zero}`;
    }
    return str;
  }
}


/*
 * 根据key值获取对象对应的值
 */

export const recursionSearch = (obj: any, code: any) => {
	for (let key in obj) {
		if (key === code) {
			return obj[key];
		} else {
			if (typeof obj[key] === "object") {
				let temp: any = recursionSearch(obj[key], code);
				if (temp) {
					return temp;
				}
			}
		}
	}
}

 /**
     * @description: 递归遍历查找数组对象的某个值
     * @param {string} code
     * @param {array} arr
     * @returns {object}
     */
  export const filterTableMater = (code: any, arr: any) => {
    for (const item of arr) {
      if (item.key === code) return item
      if (item.children && item.children.length) {
        const _item = filterTableMater(code, item.children)
        if (_item) return _item
      }
    }
  }

/*
 * 根据key值获取对象对应的值
 */

export const recursionSearchEx = (obj: any, code: any) => {
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      
    })
  } else {
    for(let key in obj) {
      if (key === code) {
        return obj[key];
      } else {
        if (typeof obj[key] === "object") {
          let temp: any = recursionSearch(obj[key], code);
          if (temp) {
            return temp;
          }
        } else if (Array.isArray(obj[key])) {
          
        }
      }
    }
  }
}

export const getFileUrl = (file: any) => {
  let url = '';
  //@ts-ignore
  if (window.createObjectURL) {
    //@ts-ignore
    url = window.createObjectURL(file)
    //@ts-ignore
  } else if (window.URL) {
    //@ts-ignore
    url = window.URL.createObjectURL(file);
    //@ts-ignore
  } else if (window.webkitURL) {
    //@ts-ignore
    url = window.webkitURL.createObjectURL(file)
  }
  return url;
}

export const throttle = (fn: any, delay: any, isDebounce:boolean) => {
  let timer: any;
  let lastCall = 0;
  return (...args: any[]) => {
    if (isDebounce) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    } else {
      const now = new Date().getTime();
      if (now - lastCall < delay) return;
      lastCall = now;
      fn(...args);
    }
  };
};

export function debounce(fn: any, delay = 50) {
  let timer: any = null;
  return function() {
    let args = arguments;
    
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      
      //@ts-ignore
      fn.apply(this, args);
    }, delay);
  };
}
