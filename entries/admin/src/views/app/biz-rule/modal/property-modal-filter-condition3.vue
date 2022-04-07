<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt">{{ inputValue }}</span>
      <a-icon type="ellipsis" />
    </div>
    <a-modal
      v-model="visible"
      @ok="modalOk"
      @cancel="modalHide"
      okText="确定"
      cancelText="取消"
      wrapClassName="properFilterCondition"
      width="810px"
    >
      <template slot="title">
        <div>
          <span>{{ title }}</span>
          <!-- <span class="title-tips">满足条件的数据将执行新增数据动作</span> -->
        </div>
      </template>
      <div class="centent">
        <a-select v-if="false" style="width: 292px" v-model="dataConditionJoinType">
          <a-select-option key="AND">满足所有条件的数据</a-select-option>
          <a-select-option key="OR">满足任一条件的数据</a-select-option>
        </a-select>
        <!--主表条件-->
        <div class="filters">
          <!-- <a-row style="margin-top: 15px">
            <span class="filter-title">主表条件</span>
            <span class="title-tips">{{ tips }}</span>
          </a-row>-->
          <a-row style="margin-top: 10px">
            <a-col :span="7" class="fieldlab">数据项</a-col>
            <a-col :span="3" class="fieldlab" style="margin-left: 5px">比较符号</a-col>
            <a-col :span="6" class="fieldlab" style="margin-left: -5px">比较方式</a-col>
            <a-col :span="7" class="fieldlab" style="margin-left: -5px">对比值</a-col>
            <a-col :span="1"></a-col>
          </a-row>
          <a-row v-for="(row, index) in filtersList.main" :key="index" style="margin-top: 5px">
            <a-col :span="7">
              <data-item-select
                :onlyPublished="true"
                v-model="row.currentSchemaDataItem"
                :list="targetFieldList.main"
                :systemFilterCtl="{
                  code: [
                    'workflowInstanceId',
                    'ownerDeptQueryCode',
                    'sortKey',
                    'modifier',
                  ],
                }"
                :bizFilterCtl="{ type: [7, 8, 9, 10, 11] }"
                :disabled="false"
                @change="
                  (val) => {
                    targetDataItemChange(val, index, 'main');
                  }
                "
              ></data-item-select>
            </a-col>

            <a-col :span="3">
              <a-select
                class="data-filter"
                v-model="row.ruleDataConditionType"
                placeholder="请选择"
                @change="
                  operatorChange(row.ruleDataConditionType, index, 'main')
                "
              >
                <a-select-option
                  v-for="(type, index) in row.conditionTypeList"
                  :value="type.code"
                  :key="index"
                  :title="type.name"
                >{{ type.name }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select
                style="width: 180px"
                v-if="row.visible"
                v-model="row.ruleValueType"
                @change="valueTypeChange('main', row.ruleValueType, index)"
              >
                <template v-for="ruleValueTypeItem in row.ruleValueTypeList">
                  <a-select-option
                    :value="ruleValueTypeItem.id"
                    :key="ruleValueTypeItem.id"
                  >{{ ruleValueTypeItem.name }}</a-select-option>
                </template>
              </a-select>
            </a-col>
            <a-col :span="7">
              <div v-if="row.ruleValueType == 'DYNAMIC' && row.visible">
                <data-item-select
                  :onlyPublished="true"
                  style="margin-left: -5px"
                  v-model="row.value"
                  :list="row.currentFieldList"
                  :systemFilterCtl="{
                    code: [
                      'name',
                      'id',
                      'workflowInstanceId',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [7, 8, 9, 10, 11] }"
                  :disabled="false"
                  @change="
                    (val) => {
                      currentDataItemChange(val, index, 'main');
                    }
                  "
                ></data-item-select>
              </div>
              <template v-if="row.ruleValueType == 'FIXED' && row.visible">
                <div v-if="row.propertyType == 3">
                  <a-date-picker
                    style="width: 220px;margin-left:-5px"
                    @change="dateChange($event, index, 'main')"
                    format="YYYY-MM-DD HH:mm:ss"
                    :showTime="{
                      defaultValue: moment(
                        row.value,
                        'HH:mm:ss',
                        index,
                        'main'
                      ),
                    }"
                    :defaultValue="
                      moment(row.value, 'YYYY-MM-DD HH:mm:ss', index, 'main')
                    "
                    placeholder="请选择时间"
                  />
                </div>

                <div v-else-if="row.propertyType === 2">
                  <a-input
                    type="number"
                    style="width: 220px; margin-left: -5px"
                    v-model="row.value"
                    placeholder="请输入"
                  ></a-input>
                </div>
                <div v-else-if="row.propertyType == 4">
                  <a-select style="width: 220px; margin-left: -5px" v-model="row.value">
                    <a-select-option key="1" :value="true">true</a-select-option>
                    <a-select-option key="2" :value="false">false</a-select-option>
                  </a-select>
                </div>
                <div style="margin-left:-5px" v-else-if="[5, 50, 51, 60, 61 ].includes(row.propertyType)">
                  <staff-selector v-model="row.value" :options="getStaffSelectorOpts(row.propertyType)"></staff-selector>
                </div>
                <div v-else-if="row.propertyType === 12">
                  <!-- <a-time-picker
                    style="width: 220px;margin-left:-5px"
                    @change="timeChange($event, index, 'main')"
                    placeholder="请选择时间"
                    format="HH:mm:ss"
                    :defaultValue="moment(row.value, 'HH:mm:ss', index, 'main', 1)"
                  /> -->
                  <a-input
                    type="text"
                    style="width: 220px; margin-left: -5px"
                    v-model="row.value"
                    placeholder="请输入"
                  ></a-input>
                </div>
                <div v-else>
                  <a-input
                    type="text"
                    style="width: 220px; margin-left: -5px"
                    v-model="row.value"
                    placeholder="请输入"
                  ></a-input>
                </div>
              </template>
            </a-col>
            <a-col :span="1" style="text-align: center; padding-top: 4px">
              <span class="delete" @click="delRows(index, 'main')">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>

          <div class="add" v-if="filtersList.main.length < 1">
            <span>
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span @click="addRows('main')">新增查询条件</span>
            </span>
          </div>
        </div>
        <!--子表条件-->
        <!-- <div class="filters" v-if="subSchemaCode">
          <a-row style="margin-top: 15px">
            <span class="filter-title">子表条件</span>
            <span class="title-tips">查找符合条件的子表数据</span>
          </a-row>
          <a-row style="margin-top: 10px">
            <a-col :span="7" class="fieldlab">数据项</a-col>
            <a-col :span="3" class="fieldlab" style="margin-left: 5px"
              >比较符号</a-col
            >
            <a-col :span="6" class="fieldlab" style="margin-left: -5px"
              >比较方式</a-col
            >
            <a-col :span="7" class="fieldlab" style="margin-left: -5px"
              >对比值</a-col
            >
            <a-col :span="1"></a-col>
          </a-row>
          <a-row
            v-for="(row, index) in filtersList.child"
            :key="index"
            style="margin-top: 5px"
          >
            <a-col :span="7">
              <data-item-select
                v-model="row.currentSchemaDataItem"
                :list="targetFieldList.child"
                :systemFilterCtl="{
                  code: [
                    'workflowInstanceId',
                    'ownerDeptQueryCode',
                    'sortKey',
                    'modifier',
                  ],
                }"
                :disabled="false"
                @change="
                  (val) => {
                    targetDataItemChange(val, index, 'child');
                  }
                "
              ></data-item-select>
            </a-col>

            <a-col :span="3">
              <a-select
                class="data-filter"
                v-model="row.ruleDataConditionType"
                placeholder="请选择"
                @change="
                  operatorChange(row.ruleDataConditionType, index, 'child')
                "
              >
                <a-select-option
                  v-for="(type, index) in row.conditionTypeList"
                  :value="type.code"
                  :key="index"
                  >{{ type.name }}</a-select-option
                >
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select
                style="width: 180px"
                v-model="row.ruleValueType"
                @change="valueTypeChange('child', row.ruleValueType, index)"
              >
                <template v-for="item in row.ruleValueTypeList">
                  <a-select-option :value="item.id" :key="item.id">{{
                    item.name
                  }}</a-select-option>
                </template>
              </a-select>
            </a-col>
            <a-col :span="7">
              <div v-if="row.ruleValueType == 'DYNAMIC'">
                <data-item-select
                  style="margin-left: -5px"
                  v-model="row.value"
                  :list="row.currentFieldList"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [10, 8, 6, 7] }"
                  :disabled="false"
                  @change="
                    (val) => {
                      currentDataItemChange(val, index, 'main');
                    }
                  "
                ></data-item-select>
              </div>
              <template v-if="row.ruleValueType == 'FIXED'">
                <div v-if="row.propertyType == 3">
                  <a-date-picker
                    style="width: 220px"
                    @change="dateChange($event, index, 'child')"
                    format="YYYY-MM-DD HH:mm:ss"
                    :showTime="{
                      defaultValue: moment(
                        row.value,
                        'HH:mm:ss',
                        index,
                        'child'
                      ),
                    }"
                    :defaultValue="
                      moment(row.value, 'YYYY-MM-DD HH:mm:ss', index, 'child')
                    "
                    placeholder="请选择时间"
                  />
                </div>
                <div v-else-if="row.propertyType === 2">
                  <a-input
                    type="number"
                    style="width: 220px; margin-left: -5px"
                    v-model="row.value"
                    placeholder="请输入"
                  ></a-input>
                </div>
                <div v-else-if="row.propertyType == 4">
                  <a-select style="width: 220px" v-model="row.value">
                    <a-select-option key="1" value="true">true</a-select-option>
                    <a-select-option key="2" value="false"
                      >false</a-select-option
                    >
                  </a-select>
                </div>
                <div v-else-if="row.propertyType == 5">
                  <staff-selector
                    v-model="row.value"
                    :options="staffSelectorOpts"
                  ></staff-selector>
                </div>
                <div v-else>
                  <a-input
                    type="text"
                    style="width: 220px"
                    v-model="row.value"
                    placeholder="请输入"
                  ></a-input>
                </div>
              </template>
            </a-col>
            <a-col :span="1" style="text-align: center">
              <span class="delete" @click="delRows(index, 'child')">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>

          <div class="add">
            <span>
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span @click="addRows('child')">新增查询条件</span>
            </span>
          </div>
        </div>-->
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
import { PropertyComponent } from "@h3/designer-core/property-panel";
import * as forms from "h3-forms";
import moment from "moment";
import { dateFormatter } from "@cloudpivot/form/src/renderer/utils/date-formatter";
import { DataItemType } from "@cloudpivot/form/schema";

import {
  BizRuleDataCondition,
  Eexpr,
  Icondition,
  SystemDataItemCode,
} from "../typings/rule-data-condition-type";

const BizRule = new BizRuleDataCondition();

interface ITableCondition {
  /**目标模型数据项 */
  currentSchemaDataItem: string;
  /**比较符号 */
  ruleDataConditionType: string;
  /**值  TODO 类型？ */
  value: any;
  /**当前模型数据项 */
  [propName: string]: any;
}

// 传给后台的数据格式
interface IFilterCondition {
  /**条件组合类型 */
  dataConditionJoinType: string;
  /**主表条件 */
  conditions: Array<ITableCondition>;
  /**子表条件 */
}

@Component({
  name: "PropertyFilterCondition",
  components: {
    StaffSelector,
    DataItemSelect,
  },
})
export default class PropertyFilterCondition extends Mixins(PropertyComponent) {
  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }
  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }
  get subSchemaCode() {
    return this.controller.children.triggerObjectCode
      ? this.controller.children.triggerObjectCode.value.split(".")[1]
      : "";
  }
  @Prop()
  dataItems!: any;
  visible: boolean = false;
  dataConditionJoinType: string = "AND";
  childSchemaCode: string = "";
  showChildTable: boolean = false;
  inputValue: string = "未设置";
  title: string = "验证条件";
  tips: string = "满足以下条件的数据将不执行新增数据动作";
  // 提交给后台的数据
  curValue: IFilterCondition = {
    dataConditionJoinType: this.dataConditionJoinType,
    conditions: [],
  };
  // 数据条件对象，包含主表和子表
  filtersList: { main: ITableCondition[]; child: ITableCondition[] } = {
    main: [],
    child: [],
  };

  // 目标模型数据字段数据源
  targetDataItems: any = [];
  currentDataItems: any = [];

  targetFieldList: { main: any[]; child: any[] } = { main: [], child: [] };

  // 当前模型数据字段数据源
  currentFieldList: { main: any[]; child: any[] } = { main: [], child: [] };

  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  };
  getStaffSelectorOpts(cond) {
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: "请选择",
    }
    switch (cond) {
      case DataItemType.StaffSingle:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = false;
        break;
      case DataItemType.StaffMulti:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
      case DataItemType.DeptSingle:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = false;
        break;
      case DataItemType.DeptMulti:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = true;
        break;
      case DataItemType.StaffDeptMix:
        obj.selectOrg = true;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
    }
    return obj;
  }

  // 触发类型
  trigerObject: any = {
    trigerType: -1,
    trigerObj: "",
    targetObj: "",
  };

  @Watch("value", {
    immediate: true,
  })
  watchValue(val) {
    this.emitChange(val);
    if (this.value.conditions && this.value.conditions.length) {
      this.inputValue = "已设置";
    } else {
      this.inputValue = "未设置";
    }
  }

  moment(val: string, f: string, index: number, type: string, isTime = 0) {
    if (!val) {
      let d = new Date();
      if (isTime) {
        this.filtersList[type][index].value = moment(d).format("HH:mm:ss");
      } else {
        this.filtersList[type][index].value = dateFormatter(
          d,
          "YYYY-MM-DD HH:mm:ss"
        );
      }
      return moment(d, f);
    }
    return moment(val, f);
  }

  initModal() {
    this.filtersList.main = [];
    this.filtersList.child = [];
    this.dataConditionJoinType = "AND";
    // 根据不同节点设置弹出窗标题
    const nodeType: string = this.controller.value.dataTriggerType;
    if (nodeType === "UPDATE") {
      this.title = "查找数据范围";
      this.tips = "满足以下条件的数据将执行更新数据动作";
    } else if (nodeType === "DELETE") {
      this.title = "删除数据范围";
      this.tips = "满足以下条件的数据将执行删除数据动作";
    } else {
      this.title = "验证条件";
      this.tips = "满足以下条件的数据将不执行新增数据动作";
    }
    // 编辑时候
    this.getDataItems();
    if (this.controller.value && this.controller.value.dataCondition) {
      const value = this.controller.value.dataCondition;

      if (Array.isArray(value.conditions)) {
        if (value.conditions.length === 0) {
          this.filtersList.main = [];
        } else {
          this.filtersList.main = BizRule.deepCopy(value.conditions);
        }
        if (this.filtersList.main.length > 0) {
          this.filtersList.main.forEach((res, index) => {
            this.targetDataItemChange(
              res.currentSchemaDataItem,
              index,
              "main",
              true
            );
          });
        }
      }
      if (value.dataConditionJoinType) {
        this.dataConditionJoinType = value.dataConditionJoinType;
      }

      this.dataItemIsExist();
    }
    this.filtersList.main.length === 0 && this.addRows("main");
  }

  // 当数据项被删除后要删除
  dataItemIsExist() {
    if (this.filtersList.main.length > 0) {
      this.removeNotExistItem("main");
    }
    if (this.filtersList.child.length > 0) {
      this.removeNotExistItem("child");
    }
  }

  removeNotExistItem(type: string) {
    this.filtersList[type].map((item: any, index: number) => {
      // 判断目标模型
      let targetdataItem: any = undefined;
      const targetSheets = this.targetDataItems.filter(
        (val) => val.propertyType === DataItemType.Sheet
      );

      targetSheets.map((sheet: any) => {
        this.targetDataItems.push(...sheet.subSchema.properties);
      });
      targetdataItem = this.targetDataItems.filter(
        (val) => val.code === item.currentSchemaDataItem
      );
      if (targetdataItem && targetdataItem.length === 0) {
        this.filtersList[type][index] = undefined;
      } else {
        // 判断是否为子表字段
        let dataItem: any = undefined;
        if (!item.value.includes(".")) {
          dataItem = this.dataItems.filter(
            (val: any) => val.code === item.value
          );
        } else {
          const sheets = this.dataItems.filter(
            (data: any) => data.propertyType === DataItemType.Sheet
          );
          const sheetDataItems: any = [];
          sheets.map((sheet: any) => {
            sheetDataItems.push(...sheet.subSchema.properties);
          });
          const code = item.value.split(".")[1] || "";
          if (code) {
            dataItem = sheetDataItems.filter((val: any) =>
              val.code.includes(code)
            );
          }
        }
        if (dataItem && dataItem.length === 0) {
          const data = item.currentFieldList.find(
            (val: any) => val.code === item.value
          );
          const dataIndex = item.currentFieldList.indexOf(data);
          dataIndex > -1 &&
            this.filtersList[type][index].currentFieldList.splice(dataIndex, 1);
          this.filtersList[type][index].value = item.value || "";
        }
      }
    });
    this.filtersList[type] = this.filtersList[type].filter((f: any) => f);
    this.filtersList.main.length === 0 && this.addRows("main");
  }

  dateChange(date: any, i: number, type: string) {
    this.filtersList[type][i].value = dateFormatter(
      date._d,
      "YYYY-MM-DD HH:mm:ss"
    );
  }

  timeChange(date: any, i: number, type: string) {
    this.filtersList[type][i].value = date.format("HH:mm:ss");
  }

  // 获取绑定数据项
  getDataItems() {
    this.targetDataItems = this.dataItems.filter(
      (val) =>
        val.propertyType !== DataItemType.Sheet &&
        val.propertyType !== DataItemType.RelevanceForm &&
        val.propertyType !== DataItemType.RelevanceFormEx &&
        val.propertyType !== DataItemType.ApprovalOpinion
    );
    this.targetFieldList.main = this.dataItems.filter(
      (val) =>
        val.propertyType !== DataItemType.Sheet &&
        // val.propertyType !== DataItemType.StaffSingle &&
        val.propertyType !== DataItemType.Attachment &&
        val.propertyType !== DataItemType.RelevanceForm &&
        val.propertyType !== DataItemType.RelevanceFormEx &&
        val.propertyType !== DataItemType.ApprovalOpinion
    );
    this.currentFieldList.main = this.dataItems.filter(
      (val) =>
        val.propertyType !== DataItemType.Sheet &&
        val.propertyType !== DataItemType.RelevanceForm &&
        val.propertyType !== DataItemType.RelevanceFormEx &&
        val.propertyType !== DataItemType.ApprovalOpinion
    );
    if (this.subSchemaCode) {
      this.targetFieldList.child = this.dataItems
        .find((d) => d.code === this.subSchemaCode)
        .subSchema.properties.filter(
          (val) =>
            val.propertyType !== DataItemType.Sheet &&
            val.propertyType !== DataItemType.RelevanceForm &&
            val.propertyType !== DataItemType.RelevanceFormEx &&
            val.propertyType !== DataItemType.ApprovalOpinion
        );
      const vals = this.trigerObject.trigerObj.split(".");
      this.currentFieldList.main = this.dataItems.filter(
        (d: any) =>
          d.code !== vals[1] &&
          d.propertyType !== DataItemType.Sheet &&
          d.propertyType !== DataItemType.RelevanceForm &&
          d.propertyType !== DataItemType.RelevanceFormEx &&
          d.propertyType !== DataItemType.ApprovalOpinion
      );
      const childData = this.dataItems.find((d: any) => d.code === vals[1]);
      if (childData && childData.subSchema && childData.subSchema.properties) {
        childData.subSchema.properties.map((c: any) => {
          !c.code.includes(".") ? (c.code = `${vals[1]}.${c.code}`) : c.code;
          if (!c.code.includes("sortKey")) this.currentFieldList.main.push(c);
        });
      }
    }
  }

  // 添加行
  addRows(type: string): void {
    // newRow Data
    const newRow: ITableCondition = {
      currentSchemaDataItem: "",
      ruleValueTypeList: [], // 比较方式 列表
      currentFieldList: [], // 当前模型数据项
      ruleValueType: "", // 比较方式 值
      ruleDataConditionType: "",
      value: "",
      code: "",
      visibleCtrl: -1,
      visible: true,
      propertyType: "",
    };
    this.filtersList[type].push(...[newRow]);
  }
  // 删除行
  delRows(index, type) {
    this.filtersList[type].splice(index, 1);
  }
  modalShow() {
    this.visible = true;

    this.initModal();
  }
  // 关闭
  modalHide() {
    this.visible = false;
    this.resetList();
  }
  // 重置列表
  resetList() {
    this.filtersList.main = [];
    this.filtersList.child = [];
    this.targetFieldList.main = [];
    this.targetFieldList.child = [];
    this.currentFieldList.main = [];
    this.currentFieldList.child = [];
  }
  // 确定
  modalOk() {
    if (!this.submitVerify(this.filtersList.main)) {
      this.$message.error("验证条件不成立");
      return;
    } else if (this.filtersList.main.length === 0) {
      this.$message.error("验证条件必填");
      return;
    }
    let value = {
      dataConditionJoinType: this.dataConditionJoinType,
      conditions: BizRule.deepCopy(this.filtersList.main),
    };

    if(Array.isArray(value.conditions)){
      value.conditions.forEach(item => {
        if(item.currentSchemaDataItem){ 
          let current = this.targetFieldList.main.find(el => el.code === item.currentSchemaDataItem)
          if(current){
            item.currentSchemaDataItemName = current.name
          }
        }

        if(item.value){
          let current = Array.isArray(item.currentFieldList) && item.currentFieldList.find(el => el.code === item.value)
          if(current){
            item.valueName = current.name
          }
        }
      });
    }



    Object.getOwnPropertyNames(value.conditions).length === 0
      ? (value.conditions = [])
      : value.conditions;
    this.emitChange(value);
    this.modalHide();
  }
  submitVerify(list: any) {
    if (list.length > 0) {
      for (let item of list) {
        if (item.ruleValueType === "") {
          return false;
        } else if (
          item.ruleDataConditionType === "EP" ||
          item.ruleDataConditionType === "NEP"
        ) {
          item.value = "";
          item.error = true;
        } else {
          switch (item.ruleValueType) {
            case "DYNAMIC":
              if (item.value) {
                item.error = true;
              } else {
                item.error = false;
                return false;
              }
              break;
            case "FIXED":
              if (item.value.toString() !== "" || item.value === 0) {
                item.error = true;
              } else {
                item.error = false;
                return false;
              }
              break;
            case "EMPTY":
              item.value = "";
              item.value = "";
          }
        }
      }
    }
    return true;
  }

  // 目标数据项改变
  targetDataItemChange(val: any, index: number, type: string, isInit = false) {
    const targetItem: any = this.targetFieldList[type].find(
      (item: any) => item.code === val
    );
    if (!targetItem) {
      return;
    }
    this.setValueCtrl(targetItem, index, type, isInit); // 设置对比函数
    this.setRuleValueTypeList(targetItem, index, type, isInit); // 设置 比较方式
    this.setCurrentFieldList(targetItem, index, type); // 设置符合当前目标模型数据项的 当前模型数据项
  }
  // 设置符合目标模式数据项的 比较方式
  setRuleValueTypeList(targetItem, index, type, isInit) {
    if (!isInit) {
      if (targetItem.propertyType === DataItemType.StaffSingle) {
        this.filtersList[type][index].ruleValueType = "FIXED";
      } else {
        this.filtersList[type][index].ruleValueType = "DYNAMIC";
      }
    }
    if (
      targetItem.code === SystemDataItemCode.Id ||
      [
        SystemDataItemCode.CreatedDeptId,
        SystemDataItemCode.Creater,
        SystemDataItemCode.Owner,
        SystemDataItemCode.OwnerDeptId,
        SystemDataItemCode.ParentId,
      ].includes(targetItem.code)
    ) {
      this.filtersList[type][
        index
      ].ruleValueTypeList = this.ruleValueTypeList.filter(
        (val) => val.id === "DYNAMIC" || val.id === "FIXED"
      );
      return;
    } else if (
      [
        SystemDataItemCode.SequenceStatus,
        SystemDataItemCode.Name,
        SystemDataItemCode.CreatedTime,
        SystemDataItemCode.ModifiedTime,
        SystemDataItemCode.SequenceNo,
      ].includes(targetItem.code)
    ) {
      this.filtersList[type][
        index
      ].ruleValueTypeList = this.ruleValueTypeList.filter(
        (val) => val.id === "DYNAMIC" || val.id === "FIXED"
      );
      return;
    }
    switch (targetItem.propertyType) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.Date:
      case DataItemType.Time:
      case DataItemType.LongText:
      case DataItemType.Number:
        this.filtersList[type][
          index
        ].ruleValueTypeList = this.ruleValueTypeList.filter(
          (val) =>
            val.id === "DYNAMIC" || val.id === "FIXED" || val.id === "EMPTY"
        );
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        this.filtersList[type][
          index
        ].ruleValueTypeList = this.ruleValueTypeList.filter(
          (val) => val.id === "FIXED" || val.id === "DYNAMIC"
        );
        break;
      case DataItemType.RelevanceForm:
        this.filtersList[type][
          index
        ].ruleValueTypeList = this.ruleValueTypeList.filter(
          (val) => val.id === "DYNAMIC" || val.id === "EMPTY"
        );
        break;
      case DataItemType.Logic:
        this.filtersList[type][
          index
        ].ruleValueTypeList = this.ruleValueTypeList.filter(
          (val) => val.id === "DYNAMIC" || val.id === "FIXED"
        );
        break;
    }
  }
  // 设置符合目标模型数据类型的 当前模式下数据项
  setCurrentFieldList(targetDataItem, index, type) {
    if (type === "child") {
      if (targetDataItem.code === SystemDataItemCode.Id) {
        this.filtersList[type][
          index
        ].currentFieldList = this.currentFieldList.main.filter((val) => {
          return (
            (val.propertyType === DataItemType.ShortText ||
              val.code === DataItemType.RelevanceForm) &&
            val.code !== SystemDataItemCode.SequenceStatus &&
            val.code !== SystemDataItemCode.Id &&
            val.code !== SystemDataItemCode.SequenceNo &&
            val.code !== SystemDataItemCode.Name
          );
        });
        return;
      }
    }
    switch (targetDataItem.propertyType) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        this.filtersList[type][
          index
          ].currentFieldList = this.currentFieldList.main.filter((val) => {
          return ([DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(targetDataItem.propertyType) ? [DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(val.propertyType) : [DataItemType.Checkbox, DataItemType.DropdownMulti ].includes(val.propertyType)) && !val.defaultProperty;
        });
        break
      case DataItemType.LongText:
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
      case DataItemType.Logic:
      case DataItemType.StaffDeptMix:
        this.filtersList[type][
          index
        ].currentFieldList = this.currentFieldList.main.filter((val) => {
            return (
              !val.defaultProperty &&
              val.propertyType === targetDataItem.propertyType
            );
        });
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        this.filtersList[type][
          index
          ].currentFieldList = this.currentFieldList.main.filter((val) => {
            return (
              !val.defaultProperty &&
              (val.propertyType === targetDataItem.propertyType || val.propertyType === DataItemType.StaffDeptMix)
            );
        });
        break;
      // 关联表单需要映射 相同的数据模型
      case DataItemType.RelevanceForm:
        // 判断选中的关联表单是否关联的当前模型
        const arry = this.currentFieldList[type].filter(
          (val) => val.schemaCode === targetDataItem.relativeCode
        );
        if (arry.length === 0) {
          // 主表触发主表
          this.filtersList[type][
            index
          ].currentFieldList = this.currentFieldList[type].filter(
            (val) => targetDataItem.relativeCode === val.relativeCode
          );
        } else {
          if (this.trigerObject.trigerType === 0) {
            this.filtersList[type][
              index
            ].currentFieldList = this.currentFieldList[type].filter(
              (val) =>
                (val.propertyType === targetDataItem.propertyType &&
                  targetDataItem.relativeCode === val.relativeCode) ||
                val.code.includes(SystemDataItemCode.Id)
            );
          } else {
            // 子表触发主表
            this.filtersList[type][
              index
            ].currentFieldList = this.currentFieldList.main.filter(
              (val) =>
                (targetDataItem.relativeCode === val.relativeCode &&
                  val.propertyType === targetDataItem.propertyType) ||
                val.code === SystemDataItemCode.Id ||
                val.code.includes(SystemDataItemCode.ParentId)
            );
          }
        }
        break;
    }
    //数据项和自身比较没有意义，筛掉自身
    this.filtersList[type][index].currentFieldList = this.filtersList[type][
      index
    ].currentFieldList.filter((item) => item.code !== targetDataItem.code);
  }

  // 当前数据项改变
  currentDataItemChange(val: any, index: number, type: string) {
    console.log(val);
  }

  // 操作符改变
  operatorChange(val: any, index, type: string) {
    const isVisible = BizRule.codeOf(val);
    if (isVisible !== undefined) {
      if (BizRule.codeOf(val) !== undefined) {
        isVisible.id === Eexpr.EP || isVisible.id === Eexpr.NEP
          ? (this.filtersList[type][index].visible = false)
          : (this.filtersList[type][index].visible = true);
      }
    }
  }

  // 根据选择的数据项触发对应的值控件
  setValueCtrl(
    item: any,
    index: number,
    type: string,
    isInit = false,
    isVauetypeChage = false
  ) {
    let currentRowData = this.filtersList[type][index];
    currentRowData.conditionTypeList = [];
    currentRowData.conditionTypeList = BizRule.filterConditionOf2(
      item.propertyType,
      item.code
    );
    // 切换数据项后重置conditionType
    if (!isInit) {
      currentRowData.conditionType = currentRowData.conditionTypeList[0].code;
    }
    currentRowData.propertyType = item.propertyType;
    currentRowData.code = item.code;
    if (!isInit) {
      currentRowData.value = "";
      currentRowData.value = "";
    }

    // 切换数据项后重置ruleDataConditionType
    if (!isInit && !isVauetypeChage) {
      currentRowData.ruleDataConditionType =
        currentRowData.conditionTypeList[0].code;
    }
    currentRowData.visible = !(
      currentRowData.ruleDataConditionType === "EP" ||
      currentRowData.ruleDataConditionType === "NEP"
    );

    // 根据Item值生成对应的控件
    currentRowData.type = BizRule.showControls(item);
  }

  valueTypeChange(type: string, value: string, index: number) {
    if (value === "EMPTY") {
      const optert = BizRule.valueOf(Eexpr.EQ) || null;
      if (optert) {
        this.filtersList[type][index].conditionTypeList = [];
        this.filtersList[type][index].conditionTypeList.push(optert);
        this.filtersList[type][index].conditionType = optert.code || "";
        this.filtersList[type][index].ruleDataConditionType = optert.code || "";
      }
    } else {
      const targetItem: any = this.targetFieldList[type].find(
        (item: any) =>
          item.code === this.filtersList[type][index].currentSchemaDataItem
      );
      this.setValueCtrl(targetItem, index, type, false, true); // 设置对比函数
    }
  }

  ruleValueTypeList = [
    { id: "DYNAMIC", name: "数据项" },
    { id: "FIXED", name: "常量" },
  ];
}
</script>

<style lang='less'>
.properFilterCondition {
  .add {
    margin-top: 8px;
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    margin-right: 24px;
    span {
      margin-right: 8px;
    }
  }
  .data-filter {
    width: 85px;
    margin-left: 5px;
  }
  .data-select {
    width: 220px !important;
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
}
</style>
