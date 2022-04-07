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
    width="800px"
    :bodyStyle="{ padding: '12px 24px'}"
  >
    <a-row class="required-type">
      <a-col :span="4">
        <span>计算数据项</span>
      </a-col>
      <a-col :span="14">
        <a-select
          :disabled="!isAdd"
          @change="handleChangeData"
          class="data-item-select-content"
          style="width: 100%"
          placeholder="请选择"
          v-model="modalData.propertyCode"
          :showSearch="true"
          optionFilterProp="children"
          :filter-option="filterOption" 
        >
          <a-select-option :key="i.id" :value="i.code" :disabled="i.isDisabled" v-for="i in formatDataItemFiler">
            <div class="select-option-flex">
              <div class="left">{{ i.name }}</div>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="3" style="padding-left: 15px;" v-if="modalData.propertyCode">
        <span>数据项类型</span>
      </a-col>
      <a-col :span="3" style="padding-left: 15px;" v-if="modalData.propertyCode">
        <div class="calcItemType">{{ currControlOptions ? getText(currControlOptions.code) : ''}}</div>
      </a-col>
    </a-row>
    <div v-show="currControlOptions" class="calcFlexContainer">
      <div class="iLeft">
        <div class="icons">
          <div :class="{active:dataActive}" title="数据项">
            <i class="aufontAll h-icon-all-yiyue-zj" style="display:block" @click="showDatas"></i>
          </div>
          <div :class="{active:CalculateActive}" title="函数">
            <i class="aufontAll h-icon-all-hanshushezhi" style="display:block" @click="showCalculates"></i>
          </div>
        </div>

        <div v-if="showLeftAll" class="leftAll">
          <div class="inserData" v-if="showData">
            <div class="iCommon iTitle iActive">插入数据项</div>
            <div class="iCommon iSearch">
              <a-input v-model="searchDataField" placeholder="搜索数据项">
                <a-icon slot="prefix" type="search" />
              </a-input>
            </div>
            <div class="itemList borderBottom">
              <a-row v-for="i in dataItemListShow.filter(x => x.code !== modalData.propertyCode)" :key="i.id" :value="i.code" class="iCommonRow" @click.native="insertField(i.code)">
                <a-col :span="12">
                  {{ i.name }}
                </a-col>
                <a-col :span="12" style="text-align: right">
                  <span class="absoluteRight" :style="{ background: i.color }">{{ i.text }}</span>
                </a-col>
              </a-row>
            </div>
          </div>
          <div class="calculation" v-if="showCalculate">
            <div class="iCommon iTitle">
              <span class="marginR10" :class="{ iActive: funcActiveTab === 1, iUnActive: funcActiveTab !== 1 }" @click="changeTab(1)">全部</span>
              <span class="marginR10" :class="{ iActive: funcActiveTab === 2, iUnActive: funcActiveTab !== 2 }" @click="changeTab(2)">文本</span>
              <span class="marginR10" :class="{ iActive: funcActiveTab === 3, iUnActive: funcActiveTab !== 3 }" @click="changeTab(3)">数值</span>
              <span class="marginR10" :class="{ iActive: funcActiveTab === 4, iUnActive: funcActiveTab !== 4 }" @click="changeTab(4)">日期</span>
            </div>
            <div class="iCommon iSearch">
              <a-input v-model="searchFunc" placeholder="搜索函数">
                <a-icon slot="prefix" type="search" />
              </a-input>
            </div>
            <div class="itemList">
              <a-row class="iCommonRow" v-for="i in funcListShow" :key="i.name" :value="i.name">
                <a-col class="itemPos" @click.native="ruleBtnClick(i)" @mouseenter="mouseEnterFunc(i)">{{ i.name }}</a-col>
              </a-row>
            </div>
          </div>
        </div>
        <div class="hide-menu">
          <div class="to-left" @click="showAll" v-if="!showLeftAll"></div>
          <div class="to-right" @click="closeAll" v-if="showLeftAll" ></div>
        </div>
      </div>
      <div class="iRight">
        <div class="marginTB5">
          <span class="iOperator marginL24 marginR24" @click="insertOperator(1)">+</span>
          <span class="iOperator marginR24" @click="insertOperator(2)">-</span>
          <span class="iOperator marginR24" @click="insertOperator(3)">*</span>
          <span class="iOperator marginR24" @click="insertOperator(4)">/</span>
          <span class="iOperator marginR24" @click="insertOperator(5)">(</span>
          <span class="iOperator marginR24" @click="insertOperator(6)">)</span>
        </div>
        <div class="text-area">
          <formula-editor
            ref="formulaEditor"
            :value="value"
            :fields="fields"
            :disabled="disabled"
            @change="fireChange"
            @focus="fireFocus"
            @blur="fireBlur"
            @tip="fireTip"
          />
        <span class="checkFormula" @click="checkFormula">检验公式</span>
        <div class="successTip">
          <a-alert
            v-if="successTipVisible"
            message="校验通过"
            type="warning"
          />
        </div>
        <div class="errorTip">
          <a-alert
            v-if="errorTipVisible"
            :message="errorMsg"
            type="error"
            closable
            :after-close="handleClose"
          />
        </div>
      </div>
      <div v-if="activeFunc.code" class="iFuncWrap">
        <div class="iFunc"><span class="iFuncTitle">{{activeFunc.name}}函数:</span><span class="iFuncCont">{{activeFunc.desc}}</span></div>
        <div class="iFunc"><span class="iFuncTitle">用法:</span><span class="iFuncCont">{{activeFunc.usage}}</span></div>
        <div class="iFunc"><span class="iFuncTitle">示例:</span><span class="iFuncCont">{{activeFunc.example}}</span></div>
      </div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";

  import {namespace} from 'vuex-class';

  import {DataitemConditionValue} from "@cloudpivot/form/src/common/data-item/dataitem-condition2.vue";

  import {DataItemType, DataItemTypeColor, DataItemTypeText} from "@cloudpivot/form/schema";

  const DataModelModule = namespace('Apps/DataModel');

  import funcList from '@cloudpivot/form/utils/function';

  import formulaEditor from '@cloudpivot/form/src/common/components/formula-editor/formula-editor.vue';

  import cloneDeep from 'lodash/cloneDeep';

  @Component({
    name: "AddCalculateRule",
    components: {
      formulaEditor
    },
  })
  export default class AddCalculateRule extends Vue {
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

    showLeftAll :boolean = true;
    showData :boolean = true;
    showCalculate :boolean = false;
    dataActive :boolean = true;
    CalculateActive :boolean = false;

    formatDataItem: any[] = [];
    formatDataItemFiler: any[] = [];
    dataItemListShow: any[] = []; // 数据项显示列表
    funcActiveTab: number = 1; // 函数tab标签 是全部、文本、数值、日期
    funcListShow: any[] = []; // 显示的函数列表

    model: DataitemConditionValue = {
      type: 1,
      conditions: [],
    };

    requiredType = 1;
    currControlOptions: any = {}; // 当前选中的数据项
    searchDataField: string = ''; // 搜索数据项关键字
    searchFunc: string = ''; // 搜索函数关键字
    activeFunc: any = {
      code: '',
      name: '',
      desc: '',
      usage: '',
      example: '',
      type: ''
    }; // 当前选中或激活的函数
    successTipVisible:boolean = false;
    errorTipVisible:boolean = false;
    errorMsg:string = '';
    code:string = '';
    disabled: boolean = false;
    value: any = {};
    readonly: boolean = false;
    fields: any[] = [];

    getText(code) {
      if(code === this.currControlOptions.code){
        let type = DataItemType[this.currControlOptions.type];
        return DataItemTypeText[type];
      } else{
        let dataItem = this.formatDataItem.find((item: any) => item.code.indexOf(code) > -1 )
        return dataItem && dataItem.text ? dataItem.text : '';
      }
    }

    showDatas(){
      if(this.showData){
        this.showLeftAll = !this.showLeftAll;
        return;
      }
      this.showData = !this.showData
      this.showCalculate = false;

      this.dataActive = true;
      this.CalculateActive = false;
    };

    showCalculates(){
      if(this.showCalculate){
        this.showLeftAll = !this.showLeftAll;
        return;
      }

      this.showData = false;
      this.showCalculate = !this.showCalculate

      this.dataActive = false
      this.CalculateActive = true;
    };

    closeAll(){
      this.showLeftAll = false;
    }

    showAll(){
      this.showLeftAll = true;
    };

    ruleBtnClick(func: any) {
      (this.$refs.formulaEditor as any).insertIdentifier(func.name);
      this.activeFunc = func;
    }

    mouseEnterFunc(func: any) {
      this.activeFunc = func;
    }

    get title(): string {
      return this.isAdd ? '新建计算规则' : '编辑计算规则';
    }

    /**
     * 计算数据项切换事件
     */
    handleChangeData(value) {
      this.currControlOptions = this.formatDataItem.find(i => i.code === value);
      this.searchDataField = '';
      this.searchFunc = '';
      this.refresh();
    }

    filterOption(input, option) {
      return (
        option.componentOptions.children[0].children[0].children[0].text.trim().toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    }

    initFuncList() {
      // 函数排序
      funcList.sort((a: any, b:any) => {
        if(a.name > b.name) {
          return 1;
        } else if (a.name === b.name) {
          return 0
        } else {
          return -1;
        }
      });
      this.funcListShow = funcList;
      // 字段

    }

    @Watch('searchDataField')
    onSearchDataFieldChange(val: string) {
      let keyword:string = val.toLowerCase();
      this.dataItemListShow = this.formatDataItem.filter(item => {
        return item.type === DataItemType.ShortText || 
        item.type === DataItemType.Dropdown ||
        item.type === DataItemType.DropdownMulti || 
        item.type === DataItemType.Date ||
        item.type === DataItemType.Number || 
        item.type === DataItemType.Radio || 
        item.type === DataItemType.Checkbox ||
        item.type === DataItemType.StaffSingle ||
        item.type === DataItemType.StaffMulti || 
        item.type === DataItemType.DeptSingle || 
        item.type === DataItemType.DeptMulti || 
        item.type === DataItemType.StaffDeptMix ||
        item.type === DataItemType.Address
      }).slice().filter((item: any) => item.name.toLowerCase().indexOf(keyword) > -1);
    }

    @Watch('searchFunc')
    onSearchFuncChange(val: string) {
      let keyword:string = val.toLowerCase();
      if (this.funcActiveTab === 1) {
        this.funcListShow = funcList.filter((item: any) => item.name.toLowerCase().indexOf(keyword) > -1);
      } else if (this.funcActiveTab === 2) {
        this.funcListShow = funcList.filter((item: any) => item.type === 'text' && item.name.toLowerCase().indexOf(keyword) > -1);
      } else if (this.funcActiveTab === 3) {
        this.funcListShow = funcList.filter((item: any) => item.type === 'number' && item.name.toLowerCase().indexOf(keyword) > -1);
      } else if (this.funcActiveTab === 4) {
        this.funcListShow = funcList.filter((item: any) => item.type === 'date' && item.name.toLowerCase().indexOf(keyword) > -1);
      }
    }

    changeTab(index: number) {
      this.searchFunc = '';
      this.funcActiveTab = index;
      if (index === 1) {
        this.funcListShow = funcList;
      } else if (index === 2) {
        this.funcListShow = funcList.filter((item: any) => item.type === 'text');
      } else if (index === 3) {
        this.funcListShow = funcList.filter((item: any) => item.type === 'number');
      } else if (index === 4) {
        this.funcListShow = funcList.filter((item: any) => item.type === 'date');
      }
    }

    refresh() {
      let itemListFilter: any[] = this.formatDataItem.filter(item => item.type === DataItemType.ShortText || item.type === DataItemType.Number).map(i => {
        const icon = DataItemType[i.type];
        if (icon) {
          i.color = DataItemTypeColor[icon];
          i.text = DataItemTypeText[icon];
        }
        i.isDisabled = false;
        return i;
      });

      console.log(this.list);


      itemListFilter.forEach(item => {
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

      let copyArr: any = cloneDeep(itemListFilter);
      // copyArr.forEach(x => {
      //   x.code = x.code.indexOf(".") > -1 ? x.code.split(".")[1] : x.code;
      // });
      this.formatDataItemFiler = copyArr;

      let itemList: any[] = this.formatDataItem;
      if (this.currControlOptions) {
        if (this.currControlOptions.parentCode) {
          itemList = itemList.filter(item => item.code !== `${this.currControlOptions.parentCode}.${this.currControlOptions.code}`);
        } else {
          itemList = itemList.filter(item => item.code !== this.currControlOptions.code);
        }
      }
      this.dataItemListShow = itemList.filter(item => {
        return item.type === DataItemType.ShortText || 
        item.type === DataItemType.Dropdown ||
        item.type === DataItemType.DropdownMulti || 
        item.type === DataItemType.Date ||
        item.type === DataItemType.Number || 
        item.type === DataItemType.Radio || 
        item.type === DataItemType.Checkbox ||
        item.type === DataItemType.StaffSingle ||
        item.type === DataItemType.StaffMulti || 
        item.type === DataItemType.DeptSingle || 
        item.type === DataItemType.DeptMulti || 
        item.type === DataItemType.StaffDeptMix ||
        item.type === DataItemType.Address
      }).slice()
      .map((item: any) => {
        const icon = DataItemType[item.type]
        return {
          code: `${item.code}`,
          name: item.name,
          type: item.type,
          color: DataItemTypeColor[icon],
          text: DataItemTypeText[icon]
        }
      });
      this.fields = this.dataItemListShow.map(item => {
        const { code, name, type } = item;
        console.log(code);
        return  {
          id: code,
          name,
          sourceType: 'field',
          paramType: this.getParamType(type),
          value: ''
        }
      })
    }

    @Watch('formatDataItem')
    changeDataItem() {
      this.currControlOptions = this.formatDataItem.find(i => i.code === this.modalData.propertyCode);
      this.refresh();
    }

    getParamType(type: number) {
      switch(type) {
        case DataItemType.ShortText:
          return 'text';
        case DataItemType.Number:
          return 'number';
        case DataItemType.Date:
          return 'date';
        case DataItemType.Logic:
          return 'bool';
        case DataItemType.Address:
          return 'address';
        case DataItemType.Radio:
          return 'radio';
        case DataItemType.Checkbox:
          return 'checkbox';
        case DataItemType.Dropdown:
          return 'dropdown';
        case DataItemType.DropdownMulti:
          return 'dropdownmulti';
        case DataItemType.StaffSingle:
          return 'staffsingle';
        case DataItemType.StaffMulti:
          return 'staffmulti';
        case DataItemType.DeptSingle:
          return 'deptsingle';
        case DataItemType.DeptMulti:
          return 'deptmulti';
        case DataItemType.StaffDeptMix:
          return 'staffdeptmix';
        default:
          return 'text';
      }
    }

    @Watch("visible")
    onVisibleChange(v) {
      if (v) {
        if(this.modalData.options && this.modalData.options.hasOwnProperty('shortTextStitch')) {
          try {
            this.value = JSON.parse(this.modalData.options.shortTextStitch);
          }catch(err) {
            console.log(err);
          }
        } else {
          this.value = {};
        }
      }
    }


    @Watch("modalData")
    onModalDataChange(modalData: any) {
      this.initFuncList();
      console.log("根据modalData初始化弹窗", this.dataItems);
      // 根据modalData初始化弹窗
      const _items = this.dataItems;
      let items: any[] = JSON.parse(JSON.stringify(_items));
      items.forEach(item => {
        if (item.parentCode) {
          const sheet = items.find((x) => x.code === item.parentCode);
          item.name = `${sheet.name}.${item.name}`;
          item.code = `${sheet.code}.${item.code}`;
        }
      })
      let arr: any[] = items.filter((i: any) => {
        switch (i.type) {
          case DataItemType.ShortText:
          case DataItemType.Radio:
          case DataItemType.Checkbox:
          case DataItemType.Dropdown:
          case DataItemType.DropdownMulti:
          case DataItemType.LongText:
          case DataItemType.Number:
          case DataItemType.Date:
          case DataItemType.StaffSingle:
          case DataItemType.StaffMulti:
          case DataItemType.DeptSingle:
          case DataItemType.DeptMulti:
          case DataItemType.StaffDeptMix:
          case DataItemType.Attachment:
          case DataItemType.Address:
          case DataItemType.RelevanceFormEx:
          case DataItemType.RelevanceForm:
            return i && !i.isSystem;
            break;
        }
      });
      this.formatDataItem = arr;
      //若schemaCode值不等于模型编码，则用于拼接字表code
      if(this.modalData.propertyCode && this.modalData.schemaCode !== this.bizSchemaCode){
        this.modalData.propertyCode = `${this.modalData.schemaCode}.${this.modalData.propertyCode}`;
      }

      if(this.modalData.options && this.modalData.options.hasOwnProperty('shortTextStitch')) {
        try {
          this.value = JSON.parse(this.modalData.options.shortTextStitch);
        }catch(err) {
          console.log(err);
        }
      } else {
        this.value = {};
      }
    }



    backData() {
      if (!this.modalData.propertyCode) {
        this.$message.error("计算数据项不能为空");
        return;
      }
      const {result, err} = (this.$refs.formulaEditor as any).validate();
      if(!result) {
        this.$message.error(err.info);
        return;
      }
      let codeValue: any = (this.$refs.formulaEditor as any).getValue();
      if (codeValue.formula === "TODAY()" && this.currControlOptions.type === DataItemType.Number) {
        this.$message.error("TODAY函数只能赋值给文本， 不能赋值给数值");
        return;
      }
      const param = {shortTextStitch: JSON.stringify(codeValue)};
      this.modalData.options = JSON.stringify(param);
      this.$emit("backData", this.modalData, this.currControlOptions);
    }


    closeModal() {
      this.model = {
        type: 1,
        conditions: [],
      };
      this.requiredType = 1;
      this.successTipVisible = false;
      this.errorTipVisible = false;
      this.$emit("closeModal");
    }

    savedRange: any = {};
    checkFormula() {
      const {result, err} = (this.$refs.formulaEditor as any).validate();
      if (result) {
        let codeValue: any = (this.$refs.formulaEditor as any).getValue();
        if (codeValue.formula === "TODAY()" && this.currControlOptions.type === DataItemType.Number) {
          this.errorTipVisible = true;
          this.errorMsg = "TODAY函数只能赋值给文本， 不能赋值给数值";
        } else {
          this.successTipVisible = true;
          setTimeout(() => {
            this.successTipVisible = false;
          }, 2000);
        }
      } else {
        this.errorTipVisible = true;
        this.errorMsg = err.info;
      }
    }
    handleClose() {
      this.errorTipVisible = false;
    }

    fireChange (value) {
      if (!this.modalData.propertyCode && value && value.formula) {
        this.$message.info("请先选择计算数据项");
        (this.$refs.formulaEditor as any).setEditorText("");
        return;
      }
      console.log(`change formula is`, value);
    }
    fireFocus () {
      console.log('focus');
    }
    fireBlur () {
      console.log('blur');
    }
    fireTip (funcName) {
      let func: any = funcList.find((item: any) => item.name === funcName);
      if (func) {
        this.activeFunc = func;
      }
      console.log(`tip funcName is ${funcName}`);
    }
    insertField (code: string) {
      (this.$refs.formulaEditor as any).insertField(code);
    }
    insertOperator(type: number) {
      let operator: string = '';
      switch(type) {
        case 1:
          operator = '+';
          break;
        case 2:
          operator = '-';
          break;
        case 3:
          operator = '*';
          break;
        case 4:
          operator = '/';
          break;
        case 5:
          operator = '(';
          break;
        case 6:
          operator = ')';
          break;
      }
      (this.$refs.formulaEditor as any).insertIdentifier(operator);
    }
  }
</script>

<style lang="less" scoped>
  .required-type {
    margin-bottom: 16px;
    line-height: 32px;
  }
  .calcItemType {
    padding: 0 10px;
    white-space: nowrap;
    display: inline-block;
    background: #E7EDFC;
    border-radius: 16px;
  }
  .calcFlexContainer {
    height: 420px;
    border: 1px solid #e8e8e8;
    background: #fff;
    border-radius: 2px;
    display: flex;
  }
  .iLeft {
    flex: 0 0 auto;
    border-right: 1px solid #e8e8e8;
    height: 100%;
    font-size: 12px;
    display: flex;
  }
  .leftAll{
    width: 180px;
  }
  .iRight {
    flex: 1 1 auto;
  }
  .aufontAll{
    margin: 5px;
    cursor: pointer;
  }
  .icons{
    margin-top: 5px;
    border-right: 1px solid #e8e8e8;
  }
  .active{
    background-color: #17BC94;
    i{
      color: #E7EDFC;
    }
  }
  .to-right{
    position: relative;
    left: 12px;
    width: 12px;
    height: 30px;
    background-image: url("../../../assets/images/toleft.svg");
  }
  .to-left{
    position: absolute;
    left: 51px;
    width: 12px;
    height: 30px;
    background-image: url("../../../assets/images/toright.svg");
  }
  .iTitle {
    color: rgba(0, 0, 0, 0.85);
    line-height: 20px;
  }
  .iActive {
    font-weight: 600;
  }
  .iUnActive {
    font-weight: 400;
  }
  .iUnActive:hover {
    font-weight: 800;
    cursor: pointer;
  }
  .iCommon {
    // margin: 0 5px;
    padding: 8px 12px;
  }
  .iSearch {
    font-size: 12px;
    line-height: 20px;
    padding-top: 0;
  }
  .iCommonRow {
    padding: 5px 12px;
  }
  .itemPos {
    position: relative;
  }
  .absoluteRight {
    border-radius: 16px;
    padding: 3px 5px;
  }
  .itemList {
    height: 340px;
    overflow: scroll;
    &::-webkit-scrollbar{
      width: 0;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.25);
    }
    & > div:hover {
      background: #E8FCF4;
      cursor: pointer;
    }
  }
  .borderBottom {
    border-bottom: 1px solid #e8e8e8;
  }
  .borderTop {
    border-top: 1px solid #e8e8e8;
  }
  .marginR10 {
    margin-right: 10px;
  }
  .marginR24 {
    margin-right: 24px;
  }
  .marginL24 {
    margin-left: 24px;
  }
  .marginTB5 {
    padding: 0;
    border-bottom: 1px solid #e8e8e8;
  }
  .iOperator {
    position: relative;
    display: inline-block;
    border: 6px solid transparent;
  }
  .iOperator:hover {
    transform: scale(2);
    cursor: pointer;
  }
  .text-area {
    position: relative;
    width: 100%;
    height: calc(100% - 158px);
    border-bottom: 1px solid #e8e8e8;
    & textarea,
    & > div.inputCls {
      width: 100%;
      height: 100%;
      word-break: break-all;
    }
    & .CodeMirror {
      width: 100%;
      height: 100%;
      word-break: break-all;
    }
  }
  .checkFormula {
    position: absolute;
    bottom: 8px;
    right: 12px;
    color: #17BC94;
    font-size: 14px;
    cursor: pointer;
  }
  .successTip {
    position: absolute;
    bottom: 30px;
    right: 0;
    
  }
  .errorTip {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .iFuncWrap {
    height: 124px;
    background: #F4F5F8;
    overflow-y: scroll;
    &::-webkit-scrollbar{
      width: 0;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.25);
    }
  }
  .iFunc {
    font-size: 12px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.65);
    line-height: 20px;
    margin: 5px;
  }
  .iFuncTitle {
    margin-right: 5px;
  }
  .iFuncCont {
    font-weight: 400;
  }
  .inputCls {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-variant: tabular-nums;
    list-style: none;
    -webkit-font-feature-settings: 'tnum';
    font-feature-settings: 'tnum';
    position: relative;
    display: inline-block;
    width: 100%;
    height: 32px;
    padding: 4px 11px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    line-height: 1.5;
    background-color: #fff;
    background-image: none;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
  }
  .CodeMirror-hints {
    z-index: 9999;
  }
</style>
