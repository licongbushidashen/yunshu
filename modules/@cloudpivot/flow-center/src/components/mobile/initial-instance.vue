<template>
  <div class="instance">
    <!-- 搜索框 -->
    <search-bar
      v-if="canSearch"
      class="instance__search"
      :value="wd"
      :onclear="onClear"
      @focus="focusSearch"
      @cancel="cancelSearch"
      @search="search"
      :placeHolder="$t('languages.common.search')"
      :cancelText="$t('languages.common.cancel')"
    />
    <!-- 搜索面板 -->
    <search-panel
      v-if="showSearchPanel"
      v-model="wd"
      :appSearch="true"
      @goAppItem="goAppItem"
      :appList="appList"
      class="instance__main"
    />
    <!-- 主体列表 -->
    <instance-list class="instance__main" @goAppItem="goAppItem" @setAppList="setAppList" v-show="!showSearchPanel"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import common from '@cloudpivot/common/mobile';
import SearchPanel from './initial-instance/search-panel.vue';
import InstanceList from './initial-instance/list-panel.vue';

@Component({
  name: 'initial-instance-home',
  components: {
    SearchBar: common.components.Searchbar,
    SearchPanel,
    InstanceList,
  },
})
export default class InitialInstance extends Vue {
  showSearchPanel: boolean = false;

  wd: string = '';

  appList:any = [];

  canSearch: boolean = false  // 是否可以搜索，当列表数据未返回时禁用搜索框

  setAppList(data:any) {
  this.canSearch = true
  if (data && data.length) {
      this.appList = data;
    }
  }

  /**
   * 开始搜索，展示搜索面板
   */
  focusSearch() {
    this.showSearchPanel = true;
  }

  /**
   * 取消搜索，隐藏搜索面板
   */
  cancelSearch() {
    this.showSearchPanel = false;
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

  goAppItem(appCode:any) {
    this.$router.push({
      name: 'initial-item',
      params: {
        appCode
      }
    }).catch((err: any) => {err});
  }
}
</script>

<style lang="less" scoped>
.instance {
  display: flex;
  height: inherit;
  flex-direction: column;
  overflow: hidden;
  &__search {
    flex: none;
  }
  &__main {
    flex: 1;
  }
}
</style>
