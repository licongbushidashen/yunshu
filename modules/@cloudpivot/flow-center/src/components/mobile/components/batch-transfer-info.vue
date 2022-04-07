<template>
    <div>
      <div class="batch-info" v-if="pageMode== 'wr'">
        <mobile-staff-selector
          v-model="staff"
          :required="true"
          :options="staffSelectorOpts" 
          :params="{sourceType: 'portal' }"
          :title="$t('cloudpivot.form.runtime.modal.pleaseSelectUser', { text: text })"
        ></mobile-staff-selector>

        <h3-textarea
          v-model="comment"
          :required="true"
          type="text"
          :title="$t('cloudpivot.form.runtime.modal.explain', { text: text })"
          :placeholder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
          :maxLength="500"
          :error="commentError"
        ></h3-textarea>

        <div class="submit-btn" @click="transferOK">{{this.$t('languages.common.ok')}}</div>
      </div>
    </div>
</template>>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import "@/config/h3-form";
import { H3Textarea } from "h3-mobile-vue";
import MobileStaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/mobile/mobile-staff-selector.vue';
import {
  workflowCenterApi
} from "@cloudpivot/api";

@Component({
  name: 'BatchInfoAdd',
  components: {
    H3Textarea,
    MobileStaffSelector
  }
})
export default class BatchInfoAdd extends Vue {
  staff:any[] = [];
  comment = ''
  text:string = '转办';
  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: ''
  }
  commentError = false
  async transferOK(){
    if(this.staff.length === 0){
      this.$h3.toast.show({
        text: '转办人员不能为空！',
        autoHide: true,
        iconType: 'close'
      });
      return
    }
    if(this.comment === ''){
      this.$h3.toast.show({
        text: '转办意见不能为空！',
        autoHide: true,
        iconType: 'close'
      });
      return
    }
    const res = await workflowCenterApi.batchForwardWorkItem({
      participantors: this.staff.map(el => el.id),
      workItemIds: (this.$route.query.ids as string).split(','),
      comment: this.comment
    })
    
    this.$h3.modal.show({
      type: 'alert',
      content: res.errmsg,
      actions: [
        {
          text: this.$t('languages.common.cancel'),
          onPress:()=>{
            this.$router.replace({path: '/home/workitems',query: {pageMode: 'batch'}})
          }
        }
      ]
    })
  }

  pageMode = 'wr';
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.seperate{
  .px2rem(height,16px);
  //height: 0.2rem;
  background: @white-background;
}
.batch-info{
  background-color: @white-background;
  overflow: hidden;
  height: 100%;
  //position: relative;

}
.submit-btn{
    position:absolute;
    width: 100%;
    .hairline("top", #eeeeee);
   // border-top: 1px solid #eee;
    .px2rem(height, 88px);
    .px2rem(font-size, 32px);
    .px2rem(line-height, 88px);
    bottom:0;
    background: @white-background;
    color: @primary-color;
    z-index: 99;
}
</style>
<style>
.h3-toast-notice-content .h3-toast-text-icon{
  width: 150px;
  height: 150px;
}
</style>