
<template>
  <div>
    <div class="row">
      满足以下
      <a-select v-model="type" class="ml8 mr8">
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
              <a-select-option v-if="!i.isSystem" :key="index" :value="i.value">{{ i.label }}</a-select-option>
            </template>
          </a-select-opt-group>
          <a-select-opt-group>
            <span slot="label" class="select-title">系统数据项</span>
            <template v-for="(i,index) in dataOptions">
              <a-select-option v-if="i.isSystem" :key="index" :value="i.value">{{ i.label }}</a-select-option>
            </template>
          </a-select-opt-group>
        </a-select>
      </a-col>

      <a-col :span="6">
        <a-select
          :options="getOperators(cond.propertyType,cond.propertyCode)"
          v-model="cond.operatorType"
          @change="onOperationChange(cond)"
        ></a-select>
      </a-col>

      <a-col :span="8" v-show="operatorAboutNull(cond.operatorType)"></a-col>

      <a-col :span="8" v-show="!operatorAboutNull(cond.operatorType)">
        <a-select show-search v-if="isSequenceStatus(cond.propertyCode)" v-model="cond.value">
          <a-select-option :value="'PROCESSING'">进行中</a-select-option>
          <a-select-option :value="'CANCELED'">已取消</a-select-option>
          <a-select-option :value="'COMPLETED'">已完成</a-select-option>
        </a-select>

        <a-select
          show-search
          v-else-if="showSelfInput(cond)"
          @change="onChange"
          v-model="cond.value"
        >
          <a-select-option v-if="showSelf_P(cond)" value="SELF_P">本人</a-select-option>
          <a-select-option v-if="showSelf_D(cond)" value="SELF_D">本部门</a-select-option>
        </a-select>
        <a-input v-else-if="isText(cond.propertyType)" v-model="cond.value" @change="onChange"></a-input>

        <a-date-picker
          v-else-if="isDate(cond.propertyType)"
          :showTime="true"
          class="time-select"
          format="YYYY-MM-DD HH:mm:ss"
          v-model="cond.value"
          @change="onChange"
        />

        <a-time-picker
          v-else-if="isTime(cond.propertyType)"
          class="time-select"
          format="HH:mm:ss"
          v-model="cond.value"
          @change="onChange"
        />

        <a-input-number
          v-else-if="isNumber(cond.propertyType)"
          v-model="cond.value"
          @change="onChange"
        ></a-input-number>

        <!-- <a-date-picker
          v-else-if="isDate(cond.propertyType)"
          :defaultValue="cond.value"
          @change="(d,ds) => onDateChange(cond,ds)"
        ></a-date-picker>-->

        <a-select show-search v-else-if="isLogic(cond.propertyType)" v-model="cond.value">
          <a-select-option value="1">true</a-select-option>
          <a-select-option value="0">false</a-select-option>
        </a-select>

        <!-- isSequenceStatus -->

        <staff-selector
          v-else-if="isStaffSelector(cond.propertyType)"
          v-model="cond.value"
          :keepDeptIds="cond.keepDeptIds ? cond.keepDeptIds : []"
          :options="getStaffSelectorOpts(cond)"
          :params="{filterType: 'admin' }"
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

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

import { formApi } from "@cloudpivot/api";

import moment from "moment";

import { Select, Row, Col } from "@h3/antd-vue";
import {
  businessDataItemOperators,
  textDataItemOperators,
  systemTextDataItemOperators,
  numberDataItemOperators,
  logicDataItemOperators,
  DataItem,
  DateItemOperatorType,
  sequenceStatusOperators,
  staffDataItemOperators,
  bussinessStaffDataItemOperators,
} from "./data-item";
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
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: "请选择组织",
  };

  isShow: boolean = true;

  mounted() {
    this.isShow = this.conditions && !!this.conditions.length;
  }

  showSelf_P(cond: DataitemConditionItem){
    const item: any = this.dataOptions.find(
      (x) => x.value === cond.propertyCode
    );
    if (!item) return false;
    let res = [
      DataItemType.StaffSingle, 
      DataItemType.StaffMulti,
      DataItemType.StaffDeptMix
    ].includes(item.type) && !item.isSystem;
     return res
  }
  showSelf_D(cond: DataitemConditionItem){
    const item: any = this.dataOptions.find(
      (x) => x.value === cond.propertyCode
    );
    if (!item) return false;
    let res = [
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix
    ].includes(item.type) && !item.isSystem;
     return res
  }

  showSelfInput(cond: DataitemConditionItem) {
    const item: any = this.dataOptions.find(
      (x) => x.value === cond.propertyCode
    );
    if (!item) return false;
    let res = [
      DataItemType.StaffSingle, 
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix
    ].includes(item.type) && !item.isSystem;
    // 设置默认值
    // if (res) {
    //   cond.value = 'SELF_P'
    // }
    return res;
    // return !item.isSystem && item.
  }
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
    let dataItemOperators: any[] = [];

    const item = this.items.find((x) => x.code === code);
    if (!item) {
      return;
    }

    const isSystem = item.isSystem;

    switch (type) {
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
        dataItemOperators = numberDataItemOperators;
        break;

      case DataItemType.Logic:
        dataItemOperators = logicDataItemOperators;
        break;

      case DataItemType.ShortText:
      case DataItemType.LongText:
        if (code === "sequenceStatus") {
          dataItemOperators = sequenceStatusOperators;
        } else {
          dataItemOperators = textDataItemOperators
        }
        break;

      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti: 
        if (code === "sequenceStatus") {
          dataItemOperators = sequenceStatusOperators;
        } else {
          let result = textDataItemOperators.filter((item: any) => item.value !== 1 && item.value !== 2)
          dataItemOperators = result
        }       
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        dataItemOperators = staffDataItemOperators;
        break;
    }

    if (isSystem) {
      dataItemOperators = dataItemOperators.filter(
        (op: any) => !this.operatorAboutNull(op.value)
      );
    }
    // 迭代26 业务数据新增选人控件
    if ( [
      DataItemType.StaffSingle, 
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix
    ].includes(type) && !isSystem) {
      dataItemOperators = bussinessStaffDataItemOperators;
    }
    // const arr = ["id","name","creater","createdDeptId","owner","ownerDeptId","createdTime","modifier","modifiedTime","workflowInstanceId","sequenceNo","sequenceStatus","ownerDeptQueryCode"];
    // if(arr.indexOf(code)=== -1){
    //   dataItemOperators = businessDataItemOperators.concat(dataItemOperators);
    // }
    return dataItemOperators;
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
      this.isShow = false;
      setTimeout(() => {
        // console.log('items::',items);
        this.dataOptions = items
          .filter(
            (item) =>
              item.type !== DataItemType.Attachment &&
              item.type !== DataItemType.ApprovalOpinion &&
              item.type !== DataItemType.Sheet &&
              item.type !== DataItemType.RelevanceForm &&
              item.type !== DataItemType.RelevanceFormEx &&
              // && item.type !== DataItemType.StaffSingle
              item.type !== DataItemType.Address
          )
          .map((item) => {
            let disabled = false;

            if (this.conditions) {
              this.conditions
                .filter((co: any) => co.propertyCode === item.code)
                .forEach((co: any) => {
                  co.propertyType = item.type;
                  disabled = true;
                });
            }

            return {
              value: item.code,
              label: `${item.name}[${item.code}]`,
              type: item.type,
              isSystem: item.isSystem,
              disabled,
            };
          });
        // console.log('data::',JSON.stringify(this.dataOptions));
        // this.add();

        // 需要调用接口判断是否能删除
        if (!this.conditions) return;
        if (!this.conditions.length) {
          this.isShow = true;
          return;
        }
        const tasks: any = [];
        this.conditions.forEach((co: any) => {
          if (this.isStaffSelector(co.propertyType)) {
            if(co.value && typeof co.value === 'string'){
              co.value = JSON.parse(co.value)
            }
            if (co.value[0] && Array.isArray(co.value)) {
              let sType: string = "";
              const { id, unitType } = co.value[0];

              if (unitType === 1) {
                sType = "DEPT";
              } else if (unitType === 3) {
                sType = "USER";
              }
              const params: any = {
                targetIds: id,
                sourceType: sType,
              };
              tasks.push(formApi.getStaffOperateAble(params));
            }
          }
        });

        if (!tasks.length) {
          this.isShow = true;
          return;
        }

        Promise.all(tasks).then((res: any) => {
          if (res && res.length) {
            res.forEach((r: any) => {
              const _id: string = r.data[0].targetId;
              const keepDeptIds: any = r.data
                .map((i: any) => {
                  if (!i.op) {
                    return i.targetId;
                  }
                })
                .filter((i: any) => !!i);

              this.conditions.forEach((co: any, idx: number) => {
                if (this.isStaffSelector(co.propertyType)) {
                  const itme: any = co.value[0] as any;
                  if (itme.id === _id) {
                    co.keepDeptIds = keepDeptIds;
                  }
                }
              });

              this.isShow = true;
            });
          }
        });
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
      this.conditions = val.conditions;
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
      item.disabled = true;
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
    // 
    const item = this.dataOptions.find((x) => x.value === cond.propertyCode);
    if (item) {
      if (cond.propertyType !== item.type) {
        if (item.value === "xr") {
          cond.value = "";
        } else {
          if (item.type === DataItemType.StaffSingle) {
            cond.value = [];
          } else if (item.type === DataItemType.Date) {
            cond.value = moment();
          } else {
            cond.value = "";
          }
        }
      } else {
        if (item.value !== "creater" && item.value !== "owner") {
          cond.value = item.type === DataItemType.StaffSingle ? [] : "";
        }
      }
      cond.propertyType = item.type;

      const operators = this.getOperators(item.type, item.value);
      if (operators) {
        cond.operatorType = operators[0].value;
      }

      item.disabled = true;
    }
    this.onChange();
  }

  getValue() {
    const value = {
      type: this.type,
      conditions: this.conditions,
    };

    return value;
  }

  onDateChange(cond: DataitemConditionItem, dateText: string) {
    cond.value = dateText;
    this.onChange();
  }

  onOperationChange(cond: any) {
    if (
      cond.operatorType === 9 ||
      cond.operatorType === 10 ||
      cond.operatorType === 11
    ) {
      // 为空或者不为空的时候 清除value的值
      cond.value = cond.operatorType === DataItemType.StaffSingle ? [] : "";
    }
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
.time-select {
  width: 100% !important;
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

.h3-organization {
  background: #fff;
}
</style>
