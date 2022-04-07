<template>
  <div class="userExtDialog">
    <a-modal
      :title="title"
      :visible="isVisble"
      :closable="true"
      :maskClosable="false"
      :width="430"
      cancelText="取消"
      @cancel="cancel"
      okText="确认"
      @ok="action"
    >
      <a-form :form="formState" class="userExtForm">
        <a-form-item
          label="字段编码"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-input
            v-decorator="['form.code', { rules: [{required: true, message: '请输入字段编码' }]}]"
            placeholder="请输入"
            :maxLength="50"
          ></a-input>
        </a-form-item>
        <a-form-item
          label="字段名称"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-input
            v-decorator="['form.name', { rules: [{required: true, message: '请输入字段名称' }]}]"
            placeholder="请输入"
            :maxLength="50"
          ></a-input>
        </a-form-item>
        <a-form-item
          label="所属组织"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-select
            class="select"
            placeholder="请选择"
            v-decorator="['form.corpId', {rules: [{required: true, message: '请选择组织'}]}]"
          >
            <a-select-option
              v-for="org in orgList"
              :key="org.corpId"
              :value="org.corpId"
            >{{ `${org.name}` }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="所属分组"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-select
            class="select"
            placeholder="请选择"
            v-decorator="['form.belong', {rules: [{required: true, message: '请选择分组'}]}]"
          >
            <a-select-option
              v-for="dateItem in groupList"
              :key="dateItem.key"
              :value="dateItem.key"
            >{{ `${dateItem.name}` }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="匹配字段"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-input
            v-decorator="['form.mapKey', { rules: [{required: true, message: '请输入匹配字段' }]}]"
            placeholder="请输入"
            :maxLength="50"
          ></a-input>
        </a-form-item>
        <a-form-item
          label="启用"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-switch v-decorator="['form.enable', {valuePropName: 'checked'}]" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { State, namespace } from "vuex-class";
const UserModule = namespace("Organization/User");

@Component({
  data() {
    return {
      formState: this.$form.createForm(this),
      previewVisible: false,
      previewImage: "",
    };
  },
})
export default class FormForm extends Vue {
  @UserModule.State("userExt") userExt: any;
  [x: string]: any;

  @Prop({ type: Object, default: () => {} }) formData?: any;

  @Prop({ type: Boolean, default: false }) isShowUserExt: boolean = false;

  formItemLayout: Common.FormItemLayout = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 19,
    },
  };

  isVisble: boolean = false;

  form: any = {
    code: "",
    name: "",
    corpId: undefined,
    belong: undefined,
    mapKey: "",
    enable: true,
  };

  groupList: any[] = [];
  orgList: any[] = [];
  title: string = "";

  cancel() {
    this.$emit("cancel");
  }
  action() {
    this.formState.validateFields((err, values) => {
      if (!err) {
        this.$emit("action", {
          id: this.formData.id,
          code: values.form.code,
          name: values.form.name,
          corpId: values.form.corpId,
          belong: values.form.belong,
          mapKey: values.form.mapKey,
          enable: values.form.enable ? 1 : 0,
        });
      }
    });
  }

  @Watch("isShowUserExt")
  onIsShowUserExtChange(nVal) {
    if (nVal) {
      this.isVisble = true;
      this.orgList = this.userExt.orgList;
      this.groupList = this.userExt.groupList;
      this.title = this.userExt.title;
      this.$nextTick(() => {
        this.formState.setFieldsValue({
          "form.name": this.formData.name,
          "form.code": this.formData.code,
          "form.corpId": this.formData.corpId,
          "form.belong": this.formData.belong,
          "form.mapKey": this.formData.mapKey,
          "form.enable": this.formData.enable
        })
      })
    } else {
      this.isVisble = false;
      this.formState.resetFields();
    }
  }
}
</script>
<style lang='less' scpoed>
.userExtForm {
  /deep/ .ant-form-item-required::before {
    top: 0px !important;
  }
}
</style>