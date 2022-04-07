import { Subscription } from "rxjs";

import * as typings from "@cloudpivot/form/schema";

import * as numberFormatter from "@cloudpivot/form/utils/number-formatter";

import numberFilter from "@cloudpivot/form/utils/number-filter";

import { InputControl } from "./input-control";

export abstract class NumberInputControl extends InputControl<
  typings.NumberOptions
> {
  // get text() {
  //   return this.formatter();
  // }

  formatter() {
    // if (this.$el) {
    //   const input = this.$el.querySelector("input") as HTMLInputElement;
    //   const idx = input.value.indexOf(".");
    //   if (idx > -1) {
    //     //input.focus();
    //     input.setSelectionRange(idx + 1, idx + 1);
    //   }
    // }
    if (!this.control) {
      return "";
    }
    return numberFilter(this.control);
  }

  parser(val: string) {
    if (val === "") {
      return "";
    }

    const ft = this.controlOpts.format1;
    switch (ft) {
      default:
      case typings.NumberFormatType.None:
        return Number(val);

      case typings.NumberFormatType.Int:
        return numberFormatter.int.parser(val);

      case typings.NumberFormatType.Ratio:
      case typings.NumberFormatType.Ratio2:
      case typings.NumberFormatType.Ratio3:
        return numberFormatter.ratio.parser(val);

      case typings.NumberFormatType.Decimal:
      case typings.NumberFormatType.CurrencyRMB:
      case typings.NumberFormatType.CurrencyRMB2:
      case typings.NumberFormatType.CurrencyRMB3:
      case typings.NumberFormatType.CurrencyDollar:
      case typings.NumberFormatType.CurrencyDollar2:
      case typings.NumberFormatType.CurrencyDollar3:
      case typings.NumberFormatType.CurrencyEuro:
      case typings.NumberFormatType.CurrencyEuro2:
      case typings.NumberFormatType.CurrencyEuro3:
      case typings.NumberFormatType.CurrencyHK:
      case typings.NumberFormatType.CurrencyHK2:
      case typings.NumberFormatType.CurrencyHK3:
        return numberFormatter.currency.parser(val);
    }
  }

  typeTrans(val: number) {
    if (typeof val !== "number") {
      return val;
    }

    const ft = this.controlOpts.format1;
    switch (ft) {
      default:
      // return Math.floor(val);
      case typings.NumberFormatType.None:
        return Number(val);
      // 不带小数
      case typings.NumberFormatType.Int:
      case typings.NumberFormatType.Ratio:
        return Math.floor(val);
      // 一位小数
      case typings.NumberFormatType.Ratio2:
      case typings.NumberFormatType.Tenths:
        return numberFormatter.currency.trans(val, 1);
      // 两位小数
      case typings.NumberFormatType.Ratio3:
      case typings.NumberFormatType.Decimal:
      case typings.NumberFormatType.CurrencyRMB:
      case typings.NumberFormatType.CurrencyDollar:
      case typings.NumberFormatType.CurrencyEuro:
      case typings.NumberFormatType.CurrencyHK:
        return numberFormatter.currency.trans(val, 2);
      // 三位小数
      case typings.NumberFormatType.Ratio4:
      case typings.NumberFormatType.Decimal2:
      case typings.NumberFormatType.CurrencyDollar2:
      case typings.NumberFormatType.CurrencyRMB2:
      case typings.NumberFormatType.CurrencyEuro2:
      case typings.NumberFormatType.CurrencyHK2:
        return numberFormatter.currency.trans(val, 3);
      // 四位小数
      case typings.NumberFormatType.Ratio5:
      case typings.NumberFormatType.Decimal3:
      case typings.NumberFormatType.CurrencyDollar3:
      case typings.NumberFormatType.CurrencyRMB3:
      case typings.NumberFormatType.CurrencyEuro3:
      case typings.NumberFormatType.CurrencyHK3:
        return numberFormatter.currency.trans(val, 4);
      // 五位小数
      case typings.NumberFormatType.Ratio6:
      case typings.NumberFormatType.Decimal4:
      case typings.NumberFormatType.CurrencyDollar4:
      case typings.NumberFormatType.CurrencyRMB4:
      case typings.NumberFormatType.CurrencyEuro4:
      case typings.NumberFormatType.CurrencyHK4:
        return numberFormatter.currency.trans(val, 5);
      // 六位小数
      case typings.NumberFormatType.Ratio7:
      case typings.NumberFormatType.Decimal5:
      case typings.NumberFormatType.CurrencyDollar5:
      case typings.NumberFormatType.CurrencyRMB5:
      case typings.NumberFormatType.CurrencyEuro5:
      case typings.NumberFormatType.CurrencyHK5:
        return numberFormatter.currency.trans(val, 6);
      // 七位小数
      case typings.NumberFormatType.Ratio8:
      case typings.NumberFormatType.Decimal6:
      case typings.NumberFormatType.CurrencyDollar6:
      case typings.NumberFormatType.CurrencyRMB6:
      case typings.NumberFormatType.CurrencyEuro6:
      case typings.NumberFormatType.CurrencyHK6:
        return numberFormatter.currency.trans(val, 7);
      // 八位小数
      case typings.NumberFormatType.Ratio9:
      case typings.NumberFormatType.Decimal7:
      case typings.NumberFormatType.CurrencyDollar7:
      case typings.NumberFormatType.CurrencyRMB7:
      case typings.NumberFormatType.CurrencyEuro7:
      case typings.NumberFormatType.CurrencyHK7:
        return numberFormatter.currency.trans(val, 8);
    }
  }
}
