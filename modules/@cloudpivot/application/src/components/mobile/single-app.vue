<template>
  <div class="single-app">
    <!-- <search-bar
      :placeHolder="$t('cloudpivot.application.mobile.SearchFormName')"
      @search="search"
      @cancel="cancel"
      @clear="clear"
      @change="change"
      @focus="focus"
      @blur="blur"
    ></search-bar> -->
    <div class="single-app__main">
      <template v-if="showTask">
        <div class="single-app__tasks" v-if="!isFocus && !searchKey">
          <app-task :appCode="appCode"></app-task>
        </div>
      </template>
      <apps-item :appCode="appCode" :signAppCode="appCode"/>
      <!-- <div class="breadContainer" v-show="histryNames.length > 1">
        <span v-for="(item,index) in histryNames"  class="breadItem" :key="index" @click="clickBread(index)">
          <span>{{item}}</span>
          <i class="aufont icon-base-right"></i>
        </span>
      </div>
      <div class="single-app__groups" v-if="app">
        <div v-show="!searchKey && !isFocus">
          <biz-models
            v-for="(child,index) in app.list"
            :col="4"
            :key="index"
            :title="child.type === 'Folder' ? `${ app.title }-${getName(child)}` : ''"
            :list="child.children"
            @onItem="clickItem"
          />
        </div>
        <template v-if="searchKey">
          <biz-models
            v-for="(child,index) in searchResult.list"
            :col="4"
            :key="`search${index}`"
            :title="child.type === 'Folder' ? `${ searchResult.title }-${getName(child)}` : ''"
            :list="child.children"
            @onItem="clickItem"
          />
        </template>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Mixins, Watch
} from 'vue-property-decorator';
// import OpenFormMixin from '@/mixins/open-form';

import OpenFormMixin from './open-form';

import { Mutation } from 'vuex-class';

// import SearchBar from './searchbar.vue';

import BizModels from './biz-models.vue';

// import AppTask from './app-tasks.vue';

// import appApi from '@/apis/apps.api';

import { listApi } from '@cloudpivot/api';

import flowCenter from '@cloudpivot/flow-center/mobile';

import * as platform from '@cloudpivot/platform';

import common from '@cloudpivot/common/mobile';

import * as apps from '@cloudpivot/application';

const Utils = common.utils;
// import Utils from '@/utils';

@Component({
  name: 'single-app',
  components: {
    SearchBar: common.components.Searchbar,
    BizModels,
    AppTask: flowCenter.components.AppTask,
    AppsItem: apps.components.mobile.AppsItem
  }
})
export default class SingleApp extends Mixins(OpenFormMixin) {
  @Mutation('setAppCode') setAppCode!: any;

  app: any = null;

  searchKey: string = '';

  // 是否展示任务中心
  showTask: Boolean = true

  searchResult = {
    title: '',
    list: []
  };

  isFocus: boolean = false;

  Mode = {
    Normal: 0,
    Search: 1
  };
  histryList: Array<any> = [];
  histryNames: Array<string> = ["根目录"]

  mounted() {
    Utils.Bus.$on('toggleTask', (val: boolean) => {
      console.log(val)
      this.showTask = val;
    })
  }

  beforeDestroy() {
    Utils.Bus.$off("toggleTask");
  }

  clickBread(index){
    if(index == this.histryList.length)
    {
      return;
    }
    this.app.list = this.histryList[index];
    this.histryList.splice(index + 1,this.histryList.length-index);
    
    this.histryNames.splice(index + 1,this.histryNames.length-index)
   
  }
  clickItem(item: any)
  {
    if(item.type=="Folder" && item.children){
      this.app.list = [item];
      this.histryList.push(this.app.list);
      this.histryNames.push(item.name);
    }  
    else
    {
      this.goFormList(item);
    }
  }
  get appCode(){
    return window.Environment.appCode;
  }

  get appName() {
    return window.Environment.appName;
  }
  
  search() {

  }

  cancel() {
    this.searchKey = '';
    this.isFocus = false;
    this.initSearchResult();
  }

  clear() {
    this.searchKey = '';
    this.initSearchResult();
  }

  change(val: string) {
    this.searchKey = val;
    this.searchBizModels(val);
  }

  focus() {
    this.isFocus = true;
  }

  blur() {
    console.log('blur');
  }

  initSearchResult() {
    this.searchResult = {
      title: '',
      list: []
    };
  }

  formatData(data: any, mode: number) {
    // 目录数据
    const folders: Array<any> = data.filter((biz: any) => biz.type === 'Folder' && biz.children && biz.children.length);
    // 应用下直接挂载的业务模型
    const bizModels: Array<any> = data.filter((biz: any) => ['BizModel', 'Page', 'Report'].includes(biz.type));

    const appData: any = {
      title: '',
      code: this.appCode,
      list: []
    };
    if (bizModels.length) {
      appData.list = [
        {
          children: bizModels,
          type: null
        },
        ...folders
      ];
    } else {
      appData.list = folders;
    }
    if (mode === this.Mode.Normal) {
      this.app = appData;
      this.histryList.splice(0,0,this.app.list);
    } else {
      this.searchResult = appData;
    }
  }

  async getApp(code: string) {
    const params = {
      appCode: code,
      isMobile: true
    }
    const res = await listApi.getFolder(params);
    if (res.errcode === 0) {
      if (!Array.isArray(res.data)) {
        return;
      }
      this.formatData(res.data, this.Mode.Normal);
    }
  }

  async searchBizModels(searchKey: string) {
    const params = {
      appCode: this.appCode,
      searchKey,
    }
    const res = await listApi.searchBizModels(params);
    if (res.errcode === 0) {
      if (!Array.isArray(res.data)) {
        this.initSearchResult();
        return;
      }
      this.formatData(res.data, this.Mode.Search);
    }
  }

  /**
   * 获取多语言下对应展示名称
   */
  getName(block:any){
    return common.utils.BusinessFunctions.getLangName(block);
  }

  /**
   * 获取单应用的名称信息
   */
  getSingleAppInfo() {
    listApi.getSingleAppInfo(this.appCode).then((res:any) => {
      if (res.errcode === 0) {
        window.Environment.appName = res.data.name;
        platform.service.setTitle(res.data.name);
      }
    })
  }

  created() {
  
    if (this.appCode) {
      this.setAppCode(this.appCode);
      if (this.appName) {
        platform.service.setTitle(this.appName);
      } else {
        this.getSingleAppInfo();
      }
    }
    this.getApp(this.appCode);
  }
}

</script>
<style lang='less' scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.single-app {
  .search-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  &__tasks {
    .px2rem(margin-bottom, 20px);
  }
  &__main {
    position: absolute;
    top:0;
    left: 0;
    width: 100%;
    bottom: 0;
    overflow-y: auto;
  }
  &__groups {
    .px2rem(padding-left, 20);
    .px2rem(padding-right, 20);
  }
  &__groups {
    .px2rem(margin-top, 20);
  }
  .breadContainer{
    display: flex;
    align-items: center;
    color:#007dff;
    flex-wrap: wrap;
    background: #fff;
    margin: 10px;
    font-size: 16px;
    padding: 6px;
    .breadItem:last-of-type{
      color:#ccc;
      i{
        display: none;
      }
    }
  }
}
</style>
