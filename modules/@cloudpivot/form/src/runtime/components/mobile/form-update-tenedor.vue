<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-15 15:13:02
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-10-14 18:11:29
-->

<template>
  <div class="form-box">
    <mobile-staff-selector
      v-model="staff"
      :options="staffSelectorOpts" 
      :params="{ sourceType: 'portal' }"
      :title="$t('cloudpivot.list.pc.selectOwner')"
      :class="{ error : staffError }"
      :required="true"
      @change="onChange"
    ></mobile-staff-selector>
    <div class="sector">
        <span class="sector-label">{{$t('cloudpivot.list.pc.ownerDepartment')}}</span>
        <span class="sector-name">{{currentOwnerSector}}</span>
    </div>
    <h3-textarea
    class="update-info"
      v-model="comment"
      type="text"
      :title="$t('cloudpivot.list.pc.modifyExplain')"
      :placeholder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
      :maxLength="500"
    ></h3-textarea>

      <div class="border-top">
      <h3-button class="border-top-btn" @click="submit">{{ $t('cloudpivot.form.runtime.biz.ok') }}</h3-button>
    </div>
  </div>

</template>


<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { FormAction } from '../../form-action';

import { H3List, H3ListItem, H3Textarea, H3Button } from 'h3-mobile-vue';

import components from "../../../renderer/components/mobile";

import { FormActionComponent, FormActionModalOptions } from '../../form-action-modal';

import MobileStaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/mobile/mobile-staff-selector.vue';

import { lang } from 'moment';


@Component({
  name: 'form-update-tenedor',
  components: {
    H3List,
    H3ListItem,
    H3Textarea,
    H3Button,
    MobileStaffSelector,
    ApproveOpinion : components.ApproveOpinion
  }
})
export default class FormUpdateTenedor extends Vue implements FormActionComponent {
  @Prop()
  options !: FormActionModalOptions

  comment = ''


  staff = '' as any

  staffError = false

  currentOwnerSector: string = "";

  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: ''
  }

  get text() {
    return `${this.options ? this.options.title : ''}`;
  }

  
  // get isForward() {
  //   return this.options && this.options.code === FormAction.Forward;
  // }




 submit() {
    this.staffError = !this.staff || !this.staff.length;

    if (this.staffError) {
      if (this.staffError) {
        this.$h3.toast.show({
          text: this.$t('cloudpivot.form.runtime.modal.pleaseSelectUser', { text: this.text }),
          iconType: ''
        });
      }
      return;
    }
    this.$emit('submit', {
      comment: this.comment,
      participantors: this.staff
    });
    return {
      comment: this.comment,
      participantors: this.staff
    };
  }

  onChange(e){
    this.staffError=false;
    this.currentOwnerSector=e[0].parentDepartmentName;
  }
 
}

</script>
<style scoped lang="less">
@import "~@/styles/mixins.less";
.form-box{
    background-color: #fff;
    .sector{
        width: 100%;
        height: 45px;
        display: flex;
        padding: 0 15px;
        display: flex;
        align-items: center;
        color: #666;
        font-size: 15px;
        border-bottom: 1px solid #f8f8f8;
        .sector-label{
            width: 106px;
            text-align: left;
        }
        .sector-name{
            color: #333;
        }
    }
}
 .border-top{
     position: fixed;
     bottom: 0;
     left: 0;
     width: 100%;
    .px2rem(height, 88px);
    .border-top-btn{
        color: #2970FF;
        .px2rem(font-size, 30px);
    }
 }
</style>
