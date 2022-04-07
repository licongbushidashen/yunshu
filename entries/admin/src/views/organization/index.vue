<template>
  <div class="organization">
    <a-layout-sider
      :trigger="null"
      theme="light"
      collapsible
      collapsedWidth="46"
      v-model="isShow"
      class="org-menu"
      width="224"
    >
      <div v-show="!isShow">
        <div
          class="org"
          v-for="item in menus"
          :key="item.code"
          @click="onMouseDown(item)"
          :class="{ selected: item.isSelected }"
        >
          <i class="icon aufontAll" :class="item.icon" />
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
      <div v-show="isShow">
        <a-tooltip placement="right" v-for="item in menus" :key="item.code">
          <template slot="title">{{ $t(item.name) }}</template>
          <div
            class="org"
            @mousedown="onMouseDown(item)"
            :class="{ selected: item.isSelected }"
          >
            <i class="icon aufontAll" :class="item.icon" />
          </div>
        </a-tooltip>
      </div>
      <div id="hide-menu" @click="() => (isShow = !isShow)">
        <div v-show="!isShow" class="to-left"></div>
        <div v-show="isShow" class="to-right"></div>
      </div>
    </a-layout-sider>
    <div class="router-wrap">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { State, namespace, Action, Mutation } from "vuex-class";

import OrgApi from "@/apis/organization";

const UserModule = namespace("System/User");
const OrgUserModule = namespace("Organization/User");

interface MenuItem {
  name: string;
  icon: string;
  code: string;
  isSelected: boolean;
}

@Component({
  name: "organization",
  beforeRouteUpdate(to, from, next) {
    if (to.params && to.params.userLink) {
      const vm = this as organization;
      vm.menus.forEach((m) => {
        m.isSelected = false;
        if (to.name === m.code) {
          m.isSelected = true;
        }
      });
    }
    next();
  },
})
export default class organization extends Vue {
  @UserModule.State("isOnlyAppAdmin") isOnlyAppAdmin!: boolean;

  @OrgUserModule.Mutation("setCloudPivotPerm") setCloudPivotPerm!: any;

  isCloudPivot: any = false;
  hasCloudPivotPerm: boolean = false;

  isShow: boolean = false;

  async created() {
    this.menus.forEach((m) => {
      m.isSelected = false;
      if (this.$route.name === m.code) {
        m.isSelected = true;
      }
    });

    const user: any = JSON.parse(window.sessionStorage.getItem("user") || "{}");

    // @ts-ignore
    const res: any = await OrgApi.needSync(); // 是否展示组织同步，
    const errcode: number = res.errcode;
    const data: any = res.data;
    // this.hasCloudPivotPerm = data.hasCloudPivotPerm;

    this.setCloudPivotPerm(data.hasCloudPivotPerm);

    if (errcode === 0 && data.needSync) {
      this.menus.push({
        name: "languages.OrganizationSync",
        code: "orgsync",
        icon: "h-icon-all-sync-o",
        isSelected: false,
      });
    }
    this.menus.push({
      name: "languages.UserInfoExt",
      code: "userInfoExt",
      icon: "h-icon-all-user-list-o",
      isSelected: false,
    });
  }
  menus: Array<MenuItem> = [
    {
      name: "languages.Organization",
      code: "orguser",
      icon: "h-icon-all-department-o",
      isSelected: true,
    },
    {
      name: "languages.OrganizationRole",
      code: "orgrole",
      icon: "h-icon-all-team-singlechoice-o",
      isSelected: false,
    },
  ];
  onMouseDown(item: MenuItem) {
    this.menus.forEach((m) => {
      m.isSelected = false;
    });

    item.isSelected = true;

    this.$router.push(item.code).catch((err: any) => {
      err;
    });
  }
}
</script>

<style lang="less" scoped>
.organization {
  background: #fff;
  margin-top: 0px;
  min-width: 1024px;
  position: relative;
  .org-menu {
    width: 224px;
    height: calc(100vh - 64px);
    float: left;
    box-shadow: 1px 0px 0px 0px #e8e8e8;
    position: relative;
    padding-top: 8px;
    z-index: 2;
    #hide-menu {
      position: absolute;
      top: 0px;
      right: -14px;
      width: 14px;
      height: 30px;
      z-index: 9;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      .to-left {
        width: 14px;
        height: 30px;
        background-image: url("../../assets/images/toleft.svg");
        &:after {
          content: "";
          display: block;
          background-image: url("../../assets/images/tolefthover.svg");
        }
        &:hover:after {
          width: 14px;
          height: 30px;
        }
      }
      .to-right {
        width: 14px;
        height: 30px;
        background-image: url("../../assets/images/toright.svg");
        &:after {
          content: "";
          display: block;
          background-image: url("../../assets/images/torighthover.svg");
        }
        &:hover:after {
          width: 14px;
          height: 30px;
        }
      }
      &:hover {
        border-left-color: #c6c6c6;
      }
    }
    .org {
      position: relative;
      height: 40px;
      width: 224px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-left: 16px;
      margin-bottom: 8px;
      cursor: pointer;
      &.selected {
        background: #e8fcf4;
        color: @primary-color;
        transition: none;
        transform: none;
        &::before {
          content: "";
          position: absolute;
          height: 100%;
          width: 0;
          top: 0;
          left: 0;
          border-left: 4px solid @primary-color;
        }
      }
      i {
        margin-right: 9px;
        font-size: 14px;
        height: 14px;
        line-height: 14px;
      }
      &:hover {
        background: #e8fcf4;
      }
    }
  }
  .ant-layout-sider-collapsed {
    .org {
      width: 46px;
    }
  }
  .router-wrap {
    overflow: hidden;
    height: calc(100vh - 64px);
  }
}
</style>
