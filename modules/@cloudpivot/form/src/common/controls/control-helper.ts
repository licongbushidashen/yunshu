import {
  FormControlType,
  DataItemType,
  RendererFormControl,
} from "@cloudpivot/form/schema";

export abstract class ControlHelper {
  /**
   * 将控件类型映射到非系统数据项类型
   * @param controlType
   */
  static mapToDataItemType(controlType: FormControlType) {
    let type = DataItemType.ShortText;

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

      case FormControlType.CreatedTime:
      case FormControlType.ModifiedTime:
      case FormControlType.Date:
        type = DataItemType.Date;
        break;
      case FormControlType.Time:
        type = DataItemType.Time;
        break;

      case FormControlType.Number:
        type = DataItemType.Number;
        break;

      case FormControlType.ApprovalOpinion:
        type = DataItemType.ApprovalOpinion;
        break;

      case FormControlType.Signature:
      case FormControlType.Image:
      case FormControlType.Attachment:
        type = DataItemType.Attachment;
        break;

      case FormControlType.StaffSelector:
      case FormControlType.CreateBy:
      case FormControlType.ModifyBy:
      case FormControlType.CreateByParentId:
      case FormControlType.OwnerId:
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
      case FormControlType.Location:
      case FormControlType.Address:
        type = DataItemType.Address;
        break;
      case FormControlType.ReverseRelevance:
      case FormControlType.RelevanceForm:
        type = DataItemType.RelevanceForm;
        break;
      case FormControlType.RelevanceFormEx:
        type = DataItemType.RelevanceFormEx;
        break;
    }

    return type;
  }

  static getControlLabel(control: RendererFormControl, locale: string) {
    if (!control || !control.options) {
      return "";
    }

    let name = control.options.name;

    if (locale !== "zh") {
      const name_i18n = control.options.name_i18n;
      if (name_i18n) {
        const map =
          typeof name_i18n === "string" ? JSON.parse(name_i18n) : name_i18n;
        if (map[locale]) {
          name = map[locale];
        }
      }
    }

    return name;
  }
}
