
<template>
  <div
    class="input-signsture"
  >
    <div
      v-if="!bs64Img"
      class="input-signsture__title"
    >
      <span v-if="!readonly">{{ $t('cloudpivot.form.renderer.tip.onlySupportMobileWrite') }}</span>
    </div>
    <div
      v-else
      class="input-signsture__img clearfix"
      @mouseover="mouseListener(1)"
      @mouseleave="mouseListener(0)"
    >
      <div >
        <img :src="bs64Img" @click.stop="isPreviewImage = true" />
      </div>
      <!-- <span v-show="hover" @click.stop="isPreviewImage = true" class="icon aufontAll">&#xe726;</span> -->
    </div>

    <img-preview
      v-if="isPreviewImage"
      :imgList="[{url: bs64Img}]"
      @close="isPreviewImage = false"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import { RadioControl } from "h3-forms";

import {
  RendererFormControl,
  FormControlType,
  SignatureUploadOptions
} from "@cloudpivot/form/schema";

import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";

import { UploadControl } from "@cloudpivot/form/src/common/controls/upload-control";

import { FormLocationControl } from "@cloudpivot/form/src/common/controls/form-location-control";

import PCImagePreview from "@cloudpivot/form/src/common/components/pc-image-preview.vue";

@Component({
  name: "input-signsture",
  components: {
    ImgPreview: PCImagePreview
  }
})
export default class InputSignsture extends BaseControl<
  SignatureUploadOptions
> {
  bs64Img: string = "";

  isPreviewImage: boolean = false;

  hover: boolean = false;

  mouseListener(type: number) {
    this.hover = Boolean(type);
  }

  setControl() {
    // PC端只能查看，所以不能设置必填
    (this.ctrl as RadioControl).required = false;

    this.handleValueChange((this.ctrl as any).value);
  }
  
  handleValueChange(files: any[]): void {
    if (files && files.length > 0) {
      let fileObj: any = "";
      if(files[0].url){
        // status状态为done则说明为图片
        fileObj = files.find((f:any) => f.status === "done");
        this.bs64Img = fileObj.url;
        return;
      }
      if(files[0].mimeType) {
        fileObj = files.find((f:any) => f.mimeType.indexOf('image') > -1);
        this.bs64Img = UploadControl.service.getDownloadUrl(fileObj);
      }
    } else {
      this.bs64Img = "";
    }
  }
}
</script>
<style lang="less" scoped>
.input-signsture {
  &__img {
    position: relative;
    div {
      float: left;
      img {
        width: 64px;
        height: 64px;
        border-radius: 2px;
        border: 1px solid rgba(221, 221, 221, 1);
        cursor: url("./images/enlarge-o.png"), pointer;
      }
    }
    .icon {
      position: absolute;
      left: 50px;
      top: 36px;
      cursor: pointer;
      font-size: 14px;
    }
  }

  &__title {
    span {
      line-height: 32px;
    }
  }
}
</style>

