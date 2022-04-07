<template>
  <div class="initial-item">
    <!-- 搜索框 -->
    <search-bar
      class="initial-item__search"
      :value="wd"
      :onclear="onClear"
      @focus="focusSearch"
      @cancel="cancelSearch"
      @search="search"
    />
    <!-- 主体内容 -->
    <search-panel
      v-if="showSearchPanel"
      v-model="wd"
      class="initial-item__main"
    />
    <item-list
      class="initial-item__main"
      :appItem="appItem"
      :loadBizModel="true"
      v-show="!showSearchPanel && !loading"
      @onItem="goForm"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { State } from 'vuex-class';

import common from '@cloudpivot/common/mobile';

import { listApi } from '@cloudpivot/api';

const Bus:any = common.utils.Bus;

import SearchPanel from '../search-panel.vue';

@Component({
  name: 'initial-item',
  components: {
    SearchBar: common.components.Searchbar,
    SearchPanel,
    ItemList: common.components.ItemList,
  }
})
export default class InitialItem extends Vue {
  @State('curAppData') curAppData!: any;

  @Prop() appCode!: any;

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
  }

  /**
   * 取消搜索，隐藏搜索面板
   */
  cancelSearch() {
    this.wd = '';
    this.showSearchPanel = false;
    Bus.$emit('toggleNavbar', !this.showSearchPanel);
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
    this.load(true);
    if (!this.curAppData || !Array.isArray(this.curAppData.dataList)) {
      return;
    }
    this.appItem = JSON.parse(JSON.stringify(this.curAppData.dataList));
    this.currentApp = {
      code: this.appCode
    };
  }

  goForm(workitem: any) {
    // sessionStorage.setItem('initialSourceApp', this.appCode);
    this.$router.push({
      name: 'form-detail',
      query: {
        startWorkflowCode: workitem.code,
        return: this.$route.fullPath
      }
    }).catch((err: any) => {err});
  }

  beforeDestroy() {
    Bus.$emit('toggleNavbar', true);
  }
}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.initial-item {
  display: flex;
  height: 100%;
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
