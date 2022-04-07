import {
  RendererFormControl,
  NumberFormatType,
  NumberOptions,
} from "@cloudpivot/form/schema";

import * as numberFormatter from "./number-formatter";

export default function (control: RendererFormControl) {
  // console.log(control, 'control')
  const val = control.controller ? control.controller.value : control.value;
  if (val === null || val === undefined) {
    return "";
  }
    // 满足科学计数法时将其转化为字符串显示 
    let strVal = (val - 0).toLocaleString();
    let formatStrVal = strVal.replace(/\,/g, '');
    let dotIndex: number = 0;
    dotIndex = formatStrVal.indexOf('.');
    if (dotIndex === -1 && formatStrVal.length > 21) {
      return formatStrVal;
    }
    if (dotIndex > 20) {
      return formatStrVal;
    }
  
    // if (formatStrVal.substr(dotIndex + 1).length > 7) {
    //   return formatStrVal;
    // }  
  const ft = (control.options as NumberOptions).format1;
  switch (ft) {
    default:
    case NumberFormatType.None:
      return val;

    case NumberFormatType.Int:
      return numberFormatter.int.formatter(val);

    case NumberFormatType.Ratio:
      return numberFormatter.ratio.formatter(val);
 
    case NumberFormatType.Ratio2:
      return numberFormatter.ratio.formatter(val, {
        precision: 1,
      });
    case NumberFormatType.Ratio3:
      return numberFormatter.ratio.formatter(val, {
        precision: 2,
      });
    case NumberFormatType.Ratio4:
      return numberFormatter.ratio.formatter(val, {
        precision: 3,
      });
    case NumberFormatType.Ratio5:
      return numberFormatter.ratio.formatter(val, {
        precision: 4,
      });
    case NumberFormatType.Ratio6:
      return numberFormatter.ratio.formatter(val, {
        precision: 5,
      });
    case NumberFormatType.Ratio7:
      return numberFormatter.ratio.formatter(val, {
        precision: 6,
      });
    case NumberFormatType.Ratio8:
      return numberFormatter.ratio.formatter(val, {
        precision: 7,
      });
    case NumberFormatType.Ratio9:
      return numberFormatter.ratio.formatter(val, {
        precision: 8,
      });

    case NumberFormatType.Tenths:
      return numberFormatter.currency.formatter(val, {
        precision: 1,
      });
    case NumberFormatType.Decimal:
      return numberFormatter.currency.formatter(val);
    case NumberFormatType.Decimal2:
      return numberFormatter.currency.formatter(val, {
        precision: 3,
      });
    case NumberFormatType.Decimal3:
      return numberFormatter.currency.formatter(val, {
        precision: 4,
      });
    case NumberFormatType.Decimal4:
      return numberFormatter.currency.formatter(val, {
        precision: 5,
      });
    case NumberFormatType.Decimal5:
      return numberFormatter.currency.formatter(val, {
        precision: 6,
      });
    case NumberFormatType.Decimal6:
      return numberFormatter.currency.formatter(val, {
        precision: 7,
      });
    case NumberFormatType.Decimal7:
      return numberFormatter.currency.formatter(val, {
        precision: 8,
      });

    case NumberFormatType.CurrencyRMB:
      return numberFormatter.currency.formatter(val, {
        symbol: "￥",
      });
    case NumberFormatType.CurrencyRMB2:
      return numberFormatter.currency.formatter(val, {
        symbol: "￥",
        precision: 3,
      });
    case NumberFormatType.CurrencyRMB3:
      return numberFormatter.currency.formatter(val, {
        symbol: "￥",
        precision: 4,
      });
    case NumberFormatType.CurrencyRMB4:
      return numberFormatter.currency.formatter(val, {
        symbol: "￥",
        precision: 5,
      });
    case NumberFormatType.CurrencyRMB5:
      return numberFormatter.currency.formatter(val, {
        symbol: "￥",
        precision: 6,
      });
    case NumberFormatType.CurrencyRMB6:
      return numberFormatter.currency.formatter(val, {
        symbol: "￥",
        precision: 7,
      });
    case NumberFormatType.CurrencyRMB7:
      return numberFormatter.currency.formatter(val, {
        symbol: "￥",
        precision: 8,
      });

    case NumberFormatType.CurrencyDollar:
      return numberFormatter.currency.formatter(val, {
        symbol: "$",
      });

    case NumberFormatType.CurrencyDollar2:
      return numberFormatter.currency.formatter(val, {
        symbol: "$",
        precision: 3,
      });
    case NumberFormatType.CurrencyDollar3:
      return numberFormatter.currency.formatter(val, {
        symbol: "$",
        precision: 4,
      });
    case NumberFormatType.CurrencyDollar4:
      return numberFormatter.currency.formatter(val, {
        symbol: "$",
        precision: 5,
      });
    case NumberFormatType.CurrencyDollar5:
      return numberFormatter.currency.formatter(val, {
        symbol: "$",
        precision: 6,
      });
    case NumberFormatType.CurrencyDollar6:
      return numberFormatter.currency.formatter(val, {
        symbol: "$",
        precision: 7,
      });
    case NumberFormatType.CurrencyDollar7:
      return numberFormatter.currency.formatter(val, {
        symbol: "$",
        precision: 8,
      });

    case NumberFormatType.CurrencyEuro:
      return numberFormatter.currency.formatter(val, {
        symbol: "€",
      });
    case NumberFormatType.CurrencyEuro2:
      return numberFormatter.currency.formatter(val, {
        symbol: "€",
        precision: 3,
      });
    case NumberFormatType.CurrencyEuro3:
      return numberFormatter.currency.formatter(val, {
        symbol: "€",
        precision: 4,
      });
    case NumberFormatType.CurrencyEuro4:
      return numberFormatter.currency.formatter(val, {
        symbol: "€",
        precision: 5,
      });
    case NumberFormatType.CurrencyEuro5:
      return numberFormatter.currency.formatter(val, {
        symbol: "€",
        precision: 6,
      });
    case NumberFormatType.CurrencyEuro6:
      return numberFormatter.currency.formatter(val, {
        symbol: "€",
        precision: 7,
      });
    case NumberFormatType.CurrencyEuro7:
      return numberFormatter.currency.formatter(val, {
        symbol: "€",
        precision: 8,
      });

    case NumberFormatType.CurrencyHK:
      return numberFormatter.currency.formatter(val, {
        symbol: "HK$",
      });
    case NumberFormatType.CurrencyHK2:
      return numberFormatter.currency.formatter(val, {
        symbol: "HK$",
        precision: 3,
      });
    case NumberFormatType.CurrencyHK3:
      return numberFormatter.currency.formatter(val, {
        symbol: "HK$",
        precision: 4,
      });
    case NumberFormatType.CurrencyHK4:
      return numberFormatter.currency.formatter(val, {
        symbol: "HK$",
        precision: 5,
      });
    case NumberFormatType.CurrencyHK5:
      return numberFormatter.currency.formatter(val, {
        symbol: "HK$",
        precision: 6,
      });
    case NumberFormatType.CurrencyHK6:
      return numberFormatter.currency.formatter(val, {
        symbol: "HK$",
        precision: 7,
      });
    case NumberFormatType.CurrencyHK7:
      return numberFormatter.currency.formatter(val, {
        symbol: "HK$",
        precision: 8,
      });
  }
}
