<template>
  <a-modal v-model="visible" @ok="handleOk" width="600px" :footer="null">
    <template slot="title">
      <p class="title">
        <span>批量修改</span>
        <small v-show="!showChangLog">您已选择<font>{{updateOptions.checkeds.length}}</font>条数据</small>
      </p>
    </template>
    <template>

      <div class="content" v-show="!showChangLog">
        <div class="tips">
          <p>
            注意事项
          </p>
          <ul>
            <!-- <li>根据修改字段的属性限制内进行修改；</li>
            <li>图片、附件、地图、地址、手写签名、关联表单、关联查询字段不支持批量修改。</li> -->
            <li>
              业务数据项：图片、附件、地图、地址、手写签名、关联表单、关联查询字段不支持批量修改。
            </li>
            <li>
              系统数据项：单据号、创建人、创建人部门、创建时间、修改时间、修改人不支持批量修改。
            </li>
            <li>
              流程表单不能修改，只能修改业务表单。
            </li>
          </ul>
        </div>

        <p>修改字段</p>
        <a-select @change="changeItemChange" v-model="params.propertyCode" default-value="lucy" style="width: 254px">
          <a-select-option :title="item.name" :key="item.code + index" :value="item.code" v-for="(item,index) in filterList">
           {{item.name}}
          </a-select-option>
        </a-select>

        <p v-if="params.propertyCode">修改值</p>
        <template v-if="params.propertyCode">
          <div class="change-data-wrapper">
          <!-- 短文本 -->
          <a-input @change="textChange('sortText')" v-if="currentType === 'SORTTEXT'" placeholder="请输入" v-model="params.modifiedValue"></a-input>
          <!-- 长文本 -->
          <a-textarea @change="textChange('longText')" v-if="currentType === 'LONGTEXT'" v-model="params.modifiedValue" placeholder="请输入" :rows="4" />

          <!-- 日期 -->
          <a-date-picker
            v-else-if="currentType === 'DATE'"
            :showTime="itemOptions.length > 10"
            class="time-select"
            :format="itemOptions"
            v-model="params.modifiedValue"
          />

          <!-- 数值 -->
          <template v-else-if="currentType === 'NUMBER'">
            <!-- <a-input-number width="100%" ref="NumInput"  @change="numberChange" @blur="numberBlur"  v-model="params.modifiedValue"></a-input-number> -->
            <input class="cus-input" width="100%" v-show="!showNumText" ref="NumInput" type="number" @input="numberChange" @blur="numberBlur"  v-model="params.modifiedValue">
            <a-input width="100%" v-show="showNumText" @focus="showNumTextFocus" v-model="numberShowText"></a-input>
          </template>
          

          <!-- 逻辑 -->
          <a-select show-search v-else-if="currentType === 'LOGIC'" v-model="params.modifiedValue">
            <a-select-option value="1">true</a-select-option>
            <a-select-option value="0">false</a-select-option>
          </a-select>

          <!-- 选人/部门/混合选人控件 -->
          <!-- :keepDeptIds="cond.keepDeptIds ? cond.keepDeptIds : []" -->
          <staff-selector
            v-else-if="currentType === 'STAFFSELECTOR'"
            v-model="params.modifiedValue"
            :options="getStaffSelectorOpts()"
            :params="{filterType: 'admin' }"
            :keepDeptIds="[]"
          ></staff-selector>
          
          <!-- 下拉 -->
          <a-select :mode="changeItem.propertyType === 14 ? 'default' : 'multiple'" v-model="params.modifiedValue" v-else-if="currentType === 'SELECT'" style="width: 254px">
            <a-select-option :value="item" :key="item" v-for="item in itemOptions">
              {{item}}
            </a-select-option>
          </a-select>

          <!-- 单选 -->
          <a-radio-group v-else-if="currentType === 'RADIO'" :options="itemOptions" v-model="params.modifiedValue" />
          <!-- 复选 -->
          <a-checkbox-group v-else-if="currentType === 'CHECKBOX'" v-model="params.modifiedValue" :options="itemOptions" />
        </div>
        </template>
      </div>

      <div class="content" v-show="showChangLog">
        <div class="log-title">
          <span @click="gotoChange">
            <i class="icon aufontAll h-icon-all-arrow-left-o"></i>
          </span>
          <span>修改记录</span>
        </div>

        <div class="items">
          <div class="item" v-for="(item, index) in logList" :key="item.id + index">
            <div class="about">
              <div>{{item.createdTime}}</div>
              <div>
                <label>修改人</label>
                <p>{{item.userName}}</p>
              </div>
              <div>
                <label>修改字段</label>
                <p>{{item.propertyName}}</p>
              </div>
              <div>
                <label>修改值</label>
                <p>{{item.modifiedValue}}</p>
              </div>
            </div>
            <div class="info">
              <span>修改数据 <font>{{item.total}}</font> 条</span>
              <span>成功 <font>{{item.successCount}}</font> 条</span>
              <span>失败 <font>{{item.failCount}}</font> 条</span>
            </div>
          </div>

          
        </div>
      </div>
      
      <div class="footer" v-show="!showChangLog">
        <span @click="goToChangeLog">批量修改记录</span>
        <div class="btns">
          <a-button @click="visible = false">
            取消
          </a-button>
          <a-button @click="handleOk" :disabled="spinning" type="primary">
            确定 <a-spin v-if="spinning" size="small" class="spin" />
          </a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { listApi } from "@cloudpivot/api";
import { DataItemType } from '@cloudpivot/form/src/schema/data-item-type';
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import moment from 'moment'
import Number from '@cloudpivot/form/src/components/Number/components/pc-input-number.vue'
import NumberFilter from '@cloudpivot/form/utils/number-filter'
import { bizpropertyApi } from "@cloudpivot/api";


interface Options {
  visible: boolean;
  checkeds: any[];
  queryCode: string,
  schemaCode: string,
  checkedWorkflows: string[]
}

@Component({
  name: "batchUpdate",
  components: {
    StaffSelector,
    Number
  },
})

export default class batchUpdate extends Vue {
  @Prop({ default: { visible: false, checkeds: [], queryCode: '', schemaCode: '', checkedWorkflows: [] } }) updateOptions!: Options;
  // @Prop({default: []}) checkedRows:any[];
  @Prop({default: {}}) oldParams: any

  // 修改记录
  showChangLog:boolean = false
  logList: any[] = []
  async goToChangeLog(){
    let res = await listApi.getBatchUpdateLog({
      page: 0,
      size: 99999,
      schemaCode: this.updateOptions.schemaCode
    })
    if(res.errcode === 0){
      this.logList = res.data.content
    }else{
      this.$message.error(res.errmsg || '')
    }

    this.showChangLog = true
  }
  gotoChange(){
    this.showChangLog = false
  }


  isDateModifiedValue:any = ''
  // 格式化传参
  formatData(){
    this.isDateModifiedValue = ''
    switch (this.changeItem.propertyType) {
      case DataItemType.Date:
        if(this.itemOptions.indexOf("EN-APM") + this.itemOptions.indexOf("CN-APM") > -1){
          this.isDateModifiedValue = moment(this.params.modifiedValue).format(this.itemOptions.replace('EN-APM', '').replace('CN-APM', '')).trim()
        }else{
          this.params.modifiedValue = moment(this.params.modifiedValue).format(this.itemOptions)
        }
        break;
      default:
        break;
    }
    return true
  }

  verifyFormula(rule, modifiedValue, valueObj, prompt){
    let inputValue = valueObj.inputValue
    let lInput = valueObj.lInput
    let rInput = valueObj.rInput
    let res = {
      result: true,
      message: '校验通过'
    }
    if(rule === '='){
      if(typeof inputValue === 'number'){
        if(modifiedValue*1 !== inputValue){
          res.result = false
          res.message = prompt
          return res
        }
      } else if(modifiedValue !== inputValue){
        res.result = false
        res.message = prompt
        return res
      }
    }
    if(rule === '>'){
      if(modifiedValue <= inputValue){
        res.result = false
        res.message = prompt
        return res
      }
    }
    if(rule === '<'){
      if(modifiedValue >= inputValue){
        res.result = false
        res.message = prompt
        return res
      }
    }
    if(rule === '>='){
      if(modifiedValue < inputValue){
        res.result = false
        res.message = prompt
        return res
      }
    }
    if(rule === '<='){
      if(modifiedValue > inputValue){
        res.result = false
        res.message = prompt
        return res
      }
    }
    if(rule === '~'){
      if(modifiedValue <= lInput || modifiedValue >= rInput){
        res.result = false
        res.message = prompt
        return res
      }
    }
    return res
  }

  // 数据校验
  async validate(){
    console.log(this.params)
    let res = {
      result: true,
      message: '校验通过'
    }
    if(this.params.modifiedValue === '' || this.params.modifiedValue === undefined || this.params.modifiedValue === null || (typeof this.params.modifiedValue === 'string' && this.params.modifiedValue.trim() === '') ){
      res.result = false
      res.message = '批量修改不能为空值'
      return res
    }

    let rules = this.dataRulesList.filter(el => [el.propertyCode, el.schemaCode + '.' + el.propertyCode].includes(this.params.propertyCode))
    if(rules.length){
      for(let i = 0; i<rules.length;i++){
        let rule:any = rules[i]
        let checkType = rule.checkType
        let options = JSON.parse(rule.options)
        switch (checkType) {
          case 1: // 正则校验
            let regexp:string = options.regexp
            regexp = regexp.slice(1, regexp.length-1)
            let errText = JSON.parse(options.regexpText)
            let reg = new RegExp(regexp);
            if(!reg.test(this.params.modifiedValue)){
              res.result = false
              res.message = errText['zh']
              return res
            }
            break;
          
          case 2: // 提交校验
            let verifyFormula = JSON.parse(options.verifyFormula)
            let type = verifyFormula.type // 1固定值
            let rule = verifyFormula.rule 
            let prompt = verifyFormula.prompt

            if(type === 1){ // 固定值
              // return this.verifyFormula(rule, this.params.modifiedValue, {
              //   inputValue: verifyFormula.input,
              // }, prompt)


              if(rule === '~'){ // 介于两数之间
                let verify =  this.verifyFormula(rule, this.params.modifiedValue, {
                  lInput: verifyFormula.lInput || verifyFormula.lDate,
                  rInput: verifyFormula.rInput || verifyFormula.rDate,
                }, prompt)

                if(!verify.result){
                  return verify
                }
              }else{
                let verify =  this.verifyFormula(rule, this.params.modifiedValue, {
                  inputValue: verifyFormula.input || verifyFormula.date,
                }, prompt)

                if(!verify.result){
                  return verify
                }
              }

            }else{ //动态值
              let select = verifyFormula.select || '' // 对比值
              let lInput = verifyFormula.lSelect || ''
              let rInput = verifyFormula.rSelect || ''
              
              this.oldParams.size = 99999
              // delete this.oldParams.filters
              this.oldParams.objectIds = this.params.objectIds
              if(rule === '~'){ // 介于两数之间
                this.oldParams['options'] = {
                    "queryDisplayType": 1,
                    "customDisplayColumns": [lInput, rInput]
                }
              }else{
                this.oldParams['options'] = {
                    "queryDisplayType": 1,
                    "customDisplayColumns": [select]
                }
              }

              let list:any = await listApi.getQueryList(this.oldParams);

              if(list.errcode === 0){
                let selectDatas = list.data.content.map(el => el.data[select])
                let lInputDatas = list.data.content.map(el => el.data[lInput])
                let rInputDatas = list.data.content.map(el => el.data[rInput])

                if(rule !== '~'){
                  for(let i=0;i<selectDatas.length;i++){
                    let verify =  this.verifyFormula(rule, this.params.modifiedValue, {
                      inputValue: selectDatas[i],
                    }, prompt)

                    if(!verify.result){
                      return verify
                    }
                  }
                }else{ // 介于两值之间
                  for(let i=0;i<lInputDatas.length;i++){
                    let verify =  this.verifyFormula(rule, this.params.modifiedValue, {
                      lInput: lInputDatas[i],
                      rInput: rInputDatas[i]
                    }, prompt)

                    if(!verify.result){
                      return verify
                    }
                  }
                }
              }else{ // 接口报错
                res.result = false
                res.message = list.errmsg
              }
            }
            break;
          case 4: // 文本最大长度校验
            let maxLen = options.maxLength
            if(this.params.modifiedValue.length > maxLen){
              res.result = false
              res.message = this.changeItem.name + '最大长度不能超过' + maxLen
              return res
            }
            break;
          default:
            break;
        }
      }
    }

    return res
  }

  textChange(type){
    let maxLen = 200 
    if(type === 'longText'){
      maxLen = 2000
    }
    if(this.params.modifiedValue.length > maxLen){
      this.$set(this.params, 'modifiedValue', this.params.modifiedValue.substring(0, maxLen))
    }
  }

  showNumText: boolean =  false
  numberShowText: string = ''
  numberChange(evt : Event){
    let txt = this.params.modifiedValue + ''
    let inter = txt.split('.')
    if(inter[0].length > 16){
      inter[0] = inter[0].slice(0, 16)
      // @ts-ignore
      this.$set(this.params,'modifiedValue', +inter.join('.'))
    }
    if(inter[1] && inter[1].length > 8){
      inter[1] = inter[1].slice(0, 8)
      // @ts-ignore
      this.$set(this.params,'modifiedValue', +inter.join('.'))
    }
    
  }
  // 数值类型值改变
  numberBlur(){
    this.numberShowText = NumberFilter({
      // @ts-ignore
      controller: {
        value: this.params.modifiedValue
      },
      options: {
        format1: this.itemOptions
      }
    })
    this.showNumText = true
  }
  showNumTextFocus(){
    this.showNumText = false
    this.$nextTick(()=> {
      // @ts-ignore
      this.$refs.NumInput.focus()
    })
  }

  getParmas(params){
    if(this.itemOptions.indexOf("EN-APM") + this.itemOptions.indexOf("CN-APM") > -1){
      params.modifiedValue = this.isDateModifiedValue
    }
    switch (this.changeItem.propertyType) {
      case DataItemType.Checkbox:
      case DataItemType.DropdownMulti:
        if(Array.isArray(params.modifiedValue)){
          params.modifiedValue = params.modifiedValue.join(';')
        }
        break;
      default:
        break;
    }

  }
  spinning:boolean = false

  async handleOk() {
    this.params.schemaCode = this.updateOptions.schemaCode
    this.params.queryCode = this.updateOptions.queryCode || this.updateOptions.schemaCode
    this.formatData()

    let validated = await this.validate()
    if(!validated.result){
      this.$message.error(decodeURIComponent(validated.message))
      return
    }
    let params = {
      ...this.params
    }

    if(this.updateOptions.checkedWorkflows.length){
      this.$message.warning('流程表单不支持批量修改！', 2)
    }
    params.objectIds = params.objectIds.filter(el => {
      return !this.updateOptions.checkedWorkflows.includes(el)
    })
    this.getParmas(params) // 获取后台需要的格式
    this.spinning = true
    let res = await listApi.batchUpdate(params)
    if(res.errcode === 0){
      this.$emit('updateOver')
      this.visible = false

      this.params.modifiedValue = ''
      let resetParams = {
        ...this.params
      }
      resetParams.modifiedValue = ''
      resetParams.propertyCode = ''
      this.params = resetParams


    }else{
      this.$message.error(res.errmsg || '')
    }
    this.spinning = false
  }
  visible: boolean = false

  list:any[] = []
  async getDataItems(){
    let params = {
      schemaCode: this.updateOptions.schemaCode,
      formCode: this.updateOptions.queryCode
    }
    let res = await listApi.getDataItems(params)

    if(res.errcode === 0){
      let children:any[] = []  
      res.data.forEach(element => {
        if(element.propertyType === DataItemType.Sheet){
          let fater = {
            name: element.name,
            code: element.code
          }
          let chlids = element.subSchema.properties
          chlids.forEach(chlid => {
            chlid.name = fater.name + '.' + chlid.name
            chlid.code = fater.code + '.' + chlid.code
          });
          
          children = [...children, ...chlids]
        }
      });
      res.data = [...res.data, ...children]
      this.list = res.data.filter(el => [
        DataItemType.ShortText,
        DataItemType.LongText,
        DataItemType.Number,
        DataItemType.Date,
        DataItemType.Logic,
        DataItemType.Radio,
        DataItemType.Checkbox,
        DataItemType.Dropdown,
        DataItemType.DropdownMulti,
        DataItemType.StaffSingle,
        DataItemType.StaffMulti,
        DataItemType.DeptSingle,
        DataItemType.DeptMulti,
        DataItemType.StaffDeptMix
      ].includes(el.propertyType)).filter(el => !el.defaultProperty)
      // 拥有者不支持批量修改
      // ].includes(el.propertyType)).filter(el => !el.defaultProperty || el.code === 'owner')
    }
  }

  get filterList(){
    return this.list.filter(el => {
      let code = el.code
      let codeArr = code.split('.')
      if(codeArr.length === 2){
        code = codeArr[1]
      }
      let noRepeatItem = this.noRepeatItems.filter(item => item.propertyCode === code)

      if(noRepeatItem.length){
        return false
      }
      return true
    })
  }

  changeItem: any = {}
  changeItemChange(){
    this.params.modifiedValue = ''
    this.changeItem = this.list.find(el => el.code === this.params.propertyCode)
    this.changeItemType()
  }

  // 返回选人控件类型需要的参数
  getStaffSelectorOpts() {
    let cond = this.changeItem.propertyType
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


  async getData(options){
    // 转换业务数据
    function getOptions(
      schemaCode: string, 
      queryCode: string, 
      sheetDataItem: string, 
      orderByFields: string[], 
      orderType: number, 
      condition: any) {
      let options = {
        customDisplayColumns: [sheetDataItem]
      };
      const obj: any = {
        queryCode,
        schemaCode,
        options,
        orderByFields,
        orderType,
        page: 0,
        size: 1000,
        filters: [],
        condition
      };
      return listApi.listSkipQueryList(obj).then(res => {
        if (res.errcode === 0) {
          const data: string[] = [];
          res.data.content.forEach((x: any) => {
            const s = x.data[sheetDataItem];
            let t = "";
            if (s && data.indexOf(s) === -1) {
              if (sheetDataItem === "sequenceStatus") {
                switch (s) {
                  case "DRAFT":
                    t = "草稿";
                    break;
                  case "PROCESSING":
                    t = "进行中";
                    break;
                  case "COMPLETED":
                    t = "已完成";
                    break;
                  case "CANCELED":
                    t = "已作废";
                    break;
                  default:
                    break;
                }
                data.push(t);
              } else {
                data.push(s);
              }
            }
          });
          return data;
        }
        return [];
      });
    }
    let res = await getOptions(
      options.schemaCode,
      '',
      options.sheetDataItem,
      [options.orderByFields],
      options.orderType,
      ''
    )
    if(res){
      return res
    }
  }

  // 处理单选、多选、下拉单选、下拉多选，使用数据字典、自定义、业务数据时渲染数据
  async formatOptions(options){
    if(~options.indexOf('checkedDictionary')){ // 使用了字典数据
      let useDictionariesData = JSON.parse(options).useDictionariesData
      return useDictionariesData.map(el => el.name)
    }else if(~options.indexOf('schemaCode')){ // 使用业务模型
      return await this.getData(JSON.parse(options))
    }else{
      return options.split(';')
    }
  }

  itemOptions: any = ''
  currentType = 'SORTTEXT'
  async changeItemType(){
    let type = "SORTTEXT"
    switch (this.changeItem.propertyType) {
      case DataItemType.ShortText:
        type = "SORTTEXT"
        break;
      case DataItemType.LongText:
        type = "LONGTEXT"
        break;
      case DataItemType.Date:
        try {
          this.itemOptions = JSON.parse(this.changeItem.options).format
        } catch (error) {}
        type = "DATE"
        break;
      case DataItemType.Number:
        type = "NUMBER"
        this.itemOptions = JSON.parse(this.changeItem.options).format
        break;
      case DataItemType.Logic:
        type = "LOGIC"
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.DeptSingle:
      case DataItemType.DeptMulti:
      case DataItemType.StaffDeptMix:
        type = "STAFFSELECTOR"
        break;
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        try {
          this.itemOptions = await this.formatOptions(JSON.parse(this.changeItem.options).options)
        } catch (error) {}
        type = "SELECT"
        if(DataItemType.DropdownMulti === this.changeItem.propertyType){
          // @ts-ignore
          this.params.modifiedValue = []
        }
        break;
      case DataItemType.Radio:
        try {
          this.itemOptions = await this.formatOptions(JSON.parse(this.changeItem.options).options)
        } catch (error) {}
        type = "RADIO"
        break;
      case DataItemType.Checkbox:
        try {
          this.itemOptions = await this.formatOptions(JSON.parse(this.changeItem.options).options)
        } catch (error) {}
        type = "CHECKBOX"
      default:
        break;
    }

    this.currentType = type
    return type
  }


  @Watch('updateOptions')
  updateOptionsChange(){
    if(this.updateOptions.visible){
      this.getDataItems()
      this.visible = true
      // @ts-ignore
      this.params.objectIds = [...this.updateOptions.checkeds]
      this.params.modifiedValue = ''
      this.params.propertyCode = ''
      this.changeItem = {}
      this.showChangLog = false
    }
  }

  @Watch('visible')
  onVisibleChange(val){
    if(!val){
      this.$emit('visibleChange', val)
    }
  }

  params = {
    "modifiedValue": '',
    "objectIds": [],
    "propertyCode": "",
    "queryCode": "",
    "schemaCode": ""
  }

  dataRulesList:any[] = [] // 数据规则列表
  async getDataRules(){ // 获取数据规则
    let params = {
      schemaCode: this.updateOptions.schemaCode
    }
    const res:any = await bizpropertyApi.getDataRules(params);
    if (res.errcode === 0) {
      this.dataRulesList = res.data
    }
  }
  get noRepeatItems(){ // 校验规则中去重数据项
    return this.dataRulesList.filter(el => el.checkType === 5)
  }

  created(){
    this.getDataRules()
  }

}
</script>
<style lang="less" scoped>
  .footer{
    border-top: 1px solid #e8e8e8;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    span{
      font-size: 14px;
      color: #2970FF;
      cursor: pointer;
    }
    .btns{
      button{
        margin-left: 8px;
      }
    }
  }
  .change-data-wrapper{
    max-height: 400px;
    overflow: auto;
    &>*{
      width: 100%;
    }
  }
  .title{
    font-size: 16px;
    color: rgba(0, 0, 0, 0.85);
    small{
      opacity: 0.85;
      color: #888888;
      margin-left: 15px;
      font{
        color: #2970FF
      }
    }
  }

  .content {
    padding-bottom: 64px;
    p{
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      margin-top: 22px;
      margin-bottom: 10px;
    }
    .tips{
      p{
        margin-top: 0;
        margin-bottom: 0;
      }
      ul{
        margin-top: 10px;
        li{
          list-style: none;
          color: #888;
          opacity: 0.85;
          line-height: 24px;
          font-size: 12px;
        }
      }
    }

    .log-title{
      position: relative;
      text-align: center;
      height: 24px;
      line-height: 24px;
      span:first-child{
        position: absolute;
        left: 0;
        width: 24px;
        height: 24px;
        color: #2970FF;
        cursor: pointer;
        i{
          position: absolute;
          left: 0;
          top: 50%; 
          transform: translateY(-50%);
        }
      }
    }
    .item{
      background-color: #f9f9f9;
      padding: 8px 16px;
      margin-top: 10px;
      .about{
        position: relative;
        font-size: 14px;
        padding-bottom: 8px;
        line-height: 2;
        p{
          margin: 0;
          padding: 0;
        }
        div:nth-child(1){
          color: rgba(0, 0, 0, 0.85);
        }
        div:nth-child(2), div:nth-child(3), div:nth-child(4){
          font-size: 12px;
          display: flex;
          label{
            width: 5em;
            color: rgba(0, 0, 0, 0.65);
          }
          p{
            flex: 1;
            font-size: 12px;
          }
        }

        &::after{
          content: '';
          width: 100%;
          height: 1px;
          background-image: linear-gradient(to right, #ccc 0%, #ccc 50%, transparent 50%);
          background-size: 10px 1px;
          background-repeat: repeat-x;
          bottom: 0;
          left: 0;
          position: absolute;
        }
      }
      .info{
        padding-top: 8px;
        span{
          font-size: 12px;
          color: rgba(0, 0, 0, 0.65);
          margin-right: 40px;
          &:nth-child(1){
            font{
              color: #2970FF;
            }
          }
          &:nth-child(2){
            font{
              color: #52c41a;
            }
          }
          &:nth-child(3){
            font{
              color: #ff4d4f;
            }
          }
        }
      }
    }
  }
  .items{
    max-height: 500px;
    overflow: auto;
  }

  .cus-input{
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
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
  }

  .spin{
    margin-left: 5px;
  }
  // .spin /deep/.ant-spin-dot-item{
  //   background-color: #fff;
  // }
</style>
