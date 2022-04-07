<template>
  <div class="data-import">
    <p class="data-import__tip">
      {{ $t('languages.Modal.ImportTips1') }}<a href="javascript:;" @click="exportTemplate">下载{{ importTypeName }}示例文件</a>
    </p>
  
    <section class="data-import__content">
      <div class="content--left">
        {{ $t('languages.Modal.ImportLocalFaile') }}
      </div>
      <div class="content--right">
        <div class="upload-area">
          <a-upload-dragger
            ref="fileUpload"
            name="file"
            :multiple="false"
            :disabled="disabled"
            :action="uploadUrl"
            accept=".xlsx"
            :headers="header"
            :beforeUpload="beforeUpload"
            @change="handleChange"
            :remove="remove"
          >
            <div>
              {{ $t('languages.Modal.ClickToImport') }}
            </div>
          </a-upload-dragger>
        </div>
        <div class="upload-note">
          支持xlsx格式，文件大小不限，一次最多能导入10000条
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  State, namespace
} from 'vuex-class';
import {
  Button, Upload, Progress, Select
} from '@h3/antd-vue';

import DataInfo from './data-info.vue';
import { listApi as Application } from '@cloudpivot/api';

import { renderer } from '@cloudpivot/form';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

import OrgApi from '@/apis/organization';

enum ImportType {
  department = "department",
  person = "person"
}

Vue.use(Upload);
@Component({
  name: 'dataimport',
  components: {
    AButton: Button,
    AProgress: Progress,
    ASelect: Select,
    ASelectOption: Select.Option,
    DataInfo,
    Upload
  }
})
export default class DataImport extends Vue {
/*   @Prop({
    type: String,
    required: true,
  }) schemaCode!: string; */

  @Prop({
    type: String,
  }) importType!: string;

  percent: number = 0;

  hasError: boolean = false;

  isUploading:boolean = false;

  fileName: string = '';

  fileSize: number = 0;

  file: any = null;

  fileList =[];

  actionUrl:string = '';

  get importTypeName() {
    if(this.importType === 'department'){
      return "部门"
    }else{
       return "人员"
    }
  }

  get uploadUrl() {
    return OrgApi.departmentUploadUrl;
  }

  get disabled() {
    return this.fileList.length > 0;
  }

  getSuffix(fileName:string) {
    const index = fileName.lastIndexOf('.');
    const suffix = fileName.substring(index + 1);
    return suffix;
  }

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`
    };
  }



  async exportTemplate() {
    let res:any;
    if (this.importType === ImportType.department) {
      res = await OrgApi.exportTemplate();
    } else {
      res = await OrgApi.exportPersonTemplate();
    }
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(this.$t('cloudpivot.list.pc.DownloadFailed') as string);
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });

      const fileName =  `${this.importType === ImportType.department ? '部门导入' : '人员导入'}示例文件.xlsx`;

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

  /**
   * 判断上传的文件是否excel文件
   */
  beforeUpload(file: any) {
    const suffixs = ['xlsx'];
    const suffix = this.getSuffix(file.name);
    return suffixs.indexOf(suffix) > -1;
  }

  handleChange(info:any) {

    this.file = info.file;
    this.isUploading = true;
    if (info.file.status !== 'uploading') {
      this.fileList = info.fileList;
      // console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      this.isUploading = false;
      this.$emit('change', true);
      this.$emit('setFileName', info.file.response);
    } else if (info.file.status === 'error') {
      this.isUploading = false;
      this.hasError = true;
      this.$emit('change', false);

    }
  }

 

  remove(file:any) {
    console.log(file, 'dsd')
    this.fileList = [];
    this.$emit('change', false);
    this.$emit('remove', file.response)
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
  min-height: 247px;
  max-height: 50vh;
  overflow-y: auto;
  .data-import__tip {
    margin-bottom: 20px;
    line-height: @line-height-7;
    font-size: @font-size-14;
    color: rgba(0,0,0,0.45);
    a {
      color: @primary-color;
    }
  }
  .data-import__content {
    display: flex;
    align-items: flex-start;
    overflow: hidden;
    margin-bottom: 10px;
    .content--left {
      flex: none;
      width: 84px;
      margin-right: 16px;
      line-height: 32px;
      // padding-top: 5px;
      color: rgba(0,0,0,0.65);
    }
    .content--right {
      flex: 1 1 410px;
      width: 410px;
      // float:left;
      // margin-left: 100px;
      // margin-top: -26px;
      .upload-area {
        width: 180px;
      }
      .upload-select {
        width: 400px;
        .upload-select-area{
          width: 100%;
        }
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
        color: rgba(0,0,0,0.45);
      }
      .upload-top{
        margin-top: 0;
        line-height: @line-height-7;
        font-size: @font-size-12;
        color: rgba(0,0,0,0.45);
      }
    }
  }
  .import-warn {
    font-size: @font-size-12;
    color: @error-color;
  }
}
</style>
