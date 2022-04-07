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
          :placeholder="$t('languages.Apps.PleaseInputDisplayName')"
          v-if="isChinese"
          v-model="backData.name"
          maxlength="200"
          :class="{'input-error':!backData.name}"
        />
        <a-input
          :placeholder="$t('languages.Apps.PleaseInputDisplayName')"
          maxlength="200"
          v-model="backData.name_i18n[$i18n.locale]"
          v-else
          :class="{'input-error':!backData.name_i18n[$i18n.locale]}"
        />
        <div class="empty-tip" v-if="!backData.name && isChinese">{{ $t('languages.Apps.DisplayNameRequire') }}</div>
        <div class="empty-tip" v-if="!backData.name_i18n[$i18n.locale] && !isChinese">{{ $t('languages.Apps.DisplayNameRequire') }}</div>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayType') }}</label>
      </a-col>
      <a-col :span="19">
        <span class="l-h">{{ $t('languages.Apps.ScopeQuery') }}</span>
      </a-col>
    </a-row>
    <!-- 日期显示格式 -->
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayFormat') }}</label>
      </a-col>
      <a-col :span="19">
        <div class="select-wrap">
          <a-select
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            v-model="backData.displayFormat"
            @change="handleValueChange"
            :getPopupContainer="getPopupContainer"
          >
            <a-select-option
              v-for="(option, index) in dateTypeList"
              :key="index"
              :value="option.type"
            >{{ $t(`languages.Apps.ListControl.${option.text}`) }}</a-select-option>
          </a-select>
        </div>
      </a-col>
    </a-row>

    <a-row class="row">
      <a-col :span="5">
        <!-- <label class="title">同步默认格式</label> -->
      </a-col>
      <a-col :span="19">
        <div class="select-wrap">
          <a-checkbox :indeterminate="indeterminate" :checked="syncFlag" @change="onsyncChange">
            同步默认格式
          </a-checkbox>
          <span style="display: block;font-size: 12px;color: rgba(0,0,0,0.45); margin-top: 8px;">即与数据模型日期默认格式保持一致</span>
        </div>
      </a-col>
    </a-row>



    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DefaultValue') }}</label>
      </a-col>
      <a-col :span="19" class="default">
        <div class="select-wrap">
          <a-select
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            v-model="backData.dateType"
            :getPopupContainer="getPopupContainer"
          >
            <a-select-option
              v-for="(option, index) in dateDefaultTypeList"
              :key="index"
              :value="option.type"
            >{{ $t(`languages.Apps.ListControl.${option.text}`) }}</a-select-option>
          </a-select>
        </div>
        <div v-if="backData.dateType === 0">
          <div v-if="backData.displayFormat === 4">
            <a-month-picker
              v-model="backData.startValue"
              :placeholder="$t('languages.Apps.StartTime')"
              :getCalendarContainer="getPopupContainer"
              @openChange="handleStartOpenChange"
            />
            <a-month-picker
              :placeholder="$t('languages.Apps.EndTime')"
              v-model="backData.endValue"
              :open="endOpen"
              :getCalendarContainer="getPopupContainer"
              @openChange="handleEndOpenChange"
            />
          </div>
          <div v-else-if="backData.displayFormat === 5">
            <a-date-picker
              v-model="backData.startValue"
              :mode="'year'"
              :format="getFormat"
              :open="yearStartOpen"
              :placeholder="$t('languages.Apps.StartTime')"
              :getCalendarContainer="getPopupContainer"
              @openChange="handleYearStartOpenChange"
              @panelChange="startPanelChange"
            />
            <a-date-picker
              :placeholder="$t('languages.Apps.EndTime')"
              v-model="backData.endValue"
              :mode="'year'"
              :format="getFormat"
              :open="yearEndOpen"
              :getCalendarContainer="getPopupContainer"
              @openChange="handleYearEndOpenChange"
              @panelChange="endPanelChange"
            />
          </div>
          <div v-else>
            <a-date-picker
              :showTime="showTime"
              :format="getFormat"
              v-model="backData.startValue"
              :placeholder="$t('languages.Apps.StartTime')"
              :getCalendarContainer="getPopupContainer"
              @openChange="handleStartOpenChange"
            />
            <a-date-picker
              :showTime="showTime"
              :format="getFormat"
              :placeholder="$t('languages.Apps.EndTime')"
              v-model="backData.endValue"
              :open="endOpen"
              :getCalendarContainer="getPopupContainer"
              @openChange="handleEndOpenChange"
            />
          </div>
        </div>
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
    <div class="btn-group btn-group-fixed clearfix">
      <a-button
        class="btn"
        type="primary"
        size="small"
        @click="close"
      >{{ $t('languages.Apps.Ok') }}</a-button>
      <a-button
        class="btn"
        size="small"
        @click="cancel"
      >{{ $t('languages.Apps.Cancel') }}</a-button>
    </div>
    <div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch, Emit,Inject
} from 'vue-property-decorator';
import moment from 'moment';
import { DateDefaultType, DateType } from '../../control-modals-map';
@Component({
  name: 'Date',
})
export default class Date extends Vue {
  @Prop() modalData !: any;

  

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  dateFormat:string = 'YYYY/MM/DD';

  visible: boolean = true;

  endOpen: boolean = false;

  showTime: any = false;

  backData = {
    choiceType: '',
    defaultValue: '',
    displayFormat: 4,
    displayType: 4,
    startValue: null,
    endValue: null,
    name: '',
    options: '',
    propertyCode: '',
    propertyType: '',
    userOptionType: '',
    visible: true,
    propertyName: '',
    dateType: 0,
  }

  oldData = {
    ...this.backData
  }

  yearStartOpen: boolean = false;
  yearEndOpen: boolean = false;

  @Watch('modalData', {
    deep: true,
    immediate: true
  })
  onBackDataChange(){
    this.oldData = JSON.parse(JSON.stringify(this.modalData.data))
  }

  get dateTypeList() {
    return DateType.slice();
  }

  get dateDefaultTypeList() {
    switch(this.backData.displayFormat){
      case 1:
      case 2:
      case 3:
        return DateDefaultType;
      case 4:
      case 5:
        return DateDefaultType.filter((d) => d.type === 0 );
      case 9:
      case 10:
      case 11:
      case 12:
      return DateDefaultType;
    }
  }

  get getFormat() {
    console.log(this.backData.displayFormat)
    switch(this.backData.displayFormat){
      case 1:
        this.showTime = false;
        return 'YYYY-MM-DD'
      case 2:
        this.showTime = { format: 'HH:mm:ss' };
        return 'YYYY-MM-DD HH:mm:ss'
      case 5:
        return 'YYYY'
      case 3:
      case 9:
      case 10:
      case 11:
      case 12:
        this.showTime = { format: 'HH:mm' };
        return 'YYYY-MM-DD HH:mm'
    }
  }

  @Inject()
  getDraftAttributesJson!: Function;
  @Inject()
  getFormatedFieldsData!: Function;
  onsyncChange(flag: any) {
    let boo  = flag.target.checked
    if(boo) {
      this.$set(this.backData, 'displayFormat', this.format.type)
    } else {
      // 关闭开关时若不存在显示格式则取默认格式
      this.format1 ? this.$set(this.backData, 'displayFormat', this.format1.type) : this.$set(this.backData, 'displayFormat', this.format.type)
    }
    this.syncFlag = boo
  }
  
  syncFlag:boolean = false
  format:any = null
  format1:any = null
  // 设置是否打开同步按钮
  isDefaultFormatEnabled(){
    this.syncFlag = this.format.type === this.backData.displayFormat
  }

  created() {
    this.backData = this.modalData.data;
    const { startValue, endValue, dateType } = this.modalData.data;
    this.backData.startValue = startValue || null;
    this.backData.endValue = endValue || null;
    this.backData.dateType = dateType || 0;
    if(this.backData.displayFormat){
      this.backData.displayFormat = Number(this.backData.displayFormat);
    }
    this.setDefaultValue(this.backData.startValue, this.backData.endValue);

    // 获取表单配置
    let draftAttributesJson = this.getDraftAttributesJson()
    let options = draftAttributesJson[this.modalData.code].options
    try {
      let option:any = this.getFormatedFieldsData().find((el:any) => el.code === this.modalData.code).options
      option = JSON.parse(option)
      options.format = option.format
    } catch (error) {}

    this.format = DateType.slice().find((el:any) => el.format === options.format)
    this.format1 = DateType.slice().find((el:any) => el.format === options.format1)
    this.isDefaultFormatEnabled()

  }

  /**
   * 设置默认值
   */
  setDefaultValue(start:any, end:any) {
    this.backData.startValue = start ? moment(start, this.dateFormat) : start;
    this.backData.endValue = end ? moment(end, this.dateFormat) : end;
  }

  handleValueChange(){
    this.backData.startValue = null;
    this.backData.endValue = null;
    this.backData.dateType = 0;
    this.isDefaultFormatEnabled()
  }

  cancel() {
    this.backData = JSON.parse(JSON.stringify(this.oldData))
    this.$emit('closeModal');
  }

  close() {
    if (this.backData.name === '') {
      return;
    }
    const backData = { ...this.backData };
    const { startValue, endValue, dateType }: any = this.backData;
    let formatType = this.getFormat;
    if(backData.displayFormat === 4){
      formatType = 'YYYY-MM';
    }
    if(dateType === 0 && startValue && endValue){
      if(moment(startValue.format(this.getFormat)).isAfter(endValue.format(this.getFormat))){
        this.$message.error('开始时间不能大于结束时间');
        return;
      }
    }
    backData.startValue = (startValue ? startValue.format(formatType) : '') as any;
    backData.endValue = (endValue ? endValue.format(formatType) : '') as any;
    this.$emit('backData', JSON.parse(JSON.stringify(backData)));
  }

  closeModal() {
    this.$emit('cancel');
  }

  /**
   * 时间处理
   */
  disabledStartDate(startValue:any) {
    const { endValue } = this.backData;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > (endValue as any).valueOf();
  }

  disabledEndDate(endValue:any) {
    const { startValue } = this.backData;
    if (!endValue || !startValue) {
      return false;
    }
    return (startValue as any).valueOf() >= endValue.valueOf();
  }

  handleStartOpenChange(open:any) {
    if (!open) {
      this.endOpen = true;
    }
  }

  handleEndOpenChange(open:any) {
    this.endOpen = open;
  }

  handleYearStartOpenChange(open:any) {
    this.yearStartOpen = open;
  }

  startPanelChange(value, mode) {
    this.backData.startValue = value;
    this.yearStartOpen = false;
    this.yearEndOpen = true;
  }

  handleYearEndOpenChange(open:any) {
    this.yearEndOpen = open;
  }

  endPanelChange(value, mode) {
    this.backData.endValue = value;
    this.yearEndOpen = false;
  }
}
</script>
<style lang="less" scoped>
  .popover-wrap{
    padding: 0 6px;
    width: 358px;
    overflow: visible;
    .row{
      margin-bottom: 16px;
      .ant-col-5{
        label{
          line-height: 32px;
          color: rgba(0, 0, 0, .65);
        }
      }
      .ant-col-19{
        .l-h{
          line-height: 32px;
        }
        .date{
          width: 110px;
          margin-right: 8px;
        }
        .select-wrap{
          position: relative;
          width: 100%;
          .select{
            width: 100%;
          }
        }
      }
    }
    .btn-group {
      .btn{
        &:last-child{
          margin-right: 8px;
        }
        float: right;
      }
      .left{
        margin-right: 16px;
      }
    }
    .empty-tip{
      color: #f5222d;
      font-size: 12px;
    }
    input.input-error{
      border-color:#f5222d;
    }
  };
  .ant-calendar-picker{
    margin: 5px 0 0;
  }
</style>
