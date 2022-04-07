
<template>
  <div>
    <div class="row">
      满足以下
      <a-select v-model="type" @change="onChange" class="ml8 mr8">
        <a-select-option :value="1">全部</a-select-option>
        <a-select-option :value="2">任一</a-select-option>
      </a-select>条件
    </div>

    <a-row type="flex" v-for="(cond,index) in conditions" :key="index">
      <a-col :span="8">
        <a-select
          v-model="cond.propertyCode"
          @select="e => onItemSelect(cond)"
          @change="e => onItemChange(cond)"
        >
          <a-select-opt-group>
            <span slot="label" class="select-title">业务数据项</span>
            <template v-for="(i,index) in dataOptions">
              <a-select-option :key="index" :value="i.value">{{ i.label }}</a-select-option>
            </template>
          </a-select-opt-group>
        </a-select>
      </a-col>

      <a-col :span="6">
        <a-select
          :options="getOperators(cond.propertyType,cond.propertyCode)"
          v-model="cond.operatorType"
          @change="onChange"
        ></a-select>
      </a-col>

      <a-col :span="8" v-show="operatorAboutNull(cond.operatorType)"></a-col>

      <a-col :span="8" v-show="!operatorAboutNull(cond.operatorType)">
        <a-input
          v-if="isText(cond.propertyType) || isDate(cond.propertyType) || isTime(cond.propertyType)"
          v-model="cond.value"
          :placeholder="isDate(cond.propertyType) ? '日期格式2019-05-10 12:00:00':isTime(cond.propertyType) ? '时间格式12:00:00' : ''"
          @change="onChange"
        ></a-input>

        <a-input-number
          v-else-if="isNumber(cond.propertyType)"
          v-model="cond.value"
          @change="onChange"
        ></a-input-number>

        <a-select v-else-if="isLogic(cond.propertyType)" v-model="cond.value">
          <a-select-option :value="1">true</a-select-option>
          <a-select-option :value="0">false</a-select-option>
        </a-select>

        <!-- isSequenceStatus -->

        <staff-selector
          v-else-if="isStaffSelector(cond.propertyType)"
          v-model="cond.value"
          :options="getStaffSelectorOpts(cond)"
          @change="onChange"
        ></staff-selector>
      </a-col>

      <a-col :span="1">
        <a-icon type="delete" @click="remove(index)"></a-icon>
      </a-col>
    </a-row>

    <div class="actions">
      <!--<a-button icon="plus" @click="add">新增条件</a-button>-->
      <span @click="add" class="add-new">
        <i class="icon aufontAll h-icon-all-plus-o"></i>新增条件
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Model } from "vue-property-decorator";

import { DataItemType, NumberFormatType } from "@cloudpivot/form/schema";

import StaffSelector from "@cloudpivot/form/src/renderer/components/shared/staff-selector.vue";

import { Select, Row, Col } from "@h3/antd-vue";
import {
  textDataItemOperators,
  numberDataItemOperators,
  logicDataItemOperators,
  DataItem,
  DateItemOperatorType,
  sequenceStatusOperators,
  staffDataItemOperators,
  relevanceFormDataItemOperators,
} from "./tab-data-item";

export interface DataitemConditionItem {
  propertyCode: string;

  propertyType: DataItemType;

  operatorType: DateItemOperatorType;

  value: any;
}

export interface DataitemConditionValue {
  type: number;

  conditions: DataitemConditionItem[];
}

@Component({
  name: "dataitem-condition",
  components: {
    ASelect: Select,
    ARow: Row,
    ACol: Col,
    ASelectOption: Select.Option,
    StaffSelector,
  },
})
export default class DataitemCondition extends Vue {
  @Prop()
  items!: Array<DataItem>;

  @Model("change")
  value!: DataitemConditionValue;

  type = 1;

  conditions: DataitemConditionItem[] = [];

  dataOptions: {
    label: string;
    value: string;
    type: DataItemType;
    disabled: boolean;
  }[] = [];

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "",
  };

  getStaffSelectorOpts(cond: DataitemConditionItem) {
    const opts = Object.assign({}, this.staffSelectorOpts);
    if (
      cond.operatorType === DateItemOperatorType.Of ||
      cond.operatorType === DateItemOperatorType.NotOf
    ) {
      opts.selectUser = false;
      // opts.mulpitle = false;
    }
    // else if(cond.operatorType === DateItemOperatorType.Have || cond.operatorType === DateItemOperatorType.NotHave){
    //   // opts.selectOrg = false;
    //   opts.mulpitle = true;
    // }
    return opts;
  }

  getOperators(type: DataItemType, code: string) {
    switch (type) {
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
        return numberDataItemOperators;

      case DataItemType.Logic:
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
        return textDataItemOperators;

      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return staffDataItemOperators;
    }
  }

  getOperatorsByCode(code: string) {
    switch (code) {
      case "sequenceStatus":
        return sequenceStatusOperators;
    }
  }

  isText(type: DataItemType) {
    return (
      type === DataItemType.ShortText || type === DataItemType.LongText
      //  || type === DataItemType.StaffSingle
    );
  }

  isNumber(type: DataItemType) {
    return type === DataItemType.Number;
  }

  isDate(type: DataItemType) {
    return type === DataItemType.Date;
  }

  isTime(type: DataItemType) {
    return type === DataItemType.Time;
  }

  isLogic(type: DataItemType) {
    return type === DataItemType.Logic;
  }

  isStaffSelector(type: DataItemType) {
    return type === DataItemType.StaffSingle;
  }

  isSequenceStatus(code: string) {
    // 
    return code === "sequenceStatus";
  }

  operatorAboutNull(type: DateItemOperatorType) {
    return (
      type === DateItemOperatorType.IsNull ||
      type === DateItemOperatorType.IsNotNull
    );
  }

  @Watch("items", {
    immediate: true,
  })
  onItemsChange(items: DataItem[]) {
    if (items) {
      setTimeout(() => {
        this.dataOptions = items
          .filter(
            (item) =>
              item.type !== DataItemType.Attachment &&
              item.type !== DataItemType.ApprovalOpinion &&
              item.type !== DataItemType.Sheet &&
              item.type !== DataItemType.RelevanceForm &&
              item.type !== DataItemType.Address &&
              !item.isSystem
          )
          .map((item) => {
            let disabled = false;

            const code = item.parentCode
              ? `${item.parentCode}.${item.code}`
              : item.code;

            if (this.conditions) {
              const c = this.conditions.find(
                (co: any) => co.propertyCode === code
              );

              if (c) {
                c.propertyType = item.type;
                disabled = true;
              }
            }

            const label = item.parentCode
              ? `${item.name}[${item.parentCode}.${item.code}]`
              : `${item.name}[${item.code}]`;

            return {
              label,
              value: code,
              type: item.type,
              isSystem: item.isSystem,
              disabled,
            };
          });
        // this.add();
      }, 10);
    }
  }

  @Watch("value", {
    immediate: true,
  })
  onValueChange(val: DataitemConditionValue) {
    if (!val) {
      return;
    }

    if (val.type) {
      this.type = val.type;
    }

    if (val.conditions) {
      this.conditions = val.conditions.slice(0);
    } else {
      this.conditions = [];
    }
  }

  add() {
    const item = this.dataOptions.find((op) => !op.disabled);
    if (!item) {
      return;
    }

    const operators = this.getOperators(item.type, item.value);
    if (!operators) {
      return;
    }

    item.disabled = true;

    this.conditions.push({
      propertyCode: item.value,
      propertyType: item.type,
      operatorType: operators[0].value,
      value: "",
    });

    this.onChange();
  }

  remove(index: number) {
    const item = this.dataOptions.find(
      (op) => op.value === this.conditions[index].propertyCode
    );
    if (item) {
      item.disabled = false;
    }

    this.conditions.splice(index, 1);
    this.onChange();
  }

  onItemSelect(cond: DataitemConditionItem) {
    const item = this.dataOptions.find((x) => x.value === cond.propertyCode);
    if (item) {
      item.disabled = false;
    }
  }

  onItemChange(cond: DataitemConditionItem) {
    const item = this.dataOptions.find((x) => x.value === cond.propertyCode);
    if (item) {
      cond.propertyType = item.type;
      cond.value = "";

      const operators = this.getOperators(item.type, item.value);
      if (operators) {
        cond.operatorType = operators[0].value;
      }

      item.disabled = true;
    }
    this.onChange();
  }

  onDateChange(cond: DataitemConditionItem, dateText: string) {
    cond.value = dateText;
    this.onChange();
  }

  onChange() {
    const value = {
      type: this.type,
      conditions: this.conditions,
    };
    this.$emit("change", value);
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t(
      "Languages.Apps.PlzSetOrgOrUser"
    ) as string;
  }

  @Watch("$i18n.locale")
  onLanguageChange(l: string) {
    this.placeHolderLang();
  }
}
</script>

<style lang="less" scoped>
/deep/.ant-row-flex {
  margin: 20px 0;

  & > div > *:not(i) {
    width: 100%;
  }
}

/deep/.ant-col-6,
/deep/.ant-col-8 {
  display: flex;
  // align-items: center;
  padding-right: 10px;
}

/deep/.ant-col-1 {
  display: flex;
  padding-top: 0.5em;
  // align-items: center;
  // justify-content: center;

  & > i {
    cursor: pointer;
  }
}

.row {
  display: flex;
  align-items: center;
}

.actions {
  text-align: center;
  .add-new {
    font-size: 14px;
    color: @primary-color;
    cursor: pointer;
    i {
      padding-right: 5px;
      font-size: 14px;
    }
  }
  & > button {
    border: 0;
  }
}
.ml8 {
  margin-left: 8px;
}

.mr8 {
  margin-right: 8px;
}
</style>
