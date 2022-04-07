<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt" :class="inputValue === '已设置' ? 'opacity' : ''">{{ inputValue }}</span>
    </div>
    <a-modal
      v-model="visible"
      @ok="modalOk"
      @cancel="modalHide"
      okText="保存"
      cancelText="取消"
      wrapClassName="properFilterCondition"
      width="640px"
    >
      <template slot="title">
        <div>
          <span>{{ title }}</span>
        </div>
      </template>
      <a-row :gutter="[20,20]">
        <a-col :span="4" style="line-height:20px;">条件类型</a-col>
        <a-col :span="20">
          <a-radio-group v-model="triggerType">
            <a-radio value="TRIGGER">触发</a-radio>
            <a-radio value="FILTER">过滤</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
      <a-row :gutter="[20,20]">
        <a-col :span="24">
          <a-button @click="addTrigger">
            <i class="icon aufontAll h-icon-all-plus-o" style="margin-right:8px;"></i>
            <span>新增</span>
          </a-button>
        </a-col>
      </a-row>
      <a-collapse class="filter-collapse" :bordered="false" v-model="activeKey">
        <a-collapse-panel
          :key="`${key}`"
          :header="`条件${key+1}`"
          v-for="(item, key) of triggerConditionList"
          :forceRender="true"
        >
          <template slot="extra">
            <i class="icon aufontAll h-icon-all-delete-o" @click.stop="delTrigger(key)"></i>
          </template>
          <div class="centent">
            <a-row :gutter="[20,20]">
              <a-col :span="4" style="line-height:32px;">条件关系</a-col>
              <a-col :span="20">
                <a-select show-search style="width: 100%;" v-model="item.conditionJoinType">
                  <a-select-option key="AND">满足所有条件的数据</a-select-option>
                  <a-select-option key="OR">满足任一条件的数据</a-select-option>
                </a-select>
              </a-col>
            </a-row>

            <!--主表条件-->
            <div class="filters">
              <a-row :gutter="[12,0]">
                <a-col :span="8" class="fieldlab">主流程子表数据项</a-col>
                <a-col :span="8" class="fieldlab">对比函数</a-col>
                <a-col :span="8" class="fieldlab">固定值</a-col>
              </a-row>
              <a-row
                :gutter="[12,18]"
                v-for="(row, index) in item.conditionItemList"
                :key="index"
                style="margin-top: -10px;"
              >
                <a-col class="filterw100" :span="8">
                  <a-select
                    class="data-filter"
                    v-model="row.currentDataItem"
                    :getPopupContainer="getPopupContainer"
                    @change="onHandleData1($event, index, key)"
                    placeholder="请选择"
                    show-search
                    :filter-option="filterOption"
                  >
                    <template v-for="(d, i) in row.targetFieldList">
                      <a-select-option
                        :key="i"
                        :value="d.code"
                        :disabled="d.deleted"
                        :title="d.name+'['+d.code+']'"
                        v-if="!d.defaultProperty"
                      >{{ `${d.name}[${d.code}]` }}</a-select-option>
                    </template>
                  </a-select>
                </a-col>

                <a-col class="filterw100" :span="8">
                  <a-select
                    class="data-filter"
                    v-model="row.conditionType"
                    :getPopupContainer="getPopupContainer"
                    @change="onHandleData2(index, key)"
                    placeholder="请选择"
                  >
                    <template v-for="(d, i) in row.conditionTypeList">
                      <a-select-option :key="i" :value="d.code">{{ `${d.name}` }}</a-select-option>
                    </template>
                  </a-select>
                </a-col>
                <a-col class="filterw100" :span="8">
                  <template
                    v-if="row.conditionType !== 'EP' && row.conditionType !== 'NEP' && row.propertyType != '6'"
                  >
                    <a-tooltip :visible="!!row.errorMsg">
                      <template slot="title">
                        <span>{{ row.errorMsg }}</span>
                      </template>
                      <div :class="!!row.errorMsg && 'has-error'" class="value">
                        <!-- 日期控件 -->
                        <a-date-picker
                          style="min-width:150px;"
                          v-if="row.propertyType === 3"
                          v-model="row.value"
                          :showTime="true"
                          :format="'YYYY-MM-DD HH:mm:ss'"
                          :valueFormat="'YYYY-MM-DD HH:mm:ss'"
                          @change="validate(row, $event)"
                          placeholder="请选择时间"
                        />
                        <!-- 逻辑控件 -->
                        <a-select
                          v-else-if="row.propertyType === 4"
                          v-model="row.value"
                          :getPopupContainer="getPopupContainer"
                          placeholder="请选择"
                        >
                          <a-select-option value="true">true</a-select-option>
                          <a-select-option value="false">false</a-select-option>
                        </a-select>
                        <!-- 选人控件 -->
                        <StaffSelector
                          v-else-if="row.propertyType === 5"
                          v-model="row.value"
                          :onlyForm="true"
                          :options="staffSelectorOpts"
                          @change="validate(row, $event)"
                        />
                        <div v-else-if="row.propertyType === 2">
                          <a-input
                            type="number"
                            v-model="row.value"
                            @change="validate(row, $event)"
                            placeholder="请输入"
                          ></a-input>
                        </div>
                        <!-- 输入框 -->
                        <a-input
                          v-else
                          v-model="row.value"
                          placeholder="请输入"
                          @change="validate(row, $event)"
                        ></a-input>
                      </div>
                    </a-tooltip>
                  </template>
                </a-col>
                <div
                  style="position: absolute;right: -15px;top: 50%;margin-top: -7px;cursor: pointer;"
                >
                  <span class="delete" @click="delRows(index, key)">
                    <i class="icon aufontAll h-icon-all-delete-o"></i>
                  </span>
                </div>
              </a-row>
              <div class="add">
                <span>
                  <i class="icon aufontAll h-icon-all-plus-o"></i>
                </span>
                <span @click="addRows(key)">新增条件</span>
              </div>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
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
} from 'vue-property-decorator';
import appsApi from '@/apis/apps';
import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { PropertyComponent } from '@h3/designer-core/property-panel';
import * as forms from 'h3-forms';
import { dateFormatter } from '@cloudpivot/form/src/renderer/utils/date-formatter';
import { DataItemType } from '@cloudpivot/form/schema';

import { State, Action, Mutation, namespace } from 'vuex-class';
const WorkflowModule = namespace('Apps/Workflow');

import {
  BizRuleDataCondition,
  Eexpr,
  Icondition,
} from '@/views/app/biz-rule/typings/filter-condition';

const BizRule = new BizRuleDataCondition();

interface ITableCondition {
  /**主流程模型数据项 */
  currentDataItem: string;
  /**对比函数 */
  conditionType: string;
  /**值  TODO 类型？ */
  value: any;
  /**组件自定义属性 */
  [propName: string]: any;
}

// 传给后台的数据格式
interface IargeFilterCondition {
  /**条件组合类型 */
  triggerType: string;
  /**条件 */
  triggerConditionList: Array<SmallFilterCondition>;
}

interface SmallFilterCondition {
  /**条件关系 */
  conditionJoinType: string;
  /**条件 */
  conditionItemList: Array<ITableCondition>;
}

@Component({
  name: 'FilterCondition',
  components: {
    StaffSelector,
  },
})
export default class FilterCondition extends Vue {
  @WorkflowModule.State('WorkflowDataItem_all') WorkflowDataItem_all: any;

  @WorkflowModule.State('workflowData') workflowData: any;

  @Prop() value!: any;

  @Prop() triggerMapping!: string;

  name: string = '';
  visible: boolean = false;
  subFlowTriggerFlag: boolean = false;
  triggerType: string = 'TRIGGER';
  inputValue: string = '未设置';
  title: string = '触发条件';
  activeKey: string[] = ['0'];
  triggerConditionList: SmallFilterCondition[] = [
    {
      conditionJoinType: 'AND',
      conditionItemList: [
        {
          /**主流程模型数据项 */
          currentDataItem: '',
          /**对比函数 */
          conditionType: '',
          /**值  TODO 类型？ */
          value: '',
          /**组件自定义属性 */
          targetFieldList: [],
          propertyType: undefined,
        },
      ],
    },
  ];
  // 数据条件对象
  // filtersList: ITableCondition[] = [];

  // 当前模型数据字段数据源
  targetFieldList: any = [];

  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  @Watch('value', {
    immediate: true,
  })
  watchValue(val) {
    if (!val) {
      return;
    }
    this.$emit('change', val);
    let count = 0;
    Array.isArray(val.triggerConditionList) &&
      val.triggerConditionList.length &&
      val.triggerConditionList.forEach((item2: any) => {
        item2.conditionItemList.length ? count++ : 0;
      });
    if (count) {
      this.inputValue = '已设置';
      this.subFlowTriggerFlag = true;
    } else {
      this.inputValue = '未设置';
      this.subFlowTriggerFlag = false;
      this.triggerType = 'TRIGGER';
    }
  }

  @Watch('triggerConditionList', {
    deep: true,
  })
  watchFiltersList(val) {
    this.triggerConditionList.forEach((item: any) => {
      if (item.conditionItemList.length) {
        this.subFlowTriggerFlag = true;
        let currentDataItem = item.conditionItemList.map(
          (item2) => item2.currentDataItem
        );
        item.conditionItemList.forEach((item2: any) => {
          item2.targetFieldList.length &&
            item2.targetFieldList.forEach((item3: any) => {
              if (currentDataItem.includes(item3.code)) {
                item3.deleted = true;
              } else {
                item3.deleted = false;
              }
            });
        });
      }
    });
  }

  async initModal() {
    // 编辑时候
    this.targetFieldList = this.WorkflowDataItem_all.filter(
      (val) =>
        val.propertyType === DataItemType.Sheet &&
        val.code === this.triggerMapping
    );

    const copyTargetFieldList = this.targetFieldList;
    const array: any[] = [];
    copyTargetFieldList.forEach((item: any) => {
      item.subSchema.properties.forEach((item2: any) => {
        array.push(item2);
      });
    });
    this.targetFieldList = array.filter(
      (val) =>
        val.propertyType !== DataItemType.RelevanceForm &&
        val.propertyType !== DataItemType.RelevanceFormEx &&
        val.propertyType !== DataItemType.Address &&
        !val.defaultProperty
    );

    this.triggerConditionList.forEach((item: any, i: number) => {
      item.conditionItemList[i].targetFieldList = this.targetFieldList;
      item.conditionJoinType = 'AND';
    });

    // 回填已设置的条件
    if (this.value) {
      this.triggerType = this.value.triggerType || 'TRIGGER';
      this.handleValue();
    }
  }

  // 回填已设置的条件
  handleValue(): void {
    if (
      this.value &&
      this.value.triggerConditionList &&
      this.value.triggerConditionList.length
    ) {
      console.log(this.value);
      const conditionItemList = this.value.triggerConditionList;
      this.triggerConditionList = conditionItemList;
      this.triggerConditionList.forEach((item: any, index: number) => {
        item.conditionItemList &&
          Array.isArray(item.conditionItemList) &&
          item.conditionItemList.forEach((val: any) => {
            val.targetFieldList = this.targetFieldList;
            val.conditionTypeList = BizRule.filterConditionOf3(
              val.propertyType
            );
            console.log(val.propertyType, val);
          });
      });
    }
  }

  // 添加行
  addRows(index: number): void {
    const flag = this.isFiltersList(index);
    if (!flag) {
      return;
    }
    const options: any = this.filterDataItem(index);
    if (Array.isArray(options) && options.length) {
      const newRow: ITableCondition = {
        currentDataItem: '',
        conditionType: '',
        conditionTypeList: '',
        value: '',
        propertyType: '',
        errorMsg: '',
        targetFieldList: this.targetFieldList,
      };
      this.triggerConditionList[index].conditionItemList.push(...[newRow]);
    } else {
      this.$message.warning('暂无可设置数据项');
    }
  }

  // 检查条件是否设置完整
  isFiltersList(i: number): boolean {
    const isList =
      this.triggerConditionList[i] &&
      Array.isArray(this.triggerConditionList[i].conditionItemList);
    if (!isList) {
      return true;
    }

    const flag = this.triggerConditionList[i].conditionItemList.every(
      (d: any) => {
        if (
          (d.propertyType && d.propertyType === 6) ||
          d.conditionType === 'EP' ||
          d.conditionType === 'NEP'
        ) {
          return d.currentDataItem && d.conditionType;
        } else {
          return d.currentDataItem && d.conditionType && d.value;
        }
      }
    );
    if (!flag) {
      this.$message.warning('请先完善当前数据设置');
      return false;
    }
    return true;
  }

  // 删除行
  delRows(index: number, key: number) {
    this.triggerConditionList[key].conditionItemList.splice(index, 1);
  }

  // 数据项去重
  filterDataItem(i: number) {
    if (!this.triggerConditionList[i].conditionItemList || !Array.isArray(this.triggerConditionList[i].conditionItemList) || this.triggerConditionList[i].conditionItemList.length === 0) {
      return [{}];
    }
    const selectedItem: Array<string> = [];
    this.triggerConditionList[i].conditionItemList.forEach((td: any) => {
      selectedItem.push(td.currentDataItem);
    });
    const list: any[] = this.targetFieldList.filter(
      (item: any) => !item.defaultProperty
    );
    const optionList = list.filter(
      (wd: any) => !selectedItem.includes(wd.code)
    );
    if (!optionList) {
      return;
    }
    return optionList;
  }

  modalShow() {
    this.visible = true;
    this.initModal();
  }

  // 关闭
  modalHide() {
    this.visible = false;
    this.activeKey = ['0'];
    this.resetList();
  }
  // 重置列表
  resetList() {
    this.triggerConditionList = [
      {
        conditionJoinType: 'AND',
        conditionItemList: [
          {
            /**主流程模型数据项 */
            currentDataItem: '',
            /**对比函数 */
            conditionType: '',
            /**值  TODO 类型？ */
            value: '',
            /**组件自定义属性 */
            targetFieldList: [],
            propertyType: undefined,
          },
        ],
      },
    ];
    this.targetFieldList = [];
  }
  // 确定
  modalOk() {
    let flag = 1;
    for (let i = 0; i < this.triggerConditionList.length; i++) {
      if (!this.isFiltersList(i)) {
        flag = 0;
        break;
      }
    }
    if (!flag) {
      return;
    }

    let value = {
      triggerType: this.triggerType || 'TRIGGER',
      subFlowTriggerFlag: this.subFlowTriggerFlag,
      triggerConditionList: JSON.parse(JSON.stringify(this.triggerConditionList)),
    };
    Object.getOwnPropertyNames(value.triggerConditionList).length === 0
      ? (value.triggerConditionList = [])
      : value.triggerConditionList;
    // 去掉多余的参数
    Object.keys(value.triggerConditionList).length &&
      value.triggerConditionList.forEach((item: any) => {
        item.conditionItemList &&
          Object.keys(item.conditionItemList).length &&
          item.conditionItemList.forEach((val: any) => {
            val.conditionTypeList = '';
            val.errorMsg = '';
          });
      });
    console.log(value);
    this.$emit('change', value);
    this.modalHide();
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  //数据项改变事件
  onHandleData1(id: any, index: number, key: number) {
    // 清空对比函数和子流程模型数据项
    this.triggerConditionList[key].conditionItemList[index].conditionType = '';
    this.triggerConditionList[key].conditionItemList[index].propertyType = '';
    this.onHandleData2(index, key);

    let item = this.targetFieldList.filter((v) => v.code === id)[0];
    this.triggerConditionList[key].conditionItemList[
      index
    ].conditionTypeList = BizRule.filterConditionOf3(item.propertyType);
    this.triggerConditionList[key].conditionItemList[index].propertyType =
      item.propertyType;
  }

  //对比函数改变事件
  onHandleData2(index: number, key: number) {
    // 清空对比函数和子流程模型数据项
    this.$nextTick(() => {
      this.triggerConditionList[key].conditionItemList[index].value = '';
      this.triggerConditionList[key].conditionItemList[index].errorMsg = '';
    });
  }

  // 校验输入框内容
  validate(item: any, evt?: Event) {
    let err = '';
    if (!item.value || (!item.value.length && item.propertyType === 5)) {
      this.$set(item, 'errorMsg', '请输入内容');
      return;
    }
    if (item.propertyType === 0 && item.value.length > 200) {
      err = '短文本长度不得超过200';
    } else if (item.propertyType === 1 && item.value.length > 2000) {
      err = '长文本长度不得超过2000';
    } else if (
      item.propertyType === 2 &&
      !/^\d{1,9}(\.\d{0,4})?$/.test(item.value)
    ) {
      err = '请输入数值（支持最大9位整数和4位小数）';
      setTimeout(() => {
        const matches: any = item.value.match(/\d{1,9}(\.\d{0,4})?/);
        item.value = Array.isArray(matches) ? matches[0] : '';
        item.errorMsg = '';
      }, 1500);
    }
    this.$set(item, 'errorMsg', err);
  }

  addTrigger() {
    const newRow: ITableCondition = {
      currentDataItem: '',
      conditionType: '',
      conditionTypeList: '',
      value: '',
      propertyType: '',
      errorMsg: '',
      targetFieldList: this.targetFieldList,
    };
    this.triggerConditionList.push({
      conditionJoinType: 'AND',
      conditionItemList: [newRow],
    });
    console.log(this.triggerConditionList);
  }

  delTrigger(index: number) {
    this.triggerConditionList.splice(index, 1);
  }

  filterOption(input, option) {
    return option.componentOptions.children && 
    option.componentOptions.children[0].text &&
    option.componentOptions.children[0].text.toLowerCase().indexOf(input.trim().toLowerCase()) >= 0
  }
}
</script>

<style lang='less' scoped>
.div-height {
  width: 100%;
  /deep/.input-modal {
    cursor: pointer;
    width: 100%;
    .txt {
      margin-left: 10px;
      color: rgba(0, 0, 0, 0.25);
      &.opacity {
        color: rgba(0, 0, 0, 1);
      }
    }
  }
}
.properFilterCondition {
  .add {
    margin-top: 8px;
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    margin-right: 24px;
    clear: both;
    span {
      margin-right: 8px;
    }
  }
  .data-select {
    width: 100% !important;
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
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
  }
}
.filter-collapse {
  margin-top: 20px;
  .ant-collapse-item > .ant-collapse-header {
    border-bottom: 1px solid #e8e8e8;
    height: 38px;
    line-height: 38px;
    padding: 0 16px 0 34px;
    background: #fafafa;
    box-shadow: 0px 1px 0px 0px #e9e9e9;
    border-radius: 4px 4px 0px 0px;
  }
  .ant-collapse-item {
    border: none;
    margin-bottom: 20px;
    .ant-collapse-content > .ant-collapse-content-box {
      padding-top: 20px;
    }
  }
  .ant-collapse-content {
    overflow: inherit;
  }
  .centent {
    padding-right: 20px;
    .filterw100 {
      & > div {
        width: 100%;
      }
      .const {
        padding-left: 10px;
        width: 100%;
        height: 32px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        line-height: 32px;
      }
    }
  }
}

.has-error /deep/.h3-organization__label,
.has-error /deep/.h3-organization__label:hover {
  border: 1px solid #f5222d !important;
}
.value > div {
  width: 100%;
}
.value /deep/.ant-calendar-picker {
  min-width: 100% !important;
}
</style>