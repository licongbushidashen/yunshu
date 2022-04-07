
<template>

  <div class="form-originator">

    <div>
      <h3-avatar  icon="user" :src="getImageUrl(user)"></h3-avatar>
    </div>

    <div>
      <div class="form-originator__title">{{ user.name }}</div>
      <div class="form-originator__desc">
        <slot></slot>
      </div>
    </div>

  </div>

</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch, Inject
} from 'vue-property-decorator';

import {
  H3Avatar
} from 'h3-mobile-vue';

@Component({
  name: 'form-originator',
  components: {
    H3Avatar
  }
})
export default class FormOriginator extends Vue {
  @Prop({
    default: {}
  })
  user!:any

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

  getImageUrl(user: any) {
    if (user.imgUrl && user.imgUrl.includes('http')) {
      return user.imgUrl;
    } else if (user.imgUrl) {
      return this.getDownloadUrl(user.imgUrl);
    }
    return '';
  }
}


</script>

<style lang="less" scoped>

@import "~@cloudpivot/common/styles/mixins.less";

.form-originator{
  display: flex;
  background-color: #fff;

  & > div:first-child{
    .px2rem(margin-right, @font-size-base);
  }

  &__title{
    color: @text-color-main;
    font-weight: 500;
    .px2rem(font-size, @font-size-md);
    .px2rem(margin-bottom, @vertical-padding-xs);
  }

  &__desc{
    color: @text-color-describe;
    .px2rem(font-size, @font-size-xs);
  }

}
</style>
