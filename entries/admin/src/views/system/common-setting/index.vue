<template>
  <div class="common-setting">
    <div class="common-setting__header" ref="header">
      <div class="deparment-wrap">
        <!-- <span class="common-setting-span" v-if="orgList.length === 1">常规设置</span> -->
        <div class="dep-wrap-left">
          <div
            class="dep-title"
            @click="depContentVisible = !depContentVisible"
          >
            {{ currentDep.name || main.name }}
            <span><a-icon type="caret-down" /></span>
          </div>
        </div>
        <span
          style="margin-left: 32px; color: #17bc94; cursor: pointer"
          v-if="organizationRelated && isJustAdmin"
          @click="() => (this.showAddDepart = true)"
        >
          <a-icon type="plus" />
        </span>
      </div>
    </div>

    <div
      class="dep-content"
      v-if="depContentVisible"
      :style="depContentStyle"
      @mouseleave="depContentVisible = false"
    >
      <div class="search-box">
        <a-input-search
          v-model="searchText"
          placeholder="请输入组织"
          style="width: 320px"
        />

        <p>
          <span class="icon aufontAll h-icon-all-flag-o"></span>
          主组织
        </p>

        <div class="deps-items">
          <span
            v-for="item in orgTypes.Main"
            :key="item.id"
            @click="changeActive(item.key, item.id, item)"
          >
            {{ item.name }}
          </span>
        </div>

        <p style="margin-bottom: 12px;">
          <span class="icon aufontAll h-icon-all-associated-o"></span>
          关联组织
        </p>

        <a-tabs default-active-key="1">
          <a-tab-pane
            key="1"
            v-if="orgTypes.SelfMaintenance.length"
            :tab="`自维护组织（${orgTypes.SelfMaintenance.length}）`"
          >
            <deps-items-wrap
              :listData="orgTypes.SelfMaintenance"
              @itemClick="(item) => changeActive(item.key, item.id, item)"
            />
          </a-tab-pane>
          <a-tab-pane
            key="2"
            v-if="orgTypes.Dingtalk.length"
            :tab="`钉钉集成维护（${orgTypes.Dingtalk.length}）`"
          >
            <deps-items-wrap
              :listData="orgTypes.Dingtalk"
              @itemClick="(item) => changeActive(item.key, item.id, item)"
            />
          </a-tab-pane>
          <a-tab-pane
            key="3"
            v-if="orgTypes.Wechat.length"
            :tab="`企业微信集成（${orgTypes.Wechat.length}）`"
          >
            <deps-items-wrap
              :listData="orgTypes.Wechat"
              @itemClick="(item) => changeActive(item.key, item.id, item)"
            />
          </a-tab-pane>
          <a-tab-pane
            key="4"
            v-if="orgTypes.Other.length"
            :tab="`其他组织（${orgTypes.Other.length}）`"
          >
            <deps-items-wrap
              :listData="orgTypes.Other"
              @itemClick="(item) => changeActive(item.key, item.id, item)"
            />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <div class="common-setting__content">
      <div class="set-support" v-if="orgList[active].orgType === 'MAIN'">
        <p>主组织维护方式</p>
        <a-select
          :defaultValue="isCloudPivot"
          style="width: 120px"
          class="set-support-select"
          :value="isCloudPivot"
          :disabled="!this.$store.state.System.User.isJustAdmin"
          @change="handleChange"
        >
          <a-select-option
            :value="item.value"
            :key="item.value"
            v-for="item in setList"
            >{{ item.label }}</a-select-option
          >
        </a-select>
      </div>
      <div v-if="orgList[active].orgType === 'MAIN'" class="set-support-tip">
        提示：主组织启用以后不允许再修改主组织维护方式，否则将会导致数据、权限错乱
      </div>

      <template v-if="active === 0">
        <!-- 主组织钉钉（企业微信）维护 主组织 -->
        <template v-if="isCloudPivot === 0">
          <!-- 钉钉集成维护 -->
          <a-steps
            direction="vertical"
            :current="-1"
            class="common-setting__step"
          >
            <a-step id="app-list1">
              <div class="common-setting__dingtalk" slot="description">
                <check-dingtalk
                  :info="orgList[active]"
                  @close="closeAddDepart"
                  :edit="edit"
                >
                  <span class="setting-tips" @click="ShowConfigRule" slot="settingTips">
                    <a href="javascript:void(0)">配置规则</a>
                  </span>
                </check-dingtalk>
              </div>
            </a-step>
            <!--     <a-step id="app-list4">
              <div class="common-setting__dingtalk" slot="description">
                <syn-redirect-url>
                  <span @click="ShowConfigRule" slot="settingTips"><a href="javascript:void(0)"> 配置规则 </a></span>
                </syn-redirect-url>
              </div>
            </a-step>-->
            <a-step id="app-list2">
              <div class="common-setting__dingtalk" slot="description">
                <portal-setting
                  :info="orgList[active]"
                  @close="closeAddDepart"
                  :edit="edit"
                  :cloudPivot="isCloudPivot"
                  @changeEdit="changeEdit"
                >
                  <span class="setting-tips" @click="ShowConfigRule" slot="settingTips">
                    <a href="javascript:void(0)">配置规则</a>
                  </span>
                </portal-setting>
              </div>
            </a-step>
          </a-steps>
        </template>

        <template v-else-if="isCloudPivot === 2">
          <!-- 企业微信集成维护 -->
          <a-steps
            direction="vertical"
            :current="-1"
            class="common-setting__step"
          >
            <a-step id="app-list1">
              <div class="common-setting__dingtalk" slot="description">
                <wechat-setting
                  :info="orgList[active]"
                  @close="closeAddDepart"
                  :edit="edit"
                  :cloudPivot="isCloudPivot"
                  @changeEdit="changeEdit"
                >
                  <span  @click="ShowConfigRule" class="settingTips setting-tips">
                    <a href="javascript:void(0)">配置规则</a>
                  </span>
                </wechat-setting>
              </div>
            </a-step>
          </a-steps>
        </template>

        <template v-else>
          <!-- 云枢自维护 -->

          <div class="common-setting__dingtalk" slot="description">
            <main-check
              :info="orgList[active]"
              @close="closeAddDepart"
              :edit="edit"
            ><span @click="ShowConfigRule" class="setting-tips" slot="settingTips">
            <a
              href="javascript:void(0)"
              style="
                display: inline-block;
                font-size: 12px;
                color: #17bc94;
                padding-left: 8px;
              "
              >配置规则</a
            >
          </span></main-check>
            <main-setting
              :info="orgList[active]"
              @close="closeAddDepart"
              :edit="edit"
              :cloudPivot="isCloudPivot"
              @changeEdit="changeEdit"
            ><span @click="ShowConfigRule" class="setting-tips" slot="settingTips">
            <a
              href="javascript:void(0)"
              style="
                display: inline-block;
                font-size: 12px;
                color: #17bc94;
                padding-left: 8px;
              "
              >配置规则</a
            >
          </span>
            </main-setting>
          </div>
        </template>
      </template>

      <template v-else>
        <!-- 关联组织 -->
        <organizetion-relate
          :info="active"
          @getOrgList="getOrgList"
          @refreshList="handleRefresh"
          :id="id"
          :orgList="orgList"
        >
          <span @click="ShowConfigRule" class="setting-tips" slot="settingTips">
            <a
              href="javascript:void(0)"
              style="
                display: inline-block;
                font-size: 12px;
                color: #17bc94;
                padding-left: 8px;
              "
              >配置规则</a
            >
          </span>
        </organizetion-relate>
      </template>

      <!-- <div class="common-setting__border"></div> -->
      <!-- <div class="common-setting__storage" id="app-list4" v-if="active === 0">
        <file-storage/>
      </div>-->
      <!-- <div class="common-setting__dingtalk">
        <check-dingtalk/>
      </div>
      <div class="common-setting__border"></div>
      <div class="common-setting__portal">
        <portal-setting/>
      </div>
      <div class="common-setting__border"></div>
      <div class="common-setting__storage">
        <file-storage/>
      </div>-->
    </div>

    <a-modal
      :visible="showGuide"
      width="418px"
      :centered="true"
      class="common-setting__guide"
      :okText="'下一步'"
      @ok="doGuide"
      :maskClosable="false"
      :keyboard="false"
    >
      <div class="guide__wrap clearfix">
        <div class="guide__wrap--img">
          <img src="@/assets/images/welcomeBpm.png" />
        </div>
        <p class="guide__wrap--tips">
          Hi，欢迎进入云枢系统， 为了您在使用过程中得到更好的体验，
          请先跟着我配置信息。
        </p>
        <!-- <div class="guide__wrap--tips">

        </div>-->
      </div>
    </a-modal>

    <a-drawer
      title="配置规则"
      :width="660"
      :visible="showDrawer"
      @close="ShowConfigRule"
    >
      <config-rule />
    </a-drawer>
    <a-drawer
      title="新增关联组织"
      :visible="showAddDepart"
      :destroyOnClose="true"
      @ok="closeAddDepart"
      @close="closeAddDepart"
      :width="860"
      wrapClassName="add-o-drawer"
    >
      <add-organization
        @close="closeAddDepart"
        :info="null"
        :orgList="orgList"
      />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { State, namespace } from "vuex-class";
import h3Intro from "@/utils/introjs/h3-intro";
import CheckDingtalk from "./check-dingtalk.vue";
import PortalSetting from "./portal-setting.vue";
import WechatSetting from "./wechat-setting.vue";
import AddOrganization from "./add-organization.vue";
import SynRedirectUrl from "./syn-redirect-url.vue";
import ConfigRule from "./config-rule/index.vue";
import OrganizetionRelate from "./organizetion-relate.vue";
import OrgApi from "@/apis/organization";
import systemApi from "@/apis/system/system-manager.api";
import Oauth from "@/apis/oauth";
import env from "@/env.ts";
// import { isArray } from "tinymce";

import MainCheck from "./main-check.vue";
import MainSetting from "./main-setting.vue";

import depsItemsWrap from "./deps-items-wrap.vue";

@Component({
  name: "common-setting",
  components: {
    CheckDingtalk,
    PortalSetting,
    WechatSetting,
    SynRedirectUrl,
    ConfigRule,
    AddOrganization,
    OrganizetionRelate,
    MainCheck,
    MainSetting,
    depsItemsWrap,
  },
})
export default class CommonSetting extends Vue {
  showGuide: boolean = false;
  layout = {
    left: 5,
    right: 10,
  };
  currentDep: any = {
    name:''
  };
  searchText: string = "";

  showDrawer: boolean = false;

  cropName: string = "";
  isCloudPivot: any = 1;
  //  get isCloudPivot() { // 是否已打开内部维护组织开关
  //     return this.$store.state.config.cloudPivot || 0;
  //   }
  setVal: any = 0;
  isUpdate: boolean = false;
  showAddDepart: boolean = false;
  main: any = {
    name:''
  };
  edit: boolean = false;
  setList: Array<any> = [
    {
      label: "钉钉集成维护",
      value: 0,
    },
    {
      label: "云枢自主维护",
      value: 1,
    },
    {
      label: "企业微信集成维护",
      value: 2,
    },
  ];
  active: number = 0;
  orgList: Array<any> = [
    {
      orgType: "MAIN",
      name: "",
    },
  ];
  id: any = null;

  get orgTypes() {
    this.orgList.forEach((el, index) => {
      el.key = index;
    });
    return {
      Main: this.orgList.filter(item => item.orgType === 'MAIN' && item.name.indexOf(this.searchText) > -1),
      SelfMaintenance: this.orgList.filter(item => item.orgType !== 'MAIN' && item.syncType === 'PUSH' && item.relatedType === 'DINGTALK' && item.appkey === '' && item.name.indexOf(this.searchText) > -1),
      Dingtalk: this.orgList.filter(item => item.orgType !== 'MAIN' && ((item.syncType === 'PUSH' && item.relatedType === 'DINGTALK' && item.appkey !== '') ||  (item.syncType === 'PULL' && item.relatedType === 'DINGTALK')) && item.name.indexOf(this.searchText) > -1),
      Wechat: this.orgList.filter(item => item.orgType !== 'MAIN' && item.relatedType === 'WECHAT' && item.name.indexOf(this.searchText) > -1),
      Other: this.orgList.filter(item => item.orgType !== 'MAIN' && item.syncType === 'PULL' && item.relatedType === 'CUSTOMIZE' && item.name.indexOf(this.searchText) > -1)
    }
  }

  get organizationRelated() {
    return this.$store.state.config.organizationRelated && !!this.main;
  }
  get isJustAdmin() {
    return this.$store.state.System.User.isJustAdmin;
  }

  depContentVisible: boolean = false;
  @Watch("depContentVisible")
  onDepContentVisibleChange(val) {
    if (val) {
      this.depContentStyle = {
        // @ts-ignore
        width: 1000 + 'px'
      }
    }
  }
  depContentStyle: any = {
    width: 0,
  };

  /**
   * @desc 切换主组织维护放肆
   */
  handleChange(cloudPivotType) {
    // console.log('cloudPivotType', cloudPivotType)
    // this.isCloudPivot = cloudPivotType;
    if (this.isUpdate) return false;
    this.isUpdate = true;
    // @ts-ignore
    systemApi.setCloudProvt({ cloudPivotType }).then((res) => {
      let { errcode, errmsg } = res;
      this.isUpdate = false;
      if (errcode === 0) {
        this.isCloudPivot = cloudPivotType;
        Oauth.getSystemConfig().then((config) => {
          if (config) {
            this.$store.commit("setConfig", config);
          }
        });
      } else {
        this.$message.error(errmsg);
      }
    });
  }
  /**
   * @desc 切换子组件编辑状态
   */
  changeEdit(edit: boolean) {
    this.edit = edit;
  }
  /*
   * 设置企业名称
   */
  async setCropName() {
    if (!this.cropName) {
      this.$message.warning("请填写企业名称！");
      return;
    }
    /* 设置传参 */
    const { oauthHost, redirectHost } = env;
    let params: any = {
      agentId: "",
      appSecret: "",
      appkey: "",
      corpId: "",
      corpSecret: "",
      exportHost: "",
      mobileServerUrl: "",
      modifiedTime: "",
      orgType: 0,
      orgTypeStr: "",
      parentId: "",
      relatedType: 3,
      relatedTypeStr: "",
      scanAppId: "",
      scanAppSecret: "",
      syncType: 0,
      syncTypeStr: "",
      ssoSecret: "",
    };
    if (this.main) {
      params = { ...params, ...this.main };
    }
    params.redirectUri = oauthHost + "/login"; // 回调域名
    params.pcServerUrl = env.portalHost;
    params.adminServerUrl = redirectHost;
    params.relatedType = "OTHER";
    params.syncType = "PUSH";
    params.ssoServerUrl = oauthHost + "/login";
    params.synRedirectUri = env.apiHost;
    params.name = this.cropName;
    // @ts-ignore
    // let { errcode, errmsg, data } = await OrgApi.addOrgan(params);
    // if (errcode !== 0) {
    //   this.$message.error(errmsg)
    // } else {
    //   this.$message.success(errmsg);
    // }
    if (this.main) {
      this.update(params);
    } else {
      this.save(params);
    }
    // OrgApi.setCropName(params).then((res:any) =>  {
    //   if (res.errcode) {
    //     this.$message.error(res.errmsg);
    //     return;
    //   }
    //   this.$message.success('保存成功！');
    // });
  }
  // 新增保存
  async save(params) {
    // @ts-ignore
    let { errcode, errmsg, data } = await OrgApi.addOrgan(params);
    if (errcode === 0) {
      this.$message.success(errmsg);
    } else {
      this.$message.error(errmsg);
    }
  }
  // 编辑保存
  async update(params) {
    // @ts-ignore
    let { errcode, errmsg } = await OrgApi.updateOrgan(params);
    if (errcode === 0) {
      this.$message.success(errmsg);
    } else {
      this.$message.error(errmsg);
    }
  }

  /**
   * 抽屉显隐的控制
   */
  ShowConfigRule() {
    this.showDrawer = !this.showDrawer;
  }
  // 关闭新增关联组织弹窗
  closeAddDepart() {
    this.showAddDepart = false;
    // 更新数据
    this.getOrgList();
  }
  /**
   * 指引开始
   */
  doGuide() {
    (window as any).h3Intro.start();
    this.showGuide = false;
  }
  getCloudPivot() {
    if ("isCloudPivot" in this.$store.state.config) {
      this.isCloudPivot = this.$store.state.config.isCloudPivot;
      // 获取企业名称
      // @ts-ignore
      //  OrgApi.getCropName().then((res:any) =>  {
      //   if (!res.errcode && res.data) {
      //     this.cropName = res.data.deptName;
      //   }
      // });
    } else {
      setTimeout(() => this.getCloudPivot(), 100);
    }
    // 设置引导提示信息
    this.showGuide = true;
    const isShowGuide = localStorage.getItem("isNewUser");
    if (!isShowGuide) {
      this.showGuide = true;
      localStorage.setItem("isNewUser", "toDoGuide");
    } else {
      this.showGuide = false;
    }

    let stepData: any = [];
    if (this.isCloudPivot === 0) {
      stepData = [
        {
          element: "#app-list1",
          content:
            "钉钉集成：系统基于钉钉内置使用，系统中组织机构从钉钉同步，需在钉钉中自建应用，并获取应用消息填写在下方，详细配置步骤请查看“配置规则”",
        },
        /* {
          element: '#app-list2',
          content: '增量同步：钉钉中组织修改变更，增量同步到系统中，\
            配置信息保存即可绑定钉钉同步，详细配置步骤请查看“配置规则”'
        },  */
        {
          element: "#app-list2",
          content:
            "门户访问设置：用户在门户钉钉扫码登录配置，需配置相关信息，详细配置步骤请查看“配置规则”",
          // position: 'right',
        },
      ];
    } else if (this.isCloudPivot === 1) {
      stepData = [
        {
          element: "#app-list1",
          content: "企业名称：系统内本企业的名称，将作为组织机构根节点显示",
        },
      ];
    } else if (this.isCloudPivot === 2) {
      stepData = [
        {
          element: "#app-list1",
          content: "正确配置企业微信集成参数",
        },
      ];
    }

    (window as any).h3Intro = h3Intro({
      stepData,
    });
  }

  /**
   * 生命周期
   */
  mounted() {
    // 更新组织维护配置开关设置参数
    this.getCloudPivot();
    this.getOrgList();
  }
  // 获取组织机构列表
  async getOrgList() {
    // @ts-ignore
    let res: any = await OrgApi.getOrgaList();
    if (res.errcode !== 0) {
      return this.$message.error(res.errmsg as string);
    }
    // @ts-ignore
    if (res.data.length) {
      // @ts-ignore
      let main = res.data.find((item: any) => item.orgType === "MAIN");
      this.main = main;
      // 自维护初始化企业名称
      this.cropName = main && main.name as string;

      // @ts-ignore
      let others = res.data.filter((item: any) => item.orgType !== "MAIN");
      this.orgList = [main, ...others];
    }
  }
  // 切换显示
  async changeActive(key: number, id: any, item: any): Promise<void> {
    this.active = key;
    this.id = id;
    this.depContentVisible = false;
    this.currentDep = item;
  }

  handleRefresh() {
    this.getOrgList().then(() => {
      const main: any = this.orgList.find(
        (item: any) => item.orgType === "MAIN"
      );
      if (main) {
        this.changeActive(0, main.id, main);
      }
    });
  }
}
</script>
<style lang="less" scoped>
.dep-wrap-left {
  height: 56px;
  position: relative;
  .dep-title {
    font-size: 14px;
    color: #17bc94;
    line-height: 56px;
  }
}
.dep-content {
  position: fixed;
  background-color: #fff;
  border-radius: 4px;
  margin-top: 8px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);
  z-index: 9;
  padding: 16px;
  max-height: 546px;
  overflow: auto;
  p {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    margin-top: 20px;
    span {
      margin-bottom: 10px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
    }
  }
  .deps-items {
    background: #fafafa;
    border-radius: 4px;
    line-height: 42px;
    padding: 0 24px;
    margin-top: 16px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    span {
      cursor: pointer;
      &:hover {
        color: #17bc94;
      }
    }
  }
}

.settingTips {
  span {
    cursor: pointer;
    &:hover {
      color: #17bc94;
    }
  }
}
/deep/.deps-items-wrap{
    background: #FAFAFA;
    padding: 24px 24px 0;
    height: 220px;
    overflow-y: auto;
    span {
      width: 20%;
      overflow: hidden;
      margin-right: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
      -moz-box-flex: 1;
      flex: 1;
      display: inline-block;
      margin-bottom: 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      cursor: pointer;
      padding: 2px 0;
      border-radius: 2px;
    }
  }

.common-setting {
  margin: 0 24px;
  height: 100%;
  
  .common-setting__header {
    height: 56px !important;
  }
  &-info {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    &-item {
      margin-bottom: 20px
    }
  }
  &__content {
    .common-setting__step {
      max-width: 700px;
    }
    /deep/.ant-steps-item-description {
      padding-bottom: 24px;
    }
    height: calc(100% - 70px);
    overflow-y: auto;
    padding-left: 10px;
    padding-top: 24px;
    padding-bottom: 64px;
    // position: relative;
  }
  &__header {
    text-align: left;
    border-bottom: 1px solid rgba(232, 232, 232, 1);
    height: 48px;
    display: flex;
    align-items: center;
    line-height: 48px;
    display: flex;
    justify-content: space-between;
    .common-setting-span {
      margin-right: 20px;
    }
    .setting-title {
      font-weight: 500;
      font-size: 16px;
      line-height: 22px;
    }
    .deparment-wrap {
      display: flex;
      align-items: center;
      white-space: nowrap;
      word-break: normal;
      overflow: auto;
      // display: inline-block;
      max-width: 80%;
      margin-right: 20px;
      margin-left: 20px;
      box-sizing: border-box;
    }
    .department-branch {
      color: #333;
      display: inline-block;
      height: 48px;
      padding: 0 16px;
      cursor: pointer;
      position: relative;
      &.department-delete {
        position: absolute;
        right: 0;
        top: 0;
      }
      &.active {
        color: #17bc94;
        &:after {
          content: "";
          display: block;
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background: #17bc94;
        }
      }
    }
  }
  &__border {
    border-bottom: 1px solid rgba(232, 232, 232, 1);
    // min-height: 1px;
  }
  &__dingtalk {
    // max-width: 700px;
    margin-top: 2px;
    // margin-top: 300px;
    .set-corp-name {
      position: relative;
      padding-left: 5px;
      .required {
        left: -6px;
        color: #f5222d;
        position: absolute;
      }
      .corp-name {
        margin-bottom: 20px;
      }
    }
  }
  &__storage {
    max-width: 740px;
    margin-top: 24px;
  }
  &__portal {
    max-width: 700px;
    margin-top: 24px;
  }
  /deep/&__guide {
    /deep/.ant-modal-close {
      display: none;
    }
  }
  .set-support {
    & {
      display: flex;
      font-size: 14px;
      margin-bottom: 10px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 32px;
    }
    .set-support-select {
      margin: 0 16px;
      width: 130px !important;
    }
  }
  .set-support-tip {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
<style lang="less">
@import "~@/utils/introjs/h3-intro.less";
.common-setting__guide {
  .guide__wrap {
    .guide__wrap--img {
      float: left;
      img {
        width: 82px;
        height: 93px;
      }
    }
    .guide__wrap--tips {
      // float: left;
      margin-left: 108px;
      padding-top: 7px;
      font-size: 16px;
    }
  }
  // 隐藏进入云枢系统引导modal框取消按钮
  .ant-modal-content {
    .ant-modal-footer {
      .ant-btn:nth-child(1) {
        display: none;
      }
    }
  }
  .ant-modal-close {
    display: none;
  }
  .ant-modal-footer {
    border-top: 0;
  }
  .ant-btn-default {
    display: none;
  }
  .ant-modal-body {
    padding-bottom: 0;
  }
}

.add-o-drawer {
  .ant-drawer-wrapper-body {
    overflow: hidden;
  }
  .ant-drawer-body {
    height: calc(100% - 115px);
    overflow: auto;
  }
}

.add-deparment {
  margin-right: 24px;
}
.setting-tips{
  font-weight: 400;
}
.header__tips{
  font-weight: 400;
}
.btn-group-row{
  margin-top: 38px;
}
</style>
