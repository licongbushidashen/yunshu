<template>
  <div class="app-item">
    <div class="header-recycle">
      <div class="header-left">
        <div class="header-tips-content"></div>
        <i class="icon aufontAll h-icon-all-arrow-left-o" @click="toBack"></i>
        <span>回收站</span>
      </div>
      <div class="header-right flex-justify-between">
        <a-button type="primary" @click="delectAll">
          <a-icon type="delete" />清空回收站
        </a-button>
        <a-button type="default" @click="restoreAll">
          <a-icon type="sync" />全部还原
        </a-button>
        <a-button type="default" @click.stop="recycleReductionC(ids)" :disabled="!isChecked">
          <a-icon type="reload" />还原
        </a-button>
        <a-button type="default" @click.stop="recycleDeleteC(deleteParams)" :disabled="!isChecked">
          <a-icon type="delete" />彻底删除
        </a-button>
      </div>
    </div>
    <a-spin class="spinning" :spinning="spinning" />
    <template v-if="appMenu.length || appList.length || bizModel.length "  >
      <div class="app-menu" v-resize.east>
        <div class="menu-tree">
          <ul class="menu ant-menu ant-menu-inline ant-menu-root ant-menu-light">
            <li
              class="sub-menu ant-menu-submenu ant-menu-submenu-inline"
              :class="{'ant-menu-submenu-selected': all}"
              @click="onClickFolder('all')"
            >
              <div class="ant-menu-submenu-title all">
                <div class="menu-title" :title="$route.query.name">
                  <i class="icon aufontAll h-icon-all-same-size"></i>
                  <span>{{$route.query.name}}</span>
                </div>
              </div>
            </li>
            <template v-for="item in appMenu">
              <li
                v-if="item.type === 'Folder'"
                :key="item.code"
                :id="item.code"
                :data-type="item.type"
                class="sub-menu ant-menu-submenu ant-menu-submenu-inline"
                :class="{'ant-menu-submenu-selected':currentItemID === item.id}"
                @click="onClickFolder(item)"
              >
                <div :id="item.id" class="ant-menu-submenu-title">
                  <div class="menu-title" :title="item.displayName">
                    <i class="icon aufontAll h-icon-all-folder-o"></i>
                    {{ item.displayName }}
                  </div>
                </div>
              </li>
            </template>
          </ul>
        </div>
      </div>
      <!-- 右侧 -->
      <div class="app-router-wrap">
        <div class="item-content">
          <div class="router-link">
            <router-link tag="a" :to="{ name: 'recycle'}">应用列表</router-link>
            / {{$route.query.name}}
          </div>
          <div class="checkAll">
            <a-checkbox v-model="checkedAll" @click.stop="CheckAll" style="margin-left:24px;">全选</a-checkbox>
          </div>
          <div class="item-content-list" @scroll="contenScroll" id="item-content" ref="itemContent">
            <div
              class="biz-model-wrap"
              :class="{'biz-model-group': res.id !== '0'}"
              :id="`anchor${res.id}`"
              v-for="(res, i) of bizModel"
              :key="i"
            >
              <div class="biz-model-group-head-title">
                <a-checkbox
                  v-model="res.checked"
                  style="margin: 10px 12px;font-size: 18px;"
                  :title="res.displayName"
                  @change="checkApp($event, res.id)"
                >{{res.displayName}}</a-checkbox>
              </div>
              <template v-for="(item,s) in res.children">
                <a-dropdown :trigger="['contextmenu']" :key="s">
                  <div class="content-item">
                    <div class="setting" :class="{'isshow': item.checked}">
                      <a-checkbox v-model="item.checked"></a-checkbox>
                    </div>
                    <i class="biz-model-icon icon aufontAll" :class="item.icon"></i>
                    <a-tooltip placement="top" v-if="showTootip(item.displayName)">
                      <span slot="title">{{ item.displayName }}</span>
                      <p class="content-item-name">{{ item.displayName }}</p>
                    </a-tooltip>
                    <p class="content-item-name" v-else>{{ item.displayName }}</p>
                    <template v-if="item.type === 'BizModel'">
                      <img
                        v-if="!item.published"
                        src="~@/assets/images/unpublished.svg"
                        class="content-item-enabled"
                      />
                    </template>
                  </div>
                  <a-menu slot="overlay">
                    <a-menu-item key="1" @click="recycleReductionC([item.id])">还原</a-menu-item>
                    <a-menu-item
                      key="2"
                      @click="recycleDeleteC([{id: item.id, code: item.code, type: item.type}])"
                    >彻底删除</a-menu-item>
                  </a-menu>
                </a-dropdown>
              </template>
            </div>
          </div>
          <div class="back-top" v-show="backTop" @click="goBackTop">
            <i class="icon aufontAll h-icon-all-circle-up"></i>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="apps-empty">
      <!-- 暂无应用 -->
      <img src="~@/assets/images/userEmpty.png" alt="empty" />
      <p>{{isLoading ? '加载中...' : '回收站空空如也'}}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { State, Action, Mutation, namespace } from "vuex-class";

import { getRealLength } from "@/common/utils";

import { LanguageTransform } from "@/utils";
import AppsApi from "@/apis/apps";
import Draggable from "vuedraggable";

@Component({
  name: "RecycleItem",
  components: {
    Draggable,
  },
})
export default class RecycleItem extends Vue {
  [x: string]: any;
  isChecked: boolean = false;
  spinning: boolean = false;
  appList: any = [];
  appMenu: any = [];
  bizModel: any = [];
  @Prop({ type: String }) appCode: any;

  toBack() {
    this.$router
      .push({
        name: "recycle",
      })
      .catch((err: any) => {
        err;
      });
  }

  checkedAll: boolean = false;
  isLoading: boolean = false

  // 是否展示回到顶部
  backTop: boolean = false;
  // 内容区域滚动事件
  contenScroll() {
    const itemDom = this.$refs.itemContent as HTMLElement;
    if (!itemDom) {
      return;
    }
    if (itemDom.scrollTop > 50) {
      this.backTop = true;
    } else {
      this.backTop = false;
    }
  }

  // 请求流程数据参数
  dragMenuOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    group: {
      name: "menu",
      put: ["menu", "item"],
    },
  };

  currentItemID: string = "";

  all: boolean = true;

  curFolderId: string = "";

  onClickFolder(item: any) {
    if (item === "all") {
      this.currentItemID = "";
      this.all = true;
      this.curFolderId = "";
      const scrollDom = document.getElementById("item-content");
      if (!scrollDom) return;
      scrollDom.scrollTop = 0;
    } else {
      this.all = false;
      this.currentItemID = item.id;
      this.curFolderId = `anchor${item.id}`;
      const dom = this.$el.querySelector(`#anchor${item.id}`);
      if (!dom) return;
      dom.scrollIntoView();
      this.$forceUpdate();
    }
  }

  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  /**
   * 应用名称超过20个字节时显示tooltip
   */
  showTootip(name: string) {
    return getRealLength(name) > 20;
  }

  // 回到顶部
  goBackTop() {
    const itemDom = this.$refs.itemContent as HTMLElement;
    if (!itemDom) {
      return;
    }
    itemDom.scrollTop = 0;
  }

  created() {
    this.getFolders();
  }

  // 获取模型列表
  getFolders() {
    this.spinning = true;
    this.checkedAll = false;
    this.isLoading = true
    const params: any = { appCode: this.appCode };
    AppsApi.getRecycleList(params)
      .then((res: any) => {
        this.spinning = false;
        if (res.errcode !== 0) {
          return this.$message.error(res.errmsg);
        }
        this.mapAppList(res.data);
        this.isLoading = false
      })
      .catch((e: any) => {
        this.spinning = false;
        this.isLoading = false
      });
  }

  // 处理模型列表数据
  mapAppList(obj: any) {
    if (obj && Array.isArray(obj) && obj.length === 0) {
      this.appMenu = [];
      this.bizModel = [];
      return false;
    }

    let bizModels: any = obj.filter((c: any) => {
      if (c.type === "BizModel" || c.type === "Page" || c.type === "Report") {
        c.checked = false;
        c.displayName = c.name_i18n
          ? LanguageTransform.getLang(c.name, c.name_i18n)
          : c.name;
        return c;
      }
    });

    let Folder: any = obj.filter((c: any) => c.type === "Folder");
    let allGroup: any = this.allGroup(Folder);
    this.appMenu = allGroup;
    this.bizModel = [
      ...[
        {
          id: "0",
          code: this.appCode,
          displayName: this.$route.query.name,
          checked: false,
          children: bizModels,
        },
      ],
      ...allGroup.filter((c: any) => {
        if (Array.isArray(c.children)) {
          c.children = c.children.filter((s: any) => {
            return s.type !== "Folder";
          });
        }
        return c;
      }),
    ];
    console.log(this.bizModel);
  }

  //所有分组,把树状结构拉成一维数组
  allGroup(res: any) {
    let retData = [] as any;
    let _helper = (data: any) => {
      if (!data) return;
      data.forEach((item: any) => {
        item.checked = false;
        item.displayName = item.name_i18n
          ? LanguageTransform.getLang(item.name, item.name_i18n)
          : item.name;
        if (item.type === "Folder") {
          retData.push(item);
        }
        if (Array.isArray(item.children)) {
          _helper(item.children);
        }
      });
    };
    _helper(res);
    return retData;
  }

  // 全选
  CheckAll() {
    const vm = this;
    let flag: boolean = false;
    flag = vm.bizModel.every((res: any) => {
      let checked1: boolean = res.checked;
      let checked2: boolean = true;
      if (Array.isArray(res.children) && res.children.length) {
        checked2 = res.children.every((e: any) => {
          return e.checked;
        });
      }
      return checked1 && checked2;
    });

    this.checkAll = !flag;

    this.$nextTick(() => {
      vm.bizModel.forEach((res: any) => {
        res.checked = vm.checkAll;
        if (Array.isArray(res.children) && res.children.length) {
          res.children.forEach((e: any) => {
            e.checked = vm.checkAll;
          });
        }
      });
    });
  }

  /**
   * 清空回收站
   */
  delectAll() {
    const vm: any = this;
    this.$confirm({
      title: "清空回收站",
      content: "是否确定彻底删除所有模型、模型分组？删除后不可找回",
      okType: "danger",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        let { deleteParams } = vm.allId();
        vm.recycleDeleteC(deleteParams);
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
      content: "是否确定要还原所有数据吗？",
      okType: "primary",
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        let { ids } = vm.allId();
        vm.recycleReductionC(ids);
      },
    });
  }

  /**
   * 还原
   */
  recycleReductionC(params: any) {
    const vm: any = this;
    // 未勾选模型会禁用还原，所有无需检查是否勾选
    // if (!this.isChecked) {
    //   return vm.$message.error("请勾选模型！");
    // }

    this.$confirm({
      title: (this as any).$t("languages.Apps.Reduction"),
      content: "是否确定要还原已勾选的模型？",
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
            vm.getFolders();
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
    // 未勾选模型会禁用彻底删除按钮，所有无需检查是否勾选
    // if (!this.isChecked) {
    //   return vm.$message.error("请勾选模型！");
    // }

    this.$confirm({
      title: (this as any).$t("languages.Apps.recycleDelete"),
      content: "是否确定彻底删除已勾选的模型？删除后不可找回",
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
            vm.getFolders();
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
  @Watch("bizModel", {
    deep: true,
  })
  valueChange(v: any) {
    if (v && v.length) {
      this.isChecked = v.some((e: any) => {
        let f: boolean = false;
        if (Array.isArray(e.children) && e.children.length) {
          f = e.children.some((s: any) => {
            return s.checked === true;
          });
        }
        return e.checked === true || f === true;
      });

      // 获取选中的模型数据
      let pushArray: any = [];
      v.forEach((c: any) => {
        // 当前分组是否全选
        if (Array.isArray(c.children) && c.children.length) {
          c.checked = c.children.every((e: any) => {
            return e.checked === true;
          });
          c.children.forEach((d: any) => {
            if (d.checked) {
              pushArray.push(d);
            }
          });
        }
      });

      this.ids = pushArray.map((e: any) => e.id);
      this.deleteParams = pushArray.map((e: any) => {
        let { id, code, type } = e;
        return {
          id,
          code,
          type,
        };
      });
      // 全选按钮
      this.checkedAll = v.every((e: any) => {
        return e.checked === true;
      });
    } else {
      this.ids = [];
      this.deleteParams = [];
      this.checkedAll = false;
      this.isChecked = false;
    }
    console.log(this.ids, this.deleteParams, this.isChecked);
  }

  allId(): any {
    // 获取选中的模型数据
    let pushArray: any = [];
    this.bizModel.forEach((c: any) => {
      if (Array.isArray(c.children) && c.children.length) {
        c.children.forEach((d: any) => {
          pushArray.push(d);
        });
      }
    });
    return {
      ids: pushArray.map((e: any) => e.id),
      deleteParams: pushArray.map((e: any) => {
        let { id, code, type } = e;
        return {
          id,
          code,
          type,
        };
      }),
    };
  }

  // 应用全选
  checkApp(e: any, id: any) {
    // console.log(e, id)
    const checked: boolean = e.target.checked;
    this.bizModel.forEach((res: any) => {
      if (res.id === id) {
        if (Array.isArray(res.children) && res.children.length) {
          res.children.forEach((e: any) => {
            e.checked = checked;
          });
        }
      }
    });
  }
}
</script>
<style lang="less" scoped>
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
.content-item {
  position: relative;
  display: inline-block;
  vertical-align: top;
  text-align: center;
  width: 172px;
  height: 122px;
  margin: 12px;
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
  &:hover {
    //box-shadow: inset 0 0 0 1px @primary-color, 0px 4px 12px 0px rgba(7, 98, 23, 0.15);
    box-shadow: inset 0 0 0 1px @primary-color;
    .setting {
      visibility: visible;
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
</style>
<style lang="less">
.ghostClass {
  opacity: 0;
}
.icon-open {
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}
.app-menu {
  width: 224px;
  padding-right: 1px;
  height: calc(100vh - 64px);
  float: left;
  box-shadow: 1px 0px 0px 0px #e8e8e8;
  position: relative;
  z-index: 2;
  .new-menu {
    height: 40px;
    background: #f2f2f2;
    font-size: 14px;
    line-height: 40px;
    width: calc(~"100% + 1px");
    cursor: pointer;
    & > span {
      color: rgba(0, 0, 0, 0.65);
    }
    & > i {
      font-size: 12px;
      margin-right: 7px;
    }
  }
  .menu-tree {
    overflow: auto;
    height: calc(100vh - 64px - 24px);
    .menu {
      border: none;
      i.setting {
        position: absolute;
        z-index: 9;
        top: 0px;
        right: 29px;
        width: 14px;
        height: 14px;
        margin: 0;
        font-size: 14px !important;
        visibility: hidden;
        &:hover {
          color: @primary-color;
        }
      }
      .sub-menu.ant-menu-submenu-selected {
        .ant-menu-submenu-title {
          background: #e8fcf4;
          color: @primary-color;
          .menu-title {
            padding-right: 38px !important;
          }
          .setting {
            visibility: visible;
            color: rgba(0, 0, 0, 0.65);
            &:hover {
              color: @primary-color;
            }
          }
          &:hover {
            color: @primary-color !important;
          }
          &:after {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            border-left: 4px solid @primary-color;
          }
        }
      }
      .sub-menu {
        cursor: pointer;
        position: relative;
        .ant-menu-submenu-title {
          padding: 0px !important;
          width: 100%;
          margin-top: 8px;
          .menu-title {
            padding: 0px 16px !important;
            margin-right: 25px;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            i {
              font-size: 14px;
              margin-right: 8px;
            }
          }
          &:hover {
            color: rgba(0, 0, 0, 0.65);
            background: #e8fcf4;
            .menu-title {
              padding-right: 38px !important;
            }
            .setting {
              visibility: visible;
            }
          }
          & > .ant-menu-submenu-arrow {
            margin-top: 2px;
            &:before {
              background: linear-gradient(to right, #000, #000);
            }
            &:after {
              background: linear-gradient(to right, #000, #000);
            }
          }
        }
        .ant-menu-submenu-title.all {
          margin-bottom: 0;
        }
      }
      li.ant-menu-item-selected {
        background: #e8fcf4;
        color: @primary-color;
        padding-right: 46px;
        &:hover {
          color: @primary-color;
        }
        &:after {
          border-left: 4px solid @primary-color;
        }
        .setting {
          visibility: visible;
          color: rgba(0, 0, 0, 0.65);
          &:hover {
            color: @primary-color;
          }
        }
      }
      .ant-menu-item {
        width: 100%;
        padding-left: 38px !important;
        text-align: left;
        overflow: hidden;
        margin-top: 8px;
        text-overflow: ellipsis;
        padding-right: 16px;
        .setting {
          right: 6px;
        }
        i {
          font-size: 14px;
          margin-right: 10px;
        }
        &:hover {
          color: rgba(0, 0, 0, 0.65);
          background: #e8fcf4;
          padding-right: 46px;
          .setting {
            visibility: visible;
          }
        }
        &:after {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          border-right: none;
        }
      }
      .show.ant-menu-item {
        padding-right: 46px;
      }
      li.root-item {
        padding-left: 16px !important;
      }
    }
  }
}
.popover {
  cursor: pointer;
}
.popover p:first-child {
  border-top: none;
  border-radius: 4px 4px 0 0;
  &:hover {
    &:before {
      content: "";
      display: block;
      width: 8.5px;
      height: 8.5px;
      transform: rotate(45deg);
      background-color: #e8fcf4;
      position: absolute;
      left: 6px;
      top: 12px;
    }
  }
}
.popover p:last-child {
  border-radius: 0 0 4px 4px;
}
.popover .ant-popover-inner-content {
  padding: 0px;
}
.popover p {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  padding: 5px 16px;
}
.popover p:hover {
  background-color: #e8fcf4;
}
.app-router-wrap {
  height: calc(100vh - 64px);
  overflow: hidden;
}
.red {
  color: #f5222d;
}
.show {
  color: #000;
  background: #e8fcf4;
}
.isshow .menu-title .setting,
.show .setting {
  visibility: visible !important;
}
.menu-tree::-webkit-scrollbar {
  width: 0;
  height: 7px;
  background: #fff;
}
.menu-tree::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.45);
  border-radius: 4px;
}
</style>
<style lang="less">
.item-content {
  height: 100%;
  background: #f6f7f9;
  padding: 24px;
  padding-right: 0;
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
  .checkAll {
    width: calc(100% - 48px);
    height: 62px;
    line-height: 62px;
    margin-bottom: 12px;
    margin-top: 24px;
    background: #ffffff;
    border-radius: 4px;
  }
  .item-content-list {
    text-align: left;
    overflow-y: scroll;
    height: calc(100% - 120px);
    margin-left: -14px;
    margin-right: -14px;
    .cur-folder {
      .biz-model-group-head-title {
        color: @primary-color;
      }
    }
    .biz-model-group-head,
    .biz-model-group-content {
      margin-left: 4px !important;
    }
  }
}
.item-content .item-content-list > .biz-model-wrap {
  margin-left: 4px !important;
}

.item-content .item-content-list > .biz-model-wrap .biz-model-icon {
  color: #f5222d;
}

.item-content
  .item-content-list
  > .biz-model-group:nth-child(4n + 1)
  .biz-model-icon {
  color: #fa8c16;
}

.item-content
  .item-content-list
  > .biz-model-group:nth-child(4n + 2)
  .biz-model-icon {
  color: #1890ff;
}

.item-content
  .item-content-list
  > .biz-model-group:nth-child(4n + 3)
  .biz-model-icon {
  color: #13c2c2;
}

.item-content
  .item-content-list
  > .biz-model-group:nth-child(4n)
  .biz-model-icon {
  color: #f5222d;
}

.item-content .item-content-list .biz-model-group-content,
.item-content .item-content-list .biz-model-group-head {
  margin-left: 4px !important;
}
.biz-model-icon {
  display: inline-block;
  font-size: 28px;
  margin-bottom: 16px;
  border-radius: 8px;
}

.spinning {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  line-height: 100vh;
  z-index: 10001;
}
.apps-empty {
  height: calc(100vh - 300px);
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
</style>