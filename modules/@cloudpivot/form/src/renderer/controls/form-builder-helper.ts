import {
  RendererFormControl,
  FormControlType,
  FormSheet,
  StaffSelectorOptions,
  DataItemType,
} from "../typings";

import * as typings from "../typings";

import * as forms from "h3-forms";

import { dateFormatter, format as numberFormatter } from "../utils";

import { FormControlValueService, FormControlVerifyService } from "../services";
import { StaffSelectorControl } from "./";
import moment from "moment";

const isEmpty = (v: any) => v === undefined || v === null || Object.prototype.toString.call(v) === '[object Array]' && v.length === 0; // || v === '';

export abstract class FormBuilderHelper {
  static getControlValue(control: RendererFormControl) {
    let val: any = undefined;

    if (!isEmpty(control.value)) {
      val = control.value;
    }
    // else if (control.options && !isEmpty(control.options.defaultValue)) {
    //     switch (control.type) {
    //         case FormControlType.Date:
    //             val = FormControlValueService.transDefaultValue(control.options.defaultValue, control);
    //             break;

    //         default:
    //             val = control.options.defaultValue;
    //             break;
    //     }

    // }

    if (!isEmpty(val)) {
      val = FormControlValueService.convert(
        control.type,
        val,
        control.options.multi
      );
      val = Array.isArray(val) ? val.slice() : val;
    }

    return val;
  }

  static defaultValueOf(control: RendererFormControl) {
    let val: any = null;

    if (control.type === FormControlType.Sheet) {
      const sheet = (control as any) as FormSheet;
      if (sheet.options.rows > 0 || Number(sheet.options.rows) > 0) {
        val = new Array(Number(sheet.options.rows)).fill(0).map(() => {
          const row: any = {};
          sheet.columns.forEach(
            (col) =>
              (row[col.key] = FormBuilderHelper.defaultValueOf(col as any))
          );
          return row;
        });
      }
    } else if (control.options && !isEmpty(control.options.defaultValue)) {
      switch (control.type) {
        case FormControlType.Date:
          val = FormControlValueService.transDefaultValue(
            control.options.defaultValue,
            control
          );
          break;
        case FormControlType.Time:
          val = FormControlValueService.transDefaultTimeValue(
            control.options.defaultValue,
            control
          );
          break;

        default:
          val = control.options.defaultValue;
          break;
      }

      if (!isEmpty(val)) {
        val = FormControlValueService.convert(
          control.type,
          val,
          control.options.multi
        );
        val = Array.isArray(val) ? val.slice() : val;
      }
    }

    if (isEmpty(val)) {
      if (
        control.type === FormControlType.StaffSelector ||
        control.type === FormControlType.StaffMultiSelector ||
        control.type === FormControlType.DepartmentSelector ||
        control.type === FormControlType.DepartmentMultiSelector ||
        control.type === FormControlType.StaffDeptMixed
      ) {
        const dvt = (control.options as StaffSelectorOptions).defaultValueType;
        if (dvt === typings.StaffSelectorValueType.Originator && StaffSelectorControl.service) {
          const user = StaffSelectorControl.service.getCurrentUser();
          if (user) {
            val = [user];
          }
        } else if (dvt === typings.StaffSelectorValueType.OriginatorDept  && StaffSelectorControl.service) {
          const dept = StaffSelectorControl.service.getCurrentUserDept();
          if (dept) {
            val = [dept];
          }
        }
      }
    }

    return val;

    // return FormControlValueService.defaultValueOf(control.type, control.options.multi);
    // return null;
  }

  static buildOptionsOf(control: any) {
    if (control.type === FormControlType.Sheet) {
      const sheet = control as FormSheet;
      const cols = sheet.columns.map((c) => {
        const col = FormBuilderHelper.buildFormControlOptionsOf(c) as any;
        col.key = c.key;
        delete col.value;
        return col;
      });

      cols.push({
        key: "id",
        type: forms.FormControlType.Radio,
        options: {
          display: false,
        },
      });
      const opts: any = {
        columns: cols,
        actions:sheet.actions
      };

      if (sheet.options.visible === false) {
        opts.display = false;
      } else {
        if (sheet.options.displayFormula) {
          sheet.options.displayFormula = sheet.options.displayFormula.replace(/大于等于/g, '>=');
          sheet.options.displayFormula = sheet.options.displayFormula.replace(/小于等于/g, '<=');
          sheet.options.displayFormula = sheet.options.displayFormula.replace(/不等于/g, '!==');
          sheet.options.displayFormula = sheet.options.displayFormula.replace(/等于/g, '==');
          sheet.options.displayFormula = sheet.options.displayFormula.replace(/大于/g, '>');
          sheet.options.displayFormula = sheet.options.displayFormula.replace(/小于/g, '<');
          opts.display = sheet.options.displayFormula;
        }
      }

      return opts;
    } else {
      return FormBuilderHelper.buildFormControlOptionsOf(control);
    }
  }
  static getIsNew(): boolean {
    let isNew = (window as any).h3form ? !!(window as any).h3form.isNew : true;
    return isNew;
  }

  static buildFormControlOptionsOf(control: any) {
    let value: any;

    value = FormBuilderHelper.getControlValue(control);

    const options: any = Object.assign(
      {},
      {
        value,
        validateTriggerType: forms.ValidateTriggerType.Blur,
        readonly: !control.edit,
      }
    );
    if(control.key === '$approval'){
      options.commonCommentSwitch = control.options.commonCommentSwitch
    }

    // 历史数据格式兼容
    if (control.options.hasOwnProperty("format")) {
      if (!control.options.hasOwnProperty("format1")) {
        control.options["format1"] = control.options["format"];
        options.format1 = control.options.format;
      } else {
        if (!control.options["format1"]) {
          control.options["format1"] = control.options["format"];
          options.format1 = control.options.format;
        }
      }
    }

    if (control.options.visible === false) {
      options.display = false;
    } else {
      if (control.options.displayFormula) {

        function isHasEmpty(type:string) {
          // 删除配置的显示条件中的  xx 包含、拥有、位于、属于  空值的显示条件
          let isEmpty:string[] = []
          control.options.displayFormula.split('&&').forEach((displayFormula: string) => {
            let regExp = new RegExp(`${type}.+`)
            let text = displayFormula.match(regExp)
            if(text && text[0].trim().length !== 2){
              isEmpty.push(displayFormula)
            }
            if(!text){
              isEmpty.push(displayFormula)
            }
          });
          control.options.displayFormula = isEmpty.join('&&')
        }

        ['包含','拥有','位于','属于'].forEach(el => {
          isHasEmpty(el)
        })

        control.options.displayFormula = control.options.displayFormula.replace(/大于等于/g, '>=');
        control.options.displayFormula = control.options.displayFormula.replace(/小于等于/g, '<=');
        control.options.displayFormula = control.options.displayFormula.replace(/不等于/g, '!==');
        control.options.displayFormula = control.options.displayFormula.replace(/等于/g, '==');
        control.options.displayFormula = control.options.displayFormula.replace(/大于/g, '>');
        control.options.displayFormula = control.options.displayFormula.replace(/小于/g, '<');
        options.display = control.options.displayFormula;
      }
    }

    if (control.required) {
      options.required = true;
    } else if (control.options.requiredFormula) {
      if (control.options.requiredFormula === "true") {
        options.required = true;
      } else {
        function isHasEmpty(type:string) {
          // 删除配置的显示条件中的  xx 包含、拥有、位于、属于  空值的显示条件
          let isEmpty:string[] = []
          control.options.requiredFormula.split('&&').forEach((requiredFormula: string) => {
            let regExp = new RegExp(`${type}.+`)
            let text = requiredFormula.match(regExp)
            if(text && text[0].trim().length !== 2){
              isEmpty.push(requiredFormula)
            }
            if(!text){
              isEmpty.push(requiredFormula)
            }
          });
          control.options.requiredFormula = isEmpty.join('&&')
        }

        ['包含','拥有','位于','属于'].forEach(el => {
          isHasEmpty(el)
        })

        control.options.requiredFormula = control.options.requiredFormula.replace(/大于等于/g, '>=');
        control.options.requiredFormula = control.options.requiredFormula.replace(/小于等于/g, '<=');
        control.options.requiredFormula = control.options.requiredFormula.replace(/不等于/g, '!==');
        control.options.requiredFormula = control.options.requiredFormula.replace(/等于/g, '==');
        control.options.requiredFormula = control.options.requiredFormula.replace(/大于/g, '>');
        control.options.requiredFormula = control.options.requiredFormula.replace(/小于/g, '<');
        options.required = control.options.requiredFormula;
      }
    }

    if (control.options.minDate) {
      options.min = control.options.minDate;
    }

    if (control.options.maxDate) {
      options.max = control.options.maxDate;
    }

    if (control.options.regexp) {
      let r = control.options.regexp;
      r = r.substr(1, r.length - 2);
      options.pattern = new RegExp(r);
    }

    // 映射有人员映射、关联映射 都是存储options.mapping, 但是历史原因 关联映射在form-render-helper中有mergeQuoteAndMappings
    // 解析了一次 这里特殊处理一下， 后续看看如何统一处理
    if (control.options.mappings) {
      let obj: any = {};
      let mappingStr: any = control.options.mappings;

      if(typeof mappingStr === 'object'){
        mappingStr = mappingStr.options || ''
      }



      if (mappingStr) {
        mappingStr
        .split(";")
        .filter((x: string) => x)
        .forEach((x: string) => {
          const idx = x.indexOf(":");
          const source = x.substring(0, idx);
          const target = x.substring(idx + 2, x.length - 1);
          if (obj[source]) {
            if (Array.isArray(obj[source])) {
              obj[source].push(target);
            } else {
              obj[source] = [obj[source], target];
            }
          } else {
            obj[source] = target;
          }
        });
      }
      options.mappings = obj;
    }

    //处理tabs 的切换条件
    if(control.options.heads){
      let source: any = control.options.heads.find((h: any) => h.changeFormula);
      if(source){
        options.changeFormula = {};
        control.options.heads.forEach((h: any) => {
          if(h.changeFormula){
            options.changeFormula[h.key] = h.changeFormula
          }
        });
      }
    }

    if (control.options.dataLinkage) {
      options.dataLinkage = control.options.dataLinkage;
    }

    if (control.options.shortTextStitch) {
      options.computeFormulaNew = control.options.shortTextStitch;
    }

    // if (control.options.sheetMappings) {
    //     let obj: any = options.mappings || {};
    //     control.options.sheetMappings.split(';')
    //         .filter((x: string) => x)
    //         .forEach((x: string) => {
    //             const idx = x.indexOf(':');
    //             obj[x.substring(0, idx)] = x.substring(idx + 2, x.length - 1);
    //         });
    //     options.mappings = obj;
    // }

    let type: forms.FormControlType;
    switch (control.type) {
      case FormControlType.Date:
        type = forms.FormControlType.Date;
        // 日期控件 如果不可填 则不做校验 因为 会设置当天校验项
        control.writable !== false &&
          FormControlVerifyService.verifyDate(
            control.options.verifyFormula,
            options,
            control.options
          );
        break;
      case FormControlType.Time:
        type = forms.FormControlType.Time;
        FormControlVerifyService.verifyTime(
            control.options.verifyFormula,
            options,
            control.options
          );
        break;

      case FormControlType.Number:
        type = forms.FormControlType.Number;
        options.max = 9999999999999999;
        FormControlVerifyService.verifyNum(
          control.options.verifyFormula,
          options,
          control.options
        );
        break;

      case FormControlType.Text:
        type = forms.FormControlType.Text;
        if (control.options.shortTextStitch) {
          options.textExp = control.options.shortTextStitch;
          options.limitLength = false;
        }
        break;

      case FormControlType.Checkbox:
        type = forms.FormControlType.Select;
        break;
      case FormControlType.DropdownMulti:
        type = forms.FormControlType.Select;
        break;
      case FormControlType.Dropdown:
        if (control.options.multi) {
          type = forms.FormControlType.Select;
        } else {
          type = forms.FormControlType.Radio;
        }
        break;

      case FormControlType.Image:
        type = forms.FormControlType.Select;
        FormControlVerifyService.verifyImageNumber(
          control.options.number,
          options,
          control.options
        );
        break;

      case FormControlType.DepartmentMultiSelector:
      case FormControlType.DepartmentSelector:
      case FormControlType.StaffMultiSelector:
      case FormControlType.StaffSelector:
      case FormControlType.StaffDeptMixed:
      case FormControlType.Attachment:
        type = forms.FormControlType.Select;
        break;

      case FormControlType.Tabs:
        type = forms.FormControlType.Tab;
        break;

      default:
        type = forms.FormControlType.Radio;
        break;
    }

    FormBuilderHelper.setFormatter(type, options, control);

    return {
      type,
      options,
    };
  }

  static setFormatter(
    type: forms.FormControlType,
    options: any,
    control: RendererFormControl
  ) {
    switch (type) {
      case forms.FormControlType.Date:
        options.formatter = (c: forms.DateControl) =>
          dateFormatter(c.value, control.options.format1);
        options.format1 = control.options.format1;
        break;
      case forms.FormControlType.Time:
        options.formatter = (c: forms.DateControl) =>
          dateFormatter(c.value, control.options.format1);
        options.format1 = control.options.format1;
        break;

      case forms.FormControlType.Number:
        options.formatter = (c: forms.NumberControl) =>
          numberFormatter(control.options.format1, c.value);
        break;

      case forms.FormControlType.Radio:
        options.formatter = (c: forms.RadioControl) => {
          if (typeof c.value === "string") {
            return c.value;
          } else if (c.value && c.value.name) {
            return c.value.name;
          }
        };
        break;

      case forms.FormControlType.Select:
        options.formatter = (c: forms.SelectControl) => {
          const val = c.value;
          if (Array.isArray(val)) {
            return val
              .map((x) => (typeof x === "string" ? x : x.name || ""))
              .join(",");
          }
          return "";
        };
        break;
    }
  }

  /**
   * 生成控件class
   * @param controlType
   */
  static getClass(controlType: typings.FormControlType): string {
    switch (controlType) {
      case typings.FormControlType.Image:
        return "input-image";
      case typings.FormControlType.Title:
        return "form-title";
      case typings.FormControlType.Sheet:
        return "form-sheet";
      case typings.FormControlType.Dropdown:
      case typings.FormControlType.DropdownMulti:
        return "form-dropdown";
      case typings.FormControlType.Radio:
        return "form-radio";
      case typings.FormControlType.Checkbox:
        return "form-checkbox";
      default:
        return "";
    }
  }
}
