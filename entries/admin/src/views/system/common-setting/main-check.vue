<template>
  <div class="check-dingtalk">
    <div class="guide">
      <div class="check-dingtalk__header">
        <span>基本信息</span>
        <span class="header__tips"><slot name="settingTips" /></span>
      </div>
      
      <div class="check-dingtalk__form">

        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <span>上级部门</span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span v-if="edit" class="check-dingtalk__right--edit">{{ params.parentDept && params.parentDept.name || '--' }}</span>
            <staff-selector
              v-else
              :options="deptOpts"
              v-model="params.parentDept"
              @change="onChange"
            ></staff-selector>
          </a-col>
        </a-row>

        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <span class="required">*</span>
            <span>企业名称:</span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span v-if="edit" class="check-dingtalk__right--edit">{{ params.name }}</span>
            <a-input v-else v-model="params.name" @change="saveParams" />
          </a-col>
        </a-row>

        <!-- <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <span class="required">*</span>
            <span>
              AppKey
              <a-tooltip
                :title="'tips：创建的应用的唯一标识，获取地址：钉钉后台，工作台-自建应用--应用设置-基础信息，\
                        可获取Appkey、APPSecret和AgentId'"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>:
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span v-if="edit" class="check-dingtalk__right--edit">{{ params.appkey }}</span>
            <a-input v-else v-model="params.appkey" @change="saveParams" />
          </a-col>
        </a-row> -->

        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <span>
              CorpId
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span v-if="edit" class="check-dingtalk__right--edit">{{ params.corpId }}</span>
            <a-input v-else v-model="params.corpId" @change="saveParams" />
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, PropSync } from "vue-property-decorator";
import { State, namespace, Mutation } from "vuex-class";
import systemApi from "@/apis/system/system-manager.api";
import OrgApi from "@/apis/organization";
import PasswordSpan from "@/components/global/password-span.vue";
import BtnGroup from "./btn-group.vue";
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import env from "@/env.ts";

const UserModule = namespace("System/User");

@Component({
  name: "check-dingtalk",
  components: {
    BtnGroup,
    PasswordSpan,
    StaffSelector
  }
})
export default class CheckDingtalk extends Vue {
  @UserModule.State("loginedUserInfo") loginedUserInfo!: any;
  @Prop() info!: any;
  @Prop() edit!: any;
  layout = {
    left: 5,
    right: 10
  };
  editBak: boolean = false;
  btnText = ["编辑", "连接测试"];
  corpId: string = "";
  deptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: "请选择部门",
    appManagerFilter: true,
    isInit: false,
    rootNode: [],
    selected: [],
  };
  params = {
    name: "",
    appkey: "",
    appSecret: "",
    syncType: "",
    orgType: 0,
    agentId: "", // 消息推送ID
    pcServerUrl: env.portalHost, // pc端首页地址
    mobileServerUrl: "", // 移动端应用首页地址
    corpId: "",
    parentDept: null,
    parentId: ''
    // synRedirectUri: env.apiHost, // 增量同步回调地址
    // redirectUri: ""
  };
  @Watch("info")
  infoChange(info) {
    this.initParams();
    this.editBak = true;
    this.btnText[0] = "编辑";
  }
  get isSuperAdmin() {
    return (
      this.loginedUserInfo.username === "admin" ||
      this.loginedUserInfo.username === "Admin"
    );
  }
  get isJustAdmin() {
    return this.$store.state.System.User.isJustAdmin;
  }

  mounted() {
    window.localStorage.removeItem("$_orgParams");
    this.initParams();
  }
  // 初始化参数
  initParams() {
    const { oauthHost, redirectHost, apiHost } = env;
    let {
      name,
      appkey,
      appSecret,
      agentId,
      pcServerUrl,
      corpId,
      parentDept,
      parentId
    //   synRedirectUri
    } = this.info;

    // synRedirectUri ? (this.params.synRedirectUri = synRedirectUri) : (this.params.synRedirectUri = apiHost);
    // synRedirectUri ? (this.params.redirectUri = synRedirectUri) : (this.params.redirectUri = oauthHost);

    window.localStorage.setItem("$$_corpId", corpId);
    // @ts-ignore
    this.params = {
      ...this.params,
      name,
      appkey,
      appSecret,
      agentId,
      pcServerUrl,
      syncType: "PUSH",
      orgType: 0,
      corpId,
      parentDept,
      parentId
    };
  }
  // 新增保存
  async save(params) {
    // @ts-ignore
    let { errcode, errmsg, data } = await OrgApi.addOrgan(params);
    if (errcode !== 0) {
      this.$message.error(errmsg);
    } else {
      this.$message.success(errmsg);
      this.close();
    }
  }
  close() {
    this.editBak = true;
    this.btnText[0] = "编辑";
    this.$emit("close");
  }

  onChange(depart: any) {
    if (depart.length > 0) {
      this.params.parentDept = depart[0];
      this.params.parentId = depart[0].id;
    } else {
      this.params.parentDept = null;
      this.params.parentId = "none";
    }
    this.saveParams()
  }
  // save
  saveParams() {
    let mobileServerUrl = `${this.params.pcServerUrl}/mobile`;
    // @ts-ignore
    let { name, appkey, appSecret, agentId, pcServerUrl, corpId, parentDept, parentId } = this.params;
    window.localStorage.setItem(
      "$_orgParams",
      JSON.stringify({
        name,
        appkey,
        appSecret,
        agentId,
        mobileServerUrl,
        pcServerUrl,
        parentDept,
        parentId,
        corpId
      })
    );
  }
  // 编辑保存
  async update(params) {
    // @ts-ignore
    let { errcode, errmsg, data } = await OrgApi.updateOrgan(params);
    if (errcode !== 0) {
      this.$message.error(errmsg);
    } else {
      this.$message.success(errmsg);
      this.close();
    }
  }

  corpIdChange(e) {
    window.localStorage.setItem("$$_corpId", e.target.value);
  }

  createdDingtalk() {
    const vm: any = this;
    if (vm.editBak) {
      vm.editBak = false;
      vm.btnText[0] = "保存";
      return;
    }
    this.params.mobileServerUrl = `${this.params.pcServerUrl}/mobile`;
    let params = { ...this.info, ...this.params };

    // 重置保单数据
    Object.keys(this.params).forEach((key: string) => {
      if (typeof this.params[key] === "string") {
        params[key] = params[key].trim();
        this.params[key] = this.params[key].trim();
      }
    });

    params.appkey = params.appKey;
    params.syncType = "PUSH";
    params.orgType = 0;
    // 如果info有值，则update，没有值则add
    if (this.info && this.info.appkey) {
      this.update(params);
    } else {
      params.orgType = 0;
      this.save(params);
    }
  }

  // 连接测试
  connect() {
    const vm: any = this;
    vm.params.corpId = window.localStorage.getItem("$$_corpId");
    vm.params.mobileServerUrl = `${vm.params.pcServerUrl}/mobile`;
    systemApi.checkDingtalkParams(vm.params).then((res: any) => {
      if (res.errcode === 0) {
        vm.$message.success("连接成功！", 2);
      } else if (res.errcode === 100004) {
        // 未开通手机号码权限
        this.$error({
          title: this.$t("languages.appSettings.RightNotEnough").toString(), // 钉钉应用权限不足
          content: this.$t(
            "languages.appSettings.PhoneRightNotAvailable"
          ).toString(),
          okText: this.$t("languages.Iknow").toString()
        });
      } else {
        vm.$message.error(res.errmsg, 2);
      }
    });
  }

  // 查看appSecret
  showSecret(success: Function) {
    const vm = this;
    if (this.isJustAdmin) {
      this.$confirm({
        title:
          "该信息属于企业高保密信息，相当于个人银行卡及密码，请勿随意传播，请避免企业信息泄露。",
        okText: this.$t("languages.Apps.Continue").toString(),
        cancelText: this.$t("languages.Apps.Cancel").toString(),
        onOk() {
          success();
        }
      });
    } else {
      this.$warning({
        title: "该信息属于企业保密项，如有需要，请联系超级管理员。",
        okText: this.$t("languages.Apps.Good").toString()
      });
    }
  }
}
</script>

<style lang="less" scoped>
.check-dingtalk {
  text-align: left;
  margin-top: 20px;
  &__header {
    margin-bottom: 20px;
    a {
      display: inline-block;
      font-size: 12px;
      color: @primary-color;
      padding-left: 8px;
    }
    position: relative;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
    }
    
  }
  .header__tips {
    display: inline-block;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    padding-left: 8px;
  }
  &__form {
    .form__title {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      margin: 20px 0;
    }
    .check-dingtalk__item {
      margin-bottom: 20px;
      div {
        float: left;
      }
      .check-dingtalk__left {
        span {
          color: rgba(0, 0, 0, 0.65);
        }
        position: relative;
        .required {
          left: -6px;
          color: #f5222d;
          position: absolute;
        }
        // line-height: 32px;
      }

      .check-dingtalk__right {
        color: rgba(0, 0, 0, 0.85);
        // &--edit {
        //   line-height: 32px;
        // }
        .example {
          font-size: 12px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.45);
          line-height: 22px;
        }
      }
    }
  }
}
</style>

