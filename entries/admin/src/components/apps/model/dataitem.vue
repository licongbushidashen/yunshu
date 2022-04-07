<template>
  <div class="data-item">
    <template v-if="isLoading">
      <div class="loading-icon">
        <a-spin :tip="$t('languages.Apps.Loading')" size="large"/>
      </div>
    </template>
    <template v-else>
      <div class="no-data" v-if="dataItemList.length === 0">
        <div class="no-data-tips">
          <img src="../../../assets/images/userEmpty.png"/>
          <!--          <p class="tips">{{ $t('languages.Apps.AddTips') }}</p>-->
          <p class="btn">
            <a-button @click="addDataItem" type="primary">
              <i class="icon aufontAll h-icon-all-plus-o"></i>
              新建数据项
            </a-button>
          </p>
        </div>
      </div>
      <div class="data-item-content" v-else>
        <div class="form clearfix">
          <div class="input-group">
            <div>
              <a-input
                :placeholder="$t('languages.PlaceHolder.SearchByCodeOrName')"
                @change="filterList"
                class="w240"
                v-model="keyWords"
              >
                <a-icon class="del-icon" slot="prefix" type="search"/>
                <a-icon
                  @click="clearKeyWords"
                  class="del-icon"
                  slot="suffix"
                  type="close-circle"
                  v-if="keyWords"
                />
              </a-input>
            </div>
          </div>
          <div class="btn-group">
            <span class="data-item-tips">
              <span>模型下的数据项会在数据库中生成字段，创建后可以在表单、流程、列表中使用。</span>
            </span>
            <a-button @click="publishDataItem" type="primary">
              <i class="icon aufontAll h-icon-all-plane-o"></i>
              {{ $t('languages.Apps.Publish') }}
            </a-button>
          </div>
        </div>
        <div class="data-title">
          <div class="title">
              <span>
                {{ $t('languages.Apps.Summary') }}
                <a-tooltip :title="$t('languages.Apps.SummaryTips')">
                  <a-icon type="question-circle-o"/>
                </a-tooltip>:
              </span>
          </div>
          <div style="line-height: 0.9">
            <data-item-input class="w320" v-if="isUpdate"/>
          </div>
        </div>
        <div class="model-add-data">
          <a-button @click="addDataItem" block style="width: 100px" type="link">+ 新建数据项</a-button>
          <a-dropdown placement="bottomRight">
            <a @click.prevent class="ant-dropdown-link">
              切换展示
              <i
                class="icon aufontAll h-icon-all-down-o"
                style="font-size: 12px"></i>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <a @click.self="changeView('asc')" href="javascript:;">按最早创建</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click.self="changeView('desc')" href="javascript:;">按最新创建</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click.self="doRank(item)" href="javascript:;">自定义顺序</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div class="table">
          <data-item-list :columns="columns" :dataSource="filterDataItemList" :loading="loading"
                          @sortChildrenRankList="sortChildrenRankList" @sortEnd="sortEnd">
            <span slot="indexTitle">{{ $t('languages.NO') }}</span>
            <span class="resize" slot="codeTitle">{{ $t('languages.Apps.Code') }}</span>
            <span class="resize" slot="nameTitle">{{ $t('languages.Apps.Name') }}</span>
            <span class="resize" slot="propertyNameTitle">{{ $t('languages.Apps.DataType') }}</span>
            <span class="resize" slot="attributesTitle">属性
              <a-tooltip>
                <template slot="title">
                  <div class="tool-tip">
                    <div>
                      <span class="icon aufontAll h-icon-all-flow-pass" style="margin-right:10px; color: #17BC94"></span>已设置
                    </div>
                     <div>
                      <span class="icon aufontAll h-icon-all-flow-pass" style="margin-right:10px; color: #dddddd"></span>未设置
                    </div>
                  </div>
                </template>
                <span class="icon aufontAll h-icon-all-question-circle-o" style="font-size:12px;"></span>
              </a-tooltip>
            </span>
            <span class="resize" slot="propertyIndexTitle">{{ $t('languages.Apps.StorageOption') }}</span>
            <span class="resize" slot="publishedTitle">{{ $t('languages.Apps.Publish') }}</span>
            <span class="resize" slot="actionTitle">{{ $t('languages.Apps.Action') }}</span>
            <!-- 数据插槽 -->
            <p slot="index" slot-scope="{ record, text }">{{ record.text }}</p>
            <p
              class="text-ellipsis"
              slot="code"
              slot-scope="{ record, text }"
            >
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ text }}</span>
                </template>
                <span v-hight-light="{'keyWords': keyWords, 'value': text }"></span>
              </a-tooltip>
            </p>
            <p
              :title="text"
              class="text-ellipsis"
              slot="name"
              slot-scope="{ record, text }"
            >
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ text }}</span>
                </template>
                <span v-hight-light="{'keyWords': keyWords, 'value': text }"></span>
              </a-tooltip>
            </p>
            <span
              slot="attributes"
              slot-scope="{ record, text }">
              <span v-for="item in getAttributes(record)" :key="item.code">
                <template v-if="item.hasAttribute">
                  <span v-for="(x, index) in item.attributes" :key="index">
                    <span class="icon aufontAll h-icon-all-flow-pass" style="margin-right:5px; font-size: 14px;" :class="x.checked ? 'setDone' : 'unSet'"></span> {{ x.display }}
                  </span>
                </template>
                <template v-else>--</template>
              </span>
            </span>
            <span
              slot="propertyTypeName"
              slot-scope="{ record, text }"
            >{{ text }}</span>
            <span
              slot="propertyIndex"
              slot-scope="{ record, text }"
            >
              <template v-if="text">{{ $t('languages.Apps.Index') }}</template>
              <template v-if="text && record.propertyEmpty">、</template>
              <template v-if="record.propertyEmpty">{{ $t('languages.Apps.IsEmpty') }}</template>
              <template v-if="!text && !record.propertyEmpty">- -</template>
            </span>
            <span slot="published" slot-scope="{ record, text }">
              <a-tag color="blue" v-if="text">已发布</a-tag>
              <a-tag style="color: rgba(0, 0, 0, 0.25)" v-else>未发布</a-tag>
            </span>
            <span
              class="action right"
              slot="action"
              slot-scope="{ record, text }"
              v-if="record.isSchema"
            >
              <i
                @click="addDataItem(record)"
                class="icon aufontAll h-icon-all-plus-o"
                v-if="record.propertyType === 8"
              ></i>
              <i @click="editDataItem(record)" class="icon aufontAll h-icon-all-edit-o"></i>
              <i @click="viewQuote(record)" class="icon aufontAll h-icon-all-confluence-o" v-if="record.defaultProperty"></i>
              <i @click="deleDataItem(record)" class="icon aufontAll h-icon-all-delete-o"
                 v-if="record.propertyType === 8"></i>
              <a-dropdown v-else-if="!record.defaultProperty">
                <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
                <a-menu slot="overlay">
                  <a-menu-item @click="viewQuote(record)">
                    查看引用
                  </a-menu-item>
                  <a-menu-item @click="deleDataItem(record)" v-if="record.code !== 'parentId'">
                    删除
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </span>
          </data-item-list>
        </div>
      </div>
    </template>
    <!-- 增加数据项 -->
    <a-drawer
      :closable="true"
      :title="modeTitle"
      :visible="infoVisible"
      @close="onCloseInfoModal"
      placement="right"
      v-if="infoVisible"
      width="850"
      wrapClassName="user-info-drawer"
    >
      <DataItemBaseModel></DataItemBaseModel>
    </a-drawer>
    <!-- 查看引用 -->
    <a-drawer
      :closable="true"
      :visible="quoteVisible"
      @close="onCloseQuote"
      placement="right"
      title="查看引用"
      v-if="quoteVisible"
      width="850"
      wrapClassName="quote-drawer"
    >
      <p class="summary">以下{{quoteTableData?quoteTableData.length:0}}个业务模型引用了当前数据项</p>
      <a-table :columns="quoteTableColumns" :dataSource="quoteTableData" :pagination="false" class="quoteTable"
               size="middle">
        <template slot="index" slot-scope="text, record, index">{{index+1}}</template>
      </a-table>
    </a-drawer>
    <div class="data-item__tips">
      <a-alert
        @close="isShowTips = true"
        closable
        message="删除数据项成功，请重新发布表单！"
        showIcon
        type="warning"
        v-show="isShowTips"
      />
    </div>

    <a-modal
      :keyboard="false"
      :maskClosable="false"
      :visible="visible"
      @cancel="visible = !visible"
      @ok="handleOk"
      cancelText="暂不配置"
      class="config-tips"
      okText="前往配置"
      title="提示"
      width="422px"
    >
      <p>钉钉信息未配置，无法发布</p>
      <p>
        请前往
        <span class="heighlight">系统管理-常规设置</span> 配置钉钉信息
      </p>
    </a-modal>

    <a-modal
      :keyboard="false"
      :maskClosable="false"
      :visible="rankShow"
      @cancel="close"
      @ok="rank"
      cancelText="取消"
      class="rank-modal"
      okText="确定"
      title="字段排序"
      width="552px"
    >
      <!-- <div v-for="(item,index) in filterDataItemList"
      :key="index"
      class="rank-modal-item"
     >
      {{ item.name }}
      </div>-->
      <dataitem-rank
        :dataItemList="filterDataItemList"
        @sortChildrenRankList="sortChildrenRankList"
        @sortEnd="sortEnd"
        v-if="rankShow"
      />
    </a-modal>
  </div>
</template>
<style lang="less">
  .config-tips {
    p {
      margin-bottom: 8px;

      .heighlight {
        color: @primary-color;
      }
    }

    .rank-modal {
      .rank-modal-item {
        float: left;
      }
    }
  }
</style>

<style lang="less" scoped>
  .setDone {
    color: #17BC94;
  }
  .unSet {
    color: #dddddd;
  }
  .action {
    i {
      cursor: pointer;
      padding: 0 8px;
    }
  }

  .data-item {
    text-align: center;
    margin: 12px;

    .data-item-tips {
      text-align: left;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 2px;
      line-height: 20px;
    }

    &__tips {
      top: 65px;
      right: 50%;
      margin-right: -151.5px;
      width: 303px;
      position: fixed;
      z-index: 800;
    }

    margin-top: 0;
    // height: calc(100vh - 64px);
    position: relative;

    .loading-icon {
      // position: absolute;
      // top: 50%;
      margin-top: 100px;
      // left: 50%;
    }

    .no-data {
      // display: none;
      & > div.no-data-tips {
        margin-top: 143px;
      }

      .tips {
        font-weight: 400;
        margin: 24px 0;
      }

      .btn {
        i {
          padding-right: 3px;
        }
      }
    }

    .data-item-content {
      position: relative;

      .form {
        margin-top: 16px;
        margin-bottom: 16px;

        .input-group {
          /deep/ .del-icon {
            color: rgba(0, 0, 0, 0.25);
          }

          & > div {
            float: left;
          }

          /deep/ .w240 {
            width: 240px;
            margin-right: 24px;
          }
        }

        .btn-group {
          float: right;

          .btn {
            margin-right: 8px;
          }

          i {
            font-size: 14px;
            margin-right: 8px;
          }
        }
      }

      .data-title {
        width: 100%;
        height: 32px;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 4px;
        padding: 0 8px;
        display: flex;
        margin-bottom: 12px;

        & > div.title {
          margin-right: 8px;
          line-height: 30px;

          i {
            font-size: 14px;
            // margin-right: 6px;
            color: rgba(0, 0, 0, 0.65);
          }
        }

        /deep/ .w320 {
          min-width: 320px;
          max-width: 500px;
          margin-right: 24px;

          .ant-select-selection {
            max-height: 60px;
            overflow-x: auto;
          }
        }
      }

      .model-add-data {
        display: flex;
        justify-content: space-between;
      }

      .table {
        // /deep/.ant-table-thead span {
        //   font-weight: 600;
        //   color: rgba(0,0,0,0.65);
        // }
        /deep/ .ant-table-body {
          color: rgba(0, 0, 0, 0.85);
          max-height: calc(100vh - 250px) !important;
          // &::-webkit-scrollbar{
          //   width: 0;
          // }
          table {
            padding: 0;

            tr[data-row-key='id'],
            tr[data-row-key='name'],
            tr[data-row-key='createBy'],
            tr[data-row-key='createByParentId'],
            tr[data-row-key='ownerId'],
            tr[data-row-key='ownerIdParentId'],
            tr[data-row-key='createdTime'],
            tr[data-row-key='modifiedBy'],
            tr[data-row-key='modifiedTime'],
            tr[data-row-key='runnigInstanceId'],
            tr[data-row-key*='-id'],
            tr[data-row-key*='-parentId'] {
              display: none;
            }

            th,
            td {
              color: rgba(0, 0, 0, 0.85);

              .disableColor {
                color: rgba(0, 0, 0, 0.25);
              }

              .checkbox {
                cursor: default;
              }

              .ant-checkbox-wrapper:hover .ant-checkbox-inner,
              .ant-checkbox-wrapper .ant-checkbox-inner {
                border-color: #d9d9d9;
              }

              .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
                // border: 0;
                border-color: @primary-color;
              }

              // text-align: center !important;
              .noborder {
                border-left: 0;
              }

              .theme,
              .highlight {
                color: @primary-color;
              }

              .action {
                i {
                  cursor: pointer;
                  padding-left: 17px;
                }
              }
            }

            .ant-table-row-level-1 td:first-child {
              // transform: translateX(calc(100% - 16px));
              text-align: right !important;
              padding-right: 0;

              span {
                display: none;
              }
            }

            .ant-table-row-level-1 {
              .second-td {
                position: relative;
                z-index: 1;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }

            .ant-table-row-level-0 td:first-child {
              position: relative;

              .ant-table-row-expand-icon {
                position: absolute;
                top: calc(50% - 8px);
                left: calc(100% - 16px);
              }
            }
          }
        }
      }
    }
  }

  .select-title {
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px !important;
  }

  .second-td {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .quote-drawer {
    p.summary {
      font-size: 16px;
      margin: 3px 0 20px;
    }
  }
  .tool-tip {
    padding: 0px 10px;
    font-family: PingFangSC-Regular;
    color: #FFFFFF 100%;
    div {
      margin: 5px 0;
    }
  }
</style>
<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator';
  import {namespace} from 'vuex-class';
  import DataItemBaseModel from './dataitem-modals/dataItemBaseModel.vue';
  import Bus from '../../../utils/bus';
  import {DataItemType} from "@cloudpivot/form/schema";

  import DataitemRank from './dataitem-modals/dataitem-rank.vue';

  import {bizpropertyApi} from '@cloudpivot/api';
  import AppsApi from "@/apis/apps";

  import DataModelSummary from '@/components/shared/data-item/summary.vue';

  import DataItemInput from './data-title-input.vue';
  import DataItemList from "@/components/apps/model/data-item-list.vue";

  const DataModelModule = namespace('Apps/DataModel');
  @Component({
    name: 'dataItem',
    components: {
      DataItemBaseModel,
      DataitemRank,
      DataModelSummary,
      DataItemInput,
      DataItemList
    },
  })
  export default class DataItem extends Vue {
    @DataModelModule.State('loading') loading: any;
    @DataModelModule.State('dataItemList') dataItemList: any;

    @DataModelModule.State('filterDataItemList') filterDataItemList: any;

    @DataModelModule.State('dataItemTypeList') dataItemTypeList: any;

    // 数据项类型
    @DataModelModule.State('bizPropertyModel') bizPropertyModel: any;

    // 新增数据项
    @DataModelModule.State('bizSchemaModelList') bizSchemaModelList: any;

    @DataModelModule.State('summaryList') summaryList: any;

    @DataModelModule.State('targetSummary') targetSummary: any;

    @DataModelModule.State('defaultSummary') defaultSummary: any;

    @DataModelModule.Mutation('setFilterDataItemList') setFilterDataItemList: any;

    @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

    @DataModelModule.Mutation('setBizPropertyCode') setBizPropertyCodeX: any;

    @DataModelModule.Mutation('setCurrenEdittMode') setEditMode: any;

    // 编辑或新增模式
    @DataModelModule.Mutation('setDrawerVisible') setDrawerVisible: any;

    @DataModelModule.Mutation('setLang') setLang: any;

    // drawer显示隐藏
    @DataModelModule.Mutation('setSummary') setSummaryX: any;

    @DataModelModule.Mutation('setKeyWords') setKeyWords: any;

    @DataModelModule.Mutation('setLoading') setLoading: any;

    @DataModelModule.Action('deleteDataItem') deleteDataItemX: any;

    @DataModelModule.Action('forceDeleteDataItem') forceDeleteDataItemX: any;

    @DataModelModule.Action('getDataItemList') getDataItemListX: any;

    @DataModelModule.Action('publishDataItem') publishDataItemX: any;

    @DataModelModule.Action('getDataItemType') getDataItemType: any;

    @DataModelModule.Action('getBussinessType') getBussinessType: any;

    @DataModelModule.Action('getSummary') getSummaryX: any;

    @DataModelModule.Action('submitSummary') submitSummaryX: any;

    get bizSchemaCode() {
      return this.$route.params.bizSchemaCode;
    }

    get defaultSummaryList() {
      return this.summaryList.filter((data: any) => data.defaultProperty);
    }

    get bizSummaryList() {
      return this.summaryList.filter(
        (data: any) =>
          !data.defaultProperty && data.propertyType !== 10 && data.published
      );
    }

    radioStyle: any = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    }

    getAttributes(record: any) {
      let tip: any = [];
      const type: number = record.propertyType;
      let isChecked: boolean = false;
      if (record.code === 'sequenceNo') {
        let attributes: any[] = [];
        if (record.options) {
          attributes.push({
            display: '单据号设置',
            checked: true,
          })
        } else {
          attributes.push({
            display: '单据号设置',
            checked: false,
          })
        }
        tip.push({
          code: 'sequenceNo',
          hasAttribute: true,
          attributes: attributes
        })
        return tip;
      } else if (record.code === 'createdDeptId' || type === DataItemType.Sheet) {
        tip.push({
          code: record.code,
          hasAttribute: false,
        })
      } else if (record.code === 'createdTime' || record.code === 'modifiedTime') {
        let attributes: any[] = [];
        // attributes.push({
        //   display: '默认格式',
        //   checked: true,
        // })
        if (record.options) {
          try {
            let tmpJsonObj = JSON.parse(record.options)
            if (tmpJsonObj) {
              for(let key in tmpJsonObj) {
                if (key === "format") {
                  if (tmpJsonObj[key]) {
                    attributes.push({
                      display: '默认格式',
                      checked: true,
                    })
                  } else {
                    attributes.push({
                      display: '默认格式',
                      checked: false,
                    })
                  }
                }
              }
            }
          }
          catch(err) {
            console.log(err);
          }          
        } else {
          attributes.push({
            display: '默认格式',
            checked: false,
          })
        }
        tip.push({
          code: record.code,
          hasAttribute: true,
          attributes: attributes
        })
      } else {
        let attributes: any[] = [];
        switch (type) {
          case DataItemType.Number:
          case DataItemType.Date:
            if (record.options) {
              try {
                let tmpJsonObj = JSON.parse(record.options)
                if (tmpJsonObj) {
                  for(let key in tmpJsonObj) {
                    if (key === "format") {
                      if (tmpJsonObj[key]) {
                        attributes.push({
                          display: '默认格式',
                          checked: true,
                        })
                      } else {
                        attributes.push({
                          display: '默认格式',
                          checked: false,
                        })
                      }
                    }
                  }
                }
              }
              catch(err) {
                console.log(err);
              }          
            } else {
              attributes.push({
                display: '默认格式',
                checked: false,
              })
            }
            break;
          case DataItemType.Radio:
          case DataItemType.Checkbox:
          case DataItemType.Dropdown:
          case DataItemType.DropdownMulti:
            if (record.options) {
              try {
                let tmpJsonObj = JSON.parse(record.options)
                if (tmpJsonObj) {
                  for(let key in tmpJsonObj) {
                    if (key === "options") {
                      if (tmpJsonObj[key]) {
                        attributes.push({
                          display: '选项设置',
                          checked: true,
                        })
                      } else {
                        attributes.push({
                          display: '选项设置',
                          checked: false,
                        })
                      }
                    }
                  }
                }
              }
              catch(err) {
                console.log(err);
              }          
            } else {
              attributes.push({
                display: '选项设置',
                checked: false,
              })
            }
            break;
          case DataItemType.StaffSingle:
          case DataItemType.StaffDeptMix:
            if (record.options) {
              try {
                let tmpJsonObj = JSON.parse(record.options)
                if (tmpJsonObj) {
                  for(let key in tmpJsonObj) {
                    if (key === "mappings") {
                      if (tmpJsonObj[key]) {
                        attributes.push({
                          display: '映射',
                          checked: true,
                        })
                      } else {
                        attributes.push({
                          display: '映射',
                          checked: false,
                        })
                      }
                    }
                  }
                }
              }
              catch(err) {
                console.log(err);
              }          
            } else {
              attributes.push({
                display: '映射',
                checked: false,
              })
            }
            break;
          case DataItemType.RelevanceFormEx:
          case DataItemType.RelevanceForm:
            if (record.options) {
              try {
                let tmpJsonObj = JSON.parse(record.options)
                if (tmpJsonObj) {
                  for(let key in tmpJsonObj) {
                    if (key === "mappings") {
                      if (tmpJsonObj[key]) {
                        attributes.push({
                          display: '映射',
                          checked: true,
                        })
                      } else {
                        attributes.push({
                          display: '映射',
                          checked: false,
                        })
                      }
                    }
                  }
                }
              }
              catch(err) {
                console.log(err);
              }          
            } else {
              attributes.push({
                display: '映射',
                checked: false,
              })
            }
            break;
          case DataItemType.ShortText:
            if (record.options) {
              try {
                let tmpJsonObj = JSON.parse(record.options)
                if (tmpJsonObj) {
                  for(let key in tmpJsonObj) {
                    if (key === "dictionaryData") {
                      if (tmpJsonObj[key]) {
                        attributes.push({
                          display: '数据字典',
                          checked: true,
                        })
                      } else {
                        attributes.push({
                          display: '数据字典',
                          checked: false,
                        })
                      }
                    }
                  }
                }
              }
              catch(err) {
                console.log(err);
              }
            } else {
              attributes.push({
                display: '数据字典',
                checked: false,
              })
            }
            break;
          default:
            break;
        }
        if (Array.isArray(attributes) && attributes.length > 0) {
          tip.push({
            code: record.code,
            hasAttribute: true,
            attributes: attributes
          })
        } else {
          tip.push({
            code: record.code,
            hasAttribute: false,
          })
        }
      }
      return tip;
    }

    @Watch('infoVisible', {deep: true})
    setInfoVisible(v: boolean) {
      // console.info('000___', v);
      this.setDrawerVisible(v);
    }

    keyWords: string = '';

    infoVisible: boolean = false;

    quoteVisible: boolean = false;

    isLoading: boolean = true;

    modeTitle: string = '';

    defaultVal: Array<string> = [];

    isShowTips: boolean = false;

    visible: boolean = false;

    rankShow = false;

    isUpdate: boolean = true; // 是否更新组件

    tableLoading = false; // 表格loading状态

    expandedRowKeys: any = ''; //设置展开的子表行

    // 表格配置
    columns: Array<Common.TableHead> = [
      // {
      //   dataIndex: 'index',
      //   slots: { title: 'indexTitle' },
      //   scopedSlots: { customRender: 'index' },
      //   width: 100,
      //   key: 'index',
      //   align: 'center',
      // },
      {
        dataIndex: 'code',
        key: 'code',
        slots: {title: 'codeTitle'},
        scopedSlots: {
          customRender: 'code',
        },
        align: 'left',
      },
      {
        dataIndex: 'name',
        slots: {title: 'nameTitle'},
        scopedSlots: {
          customRender: 'name',
        },
        key: 'name',
        align: 'left',
      },
      {
        dataIndex: 'propertyTypeName',
        slots: {title: 'propertyNameTitle'},
        scopedSlots: {customRender: 'propertyTypeName'},
        key: 'propertyTypeName',
        align: 'left',
      },
      {
        dataIndex: 'attributes',
        slots: {title: 'attributesTitle'},
        scopedSlots: {
          customRender: 'attributes',
        },
        key: 'attributes',
        align: 'left',
      },
      {
        dataIndex: 'propertyIndex',
        slots: {title: 'propertyIndexTitle'},
        scopedSlots: {customRender: 'propertyIndex'},
        width: 200,
        key: 'propertyIndex',
        align: 'left',
      },
      {
        dataIndex: 'published',
        slots: {title: 'publishedTitle'},
        scopedSlots: {customRender: 'published'},
        width: 100,
        key: 'published',
        align: 'left',
      },
      {
        dataIndex: 'action',
        slots: {title: 'actionTitle'},
        scopedSlots: {customRender: 'action'},
        width: 120,
        key: 'action',
        align: 'right',
      },
    ];

    // 查看引用表格配置
    quoteTableColumns = [
      {
        title: '序号',
        with: '158',
        scopedSlots: {customRender: 'index'},
      },
      {
        title: '业务模型',
        dataIndex: 'schemaName',
        with: 208
      },
      {
        title: '引用位置',
        dataIndex: 'quotePath'
      },
    ];

    // 查看引用表格配置
    quoteTableData = [];

    doRank() {
      this.rankShow = true;
      this.rankList = this.filterDataItemList.map((res: any) => res.code);
    }
    sortType: string = 'asc';
    changeView(sortType: string) {
      this.sortType = sortType;
      this.getDataItemListX({sortType}).then(() => {
        this.filterList(); // 对请求到数据过滤
        this.isLoading = false;
      });
    }

    rank() {
      const vm: any = this;
      const params = {
        schemaCode: this.bizSchemaCode,
        codes: this.rankList.join(',') as string,
        child: this.childrenRankList,
      };
      bizpropertyApi.sortkeys(params).then((res) => {
        if (res.errcode === 0) {
          vm.rankShow = false;
          vm.getDataItemListX().then(() => {
            // 删除数据后刷新例表
            vm.filterList();
            vm.isLoading = false;
          });
        } else {
          vm.$message.error(res.errmsg);
        }
      });
    }

    rankList: string[] = [];

    sortEnd(list: string[], status: boolean) {
      this.setLoading(true);
      if (list.length > 0) {
        this.rankList = list;
      }
      if (status) {
        this.rank();
      }
    }

    childrenRankList: any = {};

    sortChildrenRankList(list: string, sheetCode: string, status: boolean) {
      this.childrenRankList[sheetCode] = list;
      if (status) {
        if (this.rankList.length === 0) {
          this.rankList = this.filterDataItemList.map((res: any) => res.code);
        }
        this.rank();
      }
    }

    close() {
      this.rankShow = false;
      this.setLoading(false);
      this.rankList = [];
    }

    // 生命周期
    created() {
      this.setBizSchemaCodeX(this.bizSchemaCode);
      this.getDataItemListX({sortType: 'asc'}).then(() => {
        this.filterList(); // 对请求到数据过滤
        this.isLoading = false;
      });
      this.getDataItemType();
      // this.getBussinessType(); // 业务类型
      this.getSummaryX(); // 获取摘要
    }

    mounted() {
      Bus.$on('isAddContinue', (v: any) => {
        this.infoVisible = !!v; // 数据项是按下【保存】false 还是【保存继续】true
      });
    }

    beforeDestroy() {
      Bus.$off('isAddContinue');
    }

    // 方法
    clearKeyWords() {
      this.keyWords = '';
      this.filterList();
      this.setKeyWords('');
    }

    // 删除数据项
    deleDataItem(e: any) {
      this.setBizSchemaCodeX(e.schemaCode); //设置当前schemaCode；
      const vm: any = this;
      const {published} = e;
      const content = published
        ? this.$t('languages.Apps.DeleteTipsContent')
        : '';
      vm.$confirm({
        title: this.$t('languages.Apps.DeleteTips', {name: e.name}),
        content,
        okText: this.$t('languages.Ok').toString(),
        cancelText: this.$t('languages.Cancel').toString(),
        onOk() {
          if (published) {
            vm.deletePublish(e);
          } else {
            vm.doForceDelete(e);
          }
        },
      });
    }

    /**
     * 删除已发布数据项
     */
    deletePublish(e: any) {
      const vm: any = this;
      const {published} = e;
      vm.tableLoading = true;
      vm.deleteDataItemX(e.code).then((res: any) => {
        if (res.errcode === 0) {
          // 数据项没有关联后台数据
          vm.doDeleteTips(published);
          vm.getSummaryX(); // 跟新摘要
          vm.setBizSchemaCodeX(vm.bizSchemaCode);
          vm.getDataItemListX({sortType: this.sortType}).then(() => {
            // 删除数据后刷新例表
            vm.filterList();
            vm.isLoading = false;
            vm.tableLoading = false;
          });
        } else if (res.errcode === 10022) {
          // 已近关联相关数据
          vm.forceDeleteDataItem(e, res.data);
        } else {
          // 数据项关联后台数据
          vm.tableLoading = false;
          vm.$message.error(res.errmsg, 2);
        }
      });
    }

    /**
     *  强制删除api
     */
    doForceDelete(e: any) {
      const {published} = e;
      const vm: any = this;
      vm.tableLoading = true;
      vm.forceDeleteDataItemX(e.code).then((res: any) => {
        if (!res.errcode) {
          vm.doDeleteTips(published);
          vm.setBizSchemaCodeX(vm.bizSchemaCode);
          vm.getDataItemListX({sortType: this.sortType}).then(() => {
            // 删除数据后刷新例表
            vm.filterList();
            vm.isLoading = false;
          });
        } else {
          vm.$message.error(res.errmsg, 2);
        }
        vm.tableLoading = false;
      });
    }

    // 强制删除数据项
    forceDeleteDataItem(e: any, count: number) {
      const vm: any = this;
      vm.$confirm({
        title: this.$t('languages.Apps.DeleteTips', {name: e.name}),
        content: this.$t('languages.Apps.DeleteDataTips', {count}),
        okText: this.$t('languages.Ok').toString(),
        cancelText: this.$t('languages.Cancel').toString(),
        onOk() {
          vm.doForceDelete(e);
        },
        onCancel() {
          vm.tableLoading = false;
        },
      });
    }

    /**
     * 删除数据项提示
     */
    doDeleteTips(published: boolean) {
      if (published) {
        this.isShowTips = true;
      } else {
        this.$message.success(this.$t('languages.DeleteSuccess') as string, 2);
      }
    }

    // 发布数据项
    publishDataItem() {
      const that: any = this;
      if (!this.targetSummary.length) {
        that.$message.info(this.$t('languages.Apps.SummaryEmptyTips'), 2);
        return;
      }
      this.publishDataItemX().then((res: any) => {
        if (!res.errcode) {
          that.$message.success(this.$t('languages.PublishSuccess'), 2);
          that.getDataItemListX().then(() => {
            // 发布完数据项刷新列表
            that.filterList();
            /* 刷新组件 */
            that.isUpdate = false; // 移除组件
            // 在组件移除后，重新渲染组件
            that.$nextTick(() => {
              that.isUpdate = true;
            });
            that.isLoading = false;
          });
        } else if (+res.errcode === 10013) {
          that.visible = true;
        } else {
          that.$message.error(res.errmsg, 2);
        }
      });
    }

    /**
     *  未配置钉钉信息
     */
    handleOk() {
      this.$router
        .push({
          name: 'commonSetting',
        })
        .catch((err: any) => {
          err;
        });
    }

    // 编辑数据项
    editDataItem(e: any) {
      const str: any = this.$t('languages.Apps.EditDataItem');
      this.setBizSchemaCodeX(e.schemaCode); //设置当前schemaCode；
      this.setBizPropertyCodeX(e.code);
      this.infoVisible = true;
      this.setEditMode('edit'); // edit or add
      this.modeTitle = str;
    }

    // drawer关闭
    onCloseInfoModal() {
      console.log('drawer关闭');
      this.infoVisible = false;
      this.setEditMode('unknow');
      this.setBizPropertyCodeX('');
      this.setBizSchemaCodeX(this.bizSchemaCode);
    }

    viewQuote(item) {
      let {schemaCode, code} = item;
      AppsApi.bizpropertyRefer({schemaCode, bizPropertyCode: code}).then((res) => {
        if (res.errcode !== 0) {
          return this.$message.error((res as any).errmsg);
        }
        if (Array.isArray(res.data)) {
          res.data.forEach(el => {
            if (el.schemaCode === schemaCode) {
              el.schemaName = '本模型'
            }
          });
        }
        this.quoteTableData = res.data;
        this.quoteVisible = true;
      })
    }

    onCloseQuote(item) {
      this.quoteTableData = [];
      this.quoteVisible = false;
    }

    addDataItem(record?: any) {
      //子表新增传子表的code 主表新增传当前模型的schemaCode
      let schemaCode = record.code || this.bizSchemaCode;
      this.expandedRowKeys = [schemaCode];
      this.setBizSchemaCodeX(schemaCode); //设置当前schemaCode；
      const str: any = this.$t('languages.Apps.AddDataItem');
      this.infoVisible = true;
      console.info('0000', this.infoVisible);
      this.setEditMode('add'); // edit or add
      this.setBizPropertyCodeX('');
      this.modeTitle = str;
    }

    handleExpand(expanded, record) {
      console.log(expanded, 'expanded');
      console.log(record, 'record');
    }

    // 过滤
    filterList() {
      const that = this;
      setTimeout(() => {
        this.setFilterDataItemList(that.keyWords);
        this.setKeyWords(that.keyWords);
      }, 200);
    }

    // 摘要选择
    summaryChange(val: Array<string>) {
      this.setSummaryX(val);
      this.submitSummaryX();
    }

    @Watch('$i18n.locale')
    onLanguageChange() {
      this.setLang();
      // this.lang = localStorage.getItem('locale') || 'zh';
    }
  }
</script>
