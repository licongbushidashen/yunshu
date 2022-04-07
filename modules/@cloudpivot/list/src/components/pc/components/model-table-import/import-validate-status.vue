<template>
  <div class="validate-status">
    <div class="img-wrap">
      <img src="./import-status.svg" />
      <div>
        <i v-if="hasError && !validating" class="icon-gap icon aufontAll h-icon-all-exclamation-circle"></i>
      </div>
    </div>
    <div v-if="validating" class="validate-status-progress">
      <a-progress :percent="progress" />
      <p>数据校验中，请稍后...</p>
      <!-- <p>数据导入中，请不要关闭页面...</p> -->
    </div>
    <div v-else class="validate-status-info">
      <p class="validate-status-info--title">
        数据校验错误
      </p>
      <p>{{ errMsg }} <a @click.stop="downSampleFile">示例文件</a>重新检查</p>
      <!--      当前文件格式与示例文件不一致，请参照-->
      <!-- <p>当前文件内的列标题与此列表不一致，请参照 <a @click.stop="downSampleFile">示例文件</a>重新检查</p> -->
      <!-- <p>当前文件内的表单内容为空，请重新检查再导入数据</p> -->
      <!-- <p>您的数据已超过500条，请删除部分数据或分批重新上传</p> -->
      <div class="validate-status-info--action">
        <a-button @click="reupload">
          重新上传
        </a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Progress, Button } from '@h3/antd-vue';
import importBase from './import-base';

@Component({
  components: {
    AProgress: Progress,
    AButton: Button,
  },
})
export default class ValidateStatus extends Mixins(importBase) {
  validating = false;

  progress = 30;

  timer: any = null;

  isSuccess = false;

  hasError = false;

  errMsg: string = '';

  errCode: string = '';

  created () {
    this.validating = true;
    this.startProgress();
  }

  startProgress () {
    this.timer = setInterval(() => {
      this.progress += 10;
      if (this.progress === 90 && !this.isSuccess) {
        this.progress = 80;
      }
      if (this.progress === 100 && this.isSuccess) {
        this.$emit('success');
        clearInterval(this.timer);
      }

      if (this.progress > 50 && this.hasError) {
        this.validating = false;
        clearInterval(this.timer);
      }
    }, 100);
  }

  reupload () {
    this.$emit('reupload');
  }
}
</script>
<style lang="less">
.validate-status {
  .img-wrap {
    width: 92px;
    margin: 85px auto;
    margin-bottom: 0;
    position: relative;
    & > div {
      width: 39px;
      position: absolute;
      bottom: 0;
      right: 0;
      & > .icon {
        font-size: 39px;
        color: #f4454e;
      }
    }
  }
  &-progress {
    text-align: center;
    width: 400px;
    margin: 49px auto;
    margin-bottom: 151px;
    p {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
      margin-top: 23px;
    }
  }
  &-info {
    text-align: center;
    width: 90%;
    margin: 34px auto;
    &--title {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    &--action {
      margin-top: 32px;
      margin-bottom: 79px;
    }
  }
}
</style>
