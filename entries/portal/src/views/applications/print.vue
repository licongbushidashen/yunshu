<template>
  <div class="print-area">
    <ph :options="opts"/>
  </div>
</template>
<script lang="ts">
import {
  Component, Prop, Vue, Watch
} from 'vue-property-decorator';

import { externalLinkApi } from "@cloudpivot/api";

import { getUrlVar } from "@cloudpivot/common/src/utils/url";

import ph from '@cloudpivot/list/src/components/pc/printHTML.vue';

@Component({
  name: 'application-define',
  components: {
    ph: ph
  }
})
export default class ApplicationDefine extends Vue {
  opts:any = {};

  created(){
    // const o:any = JSON.parse(decodeURIComponent(window.location.href.split('=')[1] as any));
    const qrcodesData:any = JSON.parse(window.localStorage.getItem('printData') as string);
    this.opts = qrcodesData;
  }

  flow2base64(url){
    if(!url) return;
    const str:string = getUrlVar('text', url);
    return externalLinkApi.generateQrcode(decodeURIComponent(str));
  }

  mounted () {
    
    // 将文件流转成base64
    const { qrCodes } = this.opts;
    const tasks:Array<any> = [];
    if (qrCodes) {
      qrCodes.forEach(async (qrcode:any) => {
        tasks.push(this.flow2base64(qrcode.url))
      })
    }

    Promise.all(tasks).then((arrayBuffers:any) => {
      if(arrayBuffers) {
        arrayBuffers.forEach((af:any, index:number) => {
            let bytes = new Uint8Array(af);
            let data = "";
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
              data += String.fromCharCode(bytes[i]);
            }

            this.opts.qrCodes[index].url = "data:image/png;base64," + window.btoa(data);
        });

        this.$nextTick(() => {
          (this as any).$htmlToPaper('qrcodeBox');
        })
      }
    });
  }
}
</script>
<style lang="less" scoped>

</style>
