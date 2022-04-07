<template>
<div v-if="isShow && visible" class="allTreeView">
  <div class="TreeView" v-if="showTreeAll">
    <div class="treeView-header">
      <span v-for="item in params" :key="item.controlKey" :class="{setTreeView: item.setTreeView}" @click="switchTreeView(item.controlKey)" :title="item.name">{{item.name}}</span> 
    </div>
    <div  class="view-all">
      <span  :class="{allActive: allActive}" @click="clear">全部</span>
    </div>
    
    <a-tree
    v-if="treeData.length !== 0"
    :key="treeKey"
    class="tree"
    v-model="checkedKeys"
    :tree-data="treeData"
    @select="onSelect"
    />
    <!-- 没有数据时候的展示 -->
    <div v-else class="noTreeData">
        <div class="noTreeDataPtr"></div>
        <div class="noTreeDataTips"><span>您关联的模型还未创建数据，无法设置查询条件</span></div>
    </div>

  </div>
  <div class="hide-menu">
      <div class="to-right" @click="showAll" v-if="!showTreeAll"></div>
      <div class="to-left" @click="closeAll" v-if="showTreeAll" ></div>
  </div>
</div>
</template>


<script lang='ts'>

import * as Bus from '@cloudpivot/form/schema';
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
  Tree,
} from "@h3/antd-vue";

@Component({
  name: "tree-query-form",
  components: {
    ATree: Tree
  },
})

export default class TreeQueryForm extends Vue{

  list: any= []
  treeData: any = [];
  key: string = "";

  isShow: boolean = false;

  checkedKeys: any = {};

  showTreeAll: boolean = true

  visible: boolean = true;

  //全部字段是否选中样式
  allActive:boolean = true

  treeKey:number=1 //点击全部时key改变重新加载树

  closeAll(){
      this.showTreeAll = false;
    }

  showAll(){
    this.showTreeAll = true;
  };

  onSelect(selectedKeys){
    this.allActive = false;
    let arr =  this.treeToList(this.list);
    let item = arr.find(x => x.id === selectedKeys[0]);
    item.$format = false;
    let data: any = {};
    data[this.key] = item;
    this.$emit("setFilterData", data);
  }

  clear(){
    if(this.allActive) return
    this.allActive = true
    this.$emit("setFilterData", {parentId: null});
    this.treeKey=this.treeKey + 1
  }

  /* 切换不同的树形视图 */
  switchTreeView(controlKey){
    console.log(controlKey,"controlKey----------");
    
    this.params.map((item) => {
      if(item.controlKey === controlKey){
        this.list = item.list;
        this.treeData = item.treeList;
        this.key = item.controlKey;
        this.checkedKeys = item.value;
        this.visible = item.visible;
        item.setTreeView = true;
      }else{
        item.setTreeView = false;
      }
    })
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

  params:any = [];

  created(){
    Bus.EventBus.$on('treedata',param => {
      if(this.params.length === 0){
        this.params.push(param);
      }
      for(let i = 0; i < this.params.length; i++){
        if(this.params[i].controlKey === param.controlKey){
          this.params[i] = param;
          break
        }
        if(i === this.params.length-1){
          this.params.push(param);
        }
      }
      
      //默认选中第一个树形视图
      if(this.params.length !== 0){
        this.isShow = true;
        this.list = this.params[0].list;
        this.treeData = this.params[0].treeList;
        this.key = this.params[0].controlKey;
        this.checkedKeys = this.params[0].value
        this.visible = this.params[0].visible
        this.params[0].setTreeView = true;
      }else{
        this.isShow = false;
      }
    });
  }

  destroyed() {
    Bus.EventBus.$off('treedata');
  }
  
}
</script>

<style scoped lang='less'>
.allTreeView{
  height: 100%;
  display: flex;
}
.TreeView{
  resize:horizontal;
  position: relative;
  /* display: flex; */
  min-width: 218px;
  height: 100%;
  border-right: 1px solid #dddddd;
  overflow:auto;
  .noTreeData{
    .noTreeDataPtr{
      position: relative;
      width: 50%;
      height: 200px;
      background-image: url("./no-data/images/no-data.png");
      background-repeat: no-repeat;
      background-size:100%;
      left: 25%;
      margin-top: 5%;
    }
    .noTreeDataTips{
      position: relative;
      top: -50px;
      text-align: center;
      color: rgba(119, 119, 119, 0.5);
    }
  }
}

.treeView-header{
  padding-top: 8px;
  display: flex;
  height: 38px;
  border-bottom: #dddddd 1px solid;
  span{
    padding-left: 12px;
    padding-right: 12px;
    margin-left: 5px;
    margin-right: 5px;
    overflow: hidden;
    white-space: nowrap;//超出部分不换行
    cursor: pointer;
    text-overflow: ellipsis;
  }
  .setTreeView{
    border-bottom: 2px solid #2970FF;
  }
}

.view-all{
  padding-left: 30px;
  padding-top: 8px;
  span:hover{
    cursor: pointer;
    background: #F4F6FC;
  }
}

.tree{
  width: 250px;
}

.allActive{
  background: #cce4ff;
}

.hide-menu{
  position: relative;
  .to-right{
    position: absolute;
    left: 0px;
    width: 12px;
    height: 30px;
    background-image: url("../image/toright.svg");
    z-index: 99;
  }
  .to-left{
    position: absolute;
    top: 0px;
    left: 0px;
    width: 12px;
    height: 30px;
    background-image: url("../image/toleft.svg");
    z-index: 99;
  }
}

</style>