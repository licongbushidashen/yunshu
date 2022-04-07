<template>
  <div class="search-panel">
    <!-- 内容 -->
    <div class="search-panel__wrap" v-show="showResult">
      <p class="search-panel__tip search-panel__title">
        {{ $t('cloudpivot.flowCenter.mobile.haveSearch') }}
        <span>{{ total }}</span>{{ $t('cloudpivot.flowCenter.mobile.items') }}
      </p>
      <div class="search-panel__list">
        <!-- <grid-list 
          v-if="list.length" 
          :list="list" 
          :searchWord="wd" 
          @onItem="goForm"
        /> -->
         <apps-list
          v-if="appSearch && list.length"
          :list="list"
          colorKey="code"
          displayName="displayName"
          @toggle="selectSideItem"
        />
        <item-list
          v-else-if="list.length" 
          :appItem="list" 
          :searchWord="wd" 
          @onItem="goForm"
        />
        <no-data v-else/>
      </div>
    </div>
    <!-- 历史 -->
    <div class="search-panel__wrap search-panel__history" v-show="!showResult">
      <p class="search-panel__title">{{ $t('cloudpivot.flowCenter.mobile.historySearch') }}</p>
      <ul>
        <li 
          v-for="(key,i) in history" 
          :key="i"
          @click="selectWord(key)"
        >{{ key }}</li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import { Mutation } from 'vuex-class';

import { initialInstanceApi,initialInstanceParams } from '@cloudpivot/api';
import common from '@cloudpivot/common/mobile';
@Component({
  name: 'SearchPanel',
  components: {
    // GridList: common.components.GridList,
    NoData: common.components.NoSearchData,
    ItemList: common.components.ItemList,
    AppsList: common.components.AppsList,
  }
})
export default class SearchPanel extends Vue {
  @Mutation('setAppName') setAppName!: any;

  @Mutation('setCurAppData') setCurAppData!: any;

  @Prop({ default: '' }) value!: string;

  @Prop({ default: false }) appSearch?: boolean;

  @Prop() appList?: any;

  list: Array<initialInstanceParams.InstanceItem> = [];

  history: Array<string> = [];

  total: number = 0;

  wd: string = '';

  /* 是否展示搜索结果列表 */
  showResult: boolean = false;

  @Watch('value', { immediate: true })
  onKeywordChange(val: string) {
    if (val) {
      this.search(val);
    } else {
      this.wd = '';
      this.showResult = false;
    }
  }

  goForm(workitem: any) {
    this.$router.push({
      name: 'form-detail',
      query: {
        startWorkflowCode: workitem.code,
        return: this.$route.fullPath
      }
    }).catch((err: any) => {err});
  }

  /**
   * 选中搜索词
   */
  selectWord(wd: string) {
    // this.search(wd);
    this.$emit('input', wd);
  }

  /**
   * 搜索应用
   */
  search(wd: string) {
    if (!wd) {
      this.$h3.toast.show({
        text: this.$t('cloudpivot.flowCenter.mobile.inputKeyword')
      });
      return;
    }
    if (wd === this.wd) {
      // 避免重复搜索
      return;
    }
    this.wd = wd;
    this.list = [];
    if (this.appSearch) {
      // 本地搜索应用名称
      if (!this.appList) {
        return;
      }
      this.appList.forEach((app: any) => {
        if (app.appName.indexOf(this.wd) !== -1) {
          this.list.push(app);
        }
      });
      this.total = this.list.length;
      this.showResult = true;
      this.recordKeyword(wd);
    } else {
      const searchParams:any = {
        workflowName: this.wd,
        language: this.$i18n.locale,
        isMobile: true
      };
      initialInstanceApi.listWorkflowsByName(searchParams).then((res: initialInstanceParams.HttpResponse<any>) => {
        // console.log('搜索结果', res);
        if (res.data && Array.isArray(res.data.appList)) {
          this.total = res.data.size;
          const list = res.data.appList.reduce((pre: any, next: any) => [...pre, ...next.dataList], []);
          this.list = list;
        } else {
          this.total = 0;
        }
        this.showResult = true;
        this.recordKeyword(wd);
      });
    }
  }

  /**
   * 记录搜索历史
   */
  recordKeyword(key: string) {
    this.history = Array.from(new Set([key, ...this.history]));
  }

  cancel() {
    this.showResult = false;
    this.list = [];
    this.total = 0;
    if (this.history.length) {
      localStorage.setItem('instance-search-history', JSON.stringify(this.history));
    }
  }

  selectSideItem(app: any) {
    // 跳转应用详情
    const name = common.utils.BusinessFunctions.getLangName(app, 'appName');
    this.setAppName(name);
    this.setCurAppData(app);
    this.$emit('goAppItem', app.appCode);
  }

  mounted() {
    const history = localStorage.getItem('instance-search-history');
    if (history) {
      try {
        const list = JSON.parse(history);
        if (Array.isArray(list)) {
          this.history = list;
        }
      } catch (error) {
        this.history = [];
      }
    }
  }

  beforeDestroy() {
    this.cancel();
  }
}
</script>
<style lang="less" scoped>

@import "~@cloudpivot/common/styles/mixins.less";

.search-panel {
  width: 100%;
  height: 100%;
  background: @main-background;
  overflow: hidden;
  &__wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    height: 100%;
  }
  &__title {
    .px2rem(padding-left, 30px);
    .px2rem(padding-right, 30px);
    .px2rem(padding-top, 27px);
    .px2rem(padding-bottom, 27px);
    .px2rem(font-size, 26px);
    margin-bottom: 0;
    text-align: left;
    color: #999;
  }
  &__tip {
    flex: none;
    span {
      color: @primary-color;
    }
  }
  &__list {
    flex: 1;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }
  &__history {
    ul {
      flex: 1;
      width: 100%;
      .px2rem(padding, 30px);
      padding-top: 0;
      text-align: left;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
    }
    li {
      display: inline-block;
      width: auto;
      max-width: 100%;
      .px2rem(padding-left, 20px);
      .px2rem(padding-right, 20px);
      .px2rem(margin-right, 30px);
      .px2rem(margin-bottom, 20px);
      .px2rem(height, 60px);
      .px2rem(line-height, 60px);
      .px2rem(border-radius, 30px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
      background-color: #eceff4;
    }
  }
}
</style>
