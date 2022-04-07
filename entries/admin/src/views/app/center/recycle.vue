<template>
  <div class="recycle" @scroll="contenScroll" ref="recycle">
    <div class="header-recycle">
      <div class="header-left">
        <div class="header-tips-content"></div>
        <i class="icon aufontAll h-icon-all-arrow-left-o" @click="toBack"></i>
        <span>回收站</span>
      </div>
      <div class="header-right flex-justify-between">
        <a-button type="primary" @click.stop="delectAll">
          <a-icon type="delete" />清空回收站
        </a-button>
        <a-button type="default" @click.stop="restoreAll">
          <a-icon type="sync" />全部还原
        </a-button>
        <a-button
          type="default"
          @click.stop="recycleReductionC(ids)"
          :disabled="!isChecked"
        >
          <a-icon type="reload" />还原
        </a-button>
        <a-button
          type="default"
          @click.stop="recycleDeleteC(deleteParams)"
          :disabled="!isChecked"
        >
          <a-icon type="delete" />彻底删除
        </a-button>
      </div>
    </div>

    <div class="back-delete-id">
      <div class="back-delete" @click="toBack">
        <a-tooltip placement="top">
          <template slot="title">
            <span>应用管理</span>
          </template>
          <i class="icon aufontAll h-icon-all-appstore"></i>
        </a-tooltip>
      </div>
    </div>

    <div class="back-top" v-show="backTop" @click="goBackTop">
      <i class="icon aufontAll h-icon-all-circle-up"></i>
    </div>

    <a-spin class="spinning" :spinning="spinning" />

    <div class="apps-list-content-all">
      <!-- <div class="apps-list-nav-wrap">
        <div style="margin-bottom:16px"></div>
        <div class="apps-list-nav">
          <template v-for="(item, i) of appGroupList">
            <div
              class="title"
              :title="item.name"
              :class="{ active: groupCode === item.code }"
              @click="getAppGroupList(item)"
              :key="i"
            >
              <span>{{ item.name }}</span>
            </div>
          </template>
        </div>
      </div> -->
      <div class="apps-list">
        <!-- <div class="apps-list" :style="`width: ${wrapWidth}px;`"> -->
        <!-- 删除回收站应用分组--不要删除，以免后面需要重做 -->
        <!-- <div class="recycle-nav">
        <template v-for="(item, i) of appGroupList">
          <div
            class="recycle-nav-li"
            :title="item.name"
            :class="{ active: groupCode === item.code }"
            @click.self="getAppGroupList(item)"
            :key="i"
          >
            {{ item.name }}
          </div>
        </template>
      </div> -->
        <div v-if="!appList || !appList.length" class="apps-empty">
          <img src="~@/assets/images/userEmpty.png" alt="empty" />
          <p>{{isLoading ? '加载中...' : '回收站空空如也'}}</p>
        </div>
        <template v-else>
          <div style="padding: 0 105px 0 86px">
            <a-checkbox
              v-model="checkedAll"
              @change="checkApp($event)"
              >全选</a-checkbox
            >
            <a-input-search
              :placeholder="$t('languages.Apps.SearchAppName')"
              class="input-search"
              v-show="appList && appList.length > 12"
              allow-clear
              @search="onSearch"
              @change="onhandleChange"
              @pressEnter="onSearch"
            />
          </div>
          <div v-if="isSearchResult && !searchList.length" class="apps-empty">
            <img src="~@/assets/images/userEmpty.png" alt="empty" />
            <p>暂无搜索结果</p>
          </div>

          <div class="selected-count-wrap" v-show="ids && ids.length > 0"><a-checkbox checked
            >已选 {{ids.length}} 个</a-checkbox
          ></div>
          <div class="apps-list-content">
            <template
              v-for="(item, i) in isSearchResult ? searchList : appList"
            >
              <a-dropdown :trigger="['contextmenu']" :key="i">
                <div class="content-item" :class="{checked: item.checked}" @click.stop="to(item)">
                  <div class="setting" :class="{ isshow: item.checked }">
                    <a-checkbox @click.stop v-model="item.checked"></a-checkbox>
                  </div>
                  <img
                    v-if="!item.enabled"
                    src="~@/assets/images/enabled.svg"
                    class="content-item-enabled"
                  />
                  <template v-if="item.content">
                    <img
                      :src="'data:image/png;base64,' + item.content"
                      class="content-item-icon"
                    />
                  </template>
                  <template v-else-if="item.logoUrl">
                    <img
                      v-if="item.logoUrl.indexOf('http') > -1"
                      :src="item.logoUrl"
                      class="content-item-icon"
                    />
                    <img
                      v-else
                      :src="getDownloadUrl(item.logoUrl)"
                      class="content-item-icon"
                    />
                  </template>
                  <img v-else :src="defaultAppIcon" class="content-item-icon" />

                  <a-tooltip
                    placement="top"
                    v-if="showTootip(item.displayName)"
                  >
                    <span slot="title">{{ item.displayName }}</span>
                    <p class="content-item-name">{{ item.displayName }}</p>
                  </a-tooltip>
                  <p class="content-item-name" v-else>{{ item.displayName }}</p>

                <div class="tool-menu">
                  <div @click.stop="recycleReductionOne([item.id])" class="tool-menu-item">还原</div>
                  <div @click.stop="recycleDeleteOne([{ id: item.id, code: item.code, type: '' },])" class="tool-menu-item">彻底删除</div>
                </div>
                </div>
              </a-dropdown>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { getRealLength } from "@/common/utils";
import { LanguageTransform, Download } from "@/utils";
import AppsApi from "@/apis/apps";
const icon = require("@/assets/images/appicon.png");
@Component({
  name: "Recycle",
})
export default class Recycle extends Vue {
  wrapWidth: number = 0;

  groupCode: string = "all";
  fromRecycle: boolean = true;

  defaultAppIcon: any = icon;
  // 应用List
  appList: any = [];
  isChecked: boolean = false;
  // 分组List
  appGroupList: any = [];

  checkedAll: boolean = false;

  spinning: boolean = false;

  searchKey: string = "";
  isSearchResult: boolean = false;
  searchList: any = [];

  isLoading: boolean = false

  async created() {
    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.calcWidth();

    window.onresize = () => {
      this.calcWidth();
    };
    this.getAppList();
  }

  // 获取应用分组列表接口
  async getAppList() {
    this.spinning = true;
    this.isLoading =  true
    const params: any = {
      groupCode: this.groupCode,
      fromRecycle: this.fromRecycle,
    };
    this.appList = [];
    const res: any = await AppsApi.getAppgroupList(params);
    this.isLoading =  false
    if (res.errcode !== 0) {
      this.spinning = false;
      return this.$message.error(res.errmsg);
    } else {
      this.spinning = false;
      this.appGroupList = res.data.map((d: any) => {
        return {
          id: d.id,
          code: d.code,
          name: d.name,
        };
      });
      const data: any = res.data.find((d: any) => d.code === params.groupCode);
      data.children.forEach((app: any) => {
        app.checked = false;
        app.displayName = app.name_i18n
          ? LanguageTransform.getLang(app.name, app.name_i18n)
          : app.name;
      });
      this.appList = data.children;
    }
    window.setTimeout(() => {
      this.spinning = false;
    }, 1000);
  }

  /**
   * 应用搜索
   */
  onSearch() {
    this.searchList = [];
    if (this.searchKey) {
      this.appList.forEach((app: any) => {
        if (
          app.displayName
            .toLowerCase()
            .indexOf(this.searchKey.toLowerCase()) !== -1
        ) {
          this.searchList.push(app);
        }
      });
      this.isSearchResult = true;
    } else {
      this.isSearchResult = false;
    }
  }

  onhandleChange(e: any) {
    this.searchKey = e.target.value;
    if (!e.target.value) {
      this.onSearch();
    }
  }

  /**
   * 清空搜索关键字
   */
  clearKeyword() {
    this.searchKey = "";
    this.searchList = [];
    this.isSearchResult = false;
    // this.getRecycleList();
  }

  // 点击分组
  getAppGroupList(item: any) {
    this.checkedAll = false;
    this.groupCode = item.code;
    this.searchKey = "";
    this.isSearchResult = false;
    this.searchList = [];
    this.getAppList();
  }

  // 回收站应用模型
  to(item: any) {
    this.$router
      .push({
        name: "recycleitem",
        params: {
          appCode: item.code,
        },
        query: {
          name: item.name_i18n
            ? LanguageTransform.getLang(item.name, item.name_i18n)
            : item.name,
        },
      })
      .catch((err: any) => {
        err;
      });
  }
  /**
   * 计算应用列表的最大宽度
   */
  calcWidth() {
    const winWidth: number = Math.max(1024, document.body.clientWidth);
    let n: number = 0;
    if (winWidth < 1001) {
      /* eslint-disable-next-line */
      n = Math.floor((winWidth - 160 + 24) / 196);
    } else {
      /* eslint-disable-next-line */
      n = Math.floor((winWidth - 0 + 24) / 196);
    }
    // console.log('可放置多少个应用：', n);
    this.wrapWidth = Math.round(196 * n - 24) + 150;
  }

  /**
   * 应用名称超过20个字节时显示tooltip
   */
  showTootip(name: string) {
    return getRealLength(name) > 20;
  }

  /**
   * 内容区域滚动事件
   */
  backTop: boolean = false;
  contenScroll() {
    const appDom = this.$refs.recycle as HTMLElement;
    if (!appDom) {
      return;
    }
    if (appDom.scrollTop > 50) {
      this.backTop = true;
    } else {
      this.backTop = false;
    }
  }
  /**
   * 回到顶部
   */
  goBackTop() {
    const appDom = this.$refs.recycle as HTMLElement;
    if (!appDom) {
      return;
    }
    appDom.scrollTop = 0;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  }

  toBack() {
    this.$router
      .push({
        name: "appcenter",
      })
      .catch((err: any) => {
        err;
      });
  }

  /**
   * 清空回收站
   */
  delectAll() {
    const vm: any = this;
    this.$confirm({
      title: "清空回收站",
      content: "是否确定彻底删除所有应用？删除后不可找回",
      okType: "danger",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading("删除数据中，请稍后...", 0);
        AppsApi.physically_deleteAll()
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.appList = [];
          })
          .catch((err: any) => {
            loading();
          });
      },
    });
  }

  /**
   * 全部还原
   */
  restoreAll() {
    const vm: any = this;
    this.$confirm({
      title: "全部还原",
      content: "是否确定要还原所有应用？",
      okType: "primary",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading("还原数据中，请稍后...", 0);
        AppsApi.restoreAll()
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.appList = [];
          })
          .catch((err: any) => {
            loading();
          });
      },
    });
  }

  /**
   * 还原
   */
  recycleReductionC(params: any) {
    const vm: any = this;
    if (!this.isChecked) {
      return vm.$message.error("请勾选应用！");
    }

    this.$confirm({
      title: (this as any).$t("languages.Apps.Reduction"),
      content: "是否确定要还原已勾选的应用？",
      okType: "primary",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        // 还原回收站资源
        const loading: any = vm.$message.loading(
          "还原选中数据中，请稍后...",
          0
        );
        AppsApi.RecycleRestore(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params);
          })
          .catch((err: any) => {
            loading();
          });
      },
    });
  }

    /**
   * 还原单个应用
   */
  recycleReductionOne(params: any) {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t("languages.Apps.Reduction"),
      content: "是否确定要还原应用？",
      okType: "primary",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        // 还原回收站资源
        const loading: any = vm.$message.loading(
          "还原中，请稍后...",
          0
        );
        AppsApi.RecycleRestore(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params);
          })
          .catch((err: any) => {
            loading();
          });
      },
    });
  }
  /**
   * 彻底删除
   */
  recycleDeleteC(params: any) {
   
    const vm: any = this;
    if (!this.isChecked) {
      return vm.$message.error("请勾选应用！");
    }

    this.$confirm({
      title: (this as any).$t("languages.Apps.recycleDelete"),
      content: "是否确定彻底删除已勾选的应用？删除后不可找回",
      okType: "danger",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading(
          "删除选中数据中，请稍后...",
          0
        );
        AppsApi.RecycleDelete(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params.map(v => v.id));
          })
          .catch((err: any) => {
            loading();
          });
      },
    });
  }

  /**
   * 彻底删除单个应用
   */
  recycleDeleteOne(params: any) {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t("languages.Apps.recycleDelete"),
      content: "是否确定彻底删除应用？删除后不可找回",
      okType: "danger",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading(
          "删除数据中，请稍后...",
          0
        );
        AppsApi.RecycleDelete(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params.map(v => v.id));
          })
          .catch((err: any) => {
            loading();
          });
      },
    });
  }
  // 是否有选择数据勾选
  ids: any = [];
  deleteParams: any = [];
  removeList(ids: Array<any>)
  {
    //筛选过后的数组也应该需要过滤掉已经删除的元素
    if(this.isSearchResult){
      this.searchList = this.searchList.filter((s: any) => !ids.includes(s.id));
    }
    this.appList = this.appList.filter((s: any) => !ids.includes(s.id));

  }
  @Watch("appList", {
    deep: true,
  })
  valueChange(v: any) {
    if (v && v.length) {
      this.isChecked = v.some((e: any) => {
        return e.checked === true;
      });

      // 是否勾选了应用
      let parentArray: any = v.filter((s: any) => s.checked === true);

      this.ids = parentArray.map((e: any) => e.id);
      this.deleteParams = parentArray.map((e: any) => {
        let { id, code } = e;
        return {
          id,
          code,
          type: "",
        };
      });
      //模糊搜索场景下，全选后，若全部还原或删除则需要将checkedAll置为false
      if(this.isSearchResult){
        if(!this.searchList.length){
          this.checkedAll = false;
        } else{
          this.checkedAll = this.searchList.every((e: any) => {
            return e.checked === true;
          });
        }
      } else{
        if(!v.length){
          this.checkedAll = false;
        } else{
          this.checkedAll = v.every((e: any) => {
            return e.checked === true;
          });
        }
      }
    } else {
      this.ids = [];
      this.deleteParams = [];
      this.isChecked = false;
    }
    console.log(this.ids, this.deleteParams, this.isChecked);
  }

  // 应用全选
  checkApp(e: any) {
    const checked: boolean = e.target.checked;
    //模糊搜索场景下，全选时需要判断searchList里面的选中状态
    if(this.isSearchResult){
      this.searchList.forEach((res: any) => {
        res.checked = checked;
      });
    } else{
      this.appList.forEach((res: any) => {
        res.checked = checked;
      });
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/app.less";
#app .recycle {
  background: #f6f7f9;
  overflow: hidden;
  /*height: calc(100vh - 120px);*/
  /*overflow-y: auto;*/
  .apps-list-content-all {
    display: flex;
    .apps-list-nav {
      background: #fff;
      height: 100%;
      overflow: auto;
      i {
        cursor: pointer;
      }
      .active {
        background-color: #e8fcf4;
      }
      .title {
        margin-top: 5px;
        height: 32px;
        line-height: 32px;
        padding: 0 13px 0 16px;
        display: flex;
        justify-content: space-between;
        cursor: default;
        span {
          flex: 1;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        &:hover {
          background-color: #e8fcf4;
        }
      }
    }
  }
  .back-top {
    position: fixed;
    right: 24px;
    bottom: 24px;
    cursor: pointer;
    i {
      font-size: 44px;
      color: rgba(0, 0, 0, 0.25);
    }
  }
  .back-delete-id  {
    width: 55px;
    height: 55px;
    padding: 3px;
    border-radius: 4px;
    position: fixed;
    right: 18px;
    bottom: 95px;
    cursor: pointer;
  }
  .back-top,
  .back-delete {
    position: fixed;
    right: 24px;
    bottom: 24px;
    cursor: pointer;
    i {
      font-size: 44px;
      color: rgba(0, 0, 0, 0.25);
    }
  }
  .back-delete {
    width: 44px;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: 100%;
    background: rgba(0, 0, 0, 0.25);
    bottom: 100px;
    i.h-icon-all-appstore {
      font-size: 25px;
      color: #fff;
    }
  }
}
.apps-empty {
  height: calc(100vh - 300px);
  width: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 402px;
    height: 195px;
    object-fit: contain;
  }
  p {
    margin: 8px 0 16px;
    color: rgba(0, 0, 0, 0.65);
  }
  i {
    margin-right: 9px;
  }
}
.header-recycle {
  min-width: 1024px;
  width: 100%;
  height: 64px;
  padding: 0 20px;
  background: #052535;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  .header-right {
    width: 500px;
  }
  .header-left {
    display: flex;
    align-items: center;
    font-size: 18px;
    color: #fff;
    min-width: 170px;
    .h-icon-all-exclamation-circle {
      cursor: pointer;
    }
    span {
      display: inline-block;
      margin-left: 25px;
    }
  }
}
.apps-list {
  width: 100%;
  margin: 24px auto 15px auto;
  text-align: left;
  height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  .input-search {
    width: 240px;
    float: right;
    .close-icon {
      color: rgba(0, 0, 0, 0.25);
      margin-right: 12px;
    }
  }
  .recycle-nav {
    width: 100%;
    min-height: 62px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
    margin: 24px 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .recycle-nav-li {
      cursor: pointer;
      max-width: 84px;
      height: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 20px;
      padding: 5px;
      &:hover,
      &.active {
        color: #17bc94;
      }
    }
  }
  .apps-list-content {
    margin-top: 12px;
    margin-left: -12px;
    margin-right: -12px;
    padding: 0 86px;
    .content-item {
      position: relative;
      display: inline-block;
      vertical-align: top;
      text-align: center;
      width: 172px;
      height: 122px;
      margin: 10px;
      padding-top: 28px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 1);
      // border:1px solid @primary-color;
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Chrome/Safari/Opera */
      -khtml-user-select: none; /* Konqueror */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently
  not supported by any browser */
      cursor: pointer;
      &.checked{
        box-shadow: inset 0 0 0 1px @primary-color;
      }
      .tool-menu{
        display:none;
        position:absolute;
        right:-40px;
        top:40px;
        background:#fff;
        border-radius: 4px;
        box-shadow:0 2px 8px 0 rgba(0,0,0,0.15);
        z-index:1000;
        .tool-menu-item{
          line-height: 32px;
          padding: 0px 16px;
          border-bottom:1px solid #eee;
          &:hover{
            background-color: #e8fcf4;
          }
          
          &:last-of-type{
            border: none;
          }
          
        }
      }
      &:hover {
        //box-shadow: inset 0 0 0 1px @primary-color, 0px 4px 12px 0px rgba(7, 98, 23, 0.15);
       //
        .setting {
          visibility: visible;
        }
        .tool-menu{
          display: block;
        }
      }
      &-icon {
        display: inline-block;
        width: 42px;
        height: 42px;
        margin-bottom: 16px;
        border-radius: 8px;
      }
      &-enabled {
        position: absolute;
        width: 54px;
        height: 54px;
        top: -4px;
        left: -4px;
      }
      &-name {
        width: 90%;
        margin: auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 20px;
      }
      .setting {
        position: absolute;
        z-index: 9;
        top: 8px;
        right: 8px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.45);
        visibility: hidden;
        cursor: pointer;
        &:hover {
          color: @primary-color;
        }
        /deep/ .ant-checkbox-inner {
          border-radius: 100%;
        }
      }
      .isshow {
        visibility: visible !important;
      }
    }
  }
}
.selected-count-wrap{
  padding: 0px 105px 0px 86px;
  /deep/ .ant-checkbox-inner {
    border-radius: 100%;
  }
}
.spinning {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  line-height: 100vh;
  z-index: 10001;
}
</style>
