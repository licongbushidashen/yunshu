<template>
  <div>
    <a-table
    v-if="originalTableData.length !== 0"
    :key="tableKey"
    :columns="treeColumn"
    :data-source="treeList"
    :row-selection="rowSelection"
    :customRow="rowClick"
    :scroll="{ y: scrollY, x: scrollX}"
    :pagination="false"
    :defaultExpandedRowKeys="expandedRowKeys"
    @expand="expandRow"
    > 
    </a-table>

    <!-- <a-tree 
      :treeData="treeList"
      checkable
      checkStrictly
      @check="checkSelect">
      <template slot="tree" slot-scope="item">
        <div class="treeNode">
          <div v-for="one in treeColumns" :key="one.index" class="cloumnNode" @click="pageVM.goTreeForm(one.index, item.key)"> <span>{{item[one.index]}}</span> </div> 
        </div>
      </template>
    </a-tree> -->

  </div>
</template>

<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import * as Bus from '@cloudpivot/form/schema';
import {
  Tree,
  Table,
} from "@h3/antd-vue";
import { DataItemType } from '../../../../form/schema';
import { isArray } from 'tinymce';

@Component({
  name: 'listCustomTree',
  components:{
    ATree: Tree,
    ATable: Table,
  }
})

export default  class listCustomTree extends Vue{


rowSelection:any = {
  onChange: (selectedRowKeys, selectedRows) => {
    this.pageVM.onTreeCheck(selectedRowKeys)
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
}

@Prop() pageVM:any;
@Prop() originalTableColumns:any;
@Prop() originalTableData:any;
@Prop() isOpen?:boolean;

tableKey:number = 1;

//如果默认展开（open === true），所有的数据全部做展开处理
get expandedRowKeys(){
  let open:any = []
  if(this.isOpen){//是否展开
    open = this.treeListKey(this.treeList);
    this.tableKey = this.tableKey + 1
    return open
  }else{
    this.tableKey = this.tableKey + 1
    return []
  }
}

treeListKey(treeList){
  let arr:any = [];
  treeList.map((item) => {
    item.expanded = true
    arr.push(item.key)
    if(item.children){
      arr = [...arr, ...this.treeListKey(item.children)]
    }
  })
  return arr;
}

@Watch('originalTableData') 
listenOriginData(){
  this.treeColumn = this.treeColumns
}

beforeUpdate() {
  let temp = Object.assign(this.treeColumn[0], {
    width: 150 + this.getDepth(this.treeList) * 20
  })
  this.treeColumn.splice(0, 1, temp)
}


@Watch('originalTableColumns') 
listenoriginalTableColumns(){
  this.treeColumn = this.treeColumns
}

//列，计算属性的列属性不能修改，因此用这个
treeColumn: any = []

// 树形数据
get treeList(){
  return this.originalToTree(this.originalTableColumns,this.originalTableData)
}

expandRow(expanded, record) {
  const tableBox:any = document.querySelector(".table");
  const checkBox:any = document.querySelector(".table .ant-table-selection-column")
  if(this.calcWidthSum() + 20 + checkBox.clientWidth > tableBox.clientWidth) {
    this.setExpanded(expanded, record, this.treeList)
    let temp = Object.assign(this.treeColumn[0], {
      width: 150 + this.getDepth(this.treeList) * 20
    })
    this.treeColumn.splice(0, 1, temp)
  }
}

setExpanded(expanded, record, origin) {
  let index = origin.findIndex((item) => item.id === record.id)
  if(index !== -1)
    origin[index].expanded = expanded
  else{
    origin.forEach((row) => {
      if(row.children)
        this.setExpanded(expanded, record, row.children)
    })
  }
}

// 打开树形表单
rowClick(record,index){
  return {
    on:{
      click: () => {
        console.log(record,index);
        this.pageVM.goTreeForm(index, record.key)
      }
    }
  }
}

getDepth(treeList) {
  let deep = 0
  if(isArray(treeList) && treeList.some((item) => item.expanded)){
    treeList.forEach((row) => {
      if(row.expanded) {
        deep = Math.max(deep, 1 + this.getDepth(row.children))
      }
    })
  }
  return deep
}

calcWidthSum() {
  return this.treeColumns.reduce((curSum, item) => curSum + item.width, 0)
}

// 列表数据列
get treeColumns(){
  this.originalTableColumns = [...this.originalTableColumns]
  let arr:any[] = [];
  let length = this.originalTableColumns.length;
  this.originalTableColumns.map((item, index) => {
    arr.push({
      index: item.key,
      title: item.vcTitle,
      key: item.key,
      dataIndex: item.key,
      width: index === 0 ? 150 + this.getDepth(this.treeList) * 20 : 150,
    });
  })
  console.log(arr,"arr---------------------------------", this.originalTableColumns);
  return arr;
}
scrollY:number = 0;
scrollX:number = 0;

//废弃原Tree控件的代码
// checkSelect(checkedKeys,e){
//   this.pageVM.onTreeCheck(checkedKeys['checked'])
// }

//原始数据洗成树形数据
originalToTree(originalTableColumns,originalTableData){
  /* if(originalTableData.length === 0) return */
  let treeList:any[] = [];
  if(!originalTableData || originalTableData.length === 0 ){
    return 
  }
  treeList = originalTableData.map((item)=>{
    let obj:any = {};
    obj.key = item.id;
    obj.scopedSlots = {
      title: 'tree',
    };
    for(let i = 0; i < originalTableColumns.length; i++){
      if(originalTableColumns[i].propertyType === DataItemType.Sheet)
        obj[originalTableColumns[i].key] = '--'
      else
        obj[originalTableColumns[i].key] = item[originalTableColumns[i].key];
    };
    obj.children = this.originalToTree(originalTableColumns,item.t__children_)
    return obj
  })
  return treeList
}


created() {

}

mounted() {
  let treeList:any = document.querySelector('.treeList')

  this.treeColumn = this.treeColumns

  this.scrollX = this.originalTableColumns.length
  if(treeList && treeList.offsetHeight){
    this.scrollY = treeList.offsetHeight
  }
}

}
</script>

<style lang="less" scoped>
/deep/.ant-table-tbody > tr > td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/deep/ .ant-table-selection-column {
  padding: 0 !important;
}

/deep/.ant-table .ant-table-row-indent + .ant-table-row-expand-icon {
    font-family: "aufontAll" !important;
    border: none;
    background: inherit;
    line-height: 18px;
    color: rgba(0, 0, 0, 0.65);
}
/deep/ .ant-table-row-expanded:after {
  content: "\E8AC";
}

/deep/.ant-table-row-collapsed {
  -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  &:after {
    content: "\E8AC";
  }
}

.table-header{
  display: flex;
  font-weight: 700;
  border-bottom: 1px solid #e8e8e8;
  .cloumnHeard{
    min-width: 180px;
    height: 30px;
    padding-left: 56px;
    text-align: center;
  }
}

.treeNode{
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  
  .cloumnNode{
    min-width: 180px;
    /* height: 50px; */
    /* margin-top: 7px;
    margin-bottom: 7px; */
    text-align: center;
    /* border: black solid 1px; */
  }
}



</style>