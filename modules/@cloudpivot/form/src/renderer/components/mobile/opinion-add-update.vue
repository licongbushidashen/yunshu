<!--
 * @Descripttion: 新增/修改审批意见
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-08-30 14:36:25
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-09-16 20:53:38
-->
<template>
  <div class="container">
    <div class="container-title">
      <div class="container-title-cancel" @click="cancel()">{{$t("cloudpivot.form.renderer.cancel") }}</div>
      <div class="container-title-subTitle">
        {{ type == "add" ? $t("cloudpivot.form.renderer.addDatas")  : $t("cloudpivot.form.renderer.updateDatas") }}
      </div>
      <div
        class="container-title-clear"
        :class="{ 'container-title-active': content }"
        @click="clearInput"
      >
        {{$t("cloudpivot.form.renderer.clear") }}
      </div>
    </div>
    <div class="container-content">
      <h3-textarea
        v-model="content"
        :count="450"
        :autosize="{minRows:4}"
        :maxLength="450"
        :autoHeight="true"
        :labelStyle="{ width: 0 }"
        :placeholder="$t('cloudpivot.form.renderer.peleseInput')"
      ></h3-textarea>
      <div class="container-content-order" v-if="id">
        <span>{{$t('cloudpivot.form.renderer.displayOrder')}}</span>
        <h3-input
          v-model="order"
          :clear="true"
          type="money"
          :labelStyle="{ width: 0 }"
          :autoHeight="false"
          class="popupMotail-search-input"
        >
        </h3-input>
      </div>
    </div>
    <div class="container-foot">
      <h3-button @click="confirm">
        {{ $t("cloudpivot.form.renderer.ok") }}
      </h3-button>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import { H3Textarea, H3Button, H3Input } from "h3-mobile-vue";

import { workflowCenterApi } from "@cloudpivot/api";

@Component({
  name: "opinion-add-update",
  components: {
    H3Textarea,
    H3Button,
    H3Input,
  },
})

export default class OpinionAddUpdate extends Vue {
  @Prop({ default: false }) isShow?: boolean;

  @Prop({ default: "add" }) type?: string;

  @Prop({ default: 1 }) max!: number;

  @Prop({ default: () => {} }) updateData!: any;

  content: string = "";

  order: string = "1";

  id: string = "";

  oldIndex: number =1;



  @Watch("updateData")
  onUpdateDataChange(v: any) {
    // 查询条件-发生改变时更新store
    if (v.id) {
      this.content = v.content;
      this.oldIndex=v.index;
      this.order = String(v.index);
      this.id = v.id;
    }
  }

  mounted() {
    if (this.updateData.id) {
      this.content = this.updateData.content;
      this.oldIndex = this.updateData.index || 1;
      this.order = String(this.updateData.index || 1);
      this.id = this.updateData.id;
    }
  }

  clearInput() {
    if (this.content) {
      this.content = "";
    }
  }

  async confirm() {
    //新增
    if (this.content.length < 1) {
      this.$h3.toast.show({
        text: "审批意见不能为空",
        autoHide: true,
      });
      return;
    }
    const num: number = Number(this.order) || 1;
    if (this.id) {
      if (num < 1 || num > this.max) {
        this.$h3.toast.show({
          text: `排序应为1~${this.max}之间`,
          autoHide: true,
        });
        return;
      }
    }

    const params: any = {
      content: this.content,
      sortKey: 0,
      id: this.id ? this.id : null,
    };

    let res: any = await workflowCenterApi.saveCommonComment(params);
    if (res.errcode !== 0) {
      this.$h3.toast.show({
        text: res.errmsg,
        autoHide: true,
        iconType: "close",
      });
      return;
    }
    if (this.id) {
      //单独处理排序
    }
    this.cancel({index:num,oldIndex:this.oldIndex?this.oldIndex:1});
  }

  cancel(isRefresh?: any) {
    this.$emit("cancel", isRefresh);
  }
}
</script>
<style lang='less' scoped>

@baseFontSize: 75px;
.px2rem(@name, @px) {
    @{name}: @px/@baseFontSize * 1rem;
}

.container {
  width: 100vw;
  height: 100%;
  background-color: #f7f8fc;
  z-index: 100;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  .container-title {
    width: 100%;
    height: 44px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-content: center;
    font-size: 15px;
    color: #000;
    .px2rem(padding-left, 30px);
    .px2rem(padding-right, 30px);
    .container-title-cancel {
      width: 25%;
      height: 100%;
      font-size: 14px;
      color: #666;
      line-height: 100%;
      display: flex;
      align-items: center;
    }
    .container-title-subTitle {
      display: flex;
      align-items: center;
      flex: 1;
      text-align: center;
      justify-content: center;
      white-space: nowrap;
    }
    .container-title-clear {
      width: 25%;
      height: 100%;
      color: #666;
      text-align: right;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      &.container-title-active {
        color: #f4454e;
      }
    }
  }
  .container-content {
    width: 100%;
    .px2rem(margin-top, 20px);
    background-color: #fff;
    .container-content-order {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .px2rem(padding-left, 30px);
      .px2rem(padding-right, 30px);
      > span {
        color: #666;
        .px2rem(font-size, 30px);
        .px2rem(width, 180px);
        text-align: left;
      }
      .popupMotail-search-input {
        flex: 1;
      }
    }
  }
  .container-foot {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 44px;
    background-color: #fff;
    .h3-button {
      color: #2970ff;
      font-size: 17px;
      line-height: 44px;
    }
  }
}
</style>