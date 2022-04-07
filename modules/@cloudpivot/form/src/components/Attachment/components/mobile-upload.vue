

<template>
  <div class="h3-upload" :class="isImage ? 'h3-upload-phone' : ''">
    <h3-upload
      ref="upload"
      :autoPreview="isOpenPreview"
      :continuity="false"
      :title="label"
      :editabled="!readonly"
      :required="ctrl.required"
      :maxSize="limitSize"
      :showErrorToast="false"
      :action="uploadUrl"
      :multiple="multi"
      :listType="listType"
      :data="fileList"
      :headers="headers"
      :isAddWatermark="isAddWatermark"
      :remove="onRemovedImg"
      :beforeUpload="beforeUpload"
      :onChange="onChange"
      :locationInfo="locationInfo"
      :onlyCamera="controlOpts.onlyShoot"
      :compress="controlOpts.compressible"
      :compressionRatio="Number(controlOpts.imageQuality)"
      :labelStyle="styleObj"
      :locale="locale"
      :placehloder="$t('cloudpivot.form.renderer.clickUpload')"
      :tip="controlOpts.tips"
      @preview="handlePreview"
      @uploadError="uploadError"
      :showDownLoad="true"
      @download="filedownload"
    ></h3-upload>

    <h3-dialog v-transfer-dom v-model="showSignsture" class="dialog-demo" hide-on-blur>
      <div class="img-box">
        <iframe :src="filePreviewUrl" frameborder="0" width="100%" height="100%"></iframe>
      </div>
      <div @click="hideSignsture" class="close-bar">
        <span class="h3-close">关闭</span>
      </div>
    </h3-dialog>
  </div>
</template>

<script lang="ts">
import { Subscription } from "rxjs";

import { Vue, Prop, Component, Inject } from "vue-property-decorator";

import * as platform from '@cloudpivot/platform';
import {
  RendererFormControl,
  UploadLimitType,
  FormControlType,
} from "@cloudpivot/form/schema";

import { FileUploadControl } from "@cloudpivot/form/src/common/controls/file-upload-control";
import { FormLocationControl } from "@cloudpivot/form/src/common/controls/form-location-control";
import { UploadFile } from "@cloudpivot/form/src/common/controls/upload-control";
import common from "@cloudpivot/common/mobile";
import { utils } from "@cloudpivot/common";
import { H3Upload, H3Dialog } from "h3-mobile-vue";
import { ControlCommand } from "h3-forms";

const suffix = ".jpg";

@Component({
  name: "upload",
  components: {
    H3Upload,
    H3Dialog,
  },
  directives: {
    TransferDom: common.directives.transferDom,
  },
})
export default class Upload extends FileUploadControl {
  previewVisible = false;

  previewImage = "";

  fileList: any[] = [];

  isAddWatermark: boolean = false;

  locationInfo: string = "";

  commandSubscription?: Subscription;

  changing = false;

  showSignsture: boolean = false;
  filePreviewUrl: string = "";

  // 打开表单的时候
  mounted() {
    // 如果仅拍照上传且有水印 就使用钉钉去定位
    this.isAddWatermark = !!this.controlOpts.addWatermark;
    if (!this.readonly) {
      this.getLoaction();
    }
  }
  get listType() {
    // 子表中图片上传显示成附件上传样式
    return this.isImage && !this.control.parentKey ? "photo-list" : "file";
  }

  get isOpenPreview() {
    return !this.getIsOpenPreview();
  }

  handleValueChange(value: any): void {
    this.toFilelist(value);
  }

  setControl() {
    if (this.ctrl && this.ctrl.value) {
      this.toFilelist(this.ctrl.value);

      if (this.fileList.some((f) => f.base64)) {
        this.$nextTick(() => {
          setTimeout(() => {
            (this.$refs.upload as any).handleRefUpload();
          }, 500);
        });
      }
    } else {
      this.fileList = [];
    }

    this.listenCommand();
  }

  toFilelist(val: any[] | null) {
    if (!val) {
      this.fileList = [];
      return;
    }
    //说明此时的数据还未经过转换
    if (Array.isArray(val) && val.length > 0 && val[0].mimeType) {
      val = this.convertFileData(val);
      if (!val) return;
    }

    if (val.some((x: any) => x.status !== 3 && x.status !== 2)) {
      // this.changing = false;
      return;
    }

    this.fileList = val
      .filter((x: any) => x.status === 2)
      .map((x: any, i: number) => {
        const idx = x.name.indexOf(suffix);

        if (idx > 0) {
          x.name = x.name.substring(0, idx) + i + suffix;
        }

        if (x.status === 2 && x.base64) {
          delete x.base64;
        }
        if (x.response && x.response.data) {
          x.url = this.getDownloadUrl(x.response.data);
        }

        return x;
      });
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
    this.$h3.toast.show({
      text: msg,
    });
  }

  getLoaction() {
    if (this.isAddWatermark) {
      FormLocationControl.service.position(undefined, false).then((result) => {
        this.locationInfo = result.address;
      });
    }
  }

  beforeUpload(files: File[]) {
    const file = files[0];

    if (!this.checkFileType(file.name, this.showError)) {
      return false;
    }

    if (!this.checkImageNumber(this.showError)) {
      return false;
    }

    return true;
  }

  onChange(info: { value: any }, files: any[]): void {
    console.log("change", info);
    if (this.readonly) {
      return;
    }
    // this.changing = files.some(f => f.status !== 3 && f.status !== 2);

    // file: uid name size respone status type
    // status 1 准备上传 2 已上传 3上传失败 -1正在上传
    const fileList = files.map((f, i) => {
      return {
        uid: f.uid,
        name: f.name,
        size: f.size,
        type: f.type,
        status: f.status === -1 ? 1 : f.status,
        base64: f.base64,
        compressBase64: f.compressBase64,
        response: f.response,
      };
    });
    // .filter(f => f.status === 2);
    // .map(f => f.response.data);
    super.onFilesChange(fileList);
  }
  onRemovedImg(file: any) {
    super.removedFile(file);
  }

  handleCancel() {
    this.previewVisible = false;
  }

  handlePreview(file: UploadFile) {
    console.log("handlePreview =>", file);
    if (file.response) {
      const url = super.getPreviewUrl(file.response.data);
      const ext = this.getExt(file.name);
      if (this.testIamge(ext) && url == "") {
        return;
      }
      if (url) {
        this.filePreviewUrl = url;
        platform.service.openLink(url);
      }
    }
  }
  filedownload(file: UploadFile) {
    // if (utils.Common.isWechat) {
    //   this.showError(`暂不支持下载`);
    //   return;
    // }
    file.response && super.download(file.response.data);
  }

  uploadError(err: any) {
    if (!err) {
      return;
    }
    let msg = "";
    switch (err) {
      // case 'overQuantity':
      //   this.showError(`一次最多允许上传张`);
      //   break;
      // case 'uploadError':
      //   this.showError(`文件错误`);
      //   break;
      case "overSize":
        msg = this.$t("cloudpivot.form.renderer.tip.overSize", {
          label: this.limitSize,
        }).toString();
        this.showError(msg);
        break;
      default:
        msg = this.$t("cloudpivot.form.renderer.tip.uploadError").toString();
        this.showError(msg);
        // this.showError('上传失败请重试');
        break;
    }
  }

  destroyed() {
    super.destroyed();
    if (this.commandSubscription) {
      this.commandSubscription.unsubscribe();
    }
  }
  created() {
    this.init();
  }

  hideSignsture() {
    this.showSignsture = false;
  }
}
</script>

<style lang="less">
.vertical .aufont.icon-base-paperclip {
  position: absolute;
  bottom: 0;
  right: 20px;
}
.close-bar {
  // margin-top: -40px;
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 99;
  height: 44px;
  background: #fff;
  border-top-style: solid;
  border-top-width: 1px;
  border-top-color: rgba(0, 0, 0, 0.1);
}
.h3-upload {
  .h3-upload-list{
    max-height: 100%;
    overflow: auto;
  }
  .h3-upload-list-file {
    padding-bottom: 10px;
  }
  .h3-field-layout-h-label {
    padding-bottom: 0;
  }
  .h3-field-box {
    min-height: 35px;
  }
  .h3-field-box .h3-PR {
    padding-bottom: 0 !important;
  }
  .h3-upload-list-file-item:after {
    height: 0 !important;
  }
  .h3-close {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    color: #2970ff;
    font-size: 0.4rem;
    width: 100%;
    height: 24px;
    margin-top: 10px;
    margin-bottom: 8px;
  }
  .h3-dialog {
    width: 100%;
    max-width: 100%;
    height: 100%;
    transform: translate3d(0px, 0px, 0px);
    transition: all 0ms ease 0s;
    top: 0px;
    left: 0px;
  }
  .img-box {
    height: 95.5%;
  }
  .h3-upload-title input{
    left: 0;
    top: 0;
  }
}
.h3-swiper div {
  // 放开会导致页面滚动问题，关联查询页面不能正常切换
  // transform: none !important;
}
.dialog-demo {
  .h3-dialog {
    height: 100vh;
    width: 100%;
    max-width: 100vh;
    .img-box {
      height: 100vh;
    }
  }
  // height: 100vh;
  width: 100%;
}
</style>
