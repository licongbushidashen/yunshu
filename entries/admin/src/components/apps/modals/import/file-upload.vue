<template>
  <div class="data-upload">
    <div class="folders">
      <div class="upload-left">{{ $t('languages.Apps.Catalogues') }}:</div>
      <div class="upload-right">
        <a-select
          style="width: 100%"
          v-model="folderId"
          @change="handleFolderChange"
        >
          <a-select-option
            v-for="(floder, index) in tree"
            v-model="floder.id"
            :key="index"
          >{{ getLangName(floder) }}</a-select-option>
        </a-select>
      </div>
      <div class="clearfix"></div>
    </div>
    <div  class="folders">
      <div class="upload-left">{{ $t('languages.Apps.UploadLocalFile') }}:</div>
      <div class="upload-right">
        <div class="upload-dragger">
          <a-upload-dragger
            :multiple="false"
            :disabled="disabled"
            :accept="accept"
            :action="action"
            :headers="header"
            :beforeUpload="beforeUpload"
            @change="handleChange"
            @remove="removeFile"
          >
            <div class="tip">
              <a-icon type="upload" />
              {{ $t('languages.Apps.ClickOrDragFile') }}
            </div>
          </a-upload-dragger>
          <div class="upload-tip">{{ $t('languages.Apps.SupportXMLFile') }}</div>
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

import { Upload } from '@h3/antd-vue';

import { listApi as Application } from '@cloudpivot/api';

import { LanguageTransform } from '@/utils';

const MenuModule = namespace('Apps/AppItem');

@Component({
  name: 'DataUpload',
  components: {
    AUpload: Upload
  }
})

export default class DataUpload extends Vue {
  @MenuModule.State('floders') floders: any;

  @MenuModule.State('menuId') menuId: any;

  @Prop() accept!: any;

  @Prop() action!: any;

  @Prop() clearFileList!: string;

  @Prop() defaultFolder!: string;

  fileList:Array<any> = []; // 文件列表

  folderId:string = '';


  mounted() {
    this.folderId = this.menuId;
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

  get tree(){
    return this.allGroup(this.floders);
  }

  allGroup(res: any) {
    let retData = [] as any;
    let _helper = (data: any) => {
      if (!data) return;
      data.forEach((item: any) => {
        retData.push(item);
        if (Array.isArray(item.children)) {
          _helper(item.children);
        }
      });
    };
    _helper(res);
    return retData;
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
  removeFile(file:any) {
    this.fileList = [];
    this.$emit('setFileName', '');
  }

  /**
   * 文件上传前校验文件类型
   */
  beforeUpload(file:any) {
    const types = this.accept.split(',');
    const fileType = file.name.substring(file.name.lastIndexOf('.'));
    return types.indexOf(fileType) > -1;
  }

  /**
   * 选择文件夹
   */
  handleFolderChange(folder:string) {
    console.log(folder, 'folder');
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
      // console.log(v, 'this.v');
      // console.log(this.menuId, 'this.menuId');
      if (this.menuId) {
        this.folderId = this.menuId;
      } else {
        this.folderId = v;
      }
      this.$emit('setFolderId', this.folderId);
    });
  }
}
</script>

<style lang="less">
  .data-upload {
    & .folders {
      margin-top:10px;
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
          background:rgba(255,255,255,1);
          border:1px solid rgba(217,217,217,1);
        }
        & .ant-upload.ant-upload-drag .ant-upload-drag-container div {
          text-align: center;
          height: 32px;
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
      color: rgba(0, 0, 0, .45);
    }

    .clearfix {
      clear: both;
    }
  }
</style>
