/*
 * @Author: nooldey <nooldey@gmail.com>
 * @Date: 2021-02-07 11:06:16
 * @Last Modified by: nooldey
 * @Description:  文件下载服务封装
 */
// import API from '@cloudpivot-shared/domain-api';

export const downloadFile = (params: {
  refId?: string;
  fileName: string;
  url?: string;
}) => {
  const { refId, fileName = '', url } = params;
  if (typeof refId === 'string' && refId.length) {
    return downFileByRefId(refId, fileName);
  } else if (url && /^http(s):\/\/.+?/.test(url)) {
    return downFileByUrl(url, fileName);
  }
};

/**
 * 通过refId获取文件
 * @param refId
 * @param options
 */
export const downFileByRefId = (refId: string, fileName: string) => {
  // return API.Global.request({
  //   url: '/api/file/download',
  //   method: 'GET',
  //   params: {
  //     refId,
  //   },
  //   responseType: 'blob',
  // }).then((res: any) => {
  //   downFileByBlob(res.orgResponse.data, fileName);
  // });
};

/**
 * 保存文件流
 * @param blob
 * @param fileName
 */
export const downFileByBlob = (blob: Blob, fileName: string) => {
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
};

/**
 * 通过链接直接下载文件
 * @param url
 * @param fileName
 */
export const downFileByUrl = (url: string, fileName: string) => {
  const a = document.createElement('a');
  a.download = fileName;
  a.href = url.replace(/^http(s?):/, location.protocol);
  a.click();
};
