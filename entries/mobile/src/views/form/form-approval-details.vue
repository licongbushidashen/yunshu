<template>
  <div class="form-approval-details">
    <div
      v-for="(user, i) in users"
      :key="i"
      class="form-approval-details__user"
    >
      <h3-avatar v-if="user.imgUrl && user.imgUrl.includes('http')" :src="user.imgUrl"></h3-avatar>
      <h3-avatar v-else-if="user.imgUrl" :src="getDownloadUrl(user.imgUrl)"></h3-avatar>
      <i v-else class="icon aufontAll h-icon-all-normal_smile"></i>
      <div class="form-approval-details__info">
        <label>{{ user.trustor && user.trustor.id ? `${user.name}${$t('languages.common.trust', {name: user.trustor.name})}`:user.name }}</label>
        <span>{{ user.dept || $t('languages.common.unknown') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Watch, Prop
} from 'vue-property-decorator';

import {
  H3Avatar
} from 'h3-mobile-vue';
// import { setTitle } from '@/utils/dingtalk';

import * as platform from '@cloudpivot/platform';

@Component({
  name: 'form-approral',
  components: {
    H3Avatar
  },
})
export default class FormApprovalDetails extends Vue {
  users = [];

  get apiHost(){
    return (window as any).config.apiHost
  }

  get token(){
    return window.localStorage.getItem('token');
  }

  getDownloadUrl(refId:string){
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if(this.token){
      url += '&T=' + this.token;
    }
    return url;
  }

  created() {
    const params: any = this.$route.params as any;
    // setTitle(params.title);
    platform.service.setTitle(params.title);
    this.users = params.approvaler;
  }
}

</script>
<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/mixins/hairline.less";
.form-approval-details{
  height: 100%;
  border-color: #F7F8FC;
  &__user{
    display: flex;
    align-items: center;
    background-color: #FFFFFF;
    .hairline("bottom", #eeeeee);
    position: relative;
    .px2rem(height, 150px);
    img {
      .px2rem(margin-left, 30px);
      .px2rem(margin-right, 30px);
      .px2rem(margin-bottom, 10px);
    }
    & > i.icon {
      .px2rem(font-size, 80px);
      .px2rem(margin-left, 30px);
      .px2rem(margin-right, 30px);
      .px2rem(margin-bottom, 10px);
      color: #ffb131;
    }
  }
  &__info{
    flex: 1;
    display: flex;
    flex-direction: column;
    text-align: left;
    label{
      color: #333;
      font-weight: bold;
      .px2rem(font-size, 32px);
      .px2rem(margin-bottom, 16px);
    }
    span{
      color: rgba(0,0,0,0.65);
      .px2rem(font-size, 26px);
    }
  }
}
</style>
