<template>
  <div class="apps" v-show="listLoaded" @scroll="contenScroll" ref="apps">
    <div class="apps-list-opera">
      <div class="list-title">
        <a-button
          type="primary"
          @click="onAddApp"
          v-if="isAdmin"
          :disabled="!isAllowAddApp"
        >
          <a-icon type="plus" class="app-icon-plus" />
          {{ $t("languages.Apps.AddApp") }}
        </a-button>

        <a-button
          type="default"
          class="import-app"
          @click="importApp"
          :disabled="!isAllowAddApp"
        >
          <a-icon type="upload" class="app-icon-plus" />导入应用
        </a-button>
        <span
          class="search-size"
          v-if="isSearchResult && searchList.length > 0"
          >{{
            $t("languages.Apps.SearchResult", { count: searchList.length })
          }}</span
        >
        <a-input-search
          :placeholder="$t('languages.Apps.SearchAppName')"
          class="input-search"
          allow-clear
          v-model="searchKey"
          v-show="appList && appList.length > 12"
          @search="onSearch"
          @change="onhandleChange"
          @pressEnter="onSearch"
        ></a-input-search>
      </div>
      <!-- <content-menu
        ref="designers"
        :catalogues="catalogues"
        :getPopupContainer="getPopupContainer"
        :groupCode="groupCode"
        @getAppGroupList="getAppGroupList"
        @showGroup="showGroup"
        @deleteGroup="deleteGroup"
        @load="load"
        v-h3-drop
      /> -->
    </div>
    <div class="apps-list-content-all">
      <div class="apps-list-nav-wrap">
	      <div class="title sidebar__add">
	          <span>应用分组</span>
	          <a-tooltip placement="top" title="新建分组">
	          <i
	            class="icon aufontAll h-icon-all-plus-o"
	            @click="showGroup({})"
	          ></i>
	          </a-tooltip>
	      </div>
      <div class="apps-list-nav">

        <template v-for="(item, key) of groupListAll">
          <div
            :key="key"
            :class="{ title: true, active: groupKey === item.code }"
            @click="getAppGroupList(item)"
          >
            <span :title="item.name">{{ item.name }} <template v-if="item.code ==='all'">{{'('+appCount+')'}}</template></span>

            <div style="width:16px">
              <a-dropdown
                v-show="groupKey === item.code && item.code !== 'all'"
                :trigger="['hover']"
                :overlayClassName="'visibility'"
                :getPopupContainer="getPopupContainer"
              >
                <i class="icon aufontAll h-icon-all-more1"></i>
                <a-menu slot="overlay">
                  <a-menu-item key="0" v-if="item.code !== 'default'">
                    <a href="javascript:;" @click.self="deleteGroup(item)">{{
                      $t("languages.Apps.Delete")
                    }}</a>
                  </a-menu-item>
                  <a-menu-item key="1">
                    <a href="javascript:;" @click.self="showGroup(item)">{{
                      $t("languages.Apps.Rename")
                    }}</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>

          </div>
        </template>
      </div>
      </div>
      <div class="apps-list" :style="`width: ${wrapWidth}px;`">
        <div v-if="!appList || !appList.length" class="apps-empty">
          <!-- 暂无应用 -->
          <img src="~@/assets/images/nodata.png" alt="empty" />
          <p v-if="loading">加载中</p>
          <p v-else>{{ $t("languages.Apps.AddYourAppNow") }}</p>
          <a-button
            type="primary"
            class="add-app"
            @click="onAddApp"
            v-if="isAdmin"
            :disabled="!isAllowAddApp"
          >
            <a-icon type="plus" />
            {{ $t("languages.Apps.AddApp") }}
          </a-button>
        </div>
        <div class="no-data" v-show="isSearchResult && searchList.length === 0">
          <img class="user-empty" src="~@/assets/images/search.png" />
          <div>{{ $t("languages.Apps.NoSearchResult") }}</div>
        </div>
        <ul class="apps-list-content" v-if="isSearchResult">
          <li
            class="content-item"
            v-for="item in searchList"
            :key="item.code"
            @click="onClickApp(item.code)"
          > 
            <a-tooltip placement="top" v-if="item.fromAppMarket">
              <span slot="title">应用市场</span>
              <div class="market-box">
                <i class="icon aufontAll h-icon-all-ic_shopping_cart"></i>
                <img src="~@/assets/images/icon_Application market.svg" />
              </div>
            </a-tooltip>
            <a-popover
              placement="rightTop"
              trigger="click"
              overlayClassName="popover"
              :getPopupContainer="getPopupContainer"
              @visibleChange="onVisibleChange($event, item.code)"
            >
              <template slot="content">
                <p @click.stop="appSettings(item)">
                  {{ $t("languages.Apps.Setting") }}
                </p>
                <!-- <p @click.stop="editItem(item)">
                  {{ $t("languages.Apps.Setting") }}
                </p> -->
                <p @click.stop="popItem(item)">
                  {{ $t("languages.Apps.Delete") }}
                </p>
                <p @click.stop="exportApp(item)">导出</p>
              </template>
              <i
                class="icon aufontAll h-icon-all-setting-o setting"
                :class="{ isshow: showIcon && iconCode === item.code }"
                @click.stop="() => {}"
              ></i>
            </a-popover>
            <img
              v-if="!item.enabled"
              src="~@/assets/images/enabled.svg"
              class="content-item-enabled"
            />
            <!-- <template v-if="item.content">
            <img/>
          </template>-->
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
            <!-- <template v-else>
            <img :src="item.logoUrl || defaultAppIcon" class="content-item-icon"/>
          </template>-->
            <!-- <img :src="item.logoUrl || defaultAppIcon" class="content-item-icon"> -->
            <a-tooltip placement="top" v-if="showTootip(item.displayName)">
              <span slot="title">{{ item.displayName }}</span>
              <p
                class="content-item-name"
                v-hight-light="{ keyWords: searchKey, value: item.displayName }"
              ></p>
            </a-tooltip>
            <p
              class="content-item-name"
              v-else
              v-hight-light="{ keyWords: searchKey, value: item.displayName }"
            ></p>
          </li>
        </ul>
        <Draggable
          v-else
          v-model="computedAppList"
          class="apps-list-content"
          element="ul"
          :options="dragOptions"
          @end="onEnd"
        >
          <!-- 有bug提及动画效果不好，故取消transition-group -->
          <!-- <transition-group type="transition" name="flip-list"> -->
          <li
            class="content-item"
            v-for="item in computedAppList"
            :key="item.code"
            :id="item.code"
            @click="onClickApp(item.code)"
          >
            <a-tooltip placement="top" v-if="item.fromAppMarket">
              <span slot="title">应用市场</span>
              <div class="market-box">
                <img src="~@/assets/images/icon_Application market.svg" />
              </div>
            </a-tooltip>
            <a-popover
              placement="rightTop"
              trigger="click"
              overlayClassName="popover"
              :getPopupContainer="getPopupContainer"
              @visibleChange="onVisibleChange($event, item.code)"
            >
              <template slot="content">
                <p @click.stop="appSettings(item)">
                  {{ $t("languages.Apps.Setting") }}
                </p>
                <!-- <p @click.stop="editItem(item)">
                  {{ $t("languages.Apps.Setting") }}
                </p> -->
                <p @click.stop="popItem(item)">
                  {{ $t("languages.Apps.Delete") }}
                </p>
                <p @click.stop="exportApp(item)">导出</p>
              </template>
              <i
                class="icon aufontAll h-icon-all-setting-o setting"
                :class="{ isshow: showIcon && iconCode === item.code }"
                @click.stop="() => {}"
              ></i>
            </a-popover>
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
            <!-- <template v-if="item.content">
            <img :src="'data:image/png;base64,'+item.content" class="content-item-icon"/>
          </template>
          <template v-else>
            <img :src="item.logoUrl || defaultAppIcon" class="content-item-icon"/>
          </template> -->

            <a-tooltip placement="top" v-if="showTootip(item.displayName)">
              <span slot="title">{{ item.displayName }}</span>
              <p class="content-item-name">{{ item.displayName }}</p>
            </a-tooltip>
            <p class="content-item-name" v-else>{{ item.displayName }}</p>
          </li>
          <!-- </transition-group> -->
        </Draggable>
        <!-- <div v-else>
        <app-list-item
          :computedAppList="computedAppList"
          :getPopupContainer="getPopupContainer"
          :showIcon="showIcon"
          :iconCode="iconCode"
          @editItem="editItem"
          @popItem="popItem"
          @exportApp="exportApp"
          @onVisibleChange="onVisibleChange"
        />
      </div> -->
        <!-- <Draggable
        v-if="false"
        v-model="computedAppList"
        class="apps-list-content"
        element="ul"
        :options="dragOptions"
        @end="onEnd"
      >
      
      </Draggable> -->
      </div>
    </div>

    <!-- 弹窗 -->
    <AddAppModal
      v-model="showAddModal"
      :catalogues.sync="catalogues"
      :groupInfo="groupInfo"
      @updateList="updateList"
      @submitEvent="onClickApp"
    />
    <AppGroup
      v-model="showAddGroupModal"
      :groupItem="groupItem"
      @submitGroupEvent="updateList"
    />
    <a-drawer
      :title="$t('languages.Apps.AppSetting')"
      :visible="showEditDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      wrapClassName="edit-app-drawer"
      @close="closeEditDrawer"
    >
      <EditDrawer @refresh="updateList" />
    </a-drawer>
    <div id="back-delete-id" class="back-delete-id">
      <div class="back-delete" @click="goRecycle">
        <a-tooltip placement="top">
          <template slot="title">
            <span>回收站</span>
          </template>
          <img class="cycle-ico" src="~@/assets/images/circle-up.png" alt="">
        </a-tooltip>
      </div>
    </div>

    <div class="back-top" v-show="backTop" @click="goBackTop">
      <i class="icon aufontAll h-icon-all-circle-up"></i>
    </div>

    <!-- 用户指引  -->
    <div>
      <NewUserGuide v-model="isShowGuide" @close="closeGuide" />
    </div>

    <!-- 应用导入 -->
    <ImportApp
      v-model="isShowImportApp"
      :appcode="curAppCode"
      @importSucceed="loadApplist"
    />
  </div>
</template>

<script lang="ts">
// import './Sortable';
import { Component, Vue, Watch, Provide} from "vue-property-decorator";

import { State, Action, namespace } from "vuex-class";

import Draggable from "vuedraggable";

import { getRealLength } from "@/common/utils";

import { LanguageTransform, Download } from "@/utils";

import AddAppModal from "@/components/apps/modals/addApp.vue";
import AppGroup from "@/components/apps/modals/addGroup.vue";
import NewUserGuide from "@/components/apps/guide/new-user-guide.vue";

import ImportApp from "@/components/apps/modals/importApp/index.vue";
import h3Intro from "@/utils/introjs/h3-intro";

import UserGuideApi from "@/apis/system/system-manager.api";

import AppsApi from "@/apis/apps";

import * as UserGuideNS from "@/typings/user-guide";

import EditDrawer from "./edit-drawer.vue";
import DeleteGroup from "./delete-group.vue";

import AppListItem from "./app-list.vue";
import ContentMenu from "./contentMenu.vue";

const icon = require("@/assets/images/appicon.png");

const AppCenterModule = namespace("Apps/AppCenter");

const UserModule = namespace("System/User");

@Component({
  name: "AppList",
  components: {
    AddAppModal,
    AppGroup,
    DeleteGroup,
    EditDrawer,
    Draggable,
    NewUserGuide,
    ImportApp,
    AppListItem,
    ContentMenu,
  },
})
export default class AppList extends Vue {
  @UserModule.State("isAdmin") isAdmin!: boolean;

  @UserModule.State("loginedUserInfo") loginedUserInfo!: any;

  @AppCenterModule.State("showEditDrawer") showEditDrawer: any;
  
  @AppCenterModule.State("appList") appList: any;
  @AppCenterModule.State("loading") loading: any;
  
  @AppCenterModule.State("appCount") appCount: any;

  @AppCenterModule.State("appGroupList") catalogues: any;
  @AppCenterModule.State("appGroupListAll") groupListAll: any;

  @AppCenterModule.State("groupKey") groupKey: any;

  @AppCenterModule.Mutation("setAppList") setAppList: any;

  @AppCenterModule.Mutation("setAppGroupList") setAppGroupList: any;

  @AppCenterModule.Mutation("setAppDetail") setAppDetail: any;

  @AppCenterModule.Mutation("setGroupKey") setGroupKey: any;

  @AppCenterModule.Action("getAppList") getAppList: any;

  @AppCenterModule.Action("checkIfHasModel") checkIfHasModel: any;

  @AppCenterModule.Action("popAppPackage") popAppPackage: any;

  @AppCenterModule.Action("updateAppSort") updateAppSort: any;

  @AppCenterModule.Mutation("setShowEditDrawer") setShowEditDrawer: any;

  @Provide()
  getgroupInfo() {
    let code = this.groupKey === 'all' ? "default" : this.groupKey;
    let groupInfo = this.catalogues.find(item=>{return item.code===code})
    return groupInfo;
  }
  @Provide()
  switchGroup(gourpid) {
    let item = this.catalogues.find(item=>{return item.id===gourpid});

    this.getAppGroupList(item);
  }
  listLoaded: boolean = true;

  defaultAppIcon: any = icon;

  showAddModal: boolean = false;
  showAddGroupModal: boolean = false;

  fromRecycle: boolean = false;

  afterDrag: boolean = false;
  groupInfo: any = {};

  // 是否有权限添加应用
  isAllowAddApp: boolean = false;

  dragOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    forceFallback: true,
    fallbackClass: "dragClass",
    touchStartThreshold: 20,
    delay: 100,
  };

  wrapWidth: number = 0;

  searchKey: string = "";

  // 搜索关键字
  searchList: any = [];

  // 搜索应用列表数组
  isSearchResult: boolean = false;

  // 是否为搜索结果
  showIcon: boolean = false;

  iconCode: string = "";

  groupItem: object = {};

  backTop: boolean = false;

  // 是否展示回到顶部

  // 是否展示编辑应用弹出层
  isShowGuide: boolean = false; // 是否显示新手指引

  // 是否展示导入应用
  isShowImportApp: boolean = false;

  // 当前appCode
  curAppCode: string = "";

  showGuide: boolean = false;

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  /**
   * 计算值：当前应用列表，附加属性 displayName
   */
  get computedAppList() {
    const lang: string = this.$i18n.locale || "zh";
    if(!this.appList){
      return []
    }
    return this.appList.map((app: Apps.AppCenter.AppInfo) => {
      app.displayName = app.name_i18n
        ? LanguageTransform.getLang(app.name, app.name_i18n)
        : app.name;
      return app;
    });
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  }

  /**
   * 计算应用列表变化时，更新store
   */
  set computedAppList(val: Array<Apps.AppCenter.AppInfo>) {
    this.setAppList(val);
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  /**
   * 内容区域滚动事件
   */
  contenScroll() {
    const appDom = this.$refs.apps as HTMLElement;
    if (!appDom) {
      return;
    }
    if (appDom.scrollTop > 50) {
      this.backTop = true;
    } else {
      this.backTop = false;
    }
  }

  // 跳转回收站
  goRecycle() {
    // AppsApi.getAppgroupList({groupCode:this.groupCode});
    this.$router
      .push({
        name: "recycle",
      })
      .catch((err: any) => {
        err;
      });
  }

  /**
   * 回到顶部
   */
  goBackTop() {
    const appDom = this.$refs.apps as HTMLElement;
    if (!appDom) {
      return;
    }
    appDom.scrollTop = 0;
  }

  /**
   * 应用搜索
   */
  onSearch() {
    // console.log('searching...', Date.now());
    this.searchList = [];
    if (this.searchKey) {
      this.computedAppList.forEach((app: any) => {
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
    this.isSearchResult = false;
  }

  /**
   * 切换显隐
   */
  onVisibleChange(visible: boolean, code: string) {
    this.showIcon = visible;
    this.iconCode = code;
  }

  /**
   * 新建应用
   */
  onAddApp() {
    this.showAddModal = true;
  }

  /**
   * 删除应用
   */
  popItem(item: Apps.AppCenter.AppInfo) {
    const vm: any = this;
    const params: Apps.AppCenter.AppInfoParams = {
      appCode: item.code,
    };
    this.checkIfHasModel(params).then((res: Common.Data) => {
      /* TODO: 接口响应未定义具体内容，暂时判断res.data是否有值，如果有就认为应用下有模型 */
      if (res.errcode) {
        /* 删除应用 —— 应用下有模型 */
        this.$warning({
          title: (this as any).$t("languages.Apps.DeletePrompt"),
          okText: (this as any).$t("languages.Apps.Ok").toString(),
          cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
          content: (this as any).$t("languages.Apps.AppHasModelCannotBeDelete"),
        });
      } else {
        /* 删除应用 —— 应用下无模型 */
        this.$confirm({
          title: (this as any).$t("languages.Apps.ConfirmDelete", {
            name: item.displayName,
          }), // `确定要删除“${item.name}”吗？`
          content: (this as any).$t("languages.Apps.ConfirmDeleteConfirm"),
          okType: "danger",
          okText: (this as any).$t("languages.Apps.Delete").toString(),
          cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
          onOk() {
            vm.popAppPackage(params);
            vm.searchList.forEach((app: any, index: number) => {
              if (app.code === item.code) {
                vm.searchList.splice(index, 1);
              }
            });
          },
        });
      }
    });
  }

  /**
   * 编辑应用
   */
  editItem(item: Apps.AppCenter.AppInfo) {
    // this.setAppDetail(item);
    this.$nextTick(() => {
      this.setShowEditDrawer(true);
    });
  }

  appSettings(item: Apps.AppCenter.AppInfo) {
    this.setAppDetail(item);    
    this.$router
      .push({
        name: "appsettings",
        params: {
          appCode: item.code,
        },
      })
      .catch((err: any) => {
        err;
      });    
  }

  /**
   * 导出
   * */
  isExportEnd: boolean = true; // 阻止继续导出
  async exportApp(app: Apps.AppCenter.AppInfo) {
    if (!this.isExportEnd) return;
    this.isExportEnd = false;
    const loading: any = this.$message.loading("应用导出中，请稍后...", 0);
    const { code } = app;
    const params: any = { appCode: code };
    const res: any = await AppsApi.exportApp(params);
    this.isExportEnd = true;
    if (res.errcode && res.errcode !== 0) {
      this.$message.error(
        (this as any).$t("languages.Apps.ExportError") as string
      );
    } else {
      const fileStream: any = res;
      const fileType: string = "application/zip";
      const fileName: string = `${app.name}.zip`;
      Download.downloadByPost(fileStream, fileType, fileName);
    }

    loading();
  }

  /**
   * 关闭编辑应用弹出
   */
  closeEditDrawer() {
    this.setAppDetail({
      code: "",
      name: "",
    });
    this.setShowEditDrawer(false);
  }

  /**
   * 结束拖拽
   */
  onEnd(evt: any) {
    // if (evt.newIndex === evt.oldIndex) {
    //   this.afterDrag = true;
    //   return;
    // }
    const appCode = this.appList[evt.newIndex].code;
    const sortKey = parseInt(evt.newIndex, 10) + 1;
    const params = {
      appGroupCode: this.groupKey,
      appCode,
      sortKey,
    };
    this.updateAppSort(params);
  }

  /**
   * 点击应用
   */
  onClickApp(code: string) {
    this.$router
      .push({
        name: "appitem",
        params: {
          appCode: code,
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  /**
   * 重新获取分组列表
   */
  updateList() {
    // this.catalogues = [];
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
      isLoad: true
    };
    this.getAppList(params);
  }

  showGroup(item: any) {
    this.showAddGroupModal = true;
    this.groupItem = item;
  }

  deleteGroupId: any = "";
  // 删除分组
  deleteGroup(item: any) {

    console.log(this.appList,"applist")
    const vm: any = this;
    const h: any = this.$createElement;
    let content = "";
    if(this.appList && this.appList.length > 0)
    {
      content =  h(DeleteGroup, {
          props: {
            list: vm.catalogues,
            code: item.code,
          },
          on: {
            nativeClickHandler: function (v) {
              vm.deleteGroupId = v;
            },
          },
        })
    }
    else
    {
      vm.deleteGroupId = "all";
    }
    this.$confirm({
      width: "500px",
      title: `确定要删除“${item.name}”分组吗？`,
      content: content,
      okType: "primary",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        const params: any = {
          groupCode: item.code,
          newGroupCode: vm.deleteGroupId,
        };
        AppsApi.AppgroupDelete(params)
          .then((res: any) => {
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            let code: string =
              item.code === vm.groupKey ? "default" : vm.groupKey;
            const params: any = {
              groupCode: code,
              fromRecycle: vm.fromRecycle,
            };
            vm.setGroupKey(code);

            params.isLoad = true
            vm.getAppList(params);
          })
          .catch((err: any) => {});
      },
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
      n = Math.floor((winWidth - 200 + 24) / 196);
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
   * 关闭新手指引
   */
  closeGuide() {
    this.isShowGuide = false;
    this.updateUserGuide();
  }

  /**
   * 获取新用户状态
   */
  async getUserGuide() {
    const userId: string = this.loginedUserInfo.id;
    const params: BPM.System.UserGuide = {
      userId,
      pageType: UserGuideNS.PageType.AppManage,
    };
    const res: any = await UserGuideApi.getUserGuide(params);
    if (res.errcode === 0) {
      this.isShowGuide = res.data.display;
    }
  }

  /**
   * 更新新用户状态
   */
  async updateUserGuide() {
    const userId: string = this.loginedUserInfo.id;
    const params: BPM.System.UserGuide = {
      userId,
      pageType: UserGuideNS.PageType.AppManage,
    };
    const res: any = await UserGuideApi.updateUserGuide(params);
  }

  /**
   * 切换语种时更新搜索列表
   */
  @Watch("$i18n.locale")
  onLangChange() {
    if (this.searchKey) {
      this.onSearch();
    }
  }

  async mounted() {
    this.getStart();
  }

  async created() {
    this.load();
  }
  getStart() {
    const stepData = [
      {
        element: "#back-delete-id",
        title: "回收站",
        content: "删除的应用、模型放进回收站啦",
        position: "left",
        tooltipClass: "h3-intro-bubble h3-intro-bubble-new",
      },
    ];
    (window as any).h3Intro = h3Intro({
      stepData,
    });
    this.showGuide = true;
    const isShowGuide = localStorage.getItem("isNewUserApp");
    if (!isShowGuide) {
      this.$nextTick(() => {
        (window as any).h3Intro.start();
      });
      this.showGuide = true;
      localStorage.setItem("isNewUserApp", "toDoGuide");
    } else {
      this.showGuide = false;
    }
  }

  async load() {
    // 获取用户新建应用的权限
    const res: any = await UserGuideApi.getSystemManagerAppInfo();
    if (res.errcode === 0) {
      this.isAllowAddApp = res.data;
    }
    // 获取应用列表
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
      isLoad: true
    };
    this.getAppList(params).then(() => {
      this.listLoaded = true;
    });

    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    this.calcWidth();

    window.onresize = () => {
      this.calcWidth();
    };

    this.getUserGuide();
  }

  importApp() {
    this.isShowImportApp = true;
  }

  loadApplist() {
    // 获取应用列表
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
    };
    this.getAppList(params).then(() => {
      this.listLoaded = true;
    });
  }

  getAppGroupList(item: any) {
    this.setGroupKey(item.code);
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
    };
    if(item.code !== 'all'){
      this.groupInfo = item;
    }else{
      this.groupInfo = {};
    }
    this.searchKey = "";
    this.isSearchResult = false;
    this.searchList = [];
    this.getAppList(params);
  }
}
</script>

<style lang="less">
@import "~@/utils/introjs/h3-intro.less";
@import "~@/styles/app.less";
</style>
<style lang="less" scoped>
  /deep/ .popover{
    width: 70px;
  }
  .market-box{
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
