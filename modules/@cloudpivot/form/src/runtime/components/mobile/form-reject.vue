
<template>
  <h3-list>
    <approve-opinion :lastAttachment="lastAttachment" v-if="options.approval" :control="options.approval" :commonCommentSwitch="isShow"></approve-opinion>

    <h3-checkbox-list
      :value="val"
      showMode="0"
      :options="checkboxOptions"
      :title="$t('cloudpivot.form.runtime.modal.reject')"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :okText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      :placeHolder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
      :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
      :checkAllText="$t('cloudpivot.form.renderer.checkAll')"
      @onChange="checkboxChange"
      @onClear="checkboxChange"
      @input="checkboxChange"
      class="form-reject-checkbox-list"
      :wrapClassName="'form-reject-checkbox'"
      :required="true"
    >

    </h3-checkbox-list>
    <!-- <h3-checkbox
      :value="val"
      :title="$t('cloudpivot.form.runtime.modal.reject')"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :okText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      :placeHolder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
      :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
      :checkAllText="$t('cloudpivot.form.renderer.checkAll')"
    >
      <h3-checkbox-item> 6666 </h3-checkbox-item>
    </h3-checkbox> -->
    <!-- <h3-popup-picker
      :title="$t('cloudpivot.form.runtime.modal.reject')"
      :data="[activities]"
      v-model="value"
      :placeholder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
      valueTextAlign="left"
      :cancelText="$t('cloudpivot.form.runtime.biz.cancel')"
      :confirmText="$t('cloudpivot.form.runtime.biz.ok')"
      :clearText="$t('cloudpivot.form.runtime.biz.clear')"
    ></h3-popup-picker> -->

    <h3-list-item :hasExtra="true">{{ $t('cloudpivot.form.runtime.modal.reSubmitTip') }}
      <h3-switch
        slot="extra"
        v-model="back"
        color="#2970ff"
      ></h3-switch>
    </h3-list-item>
  </h3-list>
</template>


<script lang="ts">

import {
  Component, Vue, Prop, Watch, Inject
} from 'vue-property-decorator';

import {
  H3List, H3ListItem, H3RadioList, H3Radio, H3Switch, H3PopupPicker, H3CheckboxItem, H3CheckboxList, H3Checkbox
} from 'h3-mobile-vue';

// import H3CheckboxList from './h3-checkbox-list.vue';

import components from "../../../renderer/components/mobile";

import { workflowApi } from '@cloudpivot/api';

import { FormActionComponent, FormActionModalOptions } from '../../form-action-modal';

@Component({
  name: 'form-reject',
  components: {
    H3List,
    H3ListItem,
    H3RadioList,
    H3Radio,
    H3Switch,
    H3PopupPicker,
    ApproveOpinion : components.ApproveOpinion1,
    H3CheckboxList,
    H3CheckboxItem,
    H3Checkbox
  }
})
export default class FormReject extends Vue implements FormActionComponent {

  value: Array<any> = []

  code: string = '';

  back = false

  val:string[] = [];
  copyVal:string[] = []

  activities: any[] = [];

  checkboxOptions: any[] = [];

  isShow: boolean =false;

  @Prop()
  options !: FormActionModalOptions

  @Watch('options', {
    immediate: true
  })

  get lastAttachment(){
    // @ts-ignore
    return this.options && this.options.approval && this.options.approval.controller && this.options.approval.controller._value && this.options.approval.controller._value.lastAttachment || ''
  }

  setOptions(opts: FormActionModalOptions) {
    if (!opts) {
      return false;
    }
    this.$nextTick(() => {
      const formObject = opts.data;
      if (formObject.workflowInstanceId) {
        this.$h3.toast.show({
          iconType: 'loading'
        });

        const _this = this;
        workflowApi.getRejectActivities({
          workflowInstanceId: formObject.workflowInstanceId,
          activityCode: formObject.activityCode
        }).then((res: any) => {
          this.$h3.toast.hide();
          
          if (res.errcode !== 0) {
            this.$h3.toast.show({
              text: res.errmsg,
              iconType: 'close'
            });
            return;
          }

          if (res.data) {
            _this.activities = res.data.map((x: any) => x.activityName);
            if (res.data.length > 0) {
              this.checkboxOptions = res.data.map((opts, index) => {
                let level = index;
                if (opts.checkbox) {
                  level = -1;
                }
                return {
                  label: opts.activityName,
                  value: opts.activityCode,
                  level,
                  checked: false
                }
              });
              _this.value = [res.data[0].activityName];
              _this.code = res.data[0].activityCode;
            } else {
              this.$h3.toast.show({
                text: this.$t('cloudpivot.form.runtime.modal.noRejectNode'),
                iconType: 'close'
              });
            }
          }
        });
      }
    });
  }

 mounted () {
    this.isShow=Boolean(JSON.parse(sessionStorage.getItem("commonCommentSwitch") || 'false'));
    this.setOptions(this.options);
  }

  onChange(evt: any) {
    this.back = evt.target.checked;
  }

  // clearValue(value:any) {
  //   
  //   this.val = value;
  // }
  checkboxChange(value:any) {
    if (value.length === 0) {
      this.val = [];
      this.copyVal = [...this.val];
      return;

    }
    const changeVal = this.getDiff(value, this.copyVal);
    const check = value.indexOf(changeVal[0]) !== -1;
    const level = this.checkboxOptions.find(res => {
      return res.value === changeVal[0];
    });
    if (this.valid()) {
      if(check) {
        this.val = changeVal
      }
    }
    // const theChangeOpt = this.checkboxOptions.find(res => {
    //   return res.value === changeVal[0];
    // });

    // if (!theChangeOpt) {
    //   return;
    // }

    // if (theChangeOpt && value.indexOf(theChangeOpt.value) > -1) {
    //   this.val = this.checkboxOptions.filter(res => {
    //     return res.level === theChangeOpt.level;
    //   }).map(res => res.value);
    // } else {
    //   this.val = [];
    // }
    this.copyVal = [...this.val];
  }

  valid() {
    const checkedData = this.checkboxOptions.filter(res => this.val.includes(res.value));
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

  getDiff(a1, a2) {
    let arr1 = [];
    let arr2 = []
    if (a1.length > a2.length) {
      arr1 = a1;
      arr2 = a2
    } else {
      arr1 = a2;
      arr2 = a1;
    }
    const a:any = [];
    const b:any = [];
    arr2.forEach(res => {
      a[res] = true;
    });
    arr1.forEach(res => {
      if (!a[res]) {
        b.push(res);
      }
    })
    return b;
  }

  submit() {
    if (this.val.length === 0) {
      (this.$parent.$parent as any).$message.error(`${this.$t('cloudpivot.form.runtime.modal.rejectTips')} `)
      return;
    }
    return {
      rejectToActivityCode: this.val.join(','),
      submitToReject: this.back,
    };
  }
}
</script>

<style lang="less" scoped>

@import "~@cloudpivot/common/styles/mixins.less";

.ant-radio-wrapper {
  display: block;
}




.h3-cell__hd {
  .px2rem(width, 180);
  .px2rem(margin-right, @vertical-padding-lg);
  text-align: left;
  margin-right: 12px;
}
</style>

<style lang="less">
.form-reject-checkbox{
  .h3-checkbox-content {
    & > div {
      &:first-child{
        display: none;
      }
    }
  }
}

</style>
