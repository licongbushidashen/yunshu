
<template>
  <a-modal
    title="报表设置"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :visible="true"
    width="90%"
    wrapClassName="report-set-modal"
    @cancel="onCancel"
    @ok="onOk"
    :maskClosable="false"
    :keyboard="false"
  >
    <h3-report-design
      v-if="loaded"
      v-model="title"
      :class="['report-design__designer']"
      :reportId="objectId"
      :corpId="corpId"
      :config="config"
      :showAdvancedDataSource="true"
      :limit="{ list: { dimension: 50 } }"
      @change="(...args)=> {
        console.log('args', args)
      }"
    ></h3-report-design>
  </a-modal>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { State, Action, namespace } from 'vuex-class';

import { Dashboard } from '@h3/report';

import appsApi from '@/apis/apps';

import { LanguageTransform } from '@/utils';

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: "set-report",
  components: {
    H3ReportDesign: Dashboard.Designer
  }
})
export default class ScriptInput extends Vue {
  @Prop({
    default: {}
  })
  dataItem!: any;
  @Prop({
    default: {}
  })
  modalData!: any;
  
  title = '';
  value:string = '';
  corpId = 'a';

  objectId = '';

  loaded = true;
   /* State */
  @AppCenterModule.State('appInfo') appInfo: any;

  /* Action */
  @AppCenterModule.Action('getAppDetail') getAppDetail: any;
  get reportCode() {
    return this.dataItem.code;
  }

  get appCode() {
    return this.$route.params.appCode;
  }

  get token() {
    return localStorage.getItem('token')
  }
  get config() {
    
    return {
      token: this.token,
      reportCode: this.reportCode,
      appCode: this.appCode
    }
  }

  onCancel() {
    this.$emit("closeModal");
  }

  onOk() {
    let value = this.value;
    this.$emit("backData", {
        value
    });
  }
  createReport () {
    let {
      name,
      parentCode,
      code
    } = this.dataItem;
    let params = {
      appCode: this.appCode,
      name: name,
      parentId: parentCode,
      code,
      icon: "h-icon-all-catalogue-o",
      name_i18n: "{en: "+ name +"}",
      mobileAble: true,
      pcAble: true,
    }
    appsApi.addAppReport(params).then((res:any) => {
      let { errcode, errmsg, data} = res;
      if (errcode === 0) {
        this.value = data.code;
      } else {
        this.$message.error(errmsg)
      }
      // console.log('res', res)
    })
  }
  load() {
    this.loaded = false;
    const closeLoad = (this.$message as any).loading();
    let code = this.dataItem.code;
    this.value = code;
    return appsApi.getAppReport({
      code
    }).then((res: any) => {
      closeLoad();
      
      if (res.errcode === 0) {
        this.title = res.data.name;
        this.objectId = res.data.reportObjectId || '';
      } else {
        this.$message.error(res.errmsg);
      }
    }, () => closeLoad()).finally(() => this.loaded = true);
  }

  getAppInfo() {
    if (this.appCode) {
      this.getAppDetail({
        appCode: this.appCode
      }).then(() => {
        const appName = LanguageTransform.getLang(this.appInfo.name, this.appInfo.name_i18n);
        document.title = appName + '-' + this.title;
      })
    }
  }

  mounted() {
    let {
      data: { value }
    } = this.modalData;
    if (value) {
       this.load().then(this.getAppInfo);
    } else {
      this.createReport()
    }
    console.log('slef', this)
    // this.load().then(this.getAppInfo);
    // this.createReport()
   
  }

}
</script>

<style lang="less">
.report-set-modal{
  .ant-modal-body{
    height: 600px;
  } 
}

</style>
