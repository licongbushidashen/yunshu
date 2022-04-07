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
        <template v-for="item in menus">
          <div
            class="org"
            v-if="isCanShow(item.code)"
            :key="item.code"
            @click="onMouseDown(item)"
            :class="{selected: item.isSelected}"
          >
            <i class="icon aufontAll " :class="item.icon"/>
            <span :class="{ 'active' :(systemUnsetCount > 0 && item.code === 'commonSetting')}">{{ $t(item.name) }}</span>

          </div>
        </template>
      </div>
      <div v-show="isShow">
        <a-tooltip
          placement="right"
          v-for="item in menus"
          :key="item.code"
        >
          <template slot="title">
            {{ $t(item.name) }}
          </template>
          <div
            class="org"
            @mousedown="onMouseDown(item)"
            :class="{selected: item.isSelected}"
          >
            <i class="icon aufontAll " :class="item.icon"/>
          </div>
        </a-tooltip>
      </div>
      <div id="hide-menu" @click="menuShow">
        <div v-show="!isShow" class="to-left"></div>
        <div v-show="isShow" class="to-right"></div>
      </div>
    </a-layout-sider>
    <div class="router-wrap">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import {
 State, namespace, Mutation, Action 
} from 'vuex-class';

const UserModule = namespace('System/User');

interface MenuItem {
  name: string,
  icon: string,
  code: string,
  isSelected: boolean
}

@Component({
  name: 'system'
})
export default class System extends Vue {
  @UserModule.State('menuShowStatus') menuShowStatus!:boolean;

  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;
  @UserModule.State('isAdmin') isAdmin!: boolean;

  @UserModule.Mutation('setMenuStatus') mutationSetMenuStatus!:any;


  @State('systemUnsetCount') systemUnsetCount!: number;

  isShow: boolean = false;

  @Watch('$route')
  onRouteChange(v) {
    this.selectMenu();
  }

  isCanShow(code){
    if(code === 'dataDictionary'){
      let user:any = {}
      try {
        // @ts-ignore
        user = JSON.parse(sessionStorage.getItem('user'))
      } catch (error) {
        console.log(error)
      }
      if(user.dataDictionaryManage){
        return true
      }
      return false
    }
    return true
  }

  created() {
    const _this = this;

    // 如果当前登录用户仅拥有子管理员权限，只显示管理员设置菜单
    if (this.isAdmin && this.isOnlyAppAdmin) {
      this.menus = this.menus.filter(item => item.code === 'managerSetting' || item.code === 'dataDictionary');

      this.$router.push('manager-setting').catch((err: any) => {err});
    }

    this.selectMenu();
    
  }

  menus: Array<MenuItem> = [
    {
      name: 'languages.system.commonSetting',
      code: 'commonSetting',
      icon: 'h-icon-all-setting-o',
      isSelected: true
    },
    {
      name: 'languages.system.adminSetting',
      code: 'managerSetting',
      icon: 'h-icon-all-user-o',
      isSelected: false
    },
    {
      name: 'languages.system.integrationSetting',
      code: 'integrationSetting',
      icon: 'h-icon-all-chakan-zj',
      isSelected: false
    },
    {
      name: 'languages.system.dataDictionary',
      code: 'dataDictionary',
      icon: 'h-icon-all-recruitment-demand-o',
      isSelected: false
    },
      {
      name: 'languages.system.apiConfiguration',
      code: 'apiConfiguration',
      icon: 'h-icon-all-disassembly-o',
      isSelected: false
    },
    {
      name: 'languages.system.logInfo',
      code: 'log',
      icon: 'h-icon-all-text-file-o',
      isSelected: false
    },
    {
      name: 'languages.system.licenseInfo',
      code: 'license',
      icon: 'h-icon-all-recruitment-demand-o',
      isSelected: false
    }
  ];

  selectMenu() {
    this.menus.forEach((m) => {
      m.isSelected = false;
      if (this.$route.name === m.code) {
        m.isSelected = true;
      }
    });
  }

  onMouseDown(item: MenuItem) {
    this.menus.forEach((m) => {
      m.isSelected = false;
    });
    item.isSelected = true;
    this.goRouter(item);
  }

  goRouter(item: MenuItem) {
    if (item.code === 'commonSetting') {
      this.$router.push('common-setting').catch((err: any) => {err});
    } else if (item.code === 'managerSetting') {
      this.$router.push('manager-setting').catch((err: any) => {err});
    } else if (item.code === 'integrationSetting') {
      this.$router.push('integration-setting').catch((err: any) => {err});
    } else if (item.code === 'log') {
      this.$router.push('log').catch((err: any) => {err});
    } else if (item.code === 'license') {
      this.$router.push('license').catch((err: any) => {err});
    } else if (item.code === 'dataDictionary') {
      this.$router.push('dataDictionary').catch((err: any) => {err});
    } else if(item.code === 'apiConfiguration'){
       this.$router.push('apiConfiguration').catch((err: any) => {err});
    }
  }

  menuShow() {
    this.isShow = !this.isShow;
    const payload = this.isShow;
    this.mutationSetMenuStatus(payload);
  }
}
</script>

<style lang="less" scoped>
.organization{
  background: #fff;
  margin-top: 0px;
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
      span.active{
        position: relative;
        &:before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #F5222D;
          position: absolute;
          right: -2px;
        }
      }
      &.selected {
        background: #E8FCF4;
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
        background: #E8FCF4;
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
