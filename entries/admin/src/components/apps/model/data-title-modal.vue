<template>
  <a-modal
    width="544px"
    :visible="true"
    @cancel="closeModal"
    @ok="handleOk"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    class="data-title-modal"
    :keyboard="false"
  >
    <div class="data-title">

      <div slot="title" class="title-wrap">
        <span class="title-wrap-title"> {{ title }} </span>
        <span class="title-wrap-tips"> {{ tips }} </span>
      </div>
      <data-title
        class="data-title-textarea"
        :list="list"
        :value="value"
        @change="change"
      />
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Emit, Prop } from "vue-property-decorator";

import DataTitle from '@/components/global/data-title.vue'

@Component({
  name: "data-title-modal",
  components: {
    DataTitle
  }
})
export default class DataTitleModal extends Vue {
  @Prop() value!:any
  @Prop() list!:any

  @Prop({
    default: '数据标题'
  }) title!:string

  @Prop({
    default: '请选择或填写数据标题内容'
  }) tips!:string
  

  closeModal () {
    this.$emit('close');
  }
  created() {
    if (this.value && this.value.length > 0) {
      this.backData = this.value;
    }
  }
  backData = [];

  handleOk() {
    this.$emit('ok', this.backData);
  }

  change(val:any) {
    this.backData = val;
  }

}
</script>

<style lang="less" scoped>
.data-title-modal {

  .data-title {
    .title-wrap {
      overflow: hidden;
      padding-bottom: 16px;
      border-bottom: 1px solid #E8E8E8;
      margin-left: -24px;
      margin-right: -24px;
      .title-wrap-title {
        margin-left: 24px;
        font-size:16px;
        color: #000;
        font-weight: 600;
      }
      .title-wrap-tips {
        margin-left: 8px;
        font-size:12px;
        color:rgba(0,0,0,0.45);
      }
    }
    .data-title-textarea {
      margin-top: 24px;
      height: 172px;

      overflow: hidden;
      // overflow-y: auto;
    }
  }
}
</style>

