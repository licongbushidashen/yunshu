<template>
    <div class="signatrue-panel" v-show="!uploaded">
        <div class="signatrue-panel__content" ref="signatruewrap">
        <h3-signature
            ref="signature"
            :clip="true"
            :maxWidth="1"
            :maxHeight="1"
            :width="signatrueWidth"
            :height="signatrueHeight"
            :onBegin="onBegin"
            @saveAsPng="saveAsPng"
        ></h3-signature>
        </div>
        <div class="signatrue-panel__footer clearfix">
        <div class="button clearfix">
            <div class="left-btn">
            <h3-button
                :disabled="isRest"
                @click="reset"
            >{{ $t('cloudpivot.form.renderer.reset') }}</h3-button>
            </div>
            <div class="right-btn">
            <h3-button type="primary" @click="ok">{{ $t('cloudpivot.form.renderer.ok') }}</h3-button>
            </div>
        </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from "vue-property-decorator";
import { H3Modal, H3Signature, H3Button } from "h3-mobile-vue";

import ControlBack from "@cloudpivot/form/src/renderer/directives/control-back";
import { UploadControl } from "@cloudpivot/form/src/renderer/controls"; 
import { DefaultFileService } from '../config/h3-form/file-service'

const IS_WECHAT = /WeChat/.test(navigator.userAgent) || /wxwork/.test(navigator.userAgent) || /MicroMessenger/.test(navigator.userAgent)
const IS_DINGTALK = /DingTalk/.test(navigator.userAgent);

@Component({
  name: "signatrue2",
  components: {
    H3Modal,
    H3Signature,
    H3Button
  },
  directives: {
    ControlBack
  }
})
export default class Signatrue2 extends Vue {
    signatrueHeight: number = document.body.offsetHeight - 50;
    signatrueWidth: number = document.body.offsetWidth;
    isRest: boolean = true;
    signature: any = {};
    img:any = ''
    uploaded:boolean = false // 已经上传成功
    reset() {
        this.signature.clear();
        this.isRest = true;
    }

    onBegin() {
        this.isRest = false;
    }
    ok() {
        this.signature.saveAsPng();
    }

    refId:string = ''
    oldToken:string = ''
    created(){
        if(!IS_WECHAT && !IS_DINGTALK){
            this.$message.success('请使用微信、企业微信或者钉钉扫码签名') 
            return
        }
        this.oldToken = localStorage.getItem('token') || ''
        let token:string = this.$route.query.T as string || ''
        if(this.$route.query.T){
            localStorage.setItem('token', token)
        }
        this.refId = this.$route.query.refId as string || ''
    }
    mounted() {
        this.signature = this.$refs.signature;
    }
    destroyed(){
        if(this.oldToken){
            localStorage.setItem('token', this.oldToken)
        }
    }
    saveAsPng(data: any) {
        this.img = data;
        this.uploadImg()
    }
    uploadImg(){
        console.log(this.img)
        this.upLoad(this.img)
        // this.reset();
    }

    upLoad(file: any) {
        const closeLoading = (this.$message as any).loading();
        new DefaultFileService().upFile(file, this.refId).then((res: any) => {
            if (res.errcode === 0) {
                this.uploaded = true
                closeLoading();
                this.$message.success('上传签名成功，请返回PC端查看')
            }else{
                closeLoading();
            }
        });
    }

    get $message() {
        return {
            loading: (msg?: string) => {
                this.showLoading(msg || "");
                return this.hideToast;
            },
            success:(msg?: string) => {
                this.showSuccess(msg || "");
            }
        } as any;
    }
    showSuccess(text:string){
        this.$h3.toast.show({
            text,
            autoHide: false,
            iconType: "",
        });
    }
    showLoading(text: string) {
        this.$h3.toast.show({
            text,
            autoHide: false,
            iconType: "loading",
        });
    }
    hideToast() {
        this.$h3.toast.hide();
    }

}
</script>