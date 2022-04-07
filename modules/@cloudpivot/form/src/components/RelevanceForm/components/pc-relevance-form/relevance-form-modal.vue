
<template>
  <div class="relevance-form-modal">
    <a-input
      :value="text"
      :readonly="true"
      :placeholder="placeholder"
      @click="onClick"
      @mouseover="onMouseenter"
      @mouseout="onMouseleave"
    >
      <a-icon
        v-show="hover"
        slot="suffix"
        type="close-circle"
        @click="clear"
        @mouseenter="onMouseenter"
      />
      <a-icon v-show="!hover" slot="suffix" type="file" />
    </a-input>

    <!-- 树形-->
    <a-modal 
      v-if="control.options.showStyle === 'tree'"
      :dialogStyle="{width: '640px'}"
      title="请选择"
      :visible="visible"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :dialogClass="dialogClass"
      :closable="true"
      @ok="onModalOk"
      class="tree-modal"
      @cancel="onModalCancel">
      <!-- 搜索框 -->
      <a-input-search type="search" style="margin-bottom: 8px; width: 330px ;height: 32px" placeholder="请输入关键字进行过滤" @change="onChange"/>

      <!-- 弹出框树 -->
      <a-spin :spinning="spinning" tip="搜索中,请稍后..." :delay="200">
        <div class="JumpTree" >
          <a-tree
            v-if="treeList.length !== 0 || spinning"
            :key="TreeKey"
            :value="selected"
            :treeData="treeList"
            placeholder="请选择"
            allow-clear
            show-search
            @select="onselect"
            :defaultExpandAll="defaultExpandAll">

            <template slot="tree" slot-scope="item">
              <div class="treeNode">
                <a-radio :checked="item.key === selectedKey" ><span class="title" :class="{searchSelect: searchTitle != '' && item.title.indexOf(searchTitle) != -1 }" :title="item.title">{{item.title}}</span></a-radio>
              </div>
            </template>
          
          </a-tree>  
        </div>

        <!-- 没有数据时候提示 -->
        <div v-if="treeList.length === 0 && !spinning" class="noTreeData" >
          <div class="noTreeDataPtr"></div>
          <div class="noTreeDataTips"><span>{{searchTitle === '' ? '您还未创建数据，无法设置层级关系' : '没有符合匹配的数据'}}</span></div>
        </div>
      </a-spin>
      
    </a-modal>

    <!-- 平铺 -->
    <a-modal
      v-else
      :title="formTitle"
      :visible="visible"
      :width="full ? '100%' : '1200px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :dialogClass="dialogClass"
      :closable="!full"
      @ok="onModalOk"
      @cancel="onModalCancel"
    >
      <a-tooltip placement="top" v-show="!full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.fullScreen") }}</span>
        </template>
        <span @click="fullScreen(true)" class="fullscreen icon aufontAll"
          >&#xe8e5;</span
        >
      </a-tooltip>

      <a-tooltip placement="top" v-show="full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.smallScreen") }}</span>
        </template>
        <span @click="fullScreen(false)" class="fullscreen icon aufontAll"
          >&#xe8e7;</span
        >
      </a-tooltip>
      <list-selector
        v-model="selected"
        :newCol="newCol"
        :listCode="controlOpts.queryCode"
        :schemaCode="controlOpts.schemaCode"
        :cols="2"
        :columns="columns"
        :relevanceFormCode="this.control"
        :showActions="false"
        :query="query"
        :reverseViewFlag="!!this.control.options.showField"
        :defuaultShowSearch="false"
        @change="onListChange"
        :isAuthorize="isAuthorize"
        :control="control"
      ></list-selector>

    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";
import cloneDeep from "lodash/cloneDeep";

import {
  RelevanceFormSearchParams,
  RelevanceFormSearchResult
} from "@cloudpivot/form/src/common/controls";

import {
  DataItemType,
  RelevanceFormSelectMode,
  convertDataItemExp,
  RendererFormControl,
  FormControlType,
} from "@cloudpivot/form/schema";

import {
  // TreeSelect,
  Modal,
  Tooltip,
  Icon,
  Spin,
  Input,
  Tree,
  Radio,
} from "@h3/antd-vue";
// import { ReverseQueryService } from "@cloudpivot/form/src/common/services";
// import { formApi } from "@cloudpivot/api";
// import { deepCopy } from "@cloudpivot/form/utils";
import { listApi } from "@cloudpivot/api";

@Component({
  name: "relevance-form-modal",
  components: {
    ATooltip: Tooltip,
    AModal: Modal,
    AInput: Input,
    AIcon: Icon,
    ASpin: Spin,
    ARadio:Radio,
    ATree: Tree,
    AInputSearch: Input.Search,
  },
})
export default class RelevanceFormModal extends RelevanceFormControl {
 @Prop({
    default : {}
  })
  control !: any

  visible = false;

  selected = new Array();

  query = {};

  hover = false;

  full = false;

  newCol: any = [];

  isClose: boolean = false;

  /*
  ***************************树形弹出框数据与逻辑*****************
  */
  list: RelevanceFormSearchResult[] = [];

  searchTimeoutRef: any = null;

  page = 1

  defaultExpandAll:boolean = false;

  TreeKey:number = 0;

  searchTitle:string = '';

  spinning:boolean = false;
  onChange(e) {
    console.log(e.target.value,"e---------");
    this.searchTitle = e.target.value;
    this.TreeKey = this.TreeKey + 1;
    if(e.target.value === ''){
      this.defaultExpandAll = false
    }else{
      this.defaultExpandAll = true
    }
    
    this.onSearch(e.target.value);
    
  }

  get treeList (){
    if(this.list.length){
      let arr : any=[];
      for (let val of this.list) {
        if (val[this.getDisplayField] !== null && val[this.getDisplayField] !== '') {
          arr.push({
            value: val.id,
            key: val.id,
            title: val[this.getDisplayField],
            children: this.childrenToTreeList(val.t__children_),
            scopedSlots:{title: 'tree',}
          });
        }
      }
      console.log(arr);
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
          value: children[i].data.id,
          key: children[i].data.id,
          title: children[i].data[this.getDisplayField],
          children: this.childrenToTreeList(children[i].data.t__children_),
          scopedSlots:{title: 'tree',}
        })
      }
      
    }
    return arr
  }

  selectedKey:string = '';

  onselect(selectedKeys,e){
    console.log(selectedKeys[0]);
    this.selectedKey = selectedKeys[0]
    let arr =  this.treeToList(this.list);
    let item = arr.find(x => x.id === selectedKeys[0]);
    this.selected[0] = item;
  }

  onSearch(value: string) {
    clearTimeout(this.searchTimeoutRef);
    this.searchTimeoutRef = setTimeout(() => {
      this.list = []
      this.search(value);
    }, 300);
  }

  async search(value: string, page?:number) {
    if(!page){
      this.page = 0
    }
    // this.list = [];
    this.spinning = true;
    let view = {
            type: this.control.options.showStyle === 'tree' ? "TREE": "LIST",
            depth: this.control.options.showStyle === 'tree' ? 0 : undefined,
            parentRef: this.control.options.showStyle === 'tree' ? "#" : undefined,
        };
    this.fetch(page === undefined ? 0 : page, 1000, value, [], false ,view = view,).then( 
      seg => {
        if(page){
          this.list = [...this.list,...seg.data] 
        }else{
          this.list = seg.data;
        }
        console.log(this.list);
        this.spinning = false;
      },
      () => {}
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
      arrList.push(children[i].data);
      arrList = [...arrList, ...this.treechildToList(children[i].data.t__children_)]
    }
    return arrList;
  }

  /*
  ***************************树形弹出框数据与逻辑*****************
  */

  get text() {
    if (!this.ctrl.value) {
      return "";
    }
    if (!this.ctrl.value[this.getDisplayField]) {
      this.setLinkageValue();
    }
    return this.parseDisplayFieldValue(
      this.ctrl.value[this.getDisplayField],
      this.getDisplayField
    );
  }

  async onClick() {
    if(this.control.options.showStyle === 'tree'){
      this.search("");
    }
    this.query = this.getParams();
    if (
      this.control.options.showField &&
      Array.isArray(this.control.options.showField) &&
      this.control.options.showField.length > 0
    ) {
      let relevanceFormCode = this.control.parentKey
        ? `${this.control.parentKey}.${this.control.key}`
        : this.control.key;
      if (this.control.path) {
        relevanceFormCode = this.control.path.join(".");
      }

      const param = {
        sheetCode: this.control.options.sheetParams.sheetCode,
        schemaCode: this.control.options.sheetParams.schemaCode,
        relevanceFormCode: relevanceFormCode,
      };
      const res: any = await listApi.selectFormTitle(param);
      if (res.errcode === 0) {
        res.data.configBizPropertyList.map((options) => {
          options.code = options.code === "id" ? "ids" : options.code;
          options.propertyCode = options.code;
          options.width = "120";
          options.childColumns =
            options.subSchema && options.subSchema.properties;
          if (
            options.propertyType === DataItemType.Sheet &&
            options.childColumns
          ) {
            options.childColumns = options.childColumns.map((v) => {
              v.propertyCode = v.code;
              v.vcTitle = v.name;
              v.width = "150";
              return v;
            });
          }
          return options;
        });

        this.newCol = res.data.configBizPropertyList;
        this.visible = true;
        this.formTitleObj = await RelevanceFormControl.service.getBizmodelTitle(
          this.controlOpts.schemaCode || ""
        );
      }
    } else {
      this.visible = true;
    }
  }

  get dialogClass() {
    // { 'full-modal': full, 'relevance-form': true }
    if (this.full) {
      return 'full-modal relevance-form';
    } else {
      return 'relevance-form';
    }
  }

  onMouseenter() {
    this.hover = true;
  }

  onMouseleave() {
    this.hover = false;
  }

  clear() {
    this.ctrl.value = null;
    this.selected = [];
  }

  onListChange(rows: any) {
    this.selected = rows;
  }

  fullScreen(full: boolean) {
    this.full = full;

    try {
      if(full){
      // @ts-ignore
        window.parent.window.document.querySelector('.icon-close').style.display = 'none'
      }else{
        // @ts-ignore
        window.parent.window.document.querySelector('.icon-close').style.display = 'block'
      }
    } catch (error) {}

  }
  async onModalOk() {
    console.log(this.selected[0]);
    let item = await this.convertForMappings(this.selected[0]);
    this.visible = false;
    if (item) {
      this.interceptorValue(item);
      setTimeout(() => {
        this.setValue(cloneDeep(item));
      }, 300);
    }
    // this.interceptorValue(item);
    // this.setValue(item);
    // setTimeout(() => {
    //   this.setValue(cloneDeep(item));
    // }, 300);
  }

  onModalCancel() {
    this.visible = false;
    this.full = false;
    if (this.ctrl.value) {
      this.selected = [this.ctrl.value];
    }else{
      this.selected = []
    }
  }

  get isAuthorize(){
    return this.control.options.isAuthorize
  }

  beforeCreate() {
    const comp = RelevanceFormControl.loadListSelector();
    (this.$options as any).components.ListSelector = comp;
  }
}
</script>

<style lang="less" scoped>
.ant-input-suffix > i {
  color: #ccc;
}

.relevance-form-modal .anticon-close-circle {
  cursor: pointer;
  transition: color 0.3s;
  font-size: 12px;

  &:hover {
    color: #999;
  }

  &:active {
    color: #666;
  }
}

.fullscreen {
  position: absolute;
  top: 16px;
  right: 60px;
  cursor: pointer;
}

.full-modal .fullscreen {
  right: 16px;
}
</style>

<style lang="less">
.relevance-form:not(.full-modal) .ant-modal-body .list-selector {
  height: 56vh;
  overflow: auto;
}
  .full-modal{
    /deep/ .ant-modal{
      height: 100%;
      top:0;
      padding-bottom: 0;
    }
  }



.tree-modal{
  .ant-modal-content{
    width: 620px !important;
  }
  
  .JumpTree{
    overflow: hidden;
    overflow-y: auto;
    .ant-tree{
      height: 240px;
    }
  }
  .searchSelect{
    font-weight: bold;
  }
  .noTreeData{
    .noTreeDataPtr{
      position: relative;
      width: 100%;
      height: 200px;
      background-image: url("./no-data.png");
      background-repeat: no-repeat;
      background-size:50%;
      left: 25%;
      margin-top: 5%;
    }
    .noTreeDataTips{
      position: relative;
      top: -40px;
      text-align: center;
      color: rgba(119, 119, 119, 0.5);
    }
  }

  .ant-tree-treenode-switcher-close, .ant-tree-node-content-wrapper-open{
    .ant-radio{
      position: relative;
      bottom: 5px;
    }
    .title{
      display: inline-block;
      max-width: 500px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

</style>
