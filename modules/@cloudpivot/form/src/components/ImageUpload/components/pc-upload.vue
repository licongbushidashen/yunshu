<template>
  <div
    class="upload-control-component"
    :class="{ 'upload-image': isImage, 'upload-files': !isImage }"
  >
    <!-- batch-download-o -->

    <!-- <span class="icon aufontAll h-icon-all-aliwangwang"></span> -->
    <template v-if="showBatchDownload && !!isReadonly && fileList.length > 1">
      <span @click="downloadAll" class="all-download icon aufontAll h-icon-all-batch-download-o"></span>
      <a-button
        @click="downloadAll"
        class="download"
        icon="batch-download-o"
      >{{ $t('cloudpivot.form.renderer.downloadAll') }}</a-button>
    </template>
    <div class="message" v-if="!isReadonly && controlOpts.onlyShoot">请在手机端拍照上传</div>

    <a-upload
      :action="uploadUrl"
      :beforeUpload="beforeUpload"
      :multiple="multi"
      :defaultFileList="fileList"
      :fileList="uploadFileList"
      :listType="listType"
      :headers="headers"
      :remove="onRemovedImg"
      @preview="handlePreview"
      @change="onChange"
      :uploadList="isImage"
      :class="{
        'unwritable' : isReadonly,
        'has-no-parent': !control.parentKey,
        'has-parent': control.parentKey
      }"
    >
      <template v-if="canUpload && !isReadonly && !controlOpts.onlyShoot">
        <div v-if="isImage && !control.parentKey">
          <a-icon type="plus" />
          <div class="ant-upload-text">{{ text }}</div>
        </div>
        <template v-else>
          <a-button class="picUpload">
            <a-icon type="upload" />
            <!-- 点击或拖拽{{text}}上传 -->
            {{ $t('cloudpivot.form.renderer.tip.clickAndDropUpload') }}
          </a-button>
          <!--
          <a-button
            v-if="showBatchDownload && fileList.length > 1 && canDounload"
            @click="downloadAll"
            class="download right-download"
            icon="download"
          >{{ $t('cloudpivot.form.renderer.downloadAll') }}</a-button>-->
          <div
            class="all-download-wrap"
            v-if="showBatchDownload && fileList.length > 1 && canDounload"
            @click.stop="downloadAll"
          >
            <span
              @click.stop="downloadAll"
              class="all-download icon aufontAll h-icon-all-batch-download-o"
            ></span>
            <span>{{ $t('cloudpivot.form.renderer.downloadAll') }}</span>
            <!-- <a-button
              @click="downloadAll"
              class="download"
            >{{ $t('cloudpivot.form.renderer.downloadAll') }}</a-button>-->
          </div>
        </template>
      </template>
      <file-list
        v-if="!isImage"
        :list="fileList"
        :eventList="eventList"
        :downUrls="ctrl.value"
        :showRm="isReadonly"
        @rm-file="rmFile"
      />
    </a-upload>

    <!-- <a-button v-if="showBatchDownload && fileList.length > 1"
      @click="downloadAll"
      class="download" icon="download">
      {{ $t('cloudpivot.form.renderer.downloadAll') }}
    </a-button>-->

    <!-- <a-modal
      :visible="previewVisible"
      :footer="null"
      @cancel="handleCancel"
      :maskClosable="false"
      :keyboard="false"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal> -->

    <img-preview v-if="previewVisible" :imgList="uploadFileList" :seletedIndex="previewIndex" @close="previewVisible = false" />

  </div>
</template>

<script lang="ts">
import { Subscription } from "rxjs";

import { Vue, Prop, Component, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  UploadLimitType,
  FormControlType,
} from "@cloudpivot/form/schema";

import { FileUploadControl } from "@cloudpivot/form/src/common/controls/file-upload-control";
import { UploadStatus } from "@cloudpivot/form/src/common/controls/upload-control";
import PCImagePreview from "@cloudpivot/form/src/common/components/pc-image-preview.vue";
import { getFileUrl } from "@cloudpivot/common/src/utils/utils";

import FileList from "./file-list.vue";
import Compressor from 'compressorjs';
import {
  ControlPropertyChange,
  ControlCommand,
  PropertyNames,
  SelectControl,
} from "h3-forms";

import { Icon, Button, Upload, Modal } from "@h3/antd-vue";

@Component({
  name: "pc-upload",
  components: {
    AIcon: Icon,
    AButton: Button,
    AUpload: Upload,
    AModal: Modal,
    ImgPreview: PCImagePreview,
    FileList,
  },
})
export default class PcUpload extends FileUploadControl {
  previewVisible = false;

  previewIndex = 0;

  fileList: any[] = [];
  eventList: any[] = [];
  commandSubscription?: Subscription;
  uploadFileList: any[] = [];

  get listType() {
    // 上传图片为 picture-card 样式, 上传文件显示为 text 样式
    return this.isImage ? "picture-card" : "text";
  }

  get showBatchDownload() {
    return this.canBatchDownload && this.fileList.length > 0;
  }

  get canDounload() {
    const fileDown: any[] = this.fileList.filter((f: any) => {
      return f.status === "done";
    });
    if (fileDown.length === this.fileList.length) {
      return true;
    } else {
      return false;
    }
  }

  get isReadonly() {
    if (this.ctrl) {
      return this.readonly;
    }
    return true;
  }

  unsubscribe() {
    if (this.commandSubscription) {
      this.commandSubscription.unsubscribe();
    }
  }

  setControl() {
    if (this.ctrl && this.ctrl.value) {
      this.toFilelist(this.ctrl.value);
    } else {
      // this.fileList = [];
      this.uploadFileList = this.fileList = [];
    }

    this.unsubscribe();

    this.listenCommand();
  }

  handleValueChange(value: any, changeInfo: any): void {
    // 图片有两种情况,
    // 上传图片和被动赋值.
    // 如果是主动上传图片则不应该 调用this.toFilelist.
    // 如果是赋值则可以调用this.toFilelist. 目前看来每次更新赋值前 value会被设置null.
    if (!value) {
      this.toFilelist(value);
    } else if (value.length > 0) {
      this.toFilelist(value);
    } else if (
      value.length &&
      (!this.uploadFileList || this.uploadFileList.length === 0)
    ) {
      this.toFilelist(value);
    } else if (value.length === this.uploadFileList.length) {
    }
  }

  toFilelist(val: any[] | null) {
    if (!val) {
      this.uploadFileList = this.fileList = [];
      return;
    }

    //说明此时的数据还未经过转换
    if (Array.isArray(val) && val.length > 0 && val[0].mimeType) {
      val = this.convertFileData(val);
      if (!val) return;
    }

    this.uploadFileList = this.fileList = val.map((y: any) => {
      let x: any = "";
      if (!y.uid && y.response && y.response.data) {
        x = y.response.data;
      } else {
        x = y;
      }
      if (x.response && x.response.data) {
        x.url = this.getDownloadUrl(x.response.data);
      }
      let mineType: any = null;
      if (x.response && x.response.data) {
        mineType = x.response.data.mimeType;
        if (mineType) {
          let typeArr = mineType.split("/");
          if (Array.isArray(typeArr) && typeArr.length === 2) {
            mineType = typeArr[1];
          }
        }
      }
      if (
        mineType &&
        !["jpg", "jpeg", "png", "gif", "bmp", "svg", "tif"].includes(mineType)
      ) {
        x.status = "fileToImg";
      }
      let status = UploadStatus.Uploading;
      switch (x.status) {
        case "removed":
          status = UploadStatus.Delete;
          break;
        case "fileToImg":
          status = UploadStatus.FileToImg;
          break;
        case "done":
          status = UploadStatus.Done;
          break;
        case "error":
          status = UploadStatus.Error;
          break;
        case "uploading":
          status = UploadStatus.Uploading;
          break;
        default:
          status = x.status;
          break;
      }

      x.status = status;
      return x;
    });

    this.fileList.map((f) => {
      if (f.status === UploadStatus.FileToImg) {
        this.rmFile(f);
      }
    });
    this.fileList = this.fileList.filter(
      (f) => f.status !== UploadStatus.FileToImg
    );
    this.uploadFileList = this.fileList;
  }

  listenCommand() {
    const _this = this;
    this.commandSubscription = this.ctrl.commander.subscribe(
      (cmd: ControlCommand) => {
        switch (cmd.name) {
          case "clear":
            _this.fileList = [];
            _this.ctrl.value = null;
            break;
          default:
            break;
        }
      }
    );
  }

  showError(msg: string) {
    this.$message.error(msg);
  }

  beforeUpload(file:any) {
    if (!this.checkFileType(file.name, this.showError)) {
      return false;
    }

    if (!this.checkFileSize(file, this.showError)) {
      return false;
    }

    if (!this.checkImageNumber(this.showError)) {
      return false;
    }

    if (!this.checkImageNameLength(file.name, this.showError)) {
      return false;
    }

    file.uploadTime = new Date().getTime();
    // file.thumbUrl = getFileUrl(file);
    let userInfo: any = window.sessionStorage.getItem("user");
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
    } else {
      userInfo = { name: "" };
    }
    file.uploadName = window.sessionStorage.getItem("uploadName")
        || userInfo.name;
    if (this.controlOpts.compressible) {
      const quality:number = this.controlOpts.imageQuality;
      return new Promise((resolve, reject) => {
        console.log(file.size / 1024/1024, 'file---')
        // this.transformFile(file, quality).then((res: any) => {
        this.compressFile(file, quality).then((res: any) => {
          res.uid = file.uid;
          resolve(res);
        }).catch(error => {
          reject(error)
        })
      })
    } else {
      return true;
    }
  }

  timer: any = null
  onChange(info: { file: any; fileList: any[]; event: any }): void {
    clearTimeout(this.timer)
    let fileList = [...info.fileList];
    if (this.max > -1 && (fileList.length > this.max)) {
      fileList = fileList.slice(0, this.max);
    }
    if (this.isReadonly) {
      return;
    }
    this.uploadFileList = fileList.filter(
      (f) => f.status && !(f.status === UploadStatus.Delete || f.status === "removed")
    );
    //保存文件状态
    let { file } = info;
    // 保存文件上传进度
    this.eventList = this.uploadFileList.map((f: any) => {
      if (f.response && f.response.errcode === 50000) {
        f.status = UploadStatus.Error
      }
      return f;
    });
    const files = this.uploadFileList
      .map((f) => {
        // 有服务errorcode = 50000 但是上传状态返回为done的情况 估计是上传接口先上传到服务器  再通过ftp还是oss转移到其他地方
        let serverResponse = f.response;
        if (serverResponse) {
          let errorCode = serverResponse.errcode;
          if (errorCode === 50000) {
            return {
              uid: f.uid,
              name: f.name,
              size: f.size,
              type: f.type,
              thumbUrl: f.thumbUrl,
              status: UploadStatus.Error,
              response: f.response,
              uploadTime: f.uploadTime,
              uploadName: f.uploadName
            };
          }
        }

        let status = UploadStatus.Uploading;
        switch (f.status) {
          case "removed":
            status = UploadStatus.Delete;
            break;
          case "fileToImg":
            status = UploadStatus.FileToImg;
            break;
          case "done":
            status = UploadStatus.Done;
            break;
          case "error":
            status = UploadStatus.Error;
            break;
          case "uploading":
            status = UploadStatus.Uploading;
            break;
          default:
            status = f.status;
            break;
        }
        return {
          uid: f.uid,
          name: f.name,
          size: f.size,
          type: f.type,
          thumbUrl: status === UploadStatus.Done ?  f.thumbUrl : '',
          status: status,
          response: f.response,
          uploadTime: f.uploadTime,
          uploadName: f.uploadName,
        };
      });
    this.timer = setTimeout(() => {
      super.onFilesChange(files);
    }, 100)
  }

  transformFile(file:any, imageQuality:any) {
    const that = this;
    let files:any;
    return new Promise((resolve:any) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img:any = new Image();
        img.src = reader.result;
        img.onload = () => {
          let base64 = that.compress(img, file['type'], imageQuality);
          files = that.dataURLtoFile(base64, file.name) // 如果后台接收类型为base64的话这一步可以省略
          // console.log(files, 'files3---')
          console.log(files.size / 1024/1024, 'files---')
          resolve(files)
        };
      };
    });
  }

  compressFile(file:any, imageQuality:number) {
    return new Promise((resolve:any) => {
      new Compressor(file, {
        quality: imageQuality / 100,
        success: (result:any) => {
          // console.log(result, 'result')
          console.log(result.size / 1024/1024, 'result---')
          let newFile = new File([result], file.name, { type: file.type })
          resolve(newFile);
        },
        error: (err:any) => {
          resolve({});
          console.log(err.message);
        },
      });
    })
  }
  /*压缩
  * 绘制canvas
  * 判断 是否大于100万像素 通过瓦片绘制
  * */
  compress(img:any, type:string, imageQuality:number) {
    let canvas:any = document.createElement("canvas");
    let ctx:any = canvas.getContext('2d');
    //瓦片canvas
    let tCanvas:any = document.createElement("canvas");
    let tCtx:any = tCanvas.getContext("2d");
    let width = img.width;
    let height = img.height;
    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
    let ratio:any;
    if ((ratio = width * height / 4000000) > 1) {
      console.log("大于400万像素")
      ratio = Math.sqrt(ratio);
      width /= ratio;
      height /= ratio;
    } else {
      ratio = 1;
    }
    canvas.width = width;
    canvas.height = height;
    //铺底色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //如果图片像素大于100万则使用瓦片绘制
    let count;
    if ((count = width * height / 1000000) > 1) {
      console.log("超过100W像素");
      count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
      // 计算每块瓦片的宽和高
      let nw = ~~(width / count);
      let nh = ~~(height / count);
      tCanvas.width = nw;
      tCanvas.height = nh;
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          tCtx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
          ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
        }
      }
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }
    //进行最小压缩
    let MinData:any = canvas.toDataURL(type, imageQuality / 100);
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
    return MinData;
  }

  // base64转码（压缩完成后的图片为base64编码，这个方法可以将base64编码转回file文件）
  dataURLtoFile (dataurl:any, filename:string) {
    let arr:any = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
  }

  /**
   * @des 删除文件
   */
  rmFile(file: any) {
    this.removedFile(file);
  }
  onRemovedImg(file: any) {
    super.removedFile(file);
  }

  handleCancel() {
    this.previewVisible = false;
  }

  handlePreview(file: any) {
    if (!this.isImage) {
      this.download(file.response.data);
      return;
    }
    this.previewIndex = this.uploadFileList.findIndex(item => item.uid === file.uid);
    this.previewVisible = true;
  }

  downloadAll() {
    this.downloadBatch();
  }

  destroyed() {
    super.destroyed();

    this.unsubscribe();
  }

  created() {
    this.init();
  }
}
</script>

<style lang="less" scoped>
/deep/.unwritable {
  .anticon-delete {
    display: none;
  }
  // .ant-upload-list:before {
  // display: none;
  // }
}
/deep/.ant-upload-select-text {
  height: 32px;
  width: 100%;
}
button.download {
  border: 0;
  padding: 0;
  color: @primary-color;
}
button.download.right-download {
  margin-left: 25px;
}
.right-download {
  margin-left: 25px;
}

.message {
  margin-bottom: 0.5em;
}
.all-download {
  color: @primary-color;
  cursor: pointer;
  font-size: 14px;
}
.all-download-wrap {
  display: inline-block;
  margin-left: 25px;
  color: @primary-color;
  cursor: pointer;
}
</style>

<style lang="less" scoped>
// 图片上传样式修改
.upload-control-component.upload-image {
  // 子表外的
  .has-no-parent {
    position: relative;
    display: block;
    /deep/.ant-upload-list {
      &:before {
        width: 104px;
        height: 104px;
        float: left;
        display: block;
        margin: 0 8px 8px 0;
      }

      /deep/.ant-upload-list-item-info > span {
        display: block;
        width: 100%;
        height: 100%;
        a {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
          left: 0;
          top: 0;
          img {
            min-width: 100%;
            max-width: 200%;
            width: auto;
            height: auto;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }
    }
    /deep/.ant-upload.ant-upload-select-picture-card {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  .unwritable {
    /deep/.ant-upload-list {
      &:before {
        display: none;
      }
    }
  }
  // 子表内的
  span.has-parent {
    width: 100% !important;
    display: flex;
    flex-direction: column-reverse;
    /deep/.ant-upload-list-picture-card /deep/.ant-upload-list-item {
      // background: red;
      width: 55px;
      height: 55px;
      border-radius: 4px;
      overflow: hidden;
      padding: 0 !important;
      margin: 8px 8px 0 0 !important;
      /deep/.ant-upload-list-item-info {
        padding-left: 0;
        & > span {
          height: 100%;
          /deep/.ant-upload-list-item-thumbnail {
            position: relative;
            left: 0;
            top: 0;
            img {
              display: block;
              min-width: 100%;
              max-width: 200%;
              height: auto;
              width: auto;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }
      }
    }
    /deep/.ant-upload.ant-upload-select-picture-card {
      //  /deep/.ant-upload-list-item-info{
      //   padding-left: 0;
      //  }
      width: 100%;
      border: none;
      margin: 0;
      // height: 32px;
      background-color: #fff;
      overflow: hidden;
      /deep/.ant-upload {
        padding: 0;
        width: 100%;
        button {
          width: 100%;
          padding: 0 10px;
        }
        // button.download {
        //     width: 50%;
        // }
        .all-download-wrap {
          margin-left: 0;
          display: block;
          margin-top: 8px;
          color: @primary-color;
          cursor: pointer;
          text-align: left;
          .all-download {
            // margin-left: 4px;
            margin-right: 4px;
          }
          button.download {
            width: 65px;
          }
        }
      }
    }
  }
}
// 附件上传样式修改
.upload-control-component.upload-files {
  /deep/.ant-upload-list {
    display: none;
  }
  /deep/.ant-upload-list-item {
    // background: red;
    /deep/.ant-upload-list-item-info {
      padding-left: 0 !important;
    }
  }
  span.has-parent {
    width: 100%;
    /deep/.ant-upload.ant-upload-select {
      width: 100%;
      button {
        width: 100%;
        padding: 0 10px;
      }
      .all-download-wrap {
        margin-left: 0;
        display: block;
        margin-top: 8px;
        color: @primary-color;
        cursor: pointer;
        .all-download {
          // margin-left: 4px;
          margin-right: 4px;
        }
        button.download {
          width: 65px;
        }
      }
      // .ant-upload-list-item-info{
      //   padding-left: 0;
      // }
    }
  }
}

/deep/.ant-upload-list-item-name {
  color: @light-color-1;

  &:hover {
    color: @primary-color;
  }
}

/deep/.picUpload{
  padding: 0 10px;
}
/deep/ span.ant-upload{
  padding: 0 !important;
}
</style>
