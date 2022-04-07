<template>
  <div :class="['app', !recent && 'app_norecent']">
    <ul class="app-list" v-if="list && list.length">
      <li
        :class="['app-list__item', `app-list__item--${grid}`]"
        v-for="(app, index) in list"
        :key="index"
        @click="onItem(app, index)"
      >
        <span v-if="!recent" class="app-list__icon">
          <template v-if="app.content">
            <img :src="'data:image/png;base64,' + app.content" />
          </template>
          <template v-else-if="app.logoUrl">
            <img v-if="app.logoUrl.indexOf('http') > -1" :src="app.logoUrl" />
            <img v-else :src="getDownloadUrl(app.logoUrl)" />
          </template>
          <img v-else :src="defaultIcon" />
        </span>
        <i
          v-else
          :class="[
            'icon',
            'aufontAll',
            app.icon || 'h-icon-all-catalogue-o',
            'recent__icon',
            `recent__icon--${randomColor(app)}`,
          ]"
        />
        <span
          class="app-list__name"
          v-if="searchWord"
          v-html="splitKeyword(app)"
        ></span>
        <span class="app-list__name" v-else>{{ getName(app) }}</span>
      </li>
    </ul>
    <div class="no-data" v-else>{{ $t("cloudpivot.Common.mobile.empty") }}</div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { utils } from "@cloudpivot/common";

const icon = require("./assets/appicon.svg");

@Component({
  name: "AppsList",
})
export default class AppsList extends Vue {
  @Prop() list!: Array<any>;

  @Prop({ default: 4 }) grid?: number;

  @Prop() searchWord?: string;

  @Prop({ default: false }) recent?: boolean;

  @Prop() colorKey?: string;

  @Prop({ default: "name" }) displayName?: string;

  // 更多应用默认图标
  defaultIcon: string = icon;

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${encodeURIComponent(
      refId
    )}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  }

  onItem(app: any, index: number) {
    if (this.recent) {
      this.$emit("onItem", app);
    } else {
      this.$emit("toggle", app);
    }
  }

  getName(app: any) {
    return utils.BusinessFunctions.getLangName(app, this.displayName);
  }

  /**
   * 高亮匹配文字
   */
  splitKeyword(app: any) {
    // 提取当前应用的国际化语言对应显示名
    let str: string = utils.BusinessFunctions.getLangName(
      app,
      this.displayName
    );
    if (this.searchWord && str) {
      const reg: RegExp = new RegExp(`${this.searchWord}`, "g");
      const arr: any = str.replace(
        reg,
        `<span class="highlight">${this.searchWord}</span>`
      );
      return arr;
    }
    return str;
  }

  /**
   * 随机应用图标背景色
   */
  randomColor(app: any) {
    if (this.colorKey && app[this.colorKey]) {
      const letter: string = app[this.colorKey].replace(
        /^([a-zA-Z]).+?$/,
        "$1"
      );
      const index: number =
        "abcdefghijklmnopqrstuvwxyz".indexOf(letter.toLowerCase()) + 1;
      const position: number = (index % 4) + 1;
      return `${position}`;
    }
    return "default";
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

.app {
  display: flex;
  flex-direction: column;
  color: #333;
  background: #fff;
  .px2rem(padding-left, @horizontal-padding-lg);
  .px2rem(padding-right, @horizontal-padding-lg);
  &.app_norecent {
    box-sizing: border-box;
    flex: 1;
    .px2rem(padding-left, @horizontal-padding-lg);
    .px2rem(padding-right, @horizontal-padding-lg);
    .app-list {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      .px2rem(margin-top, -30px);
      flex-wrap: wrap;
      min-width: 100%;
      &__item {
        display: block;
        .px2rem(margin-top, 60px);
        text-align: center;
        &--5 {
          flex-basis: 20%;
        }
        &--4 {
          flex-basis: 25%;
        }
        &--3 {
          flex-basis: 33.33%;
        }
        &--2 {
          flex-basis: 50%;
        }
      }
    }
  }
  &-list {
    display: flex;
    .px2rem(margin-bottom, 30px);
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    align-items: flex-start;
    justify-content: flex-start;
    &__item {
      width: 22%;
      min-width: 22%;
      display: block;
      .px2rem(margin-top, 30px);
      text-align: center;
    }

    .recent__icon {
      .px2rem(font-size, 48px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
      .px2rem(margin-bottom, 16px);
      &--default {
        color: linear-gradient(
          137deg,
          rgba(83, 75, 255, 1) 0%,
          rgba(97, 132, 255, 1) 100%
        );
      }
      &--1 {
        color: @random-color-1;
      }
      &--2 {
        color: @random-color-2;
      }
      &--3 {
        color: @random-color-3;
      }
      &--4 {
        color: @random-color-4;
      }
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
      .px2rem(width, 96px);
      .px2rem(height, 96px);
      .px2rem(margin-bottom, 16px);
      .px2rem(border-radius, 16px);
      img {
        width: 100%;
        height: 100%;
      }
    }
    &__name {
      margin: 0 auto;
      width: 5em;
      .px2rem(max-height, 65px);
      .px2rem(font-size, 24px);
      .px2rem(line-height, 33px);
      text-align: center;
      font-weight: 400;
      display: -webkit-box;
      /*! autoprefixer: ignore next */
      -webkit-box-orient: vertical;
    /* autoprefixer: on */
      -webkit-line-clamp: 2;
      overflow: hidden;
      word-break: break-all;
      color: #333;
    }
    /deep/.highlight {
      color: @primary-color;
    }
  }
  .no-data {
    text-align: center;
    color: #ccc;
    .px2rem(line-height, 80px);
    .px2rem(margin-bottom, 30px);
  }
}
</style>
<style lang="less">
.app:not(.app_norecent) > .app-list::-webkit-scrollbar {
  height: 0;
}
</style>
