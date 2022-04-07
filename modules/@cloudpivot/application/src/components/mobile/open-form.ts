/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2019-05-16 14:31:35 
 * @Last Modified by: nooldey
 * @Last Modified time: 2019-05-16 15:12:08
 * 打开应用表单混入方法
 */

import Vue from 'vue'
import Component from 'vue-class-component'
import * as Back from '../../../../../../entries/mobile/src/config/back';

/* interface for Bizmodel/Page item */

enum AppTreeItemTypes {
  BizModel = 'BizModel',
  Folder = 'Folder',
  Report = 'Report'
}

interface BizModelItem {
  code: string,
  favorites: boolean,
  id: string,
  name: string,
  type: AppTreeItemTypes,
  openMode: string,
  mobileUrl: string,
  pcUrl: string,
  children?: Array<BizModelItem>
}
/* interface end */

@Component
export default class OpenFormMixin extends Vue {
  currentApp?: any;
  app?: any;
  customMobileUrl: string = '';

  goFormList(bizmodel: BizModelItem) {
    // 跳转前记录当前APPcode
    const appCode:string = this.currentApp && this.currentApp.code || this.app && this.app.code;
    console.log('mixin recode code:', appCode);
    if (appCode) {
      sessionStorage.setItem('modelSouceApp', appCode);
    }
    // 根据类型跳转
    const { type, mobileUrl, code, openMode } = bizmodel;
    if (type === AppTreeItemTypes.BizModel) {
      this.$router.push({
        name: 'apps-form-list',
        params: {
          schemaCode: code
        }
      }).catch((err: any) => {err});
    } else if (type === AppTreeItemTypes.Report) {
      this.$router.push({
        name: 'apps-report',
        params: {
          appCode,
          reportCode : code
        }
      }).catch((err: any) => {err});
    } else if (mobileUrl) {
      if (['NEW_PAGE_MODE', 'RECENT_PAGE_MODE'].includes(openMode)) {
        Back.subscribeBack({
          callback: () => {
            this.$router.go(-1);
          }
        })

        this.customMobileUrl = mobileUrl;
        
        this.$router.push({
          name: 'custom-page',
          query: {
            customMobileUrl: this.customMobileUrl
          }
        }).catch((err: any) => {err});
        // window.location.href = mobileUrl;
        // window.open(mobileUrl);
      } else {
        this.$router.push({
          path: mobileUrl
        }).catch((err: any) => {err});
      }
    } else {
      this.$h3.toast.show({ text: '页面地址未设置，请联系管理员！' });
    }
  }
}