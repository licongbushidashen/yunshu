import * as typings from "@cloudpivot/form/schema";

import { InputControl } from "./input-control";

import { TextAreaType } from "@cloudpivot/form/schema";
import { Subscription } from "rxjs";

export abstract class TextInputControl extends InputControl<
  typings.TextOptions
  > {
  commandSubscription?: Subscription;

  setDefaultValSub?: Subscription;

  sub: any = {};

  setDefaultValTimer?: any;

  val = "";

  get isTextarea() {
    return this.control.type === typings.FormControlType.Textarea;
  }

  get rows() {
    if (this.control.parentKey) {
      return { minRows: 1, maxRows: 5 };
    }
    return { minRows: 5, maxRows: 5 };
  }

  get maxLength() {
    if (this.isTextarea) {
      // 长文本类型 富文本
      if (!this.isLangText) {
        return this.controlOpts.currentMaxLength || 2e6;
      }
    }
    if (this.controlOpts.maxLength) {
      return Number(this.controlOpts.maxLength);
    }
    if (!this.isTextarea) {
      return 200;
    }

    return 2000;
  }

  get length() {
    return this.countLengthOf(this.ctrl.value);
  }

  get isLangText() {
    // ;
    if (!this.control.options.textAreaType) {
      return true;
    }
    return this.control.options.textAreaType === TextAreaType.LongText;
  }

  get isScan() {
    return (
      (this.controlOpts as any).isScan &&
      (this.controlOpts as any).isScan === true &&
      !this.readonlyFormula
    );
  }

  get inputPlaceholder() {
    if (this.isScan) {
      return this.$t("cloudpivot.form.renderer.scanInput");
    }
    return this.placeholder;
  }

  // /**
  //  * @desc 根据拼接规则更新值
  //  */
  // setDefaultValue() {
  //   let { options: { shortTextStitch = '' } } = this.control;
  //   let {
  //     str,
  //     subStr,
  //     getValue
  //   } = calcText;
  //   let sheet = {};
  //   let exps = shortTextStitch.match(/\{(\w+(\.\w+)*?)\}/ig);
  //   if (!shortTextStitch) return false;
  //   const allControls = this.getFormControls();
  //   let controls = exps.map((exKey:String) => {

  //     let k = exKey.replace(/[\{|\}]/g, '');
  //     let reg = /\w+\.\w+/ig;
  //     // console.log('kkk', k, reg.test(k))
  //     let btn = false;
  //     // 处理子表数据
  //     if (reg.test(k)) {
  //       k = k.split('.')[0];
  //       btn = true;
  //     }

  //     let con = allControls.find(item => item.key === k);
  //     if (btn) {
  //       // @ts-ignore
  //       sheet = con;
  //     }
  //     return con
  //   }).filter((item:any) => item)
  //   let obj = {
  //     str: 'str',
  //     subSrtr: 'subStr',
  //     getValue: 'getValue'
  //   }
  //   let calcStr = shortTextStitch
  //     .replace(/substring/ig, obj.subSrtr)
  //     .replace(/string/ig, obj.str)
  //     .replace(/\{/ig, '"{')
  //     .replace(/\}/ig, '}"');
  //     // @ts-ignore
  //     controls.getValue = getValue;
  //     let funBd = `
  //       let ${obj.str} = ${str.toString()};
  //       let ${obj.subSrtr} = ${subStr.toString()};
  //       let ${obj.getValue} = ${getValue.toString()};
  //       return ${calcStr}
  //     `;
  //     // 处理渲染下标的问题，子表组件依赖
  //     // @ts-ignore
  //     if (!sheet.hasOwnProperty('idx')) {
  //       // @ts-ignore
  //      sheet.idx = 0;
  //    } else {
  //       // @ts-ignore
  //       let cdx = sheet.idx + 1;
  //       // @ts-ignore
  //       if (cdx > sheet.value.length - 1) {
  //        cdx = 0
  //       }
  //       // @ts-ignore
  //      sheet.idx = cdx;
  //    }
  //   // @ts-ignore
  //   // console.log('controls', sheet.idx)
  //   // @ts-ignore
  //   let val = (new Function('controls', 'idx', funBd))(controls, sheet.idx);

  //   this.ctrl.value = val.slice(0, this.maxLength);

  // }
  // listenCommand() {
  //   const controls = this.getFormControls();
  //   let { key: selfKey, type, options: { shortTextStitch } } = this.control;
  //   if (type !== 1 || !shortTextStitch) return false;

  //   controls.filter(item => item.key !== selfKey).map((con:any) => {
  //     let { key } = con;
  //     if (shortTextStitch.includes(key)) {
  //       // console.log('key shortTextStitch', key, shortTextStitch, con)
  //       if (con.type === 201) {

  //       } else {
  //         setTimeout(() => {
  //           this.sub[key] = con.controller.valueChange.subscribe(() => {
  //             this.setDefaultValue();
  //           })
  //         }, 100)
  //       }

  //     }
  //   })

  // }

  setControl() {
    this.handleValueChange(this.ctrl.value);
  }

  handleValueChange(value: string | null): void {
    if (value) {
      if (value.length > this.maxLength) {
        let _val = value.substr(0, this.maxLength);
        this.setValue(_val);
        this.val = _val;
      } else {
        this.val = value;
      }
    } else {
      this.val = "";
    }
  }

  unsubscribe() {
    let keys = Object.keys(this.sub);
    keys.map((key) => {
      this.sub[key].unsubscribe();
    });
  }

  destroyed() {
    super.destroyed();

    this.unsubscribe();

    if (this.setDefaultValTimer !== undefined) {
      clearTimeout(this.setDefaultValTimer);
    }
  }
}
