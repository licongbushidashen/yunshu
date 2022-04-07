<template>
  <a-modal
    title="选项设置"
    width="640px"
    :visible="true"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <a-row
      class="rowStyle"
      :style="optionsType === 3 ? 'margin-bottom: 16px' : 'margin-bottom: 0px'"
    >
      <a-col :span="4" style="line-height: 32px">选项来源</a-col>
      <a-col :span="20" class="radio-col" style="height: 32px">
        <a-radio-group name="radioGroup" v-model="optionsType">
          <a-radio :value="1">自定义</a-radio>
          <a-radio
            v-if="
              [
                'dropdownOption',
                'dropdownMultiOption',
                'radioOption',
                'checkboxOption',
              ].includes(modalData.type)
            "
            :value="2"
            >业务模型</a-radio
          >
          <a-radio :value="3">数据字典</a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row v-if="optionsType === 1" class="radioCheckbox">
      <template
        class="radio-group"
        v-if="
          modalData.type === 'radioOption' ||
          modalData.type === 'dropdownOption'
        "
        ref="condionwrap"
      >
        <a-radio-group
          :value="defaultValue"
          @change="radioChange"
          style="width: 100%; max-height: 240px; overflow: auto"
        >
          <draggable :list="options" :options="dragOptions" handle=".handles">
            <a-row
              v-for="(modulem, index) in options"
              :key="index"
              class="rowStyle"
            >
              <a-col :span="2" style="text-align: center">
                <a-radio
                  v-if="!showModel"
                  class="radio-item"
                  :value="index"
                ></a-radio>
              </a-col>
              <a-col :span="20">
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
              </a-col>
              <a-col :span="2" style="text-align: center">
                <span class="icon aufontAll handles">&#xe63e;</span>
                <span class="delete" @click="deleteRow(index)">
                  <a-icon type="delete" />
                </span>
              </a-col>
            </a-row>
          </draggable>
        </a-radio-group>
      </template>
      <template
        v-else-if="
          modalData.type === 'checkboxOption' ||
          modalData.type === 'dropdownMultiOption'
        "
        ref="condionwrap"
      >
        <draggable :list="options" :options="dragOptions" handle=".handles">
          <a-row
            v-for="(modulem, index) in options"
            :key="index"
            class="rowStyle"
          >
            <a-col :span="2" style="text-align: center">
              <a-checkbox v-model="modulem.default" />
            </a-col>
            <a-col :span="20">
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
            </a-col>
            <a-col :span="2" style="text-align: center">
              <span class="icon aufontAll handles">&#xe63e;</span>
              <span @click="deleteRow(index)">
                <a-icon type="delete" />
              </span>
            </a-col>
          </a-row>
        </draggable>
      </template>
      <a-row class="option-row">
        <a-col :span="24">
          <span @click="addRow" class="addBtn">
            <i class="icon aufontAll h-icon-all-plus-o"></i>
            <span>{{ $t("languages.Apps.FormDesignPage.AddOptins") }}</span>
          </span>
          <ext-batch-add-radio-modal
            :options.sync="options"
            :propStyle="propStyle"
          ></ext-batch-add-radio-modal>
        </a-col>
      </a-row>
    </a-row>
    <a-row v-else-if="optionsType === 2">
      <a-row class="rowStyle">
        <a-col :span="4">业务模型</a-col>
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
      <a-row class="rowStyle">
        <a-col :span="4">数据项</a-col>
        <a-col :span="12">
          <config-provider :locale="locale">
            <a-select
              style="width: 100%"
              :disabled="!bizModel"
              v-model="sheetDataItem"
              :showSearch="true"
              @change="onChange"
              optionFilterProp="children"
            >
              <template v-for="item in targetDataItems">
                <a-select-option
                  :value="item.code"
                  :key="item.code"
                  :title="item.name+'['+item.code+']'"
                  >{{ `${item.name}[${item.code}]` }}</a-select-option
                >
              </template>
            </a-select>
          </config-provider>
        </a-col>
      </a-row>
      <a-row class="rowStyle">
        <a-col :span="4">排序数据项</a-col>
        <a-col :span="12">
          <config-provider :locale="locale">
            <a-select
              style="width: 100%"
              allowClear
              :disabled="!bizModel"
              v-model="orderByFields"
              :showSearch="true"
              optionFilterProp="children"
            >
              <template v-for="item in targetDataItems">
                <a-select-option
                  :value="item.code"
                  :key="item.code"
                  :title="item.name+'['+item.code+']'"
                  v-if="sortFilterType.includes(item.propertyType)"
                  >{{ `${item.name}[${item.code}]` }}</a-select-option
                >
              </template>
            </a-select>
          </config-provider>
        </a-col>
      </a-row>

      <a-row v-if="orderByFields" class="rowStyle">
        <a-col :span="4">排序规则</a-col>
        <a-col :span="12" class="radio-col">
          <a-radio-group name="radioGroup" v-model="orderType">
            <a-radio :value="1">升序 A-Z</a-radio>
            <a-radio :value="2">降序 Z-A</a-radio>
            <a-radio :value="3">默认</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>

      <a-row type="flex" class="rowStyle">
        <a-col :span="4">查询条件</a-col>
      </a-row>

      <div class="condition-wrap">
        <div v-if="conditionList.length">
          <a-row class="conditionHeader" type="flex" justify="space-between">
            <a-col :span="8" class="fieldlab">查询数据项</a-col>
            <a-col :span="4" class="fieldlab">值类型</a-col>
            <a-col :span="8" class="fieldlab">值</a-col>
            <a-col :span="2" class="fieldlab">删除</a-col>
          </a-row>
          <a-row
            v-for="(condition, index) in conditionList"
            :key="condition.key"
            type="flex"
            justify="space-between"
            class="conditionHeader"
          >
            <a-col :span="8">
              <config-provider :locale="locale">
                <a-select
                  style="width: 100%"
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
              </config-provider>
            </a-col>
            <!-- 操作符号 -->
            <a-col :span="4">
              <a-select v-model="condition.operator.val">
                <a-select-option
                  v-for="(item, index) in condition.operator.listOpt"
                  :key="index"
                  :value="item.type"
                  >{{ item.val }}</a-select-option
                >
              </a-select>
            </a-col>
            <a-col :span="8">
              <config-provider
                :locale="locale"
                v-if="condition.operator.val == '=='"
              >
                <a-select
                  style="width: 100%"
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
            <a-col :span="3" style="text-align: center; padding-top: 4px">
              <span
                class="delete"
                @click="deleteCondition(index)"
                v-if="conditionList.length >= 1"
              >
                <a-icon type="delete" />
              </span>
            </a-col>
          </a-row>
        </div>
        <div class="add">
          <span>
            <span>
              <i class="icon aufontAll h-icon-all-plus-o"></i>
            </span>
            <span
              @click="
                () => {
                  this.addCondition();
                }
              "
              >新增条件</span
            >
          </span>
        </div>
      </div>

      <a-row
        v-if="['radioOption', 'checkboxOption'].includes(modalData.type)"
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
        <a-col class="opt-setting" @click="handleShowOpt">{{selecteds && selecteds.length > 0 ? '已设置' : '未设置'}}</a-col>
      </a-row>
      <a-row
        v-if="['radioOption', 'checkboxOption'].includes(modalData.type)"
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
    </a-row>

    <div v-else>
      <data-dictionaries
        ref="DataDictionariesRef"
        :modalData="dataDictionaryData"
      ></data-dictionaries>
    </div>

    <template slot="footer">
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleOk">保存</a-button>
    </template>
    <a-modal
      width="680px"
      title="选项设置"
      :visible="showOpt"
      @cancel="closeOptModal"
    >
      <div class="select-tips">当前数据项<span class="total">{{totalElements}}</span>条 您已选择<span class="selected">{{selecteds && selecteds.length}}</span>条<span  v-if="totalElements > 200 && selecteds && selecteds.length < 200">,还可以选择<span class="total">{{200-selecteds && selecteds.length}}</span>条</span></div>
      <a-table
        :dataSource="dataSource"
        :rowSelection="columns.length ? rowSelection : null"
        :columns="columns"
        :pagination="false"
        :scroll="{ y: 485 }"
        :rowKey="(record, index) => record.data.id"
        :locale="{emptyText: getEmptyText()}"
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
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { sliceString } from "@cloudpivot/form/utils/utils";
import BizModelsSelector from "./biz-models-selector/index.vue";
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
  name: "BizOptionDataModel2",
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
export default class BizOptionDataModel2 extends Vue {
  pageSizeOptions: Array<string> = [
    '10',
    '20',
    '50',
    '100',
    '200'
  ]
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop() showModel!: any;

  @Prop({
    default: () => ({}),
  })
  dataItem!: DataItemState;

  optionsType = 1;

  showOpt = false;

  orderType = 1;

  filterType = 0;

  bizModel = "";

  searchKey = '';

  targetDataItems: any[] = [];

  currentDataItems: any = [];

  sheetDataItem = "";

  orderByFields = "";

  filtersType = [6, 7, 8, 10];

  sortFilterType = [0, 2, 3, 12];

  visibleIncrease: boolean = false;

  increaseValue: string = "";

  originData: any = [];

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

  getEmptyText(){
    return localStorage.getItem('locale') === 'en' ? 'No Data' : '暂无数据'
  }

  dataSource: any = [];

  selecteds: any = [];

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

  totalElements = 0

  page = 0

  pageSize = 10

  // init =  false

  propStyle: any = {
    display: "inline-block",
    color: "#2970FF",
  };

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
  // @Watch('conditionList', {immediate: false, deep: true})
  // onConditionListChange(val, oldValue) {
  //   console.log('www', val)
  //   if(val.length > 0) {
  //     this.selecteds = [];
  //     this.rowSelection.selectedRowKeys = []
  //   }
  // }

  showSizeChange(current: number, size: number) {
    this.pageSize = size;
    this.onSearch();
  }

  onChange() {
    this.selecteds = [];
    this.rowSelection.selectedRowKeys = []
  }

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

  mounted() {
    const _items = dataitemStore.getDataItems(this).filter((x) => x.used);
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
    items = items.filter((i) => !i.isSystem);

    this.currentDataItems = items.filter(
      (res) => res.type !== DataItemType.Sheet
    );
  }

  async handleShowOpt() {
    console.log(this.modalData, this.sheetDataItem)
    
    this.dataSource = await this.getOptData();
    this.showOpt = true;
  }

  closeOptModal() {
    console.log('this.selecteds', this.selecteds)
    if(this.selecteds && this.selecteds.length > 200) {
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
        propertyType: this.modalData.attributes[0].dataItem.type,
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

  // handleOptSave() {}

  onSelect(record: any, selected: boolean, selectedRows: any[]) {
    if(this.selecteds.length > 0) {
      if(selected) {
        this.selecteds = [...this.selecteds, record]
      }else {
        this.selecteds = this.selecteds.filter(item => {
          return item.data.id != record.data.id
        })
      }
    }else {
      this.selecteds = [record]
    }
    // const current = this.dataSource.filter((item) =>
    //     this.rowSelection.selectedRowKeys.includes(item.id)
    //   )
    //   this.selectedRows = [...this.selectedRows, ...current]
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

  async pageChange(page: number, pageSize: number) {
    this.page = page - 1;
    this.pageSize = pageSize;
    this.dataSource = await this.getOptData();
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
        propertyType: this.modalData.attributes[0].dataItem.type,
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
    console.log(row.target)
    console.log(row.current)
    const cur = JSON.parse(JSON.stringify(this.currentDataItems));
    console.log(cur)
    const tar: any = row.target.listOpt.find((res) => {
      return res.code === row.target.val;
    });
    console.log(tar)
    if (isClear) {
      row.current.val = "";
      row.current.pval = "";
    }
    row.current.listOpt = cur
      .filter((item) => {
        if (item.code === row.current.val) {
          return true;
        }
        return item.code !== this.dataItem.code;
      })
      .filter((item) => {
        if (item.code === row.current.val || row.target.val === item.code) {
          return true;
        }

        if (
          item.type === DataItemType.RelevanceForm ||
          item.type === DataItemType.RelevanceFormEx
        ) {
          return (
            item.type === tar.propertyType &&
            item.relativeCode === tar.relativeCode
          );
        } else if (item.type === DataItemType.StaffDeptMix) {
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
          // 兼容历史数据显示名称-暂定不处理
          // if([0, 1, 12, 14, 13, 15].includes(tar.propertyType)){
          //   return [0, 1, 12, 14, 13, 15].includes(item.type) || item.type === tar.propertyType;
          // }else{
          //   return item.type === tar.propertyType;
          // }
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
    // if(this.init) {
    //   this.$watch('conditionList', () => {
    //     this.selecteds = [];
    //     this.rowSelection.selectedRowKeys = [];
    //   console.log('sd')
    //   }, {deep: true})
    //   this.init = false
    // }
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
      default: false,
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
  ];;

  @Watch('optionsType')
  onOptionsTypeChange(val){
    if(val === 1){
      this.options = [ { "default": false, "value": "" }, { "default": false, "value": "" }, { "default": false, "value": "" } ]
    }
  }

  dataDictionaryData: any = {}; // 数据字典数据
  defaultValue: number = -1;
  hasDefault = false;
  defaultVal: string = "";
  created() {
    const data = this.modalData.data;
    console.log(this.modalData);
    this.defaultVal = data.default;
    if (data.value) {
      try { 
        const obj = JSON.parse(data.value);
        console.log('---------',obj)
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
          // this.init = true;
          this.addCondition(item);
        });
      }
      console.log(res);
    });
    this.selecteds = obj.labels || [];
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
      backData.default = this.defaultVal;
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
        default: false,
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
    if (backData.value === "") {
      this.$message.error("自定义选项不能为空！");
      return;
    }
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
    let obj = {
      schemaCode: this.bizModel,
      sheetDataItem: this.sheetDataItem,
      orderByFields: this.orderByFields,
      orderType: this.orderType,
      appCode: this.appCode,
      appFunctionCode: this.appFunctionCode,
      condition,
      labels: []
    };

    //单选，复选业务模型数据
    let newVal : any = {};
    if(["radioOption", "checkboxOption"].includes(this.modalData.type)) {
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
      default: this.options.length === 0,
      value: "",
    };
    this.options.push(obj);
    console.log(this.options, "this.options");
    setTimeout(() => {
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
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
<style lang="less" scoped>
.condition-wrap {
  background: #f4f5f8;
  padding: 10px;
  border-radius: 4px;
}
.conditionHeader {
  margin: 10px 0;
}
.add {
  color: #00c293;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  line-height: 48px;
  span {
    margin-top: 16px;
    margin-right: 8px;
  }
}
.fieldlab {
  color: #000;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
}
.rowStyle {
  line-height: 32px;
  margin: 10px 0;
  .opt-setting {
    color: #17bc94;
    cursor: pointer;
  }
}
.radioCheckbox {
  background: rgba(244, 245, 248, 0.65);
  border-radius: 4px;
  margin-top: 5px;
}
.handles {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  margin-right: 10px;
  cursor: move;
}
.addBtn {
  display: inline-block;
  color: #17bc94;
  margin-right: 20px;
}
.radio-col {
  line-height: 32px;
  [radiogroup] {
    line-height: 32px;
  }
  .ant-radio-group {
    overflow: hidden;
    line-height: 32px;
  }
  .addBtn {
    display: inline-block;
    color: #17BC94;
    margin-right: 20px;
    cursor: pointer;
  }
  .radio-col {
    line-height: 32px;
  }
}
.option-row {
  text-align: center;
  margin-bottom: 10px;
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
.pagination {
  margin-top: 10px;
  display: flex;
  flex-direction: row-reverse;
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
/deep/ .ant-pagination {
  display: flex;
}
</style>
