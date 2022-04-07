<template>
  <div class="data-info">
    <template v-if="info.errorType == 1">
      <div class="error-top">
        <p>
          <i class="icon aufontAll h-icon-all-check-circle"></i>
          <span>导入成功{{ info.successCount }}条</span>
        </p>

        <p>
          <i class="icon aufontAll h-icon-all-close-circle"></i>
          <span>导入失败{{ info.errorCount }}条</span>
          <a href="javascript:;" class="ac-link download-errinfo" @click="exportErrorResult">下载错误信息</a>
        </p>
      </div>
    </template>

    <template v-else>
      <div class="error-top" >
        <i class="icon aufontAll h-icon-all-close-circle"></i>
        <span>导入失败</span>
      </div>

      <div class="err-con">
        <!-- 仅展示文本 -->
        <template v-if="isOnlyShowErrInfo">
          <p>{{ info.errorMsg }}</p>
        </template>

        <!-- 需要下载错误信息 -->
        <template v-else>
          <p>{{ info.errorMsg }}</p>
          <a href="javascript:;" class="ac-link download-errinfo" @click="exportErrorResult">下载错误信息</a>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { listApi, listParams }  from '@cloudpivot/api';
@Component({
  name: 'data-info'
})
export default class DataInfo extends Vue {
  @Prop({
    type: String
  }) name!: string;

  @Prop({
    type: Object
  }) info!: any;

  get isOnlyShowErrInfo(){
    return !this.info.fileName;
  }

   /**
   * 下载错误信息文档
   */
  async exportErrorResult() {
    if (!this.info.fileName)  return;
    const res = await listApi.exportErrorResult(this.info.fileName);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(this.$t('cloudpivot.list.pc.DownloadFailed') as string);
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });

      this.downloadFile(blob, this.info.fileName);
    }
  }

  downloadFile(blob: any, fileName: string) {
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}

</script>
<style lang='less' scoped>
  .error-top {
    & > p {
      margin-bottom: 15px;
      &:last-of-type {
        margin-bottom: 0;
      }
    }
    &  i.icon {
      color: #F4454E;
      margin-right: 16px;
      &.h-icon-all-check-circle {
        color: #32B683;
      }
    }
    &  span {
      color:rgba(0,0,0,0.85);
    }
    & .ac-link {
      margin-top: 12px;
      margin-left: 32px;
    }
  }

  .err-con {
    padding-left: 32px;
    margin-top: 24px;
    p {
      color:rgba(0,0,0,0.85);
      font-size: 16px;
    }
    .download-errinfo {
      display: inline-block;
      margin-top: 14px;
    }
  }
  .ac-link {
    color: #17BC94;
    display: block;
  }
</style>
