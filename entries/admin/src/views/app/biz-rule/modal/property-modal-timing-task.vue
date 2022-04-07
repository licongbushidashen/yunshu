<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt">{{ inputValue }}</span>
      <a-icon type="ellipsis" />
    </div>
    <a-modal
      wrapClassName="property-timing-task"
      width="810px"
      :visible="visible"
      @ok="handleOk"
      @cancel="modalHide"
      okText="保存"
      cancelText="取消"
    >
      <template slot="title">
        <div>定时设置</div>
      </template>
      <div class="content">
        <a-row>
          <a-col :span="2">
            <span class="required">执行范围</span>
          </a-col>
          <a-col :span="22" class="time-range margin-left">
            <a-range-picker
              v-model="dates"
              :placeholder="['开始时间', '结束时间']"
              style="width: 100%"
              @change="onTimeChange"
              format="YYYY-MM-DD"
            ></a-range-picker>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="2">
            <span>执行时间</span>
          </a-col>
          <a-col :span="22" class="margin-left">
            <a-radio-group
              name="radioGroup"
              v-model="formData.executionType"
              @change="getExecutionTime"
            >
              <a-radio value="NOW">立即执行</a-radio>
              <a-radio value="DELY">定时执行</a-radio>
            </a-radio-group>
          </a-col>
        </a-row>
        <a-row v-if="formData.executionType === 'DELY'">
          <a-col :span="2">
            <span style="position: relative; top: 6px"></span>
          </a-col>
          <a-col :span="22" class="time-range margin-left">
            <a-date-picker style="width: 100%" v-model="formData.executionTime" show-time />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="2">
            <span>执行方式</span>
          </a-col>
          <a-col :span="22" class="margin-left">
            <a-radio-group name="radioGroup" v-model="formData.executeType">
              <a-radio value="POLLING">轮询执行</a-radio>
              <a-radio value="CYCLE">按周期执行</a-radio>
            </a-radio-group>
          </a-col>
        </a-row>
        <a-row v-show="formData.executeType === 'POLLING'">
          <a-col :span="2">
            <span style="position: relative; top: 4px">轮询间隔</span>
          </a-col>
          <a-col :span="22" class="flex_col margin-left">
            <a-select show-search class="wd_80" v-model="formData.hour">
              <a-select-option v-for="item in 24" :key="item" :value="item - 1">{{ item - 1 }}</a-select-option>
            </a-select>
            <span class="margin_8">小时</span>
            <a-select show-search class="wd_80" v-model="formData.minute">
              <a-select-option v-for="item in 60" :key="item" :value="item - 1">{{ item - 1 }}</a-select-option>
            </a-select>
            <span class="margin_8">分</span>
            <a-select show-search class="wd_80" v-model="formData.second">
              <a-select-option v-for="item in 60" :key="item" :value="item - 1">{{ item - 1 }}</a-select-option>
            </a-select>
            <span class="margin_8">秒</span>
          </a-col>
        </a-row>
        <a-row v-show="formData.executeType === 'CYCLE'">
          <a-col :span="2">
            <span>执行周期</span>
          </a-col>
          <a-col :span="13" class="margin-left">
            <a-radio-group name="radioGroup" v-model="formData.cycleType" @change="cycleTypeChange">
              <a-radio
                v-for="(item, index) in cycleTypeList"
                :value="item.key"
                :key="index"
              >{{ item.name }}</a-radio>
            </a-radio-group>
          </a-col>
          <a-col :span="6" class="customize-radio">
            <a-input
              placeholder="请输入"
              v-model="formData.execCycle"
              @change="onInputChange"
              v-show="formData.cycleType === 'CUSTOM'"
            ></a-input>
            <a-select v-show="formData.cycleType === 'CUSTOM'" v-model="formData.exeCycleType">
              <a-select-option
                v-for="(item, index) in exeCycleTypeList"
                :value="item.key"
                :key="index"
              >{{ item.name }}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="2">
            <span>数据源</span>
          </a-col>
          <a-col :span="22" class="margin-left">
            <a-radio-group
              name="radioGroup"
              v-model="formData.dataSourceType"
              @change="dataSourceTypeChange"
            >
              <a-radio
                v-for="item in dataSourceTypeList"
                :key="item.key"
                :value="item.key"
              >{{ item.name }}</a-radio>
            </a-radio-group>
          </a-col>
        </a-row>
        <div class="line"></div>
        <div v-show="formData.dataSourceType === 'GET_LIST'">
          <div class="filters-title">筛选条件</div>
          <div class="filters">
            <a-row>
              <a-col :span="6">数据项</a-col>
              <a-col :span="5">对比函数</a-col>
              <a-col :span="6">值</a-col>
              <a-col :span="6">单位</a-col>
              <a-col :span="1"></a-col>
            </a-row>
            <a-row v-for="(row, filterIndex) in filtersList" :key="filterIndex">
              <a-col :span="6">
                <data-item-select
                  :onlyPublished="true"
                  class="wd_180"
                  v-model="row.dataItem"
                  :list="getDataItemList"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'sequenceNo',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [10, 9, 8, 6, 7, 1, 5] }"
                  :disabled="false"
                  @change="
                    (val) => {
                      onDataItemChange(row.dataItem, filterIndex);
                    }
                  "
                ></data-item-select>
              </a-col>

              <a-col :span="5">
                <a-select show-search class="wd_150" v-model="row.maturityFunctionType">
                  <a-select-option
                    v-for="(item, index) in getFilterConditionList(row)"
                    :key="index"
                    :value="item.key"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <staff-selector
                  v-model="row.value"
                  :options="staffSelectorOpts"
                  v-if="
                    getDataPropertyType(row.dataItem) ===
                    DataItemType.StaffSingle
                  "
                  class="wd_180"
                ></staff-selector>
                <!-- 逻辑 -->
                <div
                  v-else-if="
                    getDataPropertyType(row.dataItem) === DataItemType.Logic
                  "
                >
                  <a-select show-search class="wd_180" v-model="row.value">
                    <a-select-option :value="true">true</a-select-option>
                    <a-select-option :value="false">false</a-select-option>
                  </a-select>
                </div>

                <div v-else>
                  <a-input
                    v-if="
                      getDataPropertyType(row.dataItem) === DataItemType.Number
                    "
                    type="number"
                    class="wd_180"
                    v-model="row.value"
                  />
                  <a-input
                    v-else
                    class="wd_180"
                    @change="
                      (val) => {
                        onValueChange(val, row, row.dataItem);
                      }
                    "
                    v-model="row.value"
                  />
                </div>
              </a-col>
              <a-col :span="6">
                <a-select
                  class="wd_180"
                  v-model="row.unit.value"
                  v-if="getDataPropertyType(row.dataItem) === DataItemType.Date"
                >
                  <a-select-option
                    v-for="(item, index) in row.unit.list.filter(x => x.index <= 4)"
                    :key="index"
                    :value="item.key"
                  >{{ item.name }}</a-select-option>
                </a-select>
                <a-select
                  class="wd_180"
                  v-model="row.unit.value"
                  v-if="getDataPropertyType(row.dataItem) === DataItemType.Time"
                >
                  <a-select-option
                    v-for="(item, index) in row.unit.list.filter(x => x.index >= 4)"
                    :key="index"
                    :value="item.key"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="1">
                <span class="delete" @click="delRows(filterIndex)">
                  <i class="icon aufontAll h-icon-all-delete-o"></i>
                </span>
              </a-col>
            </a-row>
          </div>
          <div class="add" @click="addRows">
            <span>
              <i class="icon aufontAll h-icon-all-plus-o"></i>
            </span>
            <span>新增条件</span>
          </div>
        </div>
        <div v-show="formData.dataSourceType === 'BIZ_SERVICE'">
          <div class="filters-title">绑定业务服务方法</div>
          <div class="server-methods">
            <a-row>
              <a-col :span="24">
                <span class="biz-tips">请绑定返回数据类型为list的业务方法</span>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">基础属性</a-col>
            </a-row>
            <a-row class="base-type">
              <a-col :span="12">
                <span class="span">业务服务</span>
                <a-select showSearch v-model="serviceCode" @change="selectService">
                  <a-select-option
                    v-for="(item, i) in servicesList"
                    :key="i"
                    :value="item.code"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <span class="span">业务方法</span>
                <a-select show-search v-model="serviceMethodCode" @change="selectMethod">
                  <a-select-option
                    v-for="(item, i) in methodList"
                    :key="i"
                    :value="item.code"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">传入参数</a-col>
            </a-row>
            <a-row type="flex" class="header">
              <a-col class="col" :span="2">序号</a-col>
              <a-col class="col" :span="5">参数</a-col>
              <a-col class="col" :span="5">参数类型</a-col>
              <a-col class="col" :span="6">映射方式</a-col>
              <a-col class="col" :span="6">映射对象</a-col>
            </a-row>
            <a-row
              type="flex"
              v-for="(item, index) in inputMappings"
              :key="item.index + item.serviceMethodParameterCode"
            >
              <a-col class="col center" :span="2">{{ index + 1 }}</a-col>
              <a-col class="col" :span="5">
                <span
                  class="long-text"
                  :title="item.serviceMethodParameterCode"
                >{{ item.serviceMethodParameterCode }}</span>
              </a-col>
              <a-col class="col" :span="5">{{ item.propertyName }}</a-col>
              <a-col class="col" :span="6">
                {{
                getCodeType(item.codeType)
                }}
              </a-col>
              <a-col class="col select" :span="6">
                <a-input v-model="item.bizCode" />
              </a-col>
            </a-row>

            <a-row style="margin-top: 20px">
              <a-col :span="24">返回参数</a-col>
            </a-row>
            <a-row type="flex" class="header">
              <a-col class="col" :span="2">序号</a-col>
              <a-col class="col" :span="5">参数</a-col>
              <a-col class="col" :span="5">参数类型</a-col>
              <a-col class="col" :span="6">映射方式</a-col>
              <a-col class="col" :span="6">映射对象</a-col>
            </a-row>
            <a-row
              type="flex"
              v-for="(item, index) in outputMappings"
              :key="item.index + item.serviceMethodParameterCode"
            >
              <a-col class="col center" :span="2">{{ index + 1 }}</a-col>
              <a-col class="col" :span="5">
                <span
                  class="long-text"
                  :title="item.serviceMethodParameterCode"
                >{{ item.serviceMethodParameterCode }}</span>
              </a-col>
              <a-col class="col" :span="5">{{ item.propertyName }}</a-col>
              <a-col class="col" :span="6">
                <a-select
                  v-model="item.codeType"
                  @change="
                    (val) => {
                      return codeTypeChange(val, item);
                    }
                  "
                >
                  <a-select-option
                    v-for="(item, i) in codeTypes"
                    :key="i"
                    :value="item.value"
                    :title="item.label"
                  >{{ item.label }}</a-select-option>
                </a-select>
                <!-- <div style="width:100%">
                  {{ getCodeType(item.codeType) }}
                </div>-->
              </a-col>
              <a-col class="col select" :span="6">
                <data-item-select
                  :onlyPublished="true"
                  v-if="item.codeType === 1"
                  v-model="item.bizCode"
                  :list="getDataItemList"
                  :systemFilterCtl="{ code: ['ownerDeptQueryCode', 'sortKey'] }"
                  :bizFilterCtl="{ type: [6, 7] }"
                  :disabled="false"
                ></data-item-select>
                <!-- <a-input v-else v-model="item.bizCode" /> -->
                <div v-else style="width: 100%">
                  <a-select show-search v-model="item.bizCode" mode="combobox">
                    <a-select-option
                      v-for="(itemConst, i) in outputConstList"
                      :key="i"
                      :value="itemConst.value"
                      :title="itemConst.label"
                    >{{ itemConst.label }}</a-select-option>
                  </a-select>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Mixins } from "vue-property-decorator";

import { PropertyComponent } from "@h3/designer-core/property-panel";

import appsApi from "@/apis/apps"; // getDataItemList

import serviceApi from "@/apis/biz-service/service.api"; // listServices

import methodApi from "@/apis/biz-service/method.api"; // listMethodsByCode

import common from "@cloudpivot/common";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

import DataItemSelect from "../../data-rule/data-item-select.vue";

import { DataItemType } from "@cloudpivot/form/schema";

import moment from "moment";

const { getDataItemText } = common.utils.BusinessFunctions;

import { DatePicker, Switch } from "@h3/antd-vue";
import { DateOptions } from "@cloudpivot/form/schema";

@Component({
  name: "propertyTimingTask",
  components: {
    ARangePicker: DatePicker.RangePicker,
    DataItemSelect,
    StaffSelector,
  },
})
export default class propertyTimingTask extends Mixins(PropertyComponent) {
  // 数据项列表
  @Prop() dataItems!: any;

  visible: boolean = false;

  filtersList: any[] = [];

  servicesList: BizService.Service.OptionItem[] = [];

  methodList: BizService.Method.Item[] = [];

  // 传入参数数据项列表（包含系统数据项）
  inputDataItemList: any[] = [];

  serviceCode: string = "";

  // 是否禁止操作业务方法
  disabledMethod: boolean = false;

  serviceMethodCode: string = "";

  inputMappings: BizMethod.CreateInputMapping[] = [];

  outputMappings: BizMethod.CreateOutputMapping[] = [];

  codeTypes: any[] = [
    {
      label: "Const",
      value: 0,
    },
    {
      label: "Property",
      value: 1,
    },
  ];

  dates: moment.Moment[] = [];

  startDate: string = "";

  endDate: string = "";

  formData: any = {
    executeType: "POLLING", //执行方式
    dataSourceType: "GET_LIST", //数据源
    cycleType: "DAY", // 执行周期
    execCycle: "",
    executionType: "NOW",
    executionTime: moment().format("YYYY-MM-DD HH:mm:ss"),
    hour: 23,
    minute: 59,
    second: 59,
    exeCycleType: "DAY",
  };
  //执行周期列表
  cycleTypeList: Array<any> = [
    { name: "每天", index: 1, key: "DAY" },
    { name: "每周", index: 2, key: "WEEK" },
    { name: "每月", index: 3, key: "MONTH" },
    { name: "每年", index: 4, key: "YEAR" },
    { name: "自定义", index: 5, key: "CUSTOM" },
  ];

  exeCycleTypeList: Array<any> = [
    { name: "天", index: 1, key: "DAY" },
    { name: "周", index: 2, key: "WEEK" },
    { name: "月", index: 3, key: "MONTH" },
    { name: "年", index: 4, key: "YEAR" },
  ];

  //数据源列表
  dataSourceTypeList: Array<any> = [
    { name: "getList", key: "GET_LIST" },
    { name: "业务服务", key: "BIZ_SERVICE" },
  ];

  //对比函数
  maturityFunctionList: any = [
    { key: "BEFORE", name: "到期之前", index: 1 },
    { key: "AFTER", name: "到期之后", index: 2 },
    { key: "EQ", name: "等于", index: 3 },
    { key: "NEQ", name: "不等于", index: 4 },
    { key: "CT", name: "包含", index: 5 },
    { key: "NCT", name: "不包含", index: 6 },
    { key: "GT", name: "大于", index: 7 },
    { key: "LT", name: "小于", index: 8 },
    { key: "GTEQ", name: "大于等于", index: 9 },
    { key: "LTEQ", name: "小于等于", index: 10 },
  ];
  //日期单位
  dataUnit: any = [
    { name: "秒", index: "6", key: "SECOND" },
    { name: "分", index: "5", key: "MINITE" },
    { name: "时", index: "4", key: "HOUR" },
    { name: "天", index: "3", key: "DAY" },
    { name: "周", index: "2", key: "WEEK" },
    { name: "月", index: "1", key: "MONTH" },
  ];

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  };

  DataItemType: any = DataItemType;

  inputValue: string = "未设置";

  outputConstList: any[] = [
    {
      label: "total",
      value: "total",
      title: "记录总数",
    },
    {
      label: "list",
      value: "list",
      title: "当前页记录列表",
    },
  ];

  created() {
    // 
    if (this.value) {
      this.inputValue = "已设置";
    }
  }

  async initData() {
    let val: any = this.value;
    this.getDefaultData();
    //数据回写
    let value: any = val ? JSON.parse(val) : "";
    if (value && value.startDate) {
      this.filtersList = [];
      this.inputValue = "已设置";
      this.startDate = value.startDate;
      this.endDate = value.endDate;
      this.dates = [moment(this.startDate), moment(this.endDate)];
      this.formData.executeType = value.executeType;
      if (value.executionTime) {
        this.formData.executionTime = moment(value.executionTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        this.formData.executionType = "DELY";
      }
      this.formData.hour = value.hour;
      this.formData.minute = value.minute;
      this.formData.second = value.second;
      if (Number(value.execCycle) > 1) {
        this.formData.cycleType = "CUSTOM";
        this.formData.execCycle = value.execCycle;
      } else {
        this.formData.cycleType = value.cycleType;
      }
      this.formData.dataSourceType = value.dataSourceType;
      if (value.dataSourceType === "GET_LIST") {
        value.schedulerFilterConditions.forEach((s) => {
          let source: any = this.dataItems.find(
            (d: any) => d.code === s.dataItem
          );
          if (!source) {
            return;
          }
          this.filtersList.push({
            dataItem: s.dataItem, //数据项
            maturityFunctionType: s.maturityFunctionType, //对比函数
            unit: {
              value: s.unit,
              list: this.dataUnit,
            }, //单位
            value: s.value, //值
          });
        });
        this.filtersList.length === 0 && this.getDefaultData();
      } else {
        this.serviceCode = value.methodMapping.serviceCode;
        this.serviceMethodCode = value.methodMapping.serviceMethodCode;
        this.getServicesList();
        const res: any = await this.isHasAuthority();

        if (res.data) {
          this.isSelectableService(value.methodMapping.serviceName);
          this.isServiceMethodDisabled();
        } else {
          this.serviceCode = "";
          this.serviceMethodCode = "";
          return;
        }
        this.getMethodList(this.serviceCode, value, this.serviceMethodCode);
      }
    }
  }

  /**
   * 判断已选业务服务是否存在
   */
  async isHasAuthority() {
    const res: any = await appsApi.getCode({ serviceCode: this.serviceCode });

    if (res.errcode !== 0) {
      return this.$message.error(res.errmsg);
    }

    return res;
  }

  /**
   * 判断是否要添加没有权限的业务服务到列表
   */
  isSelectableService(name: string) {
    const isPermission: boolean = this.servicesList.some(
      (item) => item.code === this.serviceCode
    );

    if (!isPermission) {
      this.servicesList.unshift({
        code: this.serviceCode,
        id: this.serviceCode,
        modifiedTime: "",
        name: name,
        disabled: true,
      });
    }
  }

  /**
   * 是否允许操作业务方法
   */
  isServiceMethodDisabled() {
    const curService: any = this.servicesList.filter(
      (item) => item.code === this.serviceCode
    );

    if (curService && curService[0] && curService[0].disabled) {
      this.disabledMethod = true;
    } else {
      this.disabledMethod = false;
    }
  }

  getDefaultData() {
    this.filtersList = [
      {
        dataItem: "", //数据项
        maturityFunctionType: "", //对比函数
        unit: {
          value: null,
          list: this.dataUnit,
        }, //单位
        value: "", //值
      },
    ];
  }

  onTimeChange(dates: moment.Moment[], dateStrings: string[]) {
    this.startDate = dateStrings[0];
    this.endDate = dateStrings[1];
  }

  getExecutionTime() {
    if (this.formData.executionType === "DELY") {
      this.formData.executionTime = moment().format("YYYY-MM-DD HH:mm:ss");
    }
  }

  // 保存
  handleOk(): void {
    if (!this.startDate) {
      this.$message.error("执行范围未填写");
      return;
    }
    if (this.formData.executionType === "DELY") {
      if (!this.formData.executionTime) {
        this.$message.error("请选择执行时间");
        return;
      }
    }
    if (
      this.formData.executeType === "CYCLE" &&
      this.formData.cycleType === "CUSTOM" &&
      !this.formData.execCycle
    ) {
      this.$message.error("执行间隔未设置");
      return;
    }
    if (this.formData.dataSourceType === "BIZ_SERVICE" && !this.serviceCode) {
      this.modalHide();
      return;
    }

    if (this.serviceCode && !this.serviceMethodCode) {
      this.$message.error("业务方法未选择");
      return;
    }
    let switchBtn: boolean = false; // 校验是否填写完整；
    let dataBtn: boolean = false; //校验日期数据项的值是否符合规定；
    if (this.formData.dataSourceType === "GET_LIST") {
      this.filtersList.forEach((f) => {
        const source: any = this.dataItems.find(
          (item: any) => f.dataItem === item.code
        );
        // if (!f.dataItem || !f.maturityFunctionType || f.value === "") {
          // switchBtn = true;  // 经与秦畅确认筛选条件为空为空可以保存
        // }

        // 添加判断：筛选条件部分有数据，筛选田间不成立
        let valArr = [f.dataItem, f.maturityFunctionType, f.value]
        valArr = valArr.filter(el=> el)
        if(valArr.length === 1 || valArr.length === 2){
          switchBtn = true;
        }

        if (
          source &&
          source.propertyType === DataItemType.Number &&
          f.unit.value === "HOUR"
        ) {
          if (Number(f.value) < 0 || Number(f.value) > 24) {
            dataBtn = true;
          }
        }
      });

      if (switchBtn) {
        this.$message.error("筛选条件不成立");
        return;
      }

      if (dataBtn) {
        this.$message.error("仅支持设置日期数据项到期之前/到期之后的0~24小时");
        return;
      }
    }
    if (this.formData.dataSourceType === "BIZ_SERVICE") {
      const dataSourse: any = this.inputMappings.find((i) => {
        return i.bizCode === "";
      });
      if (dataSourse) {
        this.$message.error("映射对象未填写完整");
        return;
      }
      const outputDataSourse: any = this.outputMappings.find((i) => {
        return i.bizCode === "";
      });
      if (outputDataSourse) {
        this.$message.error("映射对象未填写完整");
        return;
      }
    }
    this.emitChange(JSON.stringify(this.buildData()));
    this.inputValue = "已设置";
    this.modalHide();
  }

  buildData() {
    let obj = {
      startDate: this.startDate,
      endDate: this.endDate,
      executeType: this.formData.executeType,
      hour: this.formData.hour,
      minute: this.formData.minute,
      second: this.formData.second,
      cycleType: this.formData.cycleType,
      dataSourceType: this.formData.dataSourceType,
    };
    if (this.formData.executionType === "DELY") {
      //@ts-ignore
      obj.executionTime = moment(this.formData.executionTime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }
    if (this.formData.cycleType === "CUSTOM") {
      obj.cycleType = this.formData.exeCycleType;
      obj["execCycle"] = this.formData.execCycle;
    } else {
      obj["execCycle"] = "1";
    }
    let item: any = [];
    if (this.formData.dataSourceType === "GET_LIST") {
      this.filtersList.forEach((f) => {
        item.push({
          dataItem: f.dataItem,
          maturityFunctionType: f.maturityFunctionType,
          value: f.value,
          unit: f.unit.value,
        });
      });
      obj["schedulerFilterConditions"] = item;
    } else {
      let serviceData: any = this.servicesList.find((s) => {
        return s.code === this.serviceCode;
      });
      let serviceMethodData: any = this.methodList.find((s) => {
        return s.code === this.serviceMethodCode;
      });
      let bizObj: any = {
        schemaCode: this.$route.params.bizSchemaCode,
        serviceCode: this.serviceCode,
        serviceName: serviceData.name,
        serviceMethodCode: this.serviceMethodCode,
        serviceMethodName: serviceMethodData.name,
        methodCode: "",
        inputMappings: this.inputMappings,
        outputMappings: this.outputMappings,
      };
      obj["methodMapping"] = bizObj;
    }

    return obj;
  }

  modalShow(): void {
    this.initData();
    this.visible = true;
  }
  modalHide(): void {
    this.visible = false;
  }
  // 添加行
  addRows() {
    const item: any = {
      dataItem: "", //数据项
      maturityFunctionType: "", //对比函数
      unit: {
        value: null,
        list: this.dataUnit,
      }, //单位
      value: "", //值
    };
    this.filtersList.push(item);
  }

  delRows(index) {
    this.filtersList.splice(index, 1);
  }

  get getDataItemList() {
    return this.dataItems.filter((d: any) => !d.defaultProperty);
  }

  onDataItemChange(code: any, index: number) {
    const currentItem: any = this.dataItems.find((item: any) => {
      return code === item.code;
    });
    this.filtersList[index].maturityFunctionType = "";
    this.filtersList[index].unit.value = "";
    this.filtersList[index].value = "";
    this.filtersList[index].unit.value = null;
  }
  //通过数据项过滤当前数据
  getFilterConditionList(row: any) {
    const source: any = this.dataItems.find(
      (item: any) => row.dataItem === item.code
    );
    if (!source) {
      return this.maturityFunctionList;
    }
    switch (source.propertyType) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        return this.maturityFunctionList.filter((m) => {
          return m.index > 2 && m.index < 7;
        });
        break;
      case DataItemType.Number:
        return this.maturityFunctionList.filter((m) => {
          return (m.index > 2 && m.index < 5) || (m.index > 6 && m.index < 11);
        });
        break;
      case DataItemType.Date:
      case DataItemType.Time:
        if (!row.unit.value) {
          row.unit.value = "HOUR";
        }
        return this.maturityFunctionList.filter((m) => {
          return m.index > 0 && m.index < 3;
        });
        break;
      case DataItemType.Logic:
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return this.maturityFunctionList.filter((m) => {
          return m.index === 3;
        });
        break;
    }
  }

  cycleTypeChange() {
    this.formData.execCycle = "";
  }

  //执行范围改变
  onInputChange(e) {
    const { value } = e.target;
    const reg = /^[0-9][0-9]*?$/;
    if ((!isNaN(value) && reg.test(value)) || value === "") {
      this.formData.execCycle = value;
    } else {
      this.formData.execCycle = "";
    }
  }

  getDataPropertyType(code: string) {
    const dataSource = this.dataItems.find((d) => {
      return d.code === code;
    });
    if (!dataSource) {
      return "";
    }
    return dataSource.propertyType;
  }

  onValueChange(e: any, row: any, code: string) {
    const value = row.value;
    const dataSource = this.dataItems.find((d) => {
      return d.code === code;
    });
    if (dataSource.propertyType === 3) {
      const reg = /^(\d|[1-9]\d*)$/;
      if (!(!isNaN(value) && reg.test(value))) {
        row.value = "";
        this.$message.error("请输入大于等于0的数字");
      }
    }
  }

  dataSourceTypeChange(val: any) {
    if (val.target.value === "BIZ_SERVICE") {
      this.getServicesList();
    } else {
      this.getDefaultData();
    }
  }

  getServicesList() {
    serviceApi.listServices().then((res: any) => {
      if (Array.isArray(res.data)) {
        this.servicesList = res.data;
      }
    });
  }

  /**
   * 获取服务下的业务方法列表
   */
  getMethodList(serviceCode: string, data?: any, code?: string) {
    return methodApi.listMethodsByCode({ serviceCode }).then((res: any) => {
      if (Array.isArray(res.data)) {
        this.methodList = res.data;
        if (data) {
          this.selectMethod(code, data);
        }
      }
    });
  }

  /**
   * 选中业务方法
   */
  selectMethod(value: any, data?: any) {
    this.serviceMethodCode = value;
    const method: any = this.methodList.find(
      (item: any) => item.code === value
    );
    if (method) {
      this.inputMappings = this.initialMappins(method.inputParametersJson, 0);
      this.outputMappings = this.initialMappins(method.outputParametersJson, 0);
      if (data) {
        this.inputMappings.forEach((input: any) => {
          let inputSource: any = data.methodMapping.inputMappings.find(
            (d: any) =>
              d.serviceMethodParameterCode === input.serviceMethodParameterCode
          );
          if (inputSource) {
            input.codeType = this.transforType(inputSource.codeType);
            this.getBizValue({ source: inputSource, data: input });
          }
        });

        this.outputMappings.forEach((output: any) => {
          let outputSource: any = data.methodMapping.outputMappings.find(
            (d: any) =>
              d.serviceMethodParameterCode === output.serviceMethodParameterCode
          );
          if (outputSource) {
            output.codeType = this.transforType(outputSource.codeType);
            this.getBizValue({ source: outputSource, data: output });
          }
        });
      }
    }
  }

  transforType(type: any) {
    if (typeof type !== "number") {
      switch (type) {
        case "CONST":
          return 0;
        case "PROPERTY":
          return 1;
      }
    } else {
      return type;
    }
  }

  getBizValue(params: any) {
    //当为Property时
    if (params.source.codeType === 1) {
      let source: any = this.dataItems.find(
        (d: any) => d.code === params.source.bizCode
      );
      if (!source) {
        params.data.bizCode = "";
        return;
      }
    }
    params.data.bizCode = params.source.bizCode;
  }

  /**
   * 初始化传入参数列表
   */
  initialMappins(mappingString: string, type: number) {
    const mappings: any = JSON.parse(mappingString);
    if (mappings && mappings.length) {
      const mappingList: Array<any> = mappings.map(
        (item: BizService.Method.InputParam, index: number) => ({
          index: index + 1,
          bizCode: "",
          codeType: type,
          serviceMethodParameterCode: item.code,
          propertyName: getDataItemText(item.bizPropertyType),
        })
      );
      return mappingList;
    }
    return [];
  }

  //转换映射方式
  getCodeType(val) {
    let value: string = "";
    this.codeTypes.forEach((c) => {
      if (c.value === val) {
        value = c.label;
      }
    });
    return value;
  }

  codeTypeChange(val: any, item: any) {
    item.bizCode = "";
  }

  // 改变业务服务
  selectService(value: any) {
    this.getMethodList(value);
    this.serviceCode = value;
    this.serviceMethodCode = "";
    this.inputMappings = [];
    this.outputMappings = [];
  }
}
</script>

<style lang='less'>
.property-timing-task {
  .content > .ant-row {
    margin-bottom: 25px;
  }
  .data-select {
    width: 180px !important;
  }
  .ant-modal-body {
    max-height: 500px;
    overflow-y: auto;
  }
  .time-range {
    width: 297px;
  }
  .required {
    position: relative;
    top: 6px;
  }
  .required:before {
    content: "*";
    color: #f5222d;
    position: absolute;
    left: -6px;
  }
  .customize-radio {
    position: relative;
    .ant-input {
      width: 80px;
      position: absolute;
      top: -6px;
      left: -38px;
    }
    .ant-select {
      width: 80px;
      position: absolute;
      top: -6px;
      left: 48px;
    }
  }
  .biz-tips {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  .add {
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    span {
      margin-right: 8px;
    }
  }
  .flex_col {
    display: flex;
    align-items: center;
  }
  .line {
    height: 1px;
    width: 100%;
    background: rgba(232, 232, 232, 1);
  }
  .filters {
    margin-top: 12px;
    padding-left: 8px;
    /deep/.ant-row {
      margin-bottom: 6px;
    }
    /deep/.ant-row > div {
      font-size: 12px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.65);
      line-height: 20px;
    }
  }
  .server-methods {
    /deep/.ant-row > div {
      font-size: 12px;
      font-weight: 500;
      color: rgba(0, 0, 0, 1);
      line-height: 20px;
    }
  }
  .filters-title {
    margin-top: 16px;
    margin-bottom: 12px;
    font-weight: 500;
    color: rgba(0, 0, 0, 1);
  }
  .margin-left {
    padding-left: 10px;
  }
  .margin_8 {
    margin: 0 8px;
  }
  .wd_80 {
    width: 80px;
  }
  .wd_150 {
    width: 150px;
  }
  .wd_180 {
    width: 180px;
  }

  .base-type {
    padding: 8px 0 20px 0;
    .ant-col-12:last-of-type {
      position: relative;
      left: 10px;
    }
    .span {
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
    }
    .ant-select {
      margin-left: 16px;
      width: 297px;
    }
  }
  .ant-row-flex {
    border-bottom: 1px solid #e9e9e9;
    .col {
      height: 38px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
    }
  }

  .header > .col {
    font-weight: 500;
    background: #fafafa;

    &:not(:last-child)::after {
      content: "";
      width: 1px;
      height: 22px;
      background-color: #e8e8e8;
      position: absolute;
      right: 0;
    }
  }

  .col {
    padding: 3px 16px;
    display: flex;
    align-items: center;
    .ant-select {
      width: 100%;
    }
  }
  .center {
    justify-content: center;
  }
  .input,
  .select {
    padding: 3px 4px;
  }
  .select-title {
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px !important;
  }
}
.long-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
