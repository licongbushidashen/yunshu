<template>
  <div class="modal-wrap">
    <component
      :is="currentModal"
      @backData="backData"
      @closeModal="closeModal"
      :modalData="modalMsg"
      @isOpenChileMoadl="isOpenChileMoadl"
    ></component>
  </div>
</template>
<script lang="ts">
import {
 Component, Vue, Prop, Watch, Emit
} from 'vue-property-decorator';
import TextPopover from './text.vue';
import NumberPopover from './number.vue';
import DatePopover from './date.vue';
import TimePopover from './time.vue';
import BooleanPopover from './type-boolean.vue';
import UserSelect from './user-select.vue';
import SystemText from './system-text.vue';
import FormStatus from './form-status.vue';
import ModelsSelectorSetting from './models-selector-setting.vue';

import AddressPopover from './address.vue';
import { DataItemType } from "@cloudpivot/form/schema";

@Component({
  name: 'ListDesign',
  components: {
    TextPopover,
    NumberPopover,
    DatePopover,
    TimePopover,
    BooleanPopover,
    UserSelect,
    SystemText,
    FormStatus,
    ModelsSelectorSetting,
    AddressPopover
  }
})
export default class ListDesign extends Vue {
  @Prop() modalData!: any

  currentModal:string = '';

  created() {
    switch (this.modalData.type) {
      /** 文本型 */
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
        this.currentModal = this.modalData.isSystem ? 'SystemText' : 'TextPopover';
        break;
      /** 数值型 */
      case DataItemType.Number:
        this.currentModal = 'NumberPopover';
        break;
      /** 日期型 */
      case DataItemType.Date:
        this.currentModal = 'DatePopover';
        break;
      /** 逻辑型 */
      case DataItemType.Logic:
        this.currentModal = 'BooleanPopover';
        break;
      // 关联表单弹框
      case 9:
        this.currentModal = 'ModelsSelectorSetting';
        break;
      case DataItemType.Address:
        this.currentModal = 'AddressPopover';
        break;
      // 关联表单弹框
      case DataItemType.RelevanceFormEx:
      case DataItemType.RelevanceForm:
        this.currentModal = 'ModelsSelectorSetting';
        break;
      // 时间弹框
       case 12:
         this.currentModal = 'TimePopover';
         break;
      /** 逻辑型 */
      default:
        this.currentModal = 'UserSelect';
        break;
    }
    /**
     * 特殊字段单独处理
     */
    if (this.modalData.code === 'sequenceStatus') {
      this.currentModal = 'FormStatus';
    }
  }
  isOpenChileMoadl(value){
    this.$emit('isOpenChileMoadl', value)
  }

  backData(val:any) {
    this.$emit('confirm', val);
  }

  closeModal() {
    this.$emit('cancel');
  }

  get modalMsg() {
    if (this.modalData.data && this.modalData.data.options && typeof this.modalData.data.options === 'string') {
      let optionsList:Array<string> = this.modalData.data.options.split(';');

      try {
        optionsList = JSON.parse(this.modalData.data.options).options.split(';')
      } catch (error) {

      }

      const targetOption : any[] = [];
      let defaultList:Array<string> = [];
      // optionsList.pop();
      if (this.modalData.data.defaultValue && this.modalData.data.defaultValue.length > 0) {
        defaultList = this.modalData.data.defaultValue.split(';');
        // defaultList.pop();
      }

      const length:number = optionsList.length | 0;
      for (let i = 0; i < length; i += 1) {
        const obj = {
          default: false,
          value: optionsList[i]
        };
        if (defaultList.indexOf(optionsList[i]) > -1) {
          obj.default = true;
        }
        targetOption.push(obj);
      }
      this.modalData.data.optionList = targetOption;
    }
    return JSON.parse(JSON.stringify(this.modalData));
  }
}
</script>
<style lang="less" scoped>
.modal-wrap{
  padding-top: 12px;
  padding-bottom: 4px;
}
</style>
