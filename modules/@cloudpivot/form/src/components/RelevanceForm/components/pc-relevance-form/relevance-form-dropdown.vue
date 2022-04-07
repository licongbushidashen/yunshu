
<template>
  <div :id="refId">
  <!-- 树形结构 -->
  <a-tree-select  v-if="control.options.showStyle === 'tree'"
                  :value="selectedId"
                  class="tree-select"
                  :dropdown-style="{ maxHeight: '500px', overflow: 'auto', width: offWidth + 'px'}"
                  :tree-data="treeList"
                  placeholder="请选择"
                  allow-clear
                  showSearch
                  :getPopupContainer="getPopupContainer()"
                  @change="onChange"
                  @focus="onFocus"
                  treeNodeFilterProp="title"
                  :filterTreeNode="treeSearch"
                  >
  </a-tree-select>
  <!-- 平铺结构 -->
  <a-select v-else
            :value="selectedId"
            showSearch
            allowClear
            :filterOption="false"
            :notFoundContent="fetching ? undefined : '无匹配结果'"
            :placeholder="placeholder || '请选择'"
            :getPopupContainer="getPopupContainer()"
            @focus="onFocus"
            @search="onSearch"
            @change="onChange"
            style="width:100%"
            @popupScroll="popupScroll"
            >
    <!-- <a-icon slot="suffix" type="file"/> -->
    <!-- 最近搜索 -->
    <div slot="dropdownRender" slot-scope="menu">
      <div
        style="padding: 4px 8px; cursor: pointer;"
        @mousedown="e => e.preventDefault()"
        class="hestory-items-wrapper"
      >
        
        <div class="history-wrapper" v-if="historySeachList.length" :class="{'show-all': isShowAll}">
          <template>
            <p>最近搜索</p>
            <span class="history-item" :class="'history-'+ key" v-for="(item, key) in historySeachList" :key="item+key" @click="onSearch(item)">
              {{item}}
              <a-icon type="close" @click.stop="delHistoryItem(item, key)" />
            </span>
            <div class="show-more" :class="{'icon-up': isShowAll}" @click="isShowAll = !isShowAll"><a-icon type="down" /></div>
          </template>
        </div>

        <p v-if="historySeachList.length">全部</p>
      </div>
      <!-- <a-divider style="margin: 4px 0;" /> -->
      <v-nodes :vnodes="menu" />
    </div>
    <a-spin v-if="fetching" slot="notFoundContent" size="small" />
    <a-select-option v-if="selectedId && list.length === 0" :value="selectedId">
      {{ selectedItem | highlightText(currentSeachValue) }}
    </a-select-option>

    <a-select-option v-for="item in drowdownList" :key="item.id" :value="item.id" >
     <p class="p-select-option" :title="item[getDisplayField]" v-html="setHighlightText(item[getDisplayField])"></p>
    </a-select-option>

    <template v-if="fetching">
      <a-select-option value="loading" disabled >
        <p>加载中</p>
      </a-select-option>
    </template>

    <!-- <template v-if="loadedAll">
      <a-select-option value='over' disabled >
        <p>已加载全部数据</p>
      </a-select-option>
    </template> -->
  </a-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

// import {
//   // RelevanceFormControl,
//   RelevanceFormSearchResult
// } from "../../../controls";

import {
  RelevanceFormSearchParams,
  RelevanceFormSearchResult
} from "@cloudpivot/form/src/common/controls";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";

import {
  // TreeSelect,
  Select,
  Tooltip,
  Icon,
  Spin,
  TreeSelect,
  Radio,
} from "@h3/antd-vue";

import * as Bus from '@cloudpivot/form/schema';

import { formApi } from "@cloudpivot/api";
import { ReverseQueryService } from "@cloudpivot/form/src/common/services";

import { deepCopy } from '@cloudpivot/form/utils';

@Component({
  name: "relevance-form-dropdown",
  components: {
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATreeSelect: TreeSelect,
    // ATreeSelectNode: TreeSelect.TreeNode,
    AIcon: Icon,
    ASpin: Spin,
    ARadio: Radio,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  }
})
export default class RelevanceFormDropdown extends RelevanceFormControl {

  list: RelevanceFormSearchResult[] = [];
  isShowAll: boolean = false

  // 返回搜索字段之前的文字
  preHighlightText(value:string, currentSeachValue:string){
    let index = value.indexOf(currentSeachValue)
    if(index < 0){
      return ''
    }
    return value.substring(0, index)
  }
  // 返回搜索字段之后的文字
  nextHighlightText(value:string, currentSeachValue:string){
    let index = value.indexOf(currentSeachValue)
    if(index < 0){
      return ''
    }
    return value.substring(index + currentSeachValue.length)
  }
  // 设置高亮文字
  setHighlightText(value){
    if(!this.currentSeachValue){ // 没有搜索返回原值
      return value
    }
    let first = this.preHighlightText(value, this.currentSeachValue)
    let last = this.nextHighlightText(value, this.currentSeachValue)
    if(this.currentSeachValue === value){
      return `<font>${this.currentSeachValue}</font>`
    }
    if(!first && !last){
      return value
    }
    return `${first}<font>${this.currentSeachValue}</font>${last}`
  }

  searchTimeoutRef: any = null;
  page = 1
  loadedAll = false // 全部数据加载完成

  fetching = false;
  currentSeachValue:string = ''

  get selectedId() {
    if (this.ctrl.value) {
      return this.ctrl.value.id || undefined;
    }
    return undefined;
  }

  get selectedItem() {
    
    if (this.selectedId && this.list.length === 0) {
      return this.parseDisplayFieldValue(
        this.ctrl.value[this.getDisplayField],
        this.getDisplayField
      );
    }
    return "";
  }

  historySeachList: any[] = []

  get treeList (){
    if(this.list.length){
      let arr : any=[];
      for (let val of this.list) {
        if (val[this.getDisplayField] !== null && val[this.getDisplayField] !== '') {
          arr.push({
            value: val.id,
            key: val.id,
            title: val[this.getDisplayField],
            children: this.childrenToTreeList(val.t__children_)
          });
        }
      }
      return arr;
    }else{
      return []
    }
  }

  //把传过来的关联数据项的子列表做一个清洗，变成符合treeList的数据类型
  childrenToTreeList(children){
    if(!children) return;
    let arr:any = [];
    for (let i = 0; i< children.length;i++){
      if(children[i].data[this.getDisplayField]){
        arr.push({
          value: children[i].data.id || "",
          key: children[i].data.id,
          title: children[i].data[this.getDisplayField],
          children: this.childrenToTreeList(children[i].data.t__children_)
        })
      }
      
    }
    return arr
  }

  get drowdownList() {
    if (this.list.length) {
      let arr: any[] = [];
      for (let val of this.list) {
        if (val[this.getDisplayField] !== null && val[this.getDisplayField] !== '') {
          let value = this.parseDisplayFieldValue(
            val[this.getDisplayField],
            this.getDisplayField
          );
          arr.push({
            id: val.id,
            [this.getDisplayField]: value
          });
        }
      }
      return arr;
    } else {
      return [];
    }
  }
  setControl() {
    super.setControl();
    if (this.selectedId) {
      this.onFocus();
    }
  }

  async onFocus() {
    this.setOffWidth()
    await this.search("");
  }

  //树形搜索功能
  treeSearch(input,option){
    return (
      option.componentOptions.propsData.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  }

  onSearch(value: string) {
    clearTimeout(this.searchTimeoutRef);
    this.searchTimeoutRef = setTimeout(() => {
      this.list = []
      this.search(value);
    }, 300);
  }
  // 保存历史最近10个查询记录
  saveHistorySeach(){
    let value = this.currentSeachValue
    if(value === undefined || value === ''){
      return
    }
    let index:number = this.historySeachList.indexOf(value)
    if(index !== -1){
      this.historySeachList.splice(index, 1)
    }else{
      if(this.historySeachList.length >= 10){ // 历史查询记录大于10个，删除一个老数据
        this.historySeachList.pop()
      }
    }
    this.historySeachList.unshift(value)
    localStorage.setItem((this.ctrl.id) as string, JSON.stringify(this.historySeachList))
  }
  // 删除历史记录
  delHistoryItem(item, obj){
    let index:number = this.historySeachList.indexOf(item)
    if(index !== -1){
      this.historySeachList.splice(index, 1)
      localStorage.setItem((this.ctrl.id) as string, JSON.stringify(this.historySeachList))
      // const historyObj = document.querySelector('.history-'+ obj) // 双向数据绑定不能触发弹窗中的修改，使用操作dom的方式删除
      // historyObj && historyObj.remove()
    }
  }

  popupScroll($ev){
    if($ev.target.scrollHeight <  $ev.target.offsetHeight + $ev.target.scrollTop + 64){
      // 滚动到底||加载全部数据
      if(this.fetching || this.loadedAll || this.drowdownList[0].id === '0'){
        return
      }
      this.page ++
      this.search(this.currentSeachValue, this.page)
    }
  }

  async search(value: string, page?:number) {
    if(!page){
      this.page = 0
    }
    this.currentSeachValue = value // 记录最后一次加载
    if (this.queryConditions.length === 0 && this.controlOpts.conditions) {
      const res = await this.getConfig();
      if(res && res.conditions) {
        this.queryConditions = res.conditions
      }
    }

    if (this.fetching) {
      return;
    }
    this.fetching = true;
    // this.list = [];
    //目前先查找全部数据，以后做异步的展开请求，则在depth做查询深度

    let view:any = {
            type: this.control.options.showStyle === 'tree' ? "TREE": "LIST",
            depth: this.control.options.showStyle === 'tree' ? 0 : undefined,
            parentRef: this.control.options.showStyle === 'tree' ? "#" : undefined,
        };
    this.fetch(page === undefined ? 0 : page, 1000, value, [], false ,view = view, ).then( 
      seg => {
        this.fetching = false;
        if(page){
          this.list = [...this.list,...seg.data] 
        }else{
          this.list = seg.data;
        }
        this.loadedAll = seg.total == this.list.length
      },
      () => (this.fetching = false)
    );
  }


  //树形列表打平查找id
  treeToList(list){
    if(!list) return []
    let arr:any = list;
    for (let i = 0; i<list.length; i++){
      if(list[i].t__children_){
        arr = [...arr, ...this.treechildToList(list[i].t__children_)];
      }
    }
    return arr;
  }
  //树形子列表打平
  treechildToList(children){
    if(!children) return [];
    let arrList:any = [];
    for (let i = 0; i<children.length; i++){
      arrList.push(children[i].data || {});
      arrList = [...arrList, ...this.treechildToList(children[i].data.t__children_)]
    }
    return arrList;
  }

  async onChange(selectedId: string) {
    if (selectedId) {
      this.saveHistorySeach() // 记录历史搜索条件
      let arr =  this.treeToList(this.list);
      let item = arr.find(x => x.id === selectedId);
      item = await this.convertForMappings(item);
      // this.ctrl.value = item;
      this.interceptorValue(item);
      this.setValue(item);
      this.treeViewSend();
    } else {
      this.ctrl.value = null;
    }
  }
  
  treeViewSend(){
    if(!this.treeView) return //不是树形视图直接返回，不用发送数据给tree-query-form组件
    if(this.$route.path !== this.myRouter) return //缓存的组件任然会触发delete或close事件从而触发该函数，如果触发的时候路由不相同，则不发送数据
    let isValue:boolean = false //判断是否有值，有的话树形视图那里不需要展开所有数据，否则需要展开数据
    if(this.control.value){
      isValue = true
    }
    this.onFocus().then(() => {
      setTimeout(() => {
        console.log(this.treeList,"treeList======================="); 
        Bus.EventBus.$emit('treedata', {
          list: this.list,
          treeList: this.treeList,
          controlKey: this.control.key,
          value: this.selectedId,
          visible: this.control.options.visible,
          isValue:isValue,
          name:this.control.options.name,
          setTreeView: false,
          }); //把关联单选作为查询条件视图， 且为树形， 源数据、树形数据、该控件的key值， 传输给树形视图展示控件。
      }, 800);
    })
  }


  refId:string = 'id_001';
  offWidth: any = undefined;
  myRouter:string = '';
  created(){
    this.refId = 'id_' + +new Date();
    this.myRouter = this.$route.path;
  }

  setOffWidth(){
    // @ts-ignore
    let offWidth = document.querySelector(`#${this.refId}`) && document.querySelector(`#${this.refId}`).offsetWidth
    if(offWidth){
      this.offWidth = offWidth;
    }
  }

  mounted(){
    const historySeachList = localStorage.getItem((this.ctrl.id) as string)
    if(historySeachList){
      this.historySeachList = JSON.parse(historySeachList)
    }else{
      this.historySeachList = []
    }
    let that = this
    window.addEventListener('message',function(e){
      if(e.data === 'close' || e.data === 'delete'){
        that.treeViewSend();
        console.log("delete--------------------------");
      }
    }, false)
    //把查询视图的关联单选需要的数据发送过去.
    this.treeViewSend();
  }

  @Watch("selectedId")
  getSelectedId(){
    if(this.selectedId && this.list.length === 0){
      this.search("");
    }
  }
}
</script>

<style lang="less">
.application-box .table-box .ant-select-dropdown-menu-item {
    text-align: left !important;
    font{
      color: #17BC94
    }
    // p{
    //   text-align: center;
    // }
    .ant-spin-spinning {
      position: relative;
      left: 50%;
      transform: translate(-50%, 0);
    }
    &.ant-select-dropdown-menu-item.ant-select-dropdown-menu-item-disabled{
      text-align: center !important;
    }
}

</style>

<style lang="less" scoped>
.tree-select{
  width: 100%;
}

.hestory-items-wrapper{
  p{
    font-size: 12px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 18px;
  }
  span{
    display: inline-block;
    height: 22px;
    line-height: 22px;
    background: #F5F5F5;
    border-radius: 4px;
    padding: 0 5px;
    position: relative;
    font-size: 12px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    margin: 5px;
    margin-bottom: 0;
    max-width: 10em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 16px;
    i{
      opacity: 0.65;
      font-size: 10px;
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
.history-item{
  max-width: 8em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.history-wrapper{
  width: 100%;
  overflow: hidden;
  max-height: 82px;
  position: relative;
  padding-right: 16px;
  box-sizing: border-box;
}
.show-more{
  font-size: 12px;
  width: 16px;
  height: 16px;
  position: absolute;
  right: 0;
  bottom: 8px;
  background-color: #F5F5F5;
  color: rgba(0, 0, 0, 0.65);
  border-radius: 8px;
  text-align: center;
  line-height: 16px;
  transition: all 0.3s;
  &.icon-up{
    transform: rotate(180deg);
  }
}
.show-all{
  max-height: unset;
}

/deep/.ant-select-dropdown-menu-item-selected{
  background-color: #E8FCF4 !important;
}
/deep/.ant-select-dropdown-menu-item:hover:not(.ant-select-dropdown-menu-item-disabled):hover{
  background-color: #E8FCF4 !important;
}
.p-select-option{
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>


<style lang="less" scoped>

li.ant-select-tree-treenode-switcher-close{
  .ant-select-tree-title{
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    line-height: 21px;
    height: 21px;
  }
}
.ant-select-tree-switcher.ant-select-tree-switcher_close{
  vertical-align: super !important;
}
.ant-select-tree li{
  margin: 0;
}
.ant-select-tree li .ant-select-tree-node-content-wrapper{
  padding: 0;
}
.ant-select-tree-node-content-wrapper{
  padding-top: 10px !important;
  height: 40px;
}
</style>
