<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.DataLinkage')"
    width="700px"
    :visible="true"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <div>
      <a-row>
        <a-col :span="6">联动目标模型:</a-col>
        <a-col :span="18">
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
        </a-col>
      </a-row>

      <a-row v-if="dataItem.type === 6 || dataItem.type === 10">
        <a-col :span="6">联动目标表单:</a-col>
        <a-col :span="18">
          <config-provider :locale="locale">
            <a-select style="width: 100%" v-model="currentTargetForm" @change="onFormChange">
            <template v-for="item in targetFormList">
                <a-select-option
                  :value="item.code"
                  :key="item.code"
                >{{ item.name }}</a-select-option>
              </template>
          </a-select>
          </config-provider>
        </a-col>
      </a-row>

      <div class="conditions">
        <a-row class="subTitle">联动条件</a-row>
        <a-row>
          <a-col :span="10" class="fieldlab">当前模型数据项</a-col>
          <a-col :span="3"></a-col>
          <a-col :span="8" class="fieldlab">联动模型数据项</a-col>
          <a-col :span="3" class="fieldlab" style="text-align: center;">删除</a-col>
        </a-row>
        <a-row v-for="(row, index) in conditionList" :key="index">
          <a-col :span="10">
            <config-provider :locale="locale">
              <a-select
                style="width: 100%"
                v-model="row.currentDataItem"
                placeholder="请选择"
                :showSearch="true"
                optionFilterProp="children"
                @change="currentDataItemChange(row.currentDataItem, index)"
              >
                <template v-for="item in row.currentDataItemList">
                  <a-select-option :value="item.code" :key="item.code" :title="item.name+'['+item.code+']'" :disabled="item.disabled">{{ `${item.name}[${item.code}]` }}</a-select-option>
                </template>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="3" style="line-height:32px; text-align:center;">值等于</a-col>
          <a-col :span="8">
            <config-provider :locale="locale">
              <a-select style="width: 100%" v-model="row.targetDataItem" placeholder="请选择" :showSearch="true" optionFilterProp="children">
                <template v-for="item in row.targetDataItemList">
                  <a-select-option
                    :value="item.code"
                    :key="item.code"
                    :title="item.name+'['+item.code+']'"
                  >{{ `${item.name}[${item.code}]` }}</a-select-option>
                </template>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="3" style="text-align:center;padding-top: 4px">
            <span class="delete" @click="deleteCondition(index)" v-if="conditionList.length > 1">
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
      </div>
      <div class="linkage">
        <a-row class="subTitle">联动填充</a-row>
        <a-row>
          <a-col :span="10" class="fieldlab">
            <a-select style="width: 100%" v-model="targetItem" disabled>
              <a-select-option :value="targetItem" :key="targetItem" :title="targetItem+'['+targetItemKey +']'">{{`${targetItem}[${targetItemKey}]`}}</a-select-option>
            </a-select>
            <!-- <a-input :disabled="true" v-model="targetItem"></a-input> -->
          </a-col>
          <a-col :span="3" style="line-height:32px; text-align:center;">值等于</a-col>
          <a-col :span="11" class="fieldlab">
            <config-provider :locale="locale">
              <a-select style="width: 100%" v-model="targetDataItem" placeholder="请选择" :showSearch="true" optionFilterProp="children">
                <template v-for="item in targetDataItemList">
                  <a-select-option :value="item.code"  :key="item.code" :title="item.name+'['+item.code+']'">{{ `${item.name}[${item.code}]` }}</a-select-option>
                </template>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="1"></a-col>
        </a-row>
      </div>
    </div>
    <template slot="footer">
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="cancelRelate">取消联动</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { sliceString } from "@cloudpivot/form/utils/utils";
import BizModelsSelector from "./biz-models-selector/index.vue";
import { components } from "@cloudpivot/h3-list";
import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";
import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";
import { listApi, formApi } from "@cloudpivot/api";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
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

const DataModelModule = namespace("Apps/DataModel");

@Component({
  name: "DataLinkModal",
  components: {
    BizModelsSelector,
    StaffSelector,
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
  dataItem!: DataItemState;

  @DataModelModule.State("bizSheetCode") bizSheetCode: any;

  bizModel = "";

  currentTargetForm = ""; // 联动目标表单

  targetFormList: any[] = []; // 联动表单列表 模型对应多个表单

  // 目标模型字段数据源
  targetFieldList: { main: any[], sub: any [] } = { main: [], sub: [] };

  // 当前模型数据字段数据源
  currentFieldList: { main: any[]; origin: any[] } = { main: [], origin: [] };

  targetDataItem = "";

  targetDataItemList: any[] = [];

  targetItem = "";
  targetItemKey = "";

  dataItemTypeList: any[] = [];


  // 选人
  staffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    showModel: true,
    mulpitle: this.modalData.type === "bizRadioOption" ? false : true,
    showSelect: true,
    placeholder: "请选择",
  };

  conditionList: any[] = [];

  onTreeChange(val) {
    this.bizModel = val;
    // 根据目标schemaCode获取表单列表
    let currentDataItem = this.currentFieldList.origin.find((item) => {
      let opItem = this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code;
      return item.code === opItem;
    });
    if (currentDataItem.type === DataItemType.Attachment || currentDataItem.type === DataItemType.Address) {
      formApi.getFormList(this.bizModel).then((res: any) => {
        if (res.errcode === 0 && Array.isArray(res.data) && res.data.length) {
          this.targetFormList = res.data.map((x: any) => {
            return {
              name: x.name,
              code: x.code
            }
          })
          this.currentTargetForm = this.targetFormList[0].code;
          this.initTargetForm(this.bizModel, this.currentTargetForm);
        }
      })
    } else {
      this.initTargetForm(this.bizModel);
    }
  }

  onFormChange(val) {
    this.conditionList = [];
    this.initTargetForm(this.bizModel, this.currentTargetForm);
  }

  initTargetForm(schemaCode: string, sheetCode: string = "") {
    this.getTargetItem(schemaCode, sheetCode).then((res) => {
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
          targetDataItemList: []
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

  getTargetItem(schemaCode: string, sheetCode: string = "") {
    return new Promise((resolve, reject) => {
      let params = {
        schemaCode,
      };
      if (sheetCode) {
        params["formCode"] = sheetCode;
      }
      listApi.getDataItemList(params).then((res: any) => {
        let self = this
        let data: any[] = [];
        if (res.status || res.data.errcode === 0) {
          data = res.data.data;
        }
        if (res.errcode === 0) {
          data = res.data;
        }

        //主表数据联动选项
        // this.targetFieldList.sub = data.reduce((pre, crr) => {
        //   return crr.subSchema ? [...pre, ...crr.subSchema.properties] : pre
        // }, []);
        // //子表数据联动选项
        // this.targetFieldList.main = data.concat(this.targetFieldList.sub);
        // console.log(this.targetFieldList)
        this.targetFieldList.main = data
        
        let currentDataItem = this.currentFieldList.origin.find((item) => {
          let opItem = this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code;
          return item.code === opItem;
        });
        if (currentDataItem) {
          setTimeout(() => {
            if (currentDataItem.type === DataItemType.Attachment || currentDataItem.type === DataItemType.Address) {
            this.targetDataItemList = this.targetFieldList.main
            .slice()
            .filter(
              (x) => {
                if(x.code === self.targetDataItem){
                  return true
                }

                return this.filterFuncEx(currentDataItem.formPropertyType, x)
              } 
            );
          } else if (currentDataItem.type === DataItemType.StaffDeptMix) {
            this.targetDataItemList = this.targetFieldList.main
            .slice()
            .filter(
              (x) => {
                if(x.code === self.targetDataItem){
                  return true
                }

                return this.filterStaffDept(currentDataItem.type, x)
              } 
            );
          } else if([0,12,13,14,15].includes(currentDataItem.type)) {
            console.log(this.targetFieldList)
            this.targetDataItemList = this.targetFieldList.main
                .slice()
                .filter((x) =>
                  this.filterCondition(currentDataItem.type, x)
                );
          }else {
            this.targetDataItemList = this.targetFieldList.main
            .slice()
            .filter(
              (x) => {
                if(x.code === self.targetDataItem){
                  return true
                }
                return this.filterFunc(currentDataItem.type, x)
              }
            );
          }
          }, 0);
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
        targetDataItemList: [],
      });
    }
  }

  deleteCondition(index: number) {
    // 删除时释放
    let item: any = this.conditionList[index];
    if (item.currentDataItem) {
      let {key} = this.formatKey(item.currentDataItem);
      let chosenItem = this.currentFieldList.main.find(item => {
        return item.code === key;
      })
      chosenItem.disabled = false;
    }
    if (item.targetDataItem) {
      let {key} = this.formatKey(item.targetDataItem);
      let chosenItem = this.targetFieldList.main.find(item => {
        return item.code === key;
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

  mounted(){
    formApi.getFormList(this.bizModel).then((res: any) => {
      if (res.errcode === 0 && Array.isArray(res.data) && res.data.length) {
        this.targetFormList = res.data.map((x: any) => {
          return {
            name: x.name,
            code: x.code
          }
        })
      }
    })
  }
  created() {
    this.currentAppCode = this.$route.params.bizSchemaCode;
    const data = this.modalData.data;
    let dataItemTypeArr: any[] = [];
    for(let key in DataItemType) {
      dataItemTypeArr.push({
        key,
        value: DataItemType[key]
      })
    }

    const _items = dataitemStore.getDataItems(this).filter((x) => x.used);
    let items = JSON.parse(JSON.stringify(_items));
    debugger
    if (this.dataItem.parentCode) {
      const sheet = items.find((x) => x.code === this.dataItem.parentCode);
      if (sheet) {
        this.targetItem = `${sheet.name}.${this.dataItem.name}`
        this.targetItemKey = `${sheet.code}.${this.dataItem.code}`;
        if (Array.isArray(sheet.properties)) {
          const sheetItems = sheet.properties.filter((x: any) => {
            const flag = x.used;
            x.name = `${sheet.name}.${x.name}`;
            x.code = `${this.dataItem.parentCode}.${x.code}`;
            return flag;
          }) as any;
          items = items.concat(sheetItems);
        }
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

    if (data.value) {
      try {
        const obj = JSON.parse(data.value);
        this.setBizmodel(data);
        this.hasDefault = true;
      } catch {}
    } else {
      this.addCondition();
    }
  }

  setBizmodel(data: any) {
    const obj: any = JSON.parse(data.value);

    this.bizModel = obj.targetModel;
    this.appCode = obj.appCode;
    this.appFunctionCode = obj.appFunctionCode;
    this.currentTargetForm = obj.formCode;
    this.getTargetItem(this.bizModel, this.currentTargetForm).then((res) => {
      if (obj.condition) {
        const op = obj.condition.split("&&").forEach((condition) => {
          const arr = condition.split(" ");
          if (arr.length > 0) {
            let currentDataItemKey = arr[0].substring(1, arr[0].length - 1);
            let {key:currentCode} = this.formatKey(currentDataItemKey);
            let item: any = {
              currentDataItem: currentDataItemKey,
              targetDataItem: arr[2].substring(1, arr[2].length - 1),
            };
            let currentDataItem = this.currentFieldList.main.find(
              (x) => x.code === currentCode
            );
            if (currentDataItem) {
              currentDataItem.disabled = true;
              let {key} = this.formatKey(item.targetDataItem);
              let chosenItem = this.targetFieldList.main.find(item => {
                return item.code === key;
              })
              if (chosenItem) {
                chosenItem.disabled = true;
              }
              let targetDataItemList = this.targetFieldList.main
                .slice()
                .filter((x) =>
                  this.filterCondition(currentDataItem.type, x)
                );
              let currentDataItemList = this.currentFieldList.main.slice();
              console.log('targetDataItemList', targetDataItemList)
              item.targetDataItemList = targetDataItemList;
              item.currentDataItemList = currentDataItemList;
            } else {
              item.targetDataItemList = this.targetFieldList.main.slice();
              item.currentDataItemList = this.currentFieldList.main.slice();
            }

            let {key:currentKey} = this.formatKey(item.currentDataItem);
            item.currentDataItem = currentKey;
            let {key:targetKey} = this.formatKey(item.targetDataItem);
            item.targetDataItem = targetKey;

            item.currentDataItem = item.currentDataItem.split('|')[0]
            item.targetDataItem = item.targetDataItem.split('|')[0]

            // 导入修改了子表编码，兼容性处理
            let currentDataItemArr =  item.currentDataItem.split('.')
            if(currentDataItemArr.length === 2){
              let field = currentDataItemArr[1]
              let sheets:any[] = []
              Object.values(this.modalData.items).forEach((el: any) => {
                if(el.type === 201){
                  sheets.push(el)
                }
              })
              
              sheets.forEach(sheet => {
                sheet.columns.forEach(column => {
                  if(column.key === field){
                    item.currentDataItem = column.parentKey + '.' + field
                  }
                });
              });
            }

            this.addCondition(item);
          }
        });
      }
      if (obj.fillProperty) {
        const arr = obj.fillProperty.split(" ");
        let {key:targetDataItemKey} = this.formatKey(arr[2].substring(1, arr[2].length - 1));
        this.targetDataItem = targetDataItemKey.split('|')[0];
      }
    });
  }

  /**
   * 弹框关闭
   */
  closeModal() {
    this.$emit("closeModal");
  }
  /**
   * 将数据传出
   */
  handleOk() {
    let backData: any = "";
    backData = this.bizmodeBack();
    if (!backData) {
      return;
    }

    this.$emit("backData", backData);
  }
  bizmodeBack() {
    if (!this.bizModel) {
      this.$message.error("请选择联动模型");
      return false;
    }
    if (!this.targetDataItem) {
      this.$message.error("联动填充项不能为空");
      return false;
    }
    console.log(this.dataItem)
    //关联单选，多选联动模型需与关联模型相同
    if(this.targetDataItem.startsWith('RelevanceForm')) {
      const item = this.targetDataItemList.find((cond) => {
        return cond.code === this.targetDataItem
      });
      if(item.relativeCode != this.dataItem.relativeCode) {
        this.$message.error("联动填充项模型不相同");
        return false;
      }
    }

    if (this.conditionList.length > 0) {
      const flag = this.conditionList.some((cond) => {
        return !cond.currentDataItem || !cond.targetDataItem;
      });
      if (flag) {
        this.$message.error("条件配置项不能为空");
        return false;
      }
    } else {
      this.$message.error("条件配置项不能为空");
      return false;
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
      formCode: this.currentTargetForm,
      appFunctionCode: this.appFunctionCode,
      currentAppCode: this.currentAppCode,
      fillProperty:
        `{${this.targetItemKey}} = {${this.targetDataItem}}`,
    };

    
    
    obj.condition = this.formatCondition(obj.condition)
    obj.fillProperty = this.formatFillProperty(obj.fillProperty)
    return {
      value: JSON.stringify(obj),
      default: "",
    };
  }

  formatFillProperty(items){
    let vm = this
    let itemArr:string[] = items.split('=')
    let itemRes:any[] = []
    itemArr.forEach((item: string, index: number) => {
      let currenCode = item.trim().slice(1, item.trim().length - 1)
      if(index === 1){ // 当前模型数据项
        let currentItem = vm.targetDataItemList.find(el => el.code.includes(currenCode))
        if (currentItem.FormControlType) {
          itemRes.push('{' + currenCode + '|' + currentItem.propertyType + '|' + currentItem.FormControlType + '}')
        } else {
          itemRes.push('{' + currenCode + '|' + currentItem.propertyType + '}')
        }
      }else{//联动模型数据项
        itemRes.push('{' + currenCode + '}')
      }
    })
    return itemRes.join(' = ')
  }

  formatCondition(data){
    let items = data.split('&&')
    let vm = this
    let res:any[] = []
    items.forEach((el:string) => {
      let itemArr:string[] = el.split('=')
      let itemRes:any[] = []
      itemArr.forEach((item: string, index: number) => {
        let currenCode = item.trim().slice(1, item.trim().length - 1)
        if(index === 1){ // 当前模型数据项
          let currentItem = vm.targetFieldList.main.slice().find(el => el.code.includes(currenCode))
          itemRes.push('{' + currenCode + '|' + currentItem.propertyType + '}')
        }else{//联动模型数据项
          itemRes.push('{' + currenCode + '}')
        }
      })
      res.push(itemRes.join(' = '))
    });
    return res.join('&&')
  }

  checkSettings(obj: any) : boolean {

    return true;
  }

  get locale() {
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
    console.log(this.targetFieldList)
    this.conditionList[index].targetDataItemList = this.targetFieldList.main.filter((x) =>
      this.filterCondition(currentDataItem.type, x)
    );
    console.log('-----------------',this.conditionList[index].targetDataItemList)
  }

  filterCondition(val: any, x: any) {
    switch(Number(val)) {
      case DataItemType.ShortText:
        return (x.propertyType === DataItemType.ShortText ) || (x.propertyType === DataItemType.Radio ) || (x.propertyType === DataItemType.Dropdown ) || x.code === "sequenceNo" ||
          x.code === "id";
      case DataItemType.LongText:
        return x.propertyType === DataItemType.LongText && !x.defaultProperty
      case DataItemType.Date:
        return x.propertyType === DataItemType.Date && !x.defaultProperty
      case DataItemType.Number:
        return x.propertyType === DataItemType.Number && !x.defaultProperty
      case DataItemType.Radio:
        return (x.propertyType === DataItemType.ShortText ) || (x.propertyType === DataItemType.Radio ) || (x.propertyType === DataItemType.Dropdown )
      case DataItemType.Dropdown:
        return (x.propertyType === DataItemType.ShortText ) || (x.propertyType === DataItemType.Radio ) || (x.propertyType === DataItemType.Dropdown )
      case DataItemType.DropdownMulti:
      case DataItemType.Checkbox:
        return (x.propertyType === DataItemType.Checkbox ) || (x.propertyType === DataItemType.DropdownMulti )
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

  filterFuncEx(val: any, x: any) {
    switch (val) {
      case FormControlType.Attachment:
        return x.formPropertyType === FormControlType.Attachment;
      case FormControlType.Image:
        return x.formPropertyType === FormControlType.Image;
      case FormControlType.Signature:
        return x.formPropertyType === FormControlType.Signature;
      case FormControlType.Address:
        return x.formPropertyType === FormControlType.Address;
    }
  }

  filterStaffDept(val: any, x: any) {
    return x.propertyType === DataItemType.StaffSingle || x.propertyType === DataItemType.StaffMulti || x.propertyType === DataItemType.DeptSingle || x.propertyType === DataItemType.DeptMulti || x.propertyType === DataItemType.StaffDeptMix;
  }

  filterType(res: any) {
    switch(Number(res.type)) {
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
      case DataItemType.RelevanceForm:
        return res && !res.isSystem;
      default:
        return !res;
    }
  }
  // 传入的参数格式key_dataItemType_fromControlType
  formatKey(keyStr: string){
    const isOldStyle:boolean = /\w+\_(\d+|null)\_(\d+|null)/.test(keyStr);
    if(isOldStyle) {
      let _lastIndex = keyStr.lastIndexOf('_');
      let _last2rdIndex = keyStr.lastIndexOf('_', _lastIndex - 1);
      let key = keyStr.substring(0, _last2rdIndex);
      let dataItemType = keyStr.substring(_last2rdIndex + 1, _lastIndex);
      let formControlType = keyStr.substr(_lastIndex + 1);
      return {
        key,
        dataItemType,
        formControlType
      }
    } else {
      return {
        key: keyStr,
        dataItemType: -1,
        formControlType: -1
      }
    }
  }

  cancelRelate() {
    let self = this;
    this.$confirm({
      title: '数据联动',
      content: '取消联动会清空当前设置的联动数据,确定要取消该数据联动吗?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        let backData: any = "";
        self.$emit("backData", backData);
      }
    });
  }
}
</script>
<style lang="less" scoped>
.conditions,
.linkage {
  .subTitle {
    color: #000;
    opacity: 0.85;
    font-weight: 600;
  }
  .add {
    color: #17bc94;
    margin-bottom: 20px;
    text-align: center;
    margin-right: 24px;
    cursor: pointer;
    span {
      margin-right: 8px;
    }
  }
  .fieldlab {
    color: #000;
    opacity: 0.85;
    font-weight: 500;
  }
}
.ant-row {
  margin-bottom: 10px;
  .ant-col-6 {
    line-height: 32px;
  }
  // .ant-col-18{
  //   // line-height: 32px;
  // }
  .radio-col {
    line-height: 32px;
    .ant-radio-wrapper {
      margin-right: 42px;
    }
  }
  .condition-col {
    margin-top: 6px;
    .ant-select {
      margin-right: 8px;
      width: 106px;
    }
    .ant-input {
      padding: 0 11px;
    }
    .delete-wrap {
      float: right;
      line-height: 32px;
    }
    .select-wrap {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
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
