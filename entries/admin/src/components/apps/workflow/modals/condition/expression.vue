<template>
  <div class="condition-panel">
    <section class="condition-panel-top">
      <span>连接方式：</span>
      <a-select
        v-model="form.connection"
        class="connection-select"
        placeholder="请选择连接方式"
      >
        <a-select-option
          v-for="(con, index) in connects"
          :key="index"
          :value="con.value"
        >{{ con.name }}</a-select-option>
      </a-select>
    </section>
    <h3>条件表达式</h3>
    <section class="condition-box">
      <!-- 编辑区 -->
      <div
        v-for="(item, idx) in form.ruleList"
        :key="idx"
        class="row clearfix"
      >
        <!-- 数据项 -->
        <a-select
          v-model="item.dataItemCode"
          class="select-item"
          placeholder="请选择数据项"
          :showSearch="true"
          optionFilterProp="children"
          @change="onDataItemChange($event, item)"
        >
          <a-select-opt-group>
            <span slot="label">主表数据项</span>
            <template v-for="(dataItem,j) in filteDataList(item, 1)">
              <a-select-option
                :key="dataItem.code + j"
                :value="dataItem.code"
                :title="dataItem.name+'['+dataItem.code+']'"
              >{{ `${dataItem.name}[${dataItem.code}]` }}</a-select-option>
            </template>
          </a-select-opt-group>

          <template v-for="(_dataItem,j) in filteDataList(item, 2)">
            <a-select-opt-group :key="_dataItem.name + j" >
              <span slot="label">{{_dataItem.name}}</span>
              <a-select-option
                v-for="(dataItem, k) in _dataItem.info"
                :key="dataItem.code + j + k"
                :value="dataItem.code"
                 :title="dataItem.name+'['+dataItem.code+']'"
              >{{ `${dataItem.name}[${dataItem.code}]` }}</a-select-option>
            </a-select-opt-group>
          </template>

        </a-select>
        <!-- 运算符 -->
        <a-select
          v-model="item.rule"
          class="select-item"
          placeholder="请选择规则"
        >
          <a-select-option
            v-for="(r, i) in filteRuleList(item)"
            :key="r.value + i"
            :value="r.value"
          >{{ r.name }}</a-select-option>
        </a-select>
        <!-- 预设文本值 -->
        <a-tooltip :visible="item &&!!item.errorMsg">
          <template slot="title">
            <span>{{ item.errorMsg }}</span>
          </template>
          <div :class="!!item.errorMsg && 'has-error'" class="select-data">
            <a-date-picker
              v-if="isDate(item.valueType) && !['IsNotEmpty', 'IsEmpty'].includes(item.rule)"
              v-model="item.text"
              @change="(d, ds) => onDateChange(item, ds)"
            ></a-date-picker>

            <a-select v-else-if="isLogic(item.valueType)" v-model="item.text">
              <a-select-option value="1">true</a-select-option>
              <a-select-option value="0">false</a-select-option>
            </a-select>
            
            <a-input
              v-else-if="!['IsEmpty','IsNotEmpty'].includes(item.rule)"
              v-model="item.text"
              class="input-item"
              :disabled="!item.dataItemCode"
              :type="item.valueType === '2' ? 'number' : 'text'"
              @change="validate(item)"
            />
           


          </div>
        </a-tooltip>
        <!-- 删除按钮 -->
        <span class="delete" @click="popItem(idx)">
          <i class="icon aufontAll h-icon-all-delete-o"></i>
        </span>
      </div>
      <!-- 添加按钮 -->
      <div class="add" ref="addButton">
        <span @click="addItem">
          <i class="icon aufontAll h-icon-all-plus-o"></i>
          新增数据
        </span>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';
import { DataItemType } from "@cloudpivot/form/schema";
import cloneDeep from 'lodash/cloneDeep'

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'Expression'
  })
export default class Expression extends Vue {
  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem:any;

  @Prop() value: any;

  connects: any[] = [
    { name: '所有条件都必须满足', value: '&&' },
    { name: '任意一条满足即可', value: '||' }
  ];
  form: Apps.Workflow.LineConditions = {
    connection: '&&',
    ruleList: []
  };
  /* 规则可选列表，acceptTypes: 0短文本，2数值 */
  // 主表选项
  rules: any[] = [
    { name: '等于', value: '==', acceptTypes: [0,1,2,3,4,12,13,14,15] },
    { name: '大于', value: '>', acceptTypes: [2,3] },
    { name: '小于', value: '<', acceptTypes: [2,3] },
    { name: '大于等于', value: '>=', acceptTypes: [2,3] },
    { name: '小于等于', value: '<=', acceptTypes: [2,3] },
    { name: '不等于', value: '!=', acceptTypes: [2,3] },
    { name: '包含', value: 'Contains', acceptTypes: [0, 1,2,3,12,13,14,15] },
    { name: '不包含', value: 'NotContains', acceptTypes: [0, 1,2,3,12,13,14,15]},
    { name: '为空', value: 'IsEmpty', acceptTypes: [0, 1,2,3,12,13,14,15] },
    { name: '不为空', value: 'IsNotEmpty', acceptTypes: [0, 1,2,3,12,13,14,15]},
  ];

  // 子表选项
  subRules: any[] = [
    { name: '包含', value: 'Contains', acceptTypes: [0, 1,2,3,4,12,13,14,15] },
    { name: '不包含', value: 'NotContains', acceptTypes: [0, 1,2,3,4,12,13,14,15]},
    { name: '为空', value: 'IsEmpty', acceptTypes: [0, 1,2,3,12,13,14,15] },
    { name: '不为空', value: 'IsNotEmpty', acceptTypes: [0, 1,2,3,12,13,14,15]},
  ];

  isDate(type: DataItemType) {
    return type*1 === DataItemType.Date;
  }
  isLogic(type: DataItemType) {
    return type*1 === DataItemType.Logic;
  }
  onDateChange(item,ds){
    item.text = ds
  }

  mounted() {
    this.Init(this.value.expression);
  }

  Init(ctx: string) {
    
    /* 解析传入的表达式数据 */
    if (!ctx) return;
    if (/&&/.test(ctx)) {
      this.form.connection = '&&';
    } else if (/\|\|/.test(ctx)) {
      this.form.connection = '||';
    }
    const _expressions = ctx.split(this.form.connection);
    if (_expressions.length) {
      const _patternTxt: RegExp = /^\{(.+?)\}(==|>|<|>=|<=|!=)"(.+?)"$/;
      const _patternNum: RegExp = /^\{(.+?)\}(==|>|<|>=|<=|!=)(\d+(\.\d+)?)$/;
      const _contains: RegExp = /^Contains\({(.+?)},"(.+?)"\)$/;
      const _notcontains: RegExp = /^NotContains\({(.+?)},"(.+?)"\)$/;
      const _isempty: RegExp = /^IsEmpty\({(.+?)}\)$/;
      const _isnotempty: RegExp = /^IsNotEmpty\({(.+?)}\)$/;

      const list:Array<Apps.Workflow.LineConditionItem> = [];
      _expressions.forEach((exp: string) => {
        if (_patternTxt.test(exp)) {
          const arr: any = exp.match(_patternTxt);
          const [dataItemCode, rule, txt] = arr.slice(1);
          let valueType = '';
          let text = txt;
          if (rule === '==') {
            /* 判断是哪一种数据类型 */
            /**
             * 要考虑到为空的情况
             */
            if(Array.isArray(this.dataItems) && this.dataItems.length>0){
              const it:Apps.Datamodel.ChildeDataItem = this.dataItems.find((item: Apps.Datamodel.ChildeDataItem) => item.code === dataItemCode);
              valueType = it ? `${it.propertyType}` : '2';
            }else{
              valueType = '0';
            }
            
          } else {
            const r: any = this.rules.find((rul: any) => rul.value === rule);
            valueType = r ? `${r.acceptTypes[1]}` : '2';
          }
          if (valueType === '2') {
            text = txt.replace(/"/g, '');
          }
          list.push({
            dataItemCode,
            rule,
            text,
            valueType,
          });
        } else if (_patternNum.test(exp)) {
          const arr: any = exp.match(_patternNum);
          const [dataItemCode, rule, number] = arr.slice(1);
          const valueType = '2';
          const text = number.replace(/"/g, '');
          list.push({
            dataItemCode,
            rule,
            text,
            valueType
          });
        } else if (_contains.test(exp)) {
          const crr: any = exp.match(_contains);
          const [e, dataItemCode, text]= crr;

          let valueType = '0'
          if(dataItemCode){
            let it: Apps.Datamodel.ChildeDataItem = this.dataItems.find((item: Apps.Datamodel.ChildeDataItem) => item.code === dataItemCode)
            if(!it){
              it = this.subSheetData[0].info.find((item: Apps.Datamodel.ChildeDataItem) => item.code === dataItemCode) 
            }
            if(it){
              valueType = it.propertyType + ''
            }
          }

          list.push({
            dataItemCode,
            rule: 'Contains',
            text,
            valueType: valueType
          });
        } else if (_notcontains.test(exp)) {
          const crr: any = exp.match(_notcontains);
          const [e, dataItemCode, text]= crr;
          let valueType = '0'
          if(dataItemCode){
            let it: Apps.Datamodel.ChildeDataItem = this.dataItems.find((item: Apps.Datamodel.ChildeDataItem) => item.code === dataItemCode)
            if(!it){
              it = this.subSheetData[0].info.find((item: Apps.Datamodel.ChildeDataItem) => item.code === dataItemCode) 
            }
            if(it){
              valueType = it.propertyType + ''
            }
          }
          list.push({
            dataItemCode,
            rule: 'NotContains',
            text,
            valueType: valueType
          });
        }
        else if (_isempty.test(exp)) {
          const crr: any = exp.match(_isempty);
          const [e, dataItemCode, text]= crr;
          list.push({
            dataItemCode,
            rule: 'IsEmpty',
            text,
            valueType: '0'
          });
        }
        else if (_isnotempty.test(exp)) {
          const crr: any = exp.match(_isnotempty);
          const [e, dataItemCode, text]= crr;
          list.push({
            dataItemCode,
            rule: 'IsNotEmpty',
            text,
            valueType: '0'
          });
        }else{
          console.log('exp===>', exp) 
        }
      });
      this.form.ruleList = list;
    }
  }

  /* Methods */
  addItem() {
    const _item: Apps.Workflow.LineConditionItem = {
      dataItemCode: '',
      rule: '==',
      text: '',
      valueType: '', // 输入数据项类型： 短文本'0' 数值'2'
      errorMsg: '', // 输入有误时的错误提示
    };
    this.form.ruleList.push(_item);
    this.$nextTick(() => {
      /* 聚焦到底部 */
      const dom: any = this.$refs.addButton;
      dom.scrollIntoView();
    });
  }
  popItem(idx: number) {
    this.form.ruleList.splice(idx, 1);
  }

  /* 根据当前条目的数据类型，过滤对应的运算规格 */
  filteRuleList(item: any) {
    if (item && item.valueType) {
      if(~item.dataItemCode.indexOf('.')){
        item.isSub = true
      }
      if(item.isSub) {
        // 子表没有等于
        return this.subRules.filter((r: any) => r.acceptTypes.includes(+item.valueType));
      } else {
        return this.rules.filter((r: any) => r.acceptTypes.includes(+item.valueType));
      }
    } else {
      return this.rules
    }
  }
  /* 根据当前已选数据项，筛选可选数据项，每个数据项只能被添加一次 */
  filteDataList(item: Apps.Workflow.LineConditionItem, type) {
    if(type===1){
      return this.dataItems;
    }else{
      return this.subSheetData
    }
    // 迭代24 一个条件支持配置多次 by John
    // return this.dataItems;
    // let selected = this.form.ruleList.map((r: Apps.Workflow.LineConditionItem) => r.dataItemCode);
    // if (item && item.dataItemCode) {
    //   selected = selected.filter((code: string) => code !== item.dataItemCode);
    // }
    // return this.dataItems.filter((data: Apps.Datamodel.ChildeDataItem) => !selected.includes(data.code));
  }

  onDataItemChange(code: any, item: Apps.Workflow.LineConditionItem) {
    let _data:Apps.Datamodel.ChildeDataItem = this.dataItems.find((d:Apps.Datamodel.ChildeDataItem) => d.code === code) || this.subSheetData[0].info.find((d:Apps.Datamodel.ChildeDataItem) => d.code === code)
    item.valueType = `${_data.propertyType}`;
    item.rule = '==';
    item.text = '';
    // @ts-ignore
    item.isSub = _data.isSub
    // @ts-ignore
    if(item.isSub && item.valueType*1 !== 4){
      item.rule = 'IsEmpty';
    // @ts-ignore
    }else if(item.isSub && item.valueType*1 === 4){
      item.rule = 'Contains';
    }
  }

  validate(item: Apps.Workflow.LineConditionItem) {
    /* 校验条目输入框内容 */
    let err = '';
    if (!item.text && item.valueType) {
      err = '请输入内容';
    }
    if (
      item.valueType === '2'
      && !/^\d+(\.\d+)?$/.test(item.text)) {
      err = '请输入数值';
    }
    item.errorMsg = err;
    // if (item.dataItemCode) {
    //   this.getExpression();
    // }
  }

  clearValidate() {
    this.form.ruleList.forEach((item: Apps.Workflow.LineConditionItem) => { item.errorMsg = ''; });
  }

  /* 数据项可选列表 */
  get dataItems() {
    // let subSheetDatas = []
    // this.WorkflowDataItem.forEach(element => {
    //   if(element.propertyType === 8){
    //     element.subSchema.properties.forEach(item => {
    //       item.isSub = true // 添加子表标识
    //     });
    //     // @ts-ignore
    //     subSheetDatas = [...subSheetDatas ,...element.subSchema.properties]
    //   }
    // });

    //  let WorkflowDataItem = [...this.WorkflowDataItem, ...subSheetDatas]

    /* TODO: 此处的判断是否为短文本/数值类型的数据项为临时用法，暂无法清楚是怎么判定短文本/数值控件类型的数据项 */
    return this.WorkflowDataItem.filter((item: Apps.Datamodel.ChildeDataItem) => ['0','1','2','3','4','12','13','14','15'].includes(`${item.propertyType}`) && item.published);
    // return this.WorkflowDataItem.filter((item: Apps.Datamodel.ChildeDataItem) => ['0','2'].includes(`${item.propertyType}`) && item.published && !item.defaultProperty);
  }

  get subSheetData(){
    let res: any = [];
    let workflowDataItemCopy: any[] = cloneDeep(this.WorkflowDataItem);
    workflowDataItemCopy.forEach(element => {
      console.log('element.propertyType===>',element.propertyType)
      if(element.propertyType === 8){
        let subSheetDatas = []
        element.subSchema.properties.forEach(item => {
          item.isSub = true // 添加子表标识
          if(!~item.code.indexOf('.')){
            item.code = element.code + '.' + item.code
          }
        });
        // @ts-ignore
        subSheetDatas = [...subSheetDatas ,...element.subSchema.properties].filter((item: Apps.Datamodel.ChildeDataItem) => ['0','1','2','3','4','12','13','14','15'].includes(`${item.propertyType}`) && item.published && !item.defaultProperty);
        res.push({
          name: element.name,
          info: subSheetDatas
        })
      }
    });
    return res
  }

  /* 组件的合并结果 */
  getExpression() {
    return new Promise((resolve, reject) => {
      console.log('this.form.ruleList==>',this.form.ruleList)
      const hasError = this.form.ruleList.some((item: Apps.Workflow.LineConditionItem) => {
        // @ts-ignore
        if(['IsEmpty', 'IsNotEmpty'].includes(item.rule)){
          return !!item.errorMsg || !item.rule
        }else{
          return !!item.errorMsg || !item.text || !item.rule 
        }
      });
      if (hasError) {
        // this.$emit('input', { ...this.value, expression: '' });
        this.$message.warning('请检查表达式是否填写完整');
        reject();
        return;
      }

      if (!this.form.ruleList.length) {
        this.$emit('input', { ...this.value, expression: '' });
        resolve('');
        return;
      }

      const _results = this.form.ruleList.map((item: Apps.Workflow.LineConditionItem) => {
        if (item.rule === 'Contains' || item.rule === 'NotContains') {
          return `${item.rule}({${item.dataItemCode}},"${item.text}")`;
        }else if(item.rule === 'IsEmpty' || item.rule === 'IsNotEmpty'){
          return `${item.rule}({${item.dataItemCode}})`;
        }else if (item.valueType === '2') {
          return `{${item.dataItemCode}}${item.rule}${item.text.replace(/"/g, '')}`;
        }
        return `{${item.dataItemCode}}${item.rule}"${item.text}"`;
      });
      const _express = _results.join(this.form.connection);
      this.$emit('input', {
        ...this.value,
        expression: _express
      });
      resolve(_express);
    });
  }
}
</script>
<style lang="less" scoped>
.condition-panel {
  &-top {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  h3 {
    margin-top: 24px;
    margin-bottom: 0;
    padding: 8px 16px;
    border-radius: 4px;
    background-color: #fafafa;
    border-bottom: 1px solid #e8e8e8;
  }
}
.connection-select {
  width: 307px;
}
.condition-box {
  // max-height: 250px;
  max-height: calc(100vh - 390px);
  min-height: 32px;
  overflow: auto;
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px 0;
    border-bottom: 1px solid #e8e8e8;
  }
  .select-item {
    width: 136px;
    margin-left: 16px;
  }
  .input-item {
    width: 280px;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    &[type="number"]{
      -moz-appearance: textfield;
    }
  }
  .delete {
    display: inline-flex;
    padding: 12px 16px;
    cursor: pointer;
  }
  .add {
    margin-top: 8px;
    text-align: center;
    color: @primary-color;
    span {
      cursor: pointer;
    }
  }
}
</style>
<style lang="less">
.select-data{
  flex:1;
  margin-left: 16px;
  display: flex;
  &>*{
    flex: 1;
  }
}
</style>