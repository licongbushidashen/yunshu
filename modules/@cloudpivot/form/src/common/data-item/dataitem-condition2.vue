
<template>
  <div>
    <div class="row">
      <a-select v-model="type" @change="onChange" class="ml8 mr8">
        <a-select-option :value="1">全部</a-select-option>
        <a-select-option :value="2">任一</a-select-option>
      </a-select>条件
    </div>
    <div class="condContent">
      <a-row type="flex" v-for="(cond,index) in conditions" :key="index" class="rowStyle">
        <a-col :span="8">
          <a-config-provider :locale="locale">
          <a-select
            v-model="cond.propertyCode"
            @select="e => onItemSelect(cond)"
            @change="e => onItemChange(cond)"
            show-search
            :filter-option="filterOption"
          >
            <a-select-opt-group>
              <span slot="label" class="select-title">业务数据项</span>
              <template v-for="(i,index) in dataOptions">
                <a-select-option
                  :title="i.label"
                  v-if="!i.isSystem"
                  :key="index"
                  :value="i.value"
                >{{ i.label }}</a-select-option>
              </template>
            </a-select-opt-group>

            <a-select-opt-group>
              <span slot="label" class="select-title">系统数据项</span>

              <template v-for="(i,index) in dataOptions">
                <a-select-option
                  :title="i.label"
                  v-if="i.isSystem"
                  :key="index"
                  :value="i.value"
                >{{ i.label }}</a-select-option>
              </template>
            </a-select-opt-group>
          </a-select>
          </a-config-provider>
        </a-col>

        <a-col :span="6">
          <a-select
            :options="getOperators(cond.propertyType,cond.propertyCode)"
            v-model="cond.operatorType"
            @change="onChange(cond)"
          ></a-select>
        </a-col>

        <a-col :span="8" v-show="operatorAboutNull(cond.operatorType)"></a-col>

        <a-col :span="8" v-show="!operatorAboutNull(cond.operatorType)">
          <a-config-provider :locale="locale">
            <a-select v-if="isSequenceStatus(cond.propertyCode)" v-model="cond.value">
              <a-select-option :value="'DRAFT'">草稿</a-select-option>
              <a-select-option :value="'PROCESSING'">进行中</a-select-option>
              <a-select-option :value="'CANCELED'">已取消</a-select-option>
              <a-select-option :value="'COMPLETED'">已完成</a-select-option>
            </a-select>

            <a-input
              v-else-if="isText(cond.propertyType)  || isTime(cond.propertyType)"
              v-model="cond.value"
              :placeholder="isText(cond.propertyType) ? '请输入':isTime(cond.propertyType) ? '时间格式12:00:00' : ''"
              @change="onChange"
            ></a-input>

            <a-input-number
              v-else-if="isNumber(cond.propertyType)"
              v-model="cond.value"
              @change="onChange"
              placeholder="请输入"
            ></a-input-number>

            <a-date-picker
              v-else-if="isDate(cond.propertyType)"
              :defaultValue="cond.value"
              @change="(d,ds) => onDateChange(cond,ds)"
              placeholder="请选择日期"
            ></a-date-picker>

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
          </a-config-provider>
        </a-col>

        <a-col :span="1">
          <a-icon type="delete" @click="remove(index)"></a-icon>
        </a-col>
      </a-row>

      <div class="actions">
        <span @click="add" class="add-new">
          <i class="icon aufontAll h-icon-all-plus-o"></i>添加条件
        </span>
      </div>
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
  textDataLongItemOperators
} from "./data-item2";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

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

  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }

  getStaffSelectorOpts(cond: DataitemConditionItem) {
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: "请选择",
    }
    switch (cond.propertyType) {
      case DataItemType.StaffSingle:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = false;
        if([16,15].includes(cond.operatorType)){ // 位于/不位于
          obj.mulpitle = true;
        }
        if([11,12].includes(cond.operatorType)){ // 属于/不属于
          obj.mulpitle = true;
          obj.selectUser = false;
          obj.selectOrg = true;
        }
        break;
      case DataItemType.StaffMulti:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = true;
        if([11,12].includes(cond.operatorType)){ // 属于/不属于
          obj.mulpitle = true;
          obj.selectUser = false;
          obj.selectOrg = true;
        }
        break;
      case DataItemType.DeptSingle:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = false;
        if([16,15].includes(cond.operatorType)){ // 位于/不位于
          obj.mulpitle = true;
        }
        if([11,12].includes(cond.operatorType)){ // 属于/不属于
          obj.mulpitle = true;
        }
        if([13,14].includes(cond.operatorType)){ // 拥有/不拥有
          obj.mulpitle = true;
          obj.selectUser = true;
        }
        break;
      case DataItemType.DeptMulti:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = true;
        if([13,14].includes(cond.operatorType)){ // 拥有/不拥有
          obj.mulpitle = true;
          obj.selectUser = true;
        }
        break;

      case DataItemType.StaffDeptMix:
        if([11,12].includes(cond.operatorType)){ // 属于/不属于
          obj.selectUser = false;
        }
        break;
    }
    return obj;
  }

  getOperators(type: DataItemType, code: string) {
    switch (type) {
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
        return numberDataItemOperators;

      case DataItemType.Logic:
        return logicDataItemOperators;

      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
        if (code === "sequenceStatus") {
          return this.getOperatorsByCode(code);
        } else {
          return textDataItemOperators;
        }

      // 选人控件没有属于、不属于
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
        return staffDataItemOperators.slice(0, staffDataItemOperators.length - 2);
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return staffDataItemOperators;
      case DataItemType.RelevanceForm:
      case DataItemType.RelevanceFormEx:
        return relevanceFormDataItemOperators;
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
      [
        DataItemType.ShortText,
        DataItemType.LongText,
        DataItemType.Checkbox,
        DataItemType.Radio,
        DataItemType.DropdownMulti,
        DataItemType.Dropdown
      ].includes(type)
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
    return type === DataItemType.StaffSingle || type === DataItemType.StaffMulti || type === DataItemType.DeptSingle || type === DataItemType.DeptMulti || type === DataItemType.StaffDeptMix;
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
              // item.type !== DataItemType.RelevanceForm &&
              // item.type !== DataItemType.StaffSingle &&
              item.type !== DataItemType.Address
          )
          .map((item) => {
            let disabled = false;

            const code = item.parentCode
              ? `${item.parentCode}.${item.code}`
              : item.code;

            if (this.conditions.length > 0) {
              const c = this.conditions.find(
                (co: any) => co.propertyCode === code
              );

              if (c) {
                c.propertyType = item.type;
                disabled = true;
              }
            }

            let sheet = items.find((x) => x.code === item.parentCode);
            let label = item.parentCode
              ? `${item.name}[${item.parentCode}.${item.code}]`
              : `${item.name}[${item.code}]`;
            if(sheet) {
                label = item.parentCode
              ? `${sheet.name}.${item.name}[${item.parentCode}.${item.code}]`
              : `${item.name}[${item.code}]`;
            }
            

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

    if (val.conditions.length > 0) {
      this.conditions = val.conditions.slice(0);
    } else {
      this.conditions = [];
    }
  }

  add() {
    const item = this.dataOptions.find(op => !op.disabled);
    if (!item) {
      this.$message.error('已无更多数据选项')
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
      Array.isArray(cond.value) && [DataItemType.StaffSingle, DataItemType.StaffMulti, DataItemType.DeptSingle, DataItemType.DeptMulti].includes(cond.propertyType) ? cond.value = [] : cond.value = '';

      const operators = this.getOperators(item.type, item.value);
      if (operators) {
        cond.operatorType = operators[0].value;
      }

      item.disabled = true;
    }
    this.onChange(cond);
  }

  onDateChange(cond: DataitemConditionItem, dateText: string) {
    cond.value = dateText;
    this.onChange(cond);
  }

  onChange(cond?: any) {
    if (cond && cond.value && Array.isArray(cond.value)) {
      cond.value = [];
    }
    // debugger
    // cond && Array.isArray(cond.value) ? cond.value = [] : cond.value = '';
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

  filterOption(input: any, option: any){
    return option.componentOptions.children &&
    option.componentOptions.children[0].text &&
    option.componentOptions.children[0].text.toLowerCase().indexOf(input.trim().toLowerCase()) >= 0
  }
}
</script>

<style lang="less" scoped>
/deep/.ant-row-flex {
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
  padding: 10px 0;
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
.condContent {
  margin: 10px 0;
  background: #F4F5F8;
  border-radius: 4px;
}
.rowStyle {
  padding: 10px 0 0 10px;
}
</style>
