<template>
  <div class="card-item" :class="hasCheckbox ? 'item-add':''" @click="$emit('click')">
    <slot name="left" v-if="hasleft"></slot>
    <slot name="checkbox" v-if="hasCheckbox">

    </slot>
    <section class="item-content">
      <div class="head-wrap">
        <img
          v-if="beTrust && !currentTrustor"
          class="delegation-icon"
          src="../assets/images/entrusted.png"
        >
        <img
          v-else-if="beTrust && currentTrustor"
          class="delegation-icon"
          src="../assets/images/entrust.png"
        >
        <h3 class="item-content-title" v-if="searchWord" v-html="splitKeyword(title)"></h3>
        <h3 class="item-content-title" v-else>{{ title }}</h3>
      </div>
      <p class="item-content-summary">
        <span>{{ summary }}</span>
        <slot name="badge"/>
        <slot name="activitie"/>
      </p>
      <p class="item-content-summary" v-if="itemTitle">
        <span>{{itemTitle}}</span>
        <slot name="template"/>
      </p>
      <time class="item-content-time">
        <slot name="time"/>
        {{ showTime }}
        <i class="urged" v-if="isShowUrged">{{ $t('cloudpivot.flowCenter.mobile.beUrged') }}</i>
      </time>
      <div class="item-content-user clearfix" :class="{ 'place': (avatar || username) }">
        <img
          v-if="avatar && avatar.includes('http')"
          :src="avatar"
          class="content-user-avatar"
        >
        <img
          v-else-if="avatar || avatarPlacehold"
          :src="avatar ? getDownloadUrl(avatar) : defaultAvatar"
          class="content-user-avatar"
        >
        <span class="content-user-name" v-if="searchWord && searchUser" v-html="splitKeyword(username)"></span>
        <span class="content-user-name" v-else>{{ username }}</span>
      </div>
    </section>
    <slot name="right"></slot>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { utils } from '@cloudpivot/common';

@Component({
  name: 'CardItem'
})
export default class CardItem extends Vue {
  @Prop() title!: string;

  @Prop() summary!: string;
  
  @Prop() itemTitle?:string;

  @Prop() time!: string;

  @Prop() avatar!: any;

  @Prop() username!: string;

  @Prop() hasleft!: boolean;

  @Prop() hasCheckbox?: boolean;
  
  @Prop({ default: false }) isShowUrged!: boolean;

  @Prop({ default: false }) beTrust?: boolean;

  @Prop({ default: false }) currentTrustor?: boolean;

  @Prop() searchWord?: string // 搜索关键字

  @Prop() searchUser?: boolean // 搜索关键字不高亮参与者时

  // 是否为头像占位，当头像空白时
  @Prop() avatarPlacehold?: boolean;

  showTime: string = '';

  defaultAvatar: any = require('@/assets/images/avatar.png');

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
    if (this.time) {
      const _time = this.time;
      // this.showTime = _time.substr(0, 16);
      this.showTime = _time;
    }
  }

  /**
   * 高亮匹配文字
   */
  splitKeyword(title: any) {
    if (this.searchWord && title) {
      const reg:RegExp = new RegExp(`${this.searchWord}`, 'g');
      const arr: any = title.replace(reg, `<span class="highlight">${this.searchWord}</span>`);
      return arr;
    }
    return title;
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

@user-img : 56px;

.card-item {
  display: flex;
  .px2rem(margin, @horizontal-padding-md);
  .px2rem(padding, @horizontal-padding-lg);
  .px2rem(border-radius, @border-radius-lg);
  background: @white-background;
  .item-content {
    flex: 1;
    text-align: left;
    overflow: hidden;
    .head-wrap{
      display: flex;
      .delegation-icon{
        .px2rem(width, 40px);
        .px2rem(height, 40px);
        .px2rem(margin-right, @horizontal-padding-md);
        .px2rem(margin-top, 4px);
      }
    }
    &-title {
      word-break: break-all;
      .px2rem(margin-bottom, @horizontal-padding-sm);
      .px2rem(font-size, @font-size-md);
      .px2rem(line-height, @line-height-base);
      .lineclamp(1);
      font-weight: 400;
      color: rgba(0, 0, 0, 0.85);
    }
    /deep/.highlight {
      color: @primary-color;
    }
    &-summary {
      .px2rem(margin-bottom, @horizontal-padding-sm);
      .px2rem(font-size, @font-size-sm);
    }
    &-time {
      display: block;
      //.px2rem(margin-bottom, @horizontal-padding-md);
      .px2rem(font-size, @font-size-xxs);
      color: @text-color-describe;
    }
    &-user {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      &.place {
        .px2rem(margin-top, 20px);
      }
    }
  }
  .content-user-avatar {
    .px2rem(width, @user-img);
    .px2rem(height, @user-img);
    border-radius: 50%;
    object-fit: cover;
  }
  .content-user-name {
    display: inline-block;
    .px2rem(margin-left, @horizontal-padding-md);
  }
  .urged {
    display: inline-block;
    .px2rem(padding-top, 4px);
    .px2rem(padding-bottom, 4px);
    .px2rem(padding-left, 16px);
    .px2rem(padding-right, 16px);
    .px2rem(margin-left, 16px);
    // border-radius:8px;
    // border: 1px solid #F4454E;
    .hairline('all', #F4454E, 6px);
    color: #F4454E;
  }
}
.item-add{
  align-items: center;
  padding-left: 0.2rem;
}
</style>
