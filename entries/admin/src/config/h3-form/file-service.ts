/*
 * @Author: your name
 * @Date: 2020-04-07 18:21:58
 * @LastEditTime: 2020-05-26 16:07:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\config\h3-form\file-service.ts
 */

import {
  FileService,
  H3File
} from '@cloudpivot/form/renderer';

import { formApi } from '@cloudpivot/api';

import env from '@/env';

export class DefaultFileService implements FileService {

  getListUploadUrl(): string {
    return `${env.apiHost}/api/runtime/query/upload_file`;
  }

  getUploadUrl(): string {
    return env.apiHost + '/api/aliyun/upload';
  }

  getDownloadUrl(file: H3File): string {
    if (!file) {
      return '';
    }
    const url = env.apiHost + `/api/aliyun/download?refId=${file.refId}`;
    const token = localStorage.getItem('token');
    if (!token) {
      return url;
    }
    return url + `&T=${token}`;
  }

  getDownloadUrlByRefId(refId: string): string {
    if (!refId) {
      return '';
    }
    const url = env.apiHost + `/api/aliyun/download?refId=${refId}`;
    const token = localStorage.getItem('token');
    if (!token) {
      return url;
    }
    return url + `&T=${token}`;
  }

  getPreviewUrl(file: H3File): string {
    return '';
  }


  getIsOpenPreview() {
    return false;
  }

  getHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  download(file: H3File): void {
    const url = this.getDownloadUrl(file);
    window.open(url);
  }

  downloadBatch(files: H3File[]): void {

  }

  preview() {

  }

  upFile(file: any) {
    return Promise.resolve();
  }

  getSheetDetail(params: any) {
    return formApi.importData(params);
  }

  exportSheet(params: any) {
    return Promise.resolve();
  }
}
