<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.OptionSetting')"
    width="536px"
    :visible="true"
    @cancel="closeModal"
    @ok="handleOk"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="option-wrap">
      <a-row class="radio-row">
        <a-col :span="6">选项来源</a-col>
        <a-col :span="18" class="radio-col">
          <a-radio-group name="radioGroup" v-model="optionsType">
            <a-radio :value="1">自定义</a-radio>
            <a-radio :value="2">业务模型</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
    </div>
    <div class="add-option-wrap" v-if="optionsType === 1">
      <a-row>
        <a-col :span="6">选项</a-col>
        <a-col :span="18">
          <div
            class="radio-group"
            v-if="this.modalData.type === 'bizRadioOption'"
            ref="condionwrap"
          >
            <a-radio-group :value="defaultValue" @change="radioChange">
              <div
                v-for="(modulem, index) in options"
                :key="index"
                class="radio-item-wrap clearfix"
              >
                <div class="radio-wrap">
                  <a-radio class="radio-item" :value="index"></a-radio>
                </div>
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
                <div class="delete-wrap">
                  <span class="delete" @click="deleteRow(index)">
                    <i class="icon aufontAll h-icon-all-delete-o"></i>
                  </span>
                </div>
              </div>
            </a-radio-group>
          </div>
          <ul ref="condionwrap" v-else-if="this.modalData.type === 'checkboxOption'">
            <li class="clearfix" v-for="(modulem, index) in options" :key="index">
              <div class="default">
                <a-checkbox v-model="modulem.default" />
              </div>
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
              <div>
                <span @click="deleteRow(index)">
                  <i class="icon aufontAll h-icon-all-delete-o"></i>
                </span>
              </div>
            </li>
          </ul>
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
      <div class="add-div">
        <div class="add" @click="addRow">
          <span>
            <i class="icon aufontAll h-icon-all-plus-o"></i>
          </span>
          <span>{{ $t('languages.Apps.FormDesignPage.AddOptins') }}</span>
        </div>
        <ext-batch-add-radio-modal :options.sync="options"></ext-batch-add-radio-modal>
      </div>
    </div>
    <div v-else>
      <a-row>
        <a-col :span="6">业务模型</a-col>
        <a-col :span="18">
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
        <a-col :span="6">数据项</a-col>
        <a-col :span="18">
          <config-provider :locale="locale">
            <a-select style="width: 100%" :disabled="!bizModel" v-model="sheetDataItem">
              <template v-for="item in targetDataItems">
                <a-select-option
                  :value="item.code"
                  :key="item.code"
                  v-if="item.propertyType === filterType"
                >{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </config-provider>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="6">排序数据项</a-col>
        <a-col :span="18">
          <config-provider :locale="locale">
            <a-select style="width: 100%"
                      allowClear
                      :disabled="!bizModel"
                      v-model="orderByFields">
              <template v-for="item in targetDataItems">
                <a-select-option
                    :value="item.code"
                    :key="item.code"
                    v-if="sortFilterType.includes(item.propertyType)"
                >{{ item.name}}</a-select-option>
              </template>
            </a-select>
          </config-provider>
        </a-col>
      </a-row>

      <a-row v-if="orderByFields">
        <a-col :span="6">排序规则</a-col>
        <a-col :span="18" class="radio-col">
          <a-radio-group name="radioGroup" v-model="orderType">
            <a-radio :value="1">升序 A-Z</a-radio>
            <a-radio :value="2">降序 Z-A</a-radio>
            <a-radio :value="3">默认</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="6">查询条件</a-col>
        <a-col :span="18" class="condition-col">
          <a-row v-show="conditionList.length > 0">
            <a-col :span="8">查询数据项</a-col>
            <a-col :span="8">值类型</a-col>
            <a-col :span="8">值</a-col>
          </a-row>
          <div v-for="(condition, index) in conditionList" :key="condition.key" class="select-wrap">
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
              >{{ `${item.name}[${item.code}]` }}</a-select-option>
            </a-select>
            <!-- 操作符号 -->
            <a-select v-model="condition.operator.val">
              <a-select-option
                v-for="(item, index) in condition.operator.listOpt"
                :key="index"
                :value="item.type"
              >{{ item.val }}</a-select-option>
            </a-select>
            <!-- 当前表单的 -->
            <config-provider :locale="locale" v-if="condition.operator.val == '=='">
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
                >{{ `${item.name}[${item.code}]` }}</a-select-option>
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
            <div class="delete-wrap">
              <span class="delete" @click="deleteCondition(index)">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </div>
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
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { sliceString } from "@cloudpivot/form/utils/utils";
import BizModelsSelector from "./biz-models-selector/index.vue";
import { components } from "@cloudpivot/h3-list";
import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";
import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";
import { listApi } from "@cloudpivot/api";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import ExtBatchAddRadioModal from './biz-batch-radio-option.vue';
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

@Component({
  name: "AddRadioModal",
  components: {
    BizModelsSelector,
    StaffSelector,
    Input,
    InputNumber,
    DatePicker,
    ASwitch: Switch,
    ConfigProvider,
    ExtBatchAddRadioModal
  },
})
export default class AddRadioModal extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({
    default: () => ({}),
  })
  dataItem!: DataItemState;

  optionsType = 1;

  orderType = 1;

  filterType = 0;

  bizModel = "";

  targetDataItems: any[] = [];

  currentDataItems: any = [];

  sheetDataItem = "";

  orderByFields = "";

  filtersType = [6, 7, 8, 10];

  sortFilterType = [0, 2, 3, 12];

  visibleIncrease: boolean = false;

  increaseValue:string = '';

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
    this.getTargetItem(this.bizModel).then((res) => {
    });
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
    console.log(this, "dddd");
    console.log(this.modalData.type, "ssss");

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

    this.currentDataItems = items.filter((res) => res.type !== 8);
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
    row.current.listOpt = cur.filter(item => {
        return item.code !== this.dataItem.code
      }).filter((item) => {
      if (item.type === 9 || item.type === 11) {
        return (
          item.type === tar.propertyType &&
          item.relativeCode === tar.relativeCode
        );
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
        case 0:
          comName = "Input";
          break;
        case 2:
          comName = "InputNumber";
          break;
        case 3:
          comName = "DatePicker";
          break;
        case 4:
          comName = "ASwitch";
          break;
        case 5:
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
  defaultValue: number = -1;
  hasDefault = false;
  created() {
    const data = this.modalData.data;
    if (data.value) {
      try {
        const obj = JSON.parse(data.value);
        this.setBizmodel(data);
        this.optionsType = 2;
        this.hasDefault = true;
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
    if (this.optionsType === 1) {
      backData = this.customBack();
    } else {
      backData = this.bizmodeBack();
      if (!backData) {
        return;
      }
    }

    this.$emit("backData", backData);
  }

  /**
   * 批量设置自定义选项
   */
  handleBatchOk() {
    if (!this.increaseValue) {
      this.handleBatchClose()
      return false
    }

    const arrValue:string[] = this.increaseValue.split(/[(\r\n)\r\n]+/);
    const length:number = this.options.length
    const el: any = this.$refs.condionwrap;
    const obj:object[] = []
    arrValue.forEach((value:string, index:number) => {
      obj.push({
        default: length === 0 ? true : false,
        value: value
      })
    })
    this.options = [...this.options, ...obj];
    // this.increaseValue = '';
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 10);
    this.handleBatchClose()
  }

  // 关闭批量设置自定义选项
  handleBatchClose() {
    this.visibleIncrease = false
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
    };
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
    this.visibleIncrease = !this.visibleIncrease
  }
  /**
   * 删除行
   */
  deleteRow(index: number) {
    // console.log('delete' ,index ,this.defaultValue ,this.options)
    // 判读当前想是否为被选中项，如果是，则将选中项清空
    if(this.defaultValue === index) {
      this.defaultValue = -1
    }
    // 判断当前删除项是否为当前被选中项的前面，如果是，则被选中项要减去1
    if(index < this.defaultValue && this.defaultValue >= 1) {
      this.defaultValue--
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
.ant-row {
  margin-bottom: 20px;
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
      /deep/ .h3-organization__label .h3-organization-selected-name{
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
  .add-div {
      display: flex;
      justify-content: center;
    }
}
</style>
