<template>
    <div>
      <template v-for="(workitem, index) in failResults">
        <base-item
        :key="index"
        class="work-item"
        :title="workitem.instanceName"
        :summary="summary(workitem)"
        :time="workitem.stayTime"
        :avatar="workitem.imgUrl"
        :username="workitem.originatorName"
        :avatarPlacehold="true"
      >
        <span slot="time">{{ $t('cloudpivot.flowCenter.mobile.readTime') }}:&nbsp;&nbsp;</span>
      </base-item>
       <div :key="index" class="reason-item">
         <span class="label">{{$t('cloudpivot.flowCenter.mobile.failReason')}}:</span>
         <span class="reason">{{workitem.reason}}</span>
        </div>
      </template>
    </div>
</template>>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseItem from './base-item.vue';

@Component({
  name: 'BatchFailList',
  components:{
    BaseItem
  }
})
export default class BatchFailList extends Vue {
  @Prop() failResults?: any; 
  created(){
    (document as any).title  = this.$t('cloudpivot.flowCenter.mobile.approveFail');
  }
  summary(workitem){
    if(this.$i18n) {
      const locale:string = this.$i18n.locale as string;
      return this.$i18n.locale === 'zh' ?  workitem.activityName : workitem.sourceName_i18n[locale];
    }
    return '';
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.reason-item{
  background-color: @white-background;
  display:flex;
  margin:0 0;
  .px2rem(margin-left,16px);
  .px2rem(margin-right,16px);
 //padding-left: 0.4rem ;
  .px2rem(padding-left,32px);
  .px2rem(padding-top, 18px);
  .px2rem(padding-bottom, 18px);
  .px2rem(font-size, @font-size-sm);
  //margin-top: -0.4rem;
  .px2rem(margin-top,-32px);
  .hairline("top", #DDDDDD);
  //border-top: 0.01rem solid #DDDDDD;
  .label{
    .px2rem(min-width, 120px)
  }
  .reason {
    color: @error-color;
    .px2rem(padding-left,16px);
    //padding-left: 0.2rem;
    text-align: left;
  }
}
</style>  