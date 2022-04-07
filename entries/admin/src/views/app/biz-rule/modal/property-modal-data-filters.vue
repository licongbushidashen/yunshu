<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt">{{ inputValue }}</span>
      <a-icon type="ellipsis" />
    </div>
    <a-modal
      wrapClassName="property-data-filter"
      :visible="visible"
      @ok="handleOk"
      @cancel="modalHide"
      okText="保存"
      cancelText="取消"
    >
      <template slot="title">
        <div>
          数据条件
          <span class="title-tips">满足条件的数据才触发执行动作</span>
        </div>
      </template>

      <div class="content">
        <a-select show-search style="width: 292px" defaultValue="1" v-model="dataConditionJoinType">
          <a-select-option key="ALL">请选择</a-select-option>
          <a-select-option key="AND">满足所有条件的数据</a-select-option>
          <a-select-option key="OR">满足任一条件的数据</a-select-option>
        </a-select>

        <div v-if="dataConditionJoinType!=='ALL'">
          <div class="filters" v-show="filtersList.length>0">
            <a-row>
              <a-col :span="8">数据字段</a-col>
              <a-col :span="6">过滤条件</a-col>
              <a-col :span="8">值</a-col>
              <a-col :span="2"></a-col>
            </a-row>
            <a-row v-for="(row,index) in filtersList" :key="index" style="margin-top:5px">
              <a-col :span="8">
                <data-item-select
                  :onlyPublished="true"
                  v-model="row.currentSchemaDataItem"
                  :list="fieldList"
                  :systemFilterCtl="{code: ['workflowInstanceId','modifier' , 'ownerDeptQueryCode', 'sortKey', 'id', 'parentId']}"
                  :bizFilterCtl="{ type: [10, 8, 6, 7, 11]}"
                  :disabled="false"
                  @change="(val) => { dataItemChange(val, index);}"
                ></data-item-select>
              </a-col>

              <a-col :span="6">
                <a-select
                  show-search
                  class="data-filter"
                  v-model="row.ruleDataConditionType"
                  placeholder="请选择"
                  @change="operatorChange(row.ruleDataConditionType,index)"
                >
                  <a-select-option
                    v-for="(type,index) in row.conditionTypeList"
                    :value="type.code"
                    :key="index"
                  >{{ type.name }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="8">
                <template>
                  <div class="item-box">
                    <div v-if="row.type === 1&&row.visible">
                      <a-input style="width: 178px" v-model="row.value" placeholder="请输入"></a-input>
                    </div>
                    <!-- 日期 需要校验 -->
                    <div v-if="row.type === 2 &&row.visible">
                      <a-date-picker
                        style="min-width: 178px;width: 178px"
                        @change="dateChange($event,index)"
                        placeholder="请选择时间"
                        locale="{locale}"
                        format="YYYY-MM-DD HH:mm:ss"
                        :showTime="{ defaultValue: moment(row.value, 'HH:mm:ss',index) }"
                        :defaultValue="moment(row.value, 'YYYY-MM-DD HH:mm:ss',index)"
                      />
                    </div>

                    <div v-if="row.type === 3&&row.visible">
                      <a-input
                        type="number"
                        style="width: 178px"
                        v-model="row.value"
                        placeholder="请输入"
                      ></a-input>
                    </div>

                    <div v-if="row.type === 4">
                      <div style="width: 178px"></div>
                    </div>

                    <div style="width: 178px" v-if="row.type === 5&&row.visible">
                      <a-select
                        show-search
                        v-model="row.value"
                        style="width: 178px"
                        :getPopupContainer="getPopupContainer"
                      >
                        <a-select-option value="true">true</a-select-option>
                        <a-select-option value="false">false</a-select-option>
                      </a-select>
                    </div>

                    <div
                      style="width: 178px;"
                      v-if="row.type === 6 && row.code !== 'sequenceStatus'&&row.visible"
                    >
                      <staff-selector v-model="row.value" :onlyForm="true" :options="getStaffSelectorOpts(row)"></staff-selector>
                    </div>

                    <div
                      style="width: 178px"
                      v-if="row.type === 6 && row.code === 'sequenceStatus'&&row.visible"
                    >
                      <a-select
                        show-search
                        v-model="row.value"
                        style="width: 178px"
                        :getPopupContainer="getPopupContainer"
                      >
                        <a-select-option value="PROCESSING">进行中</a-select-option>
                        <a-select-option value="COMPLETED">已完成</a-select-option>
                        <!-- <a-select-option value="CANCELLED">已作废</a-select-option> -->
                      </a-select>
                    </div>
                    <!-- 时间 需要校验 -->
                    <div v-if="row.type === 12 &&row.visible">
                      <a-time-picker
                        style="min-width: 178px;width: 178px"
                        @change="timeChange($event,index)"
                        placeholder="请选择时间"
                        locale="{locale}"
                        format="HH:mm:ss"
                        :defaultValue="moment(row.value, 'HH:mm:ss',index, 1)"
                      />
                    </div>
                  </div>
                </template>
              </a-col>
              <a-col :span="2" style="text-align:right;padding-top:4px">
                <span class="delete" @click="delRows(index)">
                  <i class="icon aufontAll h-icon-all-delete-o"></i>
                </span>
              </a-col>
            </a-row>
          </div>
          <div class="add">
            <span @click="addRows" style="cursor:pointer">
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span>新增条件</span>
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
  Prop,
  Mixins,
  Inject,
  Watch,
} from "vue-property-decorator";
import appsApi from "@/apis/apps";
import DataItemSelect from "../../data-rule/data-item-select.vue";
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { DataItemType } from "@cloudpivot/form/schema";
import { PropertyComponent } from "@h3/designer-core/property-panel";
import * as forms from "h3-forms";
import moment from "moment";
import { dateFormatter } from "@cloudpivot/form/src/renderer/utils/date-formatter";
import locale from "@h3/antd-vue/lib/date-picker/locale/zh_CN";

import {
  BizRuleDataCondition,
  Eexpr,
  Icondition,
} from "../typings/rule-data-condition-type";
import bizrule from "../../../../store/modules/app/bizrule";

const BizRule = new BizRuleDataCondition();
interface IDataCondition {
  /**条件组合类型 */
  dataConditionJoinType: string;
  /**数据条件 */
  conditions: Array<any>;
}
@Component({
  name: "propertyDataFilter",
  components: {
    StaffSelector,
    DataItemSelect,
  },
})
export default class propertyDataFilter extends Mixins(PropertyComponent) {
  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }
  visible: boolean = false;
  valueFileds: string = "";
  dataConditionJoinType: string = "ALL";
  // 数据条件
  filtersList: { [index: string]: any }[] = [];
  // 数据字段数据源
  fieldList: any[] = [];

  isShowAlert: boolean = true;
  inputValue: string = ""; // input框 内容
  moment(val: string, f: string, index: number, isTime = 0) {
    if (!val) {
      let d = new Date();
      if (isTime) {
        this.filtersList[index].value = moment(d).format("HH:mm:ss");
      } else {
        this.filtersList[index].value = dateFormatter(d, "YYYY-MM-DD HH:mm:ss");
      }
      return moment(d, f);
    }
    return moment(val, f);
  }
  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  };

  addUsers(val: any) {
    // this.users = val;
  }
  selectChange() {}

  getStaffSelectorOpts(row){
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: "请选择",
    }
    // switch (row.propertyType) {
    //   case DataItemType.StaffSingle:
    //     obj.selectOrg = false;
    //     obj.selectUser = true;
    //     obj.mulpitle = false;
    //     break;
    //   case DataItemType.StaffMulti:
    //     obj.selectOrg = false;
    //     obj.selectUser = true;
    //     obj.mulpitle = true;
    //     break;
    //   case DataItemType.DeptSingle:
    //     obj.selectOrg = true;
    //     obj.selectUser = false;
    //     obj.mulpitle = false;
    //     break;
    //   case DataItemType.DeptMulti:
    //     obj.selectOrg = true;
    //     obj.selectUser = false;
    //     obj.mulpitle = true;
    //     break;
    // }
    return obj;
  }
  // 获取绑定数据项
  async getDataItems(schemaCode: string, childCode?: string) {
    this.fieldList = [];
    const res = await appsApi.getDataItemList({ schemaCode: schemaCode });
    if (res && res.errcode === 0) {
      res.data.map((d: any) => {
        d.code !== childCode &&
          d.propertyType !== DataItemType.RelevanceForm &&
          d.propertyType !== DataItemType.RelevanceFormEx &&
          this.fieldList.push(d);
      });

      // 需要添加子表字段
      if (childCode) {
        const childData = res.data.find((d: any) => d.code === childCode);
        if (
          childData &&
          childData.subSchema &&
          childData.subSchema.properties
        ) {
          // this.fieldList.push(...childData.subSchema.properties);
          childData.subSchema.properties.map((p: any) => {
            if (
              p.code !== "sortKey" &&
              p.code !== "parentId" &&
              p.code !== "id" &&
              p.propertyType !== DataItemType.RelevanceForm &&
              p.propertyType !== DataItemType.RelevanceFormEx
            ) {
              p.code = `${childCode}.${p.code}`;
              this.fieldList.push(p);
            }
          });
        }
      }
      this.dataItemIsExist();
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  dateChange(date: any, i) {
    this.filtersList[i].value = dateFormatter(date._d, "YYYY-MM-DD HH:mm:ss");
  }
  // 确定
  handleOk() {
    // 如果选择是所有数据则保存空数组值
    this.dataConditionJoinType === "ALL"
      ? (this.filtersList = [])
      : this.filtersList;
    this.value = {
      dataConditionJoinType: this.dataConditionJoinType,
      conditions: this.filtersList,
    };
    // 页面非空判断
    if (this.dataConditionJoinType !== "ALL") {
      let errorMsg: string = "";
      if (this.filtersList.length > 0) {
        this.filtersList.map((d: any) => {
          if (d.currentSchemaDataItem === "" || d.ruleDataConditionType === "")
            errorMsg = "数据条件不成立";
          if (
            d.currentSchemaDataItem !== "" &&
            d.ruleDataConditionType !== "EP" &&
            d.ruleDataConditionType !== "NEP" &&
            (d.value === "" || d.value.length === 0)
          )
            errorMsg = "数据条件不成立";
        });
      }

      if (errorMsg !== "") {
        this.$message.error(errorMsg);
        return false;
      }
    }
    if (this.filtersList.length > 0) {
      this.inputValue = "已设置";
    } else {
      this.inputValue = "未设置";
    }

    this.emitChange(this.value);
    this.modalHide();
  }

  modalShow(): void {
    this.visible = true;
    this.initModal();
  }
  modalHide(): void {
    this.visible = false;
  }
  initModal() {
    this.filtersList = [];
    this.dataConditionJoinType = "ALL";

    // 编辑
    if (
      this.controller.children.dataCondition &&
      this.controller.children.dataCondition.value
    ) {
      const editData = this.controller.children.dataCondition.value;
      editData.dataConditionJoinType
        ? (this.dataConditionJoinType = editData.dataConditionJoinType)
        : this.dataConditionJoinType;
      editData.conditions
        ? (this.filtersList = editData.conditions)
        : this.filtersList;
    }

    const val = this.controller.children.triggerObjectCode;
    if (val && val.value) {
      // 判断是否存在主表
      const vals = val.value.split(".");
      if (vals.length > 1) {
        this.getDataItems(vals[0], vals[1]);
      } else {
        this.getDataItems(val.value);
      }
    }
  }

  // 当数据项被删除后要删除
  dataItemIsExist() {
    this.filtersList.forEach((item: any, index: number) => {
      const dataItem = this.fieldList.find(
        (field: any) => field.code === item.currentSchemaDataItem
      );
      if (!dataItem) {
        this.filtersList.splice(index, 1);
      }
    });

    this.filtersList.forEach((item: any, index: number) => {
      const dataItem = this.fieldList.find(
        (field: any) => field.code === item.currentSchemaDataItem
      );
      this.setValueCtrl(dataItem, index);
    });
  }

  // 添加行
  addRows(): void {
    // newRow Data
    const newRow = {
      currentSchemaDataItem: "",
      type: 0,
      ruleDataConditionType: "",
      value: "",
      conditionTypeList: "",
      visible: true,
      code: "",
      propertyType: 0
    };
    this.filtersList.push(...[newRow]);
  }
  // 删除行
  delRows(index) {
    this.filtersList.splice(index, 1);
  }
  // 数据项改变
  dataItemChange(val: any, index) {
    this.filtersList[index].value = "";
    //this.filtersList[index].value instanceof Array ? this.filtersList[index].value = [] : this.filtersList[index].value = '';
    const currentItem: any = this.fieldList.find(
      (item: any) => item.code === val
    );
    // 
    this.setValueCtrl(currentItem, index, true);
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
  setValueCtrl(item: any, index: number, type: boolean = false) {
    let currentRowData = this.filtersList[index];
    currentRowData.conditionTypeList = [];
    currentRowData.code = item.code;
    currentRowData.propertyType = item.propertyType;
    currentRowData.conditionTypeList = this.tiggerFilterOf(
      item.propertyType,
      item.code
    );
    if (item.propertyType === DataItemType.StaffSingle ||
      item.propertyType === DataItemType.StaffMulti ||
      item.propertyType === DataItemType.DeptSingle ||
      item.propertyType === DataItemType.DeptMulti ||
      item.propertyType === DataItemType.StaffDeptMix)
      currentRowData.conditionTypeList.reverse();

    // 当数据项改变时选中默认操作符
    type &&
      (currentRowData.ruleDataConditionType =
        currentRowData.conditionTypeList[0].code);
    // 根据Item值生成对应的控件
    currentRowData.type = BizRule.showControls(item);

    this.operatorChange(currentRowData.ruleDataConditionType, index);
    // // 数据项改变时重置控件值
    // this.filtersList[index].value = "";
  }
  /**
   * 目标数据项 不同类型对应的 可以选择的 操作符
   */
  tiggerFilterOf(type: number, code: string) {
    let exprArray: number[] = [];
    switch (type) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
        exprArray = [Eexpr.EQ, Eexpr.NEQ];
        if (code !== "sequenceStatus") {
          if (code === "name" || code === "sequenceNo")
            exprArray.push(...[Eexpr.CT, Eexpr.NCT]);
          else exprArray.push(...[Eexpr.CT, Eexpr.NCT, Eexpr.EP, Eexpr.NEP]);
        }
        break;
      case DataItemType.Number:
        exprArray = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.GTEQ,
          Eexpr.LT,
          Eexpr.LTEQ,
          Eexpr.EP,
          Eexpr.NEP,
        ];
        break;
      case DataItemType.Date:
        exprArray = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.GTEQ,
          Eexpr.LT,
          Eexpr.LTEQ,
        ];
        if (code !== "createdTime" && code !== "modifiedTime")
          exprArray.push(...[Eexpr.EP, Eexpr.NEP]);
        break;
      case DataItemType.Time:
        exprArray = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.GTEQ,
          Eexpr.LT,
          Eexpr.LTEQ,
          Eexpr.EP,
          Eexpr.NEP,
        ];
        break;
      case DataItemType.Logic:
        exprArray = [Eexpr.EQ];
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        if (
          code !== "creater" &&
          code !== "createdDeptId" &&
          code !== "owner" &&
          code !== "ownerDeptId"
        ) {
          exprArray = [Eexpr.OF, Eexpr.EP, Eexpr.NEP];
        } else {
          exprArray = [Eexpr.OF];
        }

        break;
    }
    return BizRule.getConditionByCode(exprArray);
  }

  //时间改变
  timeChange(date: any, i) {
    this.filtersList[i].value = date.format("HH:mm:ss");
    ;
  }

  @Watch("value", {
    immediate: true,
  })
  valueChange() {
    if (
      this.value &&
      this.value.hasOwnProperty("conditions") &&
      this.value.conditions.length > 0
    ) {
      this.inputValue = "已设置";
      if (
        this.value.conditions.some((item) => {
          return (
            item.ruleDataConditionType !== "EP" &&
            item.ruleDataConditionType !== "NEP" &&
            !item.value
          );
        })
      ) {
        this.inputValue = "未设置";
      }
    } else {
      this.inputValue = "未设置";
    }
  }
}
</script>

<style lang='less'>
.property-data-filter {
  .title-tips {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  .add {
    margin-top: 20px;
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    margin-right: 24px;
    span {
      margin-right: 8px;
    }
  }
  .filters {
    margin-top: 15px;
    padding-left: 5px;
  }
  .data-filter {
    width: 110px;
  }
  .data-filed {
    width: 150px;
  }

  .data-select {
    width: 150px !important;
  }
}
</style>
