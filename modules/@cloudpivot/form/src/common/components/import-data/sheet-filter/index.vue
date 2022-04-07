
<template>
  <div>
    <div class="query-form">
      <div
        :class="$i18n.locale === 'zh' ? 'query-form-left' : 'query-form-left en'"
        ref="queryFormLeft"
      >
        <a-form layout="inline">
          <template v-for="item of filterList">
            <a-form-item :label="getKey(item)" :colon="false" ref="queryForm1" :key="item.code">
              <template v-if="item.formPropertyType === 1">
                <!-- 短文本 -->
                <a-input
                  :placeholder="getKey(item)"
                  v-model="queryData[item.code]"
                  class="workflow-name-input"
                  maxlength="100"
                ></a-input>
              </template>
              <template v-else-if="item.formPropertyType === 4">
                <!-- 数值 -->
                <a-input
                  :placeholder="getKey(item)"
                  v-model="queryData[item.code]"
                  class="workflow-name-input"
                  type="number"
                  min="0"
                ></a-input>
              </template>
              <template v-else-if="item.formPropertyType === 3">
                <!-- 日期 -->
                <a-date-picker
                  style="min-width:0px;"
                  v-model="queryData[item.code]"
                  :showTime="true"
                  :format="setFormat(item.code)"
                  :valueFormat="setFormat(item.code)"
                  :placeholder="getKey(item)"
                />
              </template>
              <template v-else-if="item.formPropertyType === 8">
                <!-- 逻辑 -->
                <a-select
                  :getPopupContainer="getPopupContainer"
                  v-model="queryData[item.code]"
                  placeholder="请选择"
                >
                  <a-select-option value="true">true</a-select-option>
                  <a-select-option value="false">false</a-select-option>
                </a-select>
              </template>
              <template v-else-if="item.formPropertyType === 50 || item.formPropertyType === 51" >
                <!-- 选人控件 -->
                <StaffSelector
                  class="workflow-name-input"
                  v-model="queryData[item.code]"
                  :options="setMulti(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template v-else-if="item.formPropertyType === 60" >
                <!-- 选人控件 -->
                <StaffSelector
                  class="workflow-name-input"
                  v-model="queryData[item.code]"
                  :options="setMulti2(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template v-else-if="item.formPropertyType === 61" >
                <!-- 选人控件 -->
                <StaffSelector
                  class="workflow-name-input"
                  v-model="queryData[item.code]"
                  :options="setMulti3(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template v-else-if="item.formPropertyType === 62" >
                <!-- 选人控件 -->
                <StaffSelector
                  class="workflow-name-input"
                  v-model="queryData[item.code]"
                  :options="setMulti4(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template v-else-if="item.formPropertyType === 80">
                <!-- 关联表单单选 -->
                <a-select
                  :getPopupContainer="getPopupContainer"
                  v-model="queryData[item.code]"
                  show-search
                  :allowClear="true"
                  placeholder="请选择"
                >
                  <a-select-option
                    v-for="s in RelevanceFormData[item.code]"
                    :key="s.id"
                    :value="s"
                  >{{s.name}}</a-select-option>
                </a-select>
              </template>
              <template v-else-if="item.formPropertyType === 81">
                <!-- 关联表单多选选 -->
                <a-select
                  :getPopupContainer="getPopupContainer"
                  mode="multiple"
                  :maxTagCount="2"
                  v-model="queryData[item.code]"
                  show-search
                  placeholder="请选择"
                >
                  <a-select-option
                    v-for="s in RelevanceFormData[item.code]"
                    :key="s.id"
                    :value="s"
                  >{{s.name}}</a-select-option>
                </a-select>
              </template>
              <template v-else>
                <!-- 其他 -->
                <a-input
                  :placeholder="getKey(item)"
                  v-model="queryData[item.code]"
                  class="workflow-name-input"
                  maxlength="100"
                ></a-input>
              </template>
            </a-form-item>
          </template>
        </a-form>
      </div>
      <div class="query-form-right">
        <a-button @click="reset">{{ $t('cloudpivot.flowCenter.pc.reset') }}</a-button>
        <a-button type="primary" @click="search">{{ $t('cloudpivot.flowCenter.pc.search') }}</a-button>
      </div>
    </div>
    <div class="filter-mask" @click="closeQueryItem"></div>
  </div>
</template>


<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import {
  Button,
  Icon,
  Form,
  Input,
  TreeSelect,
  Select,
  DatePicker,
  Cascader,
} from '@h3/antd-vue';

import formPc from '@cloudpivot/form/src/renderer/components/pc';
import { listApi } from '@cloudpivot/api';
import * as utils from '@cloudpivot/common/src/utils/pc/utils';
import date from '@cloudpivot/common/src/utils/date';

@Component({
  name: 'query-workitem',
  components: {
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
    ATreeSelect: TreeSelect,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    StaffSelector: formPc.StaffSelector,
  },
})
export default class QueryWorkitem extends Vue {
  @Prop() data!: Array<any>;
  @Prop() searchs!: object;

  @Prop() datatype!: Array<any>;

  filterList: any[] = [];
  // 选人控件已选人员、部门集合
  selectedValue: any[] = [];

  // 展示选人控件弹窗
  showSelector: boolean = false;

  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  // 支持类型：短文本、日期、数值、选人控件、逻辑、关联表单
  queryData: any = {};
  queryType: any = {};
  queryDataCopy: any = {};
  RelevanceFormData: any = {};
  nameObj: any = {};

  async mounted() {
    let _data = this.data
    try {
      if(typeof this.data === 'string'){
        _data = JSON.parse(this.data)
      }
    } catch (error) {
      
    }
    this.filterList = _data.filter((d: any) => d.checked);
    this.filterList.forEach(async (d: any) => {
      this.$set(
        this.queryData,
        d.code,
        d.formPropertyType === 81 ? undefined : ''
      );
      this.$set(this.queryType, d.code, d.formPropertyType);
      this.$set(this.nameObj, d.code, { name: d.name, name_i18n: d.name_i18n });
      if (d.formPropertyType === 80 || d.formPropertyType === 81) {
        await this.getQueryList(d.relativeCode, d.code);
      }
    });
    this.queryDataCopy = JSON.parse(JSON.stringify(this.queryData));
  }

  @Watch('searchs')
  onsearchs(v) {
    this.queryData = v;
  }

  resetFields() {
    this.queryData = this.queryDataCopy;
  }

  // 重置
  reset() {
    this.resetFields();
    this.$emit('reset', this.queryDataCopy);
  }

  search() {
    let list = {};
    console.log(this.queryData)

    for (let key in this.queryData) {
      if ([50, 51, 81].includes(this.queryType[key])) {
        this.queryData[key] && Array.isArray(this.queryData[key]) && this.queryData[key].length
          ? (list[key] = {
              type: this.queryType[key],
              value: this.queryData[key],
            })
          : '';
      } else if ([80].includes(this.queryType[key])) {
        this.queryData[key] && Object.keys(this.queryData[key]).length
          ? (list[key] = {
              type: this.queryType[key],
              value: this.queryData[key],
            })
          : '';
      } else {
        this.queryData[key] && (this.queryData[key] + '').trim()
          ? (list[key] = {
              type: this.queryType[key],
              value: this.queryData[key],
            })
          : '';
      }
    }
    this.$emit('search', list, this.nameObj, this.queryData);
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  // 获取关联表单数据
  getQueryList(schemaCode, code) {
    const obj: any = {
      schemaCode,
      mobile: false,
      page: 0,
      size: 1000,
      filters: [],
    };
    listApi.getQueryList(obj).then((res) => {
      if (res.errcode === 0) {
        const data = res.data.content.map((x: any) => x.data);
        this.$set(this.RelevanceFormData, code, data);
      } else {
        this.$set(this.RelevanceFormData, code, []);
      }
    });
  }

  // 国际化
  getKey(cur: any) {
    let name: any = cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[(this as any).$i18n.locale]) {
        name = name_i18n[(this as any).$i18n.locale];
      }
    }
    return name;
  }

  // 获取日期控件的Format
  setFormat(code): string {
    const find = this.datatype.find((d: any) => d.key === code);
    if (find) {
      return find.options.format;
    }
    return 'YYYY-MM-DD';
  }

  // 获取选人控件的multi
  setMulti(code): object {
    const find = this.datatype.find((d: any) => d.key === code);
    if (find) {
      return {
        selectOrg: false,
        selectUser: true,
        mulpitle: find.options.multi ? JSON.parse(find.options.multi) : false,
        showModel: true,
        showSelect: true,
        placeholder: '请选择',
        // maxTagCount: find.options.multi ? 0 : 1,
      };
    }
    return {
      selectOrg: false,
      selectUser: true,
      mulpitle: false,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 0,
    };
  }
  setMulti2(code): object {
    // const find = this.datatype.find((d: any) => d.key === code);
    // if (find) {
    //   return {
    //     selectOrg: true,
    //     selectUser: false,
    //     mulpitle: find.options.multi ? JSON.parse(find.options.multi) : false,
    //     showModel: true,
    //     showSelect: true,
    //     placeholder: '请选择',
    //   };
    // }
    return {
      selectOrg: true,
      selectUser: false,
      mulpitle: false,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 1,
    };
  }
  setMulti3(code): object {
    // const find = this.datatype.find((d: any) => d.key === code);
    // if (find) {
    //   return {
    //     selectOrg: true,
    //     selectUser: false,
    //     mulpitle: find.options.multi ? JSON.parse(find.options.multi) : false,
    //     showModel: true,
    //     showSelect: true,
    //     placeholder: '请选择',
    //   };
    // }
    return {
      selectOrg: true,
      selectUser: false,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 0,
    };
  }
  setMulti4(code): object {
    return {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 0,
    };
  }
  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t(
      'cloudpivot.flowCenter.pc.plzSelect'
    ) as string;
  }

  closeQueryItem() {
    this.$emit('hide');
  }

  @Watch('$i18n.locale')
  onLanguageChange(l: string) {
    this.placeHolderLang();
  }
}
</script>

<style lang="less" scoped>
.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 1;
}
.query-form {
  // display: flex;
  padding: 10px;
  background: white;
  box-shadow: 0px 4px 8px 0px rgba(30, 85, 255, 0.1);
  border-radius: 4px;
  position: relative;
  z-index: 9;
  &.en {
    /deep/.ant-form-item-label label {
      width: 120px;
      text-align: left;
    }
  }
  &-left {
    flex-grow: 2;
    margin-top: 3px;
    .ant-form {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    .ant-input,
    /deep/.ant-form-inline .ant-form-item > .ant-form-item-control-wrapper {
      width: calc(100% - 90px);
      height: 32px;
      flex-shrink: 0;
      & > .ant-form-item-control {
        line-height: 0 !important;
      }
    }
    // /deep/.ant-form-inline .ant-form-item.range-picker > .ant-form-item-control-wrapper {
    //   width: 350px;
    // }
    /deep/.ant-form-item-label label {
      width: 80px;
      margin-right: 10px;
      display: inline-block;
      text-align: right;
      line-height: 32px;
      height: 32px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &.en {
      /deep/.ant-form-item-label label {
        width: 120px;
        text-align: left;
        line-height: 32px;
      }
    }
    .ai-form /deep/.ant-form-item-label label {
      width: auto;
    }
    /deep/.ant-form-inline .ant-form-item {
      margin-bottom: 10px;
      margin-right: 1.5%;
      width: 32.33%;
      &:nth-child(3n) {
        margin-right: 0;
      }
    }
    /deep/.ant-calendar-picker-input {
      line-height: normal !important;
      & > input {
        font-size: 14px;
      }
    }
    .workflow-name-input {
      width: 100% !important;
      /deep/.h3-organization__label{
        >div{
          .h3-organization-selected{
            max-width: 119px;
            .h3-organization-selected-name{
              width: 100%;
            }
          }
          .h3-organization-selected:last-child{
            padding: 0 5px;
          }
          .h3-organization-selected:first-child{
            padding: 0 24px 0 26px;
          }
        }
      }
    }
  }

  &-right {
    width: 100%;
    // height: 45px;
    padding: 8px 0px 8px 8px;
    text-align: center;
    & > button {
      margin-left: 8px;
    }

    & > span {
      width: 50px;
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      user-select: none;
      margin-right: 16px;

      & > i {
        transform: rotate(180deg);
        &.collapsed {
          transform: rotate(0);
        }
      }
    }
  }

  &.collapsed {
    overflow: hidden;
    // height: 45px;
    box-shadow: none;
  }
}
</style>
<style lang="less">
.query-form {
  .ant-calendar-picker {
    width: 100% !important;
  }
}
.actions .filter-card{
  margin: 0;
  margin-left: 16px;
  .item-title-all{
    max-width: 300px;
  }
}
</style>
