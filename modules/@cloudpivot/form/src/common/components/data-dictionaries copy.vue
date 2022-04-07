<template>
  <div>
    <a-row class="radio-row">
      <a-col :span="4">字典类型</a-col>
      <a-col :span="12" style="height: 32px;" class="radio-col">
        <a-radio-group name="radioGroup" v-model="dictionariesType" :default-value="0">
          <a-radio :value="0">
            简单键值结构
          </a-radio>
          <a-radio :value="1">
            树形父子结构
          </a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row class="radio-row">
      <a-col :span="4">选择字典</a-col>
      <a-col :span="12">
        <template>
          <a-select
            style="width: 100%"
            show-search
            placeholder="请选择"
            option-filter-prop="children"
            v-model="checkedDictionary"
            @change="checkedDictionaryChange"
            notFoundContent="暂无数据"
          >
            <template v-for="item in dictionaryList">
              <a-select-option :disabled="!item.status" :value="item.id" :key="item.id">
                {{item.name}}
              </a-select-option>
            </template>
            
          </a-select>
        </template>
      </a-col>
    </a-row>

    <a-row v-if="checkedDictionary">
      <a-col :span="4">字典数据:</a-col>
      <a-col :span="12">
        <p class="dictionaries-data" @click="setDictionariesDataVisible">{{isSetDictionariesData}}</p>
      </a-col>
    </a-row>


    <a-modal
      v-model="dictionariesDataVisible"
      height="500px"
      width="700px"
      title="字典数据"
      okText="确定"
      cancelText="取消"
      @cancel="dictionariesDataVisible = false"
      :maskClosable="false"
      :closable="true"
      class="add-data-dictionary-modal"
      @ok="setDictionariesDataOk"
      :bodyStyle="dictionariesType ? {padding: 0} : {}"
    >
      <template v-if="dictionariesType === 0">
          <div :style="{ borderBottom: '1px solid #E9E9E9' }" v-if="plainOptions.length + isDisableData.length > 0">
            <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @click="checkAllClick">
              全部
            </a-checkbox>
          </div>
          <div v-else >
            <a-spin tip="Loading..." v-if="spinning">
              <div class="spin-content">
                数据加载中...
              </div>
            </a-spin>
            <span v-if="!spinning">选择的字典没有数据项，请更换字典！</span>
          </div>
          <div class="dictionaries-data-wrapper">
          <a-checkbox-group v-model="checkedList"  @change="onChange" >
            
            <!-- 历史已选中，字典已删除数据 -->
            <template v-for="item in isDisableData">
              <a-checkbox :value="item.id" :key="item.id">
                {{item.name}}
              </a-checkbox>
              <br :key="item.id + 'br'" />
            </template>

            <template v-for="item in plainOptions">
              <a-checkbox class="dictionaries-data-items" :value="item.id"  :key="item.id">
                {{item.name}}
              </a-checkbox>
              <br :key="item.id + 'br'" />
            </template>
          </a-checkbox-group>
        </div>
      </template>

      <template v-else>
        <div class="tree-wrapper">
          <div class="left">
            <div class="left-search-box">
              <a-input v-model="searchText" allowClear  placeholder="请输入">
                <a-icon slot="prefix" type="search" />
              </a-input>

              <div class="search-result" v-if="searchText">
                <div class="no-result" v-if="!searchRes.length">
                  没有匹配到相关信息
                </div>
                <template v-else>
                  <div class="title">符合查询条件的记录{{searchRes.length}}条，返回{{searchRes.length}}条</div>
                  <a-checkbox-group v-model="checkedList">
                    <div class="result-wrapper">
                      <div class="result-item" v-for="(item,index) in searchRes" :key="item.id + '_' + index">
                        <div class="checkbox">
                          <a-checkbox @change=" e => treeCheckedChange(item, e.target)" :value="item.id"></a-checkbox>
                        </div>
                        <div class="item-info">
                          <div class="name">{{item.name}}</div>
                          <div class="about">{{item.parentName}}</div>
                        </div>
                      </div>
                    </div>
                  </a-checkbox-group>
                </template>
              </div>
            </div>
            <div class="breadcrumb">
              <template>
                <a-breadcrumb>
                  <a-breadcrumb-item href="">
                    <i @click="changeCurrentTreeData('root')" class="aufontAll h-icon-all-rollback-o"></i>
                    <span @click="changeCurrentTreeData('root')">根目录</span>
                  </a-breadcrumb-item>

                  <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="item.id" >
                    <span @click="changeCurrentTreeData(item, index)">{{item.name}}</span>
                  </a-breadcrumb-item>
                </a-breadcrumb>
              </template>
            </div>
            <div class="left-tree-container">
              <a-checkbox-group v-model="checkedList">
                <div class="list-item" v-for="item in currentTreeData" :key="item.id">
                  <a-checkbox @change=" e => treeCheckedChange(item, e.target)" :value="item.id">{{item.name}}</a-checkbox>
                  <span class="next" v-if="item.children && item.children.length" @click="nextTree(item)">
                    <i class="aufontAll h-icon-all-subordinate-o"></i>
                    下级
                  </span>
                </div>
              </a-checkbox-group>
            </div>
          </div>
          <div class="right">
            <span v-for="item in checkedDictionaries" :key="item.id"> 
              {{item.showName}}
              <i @click="delCheckedDictionaries(item)" class="aufontAll h-icon-all-close"></i>
            </span>
          </div>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
import { dictionaryApi } from "@cloudpivot/api";

@Component({
  name: "DataLinkModal",
  components: {
  },
})
export default class DataLinkModal extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  // 搜索
  searchText:string = ''
  get searchRes(){
    console.log(this.treeList)
    debugger
    return this.treeList.filter(el => el.name.indexOf(this.searchText) > -1 || el.parentName && el.parentName.indexOf(this.searchText) > -1)
  }

  setDictionariesDataVisible(){
    this.dictionariesDataVisible = true
    this.searchDictionaryRecord()
  }

  dictionariesDataVisible:boolean = false
  setDictionariesData: {} = {} // 字典数据
  plainOptions:any = [];
  indeterminate:boolean = false
  checkAll:boolean = false
  defaultCheckedList:any[] = []; // 默认选中值
  checkedList:any = this.defaultCheckedList
  onChange(checkedList) {
    this.indeterminate = !!checkedList.length && checkedList.length < this.plainOptions.length;
    this.checkAll = checkedList.length === this.plainOptions.length;
  }

  spinning:boolean = false



  checkAllClick(){
    this.checkAll = !this.checkAll
    this.indeterminate = false
    if(this.checkAll){
      this.indeterminate = false
      this.checkedList = this.plainOptions.map(el => el.id)
    }else{
      this.checkedList = []
    }
  }
  get isSetDictionariesData(){
    return this.checkedList.length ? '已设置' : '未设置'
  }

  isClickOk:boolean = false  // 是点击确定关闭的弹窗
  setDictionariesDataOk(){
    this.isClickOk = true
    this.dictionariesDataVisible = false
  }

  @Watch('checkedList')
  onCheckedListChange(checkedList){
    if(checkedList.length > 200){
      this.$message.error('最多只能选择200个字典数据')
      this.checkedList.length = 200
      this.indeterminate = true
      return
    }
    if(checkedList.length === 0){
      this.indeterminate = false
      this.checkAll = false
    }
    if(checkedList.length && this.plainOptions.length === checkedList.length){
      this.checkAll = true
    }else{
      this.checkAll = false
    }
  }


  treeList:any[] = [] // 存储所有拍平的树形可选数据
  initTreeData(data){
    this.treeList = []
    let _this = this
    function setData(data, parentName){
      data.forEach(element => {
        element.showName = parentName ? parentName + '/' + element.name : element.name

        _this.treeList.push({
          name: element.name,
          parentName: parentName,
          id: element.id,
          code: element.code,
          showName: element.showName
        })

        if(element.children){
          setData(element.children, element.showName)
        }
      });
    }
    setData(data, '')
  }
  // 查询字典数据项
  async searchDictionaryRecord(){
    this.spinning = true
    let res:any = await dictionaryApi.getEnableRecordsByDictionaryId({
      dicId: this.checkedDictionary
    })
    this.spinning = false
    if(res.errcode === 0){
      if(this.dictionariesType === 1){ // 树形
        this.initTreeData(res.data)
      }
      this.plainOptions = res.data
      this.currentTreeData = res.data
    }
  }

  // 树形
  breadcrumbList:any[] = []
  currentTreeData:any[] = []
  nextTree(item){
    this.breadcrumbList.push(item)
    this.currentTreeData = item.children
  }
  changeCurrentTreeData(item: any, index?: any){
    if(item === 'root'){
      this.breadcrumbList = []
      this.currentTreeData = this.plainOptions
      return
    }
    this.currentTreeData = item.children
    this.breadcrumbList = this.breadcrumbList.splice(0, index+1)
  }

  checkedDictionaries:any[] = []

  treeCheckedChange(item, target){
    if(!this.checkedList.includes(item.id)){
      this.checkedDictionaries.push(item)
    }else{
      this.checkedDictionaries = this.checkedDictionaries.filter(el => el.id != item.id)
    }
  }
  delCheckedDictionaries(item){
    this.checkedDictionaries = this.checkedDictionaries.filter(el => el != item)
  }

  @Watch('checkedDictionaries')
  onCheckedDictionariesChange(val:any[]){
    this.checkedList = val.map(el => el.id)
  }

  // 返回字典已选数据
  // 保存已使用的字典数据项
  async updateDictionaryRecordUsed(ids){
    if(!ids){
      return
    }
    await dictionaryApi.updateDictionaryRecordUsed({
      id: ids
    })
  }

  getDictionariesData(){
    let arr:any[] = []

    if(this.dictionariesType === 0){
      this.plainOptions.forEach(element => {
        if(this.checkedList.includes(element.id)){
          arr.push({
            id: element.id,
            name: element.name,
          })
        }
      });

      this.isDisableData.forEach(element => {
        if(this.checkedList.includes(element.id)){
          arr.push({
            id: element.id,
            name: element.name,
          })
        }
      });
    }else{
      this.checkedDictionaries.forEach(element => {
        arr.push({
            id: element.id,
            name: element.showName || element.name,
            showName: element.showName
          })
      })
    }
    this.updateDictionaryRecordUsed(arr.map(el => el.id).join(';'))

    return arr
  }
  
  isCheckedDictionaryChange:boolean = false
  // 选中的数据字典改变
  checkedDictionaryChange(){
    this.plainOptions = []
    this.checkedList = []
    this.isCheckedDictionaryChange = true
    this.checkedDictionaries = []
  }

  bizmodeBack() {
    if (!this.checkedDictionary) {
      this.$message.error("数据字典不能为空");
      return false;
    }
    const obj = {
      dictionariesType: this.dictionariesType,
      checkedDictionary: this.checkedDictionary,
      useDictionariesData: this.getDictionariesData()
    }
    return {
      value: JSON.stringify(obj),
      default: "",
    };
  }


  // 字典类型
  dictionariesType:number = 0
  // 选中的字典
  checkedDictionary:string = ''
  
  // 字典类型改变：重新获取字典列表
  @Watch('dictionariesType')
  onDictionariesTypeChange(val){
    this.checkedList = []
    this.checkedDictionary = ''

    this.getDictionaryList()
  }
  
  dictionaryList: any[] = [] // 字典列表
  // 获取字典列表
  async getDictionaryList(){
    this.dictionaryList = []

    let res:any = await dictionaryApi.getDictionaryByType({
      type: this.dictionariesType
    })
    if(res.errcode === 0){
      this.dictionaryList = res.data
    }
  }

  // 历史已选中启用字典数据
  historyData:any[] = []
  get isDisableData(){ // 获取字典已删除，历史配置已选中的字典数据
    if(this.isCheckedDictionaryChange){
      return []
    }
    let arr:any[] = []
    let dataIds:any[] = []
    this.plainOptions.forEach(element => {
      dataIds.push(element.id)
    });
    this.historyData.forEach(el => {
      if(!dataIds.includes(el.id)){
        arr.push(el)
      }
    })
    return arr
  }
  
  oldCheckedList:string = '[]'

  @Watch('dictionariesDataVisible')
  onDictionariesDataVisibleChange(type){
    if(type){
      this.isClickOk = false
      this.oldCheckedList = JSON.stringify(this.checkedList) // 记录历史
    }
    else{
      if(!this.isClickOk){ // 取消或右上角关闭
        this.checkedList = JSON.parse(this.oldCheckedList)
      }
    }
  }
  created() {
    if(this.modalData && this.modalData.value){
      const value:any  =  JSON.parse(this.modalData.value)
      this.dictionariesType = value.dictionariesType
      this.$nextTick(()=>{
        if(value.useDictionariesData){
          this.checkedList = value.useDictionariesData.map(el => el.id)
          this.historyData = value.useDictionariesData

          if(value.dictionariesType === 1){ // 树形 
            this.checkedDictionaries = value.useDictionariesData
          }
          this.checkedDictionary = value.checkedDictionary
          if(value.useDictionariesData){
            this.checkedList = value.useDictionariesData.map(el => el.id)
            this.oldCheckedList = JSON.stringify(this.checkedList) // 记录历史
            this.historyData = value.useDictionariesData
          }

          this.searchDictionaryRecord()
          this.getDictionaryList()
        }
      })
    }else{
      this.getDictionaryList()
    }
  }

}
</script>
<style lang="less" scoped>
.breadcrumb{
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 8px;
  margin-bottom: 8px;
  max-height: 53px;
  overflow-y: auto;
}
.left-search-box{
  position: relative;
  display: flex;
  padding: 12px 24px;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  span{
    flex: 1;
  }
  /deep/input{
    border: none !important;
    box-shadow: none !important;
  }

  .search-result{
    position: absolute;
    top: 100%;
    left: 24px;
    width: 349px;
    max-height: 330px;
    z-index: 2;
    background: #ffffff;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    .title{
      width: 100%;
      height: 35px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 8px 16px;
      border-bottom: 1px solid #E8E8E8;
      color: rgba(0, 0, 0, 0.65);
      font-size: 12px;
    }
    .result-wrapper{
      height: 295px;
      overflow: auto;
      .checkbox{
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .result-item{
        display: flex;
        align-items: center;
        height: 53px;
        &:hover{
          background-color: #f8f8f8;
        }
        .item-info{
          height: 100%;
          padding: 6px 0;
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          border-bottom: 1px solid #E8E8E8;
          .name{
            color: #000000;
            line-height: 24px;
            font-size: 14px;
          }
          .about{
            font-size: 12px;
            color: rgba(0, 0, 0, 0.65);
            line-height: 17px;
          }
        }
      }
    }

    .no-result{
      height: 83px;
      text-align: center;
      padding: 32px 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
    .ant-checkbox-group{
      width: 100%;
    }
  }
}
.tree-wrapper{
  width: 100%;
  height: 390px;
  overflow: hidden;
  display: flex;
  .right{
    width: 311px;
    height: 100%;
    overflow-y: auto;
    border-left: 1px solid #e8e8e8;
    padding: 16px;
    overflow-x: hidden;
    span{
      position: relative;
      display: inline-block;
      background: #fafafa;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      padding: 0 24px 0 8px;
      margin: 0 8px 8px 0;
      height: 22px;
      line-height: 20px;
      max-width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      i{
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }
  }
  .left{
    width: 389px;
    height: 390px;
    display: flex;
    flex-direction: column;
    .left-tree-container{
      padding-left: 24px;
      padding-right: 16px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      /deep/.ant-checkbox-group{
        width: 100%;
      }
      .list-item{
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        .next{
          cursor: pointer;
          color: #2970ff;
        }
      }
    }
  }
}

.dictionaries-data{
  cursor: pointer;
  color: #17bc94;
}
.dictionaries-data-wrapper{
  max-height: 300px;
  overflow: auto;
  margin-top: 16px;
  .dictionaries-data-items {
    margin-bottom: 16px;
  }
}

.conditions,
.linkage {
  .subTitle {
    color: #000;
    opacity: 0.85;
    font-weight: 600;
  }
  .add {
    color: #17bc94;
    margin-bottom: 20px;
    text-align: center;
    margin-right: 24px;
    cursor: pointer;
    span {
      margin-right: 8px;
    }
  }
  .fieldlab {
    color: #000;
    opacity: 0.85;
    font-weight: 500;
  }
}
.ant-row {
  margin-bottom: 16px;
  .ant-col {
    line-height: 32px;
  }
  // .ant-col-18{
  //   // line-height: 32px;
  // }
  .radio-col {
    line-height: 32px;
    .ant-radio-group {
      overflow: hidden;
      line-height: 32px;
    }
    .ant-radio-wrapper {
      margin-right: 8px;
    }
  }
  .condition-col {
    margin-top: 6px;
    .ant-select {
      margin-right: 8px;
      width: 106px;
    }
    .ant-input {
      padding: 0 11px;
    }
    .delete-wrap {
      float: right;
      line-height: 32px;
    }
    .select-wrap {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
  }
}
.add-option-wrap {
  // margin-right: -24px;
  min-height: 200px;
  overflow: hidden;
  .add {
    color: @primary-color;
    text-align: center;
    margin-right: 24px;
    cursor: pointer;
    span {
      margin-right: 8px;
    }
  }
  .radio-group {
    max-height: 254px;
    overflow: auto;
    /deep/.ant-radio-wrapper {
      margin-right: 0;
    }
    .input {
      width: 240px;
    }
    .delete {
      // float: right;
      margin-left: 8px;
    }
    .radio-item-wrap {
      margin-bottom: 16px;
      & > div {
        float: left;
      }
      .input-wrap {
        margin-left: 8px;
      }
      .radio-wrap,
      .delete-wrap {
        margin-top: 4px;
      }
    }
  }
  ul {
    max-height: 254px;
    overflow-y: auto;
    overflow-x: hidden;
    li {
      margin-bottom: 16px;
      & > div {
        float: left;
        margin-right: 12px;
        &:last-child {
          margin-top: 5px;
          cursor: pointer;
          margin-right: 12x;
        }
      }
      .input-wrap {
        width: 240px;
        .tips {
          color: #f5222d;
          font-size: 12px;
        }
        // .error{
        //   box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
        //   border-right-width: 1px !important;
        //   border-color: #f5222d;
        //   outline: 0;
        // }
      }
      .default {
        margin-top: 6px;
        /deep/.ant-radio-wrapper {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
