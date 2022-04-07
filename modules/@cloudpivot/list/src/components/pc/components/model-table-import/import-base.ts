import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ImportBase extends Vue {

  // 下载文件
  downloadFile (blob: any, fileName: string) {
    if ((window as any).navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

}
