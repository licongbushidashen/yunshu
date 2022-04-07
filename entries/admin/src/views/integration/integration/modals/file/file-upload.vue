<template>
  <div class="data-upload">
    <div>
      <div class="upload-left">{{ $t("languages.Apps.UploadLocalFile") }}:</div>
      <div class="upload-right">
        <div class="upload-dragger">
          <a-upload-dragger
            :multiple="false"
            :file-list="fileList"
            :accept="accept"
            :action="action"
            :headers="header"
            :beforeUpload="beforeUpload"
            @change="handleChange"
            :remove="removeFile">
            <div class="tip">
              <a-icon type="upload" />
              {{ $t("languages.Apps.ClickOrDragFile") }}
            </div>
          </a-upload-dragger>
          <div class="upload-tip">支持.zip格式，文件大小不限</div>
        </div>
      </div>
      <div class="clearfix"></div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch
} from 'vue-property-decorator';

import {
  State, Action, Mutation, namespace
} from 'vuex-class';

import { Upload, Icon } from '@h3/antd-vue';

import { listApi as Application } from '@cloudpivot/api';

import { LanguageTransform } from '@/utils';

const MenuModule = namespace('Apps/AppItem');

@Component({
  name: 'DataUpload',
  components: {
    AUpload: Upload,
    AIcon: Icon
  }
})

export default class DataUpload extends Vue {
  @MenuModule.State('floders') floders: any;

  @Prop() accept!: any;

  @Prop() action!: any;

  @Prop() clearFileList!: string;

  @Prop() defaultFolder!: string;

  @Prop() importType !: string;

  fileList:Array<any> = []; // 文件列表

  folderId:string = '';


  mounted() {
    this.folderId = this.defaultFolder;
  }

  destroyed () {
    console.log('upload destoyed');
  }

  get disabled() {
    return this.fileList.length > 0;
  }

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`
    };
  }


  handleChange({ file, fileList }:any) {
    if (file.status !== 'uploading') {
      this.fileList = fileList;
    }
    // 上传完成逻辑
    if (file.status === 'done') {
      const resName:string = file.response;
      this.$emit('setFileName', resName); // 返回文件名
    }
    
    if (file.status === 'removed') {
      Application.deleteTemporaryFile({fileName: file.response});
      this.$emit('setFileName', '');
    }
  }

  // 删除文件
  async removeFile(file:any) {
    this.fileList = [];
  }

  /**
   * 文件上传前校验文件类型
   */
  beforeUpload(file:any) {
    this.fileList = [...this.fileList, file];
    this.fileList = this.fileList.slice(-1);
    const isZip = file.type.includes("zip");
      if (!isZip) {
       this.fileList.pop();
       this.$message.error("仅支持上传zip格式的文件");
       return false;
    }
    const types = this.accept.split(',');
    const fileType = file.name.substring(file.name.lastIndexOf('.'));
    return types.indexOf(fileType) > -1;
  }

  /**
   * 选择文件夹
   */
  handleFolderChange(folder:string) {
    this.$emit('setFolderId', folder);
  }

  /**
   * 获取当前语言对应展示名
   */
  getLangName(item:any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }


  @Watch('clearFileList')
  onClearFileListChange(v:string) {
    if (!v) return;
    if (v === 'clear') {
      this.$nextTick(() => {
        this.fileList.splice(0, 1);
      });
    }
  }

  @Watch('defaultFolder')
  onDefaultFolderChange(v:string) {
    this.$nextTick(() => {
      if (v) this.folderId = v;
    });
  }
}
</script>

<style lang="less">
.data-upload {
  & .folders {
    margin-bottom: 20px;
  }
  & .upload-left {
    width: 90px;
    float: left;
    vertical-align: middle;
    height: 34px;
    line-height: 34px;
  }
  & .upload-right {
    float: left;
    vertical-align: middle;
    margin-left: 16px;
    & .ant-upload-list {
      margin-top: 20px;
    }
    & .upload-dragger {
      display: block;
      position: relative;
      & .ant-upload.ant-upload-drag {
        background: rgba(255, 255, 255, 1);
        border: 1px solid rgba(217, 217, 217, 1);
      }
      & .ant-upload.ant-upload-drag .ant-upload-drag-container div {
        text-align: center;
        line-height: 32px;
        color: rgba(0, 0, 0, 0.65);
      }
      & .ant-upload.ant-upload-drag .ant-upload-btn {
        padding: 0;
      }
    }
  }
  & .upload-tip {
    position: absolute;
    top: 38px;
    left: 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  .clearfix {
    clear: both;
  }
}
</style>
