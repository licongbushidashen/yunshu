<template>
  <div class="start-workflow-wrap">
    <div class="start-workflow-head">
      <div class="start-workflow-head-left">
        <i @click="goBack" class="goback icon aufontAll h-icon-all-circle-left"></i>
        <span>{{ $t('cloudpivot.flowCenter.pc.startFlow') }}</span>
      </div>
      <div class="start-workflow-head-right">
        <a-input
          class="zkcustomer"
          :placeholder="$t('cloudpivot.flowCenter.pc.searchFlowName')"
          style="width: 300px;"
          v-model="wd"
          @change="onhandleChange"
          @pressEnter="onSearch "
        >
          <a-icon
            class="suffix-icon close-icon"
            v-if="wd.length > 0 "
            slot="suffix"
            type="close-circle"
            @click="clearKeyword"
          />

          <a-icon
            class="suffix-icon search-icon"
            type="search"
            slot="suffix"
            @click="onSearch"
          />
        </a-input>
      </div>
    </div>
    <div
      id="start-workflow"
      ref="workflow"
      class="start-workflow-content"
    >
      <div class="start-workflow-scroll" ref="workflowScroll">
        <div class="search-result" v-if="isShowSearchResult">
          {{ $t('cloudpivot.flowCenter.pc.searchRzt') }} <span class="search-num">{{ searchTotal }}</span> {{ $t('cloudpivot.flowCenter.pc.items') }}
        </div>
        <template v-if="!isShowSearchResult">
          <workflow-item
            :item="favoriteList"
            type="favorite"
            v-if="favoriteList.length"
            @openWorkFlow="openWorkFlow"
          />
          <div class="line" v-if="favoriteList.length"></div>
          <template v-for="(item,index) in itemList">
            <workflow-item
              :key="index"
              :startIndex="index"
              :item="item"
              v-if="item.size"
              :curNum="curNum"
              type="workflow"
              @openWorkFlow="openWorkFlow"
            />
          </template>
        </template>
        <template v-else>
          <template v-for="(item,index) in searchList">
            <workflow-item
              :key="index"
              :item="item"
              :curNum="curNum"
              type="workflow"
              @openWorkFlow="openWorkFlow"
            />
          </template>
          <div class="already-load" v-show="!isShowSearchNoData">{{ $t('cloudpivot.flowCenter.pc.showAll') }}</div>
        </template>
        <div class="no-data">
          <PageNoData
            :isShowNoData="false"
            :isShowSearchNoData="isShowSearchNoData"
            tipText=""
          />
        </div>
      </div>
    </div>

    <div class="iframe-shadow" v-if="showIframeForm"></div>
    <transition name="fade-down">
    <div v-if="showIframeForm" class="iframe-form-warp">
      <div class="icon-close" @click="showIframeForm = false">
        <!-- <span><a-icon type="close" /></span> -->
        <span class="icon aufontAll">&#xe996;</span>
      </div>
      <iframe ref="iframe" class="iframe-form-warp--page" :src="IframeFormUrl"></iframe>
    </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
  State, Action, Mutation, namespace
} from 'vuex-class';
import {
  Input, Icon
} from '@h3/antd-vue';
import WorkflowItem from './components/start-workflow/workflow-item.vue';

import common from '@cloudpivot/common/pc';

// 引入发起流程store
import StartWorkflowStore from './store/start-workflow';

@Component({
  name: 'start-workflow',
  components: {
    AInput: Input,
    AIcon: Icon,
    WorkflowItem,
    PageNoData: common.components.PageNoData
  }
})
export default class StartWorkflow extends Vue {

  curNum:number = Number.POSITIVE_INFINITY; // 当前窗口一行可以展示多少个流程

  wd:string = ''; // 搜索关键字


  IframeFormUrl: string = ''
  showIframeForm:boolean = false
  openWorkFlow(href){
    if(href){
      this.IframeFormUrl = href
      this.showIframeForm = true
    }
  }

  get favoriteList() {
    return this.$store.state.StartWorkflowStore.favoriteList;
  }

  get searchTotal() {
    return this.$store.state.StartWorkflowStore.searchTotal;
  }

  get isShowSearchNoData() {
    return this.$store.state.StartWorkflowStore.isShowSearchNoData;
  }

  get isShowSearchResult() {
    return this.$store.state.StartWorkflowStore.isShowSearchResult||false;
  }

  get itemList() {
    return this.$store.state.StartWorkflowStore.itemList;
  }

  get searchList() {
    return this.$store.state.StartWorkflowStore.searchList;
  }



  created () {
    this.$store.registerModule('StartWorkflowStore', StartWorkflowStore);
  }

  destroyed () {
    this.$store.commit('StartWorkflowStore/resetShowSearch');
    this.$store.unregisterModule('StartWorkflowStore');
  }

  beforeMount() {
    this.handleGetLists();
    // this.getFavoriteWorkflowList();
    // this.getWorkflowList();
  }

  async mounted() {
    this.calcNums();
    common.utils.Bus.$on('resize', this.calcNums);
    window.addEventListener('resize', this.calcNums);

    window.addEventListener("message", this.reloadMessage, false);
  }
  reloadMessage(event: any) {
    if(event.data === 'close' || (typeof event.data === 'string' && (event.data.indexOf('/workflow-center/start-workflow') !== -1 || event.data.indexOf('%2Fworkflow-center%2Fstart-workflow') !== -1))){
      this.showIframeForm = false
      this.IframeFormUrl = ''
    }
  }

  getFavoriteWorkflowList(){
    this.$store.dispatch('StartWorkflowStore/getFavoriteWorkflowList');
  }

  getWorkflowList(){
    return this.$store.dispatch('StartWorkflowStore/getWorkflowList');
  }

  searchMyWorkflowList(params:any){
    this.$store.dispatch('StartWorkflowStore/searchMyWorkflowList', params);
  }

  onhandleChange(e: any) {
    if (!this.wd) {
      this.onSearch();
    }
  }

  /*
  * 点击搜索
  */
  onSearch() {
    if (this.wd) {
      const searchParams = {
        workflowName: this.wd,
        language: this.$i18n.locale,
        isMobile: false
      };
      this.searchMyWorkflowList(searchParams);
    } else {
      this.handleGetLists();
      // this.getFavoriteWorkflowList();
      // this.getWorkflowList();
    }
    const curScrollDom = this.$refs.workflowScroll as HTMLElement;
    if (!curScrollDom) {
      return;
    }
    curScrollDom.scrollTop = 0;
  }

  /*
  * 清空关键字
  */
  clearKeyword() {
    this.wd = '';
    this.handleGetLists();
    // this.getFavoriteWorkflowList();
    // this.getWorkflowList();
  }

  /*
  * 返回待办列表
  */
  goBack() {
    this.$router.push('my-unfinished-workitem').catch((err: any) => {err});
  }

  /*
  * 计算当前窗口一行可以展示多少个
  */
  calcNums() {
    const curDom = this.$refs.workflow as HTMLElement;
    if (!curDom) {
      return;
    }
    this.curNum = Math.floor((curDom.clientWidth - 15) / 222);
  }

  /**
   * 请求接口整合
   */
  async handleGetLists() {
    this.getFavoriteWorkflowList();
    const res:any = await this.getWorkflowList();
    // 只处理错误提示
    if (res.errcode) {
      this.$message.error(res.errmsg);
    }
  }
}
</script>

<style lang="less" scoped>
.start-workflow-wrap{
  height: 100%;
  overflow: hidden;
  .start-workflow-head{
    height: 48px;
    .start-workflow-head-left{
      float: left;
      font-size: @font-size-16;
      font-weight: @font-weight-md;
      color: @light-color-1;
      .goback{
        font-size: @font-size-24;
        margin-left: @base4-padding-md;
        margin-right: @base4-padding-xs;
        color: @light-color-3;
        vertical-align: middle;
        cursor: pointer;
      }
    }
    .start-workflow-head-right{
      /deep/ .ant-input-affix-wrapper .ant-input:not(:last-child) {
        padding-right: 50px;
      }
      float: right;
      .suffix-icon {
        cursor: pointer;
      }
      .close-icon {
        margin-right: @base4-padding-xs;
      }
      .search-icon {
        color: @light-color-3;
        // &>svg{
        //   display: none;
        // }
      }
    }
  }
  .start-workflow-content{
    height: calc( 100% - 48px );
    background: @dark-color-1;
    padding: @base10-padding-sm 0;
    border-radius: @border-radius-lg;
    position: relative;
    box-shadow:0px 2px 8px 0px rgba(30,85,255,0.1);
    overflow: hidden;
    .start-workflow-scroll{
      overflow-y: auto;
      height: 100%;
      padding-left: @base10-padding-sm;
      position: relative;
      transform: translate3d(0,0,0);
      .line{
        margin: 0 16px 16px 6px;
        background: #D8DDE2;
        height: 1px;
      }
    }
    .no-data{
      text-align: center;
      position: absolute;
      top: 50%;
      margin-top: -120px;
      margin-left: -145px;
      left: 50%;
      p {
        font-size: @font-size-14;
        color: @light-color-3;
      }
    }
    .search-result{
      margin-bottom: @base4-padding-md;
      .search-num{
        color: @primary-color;
      }
    }
    .already-load{
      text-align: center;
      color: @light-color-3;
      margin-top: @base10-padding-sm*4;
    }
  }
}


.iframe-form-warp {
  position: fixed;
  top: 48px;
  bottom: 48px;
  left: 83px;
  right: 83px;
  margin: auto;
  min-width: 1024px;
  max-width: 1200px;
  background: #fff;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  &--page {
    width: 100%;
    height: 100%;
    overflow: auto;
    border: none;
  }
}
.iframe-shadow{
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 999;
}

.fade-down-enter-active {
  transition: all .3s ease;
}
.fade-down-leave-active {
  transition: all 0s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.fade-down-enter, .fade-down-leave-to
/* .slide-fade-leave-active 用于 2.1.8 以下版本 */ {
  transform: translateY(-30px);
  opacity: 0;
}

.icon-close{
  position: absolute;
  right: 24px;
  top: 20px;
}
</style>
