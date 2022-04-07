<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt">{{ inputValue }}</span>
      <a-icon type="ellipsis" />
    </div>
    <a-modal
      title="验证条件"
      cancelText="取消"
      okText="确定"
      v-model="visible"
      @ok="modalHide"
      wrapClassName="validationCondition"
      width="810px"
    >
      <div class="content">
        <div>
          <span style="padding-right:5px">满足以下</span>
          <a-select show-search defaultValue="AND" v-model="dataConditionJoinType">
            <a-select-option key="AND">全部</a-select-option>
          </a-select>
          <span style="margin-left:5px">条件</span>
        </div>
        <div class="filters">
          <a-row style="margin-top:10px">
            <a-col :span="5" class="fieldlab">目标模型数据项</a-col>
            <a-col :span="4" class="fieldlab">验证方式</a-col>
            <a-col :span="4" class="fieldlab">对比方式</a-col>
            <a-col :span="5" class="fieldlab">验证模型数据项</a-col>
            <a-col :span="4" class="fieldlab">校验失败提示语</a-col>
            <a-col :span="2"></a-col>
          </a-row>
          <a-row v-for="(row,index) in filtersList" :key="index" style="margin-top:5px">
            <a-col :span="5">
              <data-item-select
                :onlyPublished="true"
                v-model="row.targetSchemaDataItem"
                :list="targetFieldList"
                :systemFilterCtl="{code: ['workflowInstanceId','ownerDeptQueryCode', 'sortKey','modifier']}"
                :disabled="false"
                @change="(val) => { targetDataItemChange(val, index);}"
                :bizFilterCtl="{ type: [11] }"
              ></data-item-select>
            </a-col>
            <a-col :span="4">
              <template>
                <div>
                  <a-select
                    show-search
                    class="validition-type"
                    defaultValue="SINGLE"
                    v-model="row.verifyType"
                    placeholder="请选择"
                    @change="conditionChange(row.verifyType,index)"
                  >
                    <a-select-option key="SINGLE" value="SINGLE">单值比较</a-select-option>
                    <a-select-option
                      key="EXIST"
                      value="EXIST"
                      :disabled="row.targetDataItemDefaultProperty|| row.propertyType === 4"
                    >是否存在</a-select-option>
                    <a-select-option
                      :disabled="validModelType ==='main'|| row.propertyType !== 2"
                      key="TOTAL"
                      value="TOTAL"
                    >汇总比较</a-select-option>
                  </a-select>
                </div>
              </template>
            </a-col>
            <a-col :span="4">
              <a-select
                show-search
                v-if="row.verifyType!='EXIST'"
                class="data-filter"
                v-model="row.conditionType"
                placeholder="请选择"
                @change="operatorChange(row.conditionType,index)"
              >
                <a-select-option
                  v-for="(type,index) in row.conditionTypeList"
                  :value="type.code"
                  :key="index"
                >{{ type.name }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="5">
              <data-item-select
                :onlyPublished="true"
                v-if="row.verifyType!='EXIST'"
                v-model="row.value"
                :list="row.currentFieldList"
                :systemFilterCtl="{code: ['workflowInstanceId', 'ownerDeptQueryCode', 'sortKey','modifier']}"
                :disabled="false"
                @change="(val) => { currentDataItemChange(val, index);}"
                :bizFilterCtl="{ type: [11] }"
              ></data-item-select>
            </a-col>
            <a-col :span="4">
              <div>
                <a-input style="width: 128px" v-model="row.errorMsg" placeholder="请输入"></a-input>
              </div>
            </a-col>
            <a-col :span="2" style="text-align:left;padding-left:5px">
              <span class="delete" @click="delRows(index)">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>

          <div class="add">
            <span @click="addRows('main')" style="cursor:pointer">
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span>新增查询条件</span>
            </span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue,
  Mixins,
  Inject,
  Prop,
  Watch,
} from "vue-property-decorator";
import appsApi from "@/apis/apps";
import DataItemSelect from "../../data-rule/data-item-select.vue";
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { DataItemType } from "@cloudpivot/form/schema";
import {
  BizRuleDataCondition,
  Eexpr,
  Icondition,
  SystemDataItemCode,
} from "../typings/rule-data-condition-type";

import { PropertyComponent } from "@h3/designer-core/property-panel";
import * as forms from "h3-forms";
import { never } from "rxjs";

const BizRule = new BizRuleDataCondition();

interface IVerifyCondition {
  /**目标模型数据项 */
  targetSchemaDataItem: string;
  /**验证方式 */
  verifyType: string;
  /**对比方式 */
  conditionType: string;
  /**当前模型数据项 */
  verifySchemaDataItem: string;
  /**失败提示语 */
  errorMsg: string;
}

@Component({
  name: "propertyValidationCondition",
  components: {
    StaffSelector,
    DataItemSelect,
  },
})
export default class PropertyValidationCondition extends Mixins(
  PropertyComponent
) {
  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }
  visible: boolean = false;
  users: string = "";
  dataConditionJoinType: string = "AND";
  inputValue: string = "未设置";
  validModelType: string = "";
  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  };
  targetFieldList: any[] = [];
  currentFieldList: any[] = [];
  filtersList: any[] = [];
  @Prop() dataItems!: any;

  @Prop({ default: "createActions" }) actionType!: string;

  @Prop() schemaCode!: string;

  @Prop() targetOjectCode!: string;
  modalShow() {
    this.visible = true;
    this.initModal();
  }
  modalHide() {
    this.value = {
      dataConditionJoinType: this.dataConditionJoinType,
      conditions: [],
    };
    // 只提交后台定义的属性
    let errorMsg: string = "";
    this.filtersList.map((m: any) => {
      const obj: any = {
        targetSchemaDataItem: m.targetSchemaDataItem,
        verifyType: m.verifyType,
        conditionType: m.conditionType,
        verifySchemaDataItem: m.value,
        errorMsg: m.errorMsg,
      };

      
      if(m.targetSchemaDataItem){
        let currentItem:any = this.targetFieldList.find(el => el.code === m.targetSchemaDataItem)
        if(currentItem){
          obj.targetSchemaDataItemName = currentItem.name
        }
      }

      if(m.value){
        let currentItem:any = m.currentFieldList.find(el => el.code === m.value)
        if(currentItem){
          obj.verifySchemaDataItemName = currentItem.name
        }
      }


      console.log('m===>',m)


      if (m.verifyType === "EXIST") {
        if (m.targetSchemaDataItem === "" || m.errorMsg === "") {
          errorMsg = "验证条件不成立";
        }
      } else {
        Object.keys(obj).map((o: any) => {
          if (obj[o] === "" && o !== 'errorMsg') errorMsg = "验证条件不成立";
        });
      }

      this.value.conditions.push(obj);
    });
    if (errorMsg) this.$message.error(errorMsg);
    else {
      this.visible = false;
    }
    this.emitChange(this.value);
  }
  initModal() {
    this.filtersList = [];
    const val = this.controller.children.targetSchema;
    if (val && val.value && val.value.schemaCode) {
      const promise = new Promise((resolve: (value: any) => void, reject) => {
        resolve(this.getDataItems(val.value.schemaCode));
      });
      promise.then(() => {
        this.getCurrentDataItems();
        // 编辑
        if (this.controller.value && this.controller.value.verifyConditions) {
          const editData = this.controller.value.verifyConditions;
          if (
            editData.dataConditionJoinType &&
            editData.conditions &&
            editData.conditions.length > 0
          ) {
            this.dataConditionJoinType = editData.dataConditionJoinType;

            editData.conditions.map((c: any, index: number) => {
              // 获取对比方式绑定数据
              const targetItem: any = this.targetFieldList.find(
                (f: any) => f.code === c.targetSchemaDataItem
              );
              editData.conditions[index].targetDataItemDefaultProperty =
                targetItem.defaultProperty;
              editData.conditions[
                index
              ].conditionTypeList = this.tiggerFilterOf(
                targetItem.propertyType,
                targetItem.code
              );
              // editData.conditions[index].currentFieldList = this.currentFieldList;
              editData.conditions[index].currentFieldList = [];
              this.filterCurrentFieldList(
                targetItem,
                index,
                editData.conditions[index]
              );
              editData.conditions[index].propertyType = targetItem.propertyType;
              editData.conditions[index].value = c.verifySchemaDataItem;
            });
            this.filtersList = BizRule.deepCopy(editData.conditions);

            this.inputValue = "已设置";

            this.dataItemIsExist();
          }
        }
      });
    }

    // this.filtersList.length === 0 && this.addRows('main');
  }
  @Watch("value", {
    immediate: true,
  })
  valueChange(value) {
    this.emitChange(value);
    if (
      this.value &&
      this.value.hasOwnProperty("conditions") &&
      this.value.conditions.length > 0
    ) {
      this.inputValue = "已设置";
    } else {
      this.inputValue = "未设置";
    }
  }

  dataItemIsExist() {
    this.filtersList.map((item: any) => {
      const verifyItem = this.currentFieldList.filter(
        (current: any) => current.code === item.value
      );
      if (verifyItem.length === 0) {
        item.value = "";
      }
    });
  }

  // 获取绑定数据项
  async getDataItems(schemaCode: string) {
    // 获取数据字段
    const res = await appsApi.getDataItemList({ schemaCode: schemaCode });
    res && res.errcode === 0
      ? (this.targetFieldList = res.data.filter(
          (val) =>
            val.propertyType !== DataItemType.Sheet &&
            val.propertyType !== DataItemType.Attachment &&
            val.propertyType !== DataItemType.Address
        ))
      : this.$message.error(res.errmsg as string);
  }
  getCurrentDataItems() {
    // 判断验证模型是否是子表
    const verifySchemaCode = this.controller.children.verifySchemaCode;
    let sheetItem: any = [];
    if (verifySchemaCode && verifySchemaCode.value) {
      const vals = verifySchemaCode.value.split(".");
      if (verifySchemaCode.value.includes(".")) {
        this.validModelType = "child";
        const sheetData = this.dataItems.find(
          (d: any) => d.propertyType === DataItemType.Sheet
        );
        if (sheetData && sheetData.subSchema.properties) {
          sheetData.subSchema.properties.map((p: any) => {
            if (p.propertyType !== DataItemType.Attachment) {
              !p.code.includes(".")
                ? (p.code = `${vals[1]}.${p.code}`)
                : p.code;
              sheetItem.push(p);
            }
          });
        }

        // 验证模型为子表时，目标模型字段过滤掉创建人/创建人部门/拥有者/拥有者部门，验证模型字段过滤掉选人控件
        // this.targetFieldList = this.targetFieldList.filter(
        //   val => val.propertyType !== DataItemType.StaffSelector
        // );
        this.currentFieldList = [...this.dataItems,...sheetItem];
      } else {
        this.validModelType = "main";
        console.log(this.targetFieldList, 'this.targetFieldList');
        // this.targetFieldList = this.targetFieldList.filter(
        //   val =>
        //     !(
        //       val.propertyType === DataItemType.StaffSelector &&
        //       !val.defaultProperty
        //     )
        // );
        this.currentFieldList = this.dataItems;
      }

      // 验证模型数据项过滤选人控件
      this.currentFieldList = this.currentFieldList.filter(
        (val) =>
          !(
            val.propertyType === DataItemType.StaffSingle &&
            !val.defaultProperty
          )
      );
    }
  }

  // 添加行
  addRows(type: string): void {
    // newRow Data
    const newRow = {
      targetSchemaDataItem: "",
      targetDataItemDefaultProperty: false,
      verifyType: "",
      verifySchemaDataItem: "",
      type: 0,
      conditionType: "",
      visible: true,
      errorMsg: "",
      code: "",
      value: "",
      propertyType: "",
      currentFieldList: [],
    };
    this.filtersList.push(...[newRow]);
  }
  // 删除行
  delRows(index, type) {
    this.filtersList.splice(index, 1);
  }

  // 目标数据项改变
  targetDataItemChange(val: any, index: number) {
    this.filtersList[index].value = "";
    const currentItem: any = this.targetFieldList.find(
      (item: any) => item.code === val
    );
    this.filtersList[index].targetDataItemDefaultProperty =
      currentItem.defaultProperty || null;
    this.setValueCtrl(currentItem, index);
    this.filterCurrentFieldList(currentItem, index);
    this.filtersList[index].verifyType = "SINGLE";
  }
  // 当验证方式改变
  conditionChange(val: any, index: number) {
    // 如果是 汇总, 则只能取 当前数据模型 子表数据项中的数值类型数据项
    this.filtersList[index].value = "";
    if (val === "TOTAL") {
      // 判断验证模型是否为子表
      let curr = [];
      const verifyModal = this.controller.children.verifySchemaCode.value;
      if (verifyModal && verifyModal.includes(".")) {
        //子表中验证方式选择汇总比较时过滤当前字段的主表数据项
        this.filtersList[index].currentFieldList = this.filtersList[
          index
        ].currentFieldList.filter((res: any) => res.code.includes("."));
      }
    } else {
      const current = this.targetFieldList.find(
        (val) => val.code === this.filtersList[index].targetSchemaDataItem
      );
      this.filterCurrentFieldList(current, index);
    }
  }
  filterCurrentFieldList(current, index, editData?) {
    let Arry: any[] | never[] = [];
    switch (current.propertyType) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
      case DataItemType.Date:
      case DataItemType.Time:
      case DataItemType.Number:
      case DataItemType.StaffDeptMix:
      case DataItemType.Address:
      case DataItemType.Logic:
        const arr = [DataItemType.ShortText,DataItemType.Radio,DataItemType.Checkbox,DataItemType.Dropdown];
        Arry = this.currentFieldList.filter((val) => {
          if(arr.some((v) => v === current.propertyType)){
            return ([DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(current.propertyType) ? [DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(val.propertyType) : [DataItemType.Checkbox, DataItemType.DropdownMulti ].includes(val.propertyType))
          }else{
            return (
              val.propertyType === current.propertyType &&
              !val.code.includes("sortKey")
            );
          }
        });
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        Arry = this.currentFieldList.filter((val) => {
            return (
              (val.propertyType === current.propertyType  || val.propertyType === DataItemType.StaffDeptMix) &&
              !val.code.includes("sortKey")
            );
        });
        break;
      case DataItemType.RelevanceForm:
        // 判断目标和验证模型是否关联的同一个模型
        const filterArry = this.currentFieldList.filter(
          (val) => val.relativeCode === current.relativeCode
        );
        if (filterArry.length > 0) {
          Arry = filterArry;
        } else {
          Arry = this.currentFieldList.filter(
            (val) =>
              (val.relativeCode === current.relativeCode &&
                (val.propertyType === DataItemType.RelevanceForm ||
                  val.propertyType === DataItemType.RelevanceFormEx)) ||
              val.code.includes("parentId") ||
              val.code === "id"
          );
        }
        break;
    }
    if (editData) editData.currentFieldList = Arry;
    else this.filtersList[index].currentFieldList = Arry;
  }

  // 操作符改变
  operatorChange(val: any, index) {
    const isVisible = BizRule.codeOf(val);
    if (isVisible !== undefined) {
      isVisible.id === Eexpr.EP || isVisible.id === Eexpr.NEP
        ? (this.filtersList[index].visible = false)
        : (this.filtersList[index].visible = true);
    }
  }

  // 根据选择的数据项触发对应的值控件
  setValueCtrl(item: any, index: number) {
    let currentRowData = this.filtersList[index];
    currentRowData.conditionTypeList = [];
    currentRowData.conditionTypeList = this.tiggerFilterOf(
      item.propertyType,
      item.code
    );
    currentRowData.value = "";
    currentRowData.code = item.code;
    currentRowData.propertyType = item.propertyType;
    // 选中操作符
    currentRowData.conditionType = currentRowData.conditionTypeList[0].code;
    // 根据Item值生成对应的控件
    currentRowData.type = BizRule.showControls(item);
  }
  tiggerFilterOf(type: number, code: string) {
    let exprArray: number[] = [];
    switch (type) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
      case DataItemType.RelevanceForm:
        if (code !== "id") {
          exprArray = [Eexpr.EQ, Eexpr.NEQ];
        } else {
          exprArray = [Eexpr.EQ];
        }
        break;
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
        exprArray = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.LT,
          Eexpr.GTEQ,
          Eexpr.LTEQ,
        ];
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        exprArray = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.CT,
          Eexpr.NCT,
          Eexpr.OF,
          Eexpr.NOF,
        ];
        break;
      case DataItemType.Address:
      case DataItemType.Logic:
        exprArray = [Eexpr.EQ];
        break;
    }
    return BizRule.getConditionByCode(exprArray);
  }
}
</script>

<style lang='less'>
.validationCondition {
  .mt-5 {
    margin-top: 5px;
  }
  .add {
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    margin-right: 24px;
    span {
      margin-right: 8px;
    }
  }
  .filter-title {
    color: #000;
    opacity: 0.85;
    font-weight: 600;
  }
  .title-tips {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    padding-left: 5px;
  }
  .fieldlab {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.64);
    font-weight: 500;
  }

  .data-select {
    width: 150px !important;
  }
  .data-filter {
    width: 120px;
  }
  .ctrl {
    width: 150px;
  }
  .validition-type {
    width: 120px;
  }
}
</style>
