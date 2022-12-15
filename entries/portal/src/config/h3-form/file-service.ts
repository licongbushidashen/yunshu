import { renderer } from "@cloudpivot/form";

import env from "../env";

import { formApi, listApi } from "@cloudpivot/api";

import { utils } from "@cloudpivot/common";

import Store from "@/store/index";

export class DefaultFileService implements renderer.FileService {
  getListUploadUrl(): string {
    return `${env.apiHost}/api/runtime/query/upload_file2`;
  }

  getUploadUrl(): string {
    return `${env.apiHost}/api/aliyun/upload`;
  }

  getDownloadUrl(file: renderer.H3File): string {
    debugger
    const url = `${env.apiHost}/api/aliyun/download?refId=${file.refId}`;
    const token = (window as any).externalLinkToken || localStorage.getItem("token");
    if (!token) {
      return url;
    }
    return `${url}&T=${token}`;
  }
  getDownloadPrintUrl(file: renderer.H3File): string {
    if (!file) {
      return "";
    }
    const url =
      env.apiHost + `/api/aliyun/print/download?refId=${file.refId}&fileName=${file.name}`;
    const token = localStorage.getItem("token");
    if (!token) {
      return url;
    }
    return url + `&T=${token}`;
  }
  getDownloadUrlByRefId(refId: string): string {
    if (!refId) {
      return "";
    }
    const url = env.apiHost + `/api/aliyun/download?refId=${refId}`;
    const token = (window as any).externalLinkToken || localStorage.getItem("token");
    if (!token) {
      return url;
    }
    return url + `&T=${token}`;
  }

  getPreviewUrl(file: renderer.H3File): string {
    const sysConfig = (Store.state as any).config;
    let url = "";
    // 判断用户是否开启了附件预览服务
    if (sysConfig && sysConfig.openIDocView) {
      const downloadUrl = this.getDownloadUrl(file);
      url = `${sysConfig.idocvServiceUrl}/view/url?url=${encodeURIComponent(
        downloadUrl
      )}&name=${encodeURIComponent(file.name)}`;
    }
    return url;
  }

  getIsOpenPreview() {
    const sysConfig = (Store.state as any).config;
    return sysConfig.openIDocView ? true : false;
  }

  getHeaders(): { [key: string]: string } {
    const token = (window as any).externalLinkToken || localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  download(file: renderer.H3File): void {
    const url = this.getDownloadUrl(file);
    window.open(url);
  }

  downloadBatch(files: renderer.H3File[]): void {
    if (files.length === 0) {
      return;
    }

    const refIds = files.map(f => f.refId).join(",");
    let url = `${env.apiHost}/api/aliyun/download_multi?multiVO=${refIds}`;

    const token = (window as any).externalLinkToken || localStorage.getItem("token");
    if (token) {
      url += `&access_token=${token}`;
    }

    window.open(url);

    // utils.downloadFileByPost(url, {
    //   refIds
    // });
  }

  preview() {}

  upFile(file: any) {
    return Promise.resolve();
  }

  getSheetDetail(params: any) {
    return formApi.importData(params);
  }

  interval: any = null;

  exportSheet(params: any, e?: any) {
    const name = params.name + utils.DateHandle.dateFormat(new Date(), "YYYYMMDDHHmmss");
    //
    formApi.exportData(params).then((res: any) => {
      if (res.errcode !== 0) {
        e.$message.error(e.$t("cloudpivot.list.pc.ExportFailure"));
      } else {
        const loading = e.$message.loading(e.$t("cloudpivot.list.pc.ExportLoading"), 0);
        this.interval = setInterval(() => {
          this.getExportProgress(res.data.id, e);
        }, 2000);
      }
      // if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      //
      // } else {
      //
      //   // const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
      //   // const fileName = `${params.subSchemaCode}.xlsx`;
      //   // this.downloadFile(blob, fileName);
      //   if (res.errcode === 0) {
      //     this.exportErrorResult(res.data, name);
      //   }
      // }
    });
  }

  async getExportProgress(id: string, e: any) {
    const res = await listApi.getExportingProgress({ id: id });
    if (res.errcode === 0) {
      if (res.data.exportResultStatus) {
        clearInterval(this.interval);
        this.downLoadExportFile(id, e);
      }
    } else {
      clearInterval(this.interval);
      e.$message.error(res.errmsg as string);
    }
  }

  async downLoadExportFile(id: string, e) {
    const res: any = await listApi.getExportFile({ id: id });
    const blob = new Blob([res], { type: "application/vnd.ms-excel;charset=UTF-8" });
    const date = new Date();
    const mounth = date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    const days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    const minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    const seconds = date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

    const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
    const fileName = `子表导出文件${stamp}.xlsx`;

    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
    e.$message.destroy();
  }

  /**
   * 文件下载方法
   */
  downloadFile(blob: any, fileName: string) {
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async exportErrorResult(file: string, name: string) {
    const res = await listApi.exportErrorResult(file);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      // this.$message.error(this.$t('cloudpivot.list.pc.DownloadFailed'));
    } else {
      const blob = new Blob([res], { type: "application/vnd.ms-excel" });
      const stamp = new Date().getMilliseconds();
      let fileName = "";
      if (name) {
        fileName = `${name}.xlsx`;
        //清除临时文件
        listApi.deleteTemporaryFile({ fileName: file });
      } else {
        fileName = `错误信息${stamp}.xlsx`;
      }

      this.downloadFile(blob, fileName);
    }
  }
}
