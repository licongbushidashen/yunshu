import {
  ModelProperty,
  ModelPropertyValueType,
  DateFormatType,
} from './model-client';
// import { modelStore } from './model-explorer';
function isNullOrUndefined (target: any) {
  return target === null || target === undefined;
}

// 附件处理
function formatOfFileList (value: any[]) {
  const fileList: any = value.map((item: any) => {
    return {
      url: '/api/file/download?refId=' + (item.refId || item.id),
      name: item.name,
      mimeType: item.mimeType,
      uid: item.refId || item.id,
      id: item.refId || item.id, // 旧数据没有refId 新数据有refId
      status: 'done',
      fileSize: item.fileSize,
    };
  });
  return fileList;
}

// 多选处理
function formatOfMulSelect (data: any, valueRange) {
  if (Array.isArray(data) && data.length > 0) {
    const label: any = data
      .map((inner: any) => {
        const findR: any = valueRange.find(
          (valueR: any) => inner === valueR.key,
        );
        if (findR) {
          return findR.text;
        }
      })
      .filter((item: any) => item);
    console.log(label, 'label');
    return label || '--';
  }
}

// 单选处理
function formatOfSelect (value: any, valueRange) {
  const label: any = valueRange
    .map((inner: any) => {
      if (inner.key === value) {
        return inner.text;
      }
    })
    .filter((item: any) => item)
    .join('');
  return label || '--';
}

export function defaultOf (propInfo: ModelProperty) {
  const { valueType, defaultValue } = propInfo;
  switch (valueType) {
    case ModelPropertyValueType.ATTACHMENT:
    case ModelPropertyValueType.IMAGE:
      return Array.isArray(defaultValue) ? defaultValue : [];

    case ModelPropertyValueType.SHORT_TEXT:
    case ModelPropertyValueType.LONG_TEXT:
    case ModelPropertyValueType.RADIO_TEXT:
    case ModelPropertyValueType.RICH_TEXT:
      // return typeof defaultValue === 'string' ? defaultValue : '';
      return defaultValue || null;

    case ModelPropertyValueType.DATE:
      if (defaultValue === '1') {
        // 当前时间
        return formatDate(new Date(), propInfo.format);
      }
      return null;

    case ModelPropertyValueType.NUMBER:
    case ModelPropertyValueType.DECIMAL:
      return typeof defaultValue === 'number'
        ? defaultValue
        : typeof defaultValue === 'string' && defaultValue
          ? Number(defaultValue)
          : null;

    case ModelPropertyValueType.BOOLEAN:
      return defaultValue === '1';

    case ModelPropertyValueType.MULTI_SELECT_TEXT:
      return defaultValue ? defaultValue.split(',') : [];
  }
  return null;
}

export function formatOf (
  propInfo: any,
  value: any,
  displayKey?: string,
  field?: any,
) {
  if (isNullOrUndefined(propInfo) || isNullOrUndefined(value)) {
    return '';
  }
  if ((propInfo && propInfo.valueType) || propInfo.modelPropInfo) {
    switch (propInfo.valueType || propInfo.modelPropInfo.valueType) {
      case ModelPropertyValueType.IMAGE:
        if (Array.isArray(value) && value.length > 0) {
          return formatOfFileList(value);
        }
        return Array.isArray(value)
          ? value.map(x => x.name).join(';')
          : value.name;

      case ModelPropertyValueType.ATTACHMENT:
        if (Array.isArray(value) && value.length > 0) {
          return formatOfFileList(value);
        }
        return [];

      case ModelPropertyValueType.RADIO_PERSON: // 人员单选
      case ModelPropertyValueType.RADIO_DEPARTMENT: // 人员多选
      case ModelPropertyValueType.MULTI_SELECT_PERSON: // 部门单选
      case ModelPropertyValueType.MULTI_SELECT_DEPARTMENT: // 部门多选
      case ModelPropertyValueType.PERSON_DEPARTMENT_SELECT: // 人员混选
        return Array.isArray(value)
          ? value.map(x => x.name).join(';')
          : value.name;

      case ModelPropertyValueType.ADDR_TYPE:
      case ModelPropertyValueType.MAP_TYPE:
        return value ? value.address : '';

      case ModelPropertyValueType.REF_TYPE:
        if (Array.isArray(value)) {
          return value
            .map(item =>
              formatOfRefList(
                propInfo.displayValueType,
                item[displayKey || 'name'],
                displayKey,
                field,
              ),
            )
            .join(';');
        } else {
          const refValue: any = value[displayKey || 'name'];
          return formatOfRefList(
            propInfo.displayValueType,
            refValue,
            displayKey,
            field,
          );
        }

      case ModelPropertyValueType.DATE:
        const { code } = propInfo;
        if (code === 'createdTime') {
          // 当前时间 系统字段
          if (value) return value;
          return formatDate(new Date(), propInfo.format);
        }

        if (Array.isArray(value)) {
          return value.map(x => formatDate(x, propInfo.format)).join(' ~ ');
        }

        if (propInfo.format === DateFormatType.Time) {
          return value;
        }

        return formatDate(value, propInfo.format);

      case ModelPropertyValueType.NUMBER: // 整数
        if (value) {
          if (Array.isArray(value)) {
            return value.map(x => x.toString()).join(' ~ ');
          }

          if (propInfo.format && propInfo.format.indexOf('#') > -1) {
            const string = value.toString();
            return Number(string.substring(0, propInfo.format.length));
          }
        }
        return value;

      case ModelPropertyValueType.DECIMAL: // 小数
        if (value) {
          if (Array.isArray(value)) {
            return value.map(x => x.toString()).join(' ~ ');
          }

          if (propInfo.format) {
            const index = propInfo.format.lastIndexOf('.');
            const formatLength = propInfo.format.substring(
              index + 1,
              propInfo.format.length,
            );
            if (formatLength) {
              const number = Math.pow(10, formatLength.length);
              return Math.round(value * number) / number;
            }
          }
        }
        return value;

      case ModelPropertyValueType.RICH_TEXT: // 富文本
        return value;

      case ModelPropertyValueType.MULTI_SELECT_TEXT: // 多选
        let selects: any = '';
        if (Array.isArray(value) && value.length > 0) {
          selects = value.map((item: any) => {
            // @ts-ignore
            return (
              propInfo.extensions.valueRange.find(
                (inner: any) => inner.key === item,
              ).text || ''
            );
          });
          return selects.join(';') || '';
        }
        return '';

      case ModelPropertyValueType.BOOLEAN: // 逻辑
        return value ? '是' : '否';

      case ModelPropertyValueType.RADIO_TEXT: // 单选
        if (value && propInfo.extensions) {
          let dataList: any = [];
          if (
            propInfo.extensions.valueRange &&
            propInfo.extensions.valueRange.length > 0
          ) {
            dataList = propInfo.extensions.valueRange;
          } else {
            dataList = propInfo.extensions.statusType;
          }
          const selectValue: any = dataList.find(
            (item: any) => item.key === value,
          );
          return selectValue ? selectValue.text : '';
        }
        return value;
    }
  }

  // 产品说不能显示[object Object]，要显示成JSON字符串
  if (typeof value === 'object' && value) {
    return JSON.stringify(value);
  }

  return value.toString();
}

// 列表关联字段显示
function formatOfRefList (
  relValueType: any,
  value: any,
  displayKey?: any,
  field?: any,
) {
  if (isNullOrUndefined(value)) {
    return '';
  }
  if (relValueType) {
    switch (relValueType) {
      case ModelPropertyValueType.RADIO_PERSON: // 人员单选
      case ModelPropertyValueType.RADIO_DEPARTMENT: // 人员多选
      case ModelPropertyValueType.MULTI_SELECT_PERSON: // 部门单选
      case ModelPropertyValueType.MULTI_SELECT_DEPARTMENT: // 部门多选
      case ModelPropertyValueType.PERSON_DEPARTMENT_SELECT: // 人员混选
        const dataList: any = value;
        if (dataList && typeof dataList === 'string') {
          const data: any = JSON.parse(dataList);
          return Array.isArray(data)
            ? data.map(x => x.name).join(';')
            : data.name;
        } else if (Array.isArray(dataList) && dataList.length > 0) {
          return dataList.map(x => x.name).join(';');
        }
        return dataList || '';

      case ModelPropertyValueType.ADDR_TYPE:
      case ModelPropertyValueType.MAP_TYPE:
        if (value && typeof value === 'string') {
          const add: any = JSON.parse(value);
          return add ? add.address : '';
        }
        return value ? value.address : '';

      case ModelPropertyValueType.IMAGE:
      case ModelPropertyValueType.ATTACHMENT:
        const fileList: any = value;
        if (Array.isArray(fileList) && fileList.length > 0) {
          return formatOfFileList(fileList);
        }
        return [];

      case ModelPropertyValueType.DATE:
      case ModelPropertyValueType.NUMBER: // 整数
      case ModelPropertyValueType.DECIMAL: // 小数
      case ModelPropertyValueType.RICH_TEXT: // 富文本
      case ModelPropertyValueType.SHORT_TEXT: // 短文本
        return value || '';

      case ModelPropertyValueType.RADIO_TEXT: // 单选
        if (value && field.extensions) {
          const valueRange: any = field.extensions.valueRange;
          return formatOfSelect(value, valueRange);
        }
        return value || '';

      case ModelPropertyValueType.MULTI_SELECT_TEXT: // 多选
        if (field && field.extensions) {
          const valueRange: any = field.extensions.valueRange || [];
          return formatOfMulSelect(value, valueRange) || value;
        }
        return value || '';

      case ModelPropertyValueType.BOOLEAN: // 逻辑
        return value ? '是' : '否';

      default:
        return value || '';
    }
  }
  return value || '';
}

// 表单关联字段格式化
export function formatOfRef (relValueType: any, value: any, field?: any) {
  if (isNullOrUndefined(relValueType) || isNullOrUndefined(value)) {
    return '';
  }
  if (relValueType) {
    switch (relValueType) {
      case ModelPropertyValueType.RADIO_PERSON: // 人员单选
      case ModelPropertyValueType.RADIO_DEPARTMENT: // 人员多选
      case ModelPropertyValueType.MULTI_SELECT_PERSON: // 部门单选
      case ModelPropertyValueType.MULTI_SELECT_DEPARTMENT: // 部门多选
      case ModelPropertyValueType.PERSON_DEPARTMENT_SELECT: // 人员混选
        if (value && typeof value === 'string') {
          const data: any = JSON.parse(value);
          return Array.isArray(data)
            ? data.map(x => x.name).join(';')
            : data.name;
        } else if (Array.isArray(value) && value.length > 0) {
          return value.map(x => x.name).join(';');
        }
        return value;

      case ModelPropertyValueType.ADDR_TYPE:
      case ModelPropertyValueType.MAP_TYPE:
        if (value && typeof value === 'string') {
          const add: any = JSON.parse(value);
          return add ? add.address : '';
        }
        return value ? value.address : '';

      case ModelPropertyValueType.IMAGE:
      case ModelPropertyValueType.ATTACHMENT:
      case ModelPropertyValueType.DATE:
      case ModelPropertyValueType.NUMBER: // 整数
      case ModelPropertyValueType.DECIMAL: // 小数
      case ModelPropertyValueType.RICH_TEXT: // 富文本
        return value;

      case ModelPropertyValueType.RADIO_TEXT: // 单选
        if (value && field.extensions) {
          const valueRange: any = field.extensions.valueRange;
          return formatOfSelect(value, valueRange);
        }
        return value;

      case ModelPropertyValueType.MULTI_SELECT_TEXT: // 多选
        let data: any = value;
        let valueRange: any = [];
        if (value && typeof value === 'string') {
          data = JSON.parse(value);
        }
        if (field && field.extensions) {
          valueRange = field.extensions.valueRange || [];
        }
        return formatOfMulSelect(data, valueRange) || value;

      case ModelPropertyValueType.BOOLEAN: // 逻辑
        return value ? '是' : '否';

      default:
        return value;
    }
  }
  return value || '';
}

// 打印数据格式化
export function formatPrintValue (
  propInfo: any,
  value: any,
  displayKey?: string,
) {
  if (isNullOrUndefined(value)) {
    return '';
  }
  if (propInfo && propInfo.valueType) {
    switch (propInfo.valueType) {
      case ModelPropertyValueType.RADIO_PERSON:
      case ModelPropertyValueType.RADIO_DEPARTMENT:
      case ModelPropertyValueType.MULTI_SELECT_PERSON:
      case ModelPropertyValueType.MULTI_SELECT_DEPARTMENT:
      case ModelPropertyValueType.IMAGE:
      case ModelPropertyValueType.ATTACHMENT:
      case ModelPropertyValueType.PERSON_DEPARTMENT_SELECT: // 人员混选
        return Array.isArray(value)
          ? value.map(x => x.name).join(';')
          : value.name;

      case ModelPropertyValueType.ADDR_TYPE:
      case ModelPropertyValueType.MAP_TYPE:
        return value ? value.address : '';

      case ModelPropertyValueType.RICH_TEXT: // 富文本
        return value;

      case ModelPropertyValueType.MULTI_SELECT_TEXT: // 多选
        let selects: any = '';
        if (value) {
          selects = value.map((item: any) => {
            const selectValue: any = propInfo.extensions.valueRange.find(
              (inner: any) => inner.key === item,
            );
            return selectValue.text || '';
          });
        }
        return selects.join(';') || '';

      case ModelPropertyValueType.BOOLEAN:
        return value ? '是' : '否';

      case ModelPropertyValueType.RADIO_TEXT: // 单选
        const selectValue: any = propInfo.extensions.valueRange.find(
          (item: any) => item.key === value,
        );
        return selectValue ? selectValue.text : '';

      case ModelPropertyValueType.REF_TYPE:
        return value || '';

      case ModelPropertyValueType.SHORT_TEXT: // 短文本
        if (propInfo.uiControl === 'ModelPicker') {
          if (Array.isArray(value) && value.length > 0) {
            const innerValue: any = value[0];
            // @ts-ignore
            const valueInner: any = innerValue[displayKey];
            if (Array.isArray(valueInner) && valueInner.length > 0) {
              return valueInner.join(';');
            }
            return valueInner;
          }
          return value ? value[displayKey || 'name'] : '';
        }
        return value || '';
    }
  }
  return value.toString();
}

export function formatDate (val: Date | string | null, _format?: string) {
  if (!val) {
    return '';
  }

  let format = _format;

  if (format) {
    const idx = format.indexOf(' ');
    if (idx === -1) {
      if (format.indexOf('mm') < 0 || format.indexOf('ss') < 0) {
        // 分钟和秒钟不转大写
        format = format.toUpperCase();
      }
    } else {
      format = format.substr(0, idx).toUpperCase() + format.substr(idx);
    }
  } else {
    format = 'YYYY-MM-DD';
  }
  // const m = (moment as any)(val);
  // m.utcOffset(8);

  // let str = m.format(format);

  let str = '';

  const date = typeof val === 'string' ? new Date(val.replace(/-/g, '/')) : val;

  str = format.replace(/YYYY/i, date.getFullYear().toString());

  const month = date.getMonth() + 1;
  str = str.replace(/MM/, month < 10 ? `0${month}` : month.toString());

  const d = date.getDate();
  str = str.replace(/DD/i, d < 10 ? `0${d}` : d.toString());

  const hours = date.getHours();
  str = str.replace(/HH/i, hours < 10 ? `0${hours}` : hours.toString());

  const minutes = date.getMinutes();
  str = str.replace('mm', minutes < 10 ? `0${minutes}` : minutes.toString());

  const seconds = date.getSeconds();
  str = str.replace(/ss/i, seconds < 10 ? `0${seconds}` : seconds.toString());

  return str;
}
