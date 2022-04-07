<template>
  <a-modal
    title="子表编辑"
    width="640px"
    :visible="value"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Save')"
    @cancel="cancel"
    @ok="handleOk"
    :maskClosable="false"
    wrapClassName="child-table-modal"
    :keyboard="false"
  >
    <div class="popover-wrap">
      <a-row class="row">
        <a-col :span="leftWidth">
          <label class="title">{{ $t('languages.Apps.DataItem') }}</label>
        </a-col>
        <a-col :span="centerWidth">
          <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
        </a-col>
        <a-col :span="rightWidth">
          <label class="title">{{ $t('languages.Apps.DisplayFormat') }}</label>
        </a-col>
        <a-col :span="displayWidth">
          <label class="title">{{ $t('languages.Apps.DisplayCondition') }}</label>
        </a-col>
      </a-row>
      <div class="row-content">
        <a-row class="row">
          <a-col :span="leftWidth">
            <span class="l-h" :title="`${modalData.propertyName || modalData.name}[${modalData.code}]`">{{ `${modalData.propertyName || modalData.name}[${modalData.code}]` }}</span> 
          </a-col>
          <a-col :span="centerWidth" class="width_180">
            <a-input
              v-model="backData.name"
              maxlength="200"
              :class="{'input-error':!backData.name}"
            />
            <div class="empty-tip" v-if="!backData.name">{{ $t('languages.Apps.DisplayNameRequire') }}</div>
          </a-col>
          <a-col :span="rightWidth"></a-col>
        </a-row>
        <template v-for="(item,index) in backData.childColumns">
          <a-row :key="index" class="row">
            <a-col :span="leftWidth">
              <span class="l-h" :title="`${item.name}[${item.propertyCode || item.code}]`">{{ `${item.name}[${item.propertyCode || item.code}]` }}</span> 
            </a-col>
            <a-col :span="centerWidth" class="width_180">
              <a-input
                v-model="item.name"
                maxlength="200"
                :class="{'input-error':!item.name}"
              />
              <div class="empty-tip" v-if="!item.name">{{ $t('languages.Apps.DisplayNameRequire') }}</div>
            </a-col>
            <a-col :span="rightWidth">
              <a-select
                class="select"
                v-if="item.propertyType === 3"
                :placeholder="$t('languages.PlaceHolder.Select')"
                v-model="item.displayFormat"
              >
                <a-select-option
                  v-for="(option, index) in DateType"
                  :key="index"
                  :value="option.type"
                >{{ $t(`languages.Apps.ListControl.${option.text}`) }}</a-select-option>
              </a-select>
              <a-select
                class="select"
                v-else-if="item.propertyType === 2"
                :placeholder="$t('languages.PlaceHolder.Select')"
                v-model="item.displayFormat"
              >
                <a-select-option
                  v-for="(option, index) in numberType"
                  :key="index"
                  :value="option.type"
                >{{ $t(`languages.Apps.ListControl.${option.text}`) }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="displayWidth">
              <a-switch v-model="item.isQueryColumn"/>
            </a-col>
          </a-row>
        </template>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch, Emit
} from 'vue-property-decorator';
import { DateType, numberType } from '../../control-modals-map';

@Component({
  name: 'TableSetting',
  components: {
  }
})
export default class TableSetting extends Vue {
  @Prop() value!: boolean;
  @Prop() modalData!:any;

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  leftWidth:number = 6;

  centerWidth:number = 8;

  rightWidth:number = 7;
  
  displayWidth:number = 3;

  DateType = DateType;

  numberType = numberType;

  visible: boolean = true;

  backData = {
    /*  显示格式 */
    name: '',
    propertyCode: '',
    propertyType: 0,
    sumType: null,
    width: 176,
    unit: 0,
    childColumns: []
  }

  handleOk() {
    if (this.backData.name === '') {
      return;
    }
    // 判断子表子数据项name非空
    const isNotEmpty = this.backData.childColumns.every((item:any) => item.name);
    if (!isNotEmpty) {
      return;
    }
    this.backData.propertyCode = this.modalData.code;
    this.backData.propertyType = this.modalData.type;
    let confirmData = null;
    if (this.modalData.data) {
      const data = JSON.parse(JSON.stringify(this.modalData.data));
      confirmData = { ...data, ...this.backData };
    } else {
      const data = JSON.parse(JSON.stringify(this.modalData));
      confirmData = { ...data, ...this.backData };
    }    
    this.$emit('confirm', confirmData);
    this.cancel();
  }

  cancel() {
    this.$emit('close');
  }

  @Watch('value')
  onModalShow(v:any) {
    if (v) {
      if (this.modalData.data) {
        this.backData.childColumns = JSON.parse(JSON.stringify(this.modalData.data.childColumns));
        this.backData.name = this.modalData.name;
      } else {
        this.backData.childColumns = JSON.parse(JSON.stringify(this.modalData.childColumns));
        this.backData.name = this.modalData.name;
      }
    }
  }
}
</script>
<style lang="less">
  .child-table-modal{
    /deep/.ant-modal-body{
      font-size: 12px;
    }
    .popover-wrap{
      .row{
        margin-bottom: 6px;
        // &:first-child{
        //   margin-bottom: 0;
        // }
        .ant-col-6,.ant-col-7,.ant-col-8{
          box-sizing: border-box;
          line-height: 32px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .width_180 input{
          width: 180px;
        }
        .ant-col-3{
          line-height: 32px;
          box-sizing: border-box;
          label,.ant-switch{
            margin-left: 16px;
          }
        }
        .l-h{
          line-height: 32px;
          font-size: 14px;
        }
        .select{
          width: 100%;
        }
      }
      .row-content{
        max-height: 270px;
        overflow-y: auto;
      } 
      .empty-tip{
        color: #f5222d;
        font-size: 12px;
      }
      input.input-error{
        border-color:#f5222d;
      }
    }
  }
</style>
