<template>
  <a-modal
    :cancelText="$t('languages.Apps.Cancel')"
    :keyboard="false"
    :maskClosable="false"
    :okText="$t('languages.Save')"
    :title="title"
    :visible="visible"
    @cancel="closeModal"
    @ok="backData"
    width="670px"
  >
    <a-row class="required-type">
      <a-col :span="4">
        <span>校验类型</span>
      </a-col>
      <a-col :span="20">
        <a-select
          :disabled="!isAdd"
          @change="handleChangeType"
          placeholder="请选择"
          style="width: 100%"
          v-model="modalData.checkType"
        >
          <a-select-option :value="1">正则校验</a-select-option>
          <a-select-option :value="2">提交校验</a-select-option>
          <a-select-option :value="3">子表空行校验</a-select-option>
          <a-select-option :value="4">文本最大长度校验</a-select-option>
          <a-select-option :value="5">去重</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row class="required-type" v-if="modalData.checkType">
      <a-col :span="4">
        <span>校验数据项测试</span>
      </a-col>
      <a-col :span="20">
        <a-select
          :disabled="!isAdd"
          @change="handleChangeData"
          class="data-item-select-content"
          placeholder="请选择"
          style="width: 100%"
          v-model="modalData.propertyCode"
          :showSearch="true"
          optionFilterProp="children"
          :filter-option="filterOption" 
        >
          <a-select-option :key="i.id" :value="i.code" :disabled="i.isDisabled" v-for="i in formatDataItemFiler">
            <div class="select-option-flex">
              <div class="left" :title="i.name" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;word-break: break-all;">{{ i.name }}</div>
              <div :style="{'background': i.color}" class="right">{{ i.text }}</div>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <template v-if="modalData.checkType === 1 && modalData.propertyCode">
      <regular-modal
        :modalData="modalData"
        :visible="visible"
        @backData="backData"
        @closeModal="closeModal"/>
    </template>
    <template v-if="modalData.checkType === 2 && modalData.propertyCode">
      <verify-formula-date
        :modalData="modalData"
        :selectListDataItemsDate="selectListDataItemsDate"
        :verifyFormula="verifyFormula"
        :visible="visible"
        ref="verifyFormulaDataModelDate"
        v-if="typeToShow === DataItemTypes.Date"/>
      <verify-formula-number
        :modalData="modalData"
        :selectListDataItemsNumber="selectListDataItemsNumber"
        :verifyFormula="verifyFormula"
        :visible="visible"
        ref="verifyFormulaDataModelNumber"
        v-if="typeToShow === DataItemTypes.Number"/>
    </template>
    <template v-if="modalData.checkType === 3 && modalData.propertyCode">
      <a-row class="required-type">
        <a-col :span="4">
          <span>验证失败提示语</span>
        </a-col>
        <a-col :span="20">
          <a-input v-model="modalData.options.isEmptyRowTips"/>
        </a-col>
      </a-row>
    </template>
    <template v-if="modalData.checkType === 4 && modalData.propertyCode">
      <a-row class="required-type">
        <a-col :span="4">
          <span>最大长度</span>
        </a-col>
        <a-col :span="20">
          <a-input-number
            :formatter="value =>`${value.replace(/\D/g,'')}`"
            @change="handeleChangeNumber"
            defaultValue="200"
            style="width: 100%"
            v-model="number"/>
        </a-col>
      </a-row>
      <a-row class="required-type" v-if="modalData.checkType !== 4">
        <a-col :span="4">
          <span>验证失败提示语</span>
        </a-col>
        <a-col :span="20">
          <a-input v-model="modalData.options.maxLengthTips"/>
        </a-col>
      </a-row>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { DataItemType, DataItemTypeColor, DataItemTypeText } from "@/components/apps/form-design/typings";
import RegularModal from "@cloudpivot/form/src/common/components/regular-modal.vue";
import VerifyFormulaDate from "@cloudpivot/form/src/common/components/verify-formula-date.vue";
import VerifyFormulaNumber from "@cloudpivot/form/src/common/components/verify-formula-number.vue";
import { cloneDeep } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from 'vuex-class';
const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: "AddVerifyRules",
  components: {
    RegularModal,
    VerifyFormulaDate,
    VerifyFormulaNumber
  },
})
export default class AddVerifyRules extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;
  @Prop({
    type: Object,
  })
  modalData!: any;
  @Prop({
    default: false,
  }) visible!: boolean;
  @Prop({
    default: true,
  }) isAdd!: boolean;
  @Prop() list: any;

  @Prop() bizSchemaCode: any;

  DataItemTypes = DataItemType;
  formatDataItem: any[] = [];
  formatDataItemFiler: any[] = [];
  typeToShow = null;
  selectListDataItemsDate: any[] = [];
  selectListDataItemsNumber: any[] = [];
  number: number = 200;

  get title(): string {
    return this.isAdd ? '新建校验规则' : '编辑校验规则';
  }

  // 提交校验的数据
  verifyFormula: any = {
    currControlOptions: {},
    verifyRuleValue: "=",
    partterValue: 1,
    date: null,
    rangeDate: [], // 常量下 介于 数据
    dynamicTypeValue: 1, // 动态值 选择类型 数据项/当天加减
    numInput: '',// 常数值 非介于 值
    numInput1: '',// 常数值 介于 第一个值
    numInput2: '',// 常数值 介于 第二个值
    promptText: '',// 失败提示语
    selectDataItem: [], // 动态值 非介于 值
    rangeSelectDataItem1: [],// 动态值 介于 第一个值
    rangeSelectDataItem2: [],// 动态值 介于 第二个值
    errDialogboxType: 1, // 错误提示框 类型 1/短 2/对话框
  }

  @Watch('visible')
  changeVisible(val) {
    this.formatDataItem = [];
  }

  @Watch('formatDataItem')
  changeDataItem() {
    this.verifyFormula.currControlOptions = this.formatDataItem.find(i => i.code === this.modalData.propertyCode);
    this.formatDataItemFiler = this.formatDataItem.map(i => {
      const icon = DataItemType[i.type];
      if (icon) {
        i.color = DataItemTypeColor[icon];
        i.text = DataItemTypeText[icon];
      }
      return i;
    });
  }

  @Watch("modalData", {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (!modalData || !modalData.options) {
      this.formatDataItem = [];
      return;
    }
    this.dataItems.forEach((item)=>{
      if(item.parentCode){
       const sheet = this.dataItems.find((x) => x.code === item.parentCode);
          item.name = `${sheet.name}.${item.name}`;
          item.code = `${sheet.code}.${item.code}`;
      }
      item.isDisabled = false;
    });

    this.dataItems.forEach(item => {
      if (item.parentCode) {
        let existItem: any = this.list.find(x => x.propertyCode === item.code.split(".")[1] && x.schemaCode !== item.schemaCode);
        if (existItem) {
          item.isDisabled = true;
        }
      } else {
        let existItem: any = this.list.find(x => x.propertyCode === item.code && x.schemaCode === item.schemaCode);
        if (existItem) {
          item.isDisabled = true;
        }
      }
    })
    
    //若schemaCode值不等于模型编码，则用于拼接字表code
    if(this.modalData.propertyCode && this.modalData.schemaCode !== this.bizSchemaCode){
      this.modalData.propertyCode = `${this.modalData.schemaCode}.${this.modalData.propertyCode}`;
    }
    if (!this.isAdd) {
      if (this.modalData.options.maxLength) this.number = this.modalData.options.maxLength;
      this.formatDataItem = cloneDeep(this.dataItems);
      this.modalData.checkType === 2 && this.handleChangeData(this.modalData.propertyCode);
    } else {
      this.number = 200;
    }
  }

  /**
   * 校验类型切换事件
   */
  handleChangeType(val) {
    this.modalData.options = {};
    this.modalData.propertyCode = undefined;
    let arr = [];
    switch (val) {
      case 1: // 正则
        arr = this.dataItems.filter(i => (i.type === DataItemType.ShortText) && !i.isSystem);
        break;
      case 2: // 提交
        arr = this.dataItems.filter(i => (i.type === DataItemType.Number || i.type === DataItemType.Date) && !i.isSystem);
        break;
      case 3:// 空行
        arr = this.dataItems.filter(i => (i.type === DataItemType.Sheet) && !i.isSystem);
        break;
      case 4: // 最大长度
        arr = this.dataItems.filter(i => (i.type === DataItemType.ShortText || i.type === DataItemType.LongText) && !i.isSystem);
        break;
      case 5: // 去重
        arr = this.dataItems.filter(i => i.type === DataItemType.ShortText && !i.isSystem);
        break;
    }
    this.formatDataItem = arr;
  }
  
  /**
   * 校验数据项切换事件
   */
  handleChangeData(value) {
    const obj = this.formatDataItem.find(i => i.code === value);
    const items = cloneDeep(this.formatDataItem);
    this.typeToShow = obj.type;
    if (obj.parentCode) {
      let validDateList = items.filter(i => !i.isSystem && i.code !== value && i.type === DataItemType.Date);
      validDateList.forEach(x => {
        if (x.parentCode) {
          x.code = `${x.parentCode}.${x.code}`;
        }
      })
      this.selectListDataItemsDate = validDateList;
      let validNumberList = items.filter(i => !i.isSystem && i.code !== value && i.type === DataItemType.Number);
      validNumberList.forEach(x => {
        if (x.parentCode) {
          x.code = `${x.parentCode}.${x.code}`;
        }
      })
      this.selectListDataItemsNumber = validNumberList;
    } else {
      this.selectListDataItemsDate = items.filter(i => !i.parentCode && i.code !== value && i.type === DataItemType.Date);
      this.selectListDataItemsNumber = items.filter(i => !i.parentCode && i.code !== value && i.type === DataItemType.Number);
    }
    this.handleClear();
    this.verifyFormula.currControlOptions = obj;
    if (this.modalData.checkType === 4) {
      this.modalData.options.maxLength = 200;
    }
  }
  
  /**
   * 校验数据项过滤函数
   */
  filterOption(input, option) {
    return (
      option.componentOptions.children[0].children[0].children[0].text.trim().toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  }

  handeleChangeNumber(value) {
    if(value === 0){
      this.number = 1
      this.modalData.options.maxLength = 1 
      return
    }
    this.modalData.options.maxLength = value;
  }

  // 获取数据联动配置
  getVerifyFormulaDataModelDate() {
    return (this.$refs.verifyFormulaDataModelDate as any).getData();
  }

  getverifyFormulaDataModelNumber() {
    return (this.$refs.verifyFormulaDataModelNumber as any).getData();
  }

  backData() {
    if (!this.modalData.propertyCode) {
      this.$message.error('请选择数据项');
      return;
    }
    if (this.modalData.checkType === 1) {
      if (!this.modalData.options.regexp) {
        this.$message.error('请输入正则表达式');
        return;
      }
      const reg = new RegExp(/^(\/\^).+?(\$\/)$/);
      if (reg.test(this.modalData.options.regexp)) {
        try {
          new RegExp(this.modalData.options.regexp).test("");
        } catch (err) {
          this.$message.error("输入正则不合法");
          return;
        }
      } else {
        this.$message.error("输入正则不合法");
        return;
      }
    } else if (this.modalData.checkType === 2) {
      console.log(this.modalData, 'this.modalData');
      if (this.typeToShow === DataItemType.Date) {
        this.backDataTwoDate();
        return;
      } else if (this.typeToShow === DataItemType.Number) {
        this.backDataTwoNumber();
        return;
      }
    } else if (this.modalData.checkType === 3) {
      this.modalData.options.isEmptyRow = true;
    } else if (this.modalData.checkType === 4) {
    } else if (this.modalData.checkType === 5) {
      this.modalData.options.noRepeat = true;
    }

    console.log(this.formatDataItemFiler,this.modalData)
    let item = this.formatDataItemFiler.find(el => el.code === this.modalData.propertyCode)
    if(['短文本', '长文本'].includes(item.text)){
      if(item.text === '短文本' && this.modalData.options.maxLength > 200){
        this.$message.error('短文本最大长度只能在200以内')
        return
      }
      if(item.text === '长文本' && this.modalData.options.maxLength > 2000){
        this.$message.error('长文本最大长度只能在2000以内')
        return
      }
    }
    this.modalData.options = JSON.stringify(this.modalData.options);
    this.$emit("backData", this.modalData, this.verifyFormula.currControlOptions);
  }

  backDataTwoNumber() {
    if (!this.getverifyFormulaDataModelNumber()) {
      this.$message.error('请填写规则');
      return;
    }
    this.modalData.options.verifyFormula = JSON.stringify(this.getverifyFormulaDataModelNumber());
    this.modalData.options = JSON.stringify(this.modalData.options);
    this.$emit("backData", this.modalData, this.verifyFormula.currControlOptions);
  }

  backDataTwoDate() {
    if (!this.getVerifyFormulaDataModelDate()) {
      this.$message.error('请填写规则');
      return;
    }
    this.modalData.options.verifyFormula = JSON.stringify(this.getVerifyFormulaDataModelDate());
    this.modalData.options = JSON.stringify(this.modalData.options);
    this.$emit("backData", this.modalData, this.verifyFormula.currControlOptions);
  }

  handleClear() {
    this.verifyFormula = {
      currControlOptions: {},
      verifyRuleValue: "=",
      partterValue: 1,
      date: null,
      rangeDate: [], // 常量下 介于 数据
      dynamicTypeValue: 1, // 动态值 选择类型 数据项/当天加减
      numInput: '',// 常数值 非介于 值
      numInput1: '',// 常数值 介于 第一个值
      numInput2: '',// 常数值 介于 第二个值
      promptText: '',// 失败提示语
      selectDataItem: [], // 动态值 非介于 值
      rangeSelectDataItem1: [],// 动态值 介于 第一个值
      rangeSelectDataItem2: [],// 动态值 介于 第二个值
      errDialogboxType: 1, // 错误提示框 类型 1/短 2/对话框
    };
  }

  closeModal() {
    this.handleClear();
    this.$emit("closeModal");
  }
}
</script>

<style lang="less">
.required-type {
  margin-bottom: 16px;
  line-height: 32px;
}
</style>
