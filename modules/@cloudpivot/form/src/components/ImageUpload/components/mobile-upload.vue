
<template>
  <div class="h3-upload" :class="isImage ? 'h3-upload-phone' : ''">
    <h3-upload
      ref="upload"
      :autoPreview="true"
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
      :watermarkFontSize="watermarkFontSize"
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
      @uploadImageFromCamera="uploadImageFromCamera"
    ></h3-upload>
  </div>
</template>

<script lang="ts">
import { Subscription } from "rxjs";

import { Vue, Prop, Component, Inject } from "vue-property-decorator";
import { uid } from "@cloudpivot/form/utils/utils";

import {
  RendererFormControl,
  UploadLimitType,
  FormControlType,
} from "@cloudpivot/form/schema";

import { FileUploadControl } from "@cloudpivot/form/src/common/controls/file-upload-control";
import { FormLocationControl } from "@cloudpivot/form/src/common/controls/form-location-control";
import { UploadFile } from "@cloudpivot/form/src/common/controls/upload-control";
import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control"

import { H3Upload } from "h3-mobile-vue";
import { ControlCommand } from "h3-forms";
import { dingTalk, dingTalkApi } from '@cloudpivot/api'

const suffix = ".jpg";

@Component({
  name: "upload",
  components: {
    H3Upload,
  },
})
export default class Upload extends FileUploadControl {
  previewVisible = false;

  previewImage = "";

  fileList: any[] = [];

  isAddWatermark: boolean = false;
  watermarkFontSize: number = 16

  locationInfo: string = "";

  commandSubscription?: Subscription;

  changing = false;

  // 打开表单的时候
  mounted() {
    console.log(this.controlOpts.compressible, 'this.compressible');
    console.log(this.controlOpts.imageQuality, 'this.imageQuality');
    // 如果仅拍照上传且有水印 就使用钉钉去定位
    // 这里没有在$nextTick中判断readonly去getLocation，主要是不想在编辑的时候重新调用getLoaction
    this.isAddWatermark = !!this.controlOpts.addWatermark;
    this.watermarkFontSize = this.controlOpts.watermarkFontSize
    this.getLoaction();
  }

  get listType() {
    // 子表中图片上传显示成附件上传样式
    return this.isImage && !this.control.parentKey ? "photo-list" : "file";
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

    let imgFile:any = [];
    this.fileList = this.fileList.map((f) => {
      const res = f.response.data;
      const mimeType = res.mimeType.split("/")[1] || "";
      if (
        ["jpg", "jpeg", "png", "gif", "bmp", "svg", "tif"].includes(mimeType)
      ) {
        // @ts-ignore
        imgFile.push(f);
      }
    });
    this.fileList = imgFile;
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
    (this as any).$h3.toast.show({
      text: msg,
    });
  }

  getLoaction() {
    if (this.isAddWatermark) {
      let locationInfo: any = window.sessionStorage.getItem('locationInfo') ? window.sessionStorage.getItem('locationInfo') : '';
      if (!locationInfo) {
        FormLocationControl.service.position(undefined, false).then((result) => {
          if (result.address) {
            this.locationInfo = result.address;
          }
          // 多次调用getLoaction只返回一次， sessionStorage存储
          window.sessionStorage.setItem("locationInfo", this.locationInfo);
        });
      } else {
        this.locationInfo = locationInfo;
      }
    }
  }

  beforeUpload(files: File[]) {
    if (this.isAddWatermark) {
      // 重置一下locaton信息
      let locationInfo: any = window.sessionStorage.getItem('locationInfo') ? window.sessionStorage.getItem('locationInfo') : '';
      if(!this.locationInfo) {
        this.locationInfo = locationInfo;
      }
    }
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
    // console.log("before remove:", this.fileList);
    super.removedFile(file);
    // console.log("after remove:", this.fileList);
  }

  handleCancel() {
    this.previewVisible = false;
  }

  handlePreview(file: UploadFile) {
    if (file.response) {
      const ext = this.getExt(file.name);
      if (this.testIamge(ext)) {
        return;
      }
      const url = super.getPreviewUrl(file.response.data);
      url && window.open(url);

      // if (this.testDocument(ext)) {
      //   super.download(file.response.data);
      // } else {
      //   const msg = this.$t(
      //     "cloudpivot.form.renderer.tip.previewError"
      //   ).toString();
      //   this.showError(msg);
      // }
    }
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
    // 删除地址信息
    window.sessionStorage.removeItem("locationInfo");
    if (this.commandSubscription) {
      this.commandSubscription.unsubscribe();
    }
  }
  created() {
    this.init();
  }

  uploadImageFromCamera () {
    let locationInfo: any = window.sessionStorage.getItem('locationInfo') ? window.sessionStorage.getItem('locationInfo') : '';
    RelevanceFormControl.service.uploadImageFromCamera((data) => {
      if (Array.isArray(data) && data.length > 0) {
        dingTalkApi.upload(data[0], this.isAddWatermark, locationInfo as string, this.watermarkFontSize).then(res => {
            //@ts-ignore
            if (res.errcode === 0) {
              res.data.uid = uid();
              res.data.compressBase64 = res.data.remarks;
              res.data.base64 = res.data.remarks;
              res.data.status = 2;
              res.data.size = res.data.fileSize;
              res.data.type = res.data.remarks.split(',')[0].split(';')[0].substr(5);
              let resStr = JSON.stringify(res);
              let tmpResponseObj = JSON.parse(resStr);
              if (tmpResponseObj.data.remarks) {
                tmpResponseObj.data.remarks = "dingTalk jsapi upload"
              }
              if (tmpResponseObj.data.base64) {
                tmpResponseObj.data.base64 = null;
              }
              if (tmpResponseObj.data.compressBase64) {
                tmpResponseObj.data.compressBase64 = null;
              }
              res.data.response = tmpResponseObj;
              let imgFile: any[] = [];
              this.fileList = this.fileList.map((f) => {
                const res = f.response.data;
                const mimeType = res.mimeType.split("/")[1] || "";
                if (
                  ["jpg", "jpeg", "png", "gif", "bmp", "svg", "tif"].includes(mimeType)
                ) {
                  // @ts-ignore
                  imgFile.push(f);
                }
              });
              imgFile.push(res.data);
              this.fileList = imgFile;
              const fileList = this.fileList.map((f, i) => {
                return {
                  uid: f.uid,
                  name: f.name,
                  size: f.size,
                  type: f.type,
                  status: f.status === -1 ? 1 : f.status,
                  base64: f.base64,
                  compressBase64: f.compressBase64,
                  response: f.response,
                  url: this.getDownloadUrlByRefId(f.refId)
                };
              });
              super.onFilesChange(fileList);
            }
          })
          .catch(err => {
            this.showError("dingTalk upload error");
          })
      }
    })
  }
}
</script>

<style lang="less">
.vertical .aufont.icon-base-paperclip {
  position: absolute;
  bottom: 0;
  right: 20px;
}
</style>
