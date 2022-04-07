<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.Calculation')"
    :visible="true"
    width="612px"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @cancel="closeModal"
    @ok="backData"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="calculate-rule">
      <div class="data-item clearfix">
        <div class="title">
          <span>{{ $t('languages.Apps.FormDesignPage.DataItem') + 'ddd'}}:</span>
        </div>
        <div>
          <config-provider :locale="locale">
          <a-select
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="dataItemChange"
          >
            <a-select-option
              v-for="(dataitem, i) in dataItems"
              :key="i"
              :value="dataitem.code"
            >{{ `${dataitem.name}[${dataitem.code}]` }}</a-select-option>
          </a-select>
          </config-provider>
        </div>
        <div>
          <a-button @click="pushDataItem">{{ $t('languages.Apps.FormDesignPage.Insert') }}</a-button>
        </div>
      </div>
      <div class="btn-group">
        <ul class="clearfix sum">
          <li v-for="(rule, i) in ruleList" :key="i" @click="ruleBtnClick(rule)">
            <a-button>{{ rule }}</a-button>
          </li>
        </ul>
      </div>
      <div class="btn-tips">
        <p
          v-for="(tip, index) in tips"
          :key="index"
        >
          {{ tip }}
        </p>
      </div>
      <div class="text-area">
        <!-- <a-textarea
          v-model="ruleString"
          ref="ruletextarea"
          @click="getCursorIndex"
          @change="getCursorIndex"
        ></a-textarea> -->
        <div
          ref="ruleHTMLRef"
          :id="contentId"
          class="ant-input"
          contenteditable="true"></div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Emit, Prop } from "vue-property-decorator";
import { FormControlType } from "@cloudpivot/form/schema";
import * as dataitemStore from "../stores/data-items.store-helper";

import { schema } from '@cloudpivot/form'

import textBeComeImg from '@/utils/text-image'
import { ConfigProvider } from "@h3/antd-vue";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

interface IruleArr {
  type: 'string'|'img' // ruleHTML中元素类型
  val: string, // ruleHTML中元素内容
  len: number, // ruleHTML中元素长度
  data?: any // IMG类型 完整数据
  id?: string
}
let ruleHTMLNode: any = ''
@Component({
  name: "CalculateRule",
  components: {
    ConfigProvider
  }
})
export default class CalculateRule extends Vue {
  @Prop({
    type: Object
  })
  modalData!: any;
  @Prop()
  dataItem !:any;
  @Prop()
  getFormControls
  
  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }
  ruleList: Array<string> = ['STRING', 'SUBSTRING', 'DATEDIF','YEAR','MONTH','DAY','WEEKNUM','QUARTER','HOUR','MINUTE','SECOND'];
  tips: Array<string> = [];
  ruleTips: { [key: string]: Array<string> } = {
    'STRING': [
      'STRING函数可以将多个数据项的值合并成一个文本',
      '用法：STRING(数据项1,数据项2,…),支持短文本、日期、数值、选人控件类型的数据项; ',
      '示例：STRING(“奥哲云枢“,”张三“)会返回”奥哲云枢张三“'
    ],
    'SUBSTRING': [
      'SUBSTRING(【参数】,s,e)，文本截取函数',
      '用法：SUBSTRING(数据项,开始位置,结束位置)；',
      '示例：SUBSTRING(数据项,2,7)，数据项的内容为“奥哲云枢低代码平台”，会返回“云枢低代码“；数据项只支持短文本类型的数据项；结束位置允许不输入，当结束位置不输入时，将截取到文本的最后位置。'
    ],
    'DATEDIF': [
      'DATEDIF函数可以计算两个日期时间相差的年数、月数、天数、小时数、分钟数、秒数；',
      '用法：DATEDIF(【结束时间】,【开始时间】,【单位】)，单位可以是”y”、”M”、”d”、”h”、”m“、”s”；',
      '示例：DATEDIF(结束时间,开始时间,”h”)，如果下单时间是9:00，付款时间是当天10:30，计算得到的小时差为1.5小时。'
    ],
    'YEAR': [
      'YEAR函数可以获取某日期的年份',
      '用法：YEAR(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：YEAR(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回2020年。'
    ],
    'MONTH': [
      'MONTH函数可以获取某日期是当年的第几月',
      '用法：MONTH(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：MONTH(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回1月。'
    ],
    'DAY': [
      'DAY函数可以获取某日期是当月的第几日',
      '用法：DAY(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：DAY(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回20日。',
    ],
    'WEEKNUM': [
      'WEEKNUM函数可以获取某日期是当年的第几周',
      '用法：WEEKNUM(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：WEEKNUM(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回第4周。'
    ],
    'QUARTER': [
      'QUARTER函数可以获取某日期是当年的第几季度',
      '用法：QUARTER(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：QUARTER(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回1季度。'
    ],
    'HOUR': [
      'HOUR函数可以获取某日期当中的小时数',
      '用法：HOUR(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：HOUR(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回9时。'
    ],
    'MINUTE': [
      'MINUTE函数可以获取某日期当中的分钟数',
      '用法：MINUTE(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：MINUTE(入职时间)，如果入职时间是2020-01-20 9:30:00，会返回30分。'
    ],
    'SECOND': [
      'SECOND函数可以获取某日期当中的秒钟数',
      '用法：SECOND(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本；',
      '示例：SECOND(入职时间)，如果入职时间是2020-01-20 9:30:30，会返回30秒。'
    ]
  }
  ruleString: string = "";
  textArea: any = null;
  cursorIndex: any = null;
  dataItems: any[] = [];
  types:number[] = [FormControlType.Text, FormControlType.Dropdown,FormControlType.DropdownMulti,FormControlType.Date, FormControlType.Number, FormControlType.Radio, FormControlType.Checkbox, FormControlType.StaffSelector, FormControlType.StaffMultiSelector];
  selectDataItem: any = "";
  ruleHTML: any = ""
  ruleArr:IruleArr[] = []
  created() {
    let allControls = this.getFormControls();
    let code = this.dataItem.code;
    let { parentCode = '' } = this.dataItem
    let arr = []
    let allCtrlKeys = Object.keys(allControls)
    console.log(allCtrlKeys)
    if (parentCode) {
      let allCode = `${parentCode}.${code}`
      for(let key of allCtrlKeys) {
        let item = allControls[key]
        if (this.types.includes(item.type)) {
          this.dataItems.push({
            name: item.options.name,
            code: item.key
          })
        } else if (item.type === FormControlType.Sheet && item.key === parentCode) {
            for(let cl of item.columns) {
              if (this.types.includes(cl.type) && cl.key !== code) {
                  this.dataItems.push({
                    name: cl.options.name,
                    code: `${cl.parentKey}.${cl.key}`
                  })
              }
            }
            this.dataItems.push({
              name:'子表排序号',
              code:`${parentCode}.sortKey`
            })
          } else if (item.type === FormControlType.Tabs) {
            console.log(item)
            const loop = [item]
            while(loop.length) {
              let loopItem = loop.shift()
              for(let lt of loopItem.panels) {
                let pnCtrlKeys = Object.keys(lt.controls)
                for(let pnCtrlKey of pnCtrlKeys) {
                  let pnCtrl = lt.controls[pnCtrlKey]
                  if (this.types.includes(pnCtrl.type)) {
                      this.dataItems.push({
                        name: pnCtrl.options.name,
                        code: `${pnCtrl.key}`
                      })
                  } else if(pnCtrl.type === FormControlType.Sheet && pnCtrl.key === parentCode){
                    for(let cl of pnCtrl.columns){
                      if (this.types.includes(cl.type) && cl.key !== code) {
                        this.dataItems.push({
                          name: cl.options.name,
                          code: `${cl.parentKey}.${cl.key}`
                        })
                      }
                    }
                    this.dataItems.push({
                      name:'子表排序号',
                      code:`${parentCode}.sortKey`
                    })

                  } else if (pnCtrl.type === FormControlType.Tabs) {
                    loop.push(pnCtrl)
                  }
                }
              }
            }
          }
        }
     } else {
        for(let key of allCtrlKeys) {
          let item = allControls[key]
          if (this.types.includes(item.type) && item.key !== code) {
            this.dataItems.push({
              name: item.options.name,
              code: item.key
            })
          } else if (item.type === FormControlType.Tabs) {
            console.log(item)
            const loop = [item]
            while(loop.length) {
              let loopItem = loop.shift()
              for(let lt of loopItem.panels) {
                let pnCtrlKeys = Object.keys(lt.controls)
                for(let pnCtrlKey of pnCtrlKeys) {
                  let pnCtrl = lt.controls[pnCtrlKey]
                  if (this.types.includes(pnCtrl.type) && pnCtrl.key !== code) {
                      this.dataItems.push({
                        name: pnCtrl.options.name,
                        code: `${pnCtrl.key}`
                      })
                  } else if (pnCtrl.type === FormControlType.Tabs) {
                    loop.push(pnCtrl)
                  }
                }
              }
            }
          }
        }
     }

  }
   /** 全部的 */
  /**
   * notUsed 未使用
   */
  get dataItemCodeList() {
    const codeArr: any[] = [];
    const length: number = this.items.length;
    for (let i = 0; i < length; i += 1) {
      codeArr.push(this.items[i].code);
    }
    return codeArr;
  }
  get items() {
    // 取消只显示发布后的数据项
    const initiallyArr = dataitemStore.getDataItems(this);
    const dataArr = JSON.parse(JSON.stringify(initiallyArr));
    const targetArr: any[] = [];
    const length: number = dataArr.length | 0;
    for (let i = 0; i < length; i += 1) {
      targetArr.push(dataArr[i]);
      if (dataArr[i].type === 8 && dataArr[i].properties) {
        const parentCode: string = dataArr[i].code;
        const subDataItem = dataArr[i].properties as any;
        const subLength: number = subDataItem.length | 0;
        for (let j = 0; j < subLength; j += 1) {
          subDataItem[j].code = `${parentCode}.${subDataItem[j].code}`;
          targetArr.push(subDataItem[j]);
        }
      }
    }

    let result = targetArr.filter((res:any) => {
      return this.types.includes(res.type) && (!res.isSystem || (res.isSystem && res.code.search('sortKey') > -1));
    });
    return result;
  }

  dataItemIs(key: string, type : schema.DataItemType){
    const idx = key.indexOf('.');
    const items = dataitemStore.getDataItems(this);
    let item : any;

    if(idx > -1){
      const parentKey = key.substr(0, idx);
      const parent = items.find(x => x.code === parentKey);
      if(parent && parent.properties){
        key = key.substr(idx + 1);
        item = parent.properties.find(x => x.code === key);
      }
    }else{
      item = items.find(x => x.code === key);
    }
    return item && item.type === type;
  }

  /**
   * @Author: Fan
   * @Description: 解析字符串,插入ruleNode中
   * @param {type} string
   * @Date: 2019-12-20 14:41:53
   */
  parseStringToNode(str) {
    let tempType = ''
    let tempStr = ''
    for (let s of str.split('')) {
      if(s === '{') {
        if (tempType === 'text' && !!tempStr) {
          ruleHTMLNode.insertAdjacentText('beforeend',tempStr)
        }
        tempType = 'img';
        tempStr = ''
      } else if (s === '}') {
        if (tempType === 'img') {
          let d = this.dataItems.filter( (item) => item.code === tempStr)
          if (d.length) {
            let dataItem = d[0]
            let imgID = Math.ceil(Math.random() * 1000)+dataItem.code
            let imgSrc = textBeComeImg(dataItem.name)
            let imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='{${dataItem.code}}'>`;
            ruleHTMLNode.insertAdjacentHTML('beforeend',imgNode)
            tempType = '';
            tempStr = ''
          } else {
            ruleHTMLNode.insertAdjacentText('beforeend','{'+tempStr+'}')
            tempType = '';
            tempStr = ''
          }
        } else {
          tempType = 'text'
          tempStr += '}'
        }
      } else {
        if (!tempType) {
          tempType = 'text'
        }
        tempStr += s
      }
    }
    if (tempStr) {
      ruleHTMLNode.insertAdjacentText('beforeend',tempStr)
    }
  }
  mounted() {
    this.$nextTick(() => {
      document.addEventListener('selectionchange', this.selectHandler);
      ruleHTMLNode = document.getElementById(this.contentId);
      const data = this.modalData.data;
      if (data && data.value) {
        console.log('created => ', data.value)
        console.log('ruleHTMLNode', ruleHTMLNode)
        this.parseStringToNode(data.value.replace(/"/g, ''))
      }
    })
    
  }
  /**
   * 数据项切换
   */
  dataItemChange(val: any) {
    let item = this.dataItems.filter((v:any) => (v.code === val))[0]
    this.selectDataItem = item;
  }

  pushDataItem() {
    if (this.selectDataItem) {
        let imgID = Math.ceil(Math.random() * 1000)+this.selectDataItem.code
        let imgSrc = textBeComeImg(this.selectDataItem.name)
      if (!!this.savedRange.commonAncestorContainer) {
        // let start = this.savedRange.startOffset
        // let end = this.savedRange.endOffset
        let imgNode = document.createElement('img')
        imgNode.src = imgSrc
        imgNode.id = imgID
        imgNode.dataset.val = `{${this.selectDataItem.code}}`
        this.savedRange.insertNode(imgNode)
        this.savedRange.collapse(true)
      } else {
        let imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='{${this.selectDataItem.code}}'>`;
        ruleHTMLNode.insertAdjacentHTML('beforeend',imgNode)
      }
    }
  }

  /**
   * 设置光标位置
   */
  setCursorPosition(ctrl: any, pos: any) {
    if (ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(pos, pos);
    } else if (ctrl.createTextRange) {
      const range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd("character", pos);
      range.moveStart("character", pos);
      range.select();
    }
  }
  ruleBtnClick(rule: string) {
    if(!!this.savedRange.commonAncestorContainer) {
      let textNode = document.createTextNode(`${rule.toLowerCase()}()`)
      this.savedRange.insertNode(textNode)
      this.savedRange.collapse(true)
    } else {
      ruleHTMLNode.insertAdjacentText('beforeend',`${rule.toLowerCase()}()`)
    }
    this.tips = this.ruleTips[rule];
  }
  /**
   * 获取鼠标光标下标
   */
  getCursorIndex() {
    this.cursorIndex = this.textArea.$el.selectionStart;
    console.log(this.textArea.$el.selectionStart);
  }
  backData() {
    let ruleString = this.formatterRuleHTML();
    let msg = this.testExp(ruleString);

    if (msg && ruleString) {
      // @ts-ignore
      this.$message.error(msg);
      return;
    }

    const backData = {
      value: ruleString
    };
    console.log(backData)
    this.$emit("backData", backData);
  }
  /**
   * @Author: Fan
   * @Description: 将 ruleHTMLNode数据 格式话成字符串
   * @URL:http://redmine.h3bpm.com/issues/31177
   * @Date: 2019-12-20 13:48:11
   */
  formatterRuleHTML() {
    let str = '';
    let idx = 0;
    for (let n of ruleHTMLNode.childNodes) {
      
      if (n.nodeName === 'IMG') {
        str += `${n.dataset.val}`
      } else if (n.nodeName === '#text' && !!n.textContent) {
        str += `${n.textContent}`
      }
      idx++;
    }
    return str
  }
  closeModal() {
    this.$emit("closeModal");
  }


  testExp(exp: string){
    if(!exp || !exp.trim()){
      return;
    }

    const startIdx = exp.indexOf('(');
    if(startIdx === -1){
      return;
    }

    const testIsCode = (str: string) => /^\{\w+(?:\.\w+)*\}$/.test(str.trim())

    const testIsInt = (str: string) => /^\d+$/.test(str.trim())

    const testIsString = (str: string) => /^(?:'(?:\S|\s)+')$/.test(str.trim())

    const testIsFn = (str: string) => /^\w+\(\S+\)$/.test(str.trim())

    const getDataItemKey = (str: string) => {
      if(!str){
        return str;
      }

      str = str.trim();
      return str.substr(1, str.length - 2);
    }


    const key = exp.substring(0,startIdx).trim();

    const endIdx = exp.lastIndexOf(')');
    const arr = exp.substring(startIdx + 1, endIdx).trim().split(',');

    const segs : string[] = [];
    const stack : number[] = [];

    arr.forEach((token,idx) => {
      if(token.indexOf('(') > -1 && token.indexOf(')') === -1){

        Array(token.length).fill(0).map((_,i) => token[i])
          .filter(c => c === '(')
          .forEach(()=> stack.push(idx))

      }else if(token.indexOf('(') === -1 && token.indexOf(')') > -1){
        let start = -1;
        
        Array(token.length).fill(0).map((_,i) => token[i])
          .filter(c => c === ')')
          .forEach(()=> {
            const num = stack.pop();
            if(num !== undefined){
              start = num;
            }
          })

        if(stack.length === 0){
          segs.push(arr.slice(start,idx + 1).join(','));
        }
      }else if(stack.length === 0){
        segs.push(token);
      }
    });
    
    if(key === 'substring'){
      
      if(segs.length < 2 || segs.length > 3){
        return `${key}函数参数为2-3个：${exp}`;
      }

      if(!testIsInt(segs[1])){
        return `${key}函数第2个参数必须是数字：${segs[1]}`;
      }
      
      if(segs.length === 3 && !testIsInt(segs[2])){
        return `${key}函数第3个参数必须是数字：${segs[1]}`;
      }

      if(testIsFn(segs[0])){
        const msg = this.testExp(segs[0]);
        if(msg){
          return msg;
        }
      }else if(!testIsCode(segs[0]) && !testIsString(segs[0])){
        return `${key}函数第1个参数格式不正确：${exp}`;
      }

    }else if(key === 'datedif'){
      
      if(segs.length !== 3){
        return `${key}函数参数为3个：${exp}`;
      }

      if(testIsCode(segs[0])){
        if(!this.dataItemIs(getDataItemKey(segs[0]), schema.DataItemType.Date)){
          return `${key}函数第1个参数必须是日期类型数据项：${exp}`;
        }
      }else{
        return `${key}函数第1个参数格式不正确：${segs[0]}`;
      }
      
      if(testIsCode(segs[1])){
        if(!this.dataItemIs(getDataItemKey(segs[1]), schema.DataItemType.Date)){
          return `${key}函数第2个参数必须是日期类型数据项：${exp}`;
        }
      }else{
        return `${key}函数第2个参数格式不正确：${segs[1]}`;
      }
      
      if(/'[yMdhms]{1}'/.test(segs[2].trim()) === false){
        return `${key}函数第3个参数必须是'yMdhms'其中之一的字符：${segs[2]}`;
      }

    }else if(key === 'year' || key === 'month' || key === 'day'
      || key === 'weeknum' || key === 'quarter' || key === 'hour'
      || key === 'minute' || key === 'second'){

      if(segs.length !== 1){
        return `${key}函数参数为1个：${exp}`;
      }

      if(testIsCode(segs[0])){
        if(!this.dataItemIs(getDataItemKey(segs[0]), schema.DataItemType.Date)){
          return `${key}函数第1个参数必须是日期类型数据项：${exp}`;
        }
      }else{
        return `${key}函数第1个参数格式不正确：${segs[0]}`;
      }

    }else if(key === 'string'){
      
      if(segs.length < 2){
        return `${key}函数参数不能少于2个：${exp}`;
      }

      for(let i = 0; i<segs.length; i++){
        const seg = segs[i];
        if(testIsFn(seg)){
          const msg = this.testExp(seg);
          if(msg){
            return msg;
          }
        // }else if(testIsCode(seg)){
        //   if(!this.dataItemIs(getDataItemKey(segs[0]), schema.DataItemType.ShortText)){
        //     return `${key}函数第${i + 1}个参数必须是短文本类型数据项：${exp}`;
        //   }
        }else if(!testIsCode(seg) && !testIsString(seg)){
          return `${key}函数第${i + 1}个参数格式不正确：${exp}`;
        }
      }

    }else{
      return `未知的函数${key}`;
    }
  }


  contentId = `content${this.getGuid()}`
  savedRange:any = {}
  getGuid() {
    // 生成随机ID
    return `r${new Date().getTime()}d${Math.ceil(Math.random() * 1000)}`;
  }
  selectHandler() {
    // 监听选定文本的变动
    let sel = window.getSelection();

    let range:any = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (
      !!range &&
      range.commonAncestorContainer &&
      range.commonAncestorContainer.ownerDocument.activeElement.id === this.contentId
    ) {
      this.savedRange = range;
      !ruleHTMLNode && (ruleHTMLNode=range.commonAncestorContainer)
    }
  }

}
</script>
<style lang="less" scoped>
.calculate-rule {
  .data-item {
    margin-bottom: 16px;
    & > div {
      float: left;
      .select {
        width: 308px;
        margin: 0 8px;
      }
    }
    /deep/.title {
      span {
        line-height: 32px !important;
      }
    }
  }
  .btn-group {
    
    ul {
      margin-bottom: 0;
      li {
        float: left;
        margin-right: 16px;
        
        /deep/ button {
          padding: 0 10px;
          text-align: center;
          margin-bottom: 10px;
          span {
            line-height: 32px;
          }
        }
      }
    }
  }
  .btn-tips {
    margin-top: 2px;
    margin-bottom: 12px;
    p{
      margin-bottom: 0;
      font-size:12px;
      line-height:20px;
      color:rgba(0,0,0,0.45);
    }
  }
  .text-area {
    & textarea, & > div.ant-input {
      width: 100%;
      height: 142px;
      border-radius: 4px;
    }
  }
}
</style>
