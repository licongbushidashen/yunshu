<template>
  <div class="file-storage">
    <div class="guide">
      <div class="file-storage__header">
        <span>邮件配置</span>
        <span class="header__tips">邮件配置为企业邮箱</span>
      </div>
      <div class="file-storage__form">
        <a-row
          class="file-storage__item"
          v-for="(item, index) in emailConfigVO"
          :key="index"
        >
          <a-col :span="layout.left" class="file-storage__left">
            <span v-if="item.required" class="required">*</span>
            <span>{{ item.title }}:</span>
          </a-col>
          <a-col :span="layout.right" class="file-storage__right">
            <div>
              <span v-if="edit" class="check-dingtalk__right--edit">
                <template v-if="['password', 'keySecret'].includes(item.code)">
                  <password-span :value="item.value" />
                </template>
                <template v-else-if="typeof item.value === 'boolean'">
                  {{ item.value ? "是" : "否" }}
                </template>
                <template v-else>
                  {{ item.value }}
                </template>
              </span>
              <template v-else>
                <template v-if="item.type === 'input'">
                  <a-input
                    @change="handleValChange(item)"
                    v-model="item.value"
                  />
                </template>
                <template v-if="item.type === 'radio'">
                  <a-radio-group name="radioGroup" :defaultValue="1">
                    <a-radio
                      v-for="(option, index) in item.options"
                      :key="index"
                      :value="option.value"
                      >{{ option.title }}</a-radio
                    >
                  </a-radio-group>
                </template>
                <template v-if="item.type === 'select'">
                  <a-select show-search v-model="item.value" style="width: 100%">
                    <a-select-option
                      v-for="(option, index) in item.options"
                      :key="index"
                      :value="option.value"
                      >{{ option.title }}</a-select-option
                    >
                  </a-select>
                </template>

                <template v-if="item.type === 'switch'">
                  <a-switch v-model="item.value" />
                </template>
              </template>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
    <a-row class="file-storage__item">
      <a-col :span="layout.left" class="file-storage__left"></a-col>
      <a-col :span="layout.right" class="file-storage__right">
        <div class="btn-group">
          <a-button
            v-if="isJustAdmin"
            type="primary"
            @click="save"
            class="btn-group__btn"
            >{{ btnText[0] }}</a-button
          >
          <a-button @click="connect">{{ btnText[1] }}</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State, namespace } from "vuex-class";

import systemApi from "@/apis/system/system-manager.api";

import PasswordSpan from "@/components/global/password-span.vue";

const UserModule = namespace("System/User");

@Component({
  name: "email-config",
  components: {
    PasswordSpan,
  },
})
export default class EmailConfig extends Vue {
  @UserModule.State("isJustAdmin") isJustAdmin!: boolean;

  layout = {
    left: 5,
    right: 10,
  };
  params = {
    keyId: "", // 唯一标识
    keySecret: "", // 密钥
    endPoint: "", // 上传节点
    bucket: "", // 存储空间
  };
  edit: boolean = false;
  btnText = ["保存", "连接测试"];
  fileStorage: Array<any> = [];
  emailConfigVO = [
    {
      required: true,
      value: "smtp.sina.com.cn",
      title: "SMTP",
      code: "host",
      type: "input",
    },
    {
      required: true,
      value: true,
      title: "启用SSL",
      code: "enableSsl",
      type: "switch",
    },
    {
      required: true,
      value: "",
      title: "端口号",
      code: "port",
      type: "input",
    },
    {
      required: true,
      value: "",
      title: "用户名",
      code: "username",
      type: "input",
    },
    {
      required: true,
      value: "",
      title: "密码",
      code: "password",
      type: "input",
    },
    {
      required: true,
      value: "",
      title: "FROM",
      code: "from",
      type: "input",
    },
    {
      required: true,
      value: "",
      title: "编码",
      code: "charset",
      type: "select",
      options: [
        { value: "US-ASCII", title: "US-ASCII" },
        { value: "ISO-885901", title: "ISO-885901" },
        { value: "UTF-8", title: "UTF-8" },
        { value: "UTF-16BE", title: "UTF-16BE" },
        { value: "UTF-16LE", title: "UTF-16LE" },
        { value: "UTF-16", title: "UTF-16" },
      ],
    },
  ];

  handleValChange(item: any) {
    if (item.code !== "port") return;

    const reg: RegExp = /^(0|[1-9]\d*)$/;
    const { value } = item;
    if (!reg.test(value)) {
      item.value = "";
    } else {
      const number: number = parseInt(value, 10) as number;
      if (number < 0) {
        item.value = 0;
      }
      if (number > 65535) {
        item.value = 65535;
      }
    }
  }

  created() {
    systemApi.getEmailConfig().then((res: any) => {
      if (res.errcode === 0) {
        this.emailConfigVO.forEach((fileItem: any) => {
          fileItem.value =
            fileItem.code === "host" && !res.data[fileItem.code]
              ? fileItem.value
              : res.data[fileItem.code];
        });
        this.edit = true;
        this.btnText[0] = "编辑";
      }
    });
  }

  // 保持配置数据
  async save() {
    if (this.edit) {
      this.edit = false;
      this.btnText[0] = "保存";
      return;
    }
    const res = await this.connect("true");
    if (res) {
      const params = this.setParams();
      systemApi.createdEmailConfig(params).then((res: any) => {
        if (res.errcode === 0) {
          this.$message.success("保存成功!", 2);
          this.edit = true;
          this.btnText[0] = "编辑";
        } else {
          this.$message.error(res.errmsg, 2);
        }
      });
    }
  }

  // 连接测试
  async connect(param: any) {
    const params: any = this.setParams();
    if (!params) {
      this.$message.error("请输入必输参数", 2);
      return false;
    }
    let status = false;
    await systemApi.checkEmail(params).then((res: any) => {
      if (res.errcode === 0) {
        param !== "true" && this.$message.success("连接成功！", 2);
        status = true;
      } else {
        this.$message.error(res.errmsg, 2);
      }
    });
    return status;
  }

  handleParam(type: string): any {
    let ret: any = {};
    let status: boolean = true;
    const bool = this[type].some((res: any) => res.value.trim() !== "");
    if (bool) {
      this[type].forEach((res: any) => {
        if (
          (typeof res.value === "string" && !res.value) ||
          res.value === null ||
          res.value === undefined
        ) {
          status = false;
        }
        ret[res.code] =
          res.value && typeof res.value === "string"
            ? res.value.trim()
            : res.value;
      });
    } else {
      ret = null;
    }
    return status ? ret : status;
  }
  /**
   * 处理保存数据
   */
  setParams() {
    const emailConfigVO = this.handleParam("emailConfigVO");
    if (!emailConfigVO) return false;
    return emailConfigVO;
  }
}
</script>

<style lang="less" scoped>
.file-storage {
  width: 640px;
  text-align: left;
  &__header {
    padding-bottom: 20px;
    position: relative;
    // font-size:18px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
    }

    .header__tips {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      padding-left: 8px;
    }
  }
  &__form {
    .file-storage__item {
      margin-bottom: 20px;
      // div {
      //   float: left;
      // }
      .file-storage__left {
        span {
          color: rgba(0, 0, 0, 0.65);
        }
        position: relative;
        .required {
          left: -6px;
          color: #f5222d;
          position: absolute;
        }
        line-height: 32px;
      }
      .file-storage__right {
        line-height: 32px;
        &--edit {
          line-height: 32px;
        }
      }
    }
  }

  .btn-group__btn {
    margin-right: 16px;
  }
}
</style>
