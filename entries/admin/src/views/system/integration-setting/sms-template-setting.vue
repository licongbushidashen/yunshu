<template>
  <div class="sms-template-setting">
    <a-button type="primary" @click="showPop('add')">新增</a-button>
    <div class="table-wrapper">
      <a-table
        :columns="columns"
        size="small"
        :pagination="false"
        :loading="false"
        :locale="{ emptyText: '' }"
        :scroll="{ y: 585 }"
        :dataSource="dataSource"
      >

        <div slot="templateType" slot-scope="text, record" class="select-wrap">
          {{getTypeName(record.type)}}
        </div>

        <div slot="actions" slot-scope="text, record" class="select-wrap">
          <span style="margin-right: 8px;" @click="editClick(record)">
            <i class="icon aufontAll h-icon-all-edit-o"></i>
          </span>
          <span v-if="!record.defaults" @click="delClick(record)">
            <i class="icon aufontAll h-icon-all-delete-o"></i>
          </span>
        </div>
      </a-table>
    </div>

    <a-modal
      :visible="popVisible"
      :width="480"
      @cancel="cancelClick"
      @ok="handleOk"
      :title="(popType === 'add' ? '新建' : '编辑') + '短信模板'"
      :maskClosable="false"
    >
      <div class="content">
        <div class="list">
          <label>
            <span><font v-show="popType!== 'edit'">*</font></span>
            模板类型
          </label>
          <div class="right">
            <a-select v-model="currentParams.type" placeholder="请选择" :disabled="popType === 'edit'">
              <a-select-option
                v-for="(item, index) in options"
                :value="item.code"
                :key="index"
                >{{ item.name }}</a-select-option
              >
              <a-select-option
                v-if="popType === 'edit'"
                value="2"
                :key="index"
                >催办</a-select-option
              >
            </a-select>
          </div>
        </div>

        <div class="list">
          <label>
            <span><font>*</font></span>
            模板编码
          </label>
          <div class="right" :class="{'error': errorObj.code.value}">
            <a-input @change="inputChange(currentParams, 'code', 20)" v-model="currentParams.code" placeholder="请输入模板编码"></a-input>
            <div class="err-tips" v-if="errorObj.code.value">
              {{errorObj.code.info}}
            </div>
          </div>
        </div>

        <div class="list">
          <label>
            <span><font v-show="popType !== 'edit'">*</font></span>
            模板名称
          </label>
          <div class="right" :class="{'error': errorObj.name.value}">
            <a-input @change="inputChange(currentParams, 'name', 40)" v-model="currentParams.name" :disabled="popType === 'edit'" placeholder="请输入"></a-input>
            <div class="err-tips" v-if="errorObj.name.value">
              {{errorObj.name.info}}
            </div>
          </div>
        </div>

        <div class="list">
          <label>
            <span><font>*</font></span>
            模板内容
            <a-tooltip placement="top" overlayClassName="black-tooltip">
              <template slot="title">默认待办通知请选择模型系统数据项作为参数，如数据标题name、创建人creator等</template>
              <i class="icon aufontAll h-icon-all-question-circle-o"></i>
            </a-tooltip>
          </label>
          <div class="right" :class="{'error': errorObj.content.value}">
            <a-textarea @change="inputChange(currentParams, 'content', 200)" @focus="textareaFocus = true" @blur="textareaBlur" v-model="currentParams.content" :autosize="{ minRows: 4, maxRows: 4 }"></a-textarea>
            <div class="placehoder" v-if="currentParams.content.length === 0 && !textareaFocus">
              <p>变量格式：${name}</p>
              <p>示例：您有新的流程待处理，流程标题：${name},请及时处理</p>
            </div>
            <div class="err-tips" v-if="errorObj.content.value">
              {{errorObj.content.info}}
            </div>
          </div>
        </div>

        <div class="prames-list">
          <div class="list-header">
            <div class="list-name">参数列表</div>
            <div class="list-info">
              参数说明
              <a-tooltip placement="top" overlayClassName="black-tooltip">
                <template slot="title">参数说明，40字以内</template>
                <i class="icon aufontAll h-icon-all-question-circle-o"></i>
              </a-tooltip>
            </div>
          </div>
          <div class="list-body">
            <div class="list-item" v-for="(item, index) in paramsList" :key="index">
              <div :title="item.key" class="list-name">{{item.key}}</div>
              <div class="list-info">
                <a-input @change="inputChange(item, 'value', 40)" v-model="item.value" placeholder="请输入" />
              </div>
            </div>

            <div class="empty" v-if="paramsList.length === 0">
              <img src="../../../assets/images/userEmpty.png" alt="">
              <p>暂无内容</p>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import OrgApi from "@/apis/organization";

@Component({
  name: "sms-template-setting",
  components: {},
})
export default class smsTemplateSetting extends Vue {
  popType: string = "add";
  popVisible: boolean = false;
  textareaFocus:boolean = false;
  textareaBlur(){
    this.textareaFocus = false;
    this.getParamsList()
  }


  cancelClick(){
    this.popVisible = false;
    this.reset()
  }

  inputChange(item:any, text: string, len: number){
    if(this.errorObj[text]){
      this.errorObj[text].value = false;
    }

    if(item[text].length > len){
      this.$set(item, text, item[text].slice(0, len))
    }
  }

  getParamsList(){
    let text:string = this.currentParams.content;
    if(text === ''){
      return
    }
    let Arr:any[] = text.match(/(?<=(\$\{))\w+(?=\})/g) || []
    if(Arr && Array.isArray(Arr)){
      this.paramsList = this.paramsList.filter(el => Arr.includes(el.key))
      let res:any[] = [];
      Arr.forEach((el:string) => {
        if(!this.paramsList.find(ele => ele.key === el)){
          res.push({
            key: el,
            value: ''
          })
        }else{
          res.push(this.paramsList.find(ele => ele.key === el))
        }
      })
      this.paramsList = res;
    }else{
      this.paramsList = [];
    }
  }

  paramsList:any[] = []; // 参数列表
  currentParams:any = {
    type: '3',
    code: '',
    name: '',
    content: '',
    params: []
  }

  reset(){
    this.paramsList = [];
    this.currentParams = {
      type: '3',
      code: '',
      name: '',
      content: '',
      params: []
    }

    this.errorObj = {
      code: {
        value: false,
        info: ''
      },
      name: {
        value: false,
        info: ''
      },
      content: {
        value: false,
        info: ''
      },
    }
  }

  editItem:any = {}; // 当前编辑的模板
  editClick(record){
    this.popType = 'edit';
    this.currentParams = {
      type: record.type,
      code: record.code,
      name: record.name,
      content: record.content,
      params: []
    }
    this.paramsList = JSON.parse(record.params);
    this.popVisible = true;
    this.editItem =  record;
  }

  delClick(record){
    var that = this;
    this.$confirm({
      title: '确定要删除选中的模板吗？', 
      okType: 'danger',
      okText: this.$t('languages.Apps.Delete').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk() {
        that.deleteSmsTemplate(record)
      }
    });
  }

  // 删除模板
  async deleteSmsTemplate(record){
    await OrgApi.deleteSmsTemplate({
      id: record.id
    }).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success(res.errmsg);
        this.getSmsTemplateList()
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  errorObj:any = {
    code: {
      value: false,
      info: ''
    },
    name: {
      value: false,
      info: ''
    },
    content: {
      value: false,
      info: ''
    },
  }

  handleOk(){
    this.currentParams.code = this.currentParams.code.trim();
    this.currentParams.name = this.currentParams.name.trim();
    this.currentParams.content = this.currentParams.content.trim();

    if(this.currentParams.type === ''){
      this.$message.warning('模板类型不能为空！')
      return
    }

    let hasError: boolean = false;

    if(this.currentParams.name === ''){
      this.errorObj.name = {
        value: true,
        info: '必填项'
      }
      hasError = true
    } 


    if(this.currentParams.code === ''){
      this.errorObj.code = {
        value: true,
        info: '必填项'
      }
      hasError = true
      // this.$message.warning('模板编码不能为空！')
      // return
    } else if (!/^[a-zA-Z0-9_]{0,20}$/.test(this.currentParams.code)){
      this.errorObj.code = {
        value: true,
        info: '仅支持字母、数字、下划线'
      }
      hasError = true
    }


    // if(this.currentParams.code.length > 20){
    //   this.$message.warning('模板编码不能超过20个字符！')
    //   return
    // }
    // if(!/^[a-zA-Z_][a-zA-Z0-9_]{0,20}$/.test(this.currentParams.code)){
    //   this.$message.error('模板编码仅支持字母、数字、下划线')
    //   return
    // }

    


    // if(this.currentParams.name.length > 40){
    //   this.$message.warning('模板名称不能超过40个字符！')
    //   return
    // }

    if(this.currentParams.content === ''){
      this.errorObj.content = {
        value: true,
        info: '必填项'
      }
      hasError = true
      // this.$message.warning('模板内容不能为空！')
      // return
    }

    let errList:any[] = []
    this.paramsList.forEach(el => {
      if(el.key.length > 20){
        errList.push('变量名称${' + el.key + '}不能超过20个字符')
      }
    })

    let keys: string[] = this.paramsList.map((el:any) => el.key as string) 
    let keyLen = keys.length;
    let lastLen = [...new Set(keys)].length
    if(keyLen !== lastLen){
      this.errorObj.content = {
        value: true,
        info: '变量名称不能重复'
      }
      hasError = true
    } else if (errList.length){
      this.errorObj.content = {
        value: true,
        info: '变量名称不能超过20个字符'
      }
      hasError = true
      // this.$message.warning(errList[0] as string);
      // return
    }

    

    if(hasError){
      return
    }

    if(this.popType === 'add'){
      this.addSmsTemplate()
    }else{
      this.updateSmsTemplate()
    }

  }
  showPop(type) {
    this.popVisible = true;
    this.popType = type;
  }

  getTypeName(type){
    const options: any[] = [
    {
      code: "3",
      name: "事件通知",
    },
    {
      code: "2",
      name: "催办",
    },
    {
      code: "1",
      name: "待办",
    },
  ];

    return options.find(el => el.code === type + '').name;
  }
  options: any[] = [
    {
      code: "3",
      name: "事件通知",
    },
    // {
    //   code: "2",
    //   name: "催办",
    // },
    {
      code: "1",
      name: "待办",
    },
  ];

  dataSource: any[] = [];
  columns: any[] = [
    {
      title: "序号",
      key: "index",
      dataIndex: "index",
      width: 64,
    },
    {
      title: "模板类型",
      key: "type",
      dataIndex: "type",
      scopedSlots: { customRender: "templateType" },
    },
    {
      title: "模板名称",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "模板编码",
      key: "code",
      dataIndex: "code",
    },
    {
      title: "模板内容",
      key: "content",
      dataIndex: "content",
      ellipsis: true
    },
    {
      title: "创建人",
      key: "createdBy",
      dataIndex: "createdBy",
      ellipsis: true
    },
    {
      title: "创建时间",
      key: "createdTime",
      dataIndex: "createdTime",
    },
    {
      title: "操作",
      key: "actions",
      dataIndex: "actions",
      scopedSlots: { customRender: "actions" },
      width: 88,
    },
  ];


  params:any = {
    page: 0,
    size: 200
  }

  // 修改模板
  async updateSmsTemplate(){
    let params = {...this.currentParams};
    params.params = JSON.stringify(this.paramsList)
    params.id = this.editItem.id;
    params.defaults = this.editItem.defaults;
    await OrgApi.updateSmsTemplate(params).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success(res.errmsg);
        this.popVisible = false
        this.reset()
        this.getSmsTemplateList()
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  // 添加模板
  async addSmsTemplate(){
    let params = {...this.currentParams};
    params.params = JSON.stringify(this.paramsList)
    await OrgApi.addSmsTemplate(params).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success(res.errmsg);
        this.popVisible = false
        this.reset()
        this.getSmsTemplateList()
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  // 获取列表
  async getSmsTemplateList() {
    await OrgApi.getSmsTemplateList(this.params).then((res: any) => {
      if (res.errcode === 0) {
        res.data.content.forEach((element, index) => {
          element.index = index + 1
        });
        this.dataSource = res.data.content;
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }
  created() {
    this.getSmsTemplateList();
  }
}
</script>
<style lang="less" scoped>
.sms-template-setting {
  button {
    margin: 24px 0 12px 0;
  }
}
.content .list::before{
  display: none;
}
.list {
  display: flex;
  margin-bottom: 16px;
  label {
    display: inline-block;
    width: 105px;
    text-align: left;
    line-height: 32px;
    span {
      display: inline-block;
      width: 6px;
      font {
        color: red;
      }
    }
  }
  .right {
    flex: 1;
    display: flex;
    position: relative;
    & > * {
      flex: 1;
    }
    .placehoder {
      position: absolute;
      color: rgba(0, 0, 0, 0.35);
      left: 0;
      top: 0;
      padding: 5px 12px;
      pointer-events: none;
    }

    &.error{
      margin-bottom: 24px;
    }
    .err-tips{
      position: absolute;
      top: 100%;
      left: 0;
      color: red;
      line-height: 2;
    }
  }
}

.prames-list {
  .list-header {
    height: 32px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    padding: 0 24px;
    line-height: 32px;
    color: #252525;
  }
  .list-body {
    .list-item {
      height: 40px;
      line-height: 40px;
      display: flex;
      padding: 0 24px;
      border-bottom: 1px solid #e8e8e8;
    }
    .empty{
      img{
        width: 80px;
      }
      text-align: center;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
  }

  .list-name {
    width: 88px;
    text-align: left;
    margin-right: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .list-info {
    flex: 1;
    display: flex;
    align-items: center;
    i {
      margin-left: 6px;
    }
  }
}
.content{
  max-height: 455px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

<style lang="less">
.sms-template-setting {
  .ant-table-placeholder {
    color: rgba(0, 0, 0, 0.45);
  }
  .ant-table-thead > tr > th {
    color: rgba(0, 0, 0, 0.65);
  }
  .ant-table-body {
    max-height: calc(100vh - 387px - 17px) !important;
    overflow-x: hidden !important;
    color: rgba(0, 0, 0, 0.85);
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 6px 10px !important;
    }
    table {
      padding: 0 !important;
    }
  }
}
</style>
