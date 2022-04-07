<template>
  <div class="batch-btn-div" :style="propStyle">
    <div class="add batch-add" @click="batchVisible = true">
      <span>
        <i class="icon aufontAll h-icon-all-plus-o"></i>
      </span>
      <span>批量设置选项</span>
    </div>

    <a-modal
      :title="$t('languages.Apps.FormDesignPage.BatchSettingTitle')"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      :visible="batchVisible"
      :maskClosable="false"
      :closable="false"
      @ok="ok"
      @cancel="cancel"
    >
      <a-textarea
        :autosize="{ minRows: 6, maxRows: 6 }"
        v-model="batchValue"
        :placeholder="$t('languages.Apps.FormDesignPage.BatchSettingTextarea')"
        :maxLength="100000"
      ></a-textarea>
      <input type="hidden" v-model="initValue" />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({
  name: "ExtBatchAddRadioModal",
})
export default class ExtBatchAddRadioModal extends Vue {
  batchVisible = false;
  batchValue: string = "";

  @Prop({
    default: () => [],
  })
  options!: any[];

  @Prop({
    default: () => {},
  })
  propStyle!: any;

  created() {
    console.log(this.options);
    if (this.initValue) {
      this.batchValue = this.initValue;
    }
  }

  ok() {
    console.log(this.updateOptions);
    this.$emit('update:options', this.updateOptions);
    this.cancel();
  }

  cancel() {
    this.batchVisible = false;
  }

  get updateOptions() {
    let tempArr: any[] = [];
    const _return: any[] = [];
    if (this.batchValue) {
      tempArr = this.batchValue.split("\n");
      for (const [idx, item] of tempArr.entries()) {
        _return.push({
          default: this.options[idx] && this.options[idx].default ? true : false,
          value: item.replace(/;+$/g, ''),
        });
      }
    }
    return _return;
  }

  get initValue(): string {
    const tempArr: string[] = [];
    if (this.options.length && this.batchVisible) {
      for (const item of this.options) {
        item.value && tempArr.push(item.value);
      }
    }
    const _return = tempArr.join("\n");
    this.batchValue = _return;
    return _return;
  }
}
</script>

<style lang="less" scoped>
.batch-btn-div {
  color: #17BC94;
  .batch-add {
    color: #17BC94;
    cursor: pointer;
  }
}
</style>
