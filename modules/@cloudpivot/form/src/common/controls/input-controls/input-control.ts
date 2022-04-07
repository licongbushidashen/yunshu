// import * as typings from "../../typings";
import { InputControlOptions } from "@cloudpivot/form/schema";
import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";

export abstract class InputControl<
  T extends InputControlOptions
> extends BaseControl<T> {
  // get placeholder() {
  //     return (this.controlOpts as any).placeholder || '';
  // }
}
