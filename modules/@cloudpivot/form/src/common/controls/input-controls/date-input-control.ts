import * as typings from "@cloudpivot/form/schema";

import { InputControl } from "./input-control";
import { DateControl } from "h3-forms";

export abstract class DateInputControl extends InputControl<
  typings.DateOptions
  > {
  get showTime() {
    let format = ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss', 'HH:mm:ss', 'HH:mm'];
    if(this.controlOpts.format1 === 'YYYY-MM-DD HH:mm'){
      return { format: 'HH:mm' }
    }else{
      return format.indexOf(this.controlOpts.format1) > -1;
    }
  }

  get timeType() {
    return ['HH:mm:ss', 'HH:mm'].indexOf(this.controlOpts.format1) > -1;
  }

  get showMonth() {

    return (this.controlOpts.format1 || this.controlOpts.format).toUpperCase() === "YYYY-MM";
  }

  get format() {
    let format = this.controlOpts.format1;
    if (!format) {
      return "YYYY-MM-DD";
    }

    if (this.timePicker) {
      return format;
    }

    const idx = format.indexOf(" ");
    if (idx === -1) {
      return format.toUpperCase();
    }
    format = format.substr(0, idx).toUpperCase() + format.substr(idx);
    return format;
  }

  get timePicker() {
    let format = this.controlOpts.format1;
    let type = ["HH:mm:ss", "HH:mm"];
    return type.some(v => v === format);
  }

  get dateCtrl() {
    return this.ctrl as DateControl;
  }

  // get text(){
  //   if(this.ctrl.value){
  //     return dateFormatter(this.ctrl.value, this.format);
  //   }
  // }
}
