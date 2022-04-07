<template>
  <div class="popover-wrap">
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DataItem') }}</label>
      </a-col>
      <a-col :span="19">
        <span class="l-h">{{ `${modalData.propertyName || modalData.name}[${modalData.code}]` }}</span>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
      </a-col>
      <a-col :span="19">
        <a-input
          :class="{'input-error':!backData.name}"
          maxlength="200"
          v-if="isChinese"
          v-model="backData.name"
        />
        <a-input
          :class="{'input-error':!backData.name_i18n[$i18n.locale]}"
          maxlength="200"
          v-else
          v-model="backData.name_i18n[$i18n.locale]"
        />
        <div class="empty-tip" v-if="!backData.name && isChinese">{{ $t('languages.Apps.DisplayNameRequire') }}</div>
        <div class="empty-tip" v-if="!backData.name_i18n[$i18n.locale] && !isChinese">{{
          $t('languages.Apps.DisplayNameRequire') }}
        </div>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayType') }}</label>
      </a-col>
      <a-col :span="19">
        <a-select
          :getPopupContainer="getPopupContainer"
          :placeholder="$t('languages.PlaceHolder.Select')"
          @change="typeChange"
          class="select"
          v-model="backData.displayType"
        >
          <a-select-option
            :key="index"
            :value="option.type"
            v-for="(option, index) in textType"
          >{{ $t(`languages.Apps.${option.text}`) }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row class="row" v-if="backData.displayType === 0">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DefaultValue') }}</label>
      </a-col>
      <a-col :span="19">
        <a-input v-model="backData.defaultValue"/>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.Visible') }}</label>
      </a-col>
      <a-col :span="19">
        <a-switch v-model="backData.visible"/>
      </a-col>
    </a-row>
    <options-input
      :options="options"
      ref="options"
      v-if="visible && !isUseDictionaries && !isUseBusinessData"
    ></options-input>

    <template v-if="visible && isUseBusinessData">
      <a-row class="row-wrap" style="margin-bottom: 16px;">
        <a-col :span="5">
          <label class="title">{{ $t('languages.Apps.OptionSetting') }}</label>
        </a-col>
        <a-col :span="19">
          <div class="add-option-wrap">
            <ul
              ref="condionwrap"
            >
              <li style="margin: 0">
                <div class="input-wrap">
                  <a-input
                    class="input"
                    :disabled="true"
                    :value="'使用业务数据'"
                  />
                </div>
              </li>
            </ul>
          </div>
        </a-col>
      </a-row>
    </template>

    <!-- 使用了数据字典 -->
    <template v-if="visible && isUseDictionaries">
      <a-row class="row-wrap" style="margin-bottom: 16px;">
        <a-col :span="5">
          <label class="title">数据字典</label>
        </a-col>
        <a-col :span="19">
          <div class="add-option-wrap">
            <ul
              ref="condionwrap"
            >
              <li style="margin: 0">
                <div class="input-wrap">
                  <a-input
                    class="input"
                    :disabled="true"
                    :value="useDictionariesName"
                  />
                </div>
              </li>
            </ul>
          </div>
        </a-col>
      </a-row>
      <a-row class="row-wrap" style="margin-bottom: 16px;">
        <a-col :span="5">
          <label class="title">数据内容</label>
        </a-col>
        <a-col :span="19">
          <span @click="dictionariesDataVisible = true" style="color: #17bc94;">查看数据</span>
        </a-col>
      </a-row>
    </template>



    <div class="btn-group btn-group-fixed clearfix">
      <a-button
        @click="close"
        class="btn"
        size="small"
        type="primary"
      >{{ $t('languages.Apps.Ok') }}
      </a-button>
      <a-button
        @click="cancel"
        class="btn"
        size="small"
      >{{ $t('languages.Apps.Cancel') }}
      </a-button>
    </div>
    <div>
    </div>


    <a-modal
      v-model="dictionariesDataVisible"
      height="600px"
      title="字典数据"
      okText="确定"
      cancelText="取消"
      @cancel="dictionariesDataVisible = false"
      :maskClosable="false"
      :closable="true"
      class="add-data-dictionary-modal"
      @ok="dictionariesDataVisible = false"
    >
      <template>
          <!-- <div>
            <a-spin tip="Loading..." v-if="spinning">
              <div class="spin-content">
                数据加载中...
              </div>
            </a-spin>
          </div> -->
        <div class="dictionaries-data-wrapper" style="max-height: 240px;overflow: auto;">
          <a-checkbox-group v-model="checkedList">
            <!-- 历史已选中，字典已删除数据 -->
            <!-- <template v-for="item in isDisableData">
              <a-checkbox :value="item.id" :key="item.id">
                {{item.name}}
              </a-checkbox>
              <br :key="item.id + 'br'" />
            </template> -->

            <template v-for="item in plainOptions">
              <a-checkbox :disabled="true" class="dictionaries-data-items" :value="item.id"  :key="item.id">
                {{item.name}}
              </a-checkbox>
              <br :key="item.id + 'br'" />
            </template>
          </a-checkbox-group>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import OptionsInput from "./options-input.vue";
  import {textType} from '../../control-modals-map';
  import { dictionaryApi } from "@cloudpivot/api";

  @Component({
    name: 'Date',
    components: {
      OptionsInput
    }
  })
  export default class Date extends Vue {
    @Prop() modalData !: any;

    // 判断当前是否是中文版本
    get isChinese() {
      return this.$i18n.locale === 'zh';
    }

    visible: boolean = false;

    get textType(){
      if(this.modalData.propertyType === 0 && this.backData.displayType !== 3){
        return [
          {
            text: 'TextBox',
            type: 0
          }
        ]
      }
      return textType
    }

    currentModal: string = '';

    options: Array<any> = [
      {
        default: false,
        value: ''
      },
      {
        default: false,
        value: ''
      },
      {
        default: true,
        value: ''
      }
    ]

    backData = {
      choiceType: '',
      defaultValue: '',
      displayType: 0,
      startValue: '',
      endValue: '',
      name: '',
      options: '',
      propertyCode: '',
      propertyType: '',
      userOptionType: '',
      visible: true
    }

    oldData = {
      ...this.backData
    }

    @Watch('modalData', {
      deep: true,
      immediate: true
    })
    onBackDataChange(){
      this.oldData = JSON.parse(JSON.stringify(this.modalData.data))
    }

    /**
     * 弹框确定
     */
    close() {
      if (this.backData.name === '') {
        return;
      }
      const childData: any = this.$refs.options;
      if (childData) {
        // this.backData.options = childData.options;
        this.setOptionVal(childData.options);
      }
      this.backData.propertyCode = this.modalData.code;
      this.backData.propertyType = this.modalData.type;
      console.log('backData:', this.backData)
      this.$emit('backData', JSON.parse(JSON.stringify(this.backData)));
    }
    

    @Watch('dictionariesDataVisible')
    onDictionariesDataVisibleChange(value){
      this.$emit('isOpenChileMoadl', value)
    }
    isUseDictionaries:boolean = false
    isUseBusinessData:boolean = false
    useDictionariesName: string = ''
    useDictionariesId: string = ''
    checkedList: string[] = []
    dictionariesDataVisible:boolean = false
    plainOptions: any[] = []
    async getDictionariesNameById(){
      this.useDictionariesName = this.useDictionariesId
      let res:any = await dictionaryApi.getDictionaryById({
        id: this.useDictionariesId
      })
      if(res.errcode === 0){
        this.useDictionariesName = res.data.name
      }
    }
    initCheckedDictionaryList(list:any[]){
      this.checkedList = list.map(el => el.id)
    }
    // 查询字典数据项
    spinning:boolean = true
    async searchDictionaryRecord(){
      this.spinning = true
      let res:any = await dictionaryApi.getEnableRecordsByDictionaryId({
        dicId: this.useDictionariesId
      })
      this.spinning = false
      if(res.errcode === 0){
        this.plainOptions = res.data
      }
    }

    created() {
      if (this.modalData.data) {
        this.backData = this.modalData.data;
        if(Array.isArray(this.modalData.data.optionList) && this.modalData.data.optionList[0] && this.modalData.data.optionList[0].value){
          if(this.modalData.data.optionList[0].value.includes('dictionariesType')){
            this.isUseDictionaries = true
            try {
              let dictionariesData = JSON.parse(this.modalData.data.optionList[0].value)
              this.useDictionariesId = dictionariesData.checkedDictionary
              this.getDictionariesNameById()
              this.initCheckedDictionaryList(dictionariesData.useDictionariesData)
              // this.searchDictionaryRecord()
              this.plainOptions = dictionariesData.useDictionariesData
            } catch (error) {
              
            }
          }
        }
        this.options = this.modalData.data.optionList;
        try {
          if(this.options[0].value.includes('schemaCode')){
            this.isUseBusinessData = true
          }
        } catch (error) {
          
        }

        this.typeChange();
      } else {
        this.backData.name = this.modalData.name;
      }
    }

    typeChange() {
      this.visible = !this.visible;
      switch (this.backData.displayType) {
        case 1:
        case 3:
        case 2:
          if (!this.options) {
            this.options = [];
          }
          if(this.modalData.data.options){
            try {
              const obj = this.modalData.data;
              if(!obj.schemaCode){
                this.visible = false;
              }
            }catch (e) {
            }
          }
          break;
        default:
          this.visible = false;
          break;
      }
    }

    setOptionVal(options: Array<any>) {
      this.backData.defaultValue = '';
      this.backData.options = '';
      const optionArr: Array<string> = [];
      const defaultValue: Array<string> = [];
      options.forEach((res: any) => {
        optionArr.push(res.value);
        if (res.default) {
          defaultValue.push(res.value);
        }
      });
      this.backData.defaultValue = defaultValue.join(';');
      this.backData.options = optionArr.join(';');
    }

    cancel() {
      debugger
      this.backData = JSON.parse(JSON.stringify(this.oldData))
      this.$emit('closeModal');
    }

    closeModal() {
      this.$emit('cancel');
    }
  }
</script>
<style>
.popover-wrap .ant-col{
    display: flex;
    min-height: 32px;
    align-items: center;
}
.ant-modal-mask{
  z-index: 1031;
}
.ant-modal-wrap{
  z-index: 1032;
}
</style>
<style lang="less" scoped>
  .popover-wrap {
    padding: 0 6px;
    width: 328px;
    
    .row {
      margin-bottom: 16px;
      
      .ant-col-5 {
        label {
          line-height: 32px;
          color: rgba(0, 0, 0, .65);
        }
      }
      
      .ant-col-19 {
        .l-h {
          line-height: 32px;
        }
      }
      
      .select {
        width: 100%;
      }
    }
    
    .btn-group {
      .btn {
        &:last-child {
          margin-right: 8px;
        }
        
        float: right;
      }
      
      .left {
        margin-right: 16px;
      }
    }
    
    .empty-tip {
      color: #f5222d;
      font-size: 12px;
    }
    
    input.input-error {
      border-color: #f5222d;
    }
  }
  
  ;
</style>
