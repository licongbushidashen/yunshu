<template>
  <div class="instance-list" v-show="!loading">
    <empty v-if="isEmpty"/>
    <div class="instance-list__container" v-else>
      <h3-scroll
        ref="scroll"
        :loadMore="loadMore"
        :pageSize="pageSize">
        <!-- 常用流程 -->
        <instances
          class="instance-list__favorite"
          :title="$t('cloudpivot.flowCenter.mobile.commonFlow')"
          :list="favoriteInstances"
          :collapsable="true"
          :col="4"
          @onItem="goForm"
        />
        <!-- 流程列表 -->
        <div class="instance-list__wrap">
          <apps-list
            :list="appList"
            colorKey="code"
            displayName="displayName"
            @toggle="selectSideItem"
          />
        </div>
      </h3-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';
import mobile from '@cloudpivot/form/src/renderer/components/mobile';
import { initialInstanceApi, initialInstanceParams } from '@cloudpivot/api';
import common from '@cloudpivot/common/mobile';
// import AppContent from './app-content.vue';
import Instances from './instances.vue';
import { utils } from '@cloudpivot/common';
@Component({
  name: 'instance-list',
  components: {
    Empty: common.components.Empty,
    // SideBar: common.components.Sidebar,
    // AppContent,
    AppsList: common.components.AppsList,
    Instances,
    H3Scroll: mobile.H3Scroll,
  },
})
export default class InstanceList extends Vue {
  @Mutation('setAppName') setAppName!: any;

  @Mutation('setCurAppData') setCurAppData!: any;

  loading: boolean = true;

  isEmpty: boolean = false;

  appList: any[] = [];

  favoriteInstances: any[] = [];

  activeCode: string = '';

  currentApp: any = null;

  currentIdx: number = 0;

  pageSize:number = 28;

  page: number = 1;

  sourceList:any = [];

  // 是否已加载过至少一次第一页数据
  firstTimeLoad: boolean = false;

  beforeMount() {
    this.load();
    this.getFavoriteInstances();
    this.$nextTick(() => {
      utils.Bus.$emit('toggleNavbar', false);
    });
  }

  destroyed() {
    utils.Bus.$emit('toggleNavbar', true);
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

  loadMore(page: any, done: any) {
    console.log('load');
    const vm: any = this;
    if (!vm.firstTimeLoad) {
      const isMobile = true;
      initialInstanceApi.listMyWorkflow(isMobile).then((res: initialInstanceParams.HttpResponse<any>) => {
        if (Array.isArray(res.data) && res.data.length) {
          vm.sourceList = res.data.map((app: initialInstanceParams.AppData) => vm.formatItem(app));
          vm.appList = vm.sourceList.slice(0, vm.pageSize);
          vm.$emit('setAppList', vm.sourceList);
          // 这块代码不知作用-暂且保留
          // this.$nextTick(() => {
          //   const appcode: any = sessionStorage.getItem('initialSourceApp');
          //   if (appcode && res.data.some((a: any) => a.appCode === appcode)) {
          //     this.activeCode = appcode;
          //     this.selectApp(appcode);
          //     sessionStorage.removeItem('initialSourceApp');
          //   } else {
          //     this.activeCode = res.data[0].appCode;
          //     this.selectApp(this.activeCode);
          //   }
          // });
          vm.load(true);
        } else {
          vm.isEmpty = true;
          vm.load(true);
        }
        vm.firstTimeLoad = true;
        if (done) {
          done(vm.pageSize, vm.sourceList.length);
        }
      });
      return
    }
    vm.page = page.num;
    if (page.num === 1) {
      // this.appList = this.sourceList.slice(0, this.pageSize);
      if (done) {
        done(vm.pageSize, vm.sourceList.length);
      }
      return;
    }
    if (done) {
      const delay = setTimeout(() => {
        clearTimeout(delay);
        vm.appList = vm.appList.concat(vm.sourceList.slice((vm.page-1)*vm.pageSize, vm.page*vm.pageSize));
        done(vm.pageSize, vm.sourceList.length);
      }, 500);
    }
  }

  getFavoriteInstances() {
    initialInstanceApi.listFavoriteWorkflows().then((res: initialInstanceParams.HttpResponse<any>) => {
      // console.log('常用流程：', res);
      if (Array.isArray(res.data) && res.data.length) {
        this.favoriteInstances = res.data.slice(0, 7);
      }
    });
  }

  /**
   * 将返回的每个应用的数据格式化为UI展示相对应的格式
   */
  formatItem(item: initialInstanceParams.AppData) {
    const folders: Array<initialInstanceParams.InstanceItem> = item.dataList.filter((ins: any) => ins.type === initialInstanceParams.AppTreeItemTypes.Folder && ins.size).map((ins: any) => {
      ins.children = [];
      return ins;
    });
    const instances: Array<initialInstanceParams.InstanceItem> = item.dataList.filter((ins: any) => ins.type === initialInstanceParams.AppTreeItemTypes.BizModel);
    let list: Array<initialInstanceParams.InstanceItem | initialInstanceParams.InstanceRootItem> = [];
    if (instances.length) {
      list = [{ children: instances }, ...folders];
    } else {
      list = folders;
    }
    return {
      ...item,
      displayName: common.utils.BusinessFunctions.getLangName(item,'appName'),
      children: list
    };
  }

  // selectApp(code: string) {
  //   /* 选中了一个应用 */
  //   // console.log('currentApp:', code);
  //   this.currentApp = null;
  //   const item: any = this.appList.find((app: any, index: number) => {
  //     if (app.appCode === code) {
  //       this.currentIdx = index;
  //       return app;
  //     }
  //     return null;
  //   });
  //   if (!item) {
  //     return;
  //   }
  //   this.$nextTick(() => {
  //     this.currentApp = item;
  //   });
  // }

  selectSideItem(app: any) {
    this.activeCode = app.appCode;
    // this.selectApp(app.appCode);
    // 跳转应用详情
    console.log('当前应用：', app);
    const name = common.utils.BusinessFunctions.getLangName(app, 'appName');
    this.setAppName(name);
    this.setCurAppData(app);
    this.$emit('goAppItem', app.appCode);
  }

  goForm(workitem: any) {
    // sessionStorage.setItem('initialSourceApp', this.currentApp.appCode);
    this.$router.push({
      name: 'form-detail',
      query: {
        startWorkflowCode: workitem.code,
        return: this.$route.fullPath
      }
    }).catch((err: any) => {err});
  }
}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

.instance-list {
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /deep/.empty {
    width: 100%;
    text-align: center;
  }
  &__container {
    width: 100%;
    height: 100%;
    display: flex;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: column;
    /deep/.mescroll {
      height: auto;
      .px2rem(top, 88px);
      .px2rem(bottom, 0);
    }
  }
  &__favorite {
    flex: none;
    margin-top: 0;
    border-radius: 0;
    position: relative;
    .hairline("top", #e6ebf6);
    /deep/.instances__title {
      .px2rem(font-size, 28px);
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
  }
  &__wrap {
    flex: 1;
    display: flex;
    align-items: flex-start;
    width: 100%;
    background: #fff;
  }
  &__content {
    flex: 1;
    height: 100%;
    overflow-y: auto;
  }
}
</style>
