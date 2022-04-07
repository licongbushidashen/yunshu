
<template>
  <div :style="customStyle ? customStyle.bgStyle : ''" class="data-range-setting-wrap">
    <a-row class="mappingHeader" type="flex" justify="space-between">
      <a-col :span="8" class="fieldlab">数据名称</a-col>
      <a-col :span="6" class="fieldlab">操作符</a-col>
      <a-col :span="8" class="fieldlab">值</a-col>
      <a-col :span="2" class="fieldlab">删除</a-col>
    </a-row>
    <a-row type="flex" v-for="(cond,index) in conditions" :key="index">
      <a-col :span="8">
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
              <a-select-option v-if="!i.isSystem" :key="index" :title="i.label" :value="i.value">{{ i.label }}</a-select-option>
            </template>
          </a-select-opt-group>

          <a-select-opt-group>
            <span slot="label" class="select-title">系统数据项</span>

            <template v-for="(i,index) in dataOptions">
              <a-select-option v-if="i.isSystem" :key="index" :title="i.label" :value="i.value">{{ i.label }}</a-select-option>
            </template>
          </a-select-opt-group>
        </a-select>
      </a-col>

      <a-col :span="6">
        <a-select
          :options="getOperators(cond.propertyType,cond.propertyCode)"
          v-model="cond.operatorType"
          @change="onChange"
          :getPopupContainer="getPopupContainer"
        ></a-select>
      </a-col>

      <a-col :span="8" v-show="operatorAboutNull(cond.operatorType)"></a-col>

      <a-col :span="8" v-show="!operatorAboutNull(cond.operatorType)">
        <a-select v-if="isSequenceStatus(cond.propertyCode)" v-model="cond.value" :getPopupContainer="getPopupContainer">
          <a-select-option :value="'DRAFT'">草稿</a-select-option>
          <a-select-option :value="'PROCESSING'">进行中</a-select-option>
          <a-select-option :value="'CANCELED'">已取消</a-select-option>
          <a-select-option :value="'COMPLETED'">已完成</a-select-option>
        </a-select>

        <a-input
          v-else-if="isText(cond.propertyType)  || isTime(cond.propertyType)"
          v-model="cond.value"
          :placeholder="isDate(cond.propertyType) ? '日期格式2019-05-10 12:00:00':isTime(cond.propertyType) ? '时间格式12:00:00' : [7,8].includes(cond.operatorType) ? '请输入，多个值以“;”连接' : '请输入'"
          @change="onChange"
        ></a-input>

        <a-input-number
          v-else-if="isNumber(cond.propertyType)"
          v-model="cond.value"
          @change="onChange"
        ></a-input-number>

        <a-date-picker
          v-else-if="isDate(cond.propertyType)"
          :defaultValue="cond.value"
          @change="(d,ds) => onDateChange(cond,ds)"
        ></a-date-picker>

        <a-select v-else-if="isLogic(cond.propertyType)" v-model="cond.value" :getPopupContainer="getPopupContainer">
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

    <div class="add" v-if="dataOptions.length">
      <span>
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span @click="add()">新增条件</span>
      </span>
    </div>
    <div class="message" v-else>请检查是否配置了业务模型</div>
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
} from "./data-item2";

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

  @Prop()
  customStyle!: Object;

  @Model("change")
  value!: DataitemConditionValue;

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
      // 选人控件没有拥有、不拥有
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
        return staffDataItemOperators.slice(0, staffDataItemOperators.length - 2);
      
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return staffDataItemOperators;

      case DataItemType.RelevanceForm:
        return relevanceFormDataItemOperators;
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
    return [
      DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix
    ].includes(type)
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
              item.type !== DataItemType.Address
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

  getPopupContainer(triggerNode:any) {
    return triggerNode.parentNode;
  }

  @Watch("$i18n.locale")
  onLanguageChange(l: string) {
    this.placeHolderLang();
  }

  filterOption(input, option) {
    return option.componentOptions.children && 
    option.componentOptions.children[0].text &&
    option.componentOptions.children[0].text.toLowerCase().indexOf(input.trim().toLowerCase()) >= 0
  }
}
</script>

<style lang="less" scoped>
.data-range-setting-wrap {
  background: #F4F5F8;
  border-radius: 4px;
}

.fieldlab {
  color: #000;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
}

/deep/.ant-row-flex {
  padding: 5px 10px;

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
.ml8 {
  margin-left: 8px;
}

.mr8 {
  margin-right: 8px;
}

.add {
    color: #00C293;
    font-weight: 400;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    line-height: 48px;
    span {
      margin-top: 16px;
      margin-right: 8px;
    }
  }
</style>
