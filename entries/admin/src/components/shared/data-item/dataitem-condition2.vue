<template>
  <div>
    <div class="row">
      满足以下
      <a-select v-model="type" @change="onChange" style="width: 92px" class="ml8 mr8">
        <a-select-option :value="1">全部</a-select-option>
        <a-select-option :value="2">任一</a-select-option>
      </a-select>
      条件
    </div>

    <div class="format-content">
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
                <a-select-option v-if="!i.isSystem" :title="i.label" :key="index" :value="i.value">{{
                    i.label
                  }}
                </a-select-option>
              </template>
            </a-select-opt-group>

            <a-select-opt-group>
              <span slot="label" class="select-title">系统数据项</span>

              <template v-for="(i,index) in dataOptions">
                <a-select-option v-if="i.isSystem" :title="i.label" :key="index" :value="i.value">{{
                    i.label
                  }}
                </a-select-option>
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
          <a-select show-search v-if="isSequenceStatus(cond.propertyCode)" v-model="cond.value">
            <a-select-option :value="'DRAFT'">草稿</a-select-option>
            <a-select-option :value="'PROCESSING'">进行中</a-select-option>
            <a-select-option :value="'CANCELED'">已取消</a-select-option>
            <a-select-option :value="'COMPLETED'">已完成</a-select-option>
          </a-select>

          <a-input
              v-else-if="isText(cond.propertyType) || isTime(cond.propertyType)"
              v-model="cond.value"
              :placeholder="isDate(cond.propertyType) ? '日期格式2019-05-10 12:00:00':isTime(cond.propertyType) ? '时间格式12:00:00' : ''"
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

          <a-select show-search v-else-if="isLogic(cond.propertyType)" v-model="cond.value">
            <a-select-option :value="1">true</a-select-option>
            <a-select-option :value="0">false</a-select-option>
          </a-select>

          <!-- isSequenceStatus -->
          <staff-selector
              v-else-if="isStaffSelector(cond.propertyType)"
              v-model="cond.value"
              :onlyForm="true"
              :options="getStaffSelectorOpts(cond)"
              @change="onChange"
          ></staff-selector>
        </a-col>

        <a-col :span="1">
          <!-- <i @click="remove(index, cond)" class="icon aufontAll h-icon-all-delete-o"></i> -->
          <a-icon @click="remove(index, cond)" type="delete" />
        </a-col>
      </a-row>

      <div class="actions" v-if="setConList">
        <!--<a-button icon="plus" @click="add">新增条件</a-button>-->
        <span @click="add" class="add-new">
        <i class="icon aufontAll h-icon-all-plus-o"></i>新增条件
      </span>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, Watch, Model} from "vue-property-decorator";

import {DataItemType, NumberFormatType} from "@cloudpivot/form/schema";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import uniq from 'lodash/uniq';
import {Select, Row, Col} from "@h3/antd-vue";
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

  @Model("change")
  value!: DataitemConditionValue;

  @Prop({
    type: Object,
  })
  currControlOptions!: any;

  @Prop()
  currentPropertyCode?: string;

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

      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.StaffSingle:
        return staffDataItemOperators.filter(item => {
            return item.value !== 13 && item.value !== 14
          })
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
    return [
      DataItemType.ShortText,
      DataItemType.LongText,
      DataItemType.DropdownMulti,
      DataItemType.Radio,
      DataItemType.Checkbox,
      DataItemType.Dropdown
    ].includes(type)
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
    return (
        type === DataItemType.StaffSingle || type === DataItemType.StaffDeptMix || type === DataItemType.DeptMulti
        || type === DataItemType.StaffMulti || type === DataItemType.DeptSingle
    );
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
      this.conditions = [];
      // 校验数据项是否子表
      let isSubItem:boolean = false;
      if (this.currControlOptions) {
        isSubItem = this.currControlOptions.isSubItem;
      }
      setTimeout(() => {
        this.dataOptions = items
            .filter(
                (item:any) => item.type !== DataItemType.Attachment &&
                    item.type !== DataItemType.ApprovalOpinion &&
                    item.type !== DataItemType.Sheet &&
                    item.type !== DataItemType.Address &&
                    item.code !== this.currentPropertyCode
            )
            .map((item:any) => {
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
              const itemFinal:any = {
                label,
                value: code,
                type: item.type,
                isSystem: item.isSystem,
                disabled,
                isSubItem: item.isSubItem || false,
              };
              return itemFinal;
            })
            .filter((item:any) => {
              if (isSubItem) { // 子表数据
                return item;
              } else { // 主表数据
                return !item.isSubItem;
              }
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

  get setConList() {
    if (this.conditions.length > 0) {
      const conditions: any = this.conditions.map((item: any) => item.propertyCode)
          .filter((inner: any) => inner);
      const finalList = uniq(conditions);
      console.log(finalList, 'finalList');
      return !(finalList && (this.dataOptions.length === finalList.length));
    }
    return true;
  }

  add() {
    const item: any = this.dataOptions.find((op) => !op.disabled);
    // if (!item) {
    //   return;
    // }
    console.log(this.dataOptions, 'this.dataOptions');
    if (item) {
      item.disabled = true;
      const operators = this.getOperators(item.type, item.value);
      if (!operators) {
        return;
      }
      this.conditions.push({
        propertyCode: item.value,
        propertyType: item.type,
        operatorType: operators[0].value,
        value: "",
      });
      this.onChange();
    }
  }

  remove(index: number, cond: any) {
    // console.log(cond, 'cond');
    const item: any = this.dataOptions.find(
        (op) => op.value === this.conditions[index].propertyCode
    );
    if (item) {
      item.disabled = false;
      this.$set(this.conditions, item, index);
    }
    this.conditions.splice(index, 1);
    this.onChange();
  }

  onItemSelect(cond: DataitemConditionItem) {
    const item = this.dataOptions.find((x) => x.value === cond.propertyCode);
    this.dataOptions.forEach((s: any) => {
      const select = this.conditions.find((inner:any) => inner.propertyCode === s.value);
      if(select) {
      } else {
        s.disabled = false;
      }
    })
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

  filterOption(input: any, option: any){
    return option.componentOptions.children && 
    option.componentOptions.children[0].text &&
    option.componentOptions.children[0].text.toLowerCase().indexOf(input.trim().toLowerCase()) >= 0
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-row-flex {
  margin: 8px 0;

  & > div > *:not(i) {
    width: 100%;
  }
}

.format-content {
  background: #F4F5F8;
  border-radius: 4px;
  padding: 6px 10px 6px 10px;
  margin-top: 8px;
  max-height: 300px;
  overflow: auto;
}

/deep/ .ant-col-6,
/deep/ .ant-col-8 {
  display: flex;
  // align-items: center;
  padding-right: 10px;
}

/deep/ .ant-col-1 {
  display: flex;
  padding-top: 3px;
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

.h3-organization {
  background: #fff;
}
</style>
