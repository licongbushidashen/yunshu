<template>
  <div class="workflow-tree" @click.stop="">
    <div class="show-value" @click="showOption">
      <i v-if="showName" class="icon aufontAll h-icon-all-logic"></i>
      {{showName}}
      <span class="placeholder-text" v-if="showName === ''">
        请选择
      </span>
      <a-icon type="down" class="icon-down" :class="{'icon-up': isShow}" />
      <a-icon v-if="showName" @click.stop="delValue" class="_close" type="close" />
    </div>
    <div class="tree-wrapper" v-if="isShow">
      <a-input ref="search_input" placeholder="请输入" v-model="currentSearchValue" @change="searchWorkflow"/>
      <!-- <input type="text" ref="search_input" placeholder="请输入" v-model="currentSearchValue" @keydown.13="searchWorkflow" /> -->
      <div
        style="padding: 4px 8px; cursor: pointer;"
        class="hestory-items-wrapper"
      >
        <div class="history-wrapper" v-if="historySearchList.length" :class="{'show-all': isShowAll}">
          <template>
            <p>最近搜索</p>
            <span class="history-item" :class="'history-'+ key" v-for="(item, key) in historySearchList" :key="item+key" @click="onSearch(item)">
              {{item}}
              <a-icon type="close" @click.stop="delHistoryItem(item, key)" />
            </span>
            <div class="show-more" :class="{'icon-up': isShowAll}" @click="isShowAll = !isShowAll"><a-icon type="down" /></div>
          </template>
        </div>
    </div>
      <div class="search-resulte">
        <div class="resulte-item">
          <template v-for="(item) in searchResulte">
            <p :title="item.appName + ' | ' + el.name" v-for="el in item.dataList" :key="el.id || el.code" @click="checkedItem(el)">
              <i class="icon aufontAll" :class="el.icon || 'h-icon-all-logic'"></i>
              {{item.appName}}  |  <span v-html="setHighlightText(el.name)"></span>
            </p>
          </template>
          <p class="no-resulte" v-if="currentSearchValue != '' && searchResulte.length === 0">无匹配结果</p>
        </div>
      </div>
      <a-tree
        dropdownClassName="sub-tpl-ts"
        allowClear
        v-model="treeValue"
        :multiple="multiple"
        :labelInValue="labelInValue"
        :treeData="workflowTplsTree"
        :loadData="loadTreeData"
        :placeholder="$t('cloudpivot.flowCenter.pc.plzSelect')"
        @select="onSelect"
        @change="clearValue"
        ref="tree"
        v-if="currentSearchValue === '' && searchResulte.length === 0"
      >
        <!-- 图标 -->
        <span
          slot="title"
          slot-scope="{label, label_i18n, icon}"
          class="cus-title"
        >
          <i :class="'icon aufontAll ' + icon"/>
          {{ isChinese ? label : label_i18n[lang] }}
        </span>
      </a-tree>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { Tree,Input, Icon } from '@h3/antd-vue';

// import * as Application from '@/apis/application';

import { listApi } from '@cloudpivot/api';
import { workflowCenterApi } from '@cloudpivot/api'

import common from '@cloudpivot/common';

const Application = listApi;


@Component({
  name: 'workflow-tree',
  components: {
    ATree: Tree,
    AInput:Input,
    AIcon:Icon
  }
})

export default class WorkflowTree extends Vue {
  @Prop() value!:any;

  @Prop({ default: false }) multiple?:boolean;

  @Prop({ default: false }) labelInValue?:boolean;

  @Prop({ default: '' }) userId?:string;

  @Prop() trustType?:string;

  workflowTplsTree:any = [];

  parentKey:string = '';

  isShow:boolean = false; // 用于重新挂载

  lang:string = 'zh';

  isChinese:boolean = true;

  treeValue:any = null;

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
    if(!this.currentSearchValue){ // 没有搜索返回原值
      return value
    }
    let first = this.preHighlightText(value, this.currentSearchValue)
    let last = this.nextHighlightText(value, this.currentSearchValue)
    if(this.currentSearchValue === value){
      return `<font>${this.currentSearchValue}</font>`
    }
    if(!first && !last){
      return value
    }
    return `${first}<font>${this.currentSearchValue}</font>${last}`
  }

  searchResulte: any[] = [] // 搜索结果
  currentSearchValue: string = '' // 当前搜索条件
  showName: string = '' //选中项的显示名称
  historySearchList: any[] = [] // 历史记录列表
  isShowAll: boolean = false

  showOption(){ // 展开选项并让搜索框获取焦点
    this.isShow = !this.isShow;
    this.$nextTick(()=>{
      this.isShow && (this.$refs.search_input as any).focus()
    })
  }

  onSearch(value: string) { // 搜索历史记录
    this.currentSearchValue = value
    this.searchWorkflow()
  }
  searchTimeoutRef: any = null; // 定时器
  searchWorkflow(){ // 搜索流程模板
    if(this.currentSearchValue === ''){ //未输入搜索条件
      this.searchResulte = []
      return
    }
    clearTimeout(this.searchTimeoutRef);
    this.searchTimeoutRef = setTimeout(() => {
      workflowCenterApi.searchMyWorkflowList({
        workflowName: this.currentSearchValue,
        language: (this as any).$i18n.locale,
        isMobile: false
      }).then((res: any) => {
        if (res.errcode !== 0) {
          this.searchResulte = []
          return;
        }
        if (res.data && Array.isArray(res.data.appList)) {
          this.searchResulte = res.data.appList
        } else {
          this.searchResulte = []
        }
      });
    }, 300);
  }
  // 保存历史最近10个查询记录
  saveHistorySearch(){
    let value = this.currentSearchValue
    if(value === undefined || value === ''){
      return
    }
    let index:number = this.historySearchList.indexOf(value)
    if(index !== -1){
      this.historySearchList.splice(index, 1)
    }else{
      if(this.historySearchList.length >= 10){ // 历史查询记录大于10个，删除一个老数据
        this.historySearchList.pop()
      }
    }
    this.historySearchList.unshift(value)
    localStorage.setItem('processTemplate', JSON.stringify(this.historySearchList))
  }
  // 删除历史记录
  delHistoryItem(item, obj){
    let index:number = this.historySearchList.indexOf(item)
    if(index !== -1){
      this.historySearchList.splice(index, 1)
      localStorage.setItem('processTemplate', JSON.stringify(this.historySearchList))
    }
  }

  delValue(){ // 删除值
    this.$emit('input', '');
    this.$emit('select', {});
    this.isShow = false
    this.showName = ''
  }

  checkedItem(item){ // 选中流程模板
    const _workflowCode = 'workflow-' + item.code;
    const name = item.name || item.label;
    const name_i18n = item.name_i18n || {
      en: name
    };
    this.saveHistorySearch()
    this.valueChange(_workflowCode, name, name_i18n)
    this.showName = name
    this.isShow = false
    
  }

  valueChange(_workflowCode, name, name_i18n){ // 值改变事件
    if (!_workflowCode) return;
    if (this.multiple) {
      const _workflowValue = [ ...this.treeValue, { ..._workflowCode, name } ];
      this.$emit('input', _workflowValue);
    } else {
      this.$emit('input', _workflowCode);
    }
    this.$emit('select', {name, name_i18n});
  }

  mounted() {
    this.lang = this.$i18n.locale;
    this.isChinese = this.$i18n.locale === 'zh';
    this.treeValue = this.value ? this.value : null;
    this.getAppList();
  }
  created(){
    // 加载历史记录
    const historySearchList = localStorage.getItem('processTemplate')
    if(historySearchList){
      this.historySearchList = JSON.parse(historySearchList)
    }else{
      this.historySearchList = []
    }

    document.addEventListener("click",()=>{
      this.isShow = false
    })
  }

  /**
   * 获取所有应用
  */
  async getAppList() {
    const param:any = {
      isMobile: false,
    };
    let res:any = {};
    // 从流程委托过来的增加参数
    if (this.userId) {
      param.userId = this.userId;
      param.trustType = this.trustType;
      res = await Application.listForTrust(param);
    } else {
      param.isPortal = true
      res = await Application.list(param);
    }
    
    if (res.errcode === 0) {
      // 一级树
      const levelOneTree = this.SWTreeGenerator(res.data, 1, 'App');
      this.workflowTplsTree = levelOneTree;
    }
  }

  /**
   * 异步加载数据
  */
  async loadTreeData(node:any) {
    const _type = node.$vnode.data.props.type;
    const _val = node.$vnode.data.props.value;
    this.parentKey = node.$vnode.data.key;
    switch (_type) {
      case 'App': // 是应用，获取目录
        this.handleGetAppMenu(_val);
        break;
      case 'Folder':
        this.handleGetWorkflowList(_val);
        break;
      case 'BizModel':
        this.handleGetWorkflowList(_val);
        break;
      default:
        break;
    }
  }

  /**
   * 获取目录
  */
  async handleGetAppMenu(code:string) {
    // 从流程委托过来的增加参数
    const param:any = {
      appCode: code,
      isPortal: true
    };
    if (this.userId) {
      param.trustType = this.trustType;
    }
    const appMenuRes = await Application.getAppItem(param);
    if (appMenuRes.errcode === 0) {
      const _resData = appMenuRes.data;
      if (!_resData || _resData.length === 0) return;

      // 生成树
      const levelTwoTree = this.SWTreeGenerator(_resData, 2, 'Folder', this.parentKey);

      const _p = { key: this.parentKey, tree: levelTwoTree };
      this.setTreeDataAsync(_p);
    }
  }

  clearValue(value:any) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      this.$emit('input', '');
    }
  }

  /**
   * 获取流程列表
  */
  async handleGetWorkflowList(code:string) {
    const params: any = {
      schemaCode: code,
    };
    // 从流程委托过来的增加参数
    let _worfklowRes:any = {};
    if (this.userId) {
      params.userId = this.userId;
      params.trustType = this.trustType;
      _worfklowRes = await Application.getWorkflowListTrust(params);
    } else {
      params.isPortal = true
      _worfklowRes = await Application.getWorkflowList(params);
    }
    // 获取流程列表 最底层树
    const level = this.parentKey.split('-').length + 1;
    if (_worfklowRes.errcode === 0) {
      const workflowData = _worfklowRes.data;
      if (!workflowData && workflowData.length === 0) return;

      // 流程树
      const workflowList:Array<any> = workflowData.filter((item:any) => item.published);
      const workflowTree = this.SWTreeGenerator(workflowList, level, 'workflow', this.parentKey);
      const _p = { key: this.parentKey, tree: workflowTree };
      this.setTreeDataAsync(_p);
    }
  }

  /**
    * @description 将异步加载的数据填入树中
    * @param key 类型为 1、1-1、1-1-1、1-1-1-1，根据key来决定赋值操作
  */
  setTreeDataAsync(params: any) {
    const { key, tree } = params;
    if (!key) return;
    const indexs: Array<any> = key.split('-'); // ['1','2','3']
    const temTree = this.workflowTplsTree.slice();
    indexs.forEach((index: any, i: number, arr: Array<any>) => {
      indexs[i] = parseInt(index, 10) - 1;
    });
    let arrLen = indexs.length
    let tmpObj: any = temTree[indexs[0]];
    for (let i = 1; i < arrLen; i++) {
      if (tmpObj && tmpObj.hasOwnProperty("children")) {
        tmpObj = tmpObj.children[indexs[i]]
      }
    }
    tmpObj.children = tree;
    this.workflowTplsTree = temTree;
  }

  /**
   * 选中树中的节点
  */
  onSelect(v:any, node:any) {
    const props = node.selectedNodes[0].data.props || {}
    const _workflowCode = props.value;
    const name = props.name || props.label;
    const name_i18n = props.label_i18n || {
      en: name
    };
    if (!_workflowCode) return;
    if (this.multiple) {
      const _workflowValue = [ ...this.treeValue, { ...v, name } ];
      this.$emit('input', _workflowValue);
    } else {
      this.$emit('input', _workflowCode);
    }
    this.$emit('select', {name, name_i18n});
    this.showName = name
    this.isShow = false
  }

  /**
* @description 生成自模板树形结构
* @param data 源数据
* @param level 当前是几级树
* @param type 当前树的类型 只有type为'workflow'才可以被选
* @param parentKey 父级树的key，用于生成当前树的key，第一级时不传
*/
  SWTreeGenerator(data:any, level:number,  type:string, parentKey?:string) {
    if (!data || data.length === 0) return;
    const tree:Array<any> = [];
    data.forEach((item:any, index:number) => {
      const _key = parentKey ? `${parentKey}-${(index + 1).toString()}` : `${(index + 1).toString()}`;
      const _type = type === '' ? item.type : type;
      const _code = type === 'workflow' ? `workflow-${item.workflowCode}` : item.code;
      const _label = type === 'workflow' ? item.workflowName : item.name;
      const _isDisabled = type !== 'workflow';
      const _isLeaf = !(_type === 'Folder' || _type === 'App');
      const _schemaCode = item.schemaCode ? item.schemaCode : '';
      let _icon = '';
      const zhKey:string = type === 'workflow' ? 'workflowName' : 'name';
      item = common.utils.compatible(item, zhKey);
      if (level === 1) {
        _icon = 'h-icon-all-folder-o';
      } else {
        _icon = item.icon ? item.icon : 'h-icon-all-folder-o';
      }
      tree.push(
        {
          type: _type,
          key: _key,
          level,
          label: _label,
          label_i18n: item.name_i18n,
          value: _code,
          icon: _icon,
          schemaCode: _schemaCode,
          disabled: _isDisabled,
          isLeaf: _isLeaf,
          name: _label,
          scopedSlots: {
            title: 'title',
          },
          children: level == 1 ? []: this.SWTreeGenerator(item.children, level++, item.type, _key)
        }
      );
    });
    return tree;
  }

  @Watch('value')
  onValueChange(v:any) {
    if (v === '') {
      this.isShow = false;
      this.showName = ''
      // setTimeout(() => {
      //   this.isShow = true;
      // }, 30);
    }
    this.treeValue = v;
  }

  @Watch('$i18n.locale')
  onLanguageChange(v:string){
    this.lang = v;
    this.isChinese = v === 'zh';
    // 中英切换跟数据没有影响，重新请求会只剩下基础树，已选流程会只显示code，不显示名称
    // this.workflowTplsTree = [];
    // this.getAppList();
  }
}
</script>

<style lang="less">
.sub-tpl-ts{
  max-height: 45vh!important;
  /deep/ .ant-select-tree-treenode-disabled{
    span.ant-select-tree-title{
      color: rgba(0, 0, 0, 0.65) !important;
    }
  }
  .cus-title {
    color: #595959!important;
    // color: pink!important;
    i {
      margin-right: 3px;
    }
  }

  // 多出一个小方块，去除 by John 20191015
  /deep/.ant-select-tree-iconEle.ant-select-tree-icon__customize {
    display: none!important;
  }
}

.workflow-tree{
  height: 32px;
  position: relative;
  .show-value{
    width: 100px;
    height: 32px;
    line-height: 32px;
    box-sizing: border-box;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 0 11px;
    width: 100%;
  }
  .tree-wrapper{
    position: relative;
    top: 0%;
    background-color: #fff;
    z-index: 1;
    border-radius: 4px;
    outline: none;
    box-shadow: 0 2px 8px rgba(0,0,0,.15);
    &>ul{
      max-height: 300px;
      overflow: auto;
    }
    input{
      margin: 5px;
      width: calc(100% - 10px);
    }
  }
  /deep/li.ant-tree-treenode-disabled > span:not(.ant-tree-switcher), li.ant-tree-treenode-disabled > .ant-tree-node-content-wrapper, li.ant-tree-treenode-disabled > .ant-tree-node-content-wrapper span{
    color: rgba(0, 0, 0, 0.65);
  }
}
.search-resulte{
  overflow: hidden;
  line-height: 32px;
  p{
    padding: 0 11px;
    cursor: pointer;
    &:hover{
      background-color: #E8FCF4;
    }
  }

  .resulte-item{
    max-height: 300px;
    overflow: auto;
    p{width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font{
        color: #17BC94
      }
    }
  }
}

.placeholder-text{
  color: rgba(0, 0, 0, 0.25);
}
.show-value:hover{
  ._close{
    display: block;
  }
}
._close{
  width: 12px;
  height: 12px;
  line-height: 12px;
  background-color: #bfbfbf;
  text-align: center;
  border-radius: 12px;
  font-size: 10px;
  color: #fff;
  position: absolute;
  z-index: 1;
  right: 11px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  &:hover{
    background-color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
  }
  svg{
    transform: scale(0.7);
  }
}
.icon-down{
  width: 12px;
  height: 12px;
  line-height: 12px;
  color: rgba(0, 0, 0, 0.25);
  position: absolute;
  right: 11px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s;
  font-size: 12px;
  &.icon-up{
    transform: translateY(-50%) rotate(180deg);
  }
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
  max-height: 76px;
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
  top: 28px;
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

.no-resulte{
  cursor: not-allowed;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.25);
  text-align: center;
}

</style>
