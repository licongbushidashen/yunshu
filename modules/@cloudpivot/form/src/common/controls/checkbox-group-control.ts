/*
 * @Author: your name
 * @Date: 2020-04-22 17:31:32
 * @LastEditTime: 2020-04-24 17:50:11
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Radio\control\checkbox-group-control.ts
 */

import { Subscription } from "rxjs";

import * as typings from "@cloudpivot/form/schema";

import { SelectControl } from "./select-control";

import { Watch } from "vue-property-decorator";

export interface CheckboxOption {
  label: string;

  value: string;

  disabled?: boolean;

  onChange?: Function;

  displaySetting?: string;
}

export abstract class CheckboxGroupControl extends SelectControl<
  typings.CheckboxOptions
> {
  checkboxOptions: CheckboxOption[] = [];

  get isRadio() {
    return this.control.type === typings.FormControlType.Radio;
  }

  get isVertical() {
    return this.controlOpts.direction === "vertical";
  }

  get isShowAllOption() {
    let displaySetting = 'showSelected'
    if(this.controlOpts.hasOwnProperty('displaySetting')) {
      displaySetting = this.controlOpts.displaySetting
    }
    return displaySetting === 'showAllOption'
  }

  hasBatchImport: boolean = false;

  @Watch("items")
  onItemsChange() {
    this.options = this.initOptions(this.isRadio);
    this.checkboxOptions = this.options.map((x) => ({
      label: x,
      value: x,
      disabled: false,
    }));
    this.resetCheckboxOptionDisabled();
  }

  setControl() {
    try {
      if (Array.isArray(this.ctrl.value)) {
        if (this.ctrl.value.length > 0 && this.ctrl.value[0].marked === true) {
          this.hasBatchImport =
            this.ctrl.value[0].marked === true ? true : false;
          this.handleValueChange(
            this.ctrl.value[0].marked === true
              ? typeof this.ctrl.value[0].value === "string"
                ? this.ctrl.value[0].value.split(";").filter((x:any) => !!x)
                : this.ctrl.value[0].value
              : this.ctrl.value
          );
        } else {
          this.handleValueChange(this.ctrl.value);
        }
      } else {
        const obj = JSON.parse(this.ctrl.value);
        this.hasBatchImport = obj.marked === true ? true : false;
        this.handleValueChange(
          obj.marked === true ? obj.value : this.ctrl.value
        );
      }
    } catch (e) {
      this.handleValueChange(this.ctrl.value);
    }
    this.onItemsChange();
  }

  handleValueChange(value: any): void {
    this.val = super.convertValue(!this.isRadio, value);
  }

  resetCheckboxOptionDisabled() {
    if (this.isRadio) {
      return;
    }

    const values = this.val;

    const len = Array.isArray(values)
      ? this.countLengthOf(values.join(";"))
      : 0;

    this.options.map((k, i) => {
      if (!this.checkboxOptions[i]) {
        this.checkboxOptions[i] = {
          label: k,
          value: k,
          disabled: false,
        };
      }
      if (values.indexOf(k) > -1) {
        return;
      }
      let l = this.countLengthOf(k) + 1;
      this.checkboxOptions[i].disabled = len + l > 200;
    });
  }

  // destroyed() {
  //     super.destroyed();
  // }
}
