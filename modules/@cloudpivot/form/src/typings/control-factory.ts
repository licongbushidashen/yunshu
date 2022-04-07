import { DataItem } from "./data-item";

import { schema, renderer } from "@cloudpivot/form";

import * as SystemCodes from "@cloudpivot/form/src/common/system-data-item-codes";
import { FormSheetColumn } from "@cloudpivot/form/schema";

import {
  getDataItemTypeByControlType,
  getComponentTitleByControlType,
} from "@cloudpivot/form/utils";

type DataItemType = schema.DataItemType;

type FormControl = schema.FormControl;

type FormSheet = schema.FormSheet;

type FormControlType = schema.FormControlType;

const { FormControlType, DataItemType } = schema;

const { FormControlOptionsService } = renderer;
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep'
/**
 * 按数据项构建控件
 * @param item
 * @param controlType
 */
export function buildControlOf(
  item: DataItem,
  controlType?: FormControlType
): FormControl {
  const type = controlType
    ? controlType
    : item.isSystem
    ? mapToSystemControlType(item.code)
    : mapToControlType(item.type);

  const options = buildControlOptions(type);

  if (!options) {
    throw Error("未知的数据项类型");
  }
  // 

  setOptionsName(type, options, item.name, item.name_i18n);

  if (item.defaultValue !== undefined && item.defaultValue !== null) {
    if (type === FormControlType.Date) {
      (options as any).dataItemDefault = item.defaultValue;
      if (item.defaultValue && item.defaultValue.indexOf("-") > 0) {
        (options as any).defaultValue = "dataItemDefault";
      }
    } else {
      (options as any).defaultValue = item.defaultValue;
    }
  }

  if (type === FormControlType.RelevanceForm || type === FormControlType.RelevanceFormEx) {
    options.schemaCode = item.relativeCode;
    options.displayField = item.relativePropertyCode;
  }
  //表单设计时短文本数据项去重属性兼容数据模型中的去重属性
  if(type === FormControlType.Text){
    if(item.noRepeat){
      options.noRepeat = item.noRepeat;
    }
  }

  const control = {
    key: item.code,
    type: type,
    options: options,
  };

  if (type === FormControlType.Sheet) {
    if (item.properties) {
      (control as FormSheet).columns = item.properties
        .map((x) => {
          const c = buildControlOf(x) as FormSheetColumn;
          c.parentKey = item.code;
          c.width = getSheetColumnWidth(c.type);
          return c;
        })
        .filter((val) => val.type !== schema.FormControlType.SystemOther);
    } else {
      (control as FormSheet).columns = [];
    }
  }

  return control;
}

export function getSheetColumnWidth(type: FormControlType) {
  let width = 150;
  return width;
}

function setOptionsName(
  type: FormControlType,
  options: any,
  name: string,
  name_i18n?: string
) {
  // 

  options.name = name;

  if (name_i18n) {
    options.name_i18n =
      typeof name_i18n === "string" ? JSON.parse(name_i18n) : name_i18n;

    if (options.name_i18n.zh) {
      // options.name = options.name_i18n.zh;
      delete options.name_i18n.zh;
    }
  }
}

/**
 * 按左边面板控件类型块构建控件
 * @param block
 */
export function buildControl(block: any): FormControl {
  // 
  const options = buildControlOptions(block.type);

  // options.name = block.name;

  let key = "";
  switch (block.type) {
    case FormControlType.SequenceNo:
      key = SystemCodes.sequence_no;
      break;
    case FormControlType.SequenceStatus:
      key = SystemCodes.sequence_status;
      break;
    case FormControlType.CreateBy:
      key = SystemCodes.creater;
      break;
    case FormControlType.CreateByParentId:
      key = SystemCodes.created_dept_id;
      break;
    case FormControlType.CreatedTime:
      key = SystemCodes.created_time;
      break;
    case FormControlType.OwnerId:
      key = SystemCodes.owner;
      break;
    case FormControlType.ModifyBy:
      key = SystemCodes.modifier;
      break;
    case FormControlType.ModifiedTime:
      key = SystemCodes.modified_time;
      break;

    case FormControlType.Tabs:
    case FormControlType.Title:
    case FormControlType.Group:
    case FormControlType.Description:
    case FormControlType.ReverseRelevance:
      key = createKey(block.type);
      break;
  }

  if (options.name !== undefined) {
    setOptionsName(block.type, options, block.name, block.name_i18n);
  }

  const control: any = {
    key,
    options,
    type: block.type,
  };

  if (control.type === FormControlType.Sheet) {
    control.columns = [];
  } else if (control.type === FormControlType.Tabs) {
    const tabs = control as schema.FormTabs;

    tabs.panels = [];

    tabs.options.heads = [];

    for (let i = 1; i < 4; i++) {
      const k = "tab" + i.toString();

      tabs.panels.push({
        key: k,
        type: FormControlType.TabsPanel,
        options: {},
        controls: {} as any,
        layout: [],
      });

      tabs.options.heads.push({
        key: k,
        title: k,
        active: false,
      });
    }

    tabs.options.heads[0].active = true;
  }

  return control;
}

export function createKey(type: FormControlType, index?:number) {
  const name = FormControlType[type] || getComponentTitleByControlType(type);
  const key = name[0].toLowerCase() + name.substr(1) + Date.now().toString() + (index || '');
  return key;
}

export function copyControlFrom(control: FormControl) {
  // const copy = JSON.parse(JSON.stringify(control));

  const copy = cloneDeep(control);
  let newName:any = copy.options.name += '1';
  if (control.type === 202) { // 描述说明最大2000
    copy.options.name = newName.substring(0, 2000);
  } else { // 其他最大长度40
    copy.options.name = newName.substring(0, 40);
  }
  // copy.options.name += "1";

  const name_i18n = copy.options.name_i18n;

  if (name_i18n && typeof name_i18n === "object") {
    Object.keys(copy.options.name_i18n).forEach((k) => {
      // copy.options.name_i18n[k] += "1";
      let newName:any = copy.options.name_i18n[k] += '1';
      if (control.type === 202) { // 描述说明最大2000
        copy.options.name_i18n[k] = newName.substring(0, 2000);
      } else { // 其他最大长度40
        copy.options.name_i18n[k] = newName.substring(0, 40);
      }
    });
  }

  // let count = 0;

  // Object.keys(this.controls).map(k => this.controls[k])
  //   .filter(c => c.type === copy.type)
  //   .forEach(()=> count++);

  copy.key = createKey(control.type);

  if (control.type === FormControlType.Sheet) {
    const sheet = copy as FormSheet;
    if (sheet.columns) {
      sheet.columns.forEach((col,index) => {
        col.parentKey = copy.key;
        col.options.name += "1";
        // @ts-ignore
        col.copyKey = createKey(col.type, index) // 生成一个子表项的key
        if (col.options.name_i18n) {
          Object.keys(col.options.name_i18n).forEach((k) => {
            col.options.name_i18n[k] += "1";
          });
        }
      });
    }
    if (sheet.statistics) {
      sheet.statistics.forEach((s) => (s.parentKey = copy.key));
    }
  }

  return copy;
}

/**
 * 按控件类型构建控件选项
 * @param controlType
 * @param sourceOpts 需要合并的选项
 */
export function buildControlOptions(
  controlType: FormControlType,
  sourceOpts?: schema.FormControlOptions
): schema.FormControlOptions {
  let options = FormControlOptionsService.buildFor(controlType, sourceOpts);
  console.log("buildControlOptions options=>", options);
  if (!options) {
    throw new Error("未知的控件类型");
  }

  // if (
  //   (controlType === FormControlType.Radio ||
  //     controlType === FormControlType.Checkbox) &&
  //   !options.options
  // ) {
  //   options.options = "选项1;选项2;选项3";
  // }

  return options;
}

// export function mapToControlTypes(itemType: DataItemType) {
export function widgetControlTypes(itemType: any) {
  // let type = FormControlType.Label;
  const TY1 = [
    FormControlType.Text,
    FormControlType.Radio,
    FormControlType.Checkbox,
    FormControlType.Dropdown,
    FormControlType.DropdownMulti,
    FormControlType.Location,
  ];
  const TY2 = [FormControlType.Attachment, FormControlType.Image];
  const TY3 = [FormControlType.Textarea];

  if (TY1.indexOf(itemType) > -1) {
    return 1;
  }
  if (TY2.indexOf(itemType) > -1) {
    return 2;
  }
  if (TY3.indexOf(itemType) > -1) {
    return 3;
  }
  return "";

  // if (itemType === DataItemType.Attachment) {
  //   return [FormControlType.Attachment, FormControlType.Image];
  // }
}

export function mapToControlType(itemType: DataItemType) {
  let type = FormControlType.Label;

  switch (itemType) {
    case DataItemType.Attachment:
      type = FormControlType.Attachment;
      break;
    case DataItemType.ApprovalOpinion:
      type = FormControlType.ApprovalOpinion;
      break;
    case DataItemType.ShortText:
      type = FormControlType.Text;
      break;
    case DataItemType.Radio:
      type = FormControlType.Radio;
      break;
    case DataItemType.Checkbox:
      type = FormControlType.Checkbox;
      break;
    case DataItemType.Dropdown:
      type = FormControlType.Dropdown;
      break;
    case DataItemType.LongText:
      type = FormControlType.Textarea;
      break;
    case DataItemType.DropdownMulti:
      type = FormControlType.DropdownMulti;
      break;
    case DataItemType.Logic:
      type = FormControlType.Logic;
      break;
    case DataItemType.Date:
      type = FormControlType.Date;
      break;
    case DataItemType.Time:
      type = FormControlType.Time;
      break;
    case DataItemType.Number:
      type = FormControlType.Number;
      break;
    case DataItemType.RelevanceForm:
      type = FormControlType.RelevanceForm;
      break;
    case DataItemType.RelevanceFormEx:
      type = FormControlType.RelevanceFormEx;
      break;
    case DataItemType.Sheet:
      type = FormControlType.Sheet;
      break;
    case DataItemType.StaffSingle:
      type = FormControlType.StaffSelector;
      break;
    case DataItemType.StaffMulti:
      type = FormControlType.StaffMultiSelector;
      break;
    case DataItemType.StaffDeptMix:
      type = FormControlType.StaffDeptMixed;
      break;
    case DataItemType.DeptMulti:
      type = FormControlType.DepartmentMultiSelector;
      break;
    case DataItemType.DeptSingle:
      type = FormControlType.DepartmentSelector;
      break;
    case DataItemType.Address:
      type = FormControlType.Address;
      break;
  }

  return type;
}

export function mapToControlTypes(itemType: DataItemType) {
  let type = FormControlType.Label;

  if (itemType === DataItemType.ShortText) {
    return [
      FormControlType.Text,
      FormControlType.Radio,
      FormControlType.Checkbox,
      FormControlType.Dropdown,
      FormControlType.DropdownMulti,
      FormControlType.Location,
    ];
  }

  if (itemType === DataItemType.Attachment) {
    return [FormControlType.Attachment, FormControlType.Image];
  }

  return null;
}

/**
 * 将数据项code映射到系统控件类型
 * @param controlType
 */
export function mapToSystemControlType(itemCode: string) {
  let type = FormControlType.SystemOther;

  switch (itemCode) {
    case SystemCodes.sequence_no:
      type = FormControlType.SequenceNo;
      break;
    case SystemCodes.sequence_status:
      type = FormControlType.SequenceStatus;
      break;
    case SystemCodes.creater:
      type = FormControlType.CreateBy;
      break;
    case SystemCodes.created_dept_id:
      type = FormControlType.CreateByParentId;
      break;
    case SystemCodes.created_time:
      type = FormControlType.CreatedTime;
      break;
    case SystemCodes.modifier:
      type = FormControlType.ModifyBy;
      break;
    case SystemCodes.modified_time:
      type = FormControlType.ModifiedTime;
      break;
    case SystemCodes.owner:
      type = FormControlType.OwnerId;
      break;
  }
  return type;
}

/**
 * 将控件类型映射到非系统数据项类型
 * @param controlType
 */
export function mapToDataItemType(controlType: FormControlType) {
  let _type = getDataItemTypeByControlType(+controlType);
  let type = DataItemType.ShortText;
  if (typeof _type === 'number') {
    type = _type;
  } else {
    switch (controlType) {
      case FormControlType.Text:
        type = DataItemType.ShortText;
        break;
      case FormControlType.Radio:
        type = DataItemType.Radio;
        break;
      case FormControlType.Checkbox:
        type = DataItemType.Checkbox;
        break;
      case FormControlType.Dropdown:
        type = DataItemType.Dropdown;
        break;
      case FormControlType.DropdownMulti:
        type = DataItemType.DropdownMulti;
        break;
      case FormControlType.Textarea:
        type = DataItemType.LongText;
        break;

      case FormControlType.Date:
        type = DataItemType.Date;
        break;

      case FormControlType.Number:
        type = DataItemType.Number;
        break;

      case FormControlType.ApprovalOpinion:
        type = DataItemType.ApprovalOpinion;
        break;

      case FormControlType.Image:
      case FormControlType.Attachment:
      case FormControlType.Signature:
        type = DataItemType.Attachment;
        break;

      case FormControlType.StaffSelector:
        type = DataItemType.StaffSingle;
        break;
      case FormControlType.StaffMultiSelector:
        type = DataItemType.StaffMulti;
        break;
      case FormControlType.DepartmentMultiSelector:
        type = DataItemType.DeptMulti;
        break;
      case FormControlType.DepartmentSelector:
        type = DataItemType.DeptSingle;
        break;
      case FormControlType.StaffDeptMixed:
        type = DataItemType.StaffDeptMix;
        break;

      case FormControlType.Logic:
        type = DataItemType.Logic;
        break;

      case FormControlType.Sheet:
        type = DataItemType.Sheet;
        break;

      case FormControlType.ReverseRelevance:
      case FormControlType.RelevanceForm:
      case FormControlType.RelevanceFormEx:
        type = DataItemType.RelevanceForm;
        break;
      case FormControlType.Location:
        type = DataItemType.Address;
        break;
    }
  }
  return type;
}

/**
 * 将控件类型映射到系统数据项类型
 * @param controlType
 */
export function mapToSystemDataItemCode(controlType: FormControlType) {
  let code = "";
  switch (controlType) {
    case FormControlType.CreateBy:
      code = SystemCodes.creater;
      break;
    case FormControlType.ModifyBy:
      code = SystemCodes.modifier;
      break;
    case FormControlType.OwnerId:
      code = SystemCodes.owner;
      break;
    case FormControlType.CreateByParentId:
      code = SystemCodes.created_dept_id;
      break;
    case FormControlType.CreatedTime:
      code = SystemCodes.created_time;
      break;
    case FormControlType.ModifiedTime:
      code = SystemCodes.modified_time;
      break;
    case FormControlType.SequenceNo:
      code = SystemCodes.sequence_no;
      break;
    case FormControlType.SequenceStatus:
      code = SystemCodes.sequence_status;
      break;
  }

  return code;
}

export function buildDataItemOf(
  block: {
    type: FormControlType;
    name: string;
    code?: string;
  },
  parentCode?: string
): DataItem {
  // const type = mapToDataItemType(block.type);
  const type = mapToDataItemType(block.type);
  const name = block.name;

  let code = block.code;
  if (!code) {
    code = DataItemType[type] + Date.now().toString();
  }

  return {
    type,
    code,
    name,
    parentCode,
    isSystem: false,
    published: false,
    formPropertyType: block.type
  };
}

export function notDataItemOf(controlType: FormControlType) {
  return (
    controlType === FormControlType.Group ||
    controlType === FormControlType.Description ||
    controlType === FormControlType.Html ||
    controlType === FormControlType.Title ||
    controlType === FormControlType.ReverseRelevance ||
    controlType === FormControlType.Tabs
  );
}

/**
 * 控件是否独占一行
 * @param controlType
 */
export function isFullRow(controlType: FormControlType) {
  return (
    controlType === FormControlType.Title ||
    controlType === FormControlType.ApprovalOpinion ||
    controlType === FormControlType.Attachment ||
    controlType === FormControlType.Image ||
    controlType === FormControlType.Group ||
    controlType === FormControlType.Description ||
    controlType === FormControlType.Sheet ||
    controlType === FormControlType.Textarea ||
    controlType === FormControlType.Address ||
    controlType === FormControlType.ReverseRelevance ||
    controlType === FormControlType.Tabs
  );
}

/**
 * 根据数据项产生自动布局
 * @param name 表单数据
 * @param items 数据项列表
 */
export function autoLayout(
  formData: any,
  items: DataItem[]
): [
  {
    [key: string]: FormControl;
  },
  string[][]
] {
  const titleControl = buildControl({
    type: FormControlType.Title,
    name: formData.name,
    name_i18n: formData.name_i18n,
  });

  const groupTitleControl = buildControl({
    type: FormControlType.Group,
    name: "业务标题",
  });

  const map: {
    [key: string]: FormControl;
  } = {
    [titleControl.key]: titleControl,
    [groupTitleControl.key]: groupTitleControl,
  };

  for (const item of items) {
    if (item.code === SystemCodes.creater) {
      map[SystemCodes.creater] = buildControlOf(item);
    } else if (item.code === SystemCodes.created_time) {
      map[SystemCodes.created_time] = buildControlOf(item);
    } else if (item.code === SystemCodes.sequence_no) {
      map[SystemCodes.sequence_no] = buildControlOf(item);
    }
  }

  const layout = [
    [titleControl.key],
    [SystemCodes.creater, SystemCodes.created_time, SystemCodes.sequence_no],
    [groupTitleControl.key],
  ];

  items = items.filter((x) => x.published && !x.isSystem);

  for (const item of items) {
    const control = buildControlOf(item);
    map[item.code] = control;

    if (isFullRow(control.type) || layout.length === 0) {
      layout.push([control.key]);
    } else {
      const idx = layout.length - 1;
      if (layout[idx].length === 2 || isFullRow(map[layout[idx][0]].type)) {
        layout.push([control.key]);
      } else {
        layout[layout.length - 1].push(control.key);
      }
    }
  }

  return [map, layout];
}

/**
 * 清理控件的空选项
 * @param map
 */
export function clearEmptyOptions(map: { [k: string]: FormControl }) {
  if (!map) {
    return;
  }

  const clear = (obj: any) => {
    Object.keys(obj)
      .filter((k) => obj[k] === undefined)
      .forEach((k) => delete obj[k]);
  };

  for (const k in map) {
    const c = map[k];
    if (!c.options) {
      return;
    }

    clear(c.options);

    if (c.type === FormControlType.Sheet && (c as FormSheet).columns) {
      (c as FormSheet).columns
        .filter((col) => col.options)
        .forEach((col) => clear(col.options));
    }
  }
}

/**
 * 修剪控件属性
 * @param map
 */
export function trimOptions(map: { [k: string]: FormControl }) {
  const clone = JSON.parse(JSON.stringify(map));

  for (const key in clone) {
    const control = clone[key];
    control.options = FormControlOptionsService.trimFor(
      control.type,
      control.options
    );

    if (control.type === schema.FormControlType.Sheet) {
      const sheet = control as FormSheet;
      if (sheet.columns) {
        for (const col of sheet.columns) {
          const opts = FormControlOptionsService.trimFor(col.type, col.options);
          if (opts) {
            col.options = opts;
          }
        }
      }
    }
  }

  return clone;
}

/**
 * 还原控件属性
 * @param map
 */
export function restoreOptions(map: { [k: string]: FormControl }) {
  const clone = JSON.parse(JSON.stringify(map));

  for (const key in clone) {
    const control = clone[key];

    let name_i18n = control.options.name_i18n;
    if (name_i18n && typeof name_i18n === "string") {
      control.options.name_i18n = JSON.parse(name_i18n);
      delete control.options.name_i18n.zh;
    }

    control.options = FormControlOptionsService.buildFor(
      control.type,
      control.options
    );

    if (control.type === schema.FormControlType.Sheet) {
      const sheet = control as FormSheet;
      if (sheet.columns) {
        for (const col of sheet.columns) {
          name_i18n = col.options.name_i18n;
          if (name_i18n && typeof name_i18n === "string") {
            col.options.name_i18n = JSON.parse(name_i18n);
            delete col.options.name_i18n.zh;
          }

          const opts = FormControlOptionsService.buildFor(
            col.type,
            col.options
          );
          if (opts) {
            col.options = opts;
            if (!col.width) {
              col.width = getSheetColumnWidth(col.type);
            }
          }
        }
      }
    }
  }

  return clone;
}

export function findIndexFromGrid(
  layout: string[][],
  key: string
): [number, number] {
  for (let rowIdx = 0; rowIdx < layout.length; rowIdx++) {
    const cols = layout[rowIdx] as string[];

    for (let colIdx = 0; colIdx < cols.length; colIdx++) {
      if (cols[colIdx] === key) {
        return [rowIdx, colIdx];
      }
    }
  }

  return [-1, -1];
}

export function removeItemromGrid(layout: string[][], key: string): boolean {
  const [ri, ci] = findIndexFromGrid(layout, key);

  if (ri > -1 && ci > -1) {
    const row = layout[ri];
    if (row) {
      row.splice(ci, 1);
      if (row.length === 0) {
        layout.splice(ri, 1);
      }
      return true;
    }
  }

  return false;
}

export function setControlPath(
  control: FormControl,
  basePath: string[] | null
) {
  if (basePath) {
    control.path = basePath.concat(control.key);
  } else {
    delete control.path;
  }

  if (control.type === FormControlType.Sheet) {
    const sheet = control as FormSheet;

    if (sheet.columns) {
      sheet.columns.forEach((col) => {
        if (basePath && sheet.path) {
          col.path = sheet.path.concat(col.key);
        } else {
          delete col.path;
        }
      });
    }

    if (sheet.statistics) {
      sheet.statistics.forEach((s) => {
        if (basePath && sheet.path) {
          s.path = sheet.path.concat(s.key);
        } else {
          delete s.path;
        }
      });
    }
  } else if (control.type === FormControlType.Tabs) {
    const tabs = control as schema.FormTabs;

    if (tabs.panels) {
      tabs.panels.forEach((panel) => {
        const path = [tabs.key, panel.key];
        panel.path = basePath ? basePath.concat(path) : [tabs.key, panel.key];

        for (const key in panel.controls) {
          const c = panel.controls[key];

          setControlPath(c, panel.path);
        }
      });
    }
  }
}
