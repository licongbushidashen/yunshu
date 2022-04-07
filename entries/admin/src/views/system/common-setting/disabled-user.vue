<template>
  <span>
    <a-modal
      v-model="popoverVisible"
      :width="446"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      @ok="comfirmLevel1Popover"
      @cancel="closeLevel1Popover"
      class="app-form-modal"
      :maskClosable="false"
      :keyboard="false"
      :closable="false"
      :footer="null"
    >
      <div style="margin-bottom: 40px">
        <div class="tip-content">
          <i class="icon aufontAll h-icon-all-exclamation-circle"></i>
          <div>{{ disabled ? "禁用组织" : "启用组织" }}</div>
        </div>
        <div class="popover-input">
          <a-input-password
            v-model="value"
            placeholder="请输入超级管理员密码"
          />
        </div>
      </div>
      <div class="bottom-bolck btn-group clearfix">
        <a-button
          class="btn"
          type="primary"
          :loading="loadingButton"
          @click="comfirmLevel1Popover"
          >{{ $t("languages.Apps.Ok") }}</a-button
        >
        <a-button
          class="btn"
          :disabled="loadingButton"
          @click="closeLevel1Popover"
          >{{ $t("languages.Apps.Cancel") }}</a-button
        >
      </div>
    </a-modal>
    <div class="input-modal">
      <a-button
        v-if="isDisabled"
        @click="popoverVisible = true"
        class="btn-group__btn"
        >{{ disabled ? "禁用" : "启用" }}</a-button
      >
    </div>
  </span>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import OAuthApi from "@/apis/oauth";
import common from "@cloudpivot/common";
import OrgApi from "@/apis/organization";

@Component({
  name: "DisabledUser",
  components: {},
})
export default class DisabledUser extends Vue {
  @Prop() isDisabled!: boolean;
  @Prop() id!: any;
  @Prop() disabled!: boolean;

  popoverVisible: boolean = false;

  value: string = "";

  loadingButton: boolean = false;

  created() {
    // this.dialogList;
  }

  @Watch("popoverVisible")
  changeVisible(val) {
    if (!val) {
      this.value = "";
    }
  }

  /* add弹窗-确定 */
  async comfirmLevel1Popover() {
    this.loadingButton = true;
    const result = await OAuthApi.getRsaKey();
    const flag: boolean =
      typeof result === "object" &&
      result.hasOwnProperty("index") &&
      result.hasOwnProperty("key");
    if (!flag) {
      return;
    }

    const { index, key } = result;
    const password: any = common.utils.RsaEncrypt(this.value, key);
    let res: any = await OrgApi.disableOrgaUserList({
      index,
      password,
      id: this.id,
      isEnable: !this.disabled,
    });

    if (res.errcode !== 0) {
      this.loadingButton = false;
      this.$message.error(res.errmsg as string);
    } else {
      this.$message.success(res.errmsg as string);
      this.popoverVisible = false;
      this.loadingButton = false;
      this.$emit("getOrgList");
    }
  }

  // /* add弹窗-取消 */
  closeLevel1Popover() {
    this.value = "";
    this.loadingButton = false;
    this.popoverVisible = false;
  }

  beforeDestroy() {
    this.value = "";
  }
}
</script>

<style lang="less" scoped>
.design-wrapper {
  .each-title {
    font-size: 14px;
  }
}
.popover-input {
  margin-left: 38px;
  width: 330px;
}
.tip-content {
  display: flex;
  margin: 8px;
  align-items: center;
  i {
    font-size: 22px;
    color: #faad14;
    margin-right: 16px;
    vertical-align: top;
    &:hover {
      color: #faad14;
    }
  }
  & > div {
    font-size: 16px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }
}
.bottom-bolck {
  padding-bottom: 4px;
  margin-top: 8px;
  .btn {
    float: right;
    margin-right: 0px !important;
    &:last-child {
      margin-right: 8px !important;
    }
  }
}
.empty-tips {
  text-align: center;
  padding-top: 28px;
  padding-bottom: 24px;
  color: rgba(0, 0, 0, 0.65);
}
ul {
  max-height: 450px;
  overflow: auto;
  overflow-x: hidden;
  margin-right: -16px;
  li {
    min-height: 30px;
    line-height: 30px;
    .bar-right {
      margin-right: 16px;
    }
    &:hover {
      background: #e8fcf4;
    }
  }
}

.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
.bar-c {
  color: rgba(0, 0, 0, 0.45);
}
</style>
