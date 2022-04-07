<template>
  <a-modal
    v-model="showModal"
    title="重置密码"
    :width="422"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="submit"
    @cancel="cancel"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-row class="row-flex" type="flex">
      <a-col :span="7">User ID</a-col>
      <a-col :span="17">{{ userData.userId }}</a-col>
    </a-row>
    <a-row class="row-flex" type="flex">
      <a-col :span="7">恢复至初始密码</a-col>
      <a-col :span="17">
        <a-input :value="123456" :disabled="true" />
      </a-col>
    </a-row>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import OrgApi from '@/apis/organization';

@Component({
  name: "reset-password"
})

export default class ResetPassword extends Vue {
  @Prop() value!: boolean;

  @Prop() userData!: any;

  showModal: boolean = false;

  submit() {
    const params = { id: this.userData.id };
    OrgApi.resetPassword(params).then((res:any) =>  {
      if (res.errcode) {
        this.$message.error(res.errmsg);
        return;
      }

      this.$message.success('重置密码成功！');
      this.cancel();
    });
  }

  cancel() {
    this.$emit('input', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
  }

}
</script>

<style lang="less" scoped>
.row-flex{
  margin-bottom: 16px;
  align-items: center;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
