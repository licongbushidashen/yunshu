import { DataItemType } from './data-item-type';
import {FormControlType} from "./form-control-type";

function dataColor(itemType: DataItemType){
  let type = {};

  switch (itemType) {
    case DataItemType.Attachment:
      type = {
        color: 'rgba(252, 232, 193, 0.8)',
        text:'文字'
      };
      break;
    case DataItemType.ApprovalOpinion:
      type = FormControlType.ApprovalOpinion;
      break;
    case DataItemType.ShortText:
    case DataItemType.Radio:
    case DataItemType.Checkbox:
    case DataItemType.Dropdown:
      type = FormControlType.Text;
      break;
    case DataItemType.LongText:
    case DataItemType.DropdownMulti:
      type = FormControlType.Textarea;
      break;
    case DataItemType.Logic:
      type = FormControlType.Logic;
      break;
    case DataItemType.Date:
      type = FormControlType.Date;
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
    case DataItemType.StaffMulti:
    case DataItemType.StaffDeptMix:
    case DataItemType.DeptMulti:
    case DataItemType.DeptSingle:
      type = FormControlType.StaffSelector;
      break;
    case DataItemType.Address:
      type = FormControlType.Address;
      break;
    case DataItemType.Time:
      type = FormControlType.Time;
      break;
  }

  return type;
}

export default dataColor
