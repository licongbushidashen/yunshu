
<template>
  <div class="input-signsture">

    <signatrue v-model="bs64Img" @change="upLoad" :readonly="readonly" :title="label" :required="ctrl.required" :labelStyle="style" @imageClick="previewImage" :tip="controlOpts.tips"/>

  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  FormControlType,
  SignatureUploadOptions
} from "@cloudpivot/form/schema";

import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";

import { UploadControl } from "@cloudpivot/form/src/common/controls/upload-control";

import { FormLocationControl } from "@cloudpivot/form/src/common/controls/form-location-control";

import Signatrue from "./signatrue.vue";


@Component({
  name: "input-signsture",
  components: {
    Signatrue
  }
})
export default class InputSignsture extends BaseControl<SignatureUploadOptions> {

  bs64Img: string = '';

  handleValueChange() {
    this.setBs64Img()
  }
  setControl() {
   
    // if (!this.ctrl.value[0]) return;
    // this.bs64Img =  UploadControl.service.getDownloadUrl(this.ctrl.value[0]);

    this.setBs64Img();
  }

  setBs64Img() {
    const val = this.ctrl.value;
    if (val && val.length > 0) {
      let fileObj: any = "";
      if(val[0].url){
        fileObj = val.find((f:any) => {
          let mimeType: string = f.name.split('.')[1] || '';
          return ["jpg", "jpeg", "png", "gif", "bmp", "svg", "tif"].includes(mimeType)
        });
        this.bs64Img = fileObj.url;
        return;
      }
      if(val[0].mimeType) {
        fileObj = val.find((f:any) => f.mimeType.indexOf('image') > -1);
        this.bs64Img = UploadControl.service.getDownloadUrl(fileObj);
      }
    } else {
      this.bs64Img = '';
    }
  }

  /**
  * 图片预览
  */
  previewImage(file: any) {
    // UploadControl.service.download(this.ctrl.value[0]);
    if (this.ctrl && this.ctrl.value && this.ctrl.value[0]) {
      const url = UploadControl.service.getPreviewUrl(this.ctrl.value[0]);
      url && window.open(url);
    }
  }

  upLoad(file: any) {
    if (!file) {
      this.ctrl.value = null;
      return;
    }

    UploadControl.service.upFile(file).then((res: any) => {
      if (res.errcode === 0) {
        this.ctrl.value = [];
        this.ctrl.value.push(res.data);
      }
    });
    // 清除多余样式
    setTimeout(() => {
      document.body.style.overflow = "";
      document.body.style.top = ""; 
    },600)
  }
}
</script>
<style lang="less" scoped>
.scale-hairline-common(@color, @top, @right, @bottom, @left) {
  content: "";
  position: absolute;
  background-color: @color;
  display: block;
  z-index: 1;
  top: @top;
  right: @right;
  bottom: @bottom;
  left: @left;
}
.hairline(@direction, @color: @border-color-base) when (@direction = "bottom") {
  border-bottom: 1px solid @color;

  html:not([data-scale]) & {
    @media (min-resolution: 2dppx) {
      border-bottom: none;

      &::after {
        .scale-hairline-common(@color, auto, auto, 0, 0);
        width: 100%;
        height: 1px;
        transform-origin: 50% 100%;
        transform: scaleY(0.5);

        @media (min-resolution: 3dppx) {
          transform: scaleY(0.33);
        }
      }
    }
  }
}
.hairline(@direction, @color: @border-color-base) when (@direction = "top") {
  border-top: 1px solid @color;

  html:not([data-scale]) & {
    @media (min-resolution: 2dppx) {
      border-top: none;

      &::before {
        .scale-hairline-common(@color, 0, auto, auto, 0);
        width: 100%;
        height: 1px;
        transform-origin: 50% 50%;
        transform: scaleY(0.5);

        @media (min-resolution: 3dppx) {
          transform: scaleY(0.33);
        }
      }
    }
  }
}
// .address-textarea{
//   /deep/textarea::placeholder{
//     color: #999;
//   }
//   position: relative;
//   .hairline('top',#EEE);
//   &__local{
//     top: 0;
//     right: 0;
//     width: 1.26rem;
//     height: 1.2rem;
//     position: absolute;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//   }
// }
</style>
<style>
.input-signsture.vertical .row__file {
  display: block;
}

.input-signsture.vertical .row__file .field__content {
  padding-top: 10px;
}
</style>

