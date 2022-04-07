<template>
  <div>
    <div class="option-wrap">
      <a-row class="radio-row">
        <a-col :span="4" class="radio-col">选项来源</a-col>
        <a-col :span="20" class="radio-col">
          <a-radio-group name="radioGroup" v-model="optionsType">
            <a-radio :value="1">自定义</a-radio>
            <a-radio v-if="showOptionBiz" :value="2">业务模型</a-radio>
            <a-radio :value="3">数据字典</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
    </div>
    <div class="add-option-wrap" v-if="optionsType === 1">
      <a-row>
        <a-col :span="4">选项</a-col>
        <a-col :span="20">
          <div class="option-back">
            <div
              class="radio-group"
              v-if="modalData.type === 'bizRadioOption'"
              ref="condionwrap"
            >
              <a-row>
                <a-radio-group v-model="defaultValue" @change="radioChange" style="width: 100%;">
                  <draggable
                    :list="options"
                    :options="dragOptions"
                    handle=".handles"
                  >
                    <div
                      v-for="(modulem, index) in options"
                      :key="index"
                      class="radio-item-wrap clearfix"
                    >
                        <a-col :span="2">
                          <div class="radio-wrap">
                            <a-radio
                              class="radio-item"
                              :value="index"
                            ></a-radio>
                          </div>
                        </a-col>
                        <a-col :span="20">
                          <div class="input-wrap">
                            <a-input
                              v-if="filterType === 1"
                              :placeholder="
                                $t(
                                  'languages.Apps.FormDesignPage.Placeholder.InputOptionName'
                                )
                              "
                              class="input"
                              v-model="modulem.value"
                            />
                            <a-input
                              v-else
                              :placeholder="
                                $t(
                                  'languages.Apps.FormDesignPage.Placeholder.InputOptionName'
                                )
                              "
                              class="input"
                              v-model="modulem.value"
                              maxlength="200"
                              @change="inputChange(index)"
                            />
                          </div>
                        </a-col>
                        <a-col :span="2">
                          <span class="icon aufontAll handles">&#xe63e;</span>
                          <span class="delete-wrap">
                            <span class="delete" @click="deleteRow(index)">
                              <a-icon type="delete" />
                            </span>
                          </span>
                        </a-col>
                    </div>
                  </draggable>  
                </a-radio-group>
              </a-row>
            </div>
            <template v-else-if="this.modalData.type === 'checkboxOption'">
              <ul ref="condionwrap">
                <draggable
                  :list="options"
                  :options="dragOptions"
                  handle=".handles"
                >
                  <li
                    class="clearfix"
                    v-for="(modulem, index) in options"
                    :key="index"
                  >
                    <a-row style="width: 100%;">
                      <a-col :span="2">
                        <div class="default check-wrap" >
                          <a-checkbox v-model="modulem.default" />
                        </div>
                      </a-col>
                      <a-col :span="20">
                        <div class="input-wrap">
                          <a-input
                            v-if="filterType === 1"
                            :placeholder="
                              $t(
                                'languages.Apps.FormDesignPage.Placeholder.InputOptionName'
                              )
                            "
                            v-model="modulem.value"
                          />
                          <a-input
                            v-else
                            :placeholder="
                              $t(
                                'languages.Apps.FormDesignPage.Placeholder.InputOptionName'
                              )
                            "
                            v-model="modulem.value"
                            @change="inputChange(index, $event)"
                          />
                          <!-- <div class="tips"><span>请输入不以空格开头长度不超过200个字符</span></div> -->
                        </div>
                      </a-col>
                      <a-col :span="2">
                        <div>
                          <span class="icon aufontAll handles">&#xe63e;</span>
                          <span @click="deleteRow(index)">
                            <a-icon type="delete" />
                          </span>
                        </div>
                      </a-col>
                    </a-row>
                  </li>
                </draggable>
              </ul>
            </template>
            <div class="add-div">
              <div class="add" @click="addRow">
                <span>
                  <i class="icon aufontAll h-icon-all-plus-o"></i>
                </span>
                <span>{{ $t("languages.Apps.FormDesignPage.AddOptins") }}</span>
              </div>
              <ext-batch-add-radio-modal
                :options.sync="options"
              ></ext-batch-add-radio-modal>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- <div class="ant-row-flex ant-row-flex-center">
        <div class="add" @click="addRow">
          <span>
            <i class="icon aufontAll h-icon-all-plus-o"></i>
          </span>
          <span>{{ $t("languages.Apps.FormDesignPage.AddOptins") }}</span>
        </div>
        <div class="add" @click="addAllRow">
          <span>
            <i class="icon aufontAll h-icon-all-plus-o"></i>
          </span>
          <span>{{ $t("languages.Apps.FormDesignPage.BatchSetting") }}</span>
        </div>
      </div>
      <a-modal
        :title="$t('languages.Apps.FormDesignPage.BatchSettingTitle')"
        :cancelText="$t('languages.Apps.Cancel')"
        :okText="$t('languages.Apps.Ok')"
        :visible="visibleIncrease"
        @ok="handleBatchOk"
        @cancel="handleBatchClose"
        class="modal"
        :maskClosable="false"
        :keyboard="false"
      >
        <a-textarea
          v-model="increaseValue"
          :rows="4"
          :maxLength="100000"
          :placeholder="$t('languages.Apps.FormDesignPage.BatchSettingTextarea')"
        />
      </a-modal> -->
    </div>
    <div v-else-if="optionsType === 2">
      <a-row>
        <a-col :span="4" class="radio-col">业务模型</a-col>
        <a-col :span="12">
          <config-provider :locale="locale">
            <biz-models-selector
              :appCode="appCode"
              :value="bizModel"
              :folderId="appFunctionCode"
              appManagerFilter="true"
              @change="onTreeChange"
              @select="onTreeSelect"
            />
          </config-provider>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="4" class="radio-col">数据项</a-col>
        <a-col :span="12">
          <config-provider :locale="locale">
            <a-select
              style="width: 100%"
              :disabled="!bizModel"
              v-model="sheetDataItem"
              @change="onChange"
            >
              <template v-for="item in targetDataItems">
                <a-select-option
                  :value="item.code"
                  :key="item.code"
                  >{{ item.name }}</a-select-option
                >
              </template>
            </a-select>
          </config-provider>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="4" class="radio-col">排序数据项</a-col>
        <a-col :span="12">
          <config-provider :locale="locale">
            <a-select
              style="width: 100%"
              allowClear
              :disabled="!bizModel"
              v-model="orderByFields"
            >
              <template v-for="item in targetDataItems">
                <a-select-option
                  :value="item.code"
                  :key="item.code"
                  v-if="sortFilterType.includes(item.propertyType)"
                  >{{ item.name }}</a-select-option
                >
              </template>
            </a-select>
          </config-provider>
        </a-col>
      </a-row>

      <a-row v-if="orderByFields">
        <a-col :span="4">排序规则</a-col>
        <a-col :span="12" class="radio-col">
          <a-radio-group name="radioGroup" v-model="orderType">
            <a-radio :value="1">升序 A-Z</a-radio>
            <a-radio :value="2">降序 Z-A</a-radio>
            <a-radio :value="3">默认</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>

      <a-row class="search-infos">
        <a-col :span="4" class="radio-col">查询条件</a-col>
        <a-col :span="20" class="condition-col">
          <a-row v-show="conditionList.length > 0">
            <a-col :span="9">当前模型数据项</a-col>
            <a-col :span="5"></a-col>
            <a-col :span="9">联动模型数据项</a-col>
            <a-col :span="1"></a-col>
          </a-row>
          <div
            v-for="(condition, index) in conditionList"
            :key="condition.key"
            class="select-wrap"
          >
            <a-row>
              <a-col :span="9">
              <!-- 绑定表单的查询条件 -->
              <a-select
                :disabled="!bizModel"
                v-model="condition.target.val"
                @change="rowChange(condition, true)"
              >
                <a-select-option
                  v-for="item in condition.target.listOpt"
                  :value="item.code"
                  :key="item.code"
                  :title="item.name.concat('[').concat(item.code).concat(']')"
                  >{{ `${item.name}[${item.code}]` }}</a-select-option
                >
              </a-select>
              </a-col>
              <a-col :span="5">
                <!-- 操作符号 -->
                <a-select  v-model="condition.operator.val" style="padding: 0 8px;">
                  <a-select-option
                    v-for="(item, index) in condition.operator.listOpt"
                    :key="index"
                    :value="item.type"
                    >{{ item.val }}</a-select-option
                  >
                </a-select>
              </a-col>
              <a-col :span="9">
                <!-- 当前表单的 -->
                <config-provider
                  :locale="locale"
                  v-if="condition.operator.val == '=='"
                >
                  <a-select
                    :disabled="!condition.target.val"
                    v-model="condition.current.val"
                    :locale="{ emptyText: $t('languages.NoRelevantData') }"
                  >
                    <a-select-option
                      v-for="item in condition.current.listOpt"
                      :value="item.code"
                      :key="item.code"
                      :title="item.name.concat('[').concat(item.code).concat(']')"
                      >{{ `${item.name}[${item.code}]` }}</a-select-option
                    >
                  </a-select>
                </config-provider>
                <StaffSelector
                  class="ant-select"
                  v-else-if="getcomName(condition) == 'StaffSelector'"
                  :options="staffSelectorOpts"
                  v-model="condition.current.pval"
                ></StaffSelector>
                <config-provider :locale="locale" v-else>
                  <component
                    class="ant-select"
                    :is="getcomName(condition)"
                    v-model="condition.current.pval"
                  ></component>
                </config-provider>
              </a-col>
              <a-col :span="1">
                <div class="delete-wrap">
                  <span class="delete" @click="deleteCondition(index)">
                    <a-icon type="delete" />
                  </span>
                </div>
              </a-col>
            </a-row>
          </div>

          <div
            class="add"
            @click="
              () => {
                this.addCondition();
              }
            "
          >
            <span>
              <i class="icon aufontAll h-icon-all-plus-o"></i>
            </span>
            <span>{{ $t("languages.Apps.FormDesignPage.AddOptins") }}</span>
          </div>
        </a-col>
      </a-row>
      <a-row
        v-if="isRadioOrCheckbox"
        type="flex"
        class="rowStyle"
      >
        <a-col :span="4"
          >选项设置
          <a-tooltip>
            <template slot="title"></template>
            <i
              class="icon aufontAll h-icon-all-question-circle-o"
              style="margin-right: 3px"
            ></i> </a-tooltip
          >：</a-col
        >
        <a-col class="opt-setting" @click="handleShowOpt">{{selecteds.length > 0 ? '已设置' : '未设置'}}</a-col>
      </a-row>
      <a-row
        v-if="isRadioOrCheckbox"
        class="tips"
      >
        <a-col class="title">业务数据选项设置规范</a-col>
        <div>
          1、表单设计时选项值最多勾选200个，且表单运行时单选框和复选框最多只展示200个选项。
        </div>
        <div>
          2、相同的选项值会被过滤，仅留一个选项值。比如「姓名」字段，张三、张三、李四，选项值为张三、李四。重复的值会被过滤掉。
        </div>
      </a-row>
    </div>

    <div v-else>
      <data-dictionaries
        ref="DataDictionariesRef"
        :modalData="dataDictionaryData"
      ></data-dictionaries>
    </div>
    <a-modal
      width="680px"
      title="选项设置"
      :visible="showOpt"
      @cancel="closeOptModal"
    >
      <div class="select-tips">当前数据项<span class="total">{{totalElements}}</span>条 您已选择<span class="selected">{{selecteds.length}}</span>条<span  v-if="totalElements > 200 && selecteds.length < 200">,还可以选择<span class="total">{{200-selecteds.length}}</span>条</span></div>
      <a-table
        :dataSource="dataSource"
        :rowSelection="columns.length ? rowSelection : null"
        :columns="columns"
        :pagination="false"
        :scroll="{ y: 485 }"
        :rowKey="(record, index) => record.data.id"
      >
        <template slot="data" slot-scope="record">
          {{ record[sheetDataItem] }}
        </template>
        <template slot="header">
          <a-input-search
            placeholder="请输入名称搜索"
            v-model="searchKey"
            @search="onSearch"
          />
        </template>
      </a-table>
      <div class="pagination" v-show="totalElements > 0">
          <a-pagination
            @showSizeChange="showSizeChange"
            :defaultPageSize="pageSize"
            :pageSizeOptions="pageSizeOptions"
            :total="totalElements"
            :showTotal="total => `共${totalElements}条`"
            :current="page + 1"
            show-size-changer
            @change="pageChange"
          >
          <template slot="buildOptionText" slot-scope="props">
            <span>{{ props.value }}条/页</span>
          </template>
          </a-pagination>
      </div>
      <template slot="footer">
        <a-button @click="closeOptModal">取消</a-button>
        <a-button type="primary" @click="closeOptModal">保存</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { sliceString } from "@cloudpivot/form/utils/utils";
import BizModelsSelector from "./biz-models-selector/index.vue";
import { components } from "@cloudpivot/h3-list";
import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";
import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";
import { listApi } from "@cloudpivot/api";
import DataDictionaries from "@cloudpivot/form/src/common/components/data-dictionaries.vue";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import ExtBatchAddRadioModal from "./biz-batch-radio-option.vue";
import {
  Input,
  InputNumber,
  DatePicker,
  Switch,
  ConfigProvider,
} from "@h3/antd-vue";
import moment from "moment";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
import Draggable from "vuedraggable";
import { DataItemType } from "@cloudpivot/form/schema";
import { cloneDeep } from "lodash";

@Component({
  name: "BizOptionDataModel",
  components: {
    BizModelsSelector,
    StaffSelector,
    Input,
    InputNumber,
    DatePicker,
    ASwitch: Switch,
    ConfigProvider,
    ExtBatchAddRadioModal,
    Draggable,
    DataDictionaries,
  },
})
export default class BizOptionDataModel extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({
    default: () => ({}),
  })
  dataItem!: DataItemState;

  @Prop() showModel!: any;
  @Prop() dataItems: any;
  @Prop() showOptionBiz!: boolean;
  @Prop() dataType!: number
  optionsType = 1;

  get isRadioOrCheckbox(){
    return [
      DataItemType.Radio,
      DataItemType.Checkbox
    ].includes(this.dataType)
  }

  showOpt = false;

  totalElements = 0;

  orderType = 1;

  filterType = 0;

  bizModel = "";

  dataSource: any = [];

  columns: any = [
    {
      title: "全部",
      dataIndex: "data",
      key: "data",
      width: "50%",
      scopedSlots: {
        customRender: "data",
      },
    },
    {
      slots: {
        title: "header",
      },
      align: "right",
    },
  ];

  rowSelection = {
    type: "checkbox",
    selectedRowKeys: new Array<string>(),
    onSelect: this.onSelect,
    onSelectAll: this.onSelectAll
  };

  searchKey = '';

  pageSizeOptions: Array<string> = [
    '10',
    '20',
    '50',
    '100',
    '200'
  ]

  page = 0

  pageSize = 10

  targetDataItems: any[] = [];

  currentDataItems: any = [];

  sheetDataItem = "";

  orderByFields = "";

  filtersType = [6, 7, 8, 10];

  sortFilterType = [0, 2, 3, 12];

  visibleIncrease: boolean = false;

  increaseValue: string = "";

  selecteds: any = []

  operator = [
    {
      val: "动态值",
      type: "==",
    },
    {
      val: "固定值",
      type: "===",
    },
  ];

  dragOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    forceFallback: true,
    fallbackClass: "dragClass",
    touchStartThreshold: 20,
    delay: 100,
  };

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
    this.sheetDataItem = "";
    this.orderByFields = "";
    this.getTargetItem(this.bizModel).then((res) => {});
  }
  appCode = "";
  appFunctionCode = "";
  onTreeSelect(val) {
    this.appCode = val[0];
    if (val.length > 2) {
      this.appFunctionCode = val[val.length - 1];
    }
  }

  onChange() {
    this.selecteds = [];
    this.rowSelection.selectedRowKeys = []
  }

  async handleShowOpt() {
    this.dataSource = await this.getOptData();
    this.showOpt = true;
  }

  closeOptModal() {
    if(this.selecteds.length > 200) {
      this.$message.error('最多选择200条数据')
      return
    }
    this.showOpt = false;
  }

  onSearch() {
      this.page = 0;
      let obj: any = {
      queryCode: "",
      schemaCode: this.bizModel,
      options: {
        customDisplayColumns: [this.sheetDataItem],
      },
      orderByFields: [this.orderByFields],
      orderType: this.orderType,
      page: this.page,
      size: this.pageSize,
      filtersMap: this.conditionList,
      filtersNewCondition: [{
        propertyType: this.dataType,
        propertyCode: this.sheetDataItem,
        propertyValue: this.searchKey,
        op: 'Like'
      }]
    };
    listApi.listSkipQueryListV2(obj).then((res) => {
      if (res.errcode === 0) {
        this.totalElements = res.data.totalElements
        this.dataSource = res.data.content;
      }else {
        this.dataSource = [];
        this.totalElements = 0;
      }
    });
  }

  onSelect(record: any, selected: boolean, selectedRows: any[]) {
    if(this.selecteds.length > 0) {
      if(selected) {
        this.selecteds = [...this.selecteds, record]
      }else {
        this.selecteds = this.selecteds.filter((item:any) => {
          return item.data.id != record.data.id
        })
      }
    }else {
      this.selecteds = [record]
    }
    this.rowSelection.selectedRowKeys = this.selecteds.map(i => {
      return i.data.id
    })
    console.log(this.rowSelection.selectedRowKeys, this.selecteds, selectedRows)
  }

  onSelectAll(selected: boolean, selectedRows: any[], changeRows: any[]) {
    this.rowSelection.selectedRowKeys = selectedRows.map((x) => x.data.id);
    console.log('dsa',selectedRows, changeRows, this.selecteds)
    if(selected) {
      const arrkeys = this.selecteds.map(i => i.data.id);
      this.rowSelection.selectedRowKeys.map((item,index) => {
        if(arrkeys.includes(item)) {
          return
        }else {
          this.selecteds = [...this.selecteds, selectedRows[index]]
          this.rowSelection.selectedRowKeys = this.selecteds.map(i => {
            return i.data.id
          })
        }
      })
    }else {
      const arrkeys = this.selecteds.map(i => i.data.id);
      const changeRowsKey = changeRows.map(i => i.data.id)
      changeRowsKey.map((item,index) => {
        if(arrkeys.includes(item)) {
          this.selecteds = this.selecteds.filter(x => {
            return x.data.id != item
          })
          this.rowSelection.selectedRowKeys = this.selecteds.map(i => {
            return i.data.id
          })
        }
      })
    }
  }

  getOptData() {
    // if (!this.bizModel || !this.sheetDataItem || !this.orderByFields) {
    if (!this.bizModel || !this.sheetDataItem) {
      return;
    }
    let obj: any = {
      queryCode: "",
      schemaCode: this.bizModel,
      options: {
        customDisplayColumns: [this.sheetDataItem],
      },
      // orderByFields: [this.orderByFields],
      orderByFields: this.orderByFields ? [this.orderByFields] : [this.sheetDataItem],
      orderType: this.orderType,
      page: this.page,
      size: this.pageSize,
      filtersMap: this.conditionList,
      filtersNewCondition: [{
        propertyType: this.dataType,
        propertyCode: this.sheetDataItem,
        propertyValue: this.searchKey,
        op: 'Like'
      }]
    };
    return listApi.listSkipQueryListV2(obj).then((res) => {
      if (res.errcode === 0) {
        this.totalElements = res.data.totalElements
        return res.data.content;
      }
      this.totalElements = 0;
      return [];
    });
  }

  async pageChange(page: number, pageSize: number) {
    this.page = page - 1;
    this.pageSize = pageSize;
    this.dataSource = await this.getOptData();
  }

  showSizeChange(current: number, size: number) {
    this.pageSize = size;
    this.onSearch();
  }

  mounted() {
    const _items = dataitemStore.getDataItems(this).filter((x) => x.used);
    console.log(_items)
    let items = JSON.parse(JSON.stringify(_items));

    if (this.dataItem && this.dataItem.type === 1) {
      this.filterType = 1;
    }

    if (this.dataItem.parentCode) {
      const sheet = items.find((x) => x.code === this.dataItem.parentCode);
      if (sheet && sheet.properties) {
        const sheetItems = sheet.properties.filter((x: any) => {
          const flag = x.used && x.code !== this.dataItem.code;
          x.code = `${this.dataItem.parentCode}.${x.code}`;
          return flag;
        }) as any;
        items = items.concat(sheetItems);
      }
    }
    if (this.showModel) {
      items = this.dataItems.filter((i) => !i.isSystem);
    }

    this.currentDataItems = items.filter(
      (res) => res.type !== DataItemType.Sheet
    );
  }

  getTargetItem(schemaCode: string) {
    return new Promise((resolve, reject) => {
      const params = {
        schemaCode,
      };
      listApi.getDataItemList(params).then((res: any) => {
        let data: any[] = [];
        if (res.status || res.data.errcode === 0) {
          data = res.data.data;
        }
        if (res.errcode === 0) {
          data = res.data;
        }
        this.targetDataItems = data.filter((item) => {
          return !this.filtersType.includes(item.propertyType);
        });
        this.conditionList = [];
        resolve();
      });
    });
  }

  rowChange(row: any, isClear?: boolean) {
    if (!row.target.val) {
      return;
    }
    const cur = JSON.parse(JSON.stringify(this.currentDataItems));
    const tar: any = row.target.listOpt.find((res) => {
      return res.code === row.target.val;
    });
    if (isClear) {
      row.current.val = "";
      row.current.pval = "";
    }
    row.current.listOpt = cur
      .filter((item) => {
        return item.code !== this.dataItem.code;
      })
      .filter((item) => {
        if (
          item.type === DataItemType.RelevanceForm ||
          item.type === DataItemType.RelevanceFormEx
        ) {
          return (
            item.type === tar.propertyType &&
            item.relativeCode === tar.relativeCode
          );
        } else if (
          item.type === DataItemType.StaffDeptMix
        ) {
          return (
            tar.propertyType === DataItemType.StaffMulti ||
            tar.propertyType === DataItemType.StaffSingle ||
            tar.propertyType === DataItemType.DeptMulti ||
            tar.propertyType === DataItemType.DeptSingle ||
            tar.propertyType === DataItemType.StaffDeptMix
          );
        } else if([0,12,14].includes(tar.propertyType)){
          return [0,12,14].includes(item.type) || item.type === tar.propertyType;
        } else if([13,15].includes(tar.propertyType)){
          return [13,15].includes(item.type);
        } else {
          return item.type === tar.propertyType;
        }
      });
  }

  getcomName(row: any) {
    let targetVal = row.target.listOpt.filter(
      (item) => item.code == row.target.val
    );
    let comName = "";
    if (row.operator.val == "===") {
      switch (targetVal[0].propertyType) {
        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Checkbox:
        case DataItemType.Dropdown:
        case DataItemType.DropdownMulti:
        case DataItemType.LongText:
          comName = "Input";
          break;
        case DataItemType.Number:
          comName = "InputNumber";
          break;
        case DataItemType.Date:
          comName = "DatePicker";
          break;
        case DataItemType.Logic:
          comName = "ASwitch";
          break;
        case DataItemType.StaffMulti:
        case DataItemType.StaffSingle:
        case DataItemType.DeptMulti:
        case DataItemType.DeptSingle:
        case DataItemType.StaffDeptMix:
          comName = "StaffSelector";
          break;
      }
    }
    return comName;
  }

  addCondition(val?: any) {
    const cur = this.currentDataItems;
    const tar = this.targetDataItems;
    const op = this.operator;
    const item: any = {
      target: {
        val: val ? val.target : "",
        listOpt: this.deepCopy(tar),
      },
      operator: {
        val: val ? val.operator : "==",
        listOpt: this.deepCopy(op),
      },
      current: {
        val: val ? val.current : "",
        pval: "",
        listOpt: this.deepCopy(cur),
      },
      key: +new Date(),
    };
    if (val && val.operator == "===") {
      let propertyType = item.target.listOpt.find(
        (targetItem) => targetItem.code == item.target.val
      ).propertyType;
      switch (propertyType) {
        case 0:
          item.current.val = "";
          item.current.pval = val.current;
          break;
        case 2:
          item.current.val = "";
          item.current.pval = Number(val.current);
          break;
        case 3:
          item.current.val = "";
          item.current.pval = moment(Number(val.current));
          break;
        case 4:
          item.current.val = "";
          item.current.pval = val.current == "true";
          break;
        case 5:
          item.current.val = "";
          item.current.pval = JSON.parse(val.current);
          break;
      }
    }
    this.rowChange(item, false);
    this.conditionList.push(item);
  }

  deleteCondition(index: number) {
    this.conditionList.splice(index, 1);
  }

  deepCopy(item) {
    const str = JSON.stringify(item);
    return JSON.parse(str);
  }

  options: Array<any> = [
    {
      default: this.modalData.type === "checkboxOption" ? false : true,
      value: "",
    },
    {
      default: false,
      value: "",
    },
    {
      default: false,
      value: "",
    },
  ];

  dataDictionaryData: any = {}; // 数据字典数据
  defaultValue: number = -1;
  hasDefault = false;
  created() {
    const data = this.modalData.data;
    if (data.value) {
      try {
        const obj = JSON.parse(data.value);
        if (Object.keys(obj).includes("dictionariesType")) {
          this.dataDictionaryData = {
            default: "",
            value: JSON.stringify(obj),
          };
          this.optionsType = 3;
        } else {
          this.setBizmodel(data);
          this.optionsType = 2;
          this.hasDefault = true;
        }
      } catch {
        this.setCustom(data);
        this.optionsType = 1;
      }
    }
  }

  setCustom(data: any) {
    this.options = data.value
      .split(";")
      .filter((s: string) => s.length)
      .map((s: string, index: number) => ({
        default: false,
        value: s,
      }));
    if (data.default) {
      data.default
        .split(";")
        .filter((s: string) => s.length)
        .forEach((s: string) => {
          const opt = this.options.find((x) => x.value === s);
          if (opt) {
            opt.default = true;
          }
        });
    }

    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].default) {
        this.defaultValue = i;
        break;
      }
    }
  }

  setBizmodel(data: any) {
    const obj: any = JSON.parse(data.value);
    this.bizModel = obj.schemaCode;
    this.sheetDataItem = obj.sheetDataItem;
    this.orderByFields = obj.orderByFields;
    this.orderType = obj.orderType;
    this.appCode = obj.appCode;
    this.appFunctionCode = obj.appFunctionCode;
    this.getTargetItem(this.bizModel).then((res) => {
      if (obj.condition) {
        const op = obj.condition.split("&&").forEach((condition) => {
          const arr = condition.split(" ");
          const [target, operator, ...rest] = arr;
          const item = {
            target: arr[0],
            operator: arr[1],
            current: rest.join(" "),
          };
          this.addCondition(item);
        });
      }
    });
    this.selecteds = obj.labels;
    this.getExistItem();
  }

  /**
   * 判断模型数据存在
   */
  getExistItem() {
    let params: any = {
      schemaCode: this.bizModel,
      ids: this.selecteds.map((item)=>{ return item.data.id })
    };
    listApi.getExistItem(params).then((res) => {
      if (res.errcode === 0) {
        let existList = res.data.true || [];
        let selectedsList:any = [];
        this.selecteds.forEach((item)=>{
          let node = existList.find((ele)=> item.data.id === ele);
          if(node) {
            selectedsList.push(item);
          }
        });
        this.selecteds = cloneDeep(selectedsList);
      }
      // @ts-ignore
      this.rowSelection.selectedRowKeys = Array.isArray(this.selecteds) && this.selecteds.map(item => item.data.id)
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
    const backData = this.getData();
    if (backData) {
      this.$emit("backData", backData);
    }
  }

  getData() {
    
    let backData: any = "";
    if (this.optionsType === 1) {
      backData = this.customBack();
    } else if (this.optionsType === 2) {
      backData = this.bizmodeBack();
      if (!backData) {
        return "";
      }
    } else {
      backData = (this.$refs.DataDictionariesRef as any).bizmodeBack();
      backData.optionsType = 3;
    }
    return backData;
  }

  /**
   * 批量设置自定义选项
   */
  handleBatchOk() {
    if (!this.increaseValue) {
      this.handleBatchClose();
      return false;
    }

    const arrValue: string[] = this.increaseValue.split(/[(\r\n)\r\n]+/);
    const length: number = this.options.length;
    const el: any = this.$refs.condionwrap;
    const obj: object[] = [];
    arrValue.forEach((value: string, index: number) => {
      obj.push({
        default: length === 0 ? true : false,
        value: value,
      });
    });
    this.options = [...this.options, ...obj];
    // this.increaseValue = '';
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 10);
    this.handleBatchClose();
  }

  // 关闭批量设置自定义选项
  handleBatchClose() {
    this.visibleIncrease = false;
  }
  // 自定义数据类型
  customBack() {
    // const op = this.options.filter(
    //   x => x.value.en || x.value.zh
    // ).map(x => {
    //   if (!x.value.en) {
    //     x.value.en =  x.value.zh;
    //   }
    //   if (!x.value.zh) {
    //     x.value.zh = x.value.en;
    //   }
    //   return x;
    // })

    // const zh_val = op.map(x => x.value.zh).join(';');

    // const en_val = op.map(x => x.value.en).join(';');
    
    const value = this.options
      .filter((x) => x.value.trim())
      .map((x) => x.value.trim())
      .join(";");

    const defaultValue = this.options
      .filter((x) => x.value.trim() && x.default)
      .map((x) => x.value.trim())
      .join(";");

    

    // const defaultValue = op.filter(x => x.default).map(x => x.value.zh).join(';');

    const backData = {
      value: value,
      default: defaultValue,
    };

    return backData;
  }
  bizmodeBack() {
    if (!this.bizModel) {
      this.$message.error("业务模型不能为空");
      return false;
    }
    if (!this.sheetDataItem) {
      this.$message.error("数据项不能为空");
      return false;
    }
    if (this.conditionList.length > 0) {
      const flag = this.conditionList.some((cond) => {
        if (typeof cond.current.pval == "boolean") {
          return !cond.target.val || !cond.operator.val;
        }
        return (
          !cond.target.val ||
          !cond.operator.val ||
          !(cond.current.val || cond.current.pval)
        );
      });
      if (flag) {
        this.$message.error("条件配置项不能为空");
        return false;
      }
    }
    const condition = this.conditionList
      .map((res) => {
        if (res.operator.val == "==") {
          return `${res.target.val} ${res.operator.val} ${res.current.val}`;
        } else {
          let pval = res.current.pval._isAMomentObject
            ? res.current.pval.valueOf()
            : res.current.pval;
          pval =
            typeof pval == "object"
              ? JSON.stringify(res.current.pval)
              : res.current.pval;
          return `${res.target.val} ${res.operator.val} ` + pval;
        }
      })
      .join("&&");
    let string = `schemaCode:${this.bizModel} sheetDataItem:${this.sheetDataItem} condition:${condition}`;
    const obj = {
      schemaCode: this.bizModel,
      sheetDataItem: this.sheetDataItem,
      orderByFields: this.orderByFields,
      orderType: this.orderType,
      appCode: this.appCode,
      appFunctionCode: this.appFunctionCode,
      condition,
      labels: []
    };

    // if(["bizRadioOption", "checkboxOption"].includes(this.modalData.type)) {
    if(this.isRadioOrCheckbox) {
      obj.labels = this.selecteds.map(item => {
        if(typeof(item.data[this.sheetDataItem]) != 'string') {
          item.data[this.sheetDataItem] = JSON.stringify(item.data[this.sheetDataItem])
        }
        return item
      }).reduce((pre, crr) => {
        const value = pre.map(item => item.data[this.sheetDataItem])
        return value.includes(crr.data[this.sheetDataItem]) ? pre : [...pre, crr]
      },[])
      if(obj.labels.length === 0) {
        this.$message.error('未选择选项值')
        return
      }
    }

    return {
      value: JSON.stringify(obj),
      default: "",
    };
  }
  /**
   * 增加行
   */
  addRow() {
    const el: any = this.$refs.condionwrap;
    const obj = {
      default: this.options.length === 0 ? true : false,
      value: "",
    };
    this.options.push(obj);
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 10);
  }

  addAllRow() {
    this.visibleIncrease = !this.visibleIncrease;
  }
  /**
   * 删除行
   */
  deleteRow(index: number) {
    // console.log('delete' ,index ,this.defaultValue ,this.options)
    // 判读当前想是否为被选中项，如果是，则将选中项清空
    if (this.defaultValue === index) {
      this.defaultValue = -1;
    }
    // 判断当前删除项是否为当前被选中项的前面，如果是，则被选中项要减去1
    if (index < this.defaultValue && this.defaultValue >= 1) {
      this.defaultValue--;
    }
    this.options.splice(index, 1);
  }
  /**
   * 单选框改变回调
   */
  radioChange(e: any) {
    this.defaultValue = parseInt(e.target.value, 10);
    const optionsLength = this.options.length;
    for (let i = 0; i < optionsLength; i += 1) {
      this.options[i].default = false;
    }
    this.options[this.defaultValue].default = true;

    //     console.log(e.target.value)
    // const val:string = e.target.value
    // this.defaultValue = val
    // this.options.forEach((item: any) => {
    //   item.value === val ? item.default = true : item.default = false
    // })
  }
  inputChange(index: number) {    
    const reg = /^ /;
    if (reg.test(this.options[index].value)) {
      this.$message.error('不能空格开头！');
      return;
    }
    this.options[index].value = sliceString(this.options[index].value, 200);
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
}
</script>

<style lang="less">
.search-infos{
  .select-wrap, .select-wrap .ant-row{
    display: block;
    width: 100%;
  }
} 
</style>
<style lang="less" scoped>
.search-infos {
  .ant-row {
    margin-bottom: 0;
  }
}

.select-tips {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin: 10px 0;
  .total {
    color: #17BC94;
    margin: 0 5px;
  }
  .selected {
    color: #F4454E;
    margin: 0 5px;
  }
}
.ant-col {
  line-height: 32px;
}

.pagination {
  margin-top: 10px;
  display: flex;
  flex-direction: row-reverse;
}

.ant-row {
  margin: 16px 0;
  .ant-col-6 {
    line-height: 32px;
  }
  // .ant-col-18{
  //   // line-height: 32px;
  // }
  .radio-col {
    line-height: 32px;
    .ant-radio-wrapper {
      margin-right: 18px;
    }
    .ant-radio-group {
      overflow: hidden;
    }
  }
  .condition-col {
    // margin-top: 6px;
    background: #f4f5f8;
    border-radius: 4px;
    padding: 10px;
    .ant-select {
      margin-right: 8px;
      /*width: 106px;*/
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
      /deep/ .h3-organization__label .h3-organization-selected-name {
        max-width: 45px;
      }
    }
    .add {
      color: @primary-color;
      text-align: center;
      // margin-top: 20px;
      margin-right: 24px;
      cursor: pointer;
      span {
        margin-right: 8px;
      }
    }
  }
}

.rowStyle {
  line-height: 32px;
  margin: 10px 0;
  .opt-setting {
    color: #17bc94;
    cursor: pointer;
  }
}

.tips {
  .title {
    font-size: 14px;
    font-weight: 600;
    color: #000 85%;
    margin-bottom: 8px;
  }
  background: #fffbe6;
  border: 1px solid rgba(255, 229, 143, 1);
  padding: 16px;
  font-size: 12px;
}

.option-wrap {
  .radio-row  {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    .radio-col  {
      display: flex;
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
      // width: 240px;
      width: 100%;
    }
    .delete {
      // float: right;
      margin-left: 8px;
    }
    .radio-item-wrap {
      margin-bottom: 8px;
      & > div {
        float: left;
      }
      .input-wrap {
        // margin-left: 8px;
      }
      .radio-wrap,
      .delete-wrap {
        text-align: center;
        margin-top: 4px;
      }
    }
  }
  .handles {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    margin-left: 10px;
    cursor: move;
  }
  .option-back {
    background: #f4f5f8;
    border-radius: 4px;
    padding: 10px;
  }
  ul {
    max-height: 254px;
    overflow-y: auto;
    overflow-x: hidden;
    li {
      // margin-bottom: 16px;
      & > div {
        float: left;
        margin-right: 10px;
        &:last-child {
          margin-top: 0px;
          cursor: pointer;
          margin-right: 12x;
        }
      }
      .handles {
        color: rgba(0, 0, 0, 0.65);
        font-size: 14px;
        margin-right: 10px;
        cursor: move;
      }
      .input-wrap {
        // width: calc(100% - 70px);
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
  .add-div {
    display: flex;
    justify-content: center;
  }
}
.check-wrap{
  text-align: center;
  margin-top: 4px;
}

</style>
