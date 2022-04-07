
<template>
  <div class="form-forward">
    <div
      class="field"
      :class="{ error : form.participantors.hasError,
                required : form.participantors.required }"
    >
      <div class="field__label">{{ $t('cloudpivot.form.runtime.modal.selectUser', { text: text }) }}</div>
      <div class="field__control">
        <a-tooltip>
          <template slot="title" v-if="form.participantors.hasError">
            <p>{{ $t('cloudpivot.form.runtime.modal.pleaseSelectUser', { text: text }) }}</p>
          </template>
          <div>
            <staff-selector
              v-model="form.participantors.value"
              :options="staffSelectorOpts"
              :params="{workflowInstanceId: workflowInstanceId, activityCode: activityCode, sourceType: 'portal' }"
            ></staff-selector>
          </div>
        </a-tooltip>
      </div>
    </div>

    <div
      class="field"
      :class="{
        error : form.comment.hasError,
        required : form.comment.required
      }"
    >
      <div class="field__label top">{{ $t('cloudpivot.form.runtime.modal.explain', { text: text }) }}</div>
      <div class="field__control">
        <a-tooltip>
          <template slot="title" v-if="form.comment.hasError">
            <p>{{ $t('cloudpivot.form.runtime.modal.pleaseInputExplain', { text: text }) }}</p>
          </template>

          <div>
            <h3-textarea
              v-model="form.comment.value"
              :placeholder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
              :autosize="{minRows:8}"
              :maxLength="500"
            ></h3-textarea>
          </div>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>


<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { Input, Tooltip } from '@h3/antd-vue';

import { FormGroup, FormControlType, FormBuilder } from 'h3-forms';

import pc from '../../../renderer/components/pc';

import { FormActionComponent, FormActionModalOptions } from '../../form-action-modal';

import { FormAction } from '../../form-action';

import { workflowApi, workflow } from '@cloudpivot/api';

@Component({
  name: 'form-forward',
  components: {
    ATextarea: Input.TextArea,
    ATooltip: Tooltip,
    StaffSelector: pc.StaffSelector,
    H3Textarea: pc.H3Textarea
  }
})
export default class FormForward extends Vue implements FormActionComponent {
  @Prop()
  options !: FormActionModalOptions

  comment = ''

  staff = '' as any

  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '',
    filterUser: []
  }

  formGroup = this.createFormGroup();

  get text() {
    return this.options ? this.options.title : '';
  }

  get isCirculate() {
    return this.options && this.options.code === FormAction.Circulate;
  }

  get form() {
    return this.formGroup ? this.formGroup.children : null;
  }

  get workflowInstanceId(){
    return this.options.data.workflowInstanceId ? this.options.data.workflowInstanceId : '';
  }

  get activityCode(){
    return this.options.data.activityCode ? this.options.data.activityCode : '';
  }

  createFormGroup() {
    const group = FormBuilder.build({
      participantors: {
        type: FormControlType.Radio,
        options: {
          required: true
        }
      },
      comment: {
        type: FormControlType.Radio,
        options: {
          required: true
        }
      }
    });

    return group;
  }

  // /**
  //  * 选人控件placeholder多语言
  //  */
  // placeHolderLang(){
  //   this.staffSelectorOpts.placeholder = this.$t('cloudpivot.flowCenter.pc.plzSelect') as string;
  // }

  // @Watch('$i18n.locale')
  // onLanguageChange(l:string) {
  //   this.placeHolderLang();
  // }

  @Watch('options', {
    immediate: true
  })
  setOptions(opts: FormActionModalOptions) {
    if (!opts) {
      return;
    }

    if (this.form) {
      (this.form.comment as any).required = !this.isCirculate;
    }
    this.$set(this.staffSelectorOpts, 'mulpitle', opts.code !== FormAction.Forward);
    this.$set(this.staffSelectorOpts, 'placeholder', this.$t('cloudpivot.form.runtime.modal.pleaseChoose'));
    if(opts.code === FormAction.AdjustParticipant){
      this.loadBaseInfo(opts)
    }
  }
  async loadBaseInfo(opts: FormActionModalOptions){
    //加签状态选择加签人员过滤当前处理人
    const params: workflow.GetWorkflowTrackParams = {
      workflowInstanceId: opts.data.workflowInstanceId
    };
    const res = await workflowApi.getWorkflowBaseInfo(params);
    if (res.errcode === 0 && res.data) {
      //@ts-ignore
      this.staffSelectorOpts.filterUser = res.data.participants[0].participants
    }
  }

  submit() {
    // ;
    // 
    // const data = this.formGroup.value;
    if (this.formGroup && this.formGroup.validate() === false) {
      // if (data.participantors)
      if (this.form &&(this.form.participantors as any).hasError) {
        this.$message.error(this.$t('cloudpivot.form.runtime.modal.pleaseSelectUser', { text: this.text }) as string);
        return;
      }
      if (this.form && (this.form.comment as any).hasError) {
        this.$message.error(this.$t('cloudpivot.form.runtime.modal.pleaseInputExplain', { text: this.text }) as string);
        return;
      }
      return;
    }

    const data = this.formGroup.value;

    return data;
  }

  // mounted(){
  //   this.placeHolderLang();
  // }
}

</script>