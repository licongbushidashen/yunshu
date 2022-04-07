/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-12 11:53:15
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-30 20:03:48
 */
import "babel-polyfill";

import "./config/axios";

import env from "@/config/env";

import * as platform from "@cloudpivot/platform";

import { formApi } from "@cloudpivot/api";

import { startup } from "./startup1";
import initFormComponent from "@cloudpivot/form/registerComponent";
import common from "@cloudpivot/common/mobile";
import Vue from "vue/types/vue";
import Vues from "vue";
// localStorage.setItem(
//   "token",
//   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6ImFmZWIyMDRlN2I4NzM2NTcwMTdiOTRmZDUwNmMwN2YwIiwidXNlcl9uYW1lIjoiYmRzIiwic2NvcGUiOlsicmVhZCJdLCJtb2JpbGUiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJleHAiOjE2NDA4ODk1MzEsImlzQXBwQWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyJVU0VSIiwiQVVUSF9TWVNURU1fTUFOQUdFIl0sImp0aSI6IjFkMmJiNGQ3LWEzZDQtNDAwMC1hMDBmLWZlMTM0NzI2MjRjNSIsImNsaWVudF9pZCI6ImFwaSJ9.SCLIrCvdXn5mVPC99h6QP-EOHXDADtwNcmdJX9WKJUaM8ZRL0qSKWa92Ar1ps2ld2IbVKdP9p1Ire5LKChQzsJ3To3N7ZJM3zlJQDUVgLkIGm3FUWV1i0USFIPqs7RdK52LjdAgiMA8fUJdAcsJKDIJdbezumVVUhsh8eNU5pLEPti2w7-G_gZXxkLsaubLXDUsFR4AkjbW29rktOZwhbXxmgLSMRJr3NfU8ftSFSGrAzVwUUHW1GyA3enNjHGCDqYNVh-cqLTvVVthVEVHidC7Te_CAS0xTSXQgPakzaxIvKWrkVKEb_ae00o8XriRfxhFW8RzdMYEBlZwfa7_o4A"
// );
initFormComponent();
platform.start(env.client_id, env.scope).then((result: any) => {
  if (!result) return;
  const { query } = result;
  if (query.messageId && common.utils.Common.isPC) {
    openMessage(query.messageId);
  } else if (query.messageId && !common.utils.Common.isPC) {
    window.location.href = `${env.portalHost}/mobile/?messageId=${query.messageId}`;
  } else {
    startup(query);
    // import(/* webpackChunkName: "startup" */'./startup').then( obj => {
    //   obj.startup(query);
    // });
  }
});

Vues.prototype.getPopupContainer = (triggerNode: any) => {
  // console.log(triggerNode,'triggerNodetriggerNode',triggerNode.parentNode)
  return triggerNode.parentNode.parentNode;
};
/**
 * 根据消息打开页面
 * @param messageId
 */
async function openMessage(messageId: string) {
  const $app = document.getElementById("app");
  if (!$app) {
    throw new Error(`can't find #app`);
  }

  const params: OAuth.FormUrlParams = {
    messageId
  };

  const token = localStorage.getItem("token");

  if (token) {
    const res = await formApi.getMessageFormUrl(params);
    if (res.errcode === 0 && res.data) {
      // 跳转到消息地址或者第三方浏览器直接打开地址
      const { bizObjectId, workItemId, workflowInstanceId, schemaCode, sheetCode, url } = res.data;
      // alert(`结果详情：bizobjectid:${bizObjectId},workitemid:${workItemId},workflowinstanceid:${workflowInstanceId}`);
      let theUrl = "";
      if (url) {
        if (url.indexOf("?") > -1) {
          theUrl = `${url}&T=${token}`;
        } else {
          theUrl = `${url}?T=${token}`;
        }
      } else {
        theUrl = `${env.portalHost}/form/detail?`;

        if (workflowInstanceId) {
          theUrl += `workflowInstanceId=${workflowInstanceId}&workitemId=${workItemId ||
            ""}&T=${token}`;
        } else {
          theUrl += `objectId=${bizObjectId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&T=${token}`;
        }
      }

      $app.innerText = "";
      $app.style.textAlign = "center";
      $app.style.paddingTop = "20px";
      $app.style.color = "#666";
      $app.style.fontSize = "18px";

      const $a = document.createElement("a");
      $a.style.textDecoration = "underline";
      $a.href = theUrl;
      $a.target = "_blank";
      $a.innerText = "浏览器打开应用";
      $app.appendChild($a);

      // window.location.href = theUrl;
      platform.service.openLink(theUrl);
    }
  } else {
    localStorage.setItem("isShowEmailResquest", `${env.portalHost}?messageId=${messageId}`);
    const theUrl = `${env.portalHost}/login`;
    window.location.href = theUrl;
  }
}
