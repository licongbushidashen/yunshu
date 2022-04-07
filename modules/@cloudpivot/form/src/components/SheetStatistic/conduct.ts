import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { utils } from "@cloudpivot/common";

const DateHandle = utils.DateHandle;
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "widgetType"],
    },
    controller: {
      label: "控制属性",
      keys: ["statisticMode", "format"],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
      options: {
        disabled: true,
      },
    },
    widgetType: {
      ...baseAttribute.widgetType,
      value: "子表统计",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "子表统计",
    },
    statisticMode: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "sum",
      options: {
        list: [
          {
            value: "none",
            label: "不统计",
          },
          {
            value: "sum",
            label: "求和",
          },
          {
            value: "avg",
            label: "平均值",
          },
          {
            value: "min",
            label: "最小值",
          },
          {
            value: "max",
            label: "最大值",
          },
        ],
      },
    },
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "integer",
      options: {
        list: [
          {
            value: "none",
            label: "空",
          },
          {
            value: "integer",
            label: "2000",
          },
          {
            value: "tenths",
            label: "2,000.0",
          },
          {
            value: "percentile",
            label: "2,000.00",
          },
          {
            value: "Millimeter",
            label: "2,000.000",
          },
          {
            value: "tenThousand",
            label: "2,000.0000",
          },
          {
            value: "hundredThousand",
            label: "2,000.00000",
          },
          {
            value: "millionDecimals",
            label: "2,000.000000",
          },
          {
            value: "tenMillionDecimals",
            label: "2,000.0000000",
          },
          {
            value: "billionDecimals",
            label: "2,000.00000000",
          },
          {
            value: "ratio",
            label: "20%",
          },
          {
            value: "ratio.tenths",
            label: "20.0%",
          },
          {
            value: "ratio.percentile",
            label: "20.00%",
          },
          {
            value: "ratio.Millimeter",
            label: "20.000%",
          },
          {
            value: "ratio.tenThousand",
            label: "20.0000%",
          },
          {
            value: "ratio.hundredThousand",
            label: "20.00000%",
          },
          {
            value: "ratio.millionDecimals",
            label: "20.000000%",
          },
          {
            value: "ratio.tenMillionDecimals",
            label: "20.0000000%",
          },
          {
            value: "ratio.billionDecimals",
            label: "20.00000000%",
          },
          {
            value: "RMB.percentile",
            label: "￥2,000.00",
          },
          {
            value: "RMB.Millimeter",
            label: "￥2,000.000",
          },
          {
            value: "RMB.tenThousand",
            label: "￥2,000.0000",
          },
          {
            value: "RMB.hundredThousand",
            label: "￥2,000.00000",
          },
          {
            value: "RMB.millionDecimals",
            label: "￥2,000.000000",
          },
          {
            value: "RMB.tenMillionDecimals",
            label: "￥2,000.0000000",
          },
          {
            value: "RMB.billionDecimals",
            label: "￥2,000.00000000",
          },
          {
            value: "dollar.percentile",
            label: "$2,000.00",
          },
          {
            value: "dollar.Millimeter",
            label: "$2,000.000",
          },
          {
            value: "dollar.tenThousand",
            label: "$2,000.0000",
          },
          {
            value: "dollar.hundredThousand",
            label: "$2,000.00000",
          },
          {
            value: "dollar.millionDecimals",
            label: "$2,000.000000",
          },
          {
            value: "dollar.tenMillionDecimals",
            label: "$2,000.0000000",
          },
          {
            value: "dollar.billionDecimals",
            label: "$2,000.00000000",
          },
          {
            value: "euro.percentile",
            label: "€2,000.00",
          },
          {
            value: "euro.Millimeter",
            label: "€2,000.000",
          },
          {
            value: "euro.tenThousand",
            label: "€2,000.0000",
          },
          {
            value: "euro.hundredThousand",
            label: "€2,000.00000",
          },
          {
            value: "euro.millionDecimals",
            label: "€2,000.000000",
          },
          {
            value: "euro.tenMillionDecimals",
            label: "€2,000.0000000",
          },
          {
            value: "euro.billionDecimals",
            label: "€2,000.00000000",
          },
          {
            value: "HK.percentile",
            label: "HK$2,000.00",
          },
          {
            value: "HK.Millimeter",
            label: "HK$2,000.000",
          },
          {
            value: "HK.tenThousand",
            label: "HK$2,000.0000",
          },
          {
            value: "HK.hundredThousand",
            label: "HK$2,000.00000",
          },
          {
            value: "HK.millionDecimals",
            label: "HK$2,000.000000",
          },
          {
            value: "HK.tenMillionDecimals",
            label: "HK$2,000.0000000",
          },
          {
            value: "HK.billionDecimals",
            label: "HK$2,000.00000000",
          },
        ],
      },
    },
  },
} as ControllerConduct;
