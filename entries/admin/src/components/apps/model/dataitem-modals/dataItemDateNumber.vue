<template>
  <div>
    <a-form-item
        :labelCol="{ span: 4 }"
        :wrapperCol="{ span: 12 }"
        label="默认格式"
        labelAlign="left"
    >
      <a-select
          class="data-item-select-content"
          style="width: 100%"
          @change="changeDate"
          v-model="value"
      >
        <a-select-option :key="i.value" :value="i.value" v-for="i in typeList">{{ i.label }}</a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<script lang='ts'>
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {utils} from "@cloudpivot/common";
import {DataItemType} from "@cloudpivot/form/schema";

const DateHandle = utils.DateHandle;
@Component({
  name: "DataItemDateNumber",
  components: {},
})
export default class DataItemDateNumber extends Vue {
  @Prop() dataType: any;

  @Prop() options: any;
  value: any = '';

  // @Watch("options", {
  //   immediate: true,
  //   deep: true
  // })
  // optionsChange(v: any) {
  //   console.log(v, 'v---')
  //   this.value="";
  //   this.value = v.format
  // }

  DataItemTypes = DataItemType;

  dateList = [
    {
      value: "YYYY",
      label: DateHandle.dateFormat(new Date(), "YYYY"),
    },
    {
      value: "YYYY-MM",
      label: DateHandle.dateFormat(new Date(), "YYYY-MM"),
    },
    {
      value: "YYYY-MM-DD",
      label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD"),
    },
    {
      value: "YYYY-MM-DD HH:mm",
      label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm"),
    },
    {
      value: "YYYY-MM-DD HH:mm:ss",
      label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm:ss"),
    },
    {
      value: "YYYY-MM-DD CN-APM",
      label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM"),
    },
    {
      value: "YYYY-MM-DD CN-APM HH:mm",
      label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD CN-APM HH:mm"),
    },
    {
      value: "YYYY-MM-DD EN-APM",
      label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM"),
    },
    {
      value: "YYYY-MM-DD EN-APM HH:mm",
      label: DateHandle.dateFormatApm(new Date(), "YYYY-MM-DD EN-APM HH:mm"),
    },
  ];

  numberList = [
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
  ];

  get typeList() {
    this.value=this.options.format;
    if (this.dataType === this.DataItemTypes.Number) {
      return this.numberList
    } else if (this.dataType === this.DataItemTypes.Date) {
      return this.dateList
    }
  }

  changeDate(value: any) {
    // console.log(value,'v');
    this.$emit('handChangeFormat', value);
    // console.log(this.options,'options')
  }

  created(): void {
    console.log(this.options, 'options')
  }
}
</script>
<style lang='less' scoped>

</style>
