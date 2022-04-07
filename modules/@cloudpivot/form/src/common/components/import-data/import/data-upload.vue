<template>
  <div class="import-input">
    <!-- v-if="!isUploading" -->
    <div
      :class="{hover: isHover}"
      @mouseleave="isHover = false"
      @mouseover="isHover = true"
      class="import-input-upload"
      v-show="!isUploading"
    >
      <a-upload-dragger
        :accept="upLoadAccept"
        :action="uploadUrl"
        :beforeUpload="beforeUpload"
        :headers="header"
        :multiple="false"
        @change="handleChange"
        @remove="remove"
        name="file"
        ref="fileUpload"
      >
        <div class="import-input-upload-icon">
          <span class="icon-gap icon aufontAll h-icon-all-cloud-upload-o"></span>
          <p>选择或拖拽Excel文件上传</p>
        </div>
        
        <div class="import-input-upload-tips">
          <p>1、支持.xlsx格式，单次最多500条数据</p>
          <p>
            2、为确保上传数据与列表内容匹配，请先下载
            <a style="text-decoration: underline;" @click.stop="exportTemplate()">示例文件</a>
          </p>
        </div>
      </a-upload-dragger>
    </div>
    
    <div class="import-input-progress" v-show="isUploading">
      <div>
        <span class="success-import icon aufontAll h-icon-all-excel"></span>
        <p>
          <span>{{ file.name }}</span>(<span>{{ file.size | filterFileSize }}</span>)
          <a-icon @click="deleteFile" class="icon" type="close"/>
        </p>
        <a-progress :percent="progress" :status="progressStatus" size="small"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Inject, Prop, Vue} from "vue-property-decorator";
  import {Button, Progress, Upload} from "@h3/antd-vue";

  import DataInfo from "./data-info.vue";
  import {formApi, listApi as Application} from "@cloudpivot/api";

  import {FormSheet} from "@cloudpivot/form/schema";
  import {UploadControl} from "@cloudpivot/form/src/common/controls/upload-control";

  import {utils} from "@cloudpivot/common";
  import {filters} from '@cloudpivot/list/src/components/pc/components/model-table-import/filters';

  Vue.use(Upload);
  @Component({
    name: "dataimport",
    filters: {
      // 根据不同大小显示 KB/MB
      filterFileSize: filters.fileSize,
    },
    components: {
      AButton: Button,
      AProgress: Progress,
      DataInfo,
      Upload,
    },
  })
  export default class DataImport extends Vue {
    @Prop() sheetParams!: any;

    @Prop()
    sheet!: FormSheet;

    @Inject()
    isPreview!: boolean;

    fileList = [];

    file: any = {};

    isUploading: boolean = false;

    hasError: boolean = false;

    isHover = false;
    upLoadAccept: string =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    progress = 10;
    timer: any = null;

    get progressStatus() {
      if (this.progress !== 100) {
        return 'active';
      }
      return 'success';
    }

    /**
     * 判断上传的文件是否excel文件
     */
    beforeUpload(file: any) {
      return new Promise((resolve, reject) => {
        const suffixs = ["xlsx"];
        const suffix = this.getSuffix(file.name, false);
        if (this.fileList.length > 0) {
          this.fileList = this.fileList.slice(-1);
          this.$message.warning(this.$t('cloudpivot.list.pc.ImportTips11') as string);
          return reject(false);
        }
        if (suffixs.indexOf(suffix) > -1) {
          this.getSuffix(file.name, true);
          return resolve(true);
        } else {
          return reject(false);
        }
      })
    }

    getSuffix(fileName: string, showLoading: boolean) {
      const index = fileName.lastIndexOf(".");
      const suffix = fileName.substring(index + 1);
      if (suffix && showLoading) {
        this.isUploading = true;
        this.imitateProgress();
      }
      return suffix;
    }

    // 静态上传动画
    imitateProgress() {
      // const timer: any = null;
      // const vm: any = this;
      this.timer = setInterval(() => {
        this.progress += 10;
        if (this.progress === 90 && !this.file) {
          this.progress = 80;
        }
        if (this.progress === 100 && this.file) {
          clearInterval(this.timer);
          this.$emit('uploadComplete', true);
        }
      }, 100);
    }

    handleChange(info: any) {
      this.file = info.file;
      if (info.file.status !== "uploading") {
        this.fileList = info.fileList;
      }
      if (info.file.status === "done") {
        this.$emit("change", true);
        this.$emit("setFileName", info.file.response);
      } else if (info.file.status === "error") {
        this.isUploading = false;
        this.hasError = true;
      } else if (info.file.status === "removed") {
        //清除临时文件
        Application.deleteTemporaryFile({fileName: info.file.name});
        this.$emit("change", false);
      }
    }

    deleteFile() {
      this.file = {};
      this.progress = 10;
      this.isUploading = false;
      this.fileList = [];
      clearInterval(this.timer);//清除临时文件
      Application.deleteTemporaryFile({fileName: this.file.name});
      this.$emit('uploadComplete', false);
      this.$emit("change", false);
    }

    remove() {
      this.fileList = [];
      this.$emit("change", false);
    }

    get disabled() {
      return this.fileList.length > 0;
    }

    get header() {
      const token = localStorage.getItem("token");
      return {
        Authorization: `Bearer ${token}`,
      };
    }

    get uploadUrl() {
      return UploadControl.service.getListUploadUrl();
    }

    exportTemplate() {
      if (this.isPreview) {
        return this.$message.warning("预览不可下载");
      }
      let params: any = JSON.parse(JSON.stringify(this.sheetParams));
      //处理当子表嵌套在tab中的情况
      if (this.sheet.path) {
        let arr: Array<string> = [];
        this.sheet.path.forEach((p: string, i: number) => {
          if (i % 2 === 0) {
            arr.push(p);
          }
        });
        params.subSchemaCode = arr.join(".");
      }
      formApi.exportTemplate(params).then((res: any) => {
        if (res.errcode === 0) {
          this.exportErrorResult(res.data);
        }
      });
    }

    async exportErrorResult(file: string) {
      const res = await Application.exportErrorResult(file);
      if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
        this.$message.error(
          this.$t("cloudpivot.list.pc.DownloadFailed") as string
        );
      } else {
        const blob = new Blob([res], {type: "application/vnd.ms-excel"});

        let sheetName = this.sheet.options.name_i18n
          ? this.sheet.options.name_i18n[this.$i18n.locale]
          : "";
        if (!sheetName) {
          sheetName = this.sheet.options.name;
        }
        const fileName =
          sheetName +
          this.$t("cloudpivot.form.renderer.importFile").toString() +
          utils.DateHandle.dateFormat(new Date(), "YYYYMMDDHHmmss") +
          ".xlsx";

        //清除临时文件
        Application.deleteTemporaryFile({fileName: file});

        this.downloadFile(blob, fileName);
      }
    }

    downloadFile(blob: any, fileName: string) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        const a = document.createElement("a");
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
  .ant-modal-header {
    border-bottom: none;
  }
  
  .ant-modal-footer {
    border-top: none;
  }
  
  .data-import {
    height: 222px;
    
    .data-import__tip {
      margin-bottom: 20px;
      line-height: @line-height-7;
      font-size: @font-size-14;
      color: rgba(0, 0, 0, 0.45);
      
      a {
        color: @primary-color;
      }
    }
    
    .data-import__content {
      overflow: hidden;
      
      .content--left {
        padding-top: 5px;
        width: 84px;
        color: rgba(0, 0, 0, 0.65);
      }
      
      .content--right {
        padding-top: 2px;
        width: 410px;
        float: left;
        margin-left: 100px;
        margin-top: -26px;
        
        .upload-area {
          width: 180px;
        }
        
        /deep/ .ant-upload-btn {
          padding: 5px 0;
        }
        
        /deep/ .ant-upload-list {
          width: 410px;
        }
        
        .upload-note {
          margin-top: 4px;
          line-height: @line-height-7;
          font-size: @font-size-12;
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }
  }
  
  .import-input {
    margin-bottom: 20px;
    
    .import-input-progress {
      .success-import {
        color: #52C41A;
        font-size: 48px;
      }
    }
    
    &-upload {
      /deep/ .ant-upload-drag {
        background: #fff;
        
        .ant-upload-btn {
          padding: 0 !important;
        }
      }
      
      /deep/ .ant-upload-list-item {
        display: none;
      }
      
      &.hover {
        /deep/ .ant-upload-drag {
          background: #f0f7ff;
        }
        
        /deep/ .import-input-upload-icon {
          color: @primary-color !important;
          
          & > p {
            color: @primary-color;
          }
          
          & > span {
            color: @primary-color;
          }
        }
      }
      
      /deep/ .import-input-upload-tips {
        padding: 15px 0 27px 0;
        text-align: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        line-height: 24px;
        max-width: 350px;
        margin: 0 auto;
        text-align: left;
      }
      
      /deep/ .import-input-upload-icon {
        padding-top: 50px;
        
        & > .icon {
          font-size: 64px;
          color: #E2E2E2;
        }
        
        & > p {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
          line-height: 22px;
          /*margin-top: 10px;*/
        }
      }
    }
    
    &-progress {
      border: 1px dashed rgba(0, 0, 0, 0.25);
      border-radius: 4px;
      display: flex;
      align-items: center;
      text-align: center;
      
      & > div {
        margin: 0 auto;
        width: 400px;
        
        p {
          margin-top: 23px;
          
          .icon {
            color: rgba(0, 0, 0, 0.45);
            margin-left: 8px;
            cursor: pointer;
          }
        }
      }
      
      height: 282px;
    }
    
    &-cover {
      padding-top: 24px;
      
      .ant-select {
        width: 298px;
      }
    }
  }
</style>
