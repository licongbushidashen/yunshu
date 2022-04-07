<template>
  <div class="update-code">
    <div class="table-box">
      <div class="table-box-tip">
        <i class="icon aufontAll h-icon-all-check-circle exclamation-circle"></i>
        <span class="file-status-txt">检测到编码重名，修改后导入将生成新的应用或业务模型</span>
      </div>
      <a-tabs :activeKey="tabKey" @tabClick="tabClick">
          <a-tab-pane key="1" v-if="(type.appCodeRepeat || type.recycleCodeRepeat) && list.appCodeList.length > 0">
            <span slot="tab">
              应用<i style="color: red;">*</i>
            </span>

            <a-table :pagination="false" :columns="appCodeColumns" :data-source="list.appCodeList">
              <template slot="newCode" slot-scope="text, record">
                <div class="model-item">
                  <a-input
                    :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                    v-model="record.newCode"
                    maxlength="24"></a-input>
                </div>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="2" v-if="type.modelCodeRepeat && list.modelCodeList.length > 0">
            <span slot="tab">
              模型<i style="color: red;">*</i>
            </span>

            <a-table :pagination="false" :columns="modelCodeColumns" :data-source="list.modelCodeList">
              <template slot="newCode" slot-scope="text, record">
                <div class="model-item">
                  <a-input
                    :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                    v-model="record.newCode"
                    maxlength="24"></a-input>
                </div>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="3" v-if="type.modelCodeRepeat && list.subCodeList.length > 0">
            <span slot="tab">
              子表<i style="color: red;">*</i>
            </span>
            <a-input-search v-model="searchSubCodeText" placeholder="请输入子表名称" style="width: 260px"  />
            <template v-for="(item, key) in subClassificationList">
              <div class="collapse" :key="key" >
                <div class="collapse-title" @click="toogleShow(item)">
                  <span>
                    <a-icon type="right" v-if="item[0].show"/>
                    <a-icon type="down" v-else/>
                  </span>
                  <font>{{item[0].parentSchemaName}}</font></div>
                <div class="collapse-content" v-show="!item[0].show && getSubCodeItem(item).length">
                  <a-table :pagination="false" :columns="modelCodeColumns" :data-source="getSubCodeItem(item)">
                    <template slot="newCode" slot-scope="text, record">
                      <div class="model-item">
                        <a-input
                          :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                          v-model="record.newCode"
                          maxlength="24"></a-input>
                      </div>
                    </template>
                  </a-table>
                </div>
              </div>
            </template>
          </a-tab-pane>

          <a-tab-pane key="4" v-if="Object.keys(list.formModelMap).length">
            <span slot="tab">
              表单
            </span>
            <a-input-search v-model="searchFormModelText" placeholder="请输入表单名称" style="width: 260px"  />
            <template v-for="(item, key) in list.formModelMap">
              <div class="collapse" :key="key" >
                <div class="collapse-title" @click="toogleShow(item)">
                  <span>
                    <a-icon type="right" v-if="item[0].show"/>
                    <a-icon type="down" v-else/>
                  </span>
                  <font>{{item[0].schemaName}}</font></div>
                <div class="collapse-content" v-show="!item[0].show && getFormModelItem(item).length">
                  <a-table :pagination="false" :columns="formModelColumns" :data-source="getFormModelItem(item)">
                    <template slot="newCode" slot-scope="text, record">
                      <div class="model-item">
                        <a-input
                          :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                          v-model="record.newCode"
                          maxlength="24"></a-input>
                      </div>
                    </template>
                  </a-table>
                </div>
              </div>
            </template>
          </a-tab-pane>

          <a-tab-pane key="5" v-if="list.workflowList.length">
            <span slot="tab">
              流程
            </span>

            <a-table :pagination="false" :columns="workflowColumns" :data-source="list.workflowList">
              <template slot="newCode" slot-scope="text, record">
                <div class="model-item">
                  <a-input
                    :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                    v-model="record.newCode"
                    maxlength="24"></a-input>
                </div>
              </template>
            </a-table>
          </a-tab-pane>
      </a-tabs>
    </div>
  </div> 
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';

import { Input } from '@h3/antd-vue';

@Component({
  name:"update-code",
  components: {
    AInput: Input
  }
})
export default class UpdateCode extends Vue {

  @Prop() type !: any;

  /*
  {
    appCodeList: [],
    modelCodeList: []
  }
  */ 
  @Prop() list !: any;

  @Watch('list', {
    deep: true,
    immediate: true
  })
  onListChange(){
    let appLen = this.list.appCodeList.length
    let modelLen = this.list.modelCodeList.length
    let subLen = this.list.subCodeList.length
    if(appLen === 0 && modelLen > 0){
      this.tabKey = "2"
    }else if(appLen === 0 && modelLen === 0 && subLen > 0){
      this.tabKey = "3"
    }else if(appLen === 0 && modelLen === 0 && subLen === 0){
      this.tabKey = "4"
    }
  }

  toogleShow(item){
    this.$set(item[0], 'show', !item[0].show)
    this.$nextTick(() => {
      console.log(item)
      this.$forceUpdate()
    })
  }
  get subClassificationList(){
    let res:any = {}
    let subCodeList = this.list.subCodeList
    this.list.subCodeList.forEach((el:any) => {
      if(res[el.parentSchemaCode]){
        res[el.parentSchemaCode].push(el)
      }else{
        res[el.parentSchemaCode] = [el]
      }
    });
    return res
  }

  searchFormModelText: string = ''
  getFormModelItem(item){
    return item.filter(el => el.sheetName.indexOf(this.searchFormModelText) > -1)
  }
  searchSubCodeText:string = ''
  getSubCodeItem(item){
    return item.filter(el => el.modelName.indexOf(this.searchSubCodeText) > -1)
  }

  // 切换tab
  tabClick(val){
    this.tabKey = val
  }

  tabKey: string = '1';
  appCodeColumns:any[] = [
    {
      title: '应用',
      key: 'appName',
      dataIndex: 'appName'
    },
    {
      title: '原编码',
      key: 'appCode',
      dataIndex: 'appCode'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]

  workflowColumns:any[] = [
    {
      title: '流程',
      key: 'workflowName',
      dataIndex: 'workflowName'
    },
    {
      title: '原编码',
      key: 'workflowCode',
      dataIndex: 'workflowCode'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]

  modelCodeColumns:any[] = [
    {
      title: '模型',
      key: 'modelName',
      dataIndex: 'modelName'
    },
    {
      title: '原编码',
      key: 'modelCode',
      dataIndex: 'modelCode'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]

  formModelColumns:any[] = [
    {
      title: '表单',
      key: 'sheetName',
      dataIndex: 'sheetName'
    },
    {
      title: '原编码',
      key: 'sheetCode',
      dataIndex: 'sheetCode'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]


  getCodeList() {
    let existEmptyAppcode:boolean = false;
    let existEmptyModelcode:boolean = false;
    let existEmptySubCode:boolean = false;
    let existValidAppcode:boolean = false;
    let existValidModelcode:boolean = false;
    let existValidSubCode:boolean = false;
    if (this.list.appCodeList.length > 0) { // 应用
      existEmptyAppcode = this.list.appCodeList.some((item:any) => !item.newCode);
      existValidAppcode = this.list.appCodeList.some((item:any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode));
    }

    if (this.list.modelCodeList.length > 0) { // 模型
      existEmptyModelcode = this.list.modelCodeList.some((item:any) => !item.newCode);
      existValidModelcode = this.list.modelCodeList.some((item:any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode));
    }

    if (this.list.subCodeList.length > 0) { // 子表
      existEmptySubCode = this.list.subCodeList.some((item:any) => !item.newCode);
      existValidSubCode = this.list.subCodeList.some((item:any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode));
    }

    if (existEmptyModelcode || existEmptyAppcode || existEmptySubCode) {
      let type = '应用'
      if(existEmptyAppcode){
        this.tabKey = '1'
        type = '应用'
      }else if(existEmptyModelcode){
        this.tabKey = '2'
        type = '模型'
      }else {
        this.tabKey = '3'
        type = '子表'
      }
      this.$message.error(type + '新编码不能为空')
      return null;
    }

    if(existValidAppcode || existValidModelcode || existValidSubCode) {
      let type = '应用'
      if(existValidAppcode){
        this.tabKey = '1'
        type = '应用'
      }else if(existValidModelcode){
        this.tabKey = '2'
        type = '模型'
      }else {
        this.tabKey = '3'
        type = '子表'
      }

      this.$message.error(type + '编码格式必须以字母开头不超过26个字符，仅支持字母、数字、下划线');
      return null;
    }
    return this.list;
  }
}
</script>
<style lang="less" scoped>
  .ant-input-search{
    margin-bottom: 16px;
  }
  .collapse{
    margin-bottom: 16px;
    .collapse-title{
      height: 38px;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.85);
      line-height: 38px;
      cursor: pointer;
      &:hover{
        color: #17BC94;
        i{
          color: #17BC94;
        }
      }
      span{
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
        margin-right: 8px;
      }
    }
  }

  .update-code {
    .table-box {
      &-tip {
        & > .exclamation-circle {
          color: #FAAD14;
        }
        & > .file-status-txt {
          padding-left: 16px;
          font-weight: bold;
        }
      }
      .code-table {
        padding-left: 32px;
        padding-right: 24px;
        margin-top: 24px;
        margin-bottom: 32px;
        &-head, &-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          & > span {
            display: inline-block;
            width: 30%;
            margin-right: 1.5%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 20px;
            &:last-of-type {
              margin-right: 0;
            }
          }
        }
        &-body {
          margin-top: 8px;
          margin-bottom: 16px;
        }
      }
    }
  }
</style>