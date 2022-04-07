<template>
  <div class="app-item">
    <!-- 页面菜单 -->
    <div class="app-menu" v-resize.east>
      <div class="menu-tree">
        <ul class="menu ant-menu ant-menu-inline ant-menu-root ant-menu-light">
          <li
            v-for="menu in menus"
            :key="menu.code"
            @click="clickMenu(menu)"
            class="sub-menu ant-menu-submenu ant-menu-submenu-inline"
            :class="{'ant-menu-submenu-selected': menu.isSelected}"
          >
            <div class="ant-menu-submenu-title all">
              <div class="menu-title">
                <i class="icon aufontAll" :class="menu.icon"></i>
                <span>{{ menu.name }}</span>
              </div>
            </div>
          </li>
        </ul>

      </div>
    </div>
    <!-- 内容面板 -->
    <div class="app-router-wrap">
      <div v-if="selectedMenu === 'base'">
        <basic @refresh="refresh"></basic>
      </div>
      <div v-if="selectedMenu === 'permisson'" class="model-wrap">
        <!-- 模型及详细权限列表 -->
        <permission-group-settings :groupName="groupName" :groupId="curGroupId" @viewModelSettings="handleModelSettings" v-if="showModel" ></permission-group-settings>
        <!-- 权限组列表 -->
        <permission-setting @clearHistoryName="handleClearName" :historyData="historyData"  @viewModelSettings="handleModelSettings" v-else @refresh="refresh"></permission-setting>
      </div>
      <div v-if="selectedMenu === 'application'"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { State, Action, namespace } from "vuex-class";


import Basic from '../settings/base-setting.vue';
import PermissionSetting from '../settings/permission-setting.vue';

import PermissionGroupSettings from '../settings/components/permission-group-settings.vue'

const AppCenterModule = namespace("Apps/AppCenter");


interface MenuItem {
  name: string;
  icon: string;
  code: string;
  isSelected: boolean;
}

@Component({
  name: 'AppItem',
  components: {
    Basic,
    PermissionSetting,
    PermissionGroupSettings
  },
})


export default class AppItem extends Vue {
  @AppCenterModule.Action('getAppDetail') getAppDetail: any;
  @AppCenterModule.Mutation("setAppDetail") setAppDetail: any;
  @AppCenterModule.Action("getAppList") getAppList: any;

  menus: Array<MenuItem> = [
    {
      name: "基础设置",
      code: "base",
      icon: "h-icon-all-setting-o",
      isSelected: true,
    },
    {
      name: "权限设置",
      code: "permisson",
      icon: "h-icon-all-department-single-se",
      isSelected: false,
    }
    // {
    //   name: "应用部署",
    //   code: "application",
    //   icon: "h-icon-all-appstore-o",
    //   isSelected: false,
    // }
  ]

  showModel: boolean = false

  selectedMenu: string = "base"

  curGroupId: string = ""

  historyData: any = {
    name: '',
    id: ''
  }

  groupName: string = ''

  handleModelSettings(view, gid, data: any) {
    debugger  
    console.log(view, gid)
    this.showModel = view
    this.curGroupId = gid ? gid : ""

    this.historyData.name = data.name
    this.historyData.id = data.id
    this.groupName = data
  }

  handleClearName() {
    this.historyData.name = ''
    this.historyData.id = ''
  }

  clickMenu(item: MenuItem) {
    this.menus.forEach((m) => {
      m.isSelected = false;
    });
    item.isSelected = true;
    this.selectedMenu = item.code
  }

  refresh(){
    // const params: any = {
    //   groupCode: this.groupKey,
    //   fromRecycle: this.fromRecycle,
    // }
    // this.getAppList(params)
  }

  mounted() {
  }

  beforeMount() {
    // 刷新页面时回填数据
    const params: Apps.AppCenter.AppInfoParams = {
      appCode: this.$route.params.appCode
    };
    if (params.appCode) {
      const res = this.getAppDetail(params);
      if (res.data) {
        this.$store.commit('setAppDetail', res.data)
      }
    }
  }
}
</script>

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
  height: auto;
  float: left;
  box-shadow: 1px 0px 0px 0px #e8e8e8;
  position: relative;
  z-index: 2;
  height: calc(100vh - 64px);
  .new-menu {
    height: 40px;
    background: #f2f2f2;
    font-size: 14px;
    line-height: 40px;
    width: calc(~'100% + 1px');
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
    height: calc(100vh - 64px);
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
            content: '';
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
          content: '';
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
      content: '';
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
  .model-wrap {
    height: calc(100vh - 64px);
  }
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
