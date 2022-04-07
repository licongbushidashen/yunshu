
<template>
  <div class="input-wrapper" :ref="'inputWrapper' + inputId" >
    <div class="text" v-if="readonly">{{ val }}</div>
    <template v-else>
      <h3-textarea
        v-if="isTextarea"
        v-model="val"
        :placeholder="placeholder"
        :autosize="rows"
        :maxLength="maxLength"
        :disabled="readonlyFormula"
        @change="onChange"
      ></h3-textarea>


      <template v-else>
        <a-tooltip  placement="topLeft" :visible="!!showTip">
          <template #title >{{showTip}}</template>
        </a-tooltip>
        <a-input
          v-model="val"
          :placeholder="placeholder"
          :disabled="readonlyFormula"
          @keydown="onKeydown"
          @keyup="onKeyup"
          style="width:100%"
          @blur="onBlur"
          @change="onChange"
          @focus="onFocus"
        ></a-input>

        <ul class="search-res" v-if="isShowSearch" :style="{width: searchResWidth, left: searchResLeft, top: searchResTop,}">
          <li v-for="item in filterDictionaryDataList" :key="item.id" @click="checkData(item.name)">{{item.name}}</li>
        </ul>
      </template>

    </template>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { formApi } from "@cloudpivot/api";

import {
  RendererFormControl,
  FormControlType,
  TextOptions
} from "@cloudpivot/form/schema";

import { TextInputControl } from "@cloudpivot/form/src/common/controls/input-controls/text-input-control";

import { Input,Tooltip } from "@h3/antd-vue";

import H3Textarea from "@cloudpivot/form/src/common/components/h3-textarea.vue";

import MutilText from "@cloudpivot/form/src/common/components/mutil-text.vue";

@Component({
  name: "pc-input-text",
  components: {
    AInput: Input,
    ATooltip: Tooltip,
    // ATextarea: Input.TextArea,
    H3Textarea,
    MutilText
  }
})
export default class PcInputText extends TextInputControl {
  showTip: string = '';

  onKeydown(evt: KeyboardEvent) {
    const key = evt.key.toLowerCase();
    if (key !== "delete" && key !== "backspace") {
      if (this.ctrl.value && this.ctrl.value.length > this.maxLength) {
        evt.preventDefault();
      }
    }
  }

  onKeyup() {
    if (this.ctrl.value && this.ctrl.value.length > this.maxLength) {
      const val = this.ctrl.value.substr(0, this.maxLength);
      this.setValue(val);
    }
  }

  onBlur() {
    super.validate();
    setTimeout(()=> {
      this.focus = false
    },300)
  }

  focus:boolean = false
  onFocus(){
    this.focus = true
    this.getDictionaryData()
  }
  timer: any = null;

  onChange() {
    if(this.dictionaryId){
      this.getDictionaryData()
    }
    const val = this.val.length === 0 ? null : this.val;
    if (this.val.length > this.maxLength) {
      this.showTip = this.control.options && (this.control.options as any).maxLengthTips ? (this.control.options as any).maxLengthTips : '';
      if (this.showTip){
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showTip = '';
        }, 3000);
      }
    }
    this.setValue(val);
  }

  // 是否启用数据字典
  isUseDataDictionary:boolean = false
  dictionaryId: string = ''
  inputId:string = +new Date() + ''
  dictionaryData: any[] = [] // 数据字典数据

  getElementPosition(e){
    var offset=e.getBoundingClientRect()
    return offset;
  }

  get isShowSearch(){
    if(this.$refs['inputWrapper' + this.inputId]){
      this.searchResLeft = this.getElementPosition(this.$refs['inputWrapper' + this.inputId]).x + 'px'
      this.searchResTop = this.getElementPosition(this.$refs['inputWrapper' + this.inputId]).y + 32 + 'px'

      // @ts-ignore
      this.searchResWidth = this.$refs['inputWrapper' + this.inputId].clientWidth + 'px'
    }
    return this.focus && this.filterDictionaryDataList.length && this.val !== ''
  }

  get filterDictionaryDataList(){
    if(this.val === ''){
      return this.dictionaryData
    }
    return this.dictionaryData.filter((el) => !!~el.name.indexOf(this.val))
  }


  async getDictionaryData(){
    if(this.isUseCheckData){
      return
    }
    let res:any = await formApi.getEnableRecordsByDictionaryId({
      dicId: this.dictionaryId,
    })
    if(res.errcode === 0){
      this.dictionaryData = res.data
    }
  }

  checkData(name){
    this.val = name
    this.setValue(name)
  }

  useDictionariesData:any[] = []

  isUseCheckData: boolean = false // 是否仅使用配置的字典数据，否则使用全字典最新数据
  created(){
    try {
      this.control.options.dictionaryData = JSON.parse(this.control.options.dictionaryData).dictionaryData
    } catch (error) {
    }
    if(this.control.options && this.control.options.dictionaryData && this.control.options.dictionaryData.isUseDataDictionary){

      this.isUseDataDictionary = true
      try {
        let options:any = {}
        if(typeof this.control.options.dictionaryData.options.value === 'string'){
          options = JSON.parse(this.control.options.dictionaryData.options.value)
        }else{
          options = this.control.options.dictionaryData.options.value
        }

        console.log('111=>>',options)
        this.dictionaryId = options.checkedDictionary || ''
        this.useDictionariesData = options.useDictionariesData
        this.dictionaryData = options.useDictionariesData

        if(options.useDictionariesData.length){
          this.isUseCheckData = true
        }
      } catch (error) {
        console.log('666==>', error)
      }
    }
  }

  mounted(){
    // @ts-ignore
    this.searchResWidth = this.$refs['inputWrapper' + this.inputId].clientWidth + 'px'
  }
  searchResWidth:string = '0'
  searchResLeft:string = '0'
  searchResTop:string = '0'
}
</script>

<style lang="less" scoped>
.input-wrapper{
  position: relative;
  .search-res{
    position: fixed;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    max-height: 200px;
    overflow: auto;
    z-index: 99;
    li{
      padding: 0 10px;
      height: 32px;
      line-height: 32px;
      cursor: pointer;
      &:hover{
        background-color: #f8f8f8;
      }
    }
  }
}

.textarea-warp {
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 4px;

  & > textarea {
    border: none;
    box-shadow: none;
  }

  & > div {
    text-align: right;
    color: rgba(0, 0, 0, 0.25);
    bottom: 0;
    padding-right: 12px;
    user-select: none;
    font-size: 13px;

    & > .error {
      color: #f5222d;
    }
  }
}

.text {
  white-space: pre-wrap;
  word-break: break-all;
}
.eye{
    // vertical-align: 2px;
    font-size: 14px;
    margin-left: 16px;
    cursor: pointer;
  }
</style>



