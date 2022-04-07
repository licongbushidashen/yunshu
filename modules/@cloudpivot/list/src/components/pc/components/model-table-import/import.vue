<template>
  <div class="model-table-import">
    <a-modal
      :class="{'hide-footer': importStatusShow}"
      :maskClosable="false"
      :title="'导入数据'"
      :visible="true"
      @cancel="handleCancel"
      width="640px"
      wrapClassName="model-table-import"
    >
      <div>
        <!--导入弹窗组件-->
        <ImportInput
          :dataItems="dataItems"
          :isFormSheet="isFormSheet"
          :modelInfo="modelInfo"
          :queryCode="queryCode"
          @resetUpLoad="reupload"
          @setCoverCode="setCoverCode"
          @setImportAble="setImportAble"
          @uploadComplete="uploadComplete"
          ref="importInput"
          v-if="importInputShow"
        />

        <!--校验状态 错误信息码-->
        <!--        <ValidateStatus-->
        <!--          :isFormSheet="isFormSheet"-->
        <!--          :modelInfo="modelInfo"-->
        <!--          @reupload="reupload"-->
        <!--          @success="dataImport"-->
        <!--          ref="validateStatus"-->
        <!--          v-if="validateStatusShow"-->
        <!--        />-->

        <!--导入状态-->
        <template>
          <img src="./import-status.svg" style="display: none"/>
          <ImportStatus
            :isFormSheet="isFormSheet"
            :queryCode="queryCode"
            :schemaCode="modelInfo.schemaCode"
            :showImportStatus="showImportStatus"
            :statusParams="statusParams"
            @reupload="reupload"
            @setRenderData="setRenderData"
            ref="importStatus"
            v-if="importStatusShow"
          />
        </template>
      </div>
      <template slot="footer">
        <a-button @click="handleCancel">
          取消
        </a-button>
        <a-button
          :disabled="forbiddenImport"
          @click="handleImport"
          type="primary"
        >
          导入
        </a-button>
      </template>
    </a-modal>
    <!--    在线修复-->
    <!--    <ModelTableFix-->
    <!--      :dataItems="dataItems"-->
    <!--      :importData="importData"-->
    <!--      :dataList="dataList"-->
    <!--      :showDataFix="statusParams.showImportErrModal"-->
    <!--      @closeDataFix="closeDataFix"-->
    <!--      @handleImportFixed="handleImportFixed"-->
    <!--      @ok="closeDataFix"-->
    <!--      @resetData="resetData"-->
    <!--      v-if="statusParams.showImportErrModal"-->
    <!--    />-->
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {Button, Modal} from '@h3/antd-vue';
  import ImportInput from './import-input.vue';
  import ImportStatus from './import-status.vue';
  import ValidateStatus from './import-validate-status.vue';
  import {listApi, listParams} from "@cloudpivot/api";

  @Component({
    components: {
      AModal: Modal,
      AButton: Button,
      ImportStatus,
      ImportInput,
      ValidateStatus,
    },
  })
  export default class Import extends Vue {
    @Prop()
    isFormSheet!: any;

    @Prop({
      type: String,
      required: true,
    }) schemaCode!: string;

    @Prop({
      type: String,
    }) queryCode!: string;

    @Prop()
    statusParams!: any;

    @Prop()
    visible!: any;

    @Prop()
    showImportStatus!: any;

    @Prop()
    importData!: any;

    showDataFix = false;

    dataItems: any[] = [];

    dataList: any[] = [];

    // 控制弹框显示内容
    importInputShow = true;

    importStatusShow = false;

    validateStatusShow = false;

    uploadCompleteStatus = false; // 是否有文件

    coverStatus = false; // 是否覆盖

    coverCode = false; // 覆盖字段

    // 模型基础信息
    appCode = this.queryCode;

    // bizGroupCode = '';

    // bizModuleCode = '';

    inputData: any = {};

    interval: any = null;

    timeout: any = null;

    // renderData: any = []; // 导入成功后用来渲染数据

    static typeOf(obj: any): string {
      return Object.prototype.toString
        .call(obj)
        .split(' ')[1]
        .toLocaleLowerCase()
        .slice(0, -1);
    }

    get modelInfo() {
      return {
        appCode: this.appCode,
        // bizGroupCode: this.bizGroupCode,
        // bizModuleCode: this.bizModuleCode,
        schemaCode: this.schemaCode,
      };
    }

    get forbiddenImport() {
      if (this.uploadCompleteStatus && this.coverStatus && this.coverCode) {
        return false;
      } else if (
        this.uploadCompleteStatus &&
        !this.coverStatus &&
        this.coverCode
      ) {
        return false;
      } else if (
        this.uploadCompleteStatus &&
        !this.coverStatus &&
        !this.coverCode
      ) {
        return false;
      }
      return true;
    }

    reupload() {
      this.importInputShow = true;
      this.importStatusShow = false;
      this.validateStatusShow = false;
      this.showDataFix = false;
      this.uploadCompleteStatus = false;
      this.$emit('reset');
    }

    // 判断是否有覆盖字段 禁止导入
    setImportAble(val: boolean) {
      this.coverStatus = val;
    }

    setCoverCode(code: any) {
      if (!code) {
        this.coverCode = false;
      } else {
        this.coverCode = code;
      }
    }

    // 导入成功后的渲染
    setRenderData(data: any) {
      this.$emit('setData', data);
      this.$emit('close');
    }

    // 上传完成
    uploadComplete(val: boolean) {
      this.uploadCompleteStatus = val;
    }

    // 取消修正数据重新导入
    closeDataFix() {
      this.reupload();
    }

    created() {
    }

    handleCancel() {
      this.uploadCompleteStatus = false;
      this.coverStatus = false;
      this.coverCode = false;
      this.$emit('close');
    }

    // 导入文件
    handleImport() {
      this.dataImport();
    }

    // 重置数据
    resetData(data: any) {
      this.dataList = data;
    }

    // 修正后导入
    handleImportFixed(data: any) {
      this.validateStatusShow = false;
      this.showDataFix = false;
      this.importStatusShow = true;
      this.$nextTick(() => {
        // this.renderData = data;
        // NOTE: 这里导入时传送的数据格式需要精简下，减少无用的数据传输
        // const params = data;
        const params = data.map((row: any[]) => {
          return row.map((item: any) => ({
            value: item.value,
            propertyCode: item.propertyCode,
            propertyName: item.propertyName,
            subModelRecords: item.subModelRecords,
          }));
        });

      });
    }

    handleProgress(taskId?:string) {
      this.interval = setInterval(() => {
        this.getImportProgress(taskId);
      }, 5000);
      //设置定时任务5分钟;
      if (this.interval) {
        this.timeout = setTimeout(() => {
          clearInterval(this.interval);
          this.$message.error('连接超时');
        }, 300000)
      }
    }

    async getImportProgress(taskId?:string) {
      const res = await listApi.getImportingProgress({ taskId });
      if (res.errcode === 0) {
        if (res.data.operationResult) {
          clearInterval(this.interval);
          clearTimeout(this.timeout)
          this.$emit('importEnd', res.data);
        }
      }
    }

    // 校验成功后导入
    dataImport() {
      const importInput: any = this.$refs.importInput as ImportInput;
      if (importInput) {
        this.importInputShow = false;
        this.importStatusShow = true;
        this.validateStatusShow = false;
        this.$nextTick(() => {
          const importStatus: any = this.$refs.importStatus as ImportStatus;
          const data: any = importInput.getTheData();
          //  导入
          const params: listParams.ImportParams = {
            fileName: data.file,
            schemaCode: this.schemaCode,
            queryCode: this.queryCode,
            queryField: this.coverCode,
          };
          listApi.importData(params).then((res: any) => {
            if (res.errcode !== 0) {
              const msg: any = res.errmsg;
              importStatus.setSate('fail', 0, 0, [], msg);
            } else {
              console.log(res, 'res');
              const taskId = res.data.taskId || '';
              this.handleProgress(taskId);
            }
          })
            .catch(() => {
              importStatus.setSate('fail', 0, 0, [], '导入失败');
            });
        });
      }

    }
  }
</script>
<style lang="less">
  .model-table-import {
    .ant-modal-body {
      padding-top: 16px;
    }

    .ant-modal-footer .ant-btn-primary:disabled {
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .hide-footer {
    .ant-modal-footer {
      display: none;
    }
  }
</style>
