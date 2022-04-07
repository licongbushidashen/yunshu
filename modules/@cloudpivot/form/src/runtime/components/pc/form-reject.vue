
<template>
  <div class="form-reject">
    <div class="field reject-tips"> <a-icon type="exclamation-circle" /> {{ $t('cloudpivot.form.runtime.modal.canNotReject') }} </div>
    <div class="field">
      <a-row>
        <a-col :span="4">{{ $t('cloudpivot.form.runtime.modal.reject') }}</a-col>
        <a-col :span="20">
          <a-checkbox
            v-for="options in optionsCheckBox"
            :key="options.value"
            :checked="options.checked"
            @change="(val) => checkBoxChange(options,val)"
          >
            <!-- {{ $t('cloudpivot.form.runtime.modal.writeApplication') }} -->
            {{options.label}}  
          </a-checkbox>
        </a-col>
      </a-row>
    </div>

    <div class="field" v-if="!isEl">
      <a-checkbox @change="onChange">{{ $t('cloudpivot.form.runtime.modal.reSubmitTip') }}</a-checkbox>
    </div>
    <div class="error" v-if="errorVisible">请选择驳回到的节点</div>
  </div>
</template>


<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { Radio, Checkbox, Icon, Row, Col } from '@h3/antd-vue';

import { workflowApi,workflow } from '@cloudpivot/api';

import { FormActionComponent, FormActionModalOptions } from '../../form-action-modal';

@Component({
  name: 'form-reject',
  components: {
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    AIcon: Icon,
    ARow: Row,
    ACol: Col
  }
})
export default class FormReject extends Vue implements FormActionComponent {
  code = ''

  back = false

  activities : workflow.RejectActivity[] = [];

  optionsCheckBox:any[] = []

  checkBoxVal:string[] = []

  errorVisible: boolean = false;

  @Prop()
  options !: FormActionModalOptions

  get isEl(): any {
    return this.options && this.options.createrName === '外部用户'
  }

  @Watch('options', {
    immediate: true
  })
  setOptions(opts : FormActionModalOptions) {
    console.log('options', opts)
    if (!opts) {
      return false;
    }

    const formObject = opts.data;

    if (formObject.workflowInstanceId) {
      const closeLoader = (this.$message as any).loading();

      workflowApi.getRejectActivities({
        workflowInstanceId: formObject.workflowInstanceId,
        activityCode: formObject.activityCode
      }).then((res) => {
        closeLoader();

        if (res.errcode !== 0) {
          this.$message.error(res.errmsg as string);
          return;
        }

        if (res.data && res.data.length > 0) {
          this.optionsCheckBox = res.data.map((item, index) => {
            let level = index;
            if (item.checkbox) {
              level = -1;
            }
            return {
              label: item.activityName,
              value: item.activityCode,
              level,
              checked: false
            }
          });
          // if (this.activities.length > 0) {
          //   this.code = this.activities[0].activityCode;
          // }
        } else {
          this.$message.error(this.$t('cloudpivot.form.runtime.modal.noRejectNode') as string);
        }
      },() => closeLoader());
    }
  }

  onChange(evt:any) {
    this.back = evt.target.checked;
  }

  checkBoxChange(opt:any,value:any) {
    const theLevel = opt.level;
    const thecheck = value.target.checked;
    opt.checked = thecheck;
    const hasCHeck = this.optionsCheckBox.find(res => res.checked);
    if (this.valid()) {
      this.optionsCheckBox.forEach(option => {
        option.checked = false;
      });
    }
    opt.checked =  value.target.checked;
    this.errorVisible = false;
       // this.optionsCheckBox.forEach(option => {
    //   option.checked = false;
    // });
  }

  valid() {
    const flag = false;
    const checkedData = this.optionsCheckBox.filter(res => res.checked);
    const checkType:any[] = [];
    checkedData.forEach(res => {
      if (checkType.indexOf(res.level) === -1) {
        checkType.push(res.level);
      }
    });
    if(checkType.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  submit() {
    const code = this.optionsCheckBox.filter(res =>  res.checked).map(res => res.value).join(',');
    if (!code) {
      this.errorVisible = true;
      return;
    };
    
    // if (!this.code) {
    //   return;
    // }
    return {
      rejectToActivityCode: code,
      submitToReject: this.back,
    };
  }
}

</script>

<style lang="less" scoped>

/deep/.ant-radio-wrapper{
  display: block;
}

.field__control__checkbox {
  /deep/.ant-checkbox-wrapper{
    display: block;
    margin-bottom: 10px;
  }
}
.form-reject{
  position: relative;
  .ant-checkbox-wrapper {
    display: block;
    margin-left: 0;
    margin-bottom: 10px;
  }
  // .field {
  //   &__label{

  //   }
  //   &__control {

  //   }
  // }
  .reject-tips {
    color: rgba(0,0,0,.45);
    i {
      color: #FAAD14;
    }
  }
  .error{
    color: #f5222d;
    font-size: 12px;
    position: absolute;
    bottom: -22px;
    left: 0;
  }
}

</style>
