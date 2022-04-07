<template>
  <div class="app-item">
    <!-- 搜索框 -->
    <div class="app-item__wrap">
      <h3 v-if="!showSearchPanel" class="app-item__sub-title">全部</h3>

      <search-bar
        :class="['app-item__search', !showSearchPanel ? 'app-item__search__limit' : 'app-item__search__default']"
        :value="wd"
        :onclear="onClear"
        @focus="focusSearch"
        @cancel="cancelSearch"
        @search="search"
        placeHolder="搜索表单名称"
      />
    </div>
    <!-- 主体内容 -->
    <search-panel
      v-if="showSearchPanel"
      v-model="wd"
      :appCode="signAppCode"
      class="app-item__main"
    />
    <item-list
      class="app-item__main"
      :appItem="appItem"
      v-show="!showSearchPanel && !loading"
      @onItem="goFormList"
    />

    
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';

import common from '@cloudpivot/common/mobile';

import { listApi } from '@cloudpivot/api';

import OpenFormMixin from '../open-form';

const Bus:any = common.utils.Bus;

import SearchPanel from '../search-panel.vue';

@Component({
  name: 'app-item',
  components: {
    SearchBar: common.components.Searchbar,
    SearchPanel,
    ItemList: common.components.ItemList,
  }
})
export default class AppItem extends Mixins(OpenFormMixin) {
  @Prop() appCode!: any;
  @Prop({default: ''}) signAppCode?: string;
  appItem:any = [];

  showSearchPanel: boolean = false;

  currentApp: any = null;

  wd: string = '';

  loading: boolean = true;

  created() {
    this.load();
    this.loadAppItem();
  }

  load(flag?: boolean) {
    if (flag) {
      this.loading = false;
      this.$h3.toast.hide();
    } else {
      this.loading = true;
      this.$h3.toast.show({
        text: '正在加载',
        iconType: 'loading'
      });
    }
  }

  /**
   * 开始搜索，展示搜索面板
   */
  focusSearch() {
    this.showSearchPanel = true;
    Bus.$emit('toggleNavbar', !this.showSearchPanel);
    const dom:any = document.querySelector('.single-app__main')
    dom.scrollTop = 0
    // 隐藏任务中心
    Bus.$emit('toggleTask', false);
  }

  /**
   * 取消搜索，隐藏搜索面板
   */
  cancelSearch() {
    this.showSearchPanel = false;
    Bus.$emit('toggleaNvbar', !this.showSearchPanel);
    Bus.$emit('toggleTask', true);
  }

  /**
   * 清空搜索框
   */
  onClear() {
    this.wd = '';
  }

  /**
   * 开始搜索
   */
  search(wd: string) {
    this.wd = wd;
  }

  loadAppItem() {
    const params = {
      appCode: this.appCode,
      isMobile: true
    }
    listApi.getFolder(params).then((res: any) => {
      if (Array.isArray(res.data)) {
        res.data.forEach((d:any) => {
          d.open = false;
        });
        this.appItem = res.data;
        this.currentApp = {
          code: this.appCode
        };
      }
      this.load(true);
    });
  }

  beforeDestroy() {
    Bus.$emit('toggleNavbar', true);
    Bus.$emit('toggleTask', true);
  }
}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.app-item {
  display: flex;
  height: inherit;
  flex-direction: column;
  overflow: hidden;
  &__wrap {
    display: flex;
    align-items: center;
    .px2rem(height, 88px);
    background: #fff;
    justify-content: space-between;
  }
  .app-item__sub-title {
    .px2rem(font-size, 32px);
    .px2rem(padding-left, 30px);
    margin-bottom: 0;
    color: #000;
  }

  .h3-search-input .h3-search-synthetic-ph-placeholder {
    color: #D4D4D4;
  }

  .h3-search-cancel{
    color: #666;
  }
  &__search {
    flex: none;
  }
  &__search__limit {
    .px2rem(min-width, 264px);
    width: 50%;
  }
  &__search__default {
    width: 100%;
  }
  &__main {
    flex: 1;
  }
}
</style>
