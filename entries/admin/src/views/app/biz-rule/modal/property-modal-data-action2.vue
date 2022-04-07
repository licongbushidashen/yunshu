<!--
 * @Author: zhuqiu name
 * @Date: 2020-04-02 21:07:21
 * @LastEditTime: 2020-05-27 14:58:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/entries/admin/src/views/app/biz-rule/modal/property-modal-data-action.vue
 -->
<template>
  <section>
    <a-modal
      wrapClassName="data-action-modal-content"
      v-model="visible"
      @ok="modalOk"
      @cancel="modalCancel"
      okText="保存"
      cancelText="取消"
      width="810px"
    >
      <template slot="title">
        <div>数据赋值</div>
      </template>
      <div class="content">
        <div
          v-if="showMainTable && actionType === 'createActions'"
          class="data-action-modal-content-sub-title_div mg-bt-10"
        >查找主表</div>
        <a-select
          class="mg-bt-10"
          style="width: 292px"
          defaultValue="1"
          v-model="ruleConditionJoinType"
          v-if="showMainTable && actionType === 'createActions'"
        >
          <a-select-option key="AND">满足所有条件的数据</a-select-option>
          <a-select-option key="OR">满足任一条件的数据</a-select-option>
        </a-select>
        <!-- 查询数据 配置 -->
        <div class="filters" v-if="showMainTable && actionType === 'createActions'">
          <a-row>
            <a-col :span="7" class="data-action-modal-content-fieldlab">目标模型数据字段</a-col>
            <a-col :span="5" class="data-action-modal-content-fieldlab">对比函数</a-col>
            <a-col :span="4" class="data-action-modal-content-fieldlab">值类型</a-col>
            <a-col :span="7" class="data-action-modal-content-fieldlab">当前模型数据字段/常量</a-col>
            <a-col :span="1"></a-col>
          </a-row>
          <a-row>
            <a-col :span="24">target:{{ filtersCondition[0].targetSchemaDataItem }}</a-col>
          </a-row>
          <a-row v-for="(row, index) of filtersCondition" :key="index" style="margin-top: 5px">
            <a-col :span="7">
              <!-- 目标模型 -->
              <data-item-select
                :onlyPublished="true"
                v-model="row.targetSchemaDataItem"
                :list="targetMainDataItems"
                :systemFilterCtl="{
                  code: [
                    'workflowInstanceId',
                    'modifier',
                    'ownerDeptQueryCode',
                    'sortKey',
                  ],
                }"
                :bizFilterCtl="{ type: [8, 7, 10] }"
                @change="
                  (val) => {
                    return targetChange(val, row);
                  }
                "
              ></data-item-select>
            </a-col>
            <a-col :span="5">
              <!-- 对比函数 -->
              <a-select
                style="width: 153px"
                class="data-filter"
                v-model="row.ruleConditionType"
                placeholder="请选择"
              >
                <a-select-option
                  v-for="(type, index) of getConditionTypeList(row)"
                  :value="type.code"
                  :key="index"
                >{{ type.name }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="4">
              <!-- 值类型 -->
              <a-select style="width: 120px" v-model="row.valueType" placeholder="请选择">
                <a-select-option
                  v-for="(typeVal, index) of getRuleValueTypeList(
                    row,
                    'filter'
                  )"
                  :key="index"
                  :value="typeVal.value"
                >{{ typeVal.label }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="7">
              <template v-if="row.valueType === 'FIXED'">
                <div class="item-box" style="width: 215px">
                  <!-- 文本类型 -->
                  <div
                    v-if="(getShowType(getPropertyType(row,'filter')) || getPropertyType(row,'assign') === 10) && row.ruleConditionType !== 'EP'"
                  >
                    <a-input style="width: 215px" v-model="row.value" placeholder="请输入"></a-input>
                  </div>
                  <!-- 日期 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.Date &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-date-picker
                      style="width: 215px"
                      v-model="row.value"
                      format="YYYY-MM-DD HH:mm:ss"
                      :showTime="{
                        defaultValue: moment(new Date(), 'HH:mm:ss'),
                      }"
                      placeholder="请选择时间"
                    />
                  </div>
                  <div
                    v-if="
                        getPropertyType(row, 'filter') === DataItemTypes.Time &&
                        row.ruleConditionType !== 'EP'
                      "
                  >
                    <a-time-picker
                      style="width:215px"
                      v-model="row.value"
                      placeholder="请选择时间"
                      format="HH:mm:ss"
                    />
                  </div>
                  <!-- 数值 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.Number &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-input
                      style="width: 215px"
                      type="number"
                      v-model="row.value"
                      placeholder="请输入"
                    ></a-input>
                  </div>
                  <!-- 逻辑 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.Logic &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-select
                      style="width: 215px"
                      v-model="row.value"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="true">true</a-select-option>
                      <a-select-option value="false">false</a-select-option>
                    </a-select>
                  </div>
                  <!-- 选人控件 -->
                  <div
                    style="background: white !important"
                    v-if="
                      getShowTypeStaff(getPropertyType(row,'filter')) &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <staff-selector v-model="row.value" :options="staffSelectorOpts"></staff-selector>
                  </div>
                  <!-- 审批意见 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.ApprovalOpinion &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-select
                      style="width: 215px"
                      v-model="row.value"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="PROCESSING">进行中</a-select-option>
                      <a-select-option value="COMPLETED">已完成</a-select-option>
                    </a-select>
                  </div>
                </div>
              </template>

              <template v-if="row.valueType === 'DYNAMIC'">
                <data-item-select
                  :onlyPublished="true"
                  v-model="row.currentSchemaDataItem"
                  :list="getCurrentDataItemList(row, 'filter')"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'modifier',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [8, 7] }"
                ></data-item-select>
              </template>
            </a-col>
            <a-col :span="1">
              <span class="delete" @click="delRows(index, 'filter')">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>
          <div class="data-action-modal-content-add-btn">
            <span>
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span @click="addFilterCondition">新增条件</span>
            </span>
          </div>
        </div>
        <!-- 新增数据 配置 -->
        <!-- <div class="data-action-modal-content-sub-title_div mg-bt-10">新增动作</div> -->
        <div class="filters">
          <a-row>
            <a-col :span="7" class="data-action-modal-content-fieldlab">目标模型数据字段</a-col>
            <a-col :span="5" class="data-action-modal-content-fieldlab">对比函数</a-col>
            <a-col :span="4" class="data-action-modal-content-fieldlab">值类型</a-col>
            <a-col :span="7" class="data-action-modal-content-fieldlab">当前模型数据字段/常量</a-col>
            <a-col :span="1"></a-col>
          </a-row>
          <a-row v-for="(row, index) of assignDataList" :key="index" style="margin-top: 5px">
            <a-col :span="7">
              <data-item-select
                :onlyPublished="true"
                v-model="row.targetSchemaDataItem"
                :list="targetModelDataItems"
                :systemFilterCtl="{
                  code: [
                    'workflowInstanceId',
                    'id',
                    'parentId',
                    'name',
                    'sequenceStatus',
                    'createdDeptId',
                    'ownerDeptId',
                    'createdTime',
                    'modifier',
                    'modifiedTime',
                    'sequenceNo',
                    'ownerDeptQueryCode',
                    'sortKey',
                  ],
                }"
                :bizFilterCtl="{ type: [8, 7] }"
                @change="
                  (val) => {
                    return targetChange(val, row);
                  }
                "
              ></data-item-select>
            </a-col>
            <a-col :span="5">
              <a-select style="width: 153px" v-model="row.ruleActionType" placeholder="请选择">
                <a-select-option
                  v-for="(typeVal, index) of getRuleActionTypeList(
                    row,
                    'assign'
                  )"
                  :key="index"
                  :value="typeVal.value"
                >{{ typeVal.label }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="4">
              <a-select style="width: 120px" v-model="row.valueType" placeholder="请选择">
                <a-select-option
                  v-for="(typeVal, index) of getRuleValueTypeList(
                    row,
                    'assign'
                  )"
                  :key="index"
                  :value="typeVal.value"
                >{{ typeVal.label }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="7">
              <!-- 固定值输入 -->
              <template v-if="row.valueType === 'FIXED'">
                <div class="item-box" style="width: 215px">
                  <!-- 文本 -->
                  <div
                    v-if="(getShowType(getPropertyType(row,'assign')) || getPropertyType(row,'assign') === 10)"
                  >
                    <a-input style="width: 215px" v-model="row.value" placeholder="请输入"></a-input>
                  </div>
                  <!-- 数值 -->
                  <div v-if="getPropertyType(row, 'assign') === DataItemTypes.Number">
                    <a-input
                      style="width: 215px"
                      type="number"
                      oninput="if(value.length > 32)value = value.slice(0, 32)"
                      v-model="row.value"
                      placeholder="请输入"
                    ></a-input>
                  </div>
                  <!-- 日期 需要校验 -->
                  <div v-if="getPropertyType(row, 'assign') === DataItemTypes.Date">
                    <a-date-picker
                      style="width: 215px"
                      v-model="row.value"
                      format="YYYY-MM-DD HH:mm:ss"
                      :showTime="{
                        defaultValue: moment(new Date(), 'HH:mm:ss'),
                      }"
                      placeholder="请选择时间"
                    />
                  </div>
                  <div v-if="getPropertyType(row, 'assign') === DataItemTypes.Time">
                    <a-time-picker
                      style="width:215px"
                      v-model="row.value"
                      placeholder="请选择时间"
                      format="HH:mm:ss"
                    />
                  </div>
                  <!-- 逻辑 -->
                  <div v-if="getPropertyType(row, 'assign') === DataItemTypes.Logic">
                    <a-select
                      style="width: 215px"
                      v-model="row.value"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="true">true</a-select-option>
                      <a-select-option value="false">false</a-select-option>
                    </a-select>
                  </div>
                  <!-- 选人控件 -->
                  <div
                    style="background: white !important"
                    v-if="getShowTypeStaff(getPropertyType(row,'assign'))"
                  >
                    <staff-selector v-model="row.value" :options="staffSelectorOpts"></staff-selector>
                  </div>
                  <!-- 审批意见 -->
                  <div v-if="getPropertyType(row, 'assign') === DataItemTypes.ApprovalOpinion">
                    <a-select
                      style="width: 215px"
                      v-model="row.value"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="PROCESSING">进行中</a-select-option>
                      <a-select-option value="COMPLETED">已完成</a-select-option>
                    </a-select>
                  </div>
                </div>
              </template>
              <!-- 数据项 选择 -->
              <template v-if="row.valueType === 'DYNAMIC'">
                <data-item-select
                  :onlyPublished="true"
                  v-model="row.currentSchemaDataItem"
                  :list="getCurrentDataItemList(row, 'ssign')"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [8, 7] }"
                ></data-item-select>
              </template>
            </a-col>
            <a-col :span="1">
              <span class="delete" @click="delRows(index, 'assign')">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>

          <div class="data-action-modal-content-add-btn">
            <span @click="addAssignDataField()">
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span>新增数据字段</span>
            </span>
          </div>
        </div>
      </div>
    </a-modal>
  </section>
</template>
<script lang='ts'>
import {
  Component,
  Vue,
  Mixins,
  Watch,
  Prop,
  Inject,
} from "vue-property-decorator";
import { PropertyComponent } from "@h3/designer-core/property-panel";
import * as forms from "h3-forms";
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
import bizrule from "../../../../store/modules/app/bizrule";
import moment from "moment";
const BizRule = new BizRuleDataCondition();
interface ITableCondition {
  /**目标模型数据项 */
  targetSchemaDataItem: string;
  /**对比函数 */
  ruleConditionType?: string;
  /**值类型 */
  valueType: any;
  value: any;
  /**当前模型数据项 */
  currentSchemaDataItem: string;

  /**组件自定义属性 */
  [propName: string]: any;
}
enum RuleActionType {
  // 等于
  Equals = "EQUALS",
  // 累加
  Increase = "INCREASE",
  // 累减
  Decrease = "DECREASE",
}

@Component({
  name: "AddDataAction",
  components: {
    StaffSelector,
    DataItemSelect,
  },
})
export default class AddDataAction extends Vue {
  //   @Inject()
  //   controller!: forms.FormGroup;
  // 当前模型 数据项
  @Prop() dataItems!: any;

  @Prop({ default: "createActions" }) actionType!: string;

  @Prop() value!: any;

  @Prop() schemaCode!: string;

  @Prop() targetOjectCode!: string;

  @Prop() triggerObjectCode!: string;
  // 规则查询条件满足类型
  ruleConditionJoinType: string = "AND";

  //查询条件 数组
  filtersCondition: ITableCondition[] = [];

  filterConditionCurrentDataItemList: any[] = [];

  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  };
  // modal 显示条件
  visible: boolean = true;

  canAdd = false;

  valueTypeList: any[] = [
    {
      label: "数据项",
      value: "DYNAMIC",
    },
    {
      label: "常量",
      value: "FIXED",
    },
  ];

  ruleActionTypeList = [
    {
      label: "等于",
      value: RuleActionType.Equals,
    },
    {
      label: "累加",
      value: RuleActionType.Increase,
    },
    {
      label: "累减",
      value: RuleActionType.Decrease,
    },
  ];

  moment: any = moment;

  created() {
    this.getDataItems(Object.keys(this.value).length > 0);
    this.modalShow();
    this.getDefaultFiltersConditionData();
    this.getDefaultAssignData();
    const _this = this;
    this.currentDataItem = this.filterConditionCurrentDataItemList = [
      ...this.dataItems,
    ];
    if (this.triggerObjectCode) {
      const len = this.triggerObjectCode.indexOf(".");
      if (len > 0) {
        const sheetCode = this.triggerObjectCode.slice(len + 1);
        const sheet = this.currentDataItem.find(
          (res) => res.code === sheetCode
        );
        if (sheet && sheet.subSchema && sheet.subSchema.properties) {
          const sheetDataItem = sheet.subSchema.properties.map((res) => {
            !res.code.includes(".") && (res.code = `${sheetCode}.${res.code}`);
            return res;
          });
          this.currentDataItem = [
            ...this.currentDataItem,
            ...sheetDataItem,
          ].filter(
            (res: any) =>
              res.code !== `${sheetCode}.${SystemDataItemCode.SortKey}`
          );
        }
      }
    }
  }

  getDefaultFiltersConditionData() {
    if (this.showMainTable && this.actionType === "createActions") {
      this.filtersCondition = [
        {
          targetSchemaDataItem: "",
          ruleConditionType: "EQ",
          valueType: "DYNAMIC",
          currentSchemaDataItem: "", // 数据项 当前数据项
          value: "", // 固定值数据
        },
      ];
    }
  }

  getDefaultAssignData() {
    this.assignDataList = [
      {
        targetSchemaDataItem: "",
        currentSchemaDataItem: "", // 数据项 当前数据项
        value: "", // 固定值数据
        valueType: "DYNAMIC",
        ruleActionType: RuleActionType.Equals,
      },
    ];
  }

  dataWrite() {
    // 数据回写
    if (this.value) {
      if (this.value.filterCondition) {
        this.filtersCondition = [];
        this.ruleConditionJoinType = this.value.filterCondition.ruleConditionJoinType;
        if (this.value.filterCondition.mainTableConditions) {
          const mainTableConditions = this.value.filterCondition
            .mainTableConditions;
          mainTableConditions.forEach((res) => {
            let targetSource: any = this.targetMainDataItems.find(
              (t: any) => t.code === res.targetSchemaDataItem
            );
            if (!targetSource) {
              return;
            }
            let currentSource: any = this.filterConditionCurrentDataItemList.find(
              (t: any) => t.code === res.currentSchemaDataItem
            );
            let currentSchemaDataItem: string = res.currentSchemaDataItem;
            if (!currentSource) {
              currentSchemaDataItem = "";
            }
            const newRow: any = {
              targetSchemaDataItem: res.targetSchemaDataItem,
              ruleConditionType: res.ruleConditionType,
              valueType: res.ruleValueType,
              currentSchemaDataItem, // 数据项 当前数据项
              value: res.value, // 固定值数据
            };
            this.filtersCondition.push(newRow);
          });
          this.filtersCondition.length === 0 &&
            this.getDefaultFiltersConditionData();
        }
      }
      if (this.value[this.actionType].length > 0) {
        this.assignDataList = [];
        const createActions = this.value[this.actionType];
        let currentDataItem = this.targetModelDataItems;
        createActions.forEach((res, index) => {
          let currentRowData = this.targetModelDataItems.find(
            (item: any) => item.code === res.targetDataItem
          );
          if (!currentRowData) {
            return;
          }
          let source: any = currentDataItem.find(
            (c: any) => c.code === res.currentDataItemValue
          );
          let currentSchemaDataItem: string = res.currentDataItemValue;
          // if (!source) {
          //   currentSchemaDataItem = "";
          // }
          const row: any = {
            targetSchemaDataItem: res.targetDataItem,
            currentSchemaDataItem, // 数据项 当前数据项
            value:
              res.ruleValueType === "FIXED" &&
              currentRowData.propertyType === DataItemType.Date
                ? moment(res.value)
                : res.ruleValueType === "FIXED" &&
                  currentRowData.propertyType === DataItemType.Time
                ? moment(res.value, "HH:mm:ss")
                : res.value, // 固定值数据
            valueType: res.ruleValueType,
            ruleActionType: res.ruleActionType
              ? res.ruleActionType
              : RuleActionType.Equals,
          };
          this.assignDataList.push(row);
        });
        this.assignDataList.length === 0 && this.getDefaultAssignData();
      }
    }
  }

  modalShow() {
    let schemaCode = this.schemaCode;
    if (!schemaCode) {
      return false;
    }
    const len = schemaCode.indexOf(".");
    if (len > 0) {
      this.showMainTable = true;
    } else {
      this.showMainTable = false;
    }
  }

  modalCancel() {
    this.$emit("close");
  }

  modalOk() {
    //查找主表参数判断
    let filterBtn: boolean = false;
    this.filtersCondition.forEach((f: any) => {
      if (
        f.valueType === "DYNAMIC" &&
        (!f.targetSchemaDataItem || !f.currentSchemaDataItem)
      ) {
        filterBtn = true;
      } else if (
        f.valueType === "FIXED" &&
        (!f.targetSchemaDataItem || !f.value)
      ) {
        filterBtn = true;
      } else if (!f.targetSchemaDataItem) {
        filterBtn = true;
      }
    });
    if (filterBtn) {
      this.$message.error("查找主表参数未设置完整");
      return;
    }
    const main = this.filtersCondition.map((res) => {
      const obj = {
        targetSchemaDataItem: res.targetSchemaDataItem,
        ruleConditionType: res.ruleConditionType,
        ruleValueType: res.valueType,
        value: res.value,
        currentSchemaDataItem: res.currentSchemaDataItem,
      };
      return obj;
    });
    //新增动作参数判断
    let assignBtn: boolean = false;
    let isBizConsistent = true;
    this.assignDataList.forEach((f: any) => {
      if (
        f.valueType === "DYNAMIC" &&
        (!f.targetSchemaDataItem || !f.currentSchemaDataItem)
      ) {
        assignBtn = true;
      } else if (
        f.valueType === "DYNAMIC" &&
        f.targetSchemaDataItem &&
        f.currentSchemaDataItem
      ) {
        let currentItem = this.currentDataItem.find(
          (item) => item.code === f.currentSchemaDataItem
        );
        let targetItem = this.targetModelDataItems.find(
          (item) => item.code === f.targetSchemaDataItem
        );
        if (
          currentItem &&
          targetItem &&
          currentItem.propertyType === DataItemType.RelevanceFormEx &&
          targetItem.propertyType === DataItemType.RelevanceFormEx
        ) {
          if (
            currentItem.relativeCode !== targetItem.relativeCode &&
            currentItem.relativePropertyCode !== targetItem.relativePropertyCode
          ) {
            isBizConsistent = false;
          }
        }
      } else if (
        f.valueType === "FIXED" &&
        (!f.targetSchemaDataItem || !f.value)
      ) {
        assignBtn = true;
      } else if (!f.targetSchemaDataItem) {
        assignBtn = true;
      }
    });

    if (!isBizConsistent) {
      this.$message.error("关联表单多选所配置的业务模型不一致");
      return;
    }
    if (assignBtn) {
      this.$message.error("参数未设置完整");
      return;
    }

    if (this.showMainTable && this.actionType === "createActions") {
      if (
        this.filtersCondition.length > 0 &&
        this.assignDataList.length === 0
      ) {
        this.$message.error("新增动作参数未设置");
        return;
      }
      if (
        this.filtersCondition.length === 0 &&
        this.assignDataList.length > 0
      ) {
        this.$message.error("查找主表参数未设置");
        return;
      }
    }

    const action = this.assignDataList.map((res) => {
      let value: string = "";
      let source = this.targetModelDataItems.find(
        (t: any) => res.targetSchemaDataItem === t.code
      );
      if (
        res.valueType === "FIXED" &&
        source.propertyType === DataItemType.Date
      ) {
        value = res.value.format("YYYY-MM-DD HH:mm:ss");
      } else if (
        res.valueType === "FIXED" &&
        source.propertyType === DataItemType.Time
      ) {
        value = res.value.format("HH:mm:ss");
      } else {
        value = res.value;
      }
      const obj = {
        targetDataItem: res.targetSchemaDataItem,
        ruleValueType: res.valueType,
        value: value,
        ruleActionType: res.ruleActionType,
        currentDataItemValue: res.currentSchemaDataItem,
        targetSchemaDataItemName: '',
        currentSchemaDataItemName: ''
      };
      if(res.targetSchemaDataItem){
        let current = this.targetMainDataItems.find(el => el.code === res.targetSchemaDataItem)
        if(current){
          obj.targetSchemaDataItemName = current.name
        }
      }
      if(res.currentSchemaDataItem){
        let current = this.filterConditionCurrentDataItemList.find(el => el.code === res.currentSchemaDataItem)
        if(!current){
          current = this.targetModelDataItems.find(el => el.code === res.currentSchemaDataItem)
        }
        if(current){
          obj.currentSchemaDataItemName = current.name
        }
      }


      return obj;
    });

    const obj = {
      filterCondition: {
        ruleConditionJoinType: this.ruleConditionJoinType,
        mainTableConditions: main,
      },
      [this.actionType]: action,
    };




    this.$emit("ok", obj);
    this.modalCancel();
  }
  // 动作数据项
  targetModelDataItems: any[] = [];

  // 过滤条件数据项 只能是主表
  targetMainDataItems: any[] = [];

  currentDataItem: any[] = [];

  assignDataList: any[] = [];
  
  DataItemTypes = DataItemType;

  getShowType(type){
    switch (type) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.LongText:
      case DataItemType.DropdownMulti:
        return true;
        break;
    }
    return false;
  }

  getShowTypeStaff(type){
    switch (type) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return true;
        break;
    }
    return false;
  }
  
  // 获取目标模型 数据项
  async getDataItems(isWrite?: boolean) {
    let targetOjectCode = this.targetOjectCode;
    let schemaCode = targetOjectCode;
    if (!schemaCode) {
      return;
    }
    const len = schemaCode.indexOf(".");
    if (len > 0) {
      schemaCode = schemaCode.slice(0, len);
    }
    // 获取数据字段
    const res = await appsApi.getDataItemList({ schemaCode: schemaCode });
    if (res && res.errcode === 0) {
      // 子表
      if (len > 0) {
        const sheetCode = targetOjectCode.slice(len + 1);
        const sheet = res.data.find((item) => item.code === sheetCode);
        if (sheet && sheet.subSchema) {
          this.targetModelDataItems = sheet.subSchema.properties.filter(
            (val) => {
              return val.propertyType !== DataItemType.StaffSingle;
            }
          );
        }
      } else {
        // 非子表
        //若是数据更新节点需过滤掉系统数据项
        this.targetModelDataItems = res.data.filter((val) => {
          return val.propertyType !== DataItemType.StaffSingle;
        });
        if (this.actionType === "dataActions") {
          this.targetModelDataItems = this.targetModelDataItems.filter(
            (t: any) => !t.defaultProperty
          );
        }
      }

      this.targetMainDataItems = res.data;
      this.canAdd = true;

      if (isWrite) {
        this.dataWrite();
      }
    }
  }
  showMainTable = false;
  // 新增条件
  async addFilterCondition() {
    if (!this.canAdd) {
      await this.getDataItems();
    }
    const newRow: any = {
      targetSchemaDataItem: "",
      ruleConditionType: "EQ",
      valueType: "DYNAMIC",
      currentSchemaDataItem: "", // 数据项 当前数据项
      value: "", // 固定值数据
    };
    this.filtersCondition.push(newRow);
    console.log(this.filtersCondition);
  }

  // 新增动作
  async addAssignDataField() {
    if (!this.canAdd) {
      await this.getDataItems();
    }
    !this.targetModelDataItems.length && this.getDataItems();

    const newRow: any = {
      targetSchemaDataItem: "",
      currentSchemaDataItem: "", // 数据项 当前数据项
      value: "", // 固定值数据
      valueType: "DYNAMIC",
      ruleActionType: RuleActionType.Equals,
    };
    this.assignDataList.push(newRow);
  }
  // 删除行
  delRows(index, type) {
    switch (type) {
      case "filter":
        this.filtersCondition.splice(index, 1);
        break;
      case "assign":
        this.assignDataList.splice(index, 1);
        break;
    }
  }
  //目标模型改变触发当前对象模型值清空
  targetChange(code: string, row: any) {
    row.currentSchemaDataItem = "";
    row.value = "";
    row.valueType = "DYNAMIC";
    row.ruleActionType = RuleActionType.Equals;
  }

  //获取数据项类型
  getPropertyType(row: any, type: string) {
    let data: any =
      type === "filter" ? this.targetMainDataItems : this.targetModelDataItems;
    const source: any = data.find(
      (item: any) => row.targetSchemaDataItem === item.code
    );
    if (!source) {
      return "";
    }
    return source.propertyType;
  }
  // 设置符合目标模式数据项的 值类型
  getRuleValueTypeList(row: any, type: string) {
    let data: any =
      type === "filter" ? this.targetMainDataItems : this.targetModelDataItems;
    const source: any = data.find(
      (item: any) => row.targetSchemaDataItem === item.code
    );
    let arrData: Array<any> = this.valueTypeList;
    if (!source) {
      return arrData;
    }
    switch (source.propertyType) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
      case DataItemType.RelevanceForm:
        if (
          source.code === SystemDataItemCode.Creater ||
          source.code === SystemDataItemCode.Owner
        ) {
          arrData = this.valueTypeList.filter((val) => val.value === "DYNAMIC");
        } else {
          arrData = this.valueTypeList.filter((val) => val.value === "DYNAMIC");
        }
        break;
      case DataItemType.RelevanceFormEx:
        arrData = this.valueTypeList.filter((val) => val.value === "DYNAMIC");
        break;
      case DataItemType.Logic:
        arrData = this.valueTypeList.filter(
          (val) => val.value === "DYNAMIC" || val.value === "FIXED"
        );
        break;
      case DataItemType.Address:
      case DataItemType.Attachment:
        arrData = this.valueTypeList.filter((val) => val.value === "DYNAMIC");
        break;
    }
    //当位系统字段时需过滤为空的选项
    if (source.defaultProperty) {
      arrData = this.valueTypeList.filter((val) => val.value === "DYNAMIC");
    }
    return arrData;
  }
  //设置符合查找主表目标模型数据项的对比函数
  getConditionTypeList(row) {
    const source: any = this.targetMainDataItems.find(
      (item: any) => row.targetSchemaDataItem === item.code
    );
    let dataCondition: any = new BizRuleDataCondition();
    if (!source) {
      return dataCondition.conditionType.arry;
    }
    if (source.propertyType === DataItemType.Number) {
      return dataCondition.conditionType.arry.filter(
        (a: any) => a.id > 0 && a.id < 7
      );
    } else {
      return dataCondition.conditionType.arry.filter((a: any) => a.id === 1);
    }
  }
  //设置符合新增数据目标模型数据项的对比函数
  getRuleActionTypeList(row: any) {
    const source: any = this.targetModelDataItems.find(
      (item: any) => row.targetSchemaDataItem === item.code
    );
    if (!source) {
      return this.ruleActionTypeList;
    }
    switch (source.propertyType) {
      case DataItemType.Number:
        if (this.actionType === "createActions") {
          return this.ruleActionTypeList.filter(
            (val) => val.value === RuleActionType.Equals
          );
        } else {
          return this.ruleActionTypeList;
        }
        break;
      default:
        return this.ruleActionTypeList.filter(
          (val) => val.value === RuleActionType.Equals
        );
        break;
    }
  }

  //设置符合目标模型数据类型的 当前模式下数据项
  getCurrentDataItemList(row: any, type: string) {
    let data: any =
      type === "filter" ? this.targetMainDataItems : this.targetModelDataItems;
    let sourceData: any =
      type === "filter"
        ? this.filterConditionCurrentDataItemList
        : this.targetModelDataItems;
    sourceData = sourceData.filter(
      (item) => row.targetSchemaDataItem !== item.code
    );
    sourceData = [
      ...sourceData,
      ...this.targetMainDataItems.filter((item) => item.defaultProperty),
    ];
    const source: any = data.find(
      (item: any) => row.targetSchemaDataItem === item.code
    );
    if (!source) {
      return [];
    }
    switch (source.propertyType) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        return sourceData.filter((val) => {
          return row.currentSchemaDataItem === val.code || ([DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(source.propertyType) ? [DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(val.propertyType) : [DataItemType.Checkbox, DataItemType.DropdownMulti ].includes(val.propertyType));
        });
        break;
      case DataItemType.LongText:
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
      case DataItemType.Logic:
      case DataItemType.Address:
      case DataItemType.Attachment:
      case DataItemType.StaffDeptMix:
        return sourceData.filter((val) => {
          return row.currentSchemaDataItem === val.code || val.propertyType === source.propertyType;
        });
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return sourceData.filter((val) => {
          return val.propertyType === source.propertyType || val.propertyType === DataItemType.StaffDeptMix;
        });
        break;
      case DataItemType.RelevanceForm:
      case DataItemType.RelevanceFormEx:
        let idArr: Array<any> = [];
        let trigger: string = this.triggerObjectCode;
        if (this.triggerObjectCode.includes(".")) {
          trigger = this.triggerObjectCode.split(".")[0];
          if (source.relativeCode === trigger) {
            idArr = sourceData.filter((v) => {
              return (
                v.code === SystemDataItemCode.Id ||
                v.code.split(".")[v.code.split(".").length - 1] ===
                  SystemDataItemCode.ParentId
              );
            });
          }
        } else {
          if (source.relativeCode === trigger) {
            idArr = sourceData.filter((v) => {
              return (
                v.code.split(".")[v.code.split(".").length - 1] ===
                SystemDataItemCode.Id
              );
            });
          }
        }

        return sourceData
          .filter((val) => {
            return (
              val.propertyType === source.propertyType &&
              source.relativeCode === val.relativeCode
            );
          })
          .concat(idArr);
        break;
    }
  }
}
</script>
<style lang="less">
.data-action-modal-content {
  .ant-modal-body {
    max-height: 500px;
    overflow-y: auto;
  }
  .data-filter {
    width: 115px;
  }
  .data-item-selected {
    .data-select {
      width: 215px !important;
    }
  }
  .delete {
    top: 3px !important;
  }
  &-sub-title_div {
    width: 56px;
    height: 22px;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 22px;
  }
  &-add-btn {
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    span {
      margin-right: 8px;
    }
  }
  &-fieldlab {
    height: 20px;
    font-size: 12px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
    line-height: 20px;
  }
}
.mg-bt-10 {
  margin-bottom: 10px;
}
</style>
