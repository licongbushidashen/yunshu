
<template>
  <div class="querycondition-warp">
    <div class="mappingDiv" v-if="selected.length">
      <a-row class="mappingHeader" type="flex" justify="space-between">
        <a-col :span="6" class="fieldlab">关联模型字段</a-col>
        <a-col :span="4" class="fieldlab">默认操作符</a-col>
        <a-col :span="4" class="fieldlab">常量</a-col>
        <a-col :span="6" class="fieldlab">值或当前表单字段</a-col>
        <a-col :span="2" class="fieldlab">删除</a-col>
      </a-row>
      <a-row v-for="(item, index) in selected" :key="index" type="flex" justify="space-between" class="mappingHeader">
        <a-col :span="6">
          <config-provider :locale="locale" >
            <a-select
              v-model="item.source.code"
              @select="
                (e) => findSourceOptionAndDisabled(item.source.code, false)
              "
              @change="(e) => onSourceItemChange(item)"
              :getPopupContainer="getPopupContainer"
              show-search
              :filter-option="filterOption"
            >
              <a-select-opt-group>
                <span slot="label" class="select-title">业务数据项</span>
                <template v-for="(i, index) in sourceOptions" >
                  <a-select-option
                    :key="index"
                    :value="i.value"
                    :disabled="selected.map((el)=>el.source.code).includes(i.value)"
                    v-if="!i.isSystem"
                    :title="i.label"
                  >
                    {{ i.label }}
                  </a-select-option>
                </template>
              </a-select-opt-group>
              <a-select-opt-group>
                <span slot="label" class="select-title">系统数据项</span>
                <template v-for="(i, index) in sourceOptions" >
                  <a-select-option
                    :key="index"
                    :value="i.value"
                    :disabled="selected.map((el)=>el.source.code).includes(i.value)"
                    v-if="i.isSystem"
                    :title="i.label"
                  >
                    {{ i.label }}
                  </a-select-option>
                </template>
              </a-select-opt-group>
            </a-select>
          </config-provider>
        </a-col>

        <a-col :span="4" v-if="!editable">
            <a-select default-value="eq" :disabled="[2,3].includes(item.source.type)" v-model="item.op" @change="onChange">
              <a-select-option value="eq">等于</a-select-option>
              <a-select-option value="NotEq">不等于</a-select-option>
            </a-select>
        </a-col>

        <a-col :span="4" v-if="!editable">
          <!-- <a-switch
            :checked="item.isConst"
            @change="(e) => onIsConstChange(e, item)"
          /> -->
          <a-select v-model="item.isConst" @change="onIsConstChange">
            <a-select-option :value="true">常量</a-select-option>
            <a-select-option :value="false">变量</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <template v-if="item.isConst">
            <staff-selector 
              style="width:100%" 
              v-if="[5,50,51,60,61].includes(item.source.type)"  
              v-model="item.target" @change="onChange"
              :options="getStaffSelectorOpts(item.source.type)" 
            />

            <a-date-picker
              v-else-if="3 === item.source.type "
              @change="(d,ds) => onDateChange(item.target, ds)"
            ></a-date-picker>

            <a-input-number
              v-else-if="item.source.type === 2"
              v-model="item.target"
              @change="onChange"
            ></a-input-number>

            <a-select show-search v-else-if="item.source.type === 4" v-model="item.target">
              <a-select-option :value="1">true</a-select-option>
              <a-select-option :value="0">false</a-select-option>
            </a-select>

            <a-select placeholder="请选择" show-search v-else-if="item.source.type === 0 && item.source.code === 'sequenceStatus'" v-model="item.target" @change="onChange">
              <a-select-option value="PROCESSING">进行中</a-select-option>
              <a-select-option value="COMPLETED">已完成</a-select-option>
            </a-select>

            <a-input
              v-else
              v-model="item.target"
              :placeholder="item.source.type === 3 ? '日期格式: 2019-05-10' : ''"
              @change="onChange"
            />
          </template>
          <config-provider :locale="locale" v-else>
            <a-select
              :value="item.target.code"
              :title="item.target.code"
              :allowClear="!editable"
              :options="sourceTargetOptionsMap[item.source.code]"
              @change="(e) => onTargetItemChange(e, item)"
              :getPopupContainer="getPopupContainer"
              show-search
              :filter-option="filterOption"
            ></a-select>
          </config-provider>
        </a-col>
        <a-col :span="2" >
          <a-icon type="delete" @click="remove(index)"></a-icon>
        </a-col>
      </a-row>
    </div>
    <div class="add" v-if="canAdd">
      <span>
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span @click="add()">新增条件</span>
      </span>
    </div>
    <div class="message" v-if="showMsg">
      <div v-if="isMultiRelevantInSheet">
        在子表中的关联多选控件不支持映射功能
      </div>
      <div v-else>
        请检测当前表单是否已发布，或绑定的列表
        <template v-if="editable">展示字段是否有同类型数据项！</template>
        <template v-else>是否设置了查询条件！</template>
        <!-- 请检查当前表单是否发布或绑定的列表 -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Model } from "vue-property-decorator";

import {
  textDataItemOperators,
  numberDataItemOperators,
  logicDataItemOperators,
  DataItem,
  DateItemOperatorType,
} from "./data-item";

import { Select, Row, Col, ConfigProvider } from "@h3/antd-vue";

import { DataItemType, NumberFormatType } from "@cloudpivot/form/schema";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

export interface DataitemSource {
  title: string;

  items: DataItem[];
}

export interface DataitemMappingValueItem {
  source: DataItem;
  isConst: boolean;
  target: DataItem | string | undefined;
  op: string
}

interface SelectOption {
  title?: string;
  label: string;
  value: string;
  type: DataItemType;
  disabled: boolean;
  item: DataItem;
}

@Component({
  name: "query-condition2",
  components: {
    ASelect: Select,
    ARow: Row,
    ACol: Col,
    ASelectOption: Select.Option,
    StaffSelector,
    ConfigProvider,
  },
})
export default class QueryCondition2 extends Vue {
  @Prop({
    default: false,
  })
  isMultiRelevantInSheet!: boolean;
  @Prop({
    default: {},
  })
  source!: DataitemSource;

  @Prop({
    default: {},
  })
  target!: DataitemSource;

  @Model("change")
  value!: DataitemMappingValueItem[];

  @Prop({
    default: ()=>[],
  })
  query!: DataitemMappingValueItem;

  @Prop({
    default: false,
  })
  editable!: boolean;

  taffSelectorOpts = {"selectOrg":true,"selectUser":true,"mulpitle":true,"showModel":true,"showSelect":true,"placeholder":""};

  selected: DataitemMappingValueItem[] = [];

  sourceOptions: SelectOption[] = [];

  targetOptions: SelectOption[] = [];

  sourceTargetOptionsMap: any = {};

  // canAdd = false;

  showMsg = false;

  // getTargetOptions(type: DataItemType) {
  //   return this.targetOptions.filter(p => p.type === type);
  // }

  getTargetOptions(item: DataItem) {
    return this.targetOptions.filter((p) => {
      const sameType = p.type === item.type;
      if (
        sameType &&
        (item.type === DataItemType.RelevanceForm ||
          item.type === DataItemType.RelevanceFormEx)
      ) {
        return item.relativeCode === p.item.relativeCode;
      }
      if([DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown, DataItemType.Checkbox, DataItemType.DropdownMulti].includes(item.type)) {
        return [DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(item.type) ? [DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(p.type) : [DataItemType.Checkbox, DataItemType.DropdownMulti ].includes(p.type)
      }
      return sameType;
    });
  }

  onDateChange(cond: any, dateText: string) {
    cond.value = dateText;
    this.onChange();
  }

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

  mapToOption(x: DataItem) {
    const label = x.parentCode
      ? `${x.name}[${x.parentCode}.${x.code}]`
      : `${x.name}[${x.code}]`;
          const value = x.parentCode
      ? `${x.parentCode}.${x.code}`
      : `${x.code}`;

    return {
      // value: x.code,
      value: value,
      label,
      type: x.type,
      disabled: false,
      isSystem: x.isSystem,
      item: x,
    };
  }

  mapToDataItem(x: SelectOption): DataItem {
    // return {
    //   code: x.value,
    //   name: x.label,
    //   type: x.type
    // } as any;
    return x.item;
  }

  @Watch("source", {
    immediate: true,
    deep: true
  })
  onSourceChange(source: DataitemSource) {
    if (!source) {
      return;
    }
    console.log('aaa', source);
    
    this.sourceOptions = source.items.map(this.mapToOption).filter(el => ![6, 8, 10, 13, 15].includes(el.type));
    this.onTargetChange(this.target);
    this.showMsg = !this.canAdd;
  }

  @Watch("target", {
    immediate: true,
    deep: true
  })
  onTargetChange(target: DataitemSource) {
    if (!target) {
      return;
    }
    this.targetOptions = target.items
      .filter((item) => {
        if (this.editable) {
          return !item.isSystem;
        }
        return true;
      })
      .map(this.mapToOption);
  }

  @Watch("value", {
    immediate: true,
  })
  onValueChange(val: DataitemMappingValueItem[]) {
    if (val) {
      setTimeout(() => {
        this.selected = JSON.parse(JSON.stringify(val));
        let map = {} as any;
        this.selected.forEach((item) => {
          // @ts-ignore
          this.findSourceOptionAndDisabled(item.source.code, true);
          if (typeof item.target !== "string") {
            // @ts-ignore
            this.findTargetOptionAndDisabled(item.target.code, true);
          }
          let temp = this.getTargetOptions(item.source);
          temp.forEach((el) => {
            el.title = el.label;
          });
          map[item.source.code] = temp;
        });
        this.sourceTargetOptionsMap = map;
      }, 10);
    }
  }

  onIsConstChange(checked: string, item: DataitemMappingValueItem) {
    if (checked === 'true') {
      if (typeof item.target !== "string") {
        // @ts-ignore
        this.findTargetOptionAndDisabled(item.target.code, false);
      }
      item.target = '';
    } else {
      (item as any).target = {};
    }
    // item.isConst = checked;
    this.onChange();
  }

  findSourceOptionAndDisabled(code: string, disabled: boolean) {
    const so = this.sourceOptions.find((soItem) => soItem.value === code);
    if (so) {
      so.disabled = disabled;
    }
  }

  onSourceItemChange(item: DataitemMappingValueItem) {
    this.findSourceOptionAndDisabled(item.source.code, true);
    const item2 = this.source.items.find((x) => x.code === item.source.code);
    if (item2) {
      item.source = Object.assign({}, item2);

      const targetOpts = this.getTargetOptions(item2);

      if (typeof item.target !== "string") {
        const target = item.target;
        if (
          targetOpts.length &&
          // @ts-ignore
          !targetOpts.some((x) => x.value === target.code)
        ) {
          // @ts-ignore
          this.findTargetOptionAndDisabled(target.code, false);
          item.target = this.mapToDataItem(targetOpts[0]);
        } else {
          // @ts-ignore
          this.findTargetOptionAndDisabled(target.code, false);
          item.target = {
            code: "",
          } as any;
        }
      }

      this.sourceTargetOptionsMap[item2.code] = targetOpts;
    }
    let itemTarget:any = {}
    if(item.isConst) {
      switch (item.source.type) {
        case DataItemType.StaffSingle:
        case DataItemType.DeptSingle:
          itemTarget = []
          break;
        case DataItemType.DeptMulti:
        case DataItemType.StaffMulti:
        case DataItemType.StaffDeptMix:
          itemTarget = []
          break;
        default:
          itemTarget = ''
          break;
      }
      item.target = itemTarget as DataItem
    }
    this.onChange();
  }

  findTargetOptionAndDisabled(code: string, disabled: boolean) {
    const so = this.targetOptions.find((soItem) => soItem.value === code);
    if (so) {
      so.disabled = disabled;
    }
  }

  onTargetItemChange(selectedCode: string, item: DataitemMappingValueItem) {
    // allowClear:true时，点击清楚item.target.code为undefined，
    // 但我们需要将选中的选项disabled设为false

    if (typeof item.target !== "string") {
      // @ts-ignore
      if (item.target.code !== selectedCode) {
        // @ts-ignore
        if (item.target.code) {
          // @ts-ignore
          this.findTargetOptionAndDisabled(item.target.code, false);
        }
        // @ts-ignore
        item.target.code = selectedCode;
      }
    }
    this.onChange();
  }

  findNext() {
    const sourceItems = this.sourceOptions.filter((op) => !op.disabled);

    if (sourceItems.length < 0) {
      return;
    }

    let targetItem: any;
    let sourceItem: any;
    for (const option of sourceItems) {
      sourceItem = option;
      targetItem = this.getTargetOptions(option.item).find((x) => !x.disabled);
      if (targetItem) {
        break;
      }
    }

    if (!targetItem) {
      return;
    }

    return [sourceItem, targetItem];
  }

  get canAdd() {
    const next = this.findNext();
    console.log('next===>',!!next)
    return !!next;
  }

  add() {
    const next = this.findNext();
    if (!next) {
      return;
    }

    const sourceItem = next[0];
    const targetItem = next[1];

    sourceItem.disabled = true;

    this.selected.push({
      source: this.mapToDataItem(sourceItem),
      isConst: false,
      target: {} as DataItem,
      op: 'eq'
    });

    this.onChange();
  }

  remove(index: number) {
    const item = this.selected[index];
    // @ts-ignore
    this.findSourceOptionAndDisabled(item.source.code, false);
    if (typeof item.target !== "string") {
      // @ts-ignore
      this.findTargetOptionAndDisabled(item.target.code, false);
    }
    this.selected.splice(index, 1);
    this.onChange();
  }

  onChange() {
    this.$emit("change", this.selected);
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

  getPopupContainer(triggerNode:any) {
    return triggerNode.parentNode;
  }

  filterOption(input, option) {
    return option.componentOptions.children && 
    option.componentOptions.children[0].text &&
    option.componentOptions.children[0].text.toLowerCase().indexOf(input.trim().toLowerCase()) >= 0
  }

}
</script>

<style lang="less" scoped>
  .querycondition-warp {
    background: #F4F5F8;
    padding: 10px;
    padding-left: 20px;
    border-radius: 4px;
  }
  .mappingHeader {
    margin: 8px 0;
  }

  .message {
    margin-top: 2em;
  }
  .add {
    color: #00C293;
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
</style>