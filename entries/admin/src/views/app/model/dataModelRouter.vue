<template>
  <div class="organization">
    <a-layout-sider
      :trigger="null"
      class="org-menu"
      collapsedWidth="46"
      collapsible
      theme="light"
      v-model="isShow"
      width="224"
    >
      <div v-show="!isShow">
        <div
          :class="{ selected: item.isSelected }"
          :key="item.code"
          @click="onMouseDown(item)"
          class="org"
          v-for="item in menus"
        >
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
      <div v-show="isShow">
        <a-tooltip :key="item.code" placement="right" v-for="item in menus">
          <template slot="title">{{ $t(item.name) }}</template>
          <div
            :class="{ selected: item.isSelected }"
            @mousedown="onMouseDown(item)"
            class="org"
          >
          </div>
        </a-tooltip>
      </div>
      <div @click="() => (isShow = !isShow)" id="hide-menu">
        <div class="to-left" v-show="!isShow"></div>
        <div class="to-right" v-show="isShow"></div>
      </div>
    </a-layout-sider>
    <div class="router-wrap">
      <div class="router-wrap-content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue, Prop} from "vue-property-decorator";

  import {namespace} from "vuex-class";

  const UserModule = namespace("System/User");
  const OrgUserModule = namespace("Organization/User");

  interface MenuItem {
    name: string;
    icon?: string;
    code: string;
    isSelected: boolean;
  }

  @Component({
    name: "dataModelRouter",
    beforeRouteUpdate(to, from, next) {
      if (to.params && to.params.userLink) {
        const vm = this as dataModelRouter;
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
  export default class dataModelRouter extends Vue {
    @Prop({
      type: String
    })
    bizSchemaCode!: string;
    
    @UserModule.State("isOnlyAppAdmin") isOnlyAppAdmin!: boolean;

    @OrgUserModule.Mutation("setCloudPivotPerm") setCloudPivotPerm!: any;

    isCloudPivot: any = false;
    hasCloudPivotPerm: boolean = false;

    isShow: boolean = false;

    async created() {
      // 参数不合法强制跳转
      if (this.bizSchemaCode === "data") {
        this.$router.push({ path: "/apps" }).catch((err: any) => {err});
      }
      this.menus.forEach((m) => {
        m.isSelected = this.$route.name === m.code;
      });
    }

    menus: Array<MenuItem> = [
      {
        name: "数据模型",
        code: "dataModel",
        isSelected: true,
      },
      {
        name: "业务规则",
        code: "busRules",
        isSelected: false,
      },
      // {
      //   name: "数据权限",
      //   code: "dataPermission",
      //   isSelected: false,
      // },
      {
        name: "数据规则",
        code: "dataRuleCalculation",
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
          
          &:after {
            content: "";
            display: block;
          }
          
          &:hover:after {
            width: 14px;
            height: 30px;
          }
        }
        
        .to-right {
          width: 14px;
          height: 30px;
          
          &:after {
            content: "";
            display: block;
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
      background: #E9EDF2;
      padding: 12px;
      .router-wrap-content{
        background: #fff;
        height: 100%;
        width: 100%;
        overflow: auto;
        border-radius: 5px;
      }
    }
  }
</style>
