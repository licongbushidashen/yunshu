import { Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererControl,
  RendererFormControl,
  FormControlType,
  DataItemLike,
} from "../typings";

import { FormRendererHelper } from "./form-renderer-helper";
import { FormBuilderHelper } from "@cloudpivot/form/src/renderer/controls/form-builder-helper";
import { ControlHelper } from "@cloudpivot/form/src/common/controls/control-helper";
import { FormGroup, FormControlErrorCodes } from "h3-forms";
import {
  FormControlValueService,
  FormControlOptionsService,
} from "../services";
import * as schema from "../../schema";

import { FormRendererLike } from "../form-renderer-like";

export class FormRenderer extends Vue implements FormRendererLike {
  @Prop()
  controls!: RendererControl[];

  @Prop({ default: () => [] })
  dataItems!: DataItemLike[];

  @Prop()
  formPermission!: any;

  private _controller?: FormGroup;

  private _formControlMap: {
    [key: string]: RendererFormControl;
  } = {};

  get controller() {
    return this._controller;
  }
  get formControlMap() {
    return this._formControlMap;
  }

  findFormControls(keys?: string[]) {
    return Object.keys(this._formControlMap || {})
        .filter((k) => {
          if (keys) {
            return keys.indexOf(k) > -1;
          }
          return true;
        })
        .map((k) => this._formControlMap[k]);
  }

  @Watch("controls", {
    immediate: true,
  })
  setControls(controls: RendererControl[], oldControls?: RendererControl[]) {
    if (!controls || controls === oldControls || controls.length === 0) {
      return;
    }
    let formControls: RendererFormControl[] = [];
    FormRendererHelper.findFormControl(controls, formControls);
    this._controller = FormRendererHelper.buildController(controls);
    const map: any = {};
    formControls.filter((c) => c.key)
        .forEach((c) => (map[c.key] = c));
    this._formControlMap = map;
  }

  convertOwner(owner: RendererFormControl) {
    owner.type = FormControlType.StaffSelector;
    owner.required = true;

    const options = FormControlOptionsService.buildFor(
      owner.type,
      owner.options
    );
    if (options) {
      options.defaultValueType = schema.StaffSelectorValueType.Originator;
      owner.options = options;
    }
  }

  render(h: Function, mobile: boolean) {
    if (!this.controls || !this.controls.length) {
      return;
    }
    const children = this.controls.map((c) =>
      FormRendererHelper.render(h, c, mobile, this)
    );
    const tabs = this.findFormControls().find(
      (c) =>
        c.type === FormControlType.ReverseRelevance &&
        c.options.listDisplayMode === "tabs"
    );

    if (tabs) {
      return h("div", children);
    } else {
      return h("div", [h("div", this.$slots.default), ...children]);
    }
  }

  validate(excludes?: string[]) {
    if (!this.controller) {
      return true;
    }

    return this.controller.validate(excludes);
  }

  getErrors() {
    if (!this.controller) {
      return null;
    }

    return this.controller.errors;
  }

  getErrorMessage(
    controlId: string,
    errCode: FormControlErrorCodes,
    parentId?: string
  ) {
    if (!controlId) {
      return "";
    }

    let control = this._formControlMap[parentId || controlId];
    if(control.controller.value === '' || control.controller.value === null ){
      return '请完善必填内容'
    }
    let parent = control;
    if (!control) {
      return "";
    }

    if (parentId) {
      // ;
      const col = ((parent as any) as schema.FormSheet).columns.find(
        (c) => c.key === controlId
      );
      if (!col) {
        return "";
      }
      // control = (control.controller as any).children[0].children[controlId] as any
      control = col as any;
    }

    const locale = this.$i18n.locale;

    let msg =
      FormRendererHelper.getErrorMessage(control, errCode, locale) || "";

    if (parentId) {
      msg = ControlHelper.getControlLabel(parent, locale) + " " + msg;
    }

    return msg;
  }

  getValue() {
    console.log(this.controller, this.controls)
    if (this.controller) {
      return this.controller.value;
    }
  }
  getOpValue(){ // 返回关联表单查询字段的操作符
    let res:any = {}
    this.controls.forEach((el:any) => {
      if(el.children && Array.isArray(el.children)){
        el.children.forEach((item: any) => {
          if(item.children && Array.isArray(item.children)){
            item.children.forEach((item: any) => {
              res[item.key] = item.op
            });
          }
        });
      }
    })
    return res
  }

  reset() {
    this.findFormControls().forEach((c) => {
      if (c.controller) {
        const value = FormBuilderHelper.getControlValue(c);
        c.controller.value = value;
      }
    });
  }

  clear() {
    this.findFormControls().forEach((c) => {
      //视图设计中查询条件配置的不显示字段的值不清空
      if (c.controller && c.options && c.options.visible) {
        c.controller.value = null;
      }
    });
  }

  edit(keys?: string[]) {
    this.setWritable(true, keys);
  }

  readonly(keys?: string[]) {
    this.setWritable(false, keys);
  }

  private setWritable(edit: boolean, keys?: string[]) {
    this.findFormControls(keys)
      .filter((c) => !FormRendererHelper.isSystem(c.type))
      .forEach((control) => {
        if (control.type === FormControlType.Sheet) {
          control.edit = edit;
        } else {
          if (control.writable === true && this._controller) {
            const ctrl = this._controller.findChild(control.key);
            if (ctrl && !ctrl.disabled) {
              ctrl.readonly = !edit;
            }
          }
        }
      });
  }
}
