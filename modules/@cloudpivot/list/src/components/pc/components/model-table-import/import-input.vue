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
        :beforeUpload="beforeUpload"
        @change="handleChange"
        :multiple="false"
        :action="uploadUrl"
        name="file"
        ref="fileUpload"
        :headers="header"
        @remove="remove"
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
          <p>3、不支持导入流程数据，请仔细核对</p>
          <p>4、数据标题、单据号仅支持覆盖导入</p>
          <p>5、导入数据默认不触发业务规则，若要触发请查看开发者手册</p>
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
        <a-progress size="small" :percent="progress" :status="progressStatus"/>
      </div>
    </div>

    <div class="import-input-cover">
      <a-checkbox @change="changeCheck" v-model="isCover"/>
      <span style="padding: 0 5px">允许覆盖数据，当</span>
      <a-select
        :disabled="!isCover"
        @change="changeSelect"
        allowClear
        v-model="coverCode"
      >
        <a-select-option
          :key="item.code"
          :value="item.code"
          v-for="item in dataList"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
      <span>&nbsp; 相同，则覆盖已有数据</span>
    </div>
  </div>
</template>
<script lang="ts">
  import {Component, Mixins, Prop} from 'vue-property-decorator';
  import {Checkbox, Icon, Progress, Select, Upload,} from '@h3/antd-vue';
  import {namespace} from 'vuex-class';
  import importBase from './import-base';
  import {filters} from './filters';
  import { listApi as Application } from '@cloudpivot/api';
  import { renderer } from '@cloudpivot/form';

  const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

  @Component({
    filters: {
      // 根据不同大小显示 KB/MB
      filterFileSize: filters.fileSize,
    },
    components: {
      ASelect: Select,
      ASelectOption: Select.Option,
      ACheckbox: Checkbox,
      AUploadDragger: Upload.Dragger,
      AProgress: Progress,
      AIcon: Icon,
    },
  })
  export default class ImportInput extends Mixins(importBase) {
    @WorkflowCenterModule.State('dataItemList') dataItemList: any;
    @WorkflowCenterModule.State('applicationPageTitle') applicationPageTitle: any;
    @Prop({
      default: [],
    })
    dataItems!: any[];

    @Prop()
    isFormSheet!: any;

    @Prop({
      type: String,
    }) queryCode!: string;

    isCover = false;

    isHover = false;

    isUploading = false;

    isUploadsuccess = false;

    hasError = false;

    progress = 10;

    file: any = {};

    timer: any = null;

    coverCode: any = '';

    upLoadAccept: string =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    blob = {};

    get schemaCode() {
      const { schemaCode } = this.$route.params;
      return schemaCode;
    }
    get header() {
      const token = localStorage.getItem('token');
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    get uploadUrl() {
      // return `${Application.fileUploadUrl}`;
      return renderer.UploadControl.service.getListUploadUrl();
    }

    get progressStatus() {
      if (this.progress !== 100) {
        return 'active';
      }
      return 'success';
    }

    get dataList() {
      const dataList = this.dataItemList.filter((data: any) => {
        if (!data.defaultProperty && data.propertyType === 0) {
          return true;
        } else if (data.defaultProperty && (data.code === 'name' || data.code === 'sequenceNo')) {
          return true;
        }
        return false;
      });
      return dataList;
    }

    // 是否勾选覆盖
    changeCheck() {
      this.$emit('setImportAble', this.isCover);
    }

    // 是否选择覆盖字段
    changeSelect() {
      this.$emit('setCoverCode', this.coverCode);
    }

    handleChange(info: any) {
      this.file = info.file;
      this.blob = info.file;
      if (info.file.status !== 'uploading') {
        // this.fileList = info.fileList;
      }
      if (info.file.status === 'done') {
        this.$emit('change', true);
        this.blob = info.file.response;
        this.$emit('setFileName', info.file.response);
        this.$emit('uploadComplete', true);
        this.isUploadsuccess = true;
      } else if (info.file.status === 'error') {
        this.isUploading = false;
        this.hasError = true;
        this.$emit('uploadComplete', false);
      } else if(info.file.status === 'removed'){
        //清除临时文件
        Application.deleteTemporaryFile({fileName: info.file.name});
      }
    }

    beforeUpload(file: any) {
      // console.log(file, 'file');
      // const suffixs = ['xlsx'];
      const suffix = this.getSuffix(file.name, false);
      // return false;
      // const isJpgOrPng = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const isLt2M = file.size / 1024 / 1024 < 1000;
      if (!['xlsx'].includes(suffix)) {
        this.$message.error('文件格式不对，仅支持上传.xlsx格式的文件!');
        return false;
      } else if (!isLt2M) {
        this.$message.error('最大不能超过1000M!');
        return isLt2M;
      } else {
        this.getSuffix(file.name, true);
        return true;
      }
      // return suffixs.indexOf(suffix) > -1;
    }

    remove() {
      this.$emit('change', false);
    }

    async exportTemplate() {
      const params = {
        schemaCode: this.schemaCode,
        queryCode: this.queryCode
      };
      const res = await Application.exportTemplate(params);
      if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
        this.$message.error(this.$t('cloudpivot.list.pc.DownloadFailed') as string);
      } else {
        const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
        const date = new Date();
        const mounth = date.getMonth() > 8 ? date.getMonth() + 1:  `0${date.getMonth() + 1}`;
        const days = date.getDate() > 9 ? date.getDate():  `0${date.getDate()}`;
        const hours = date.getHours() > 9 ? date.getHours():  `0${date.getHours()}`;
        const minutes = date.getMinutes() > 9 ? date.getMinutes():  `0${date.getMinutes()}`;
        const seconds = date.getSeconds() > 9 ? date.getSeconds():  `0${date.getSeconds()}`;

        const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
        const fileName = `${this.applicationPageTitle}导入示例${stamp}.xlsx`;

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

    deleteFile() {
      this.file = {};
      this.progress = 10;
      this.isUploading = false;
      clearInterval(this.timer);
      this.$emit('resetUpLoad');
      this.$emit('uploadComplete', false);
    }

    getSuffix(fileName: string, showLoading: boolean) {
      const index = fileName.lastIndexOf('.');
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
        if (this.progress === 90 && !this.isUploadsuccess) {
          this.progress = 80;
        }
        if (this.progress === 100 && this.isUploadsuccess) {
          this.isUploadsuccess = false; 
          clearInterval(this.timer);
        }
      }, 100);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformFile(file: any) {
      return 'Blob';
    }

    getTheData() {
      return {
        isCover: this.isCover,
        coverCode: this.coverCode,
        file: this.blob,
      };
    }
  }
</script>
<style lang="less" scoped>
  .import-input {
    .import-input-progress{
      .success-import{
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
