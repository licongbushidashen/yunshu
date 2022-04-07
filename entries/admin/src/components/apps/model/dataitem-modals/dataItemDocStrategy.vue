<template>
  <div>
    <a-form-item
      :labelCol="{ span: 4 }"
      :wrapperCol="{ span: 12 }"
      labelAlign="left"
      label="流水号编码"
    >
      <a-input v-model="options.prefix"/>
    </a-form-item>
    <a-form-item
      :labelCol="{ span: 4 }"
      labelAlign="left"
      :wrapperCol="{ span: 12 }"
      label="最大长度"
    >
      <a-select
        class="data-item-select-content"
        style="width: 100%"
        v-model="options.maxLength"
      >
        <a-select-option :key="i.value" :value="i.value" v-for="i in maxLengthList">{{i.label}}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item
      :labelCol="{ span: 4 }"
      labelAlign="left"
      :wrapperCol="{ span: 12 }"
      label="重置策略时间"
    >
      <a-radio-group name="radioGroup" v-model="options.resetDate">
        <a-radio :key="i.value" :value="i.value" v-for="i in resetDateList">{{i.label}}</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item
      :labelCol="{ span: 4 }"
      labelAlign="left"
      :wrapperCol="{ span: 12 }"
      label="连接符"
    >
      <a-radio-group name="radioGroup" v-model="options.delimiter">
        <a-radio :key="i.value" :value="i.value" v-for="i in delimiterList">{{i.label}}</a-radio>
      </a-radio-group>
    </a-form-item>
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {utils} from "@cloudpivot/common";
  import {DataItemType} from "@cloudpivot/form/schema";

  export enum DataEnum {
    none = 1,
    DAY = 10,
    MONTH = 8,
    YEAR = 6
  }
  
  const DateHandle = utils.DateHandle;
  @Component({
    name: "DataItemDocStrategy",
    components: {},
  })
  export default class DataItemDocStrategy extends Vue {
    @Prop() dataType: any;
    @Prop() options: any;
    DataItemTypes = DataItemType;
    resetDateList = [
      {
        value: "none",
        label: "不重置",
      },
      {
        value: "DAY",
        label: "每天",
      },
      {
        value: "MONTH",
        label: "每月",
      },
      {
        value: "YEAR",
        label: "每年",
      },
    ];
    maxLengthList = [
      {
        value: "4",
        label: "4",
      },
      {
        value: "5",
        label: "5",
      },
      {
        value: "6",
        label: "6",
      },
      {
        value: "7",
        label: "7",
      },
      {
        value: "8",
        label: "8",
      },
      {
        value: "9",
        label: "9",
      },
      {
        value: "10",
        label: "10",
      },
    ];
    delimiterList = [
      {
        value: "mark1",
        label: "-",
      },
      {
        value: "mark2",
        label: "#",
      },
      {
        value: "mark3",
        label: "_",
      },
    ];

    created(): void {
    }
  }
</script>
<style lang='less' scoped>

</style>
