
<template>
  <div class="h3-approve">
    <h3-textarea
      :title="$t('cloudpivot.form.renderer.opinion')"
      :value="content"
      :required="ctrl.required"
      :count="2000"
      :rows="4"
      :maxLength="2000"
      :autoHeight="false"
      :labelStyle="styleObj"
      @onChange="onContentChange"
    ></h3-textarea>

    <h3-upload 
      listType="file" 
      :title="$t('cloudpivot.form.renderer.attachment')" 
      v-if="supprotUpload"
      :maxSize="limitSize"
      :multiple="true"
      :data="fileList"
      :headers="headers"
      :action="uploadUrl" 
      :locale="locale"
      :showErrorToast="true"
      :placehloder="$t('cloudpivot.form.renderer.clickUpload')"
      :onChange="onChange"
    ></h3-upload>
    
    <signatrue
      v-model="basaImg"
      @change="upLoad"
      :title="$t('cloudpivot.form.renderer.sign')"
      v-if="controlOpts.showSignature"
      :required="controlOpts.signatureIsRequired"
    />

    <!-- <h3-approve
      v-model="ctrl.value.content"
      :action="uploadUrl"
      :fileList="fileList"
      :headers="headers"
      :accept="accept"
      :supprotUpload="supprotUpload"
      @input="onInput"
    ></h3-approve>-->
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import { RendererFormControl } from "../../typings";

import H3Approve from "../shared/h3-approve/index.vue";

import Signatrue from "../shared/signatrue.vue";

import { ApproveOpinionControl, UploadControl } from "../../controls";

import { H3Textarea, H3Button, H3Upload, H3Switch, H3PopupPicker } from 'h3-mobile-vue';


@Component({
  name: "approve-opinion",
  components: {
    H3Textarea,
    H3Button,
    H3Upload,
    H3Switch,
    H3PopupPicker,
    Signatrue
  }
})
export default class ApproveOpinion extends ApproveOpinionControl {
  basaImg: string = '';
  handlePreview() { }

  uploading = false;
  
  get val(){
    return this.ctrl.value || {};
  }

  // setControl() {
    
  //   if (this.ctrl.value && this.ctrl.value.resources) {
  //     this.fileList = this.ctrl.value.resources.map((x: any) =>
  //       this.map(x, true)
  //     );
  //   }
  // }
  
  setControl() {
    this.handleValueChange(this.ctrl.value);
  }

  handleValueChange(value : any){
    // ;
    if(this.uploading){
      this.uploading = false;
      return;
    }
    if (value && value.resources) {
      this.fileList = value.resources.map((x: any) => this.map(x, true)).filter(x => x.name !== 'signsture.png');
    }
  }
  get $message() {
    return {
      loading: (msg?: string) => {
        this.showLoading(msg || "");
        return this.hideToast;
      }
    } as any;
  }
  showLoading(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: false,
      iconType: "loading"
    });
  }
  hideToast() {
    this.$h3.toast.hide();
  }

  upLoad(file:any) {
    let aList:any[] = []
    if (this.ctrl.value && this.ctrl.value.resources) {
      aList = this.ctrl.value.resources.filter((res:any) => {
         return res.name  !== 'signsture.png';
      });
    };
    if (!file) {
      // this.ctrl.value.resources = aList;
      (this.ctrl as any).value = Object.assign(this.val,{
        resources : aList
      });
      return;
    }
    
    const closeLoading = (this.$message as any).loading();
    UploadControl.service.upFile(file).then((res:any) => {
      setTimeout(() => {
        closeLoading();
      },500);
      if (res.errcode === 0) {
        aList.push(res.data);
        // this.ctrl.value.resources = aList;
        (this.ctrl as any).value = Object.assign(this.val,{
          resources : aList
        });
      }
    });
  }

  beforeUpload(file: File, showError: boolean = true) {
    // return super.beforeUpload(file, showError);
  }

  onContentChange(val: string){
    (this.ctrl as any).value = Object.assign(this.val,{
      content : val
    });
  }

  onChange(info: { value: any }, files: any[]): void {
    // ;
    // 2 表示已上传
    let filesList:any[] = files
      .filter(f => f.status === 2)
      .map(f => f.response.data);
    
    const _ctrl = this.ctrl as any;

    this.uploading = true;
    
    _ctrl.value = Object.assign(this.val,{
      resources : filesList
    });
    
  }

  onInput(val: string) {
    // this.ctrl.value.content = val;
    (this.ctrl as any).value = Object.assign(this.val,{
      content : val
    });
  }
}
</script>

<style lang="less" scoped>
.upload {
  margin-top: 20px;
}
</style>
