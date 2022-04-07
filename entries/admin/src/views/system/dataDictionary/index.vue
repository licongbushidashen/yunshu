<template>
  <div class="data-dictionary">
    <div class="header">
      <div class="left">
        <a-button class="add" @click="addDictionary('new')">
          新建字典
        </a-button>
        <a-button @click="addClass">
          新建分类
        </a-button>
        <a-button v-if="classList.length" @click="classifiedManagement">
          分类管理
        </a-button>
      </div>
      <div class="right">
        <div class="query-select">
          <span>字典分类:</span>
          <template>
            <a-select v-model="defaultClass" class="select" @change="queryClassChange">
              <a-select-option key="all" value="">全部</a-select-option>
              <a-select-option
                v-for="(item, key) in classList"
                :key="item.id + key"
                :value="item.id"
              >{{ item.name }}</a-select-option>
            </a-select>
          </template>
        </div>
        <div class="query-box">
          <a-input
            :placeholder="'搜索字典名称及编码'"
            v-model="keyWords"
            class="w240"
            @change="dictionarySearch"
          >
            <a-icon
              slot="suffix"
              type="close-circle"
              class="del-icon delete"
              @click="clearKeyWords"
            />
            <a-icon slot="prefix" type="search" class="del-icon" />
          </a-input>
        </div>
      </div>
    </div>

    <div class="content">
      <data-dictionary-list
        :classificationId="defaultClass"
        :searchWord="keyWords"
        :isBeginSerch="isBeginSerch"
        @edit="editDataDictionary"
      ></data-dictionary-list>
    </div>

    <!-- 新增字典弹窗 -->
    <a-modal
      v-model="addVisible"
      width="800px"
      height="600px"
      :title="isNew ? '新建数据字典': '编辑字典数据'"
      @cancel="addVisible = false"
      :maskClosable="false"
      :closable="true"
      class="add-data-dictionary-modal"
      @ok="addDataDictionaryModalClickOk"
    >
      <template v-if="addVisible">
      <add-modal
        :classList="classList"
        :isAddDataDictionaryOkBtnClick="isAddDataDictionaryOkBtnClick"
        :currentDataDictionary="currentDataDictionary"
        :isNew="isNew"
        @closeModal="addVisible = false"
        @addOver="changeIsBeginSerch"
      />
      </template>
    </a-modal>

    <!-- 新建分类 -->
    <a-modal
      v-model="addClassVisible"
      width="640px"
      title="新建字典分类"
      @cancel="addClassVisible = false"
      :maskClosable="false"
      :closable="true"
      class="add-data-dictionary-modal"
      @ok="saveNewClass"
      okText="保存"
    >
      <div class="modal-wrapper">
        <list-item :label="'分类名称'" :showRequire="true">
          <a-input v-model="addClassParams.name" placeholder="请输入" />
        </list-item>
        <list-item :label="'所属字典'" :showRequire="false">
          <a-select
            mode="multiple"
            v-model="addClassParams.classificationIds"
            default-value=""
            style="width: 100%"
            show-search
            :filter-option="filterOption"
          >
            <template v-for="(item, key) in dictionaryList">
              <a-select-option :value="item.id" :key="key">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </list-item>
      </div>
    </a-modal>

    <!-- 分类管理 -->
    <a-modal
      v-model="classifiedManagementVisible"
      width="800px"
      title="分类管理"
      @cancel="addClassVisible = false"
      :maskClosable="false"
      :closable="true"
      class="add-data-dictionary-modal"
      @ok="addNewClassifiedOk"
    >
      <div class="modal-wrapper">
        <div class="content-top">
          <span @click="addNewClassified"><a-icon type="plus" />新建</span>
          <span class="delete" :class="{'can-delete': selectedRowKeys.length>0}" @click="batchDel"><a-icon type="delete"/>批量删除</span>
        </div>

        <div class="content">
          <a-table
            :columns="classifiedManagementColumns"
            :pagination="false"
            :dataSource="dictionaryClassDetailLists"
            :loading="loading"
            size="small"
            :rowKey="(record) => record.id"
            bordered
            :rowClassName="setRowClassName"
            :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: getCheckboxProps }"
            :scroll="{ x: 700, y: 300 }"
          >
            <!-- 序号 -->
            <!-- <template slot="index" slot-scope="text, record">
              <template>
                {{ record.index }}
              </template>
            </template> -->

            <!-- 分类 -->
            <template slot="name" slot-scope="text, record">
              <a-input v-if="record.isEdit" v-model="record.name" placeholder="请输入" />
              <span v-else>{{record.name}}</span>
            </template>

            <!-- 所属字典 -->
            <template slot="dictionaryInfos" slot-scope="text, record">
              <a-select
                mode="multiple"
                v-model="record.classificationIds"
                style="width: 100%"
                :disabled="!record.isEdit"
                v-if="record.isEdit"
                :filter-option="filterOption"
              >
                <template v-for="(item, key) in dictionaryList">
                  <a-select-option :value="item.id" :key="key">
                    {{ item.name }}
                  </a-select-option>
                </template>
              </a-select>
              <p class="dictionaryInfos" v-else>
                <span v-for="(item, index) in record.dictionaryInfos" :key="item.id + index">{{item.name}}；</span>
              </p>
            </template>

            <!-- 操作 -->
            <template slot="operation" slot-scope="text, record">
              <div class="operation-btns">
                <span class="edit" v-if="!record.isEdit" @click="edit(record)"><a-icon type="edit" /></span>
                <span class="edit editSelect" @click="editOk(record)" v-else><a-icon type="check" /></span>
                <span v-if="record && record.dictionaryInfos && record.dictionaryInfos.length === 0" :class="{'editSelect': record.isEdit,'edit': true}" @click="deleteClass(record)"><a-icon type="delete" /></span>
              </div>
            </template>
          </a-table>

        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import dataDictionaryApi from "@/apis/system/data-dictionary.api";
import common from "@cloudpivot/common/pc";
import addModal from "./add.vue";
import dataDictionaryList from "./data-dictionary-list.vue";
import groupTitle from "./group-title.vue";
import listItem from "./list-item.vue";

@Component({
  name: "dataDictionary",
  components: {
    RoleSelect: common.components.RoleSelect,
    addModal,
    dataDictionaryList,
    groupTitle,
    listItem,
  },
})
export default class dataDictionary extends Vue {
  filterOption(input, option){
    return option.componentOptions.children[0].text.includes(input)
  }

  // 分类管理
  selectedRowKeys:any[] = [] // 选中的数据项
  onSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.selectedRowKeys = selectedRowKeys;
  }
  getCheckboxProps(record){
    return {
      props: {
        disabled: record && record.dictionaryInfos && record.dictionaryInfos.length !== 0, // Column configuration not to be checked
        name: record.name,
      }
    }
  }

  addNewClassifiedOk(){
    if(this.dictionaryClassDetailLists.every(el => !el.isEdit)){
      this.addClassVisible = false
      this.classifiedManagementVisible = false
    }else{
      this.$message.error({content: '请先保存或删除编辑中的分类!', key: this.messageKey})
      return
    }
  }  

  loading:boolean = false
  classifiedManagementVisible:boolean = false;
  dictionaryClassDetailParams:any = {
    page: 1,
    size: 999999,
  }
  dictionaryClassDetailLists: any[] = []
  async classifiedManagement(){
    this.getDictionaryList()
    let res:any =  await dataDictionaryApi.getDictionaryClassDetail(this.dictionaryClassDetailParams)
    if(res.errcode === 0){
      res.data.forEach((item:any) => {
        if(Array.isArray(item.dictionaryInfos)){
          item.classificationIds = item.dictionaryInfos.map(el => el.id)
        }
      });

      this.dictionaryClassDetailLists = res.data
    }
    this.classifiedManagementVisible = true;
  }
  classifiedManagementColumns:any[] = [
    {
      title: "分类 *",
      dataIndex: "name",
      align: "left",
      width: 305,
      ellipsis: true,
      scopedSlots: { customRender: "name" },
    },
    {
      title: "所属字典",
      dataIndex: "dictionaryInfos",
      scopedSlots: { customRender: "dictionaryInfos" },
      align: "left",
      width: 305,
      ellipsis: true,
    },
    {
      title: "操作",
      dataIndex: "operation",
      align: "left",
      scopedSlots: { customRender: "operation" },
      width: 78,
    }
  ]
  // 开启编辑分类
  edit(record){
    this.dictionaryClassDetailLists.forEach(el => {
      if(el === record){
        el.isEdit = true
      }else{
        el.isEdit = false
      }
    })
    this.dictionaryClassDetailLists = JSON.parse(JSON.stringify(this.dictionaryClassDetailLists))
  }
  // 编辑分类完成
  async editOk(record){
    if(record.name === ''){
      this.$message.error({content: '分类名称不能为空！',key: this.messageKey})
      return
    }

    record.isEdit = false
    let checkData:any[] = [] 
    this.dictionaryList.forEach(el => {
      if(record.classificationIds && record.classificationIds.includes(el.id)){
        checkData.push(el)
      }
    })
    record.dictionaryInfos = [...checkData]
    this.dictionaryClassDetailLists = JSON.parse(JSON.stringify(this.dictionaryClassDetailLists))


    console.log('record===>',record)

    let res: any = await dataDictionaryApi.saveDictionaryClass({
      id: record.id || '',
      name: record.name,
      dictionaryIds: record.classificationIds
    })
    if(res.errcode === 0){
      this.initClassList() // 获取分类列表
      this.changeIsBeginSerch() // 更新列表数据
      this.classifiedManagement()   // 新增完需要更新table数据，否则id为索引导致删除有误
      this.$message.success('操作成功！')
    }
  }

  deleteClass(record){
    if(record.id){
      this.deleteDictionaryClassBatch([
        record.id
      ])
    }else{
      this.dictionaryClassDetailLists = this.dictionaryClassDetailLists.filter(el => el !== record)
    }
    
  }
  // 批量删除
  batchDel(){
    if(!this.selectedRowKeys.length){
      return
    }
    this.deleteDictionaryClassBatch([
      ...this.selectedRowKeys
    ])
  }
  //调用批量删除的接口
  async deleteDictionaryClassBatch(ids){
    if(!ids.length){
      this.$message.error({content: '请先选择需要删除的字典分类！', key: this.messageKey })
    }
    let _this = this
    this.$confirm({
      title: '确定删除选中的字典分类吗？',
      okText: '确定',
      cancelText: '取消',
      async onOk() {
        let res:any = await dataDictionaryApi.deleteDictionaryClassBatch({
          ids: [...ids]
        })
        if(res.errcode === 0){
          _this.$message.success(res.errmsg)
          _this.classifiedManagement()
          _this.selectedRowKeys = []
        }else{
          _this.$message.error(res.errmsg)
        }
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  }

  addNewClassified(){
    if(this.dictionaryClassDetailLists.length && this.dictionaryClassDetailLists[this.dictionaryClassDetailLists.length-1].isEdit){
      this.$message.error({content: '请先保存上一个字典分类！',key: this.messageKey})
      return
    }

    this.edit(null)
    this.dictionaryClassDetailLists.push({
      dictionaryInfos: [],
      name: '',
      isEdit: true
    })
  }


  // 新建分类
  addClassVisible:boolean = false;
  async addClass() {  
    // 每次新建前清除上次数据
    this.addClassParams = {
      name: "",
      classificationIds: [],
    }
    
    let res:any = await dataDictionaryApi.getDictionaryIdAndNames({})
    if(res.errcode === 0){
      this.dictionaryList = res.data
      this.addClassVisible = true;
    }
  }
  addClassParams: any = {
    name: "",
    classificationIds: [],
  };

  dictionaryList:any = []

  async getDictionaryList(){
    let res:any = await dataDictionaryApi.getDictionaryIdAndNames({})
    if(res.errcode === 0){
      this.dictionaryList = res.data
    }
  }

  async saveNewClass(){
    if(this.addClassParams.name === ''){
      this.$message.error({content: '分类名称不能为空！',key: this.messageKey})
      return
    }
    if(this.addClassParams.name.length > 50){
      this.$message.error({content: '分类名称不能超过50个字', key: this.messageKey})
      return
    }
    

    let res: any = await dataDictionaryApi.saveDictionaryClass({
      name: this.addClassParams.name,
      dictionaryIds: this.addClassParams.classificationIds
    })
    if(res.errcode === 0){
      this.addClassParams = {
        name: "",
        classificationIds: [],
      }
      this.initClassList() // 获取分类列表
      this.changeIsBeginSerch() // 更新列表数据
      this.$message.success('操作成功！')
      this.addClassVisible = false;
    }else{
      this.$message.error(res.errmsg)
    }
  }

  messageKey: string = 'messageKey'
  // 搜索
  classList: any[] = []; // 分类列表
  keyWords: string = "";
  clearKeyWords() {
    if(this.keyWords === "") return;
    this.keyWords = "";
    this.changeIsBeginSerch();
  }
  defaultClass: string = "";
  queryClassChange() {
    this.changeIsBeginSerch(); // 触发搜索列表数据
  }

  isNew: boolean = false;
  // 新建字典
  addDictionary(type) {
    this.isNew = type === "new";

    this.isAddDataDictionaryOkBtnClick = false;
    this.addVisible = true;
  }

  addVisible: boolean = false;
  isAddDataDictionaryOkBtnClick: boolean = false;

  // 触发添加保存
  addDataDictionaryModalClickOk() {
    this.isAddDataDictionaryOkBtnClick = true;
    setTimeout(() => (this.isAddDataDictionaryOkBtnClick = false), 300);
  }

  // 触发搜索列表
  
  timer: any = null;
  dictionarySearch(){
    if(this.timer !== null){
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(()=>{
      this.changeIsBeginSerch();
    },700)
  }

  isBeginSerch: boolean = false;
  changeIsBeginSerch() {
    this.isBeginSerch = true;
    setTimeout(() => (this.isBeginSerch = false), 50);
  }

  // 编辑数据字典
  currentDataDictionary: any = {};
  editDataDictionary(item) {
    console.log('editDataDictionary===>', item)
    this.isNew = false;
    this.addVisible = true;
    this.$nextTick(()=>this.currentDataDictionary = {...item})
  }

  // @Watch("addVisible")
  // onAddVisibleChange(val) {
  //   if (!val) {
  //     this.currentDataDictionary = {};
  //     this.isNew = false;
  //   }
  // }

  // 初始化字典分类列表
  async initClassList() {
    let res: any = await dataDictionaryApi.getDictionaryClass({});
    if (res.errcode === 0) {
      this.classList = res.data;
    }
  }

  setRowClassName(record: any, index: number) {
    if(record.isEdit) {
      return 'edit-row'
    }
  }

  createNewClass(){
    for (let index = 0; index < 200; index++) {
      this.addClassParams.name = '新建分类' + (Math.floor(Math.random() * 100000000)) 
      this.saveNewClass()
    }
  }

  created() {
    this.initClassList();
  }
}
</script>
<style lang="less" scoped>
.operation-btns{
  width: 100%;
  display: flex;
  span{
    margin-right: 16px;
    cursor: pointer;
    &:last-child{
      margin-right: 0;
    }
  }
  /deep/.editSelect svg{
    fill: #17BC94;
  }
}

.dictionaryInfos{
  white-space: pre-wrap;
  width: 100%;
}
.content-top{
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
  span{
    margin-right: 12px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    i{
      margin-right: 5px;
    }
    &.delete{
      color: rgba(0, 0, 0, 0.25);
    }
    &.can-delete{
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
/deep/.content-top{
  padding-top: 0;
}
.content{
  margin-bottom: 20px;
}
/deep/.modal-wrapper .ant-table-body {
  overflow-x: visible !important;
 }
/deep/.modal-wrapper .ant-table-header {
  background-color: #F4F5F8;
}
/deep/.modal-wrapper > .list-item:last-child {
    margin-bottom: 20px;
}
// /deep/.list-item:nth-child(6){
//   margin-bottom: 23px;
//   align-items: start;
// }
.data-dictionary {
  margin: 0 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  .content{
    flex: 1;
  }
}
.header {
  height: 56px;
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  align-content: center;
  .left {
    button {
      margin-right: 8px;
      &.add {
        color: #fff;
        background-color: #00C293;
      }
    }
  }
  .right {
    display: flex;
    align-items: center;
    .query-select {
      display: flex;
      span {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #444;
        line-height: 32px;
        margin-right: 8px;
      }
      .select {
        width: 200px;
      }
    }
    .query-box {
      margin-left: 12px;
    }
  }
}


</style>

<style lang="less">
.modal-wrapper{
  .ant-table-small > .ant-table-content > .ant-table-body {
    margin: 0;
  }
  .content{
    max-height: 500px;
    overflow: auto;
  }
}
.ant-table-body::-webkit-scrollbar{
  width: 1px !important;
}

.edit-row {
  background: rgb(232, 252, 244);
}
</style>
