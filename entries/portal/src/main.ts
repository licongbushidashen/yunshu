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
// "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6IjhhZTQ5Y2MxODAxM2IwODkwMTgwMTNiNDQ1ZmYwMDAxIiwidXNlcl9uYW1lIjoiMDAwODE0Iiwic2NvcGUiOlsicmVhZCJdLCJtb2JpbGUiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJleHAiOjE2Njc4MTM2NTAsImlzQXBwQWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyJVU0VSIiwiQVVUSF9TWVNURU1fTUFOQUdFIl0sImp0aSI6ImQ2ZWUyZjg3LTRjMTktNDVhYy05YTI5LWQ0MzdkNDIzZTNiNSIsImNsaWVudF9pZCI6ImFwaSJ9.UDK3lg1IGYgEEmkEVhSBgoojFeJtK1QeLE-8ob0SBH--Ak3wxzpZJfNaneW7i_1TGDZV7G3DJT5eqznV2vHmCTsMwZmK_thoibJLraK2QPFPx7UnNkL4R4FnBu5Bb23eKIoWEGBBMJ5FPk0HXl2ABOMpL9Hk0RgtEdPFv4h4XzKPAkX4Wll6opvTO8lbjIVE8O5DrkfFIJ2O9oTWzaFXjW-Ba-V-p94ZLldQjZff0im-fM8voOwN7Mzup-v4rTYpo0Jrc0R0dYn7IHf4QuFVriGQ8PS-CMbtWQdD5oX1d5JW6kEPErJxaXQA94r4bN6GzO99GkOHH2G44hSqtJ0sWQ"
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
      window.location.href = theUrl;
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
