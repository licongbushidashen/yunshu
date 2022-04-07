<template>
    <a-form>
      <a-form-item
          label="目标模型"
          :labelCol="{ span: 4 }" labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
        <config-provider :locale="locale">
            <biz-models-selector
              :appCode="appCode"
              :value="bizModel"
              :isLinkData="true"
              :bizSchemaCode="currentAppCode"
              :folderId="appFunctionCode"
              appManagerFilter="true"
              placeholder="请选择"
              @change="onTreeChange"
              @select="onTreeSelect"
            />
        </config-provider>
      </a-form-item>
      <a-form-item
          label="联动条件"
          :labelCol="{ span: 4 }" labelAlign="left"
          :wrapperCol="{ span: 20 }"
          class="linkCondition"
        >
          <a-row class="linkHeader">
            <a-col :span="10" class="fieldlab">当前模型数据项</a-col>
            <a-col :span="3"></a-col>
            <a-col :span="8" class="fieldlab">联动模型数据项</a-col>
            <!-- <a-col :span="3" class="fieldlab" style="text-align: center;">删除</a-col> -->
          </a-row>
          <a-row v-for="(row, index) in conditionList" :key="index">
            <a-col :span="10">
              <config-provider :locale="locale">
                <a-select
                  :getPopupContainer="getPopupContainer"
                  style="width: 100%"
                  v-model="row.currentDataItem"
                  placeholder="请选择"
                  @change="currentDataItemChange(row.currentDataItem, index)"
                >
                  <template v-for="item in row.currentDataItemList">
                    <a-select-option :value="item.code" :key="item.code" :title="item.name" :disabled="item.disabled">{{ item.name }}</a-select-option>
                  </template>
                </a-select>
              </config-provider>
            </a-col>
            <a-col :span="3" class="equalCls lineHeight40">值等于</a-col>
            <a-col :span="8">
              <config-provider :locale="locale">
                <a-select style="width: 100%" :getPopupContainer="getPopupContainer" v-model="row.targetDataItem" placeholder="请选择">
                  <template v-for="item in row.targetDataItemList">
                    <a-select-option
                      :value="item.code + '|' + item.propertyType" 
                      :key="item.code"
                      :title="item.name"
                    >{{ item.name }}</a-select-option>
                  </template>
                </a-select>
              </config-provider>
            </a-col>
            <a-col :span="3" style="text-align:center;">
              <span class="delete" @click="deleteCondition(index)" v-if="conditionList.length > 0">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>
          <div class="add">
            <span>
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span @click="addCondition()">新增条件</span>
            </span>
          </div>
      </a-form-item>
        <a-form-item
          label="联动填充"
          :labelCol="{ span: 4 }" labelAlign="left"
          :wrapperCol="{ span: 20 }"
          class="linkCondition"
        >
          <a-row>
            <a-col :span="10" class="fieldlab">
              <a-input :disabled="true" v-model="targetItem"></a-input>
            </a-col>
            <a-col :span="3" class="equalCls lineHeight32">值等于</a-col>
            <a-col :span="11" class="fieldlab">
              <config-provider :locale="locale">
                <a-select style="width: 100%" v-model="targetDataItem" :getPopupContainer="getPopupContainer" placeholder="请选择">
                  <template v-for="item in targetDataItemList">
                    <a-select-option :value="item.code + '|' + item.propertyType"  :key="item.code" :title="item.name">{{ item.name }}</a-select-option>
                  </template>
                </a-select>
              </config-provider>
            </a-col>
            <a-col :span="1"></a-col>
          </a-row>
        </a-form-item>
    </a-form>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { sliceString } from "@cloudpivot/form/utils/utils";
import BizModelsSelector from "./biz-models-selector/index.vue";
import { components } from "@cloudpivot/h3-list";
import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";
import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";
import { listApi } from "@cloudpivot/api";

import {
  Input,
  InputNumber,
  DatePicker,
  Switch,
  ConfigProvider,
} from "@h3/antd-vue";
import { namespace } from "vuex-class";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";

const DataModelModule = namespace("Apps/DataModel");

@Component({
  name: "DataLinkModal",
  components: {
    BizModelsSelector,
    Input,
    InputNumber,
    DatePicker,
    ASwitch: Switch,
    ConfigProvider,
  },
})
export default class DataLinkModal extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({
    default: () => ({}),
  })
  dataItem!: any;
  @Prop()
  dataItems!: any;

  @DataModelModule.State("bizSheetCode") bizSheetCode: any;

  bizModel = "";

  // 目标模型字段数据源
  targetFieldList: { main: any[] } = { main: [] };

  // 当前模型数据字段数据源
  currentFieldList: { main: any[]; origin: any[] } = { main: [], origin: [] };

  targetDataItem = "";

  targetDataItemList: any[] = [];

  targetItem = "";
  targetItemKey = "";

  conditionList: any[] = [];

  onTreeChange(val) {
    console.log("onTreeChange", val);
    this.bizModel = val;
    this.getTargetItem(this.bizModel).then((res) => {
      this.currentFieldList.main = this.currentFieldList.origin.filter((x) =>
        this.filterType(x) && x.code !== (this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code)
      );
      this.currentFieldList.main.forEach(item => {
        item.disabled = false;
      })
      this.targetDataItem = "";
      this.conditionList = [
        {
          currentDataItem: undefined,
          targetDataItem: undefined,
          currentDataItemList: this.currentFieldList.main.slice(),
          targetDataItemList: this.targetFieldList.main.slice().filter((x) => this.filterType2(x) || x.code === "sequenceNo" ||
          x.code === "id")
        },
      ];
    });
  }
  appCode = "";
  appFunctionCode = "";
  currentAppCode = "";
  onTreeSelect(val:any) {
    this.appCode = val[0];
    if (val.length > 2) {
      this.appFunctionCode = val[1];
    }
  }

  getTargetItem(schemaCode: string) {
    return new Promise((resolve, reject) => {
      const params = {
        schemaCode,
        formCode: schemaCode,
      };
      listApi.getDataItemList(params).then((res: any) => {
        let data: any[] = [];
        if (res.status || res.data.errcode === 0) {
          data = res.data.data;
        }
        if (res.errcode === 0) {
          data = res.data;
        }

        this.targetFieldList.main = data;
        let currentDataItem = this.currentFieldList.origin.find((item) => {
          let opItem = this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code;
          return item.code === opItem;
        });
        if(!currentDataItem)
        {
          currentDataItem = this.dataItem;
        }
        if (currentDataItem) {
          this.targetDataItemList = this.targetFieldList.main
            .slice()
            .filter(
              (x) => {
                return this.filterFunc(currentDataItem.type, x)
              } 
            );
        }
        resolve(1);
      });
    });
  }

  addCondition(val?: any) {
    if (val) {
      this.conditionList.push(val);
    } else {
      this.conditionList.push({
        currentDataItem: undefined,
        targetDataItem: undefined,
        currentDataItemList: this.currentFieldList.main.slice(),
        targetDataItemList: this.targetFieldList.main.slice().filter((x) => this.filterType(x) || x.code === "sequenceNo" ||
          x.code === "id"),
      });
    }
  }

  deleteCondition(index: number) {
    // 删除时释放
    let item: any = this.conditionList[index];
    if (item.currentDataItem) {
      let chosenItem = this.currentFieldList.main.find(x => {
        return x.code === item.currentDataItem;
      })
      chosenItem.disabled = false;
    }
    if (item.targetDataItem) {
      let {key} = this.formatKey(item.targetDataItem);
      let chosenItem = this.targetFieldList.main.find(x => {
        return x.code === key;
      })
      chosenItem.disabled = false;
    }
    this.conditionList.splice(index, 1);
  }

  deepCopy(item) {
    const str = JSON.stringify(item);
    return JSON.parse(str);
  }

  defaultValue: number = -1;
  hasDefault = false;
  created() {
    this.initData();
  }

  setBizmodel(data: any) {
    const obj: any = JSON.parse(data);
    this.bizModel = obj.targetModel;
    this.appCode = obj.appCode;
    this.appFunctionCode = obj.appFunctionCode;
    this.getTargetItem(this.bizModel).then((res) => {
      if (obj.condition) {
        const op = obj.condition.split("&&").forEach((condition) => {
          const arr = condition.split(" ");
          if (arr.length > 0) {
            let currentDataItemKey = arr[0].substring(1, arr[0].length - 1);
            let item: any = {
              currentDataItem: currentDataItemKey,
              targetDataItem: arr[2].substring(1, arr[2].length - 1),
            };
            let currentDataItem = this.currentFieldList.main.find(
              (x) => x.code === currentDataItemKey
            );
            if (currentDataItem) {
              currentDataItem.disabled = true;
              let chosenItem = this.targetFieldList.main.find(item => {
                return item.code === item.targetDataItem;
              })
              if (chosenItem) {
                chosenItem.disabled = true;
              }
              let targetDataItemList = this.targetFieldList.main
                .slice()
                .filter((x) =>
                  this.filterCondition(currentDataItem.propertyType, x)
                );
              let currentDataItemList = this.currentFieldList.main.slice();
              item.targetDataItemList = targetDataItemList;
              item.currentDataItemList = currentDataItemList;
            }
            this.addCondition(item);
          }
        });
      }
      if (obj.fillProperty) {
        const arr = obj.fillProperty.split(" ");
        if (Array.isArray(arr) && arr.length === 3) {
          let realKey: string  = arr[2].substring(1, arr[2].length - 1);
          this.targetDataItem = realKey;
        }
      }
    });
  }
  bizmodeBack() {
    if (!this.bizModel) {
      return JSON.stringify({
        isValid: false,
        msg: "请选择联动模型"
      });
    }
    if (!this.targetDataItem) {
      return JSON.stringify({
        isValid: false,
        msg: "联动填充项不能为空"
      });
    }
    if (this.conditionList.length > 0) {
      const flag = this.conditionList.some((cond) => {
        return !cond.currentDataItem || !cond.targetDataItem;
      });
      if (flag) {
        return JSON.stringify({
          isValid: false,
          msg: "条件配置项不能为空"
        });
      }
    } else {
      return JSON.stringify({
        isValid: false,
        msg: "条件配置项不能为空"
      });
    }

    const condition = this.conditionList
      .map((res) => {
        return `{${res.currentDataItem}} = {${res.targetDataItem}}`;
      })
      .join("&&");
    const obj = {
      targetModel: this.bizModel,
      condition,
      appCode: this.appCode,
      appFunctionCode: this.appFunctionCode,
      currentAppCode: this.currentAppCode,
      fillProperty:
        `{${this.targetItemKey}} = {${this.targetDataItem}}`,
    };

    let isCheckPass = this.checkSettings(obj);
    if (!isCheckPass) {
      return JSON.stringify({
        isValid: false,
        msg: "数据关联设置不符合要求"
      });
    }

    return JSON.stringify(obj);
  }

  checkSettings(obj: any) : boolean {
    return true;
  }

  get locale() {
    // @ts-ignore
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }

  // 当前项发生变化后，目标项控件过滤
  currentDataItemChange(val, index) {
    // 先判断目标控件类型，如果和当前选的一致，不清空，否则清空
    let currentItem: any = this.currentFieldList.main.find(item => item.code === val);
    let targetKey = this.formatKey(this.conditionList[index].targetDataItem);
    let targetItem: any = this.targetFieldList.main.find(item => item.code === targetKey.key);
    if (currentItem && targetItem) {
      if(currentItem.propertyType !== targetItem.propertyType) {
        this.conditionList[index].targetDataItem = undefined;
      }
    }

    this.currentFieldList.main.forEach((item: any) => {
      if (this.conditionList.findIndex((x: any) => {
        return x.currentDataItem === item.code;
      }) > -1) {
        item.disabled = true;
      } else {
        item.disabled = false;
      }
    })

    let currentDataItem = this.currentFieldList.main.find((item) => {
      return item.code === val;
    });
    console.log("currentDataItemcurrentDataItemcurrentDataItemcurrentDataItem", currentDataItem)
    this.conditionList[
      index
    ].targetDataItemList = this.targetFieldList.main.filter((x) =>
      this.filterCondition(currentDataItem.type, x)
    );
  }

  // 传入的参数格式key|dataItemType
  formatKey(keyStr: string){
    if (keyStr) {
      let _lastIndex = keyStr.lastIndexOf('|');
      if (_lastIndex === -1) {
        return {
          key: keyStr,
          DataItemType: -1
        }
      } else {
        let key = keyStr.substring(0, _lastIndex);
        let dataItemType = keyStr.substr(_lastIndex + 1);
        return {
          key,
          dataItemType
        }
      }
    } else {
      return {
        key: '',
        DataItemType: -1
      }
    }
  }

  filterCondition(val: any, x: any) {
    switch(Number(val)) {
      case DataItemType.ShortText:
        return (x.propertyType === DataItemType.ShortText && !x.defaultProperty) || x.code === "sequenceNo" ||
          x.code === "id";
      case DataItemType.LongText:
        return x.propertyType === DataItemType.LongText && !x.defaultProperty
      case DataItemType.Date:
        return x.propertyType === DataItemType.Date && !x.defaultProperty
      case DataItemType.Number:
        return x.propertyType === DataItemType.Number && !x.defaultProperty
      case DataItemType.Radio:
        return x.propertyType === DataItemType.Radio && !x.defaultProperty
      case DataItemType.Dropdown:
        return x.propertyType === DataItemType.Dropdown && !x.defaultProperty
      case DataItemType.Logic:
        return x.propertyType === DataItemType.Logic && !x.defaultProperty
      case DataItemType.Time:
        return x.propertyType === DataItemType.Time && !x.defaultProperty
      case DataItemType.StaffSingle:
        return x.propertyType === DataItemType.StaffSingle && !x.defaultProperty
      case DataItemType.DeptSingle:
        return x.propertyType === DataItemType.DeptSingle && !x.defaultProperty
      case DataItemType.StaffDeptMix:
        return x.propertyType === DataItemType.StaffDeptMix && !x.defaultProperty
      case DataItemType.RelevanceForm:
        return x.propertyType === DataItemType.RelevanceForm && !x.defaultProperty
    }
  }

  filterFunc(val: any, x: any) {
    switch(Number(val)) {
      case DataItemType.ShortText:
        return (x.propertyType === DataItemType.ShortText && !x.defaultProperty) || x.code === "sequenceNo" ||
          x.code === "id";
      case DataItemType.LongText:
        return x.propertyType === DataItemType.LongText && !x.defaultProperty
      case DataItemType.Date:
        return x.propertyType === DataItemType.Date && !x.defaultProperty
      case DataItemType.Number:
        return x.propertyType === DataItemType.Number && !x.defaultProperty
      case DataItemType.Radio:
        return x.propertyType === DataItemType.Radio && !x.defaultProperty
      case DataItemType.Checkbox:
        return x.propertyType === DataItemType.Checkbox && !x.defaultProperty
      case DataItemType.Dropdown:
        return x.propertyType === DataItemType.Dropdown && !x.defaultProperty
      case DataItemType.DropdownMulti:
        return x.propertyType === DataItemType.DropdownMulti && !x.defaultProperty
      case DataItemType.Logic:
        return x.propertyType === DataItemType.Logic && !x.defaultProperty
      case DataItemType.Address:
        return x.propertyType === DataItemType.Address && !x.defaultProperty
      case DataItemType.Time:
        return x.propertyType === DataItemType.Time && !x.defaultProperty
      case DataItemType.StaffSingle:
        return x.propertyType === DataItemType.StaffSingle && !x.defaultProperty
      case DataItemType.StaffMulti:
        return x.propertyType === DataItemType.StaffMulti && !x.defaultProperty
      case DataItemType.DeptSingle:
        return x.propertyType === DataItemType.DeptSingle && !x.defaultProperty
      case DataItemType.DeptMulti:
        return x.propertyType === DataItemType.DeptMulti && !x.defaultProperty
      case DataItemType.StaffDeptMix:
        return x.propertyType === DataItemType.StaffDeptMix && !x.defaultProperty
      case DataItemType.RelevanceForm:
        return x.propertyType === DataItemType.RelevanceForm && !x.defaultProperty
      case DataItemType.RelevanceFormEx:
        return x.propertyType === DataItemType.RelevanceFormEx && !x.defaultProperty
      case DataItemType.Attachment:
        return x.propertyType === DataItemType.Attachment && !x.defaultProperty
    }
  }


  filterFuncAttach(val: any, x: any) {
    switch(val) {
      case FormControlType.Attachment:
        return x.formPropertyType === FormControlType.Attachment;
      case FormControlType.Image:
        return x.formPropertyType === FormControlType.Image;
      case FormControlType.Signature:
        return x.formPropertyType === FormControlType.Signature;
    }
  }

  filterFuncAddress(val: any, x: any) {
    switch(val) {
      case FormControlType.Address:
        return x.formPropertyType === FormControlType.Address;
    }
  }

  filterType(res: any) {
    switch(Number(res.propertyType)) {
      case DataItemType.ShortText:
      case DataItemType.LongText:
      case DataItemType.Date:
      case DataItemType.Number:
      case DataItemType.Radio:
      case DataItemType.Dropdown:
      case DataItemType.Logic:
      case DataItemType.Time:
      case DataItemType.StaffSingle:
      case DataItemType.DeptSingle:
      case DataItemType.StaffDeptMix:
      case DataItemType.RelevanceForm:
        return res && !res.isSystem;
      default:
        return !res;
    }
  }

  filterType2(res: any) {
    switch(Number(res.propertyType)) {
      case DataItemType.ShortText:
      case DataItemType.LongText:
      case DataItemType.Date:
      case DataItemType.Number:
      case DataItemType.Radio:
      case DataItemType.Dropdown:
      case DataItemType.Logic:
      case DataItemType.Time:
      case DataItemType.StaffSingle:
      case DataItemType.DeptSingle:
      case DataItemType.StaffDeptMix:
      case DataItemType.RelevanceForm:
      case DataItemType.Attachment:
        return res && !res.defaultProperty;
      default:
        return !res;
    }
  }

  @Watch("modalData")
  onModalDataChange(val: any) {
    this.initData();
  }

  initData() {    
    this.currentAppCode = this.$route.params.bizSchemaCode;
    const data = this.modalData;
    const _items = this.dataItems;
    let items = JSON.parse(JSON.stringify(_items));
    items.forEach(item => {item.propertyType = item.type});
    if (this.dataItem.parentCode) {
      const sheet = items.find((x: any) => x.code === this.dataItem.parentCode);
      if (sheet) {
        this.targetItem = `${sheet.name}.${this.dataItem.name}`
        this.targetItemKey = `${sheet.code}.${this.dataItem.code}`;
        items = items.filter((x: any) => x.code !== this.dataItem.parentCode);
        items = items.filter((x: any) => !x.parentCode || x.parentCode === this.dataItem.parentCode);
        items.forEach((x: any) => {
          if (x.parentCode === this.dataItem.parentCode) {
            x.name = `${sheet.name}.${x.name}`;
            x.code = `${this.dataItem.parentCode}.${x.code}`;
          }
        })
      }
    } else {
      this.targetItem = `${this.dataItem.name}`
      this.targetItemKey = `${this.dataItem.code}`;
    }

    items.forEach((x: any) => {
      x.disabled = false;
    })
    this.currentFieldList.origin = JSON.parse(JSON.stringify(items));
    this.currentFieldList.main = items.filter((res) =>{
      return this.filterType(res) && res.code !== (this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code)
    });
    if (data) {
      try {
        this.setBizmodel(data);
        this.hasDefault = true;
      } catch {}
    } else {
      this.addCondition();
    }
  }

  getPopupContainer(triggerNode:any) {
    return triggerNode.parentNode;
  }
}
</script>
<style lang="less" scoped>
.equalCls {
  text-align:center;
  font-size:12px;
}
.lineHeight32 {
  line-height: 32px;
}
.lineHeight40 {
  line-height: 40px;
}
.linkHeader {
  margin: 2px 0;
}
.add {
  color: #17bc94;
  text-align: center;
  margin-right: 24px;
  cursor: pointer;
  span {
    margin-right: 8px;
  }
}
.fieldlab {
    color: #000;
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
  }
.linkCondition {
  /deep/.ant-form-item-control {
    background: #F4F5F8;
    padding: 10px;
    border-radius: 4px;
  }
}
.add-option-wrap {
  // margin-right: -24px;
  min-height: 200px;
  overflow: hidden;
  .add {
    color: @primary-color;
    text-align: center;
    margin-right: 24px;
    cursor: pointer;
    span {
      margin-right: 8px;
    }
  }
  .radio-group {
    max-height: 254px;
    overflow: auto;
    /deep/.ant-radio-wrapper {
      margin-right: 0;
    }
    .input {
      width: 240px;
    }
    .delete {
      // float: right;
      margin-left: 8px;
    }
    .radio-item-wrap {
      margin-bottom: 16px;
      & > div {
        float: left;
      }
      .input-wrap {
        margin-left: 8px;
      }
      .radio-wrap,
      .delete-wrap {
        margin-top: 4px;
      }
    }
  }
  ul {
    max-height: 254px;
    overflow-y: auto;
    overflow-x: hidden;
    li {
      margin-bottom: 16px;
      & > div {
        float: left;
        margin-right: 12px;
        &:last-child {
          margin-top: 5px;
          cursor: pointer;
          margin-right: 12x;
        }
      }
      .input-wrap {
        width: 240px;
        .tips {
          color: #f5222d;
          font-size: 12px;
        }
        // .error{
        //   box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
        //   border-right-width: 1px !important;
        //   border-color: #f5222d;
        //   outline: 0;
        // }
      }
      .default {
        margin-top: 6px;
        /deep/.ant-radio-wrapper {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
