<template>
  <div>
    <a-modal
      :title="'导出数据'"
      :visible="true"
      destroyOnClose
      width="640px"
      :footer="null"
      wrapClassName="modal-table-export"
      @cancel="handleCancel"
    >
      <!-- 导出状态-->
      <div v-if="exportStatus" class="export-wrapper">
        <div class="export">
          <div class="export-header">
            <a-checkbox v-model="checkAll" @change="allChange" /> 全选
          </div>
          <div class="export-content clearfix">
            <template v-for="item in dataList">
              <div
                v-if="!item.isSub"
                :key="item.code"
                class="export-content-item"
              >
                <a-checkbox
                  v-model="item.checked"
                  @change="checkBoxChange(item.code, false)"
                />
                <span class="sheet-item">{{ item.name }}</span>
              </div>
              <div v-else :key="item.code" class="export-content-subsheet">
                <div class="export-content-subsheet--left">
                  <a-checkbox
                    v-model="item.checked"
                    @change="el => subCheckChange(item.code, el.target.checked)"
                  />
                </div>
                <div class="export-content-subsheet--right">
                  <H3Panel
                    :collapsible="true"
                    :collapsed="true"
                    :bold="true"
                    :title="item.name"
                  >
                    <div class="export-content-subsheet--content clearfix">
                      <template v-for="child in item.properties">
                        <div :key="child.code" class="item">
                          <a-checkbox
                            v-model="child.checked"
                            @change="checkBoxChange(item.code, true)"
                          />
                          <span class="sub-sheet-item">{{ child.name }}</span>
                        </div>
                      </template>
                    </div>
                  </H3Panel>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="footer-box">
          <span class="export-text" @click="downFiles">导出任务列表</span>
          <div>
            <a-button key="cancel" @click="handleCancel">
              取消
            </a-button>
            <a-button
              key="submit"
              class="export-btn"
              type="primary"
              :loading="disabled"
              @click="handleOk"
            >
              {{ $t('designer.pageOpt.exportText') }}
            </a-button>
          </div>
        </div>
      </div>
      <!--导出生成提示-->
      <div v-else class="export-inner">
        <img src="./import-status.svg" alt="" />
        <div class="building-text">
          文件正在生成中
        </div>
        <div class="down-text">
          请前往<span class="export-text" @click="downFiles">导出任务列表</span>下载文件
        </div>
        <a-button @click="handleCancel">
          知道了
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  Modal, Row, Checkbox, Button, Divider,
} from '@h3/antd-vue';
import Panel from './panel.vue';
import { GoPageArguments, register } from '@cloudpivot-shared/ui-designer-common';
// import { group } from '../model-table/schema';
@Component({
  components: {
    AModal: Modal,
    ARow: Row,
    ACheckbox: Checkbox,
    H3Panel: Panel,
    AButton: Button,
    ADivider: Divider,
  },
})
export default class Import extends Vue {
  @Prop()
  node!: any;

  @Prop()
  queryFilter!: any;

  @Prop()
  selectedKeys!: string[];

  appCode = '';

  bizGroupCode = '';

  bizModuleCode = '';

  schemaCode = '';

  domainCode = '';

  checkAll = false;

  exportStatus = true;

  disabled = false;

  dataList: any = [];

  relations: any = [];

  created () {
    const {
      domainCode,
      bizGroupCode,
      bizModuleCode,
      schemaCode,
    } = this.bindingModel;
    if (!schemaCode) {
      return;
    }
    const columns = this.getChildrenCol(this.node.childIds);
    const h3ui: any = (window as any).h3ui;
    const domain: any = h3ui.models[schemaCode].domain;
    const { appCode } = domain;
    this.appCode = appCode;
    this.bizGroupCode = bizGroupCode;
    this.bizModuleCode = bizModuleCode;
    this.schemaCode = schemaCode;
    this.domainCode = domainCode;
    this.relations = domain.relations;
    const modelList = domain.bizSchemas;
    const bizSchema = modelList.find((res: any) => res.code === schemaCode); // 主模型
    if (!bizSchema) {
      return;
    }
    const dataItem: any[] = bizSchema.properties;
    // console.log(dataItem, 'dataItem');
    if (Array.isArray(dataItem) && dataItem.length > 0) {
      const dataList: any = dataItem
        .filter(
          (item: any) =>
            !item.isSystemProperty &&
            item.valueType !== 'MAP_TYPE' &&
            item.valueType !== 'IMAGE' &&
            item.valueType !== 'ADDR_TYPE' &&
            item.valueType !== 'RICH_TEXT' &&
            item.valueType !== 'ATTACHMENT',
        ) // 过滤关联外键/子模型
        .map(res => {
          let properties: any[] = [];
          // 判断当前字段是否二级表
          const theSubSheet = modelList.find((sub: any) => {
            return res.propertyId === sub.modelId + 'Id';
          });
          if (theSubSheet) {
            properties = (theSubSheet as any).properties
              .filter((item: any) => !item.isSystemProperty) // 过滤系统字段
              .map((item: any) => {
                const checked = columns.includes(`${res.code}.${item.code}`);
                return {
                  code: item.code,
                  name: item.name,
                  checked,
                  valueType: item.valueType,
                };
              });
          }
          // console.log(properties, 'properties');
          const checked = columns.includes(`${res.code}`);
          return {
            code: res.code,
            name: res.name,
            schemaCode: theSubSheet ? theSubSheet.code : '', // 二级表添加schemaCode
            isSub: properties.length > 0, // 二级表标识
            checked,
            valueType: res.valueType,
            properties,
          };
        });
      if (Array.isArray(dataList) && dataList.length > 0) {
        const list: any = [];
        const restList: any = [];
        dataList.forEach((item: any) => {
          if (item.isSub) {
            list.push(item);
          } else {
            restList.push(item);
          }
        });
        this.dataList = [...restList, ...list];
      }

      this.checkAll = dataList.every((item: any) => item.checked);
    }
  }

  subCheckChange (code: any, value: any) {
    const childrenDataItem = this.dataList.find(
      (res: any) => res.code === code,
    );
    childrenDataItem.properties.forEach((res: any) => {
      res.checked = value;
    });
    this.dataList = [...this.dataList];
  }

  checkBoxChange (code: any, isChild = false) {
    if (isChild) {
      const theChild = this.dataList.find((res: any) => res.code === code);
      if (theChild) {
        theChild.checked = theChild.properties.every(
          (item: any) => item.checked,
        );
      }
    } else {
      this.checkAll = this.dataList.every((item: any) => item.checked);
    }

    this.dataList = [...this.dataList];
  }

  getChildrenCol (childIds: any) {
    let childrenId: any = [];
    childIds.forEach((cid: any) => {
      // const child = register.store.get(cid);
      const child = cid;
      // const asset = widgetStore.widgets[child.type];
      if (child.type === 'ModelTable') {
        childrenId = child.childIds;
      }
    });
    const dataItem: string[] = [];
    childrenId.forEach((cid: any) => {
      // const child = register.store.get(cid);
      const child = cid;
      if (child.type === 'ModelTableColumn') {
        dataItem.push(child.props.key);
      }
      if (child.type === 'ModelTableGroup') {
        child.childIds.forEach(groupCid => {
          // const c = register.store.get(groupCid);
          const c = groupCid;
          if (c.type === 'ModelTableColumn') {
            dataItem.push(`${child.props.key}.${c.props.key}`);
          }
        });
      }
    });
    return dataItem;
  }

  allChange (el: any) {
    const val: boolean = el.target.checked;
    this.dataList.forEach((res: any) => {
      res.checked = val;
      if (res.properties) {
        res.properties.forEach((child: any) => {
          child.checked = val;
        });
      }
    });
    this.dataList = [...this.dataList];
  }

  handleOk () {
    this.disabled = true;
    const {
      appCode,
      bizGroupCode,
      bizModuleCode,
      schemaCode,
      domainCode,
    } = this;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const columns: any = [];
    const subSchemaExportModels: any = [];
    // const childColumns: any = [];
    this.dataList.forEach((res: any) => {
      if (res.checked && !res.isSub) {
        columns.push(res.code);
      }
      if (res.isSub) {
        // 是否子表
        const childColumns: any = [];
        const targetSchema = that.relations.find((inner: any) => {
          if (res.schemaCode === inner.target.schemaCode) {
            return true;
          }
        });
        res.properties.forEach((child: any) => {
          if (child.checked) {
            childColumns.push(child.code);
          }
        });
        if (childColumns.length > 0) {
          subSchemaExportModels.push({
            appCode,
            bizGroupCode,
            bizModuleCode,
            domainCode,
            schemaCode: res.schemaCode,
            properties: childColumns,
          });
          columns.push(targetSchema.source.propertyCode);
        }
      }
    });

    /* 追加过滤条件 */
    let condition = {};
    const h3ui: any = (window as any).h3ui;
    const dataSource: any = h3ui.models[this.schemaCode];
    if (dataSource) {
      let filter = this.queryFilter;
      /* 追加已选行 */
      if (this.selectedKeys && this.selectedKeys.length) {
        console.log(this.selectedKeys);
        filter = Object.assign({}, filter, {
          id: this.selectedKeys,
        });
      }
      condition = dataSource.toQueryCondition(filter);
    }

    const params = {
      appCode,
      bizGroupCode,
      bizModuleCode,
      domainCode,
      schemaCode,
      properties: columns,
      isPermission: true,
      subSchemaExportModels,
      condition,
    };
  }

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

  handleCancel () {
    this.$emit('close');
  }

  // 导出任务列表
  downFiles () {
    const { appCode, code } = this.$route.params;

    const pageCode = this.$route.query.pageCode as string;

    const data: any = {
      name: 'fileDown',
      pageCode: pageCode || code,
      isBlank: true,
      query: {
        appCode,
        code: code || pageCode,
      },
    };
    this.goPage(data);
  }

  goPage ({ pageCode, isBlank, query }) {
    // eslint-disable-next-line no-param-reassign
    query = Object.assign({}, query, {
      pageCode: pageCode || '',
    });

    // const to = {
    //   name: 'Home',
    //   params: {
    //     appCode: this.appInfo.appCode,
    //   },
    //   query,
    // };
    // if (isBlank) {
    //   const uri = this.$router.resolve(to);
    //   window.open(uri.href);
    // } else {
    //   this.$router.push(to);
    // }
  }
}
</script>

<style lang="less">
.modal-table-export {
  /deep/.ant-modal-body {
    padding: 24px 0;
  }
  .export {
    padding: 0 24px;
    &-header {
      margin: -24px;
      padding: 0 24px;
      margin-bottom: 0;
      background: rgba(244, 245, 248, 0.65);
      .ant-checkbox-wrapper {
        padding: 8.5px 0;
        margin-right: 8px;
      }
    }
    &-content {
      max-height: 600px;
      overflow-y: auto;
      &-item {
        .ant-checkbox-wrapper {
          padding: 6px 0;
        }
        float: left;
        width: 33%;
        .sheet-item {
          padding-left: 8px;
        }
      }
      &-subsheet {
        &--left {
          padding-top: 8px;
          padding-right: 8px;
          flex: 0;
        }
        &--right {
          flex: 1;
        }
        display: flex;
        width: 100%;
        float: left;
        &--content {
          max-height: 300px;
          overflow-y: auto;
          .item {
            .ant-checkbox-wrapper {
              padding: 6px 0;
            }
            float: left;
            width: 33%;
            .sub-sheet-item {
              padding-left: 8px;
            }
          }
        }
      }
    }
  }
  .footer-box {
    display: flex;
    justify-content: space-between;
    padding: 20px 24px 0 24px;
    border-top: 1px solid #e8e8e8;
    margin-top: 16px;
  }
  .export-text {
    color: @primary-color;
    line-height: 32px;
    text-decoration: underline;
    cursor: pointer;
  }
  .export-btn {
    margin-left: 10px;
  }
  .export-inner {
    text-align: center;
  }
  .building-text {
    color: #000;
    font-size: 16px;
    line-height: 40px;
    font-weight: 500;
  }
  .down-text {
    color: rgba(0, 0, 0, 0.65);
    line-height: 40px;
    margin-bottom: 30px;
  }
}
</style>
