<template>
  <div class="import-status">
    <div class="img-wrap">
      <img src="./import-status.svg"/>
      <div>
        <i class="icon-gap icon aufontAll h-icon-all-close-circle"
           v-show="!getActive && (systemError || showFailMessage)"></i>
        <i class="icon-gap icon success aufontAll h-icon-all-check-circle" v-show="
           !getActive && (isHalfSuccess || isSuccess)
          "></i>
      </div>
    </div>
    <div class="import-status-progress" v-if="getActive">
      <a-progress :percent="percent"/>
      <p>数据导入中，请不要关闭页面...</p>
    </div>
    <div class="import-status-info" v-else>
      <p class="import-status-info--title">
        <template v-if="systemError">
          数据导入失败
        </template>
        <template v-if="isHalfSuccess || isSuccess">
          数据导入完成
        </template>
        <template v-if="showFailMessage">
          数据校验错误
        </template>
      </p>
      
      <p v-if="systemError">
        {{ errMessage ? errMessage : '导入失败，请重新导入' }}
      </p>
      
      <p v-else-if="isSuccess">
        成功导入<span class="success">{{ successNum }}</span>条数据
        <template
          v-if="
          getSheetImportCount.select ||
          getSheetImportCount.radio ||
          getSheetImportCount.checkbox
        "
        >
          <div class="success-text-tip">
            <span>{{ $t("cloudpivot.list.pc.tips") }}</span>
            <span v-if="getSheetImportCount.select">{{
            $t("cloudpivot.list.pc.selectDataTips", {
              num: getSheetImportCount.select,
            })
          }}</span>
            <span v-if="getSheetImportCount.select && getSheetImportCount.radio"
            >、</span
            >
            <span v-if="getSheetImportCount.radio">{{
            $t("cloudpivot.list.pc.radioDataTips", {
              num: getSheetImportCount.radio,
            })
          }}</span>
            <span
              v-if="
              (getSheetImportCount.select && getSheetImportCount.checkbox) ||
              (getSheetImportCount.radio && getSheetImportCount.checkbox)
            "
            >、</span
            >
            <span v-if="getSheetImportCount.checkbox">{{
            $t("cloudpivot.list.pc.checkboxDataTips", {
              num: getSheetImportCount.checkbox,
            })
          }}</span>
            <span>{{ $t("cloudpivot.list.pc.importDataTips") }}</span>
          </div>
        </template>
      </p>
      
      <template v-else-if="isHalfSuccess">
        <p>
          成功导入<span class="success">{{ successNum }}</span>条数据,有 <span class="fail">{{ failNum }}</span>
          条数据导入失败
        </p>
        <p>请<span @click="exportErrorTem" class="fail">下载错误数据</span>，修改后再导入</p>
      </template>
      <template v-else-if="showFailMessage">
        <p v-if="isUnspecified">{{ $t('cloudpivot.form.renderer.tip.importErrorRelation') }} </p>
        <p v-else-if="isTemplateEmpty">{{ $t('cloudpivot.form.renderer.tip.importErrorEmpty') }}</p>
        <p v-else-if="!matchError">{{ $t('cloudpivot.list.pc.ImportTips9', {size: importSize}) }}</p>
        <div v-else>
          <p> {{ $t("cloudpivot.form.renderer.tip.importError") }}</p>
        </div>
      </template>
      <div class="import-status-info--action">
        <a-button @click="handleClick" v-if="isSuccess">
          完成
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {Button, Progress} from "@h3/antd-vue";
  import {formApi, listApi as Application, listParams} from "@cloudpivot/api";

  @Component({
    name: "data-import-status",
    components: {
      AProgress: Progress,
      AButton: Button,
    },
  })
  export default class DataImportStatus extends Vue {
    @Prop({
      type: Number,
    })
    percent!: number;

    @Prop({
      type: Number,
      default: 0,
    })
    successNum!: number;

    @Prop({
      type: Number,
      default: 0,
    })
    failNum!: number;

    @Prop({
      type: Number,
      default: 0,
    })
    status!: listParams.ImportResult;

    @Prop({
      type: String,
    })
    fileName!: string;

    @Prop({
      type: String,
    })
    schemaCode!: string;

    @Prop() sheetParams!: any;

    @Prop() errorFile!: string;

    @Prop({
      type: Number,
      default: 0,
    })
    importSize!: number;

    @Prop({
      type: Object,
      default: {},
    })
    getSheetImportCount!: object;

    get isHalfSuccess() {
      return this.status === listParams.ImportResult.PartialSuccess;
    }

    get showFailMessage() {
      return (
        this.status === listParams.ImportResult.DataNumExceed ||
        this.status === listParams.ImportResult.DataColumnError ||
        this.isUnspecified ||
        this.isTemplateEmpty
      );
    }

    get getActive() {
      // ;
      return this.status === listParams.ImportResult.None;
    }

    get matchError() {
      return this.status === listParams.ImportResult.DataColumnError;
    }

    get systemError() {
      return this.status === listParams.ImportResult.SystemError;
    }

    get isSuccess() {
      return this.status === listParams.ImportResult.Success;
    }

    get isTemplateEmpty() {
      return this.status === listParams.ImportResult.TemplateEmpty;
    }

    get isUnspecified() {
      return this.status === listParams.ImportResult.Unspecified;
    }

    exportErrorTem() {
      if (!this.errorFile) {
        return;
      }
      this.exportErrorResult(this.errorFile, "错误提示template.xlsx");
    }

    /**
     * 下载模板
     */
    exportTemplate() {
      formApi.exportTemplate(this.sheetParams).then((res: any) => {
        if (res.errcode === 0) {
          this.exportErrorResult(res.data);
        }
      });
    }

    async exportErrorResult(file: string, customName?: string) {
      // 
      const res = await Application.downErrorResult(file);
      if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
        this.$message.error(
          this.$t("cloudpivot.list.pc.DownloadFailed") as string
        );
      } else {
        const blob = new Blob([res], {type: "application/vnd.ms-excel"});
        const stamp = new Date().getMilliseconds();
        let fileName = "";
        if (customName) {
          fileName = customName;
        } else {
          fileName = "template.xlsx";
        }

        this.downloadFile(blob, fileName);
      }
    }

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

    handleClick() {
      this.$emit("cancel");
    }
  }
</script>
<style lang='less' scoped>
  .import-status {
    p {
      margin-bottom: 5px;
    }
    
    .img-wrap {
      width: 92px;
      margin: 85px auto;
      margin-bottom: 0;
      position: relative;
      
      & > div {
        // background: #fff;
        width: 39px;
        position: absolute;
        bottom: 0;
        right: 0;
        
        & > .icon {
          &.success {
            color: #17bc94;
          }
          
          font-size: 39px;
          color: #f4454e;
        }
      }
    }
    
    &-progress {
      text-align: center;
      width: 400px;
      margin: 49px auto;
      margin-bottom: 151px;
      
      p {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
        margin-top: 23px;
      }
    }
    
    &-info {
      text-align: center;
      width: 90%;
      margin: 34px auto;
      
      &--title {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      & > p {
        & > span {
          &.success {
            color: #17bc94;
          }
          
          &.fail {
            color: #f4454e;
            cursor: pointer;
          }
        }
      }
      
      &--action {
        margin-top: 32px;
        margin-bottom: 79px;
      }
    }
  }
  
  .mt-20 {
    margin-top: 10px;
    margin-bottom: 20px;
  }
  
  .data-import-status {
    height: 242px;
    text-align: center;
    
    .data-import-status--success
    /deep/
    .ant-progress-circle
    .ant-progress-text
    .anticon {
      font-size: 32px;
    }
    
    .data-import-status--success,
    .data-import-status--error {
      padding-top: 12px;
      
      div.error-tip {
        margin-top: 16px;
        line-height: @line-height-7;
        font-size: @font-size-16;
        color: rgba(0, 0, 0, 0.85);
      }
      
      .success-text {
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        margin-top: 10px;
      }
      
      .success-text-tip {
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
        margin-top: 10px;
      }
    }
    
    .data-import-status--halfsuccess {
      text-align: left;
      
      p {
        line-height: @line-height-11;
        
        span {
          margin-left: 16px;
          font-size: @font-size-16;
          color: rgba(0, 0, 0, 0.85);
        }
        
        &.data-import-status--halfsuccess__tip {
          margin-top: 8px;
          padding-left: 32px;
          font-size: @font-size-14;
          color: rgba(0, 0, 0, 0.45);
          
          a {
            margin-left: 10px;
            color: @primary-color;
          }
        }
        
        &.data-import-status--halfsuccess__success {
          i {
            color: @success-color;
          }
        }
        
        &.data-import-status--halfsuccess__error {
          margin-top: 24px;
          
          i {
            color: @error-color;
          }
        }
      }
    }
    
    .data-import-status--detail {
      text-align: left;
      
      p {
        i {
          color: @error-color;
        }
        
        span {
          margin-left: 16px;
          font-size: @font-size-16;
          color: rgba(0, 0, 0, 0.85);
        }
        
        &.data-import-status--detail__message {
          margin-top: 24px;
          margin-left: 32px;
          font-size: @font-size-16;
          color: rgba(0, 0, 0, 0.85);
          
          a {
            color: @primary-color;
          }
        }
      }
    }
  }
</style>
