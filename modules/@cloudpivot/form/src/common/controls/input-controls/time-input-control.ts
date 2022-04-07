import * as typings from "@cloudpivot/form/schema";

import { InputControl } from "./input-control";
import { DateControl, TimeControl } from "h3-forms";

export abstract class TimeInputControl extends InputControl<
  typings.TimeOptions
  > {
  get format() {
    let format = this.controlOpts.format1;
    if (!format) {
      return "HH:mm:ss";
    }
    return format;
  }

  get timeCtrl() {
    return this.ctrl as TimeControl;
  }

  // get text(){
  //   if(this.ctrl.value){
  //     return dateFormatter(this.ctrl.value, this.format);
  //   }
  // }
}
