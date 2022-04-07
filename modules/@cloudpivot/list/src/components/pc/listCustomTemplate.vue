<style lang="less">
  .treeList{
    width: 100%;
    overflow: auto;
  }
  .custom-template-container {
    // 滚动
    height:100%;
    overflow:auto;
    // position: relative;
    // &::-webkit-scrollbar { width:0!important; height:0!important; }
    // 自动隐藏滚动条
    &::-webkit-scrollbar-thumb {
      background-color:rgba(0,0,0,.35)
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color:rgba(0,0,0,.5)
    }
    &.scrollbar-auto-hidding {
      &::-webkit-scrollbar-thumb {//滚动条的设置
        background-color:rgba(0, 0, 0, 0);
        // box-shadow:none;
      }
      &:hover::-webkit-scrollbar-thumb {
        background-color:rgba(0, 0, 0, 0.35);
      }
    }

    // 列表, 通用
    .table-container {
      position:relative;
      // 两侧固定, 根据位置变化显示阴影
      @fixedColumnShadow:inset 8px 0px 6px -6px rgba(0, 0, 0, 0.15);
      &:not([data-h-pos=h-left]) .fixed-left-column-last::after,
      &:not(.self-adaption):not([data-h-pos=h-right]) .fixed-right-column-last::after {
        box-shadow: @fixedColumnShadow;
      }
      // 最后一个调节栏在表格100%宽度时, 只能增大, 不能缩小; 图标也根据状态进行改变;
      &.self-adaption .table-head-wrapper .table-row-item:last-child .resize-bar {
        cursor:e-resize;
      }
      // 如果设置了不能调节列宽, 所有调节栏图标hover时呈现默认状态
      &.no-column-resizing .resize-bar {
        cursor:default!important;
      }

      // 通用
      .table-row {
        display:flex;
        flex-direction:row;
        min-height:37px;
        &:hover { background-color:#f0f7ff; }
        .table-row-item {
          position:relative;
          z-index:1;
          box-sizing:border-box;
          padding:8px;
          // padding-right:13px;
          white-space:nowrap;
          overflow:hidden;

          // 一列高度增加, 其他列自动扩展
          flex:0 1 auto;

          // &.colspan { flex:1 1 auto; }

          // 当行超出显示省略号
          border-bottom:1px solid #e8e8e8;

          &.child-sheet-row-item{
            padding: 0;
          }

          // 序号列
          &-__ordinalNo {
            cursor:pointer;
            display:flex;
            align-items:center;
            justify-content:center;
            min-width:48px;
          }
          //
          &.text-disabled {
            color:#ccc;
          }
          // 固定列
          &.fixed-left-column,
          &.fixed-right-column { position:sticky; -ms-position:aboslute; z-index:10; }
          @fixedColumnWidth:8px;
          &.fixed-left-column-last,
          &.fixed-right-column-last {
            overflow:visible!important;
            &::after {
              content: "\200B";
              height: 100%;
              width: @fixedColumnWidth;
              position: absolute;
              top: 0;
              z-index: 1;
              transition:box-shadow .3s ease;
              pointer-events:none;
            }
          }
          &.fixed-left-column-last::after {
            right: -@fixedColumnWidth;
          }
          &.fixed-right-column-last::after {
            left: -@fixedColumnWidth;
            transform:rotate(180deg);
          }
        }
        img { max-width:100%; }
      }
      // 可选 & 不可选
      .table-body-row .table-row-item-__ordinalNo{
        .row-serial-no { display:block; }
        .ant-checkbox-wrapper.checked +.row-serial-no { display:none; }
        .ant-checkbox-wrapper:not(.checked) { display:none; }
      }
      &.row-selectable {
        .table-body-row .table-row-item-__ordinalNo:hover {
          .ant-checkbox-wrapper { display:block; }
          .row-serial-no { display:none!important; }
        }
      }
    }

    // 表头
    .table-head-wrapper {
      &.fixed-top-header { position:sticky; z-index:20; }
      .table-row {
        .table-row-item {
          color: rgba(0,0,0,.65);
          font-weight:600;
          background-color:#f8fbff;
          overflow:visible;
          display: flex;
          align-items: center;
          transition:background-color 200ms;
          &.resizing {
            background-color:#e5effe;
          }
          .resize-bar {
            position:absolute;
            right:0;
            top:15%;
            width:5px;
            height:70%;
            border-right:1px solid rgba(0, 0, 0, 0.15);
            cursor:col-resize;
          }
          &:last-child {
            padding-right:13px;
            .resize-bar {
              right:5px;
            }
          }

          .child-sheet-wrapper{
            overflow: hidden;
            width: 100%;
            .child-sheet-title{
              text-align: center;
              padding: 8px;
              border-bottom: 1px solid #e8e8e8;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .child-row-item{
              position: relative;
              float: left;
              padding: 8px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              &:last-child { border-right: none; }
            }
          }
        }
      }
      // & .table-head-value:hover {
      //   background-color: rgb(219, 218, 218);
      // }
      .table-head-value {
        width: 100%;
        height: 100%;
        cursor: pointer;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .head-value-up_down {
          .icon-up_down {
            color: rgb(158, 158, 158);
          }
          >.icon-up-down-light {
            color: rgb(34, 133, 247);
          }
          margin-left: 5px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      }
    }
    // 表体
    .has-number-item{
      margin-bottom: 36px;
    }
    .table-body-row {
      &:hover .table-row-item{ background:#f0f7ff; }
      &.unfinished .table-row-item:first-child::before {
        position:absolute; left:0; top:0;
        width:4px; height:100%;
        background-color:#FAAD14;
        content:'\200B';
      }
      .table-row-item {
        display:flex;
        flex-direction:column;
        justify-content:center;
        // height:100%;
        & > * {
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          // &:only-child {
          //   height:100%;
          // }
        }
        // & > div:only-child {
        //   display:flex;
        //   flex-direction:column;
        //   justify-content:center;
        // }
        background-color:#fff;

        .attachment-wrapper {
          // align-items:center;
          img, a {
            display:block;
            overflow:hidden;
            text-overflow:ellipsis;
            &:not(:first-child) { margin-top:4px; }
            max-height: 100px;
          }
        }

        // 普通项 hover
        // &:not(.text-disabled)
        .col-inner-wrapper:hover {
          cursor:pointer;
          color:#2970ff;
        }
      }
      // .table-row-item-__ordinalNo {
      //   // 默认显示序号, 隐藏"没被选择"的选择框
      //   .row-serial-no { display:block; }
      //   .ant-checkbox-wrapper.checked +.row-serial-no { display:none; }
      //   .ant-checkbox-wrapper:not(.checked) { display:none; }
      //   // .ant-checkbox-wrapper:not(.checked) + .row-serial-no { display:block; }
      //   // hover时显示选择框, 隐藏序号
      //   // &:hover {
      //     // .ant-checkbox-wrapper { display:block; }
      //     // .row-serial-no { display:none!important; }
      //   // }
      // }

      .child-sheet-wrapper{
        height: 100%;
        .child-items-row{
          display: flex;
          border-top: 1px solid #e8e8e8;
          &:first-child { border-top: none; }
          .child-items{
            padding: 8px;
            &.padding{
              padding-left: 28px;
            }
            .child-row-item{
              position: relative;
              // white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              &.text-disabled{
                color: #ccc;
              }
              &:hover{
                cursor: pointer;
                color: #2970ff;
              }
            }
            .row-collaps{
              height: 20px;
              margin-right: 8px;
              color: rgba(0, 0, 0, 0.65);
              font-size: 10px;
              float: left;
              transition: transform 0.24s;
              cursor: pointer;
              &.expanded{
                transform: rotate(180deg);
              }
            }
          }
          .load-more{
            color: @primary-color;
            font-size: 12px;
            width: 100%;
            padding: 8px;
            padding-left: 28px;
            cursor: pointer;
          }
          .load-complete{
            color: rgba(0,0,0,0.65);
            font-size: 12px;
            width: 100%;
            padding: 8px;
            padding-left: 28px;
          }
        }
      }
    }
    .table-number-item-wrap {
      width: 100%;
      overflow: hidden;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 56px;
      z-index: 10;
    }
    .table-number-item{
      overflow: hidden;
      height: 32px;
      line-height: 32px;
      background:rgba(244,246,252,1);
      display: flex;
      flex-direction: row;
      justify-content: center;
      
      .table-number-item-row{
        padding: 0 8px;
        font-size:12px;
        font-weight:400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color:rgba(0,0,0,0.65);
      }
    }
  }
</style>
<template>
  <div v-if="modelType === 'LIST'"  class="custom-template-container" :class="{'scrollbar-auto-hidding':tableConfig.scrollbarAutoHidding}">
    <!-- 列表容器 -->
    <div
      :class="[{'self-adaption':tableScrollWidth==='100%'}, ...tableData.additionalClasses]"
      :style="{ width:tableScrollWidth }"
      data-v-pos="v-top"
      data-h-pos="h-left"
    >
      <!-- 列表头 -->
      <div :class="tableData.thead.additionalClasses" :style="tableData.thead.style">
        <div
          v-for="(row,rowIdx) in tableData.thead.rows"
          :key="rowIdx"
          :class="row.additionalClasses"
          :style="row.style"
        >
          <div
            v-for="(col,colIdx) in row.cols"
            :key="colIdx"
            :class="col.additionalClasses"
            :style="{width:col.properties.width+'px', ...col.style}"
          >
            <!-- 首列为 序号&选择 -->
            <template v-if="tableConfig.rowOrdinal && tableConfig.rowSelectable && col.properties.id==='__ordinalNo'">
              <a-checkbox v-if="!tableData.tbody.rows.length" :checked="false" />
              <a-checkbox v-else-if="tableData.tbody.rows.every(r=>r.checked)" checked @change="rowSelection('cancelAll')"/>
              <a-checkbox v-else :indeterminate="tableData.tbody.rows.some(r=>r.checked)" @change="rowSelection('checkAll')"></a-checkbox>
            </template>
            <!-- 子表列 -->
            <div class="child-sheet-wrapper" v-else-if="col.properties.propertyType === DataItemType.Sheet">
              <div class="child-sheet-title">{{ col.properties.name_i18n ? (col.properties.name_i18n[$i18n.locale] ? col.properties.name_i18n[$i18n.locale] : col.value) : col.value }}</div>
              <template v-for="(child, index) in col.properties.childColumns">
                <div
                  class="child-row-item"
                  :style="{'width': child.width+'px'}"
                  :key="index"
                ><label>{{ getHeaderKey(child) }}</label></div>
              </template>
            </div>
            <!-- 其他列输出 标题 -->
            <div class="table-head-value" v-else-if="sortKey(col.properties.id)" @click="changeSort(row.cols ,col.properties)">
              <label>{{ (col.properties.name_i18n ? (col.properties.name_i18n[$i18n.locale] ? zhToen[col.properties.name_i18n[$i18n.locale]] ? getHeaderShow(col.properties.name_i18n[$i18n.locale], $i18n.locale) : col.properties.name_i18n[$i18n.locale]  : col.value) : col.value) }}</label>
              <div class="head-value-up_down">
                  <a-icon type="caret-up" class="icon-up_down" :class="col.properties.isEdit && (col.properties.sub === 1 ? 'icon-up-down-light' : '')"/>
                  <a-icon type="caret-down" class="icon-up_down" :class="col.properties.isEdit && (col.properties.sub === 2 ? 'icon-up-down-light' : '')"/>
              </div>
            </div>
            <label v-else> {{ (col.properties.name_i18n ? (col.properties.name_i18n[$i18n.locale] ? zhToen[col.properties.name_i18n[$i18n.locale]] ? getHeaderShow(col.properties.name_i18n[$i18n.locale], $i18n.locale) : col.properties.name_i18n[$i18n.locale]  : col.value) : col.value) }}</label>
          </div>
        </div>
      </div>
      <!-- 加载状态 -->
      <!-- <PageLoading v-model="isLoading" shadeColor="#F4F6FC" :shadeOpacity="0.5" /> -->
      <!-- 列表体 -->
      <div :class="tableData.tbody.additionalClasses" :style="tableData.tbody.style">
        <div
          v-for="(row,rowIdx) in tableData.tbody.rows"
          :key="rowIdx"
          :class="row.additionalClasses"
          :style="row.style"
        >
          <div
            v-for="(col,colIdx) in row.cols"
            :key="colIdx"
            :class="col.additionalClasses"
            :style="{width:(col.colspan?combineColsWidth(row,col):col.properties.width)+'px', ...col.style}"
          >
            <!-- 首列为 序号/选择 -->
            <div class="row-selection-box" v-if="tableConfig.rowOrdinal && col.properties.id==='__ordinalNo'">
              <a-checkbox :class="{checked:row.checked}" :checked="row.checked" @change="rowSelection('check',row)"></a-checkbox>
              <span class="row-serial-no">{{ row.__ordinalNo }}</span>
            </div>
            <!-- 如果是附件, 需要换取地址 -->
            <div v-else-if="col.properties.propertyType === DataItemType.Attachment" class="attachment-wrapper">
              <a v-for="(atta,attaIdx) in col.value" :key="attaIdx" :href="atta.url" target="_blank" rel="noopener noreferrer" download>
                <template v-if="atta.isImage"><img :src="atta.url" :alt="atta.name"></template>
                <template v-else>{{atta.name}}</template>
              </a>
            </div>
            <!-- 如果是子表, 需要展示多行 -->
            <div v-else-if="col.properties.propertyType === DataItemType.Sheet" class="child-sheet-wrapper">
              <template v-for="(rowItem, cIdx) in col.value">
                <div :key="cIdx" class="child-items-row" v-show="!col.collapsible || cIdx === 0">
                  <div
                    :key="idx"
                    v-for="(item, idx) in col.properties.childColumns"
                    class="child-items"
                    :class="{padding: idx === 0 && cIdx !== 0 && col.value.length > 1}"
                    :style="{'width': item.width+'px'}"
                  >
                    <i
                      @click="col.collapsible = !col.collapsible"
                      v-if="cIdx === 0 && idx === 0 && col.value.length > 1"
                      class="row-collaps icon aufontAll h-icon-all-up-o"
                      :class="{ expanded : !col.collapsible }"
                    ></i>
                    <div v-if="item.propertyType === DataItemType.Attachment" class="attachment-wrapper">
                      <a v-for="(atta,attaIdx) in rowItem[item.dataIndex]" :key="attaIdx" :href="atta.url" target="_blank" rel="noopener noreferrer" download>
                        <template v-if="atta.isImage"><img :src="atta.url" :alt="atta.name"></template>
                        <template v-else>{{atta.name}}</template>
                      </a>
                    </div>
                    <div
                      v-else-if="item.propertyType === DataItemType.LongText && typeof rowItem[item.dataIndex] === 'object'"
                      class="child-row-item"
                      :class="rowItem[item.dataIndex].class"
                      @click="pageVM.goForm(col.properties, rowIdx)"
                    >{{ rowItem[item.dataIndex].text }}</div>
                    <div v-else class="child-row-item" @click="pageVM.goForm(col.properties, rowIdx)">{{ rowItem[item.dataIndex] || rowItem[item.propertyAlias] }}</div>
                  </div>
                </div>
              </template>
              <div class="child-items-row" v-if="col.value && col.value.length && !col.collapsible">
                <div
                  class="load-more"
                  @click="loadMore(col)"
                  v-if="!col.last"
                >{{ $t('cloudpivot.list.pc.loadMore') }}</div>
                <div class="load-complete" v-if="col.last && col.page !== 1">{{ $t('cloudpivot.list.pc.loadCompleted') }}</div>
              </div>
            </div>
            <!-- <div v-else-if="col.id==='custom-cols'" class="inner-table">
              {{ col.value }}
            </div> -->
            <!-- 其他字段作为字符串直接输出 -->
            <div v-else class="col-inner-wrapper" :title="col.value" @click="pageVM.goForm(col.properties, rowIdx)">{{ col.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数值汇总功能展示 -->
    <div class="table-number-item-wrap" ref="tableNumberItem">
      <div
        :style="{ width:tableScrollWidth,'bottom': `${bottom}px` }"
        class="table-number-item"
        v-if="tableData.tbody.rows.length > 0 && originalNumberData"
        
      >
        <div
          v-for="(col, index) in  tableData.tbody.rows[0].cols"
          :key="index"
          :style="{width:col.properties.width+'px', ...col.style}"
          class="table-number-item-row"
        >
          <span v-if="col.properties.propertyType === DataItemType.Number && col.properties.sumType > 0">{{getsumTypeName(col.properties.sumType) + '=' + getNumberValue(originalNumberData[col.properties.key],col.properties)}}</span>
          <span v-else></span>
        </div>
    </div>
    </div>
  </div>
  <div v-else class="treeList">
    <listCustomTree
      :originalTableColumns="originalTableColumns"
      :originalTableData="originalTableData"
      :pageVM="pageVM"
      :isOpen="isOpen"
    > 

    </listCustomTree>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import listCustomTree from './listCustomTree.vue'

// 默认模板 & 模板编译器
import listCustomTemplateConverter from '@cloudpivot/list/src/components/listCustom/template/pc/handler'
const vueCompiler = require('@cloudpivot/list/src/components/mobile/application-list/vueCompiler.build');

import zhToen from './locales/zhToEn';

// 函数
// import common from '@cloudpivot/common';
const { getRealValue } = common.utils.BusinessFunctions;
// 工具函数
import { renderer } from '@cloudpivot/form';
import { columns } from '../../../../../../entries/admin/src/views/system/log/data-rule-info/typings/data-rule';
import * as Helper from "./helper/helper";

import { DataItemType } from "@cloudpivot/form/schema";

import common from '@cloudpivot/common/pc';

import { listApi, listParams } from "@cloudpivot/api";

// ant-design
const Antd = require('@h3/antd-vue');
Vue.use(Antd);

// 类型
interface TableData {
  thead:TableDataRowCategory;
  tbody:TableDataRowCategory;
  additionalClasses:string[];
  style?:object;
}
interface TableDataRowCategory {
  rows:TableDataRow[];
  additionalClasses:string[];
  style?:object;
}
interface TableDataRow {
  __ordinalNo?:number;
  checked?:boolean;
  cols:TableDataColItem[],
  additionalClasses:string[],
  style?:object;
}
interface TableDataColItem {
  value:any;
  properties:any;
  additionalClasses:string[],
  style?:object;
  colspan?:number;
}


// @@ 组件定义
@Component({
  name:'custom-template',
  components: {
    listCustomTree: listCustomTree,
    sheet: () =>
      import(
        /* webpackChunkName: "sheet" */ "@cloudpivot/form/src/renderer/components/pc/form-sheet/sheet.vue"
      ),
    PageLoading: common.components.PageLoading,
  },
})
export default class listCustomTemplate extends Vue {

  // @@ 参数
  @Prop() pageVM:any;
  // @Prop() columns:any;
  @Prop() originalTableColumns:any;
  @Prop() originalTableData:any;
  @Prop() templateString:any;
  @Prop() modelType?:string;
  @Prop() isOpen?:boolean
  @Prop({
    default() {
      return {
        presentationType:'table',
        fixedHeader:true,
        fixedLeftColumns:['__ordinalNo'],
        fixedRightColumns:[],
        rowOrdinal:true,
        rowSelectable:true,
        columnResizable:true,
        scrollbarAutoHidding:true,
      }
    }
  }) tableConfig:any;

  //数值数据项数据
  @Prop() originalNumberData: any;

  // @@ 变量
  columns :any[] = [];
  // tableData:TableData;
  tableData :TableData = {
    additionalClasses:[],
    thead:{ rows:[], additionalClasses:[] },
    tbody:{ rows:[], additionalClasses:[] }
  };

  // 需要排序的表头
  @Prop() sortConfig!: any[];

  @Watch('tableData' ,{
    immediate: true
  })
  getTableData(val: any) {
    // console.log('tableData----->' ,val)
  }

  @Watch('sortConfig' ,{
    immediate: true
  })
  getSortConfig(val: any) {
    if(val.length) {
      const data: any[] = this.sortConfigMap
      if(!data.length) {
        this.sortConfigMap = val.map((item: any) => {
          item.direction = 0
          return item
        })
      }
    }
  }
  zhToen:any = {}
  created(){
    this.zhToen = zhToen;
  }

  getHeaderShow(text, type){
    
    if(type === 'zh'){
      return text
    }else{
      return this.zhToen[text]
    }
  }

  pageSize:number = 20; // 子表一页展示数据条数，默认为20

  DataItemType: any = DataItemType;

  // 默认排序方式
  sortConfigMap: any[] = [];

  // 是否为加载状态
  isLoading: boolean = false

  // 当前是否进行过排序状态
  isSort: boolean = false

  // 排序的code
  sortCode: string = ''

  // 排序升序倒叙
  sortAscDesc: number = 0
  
  // @@ watching
  @Watch('originalTableColumns', {immediate: true})
  onOriginalTableColumnsChange(columns,oldColumns) {
    if ( !columns || !columns.length ) return;
    this.columns = this.serializeColumns();
  }
  @Watch('columns', {immediate: true})
  onColumnsChange(columns, oldColumns) {
    if ( !columns || !columns.length ) return;
    // console.log( '___________', columns?columns.length:'000', oldColumns?oldColumns.length:'111' );
    this.tableData = this.serializeTableData();
    this.$nextTick(this.initDomEvents);
  }
  @Watch('tableConfig', {immediate: true})
  onTableConfigChange(newVal:any, oldVal:any) {
    if ( !oldVal ) return;
    this.tableData = this.serializeTableData();
  }
  @Watch('originalTableData', {immediate: true})
  onOriginalTableDataChange(newVal:any, oldVal:any) {
    console.log('originalTableData----->' ,newVal)
    if ( !oldVal ) return;
    this.tableData = this.serializeTableData();
    this.$nextTick(() =>{
      this.handleSerializeNumberScroll()
    })
  }

   // 获取非系统数据key
  getHeaderKey(cur: any) {
    let name: any = cur.vcTitle
    if(cur.name_i18n) {
      let name_i18n: any;
      if(typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n)
      } else {
        name_i18n = cur.name_i18n
      }
      if(name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale]
      }
    }
    return name
  }

  // 过滤当前的表单需要排序的表头字段
  sortKey(id: string): any {
    if(Array.isArray(this.sortConfig)) {
      if (this.sortConfig.findIndex((item:any) => { return item.propertyCode === id}) > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false
    }
  }

  // 改变排列方式，发送请求
  changeSort(cols: any[],currentThead: any) {
    let orderByFields: string[] = [];
    let orderType: number = 0;
    // 将当前状态变为排序状态
    this.isSort = true
    // 更新映射数组，---》改变表头字段排序状态
    this.sortConfigMap.forEach((item: any) => {
      if(currentThead.key === item.propertyCode) {
        // 将当前字段变为排序模式
        item.isEdit = true
        if(item.direction === null || item.direction === 2) {
          item.direction = 0
          this.sortAscDesc = 0
          this.sortCode = ''
        } else if(item.direction === 0){
          item.direction = 1
          orderType = item.direction
          orderByFields = [item.propertyCode]
          this.sortAscDesc = item.direction
          this.sortCode = item.propertyCode
        } else if(item.direction === 1) {
          item.direction = 2
          orderType = item.direction
          orderByFields = [item.propertyCode]
          this.sortAscDesc = item.direction
          this.sortCode = item.propertyCode
        }
      }
    })
    if(orderType === 0) {
      this.$emit('bySortGetQueryList')
    } else {
      this.$emit('bySortGetQueryList' ,{orderByFields:  orderByFields,orderType: orderType })
    }
  }

  mounted() {
    //左侧导航栏收缩时触发resize事件
    common.utils.Bus.$on('resize', e=>{
      this.tableClientWidth = this.$el.clientWidth;
      this.computeWidth();
    });
  }

  // @@ 数据序列化
  serializeColumns() {
    let originalTableColumns = this.originalTableColumns;
    
    let sle = { id:'__ordinalNo', width:68, vcTitle:'序号', type:1000 };
    let cls = this.tableConfig.rowOrdinal? [ sle,...originalTableColumns ]: [...originalTableColumns];
    return JSON.parse(JSON.stringify(cls));
  }
  serializeTableData() {
    let tableData:TableData;
    let tableConfig = this.tableConfig;
    let columns = this.columns;

    // 表属性
    let tableClasses:string[] = ['table-container'];
    if ( tableConfig.rowSelectable ) {
      tableClasses.push( 'row-selectable' )
    }
    if ( !tableConfig.columnResizable ) {
      tableClasses.push('no-column-resizing');
    }

    // 表头
    let thead:TableDataRowCategory = {
      additionalClasses:['table-head-wrapper'],
      rows: [{
        checked:false,
        additionalClasses:['table-row','table-head-row'],
        cols: columns.map(col=>({
          value:col.vcTitle,
          // NOTE: thead-col 的属性会复制到 tbody-col 上
          properties: this.setOnlyFlag(col),
          additionalClasses:['table-row-item',`table-row-item-${col.id}`, `table-row-item-type-${col.propertyType}`, col.propertyType === DataItemType.Sheet ? 'child-sheet-row-item': ''],
          style:{},
        }))
      }]
    };
    
    // 加 fixed-top 标识, 并带上 sticky 位置信息;
    if ( tableConfig.fixedHeader ) {
      thead.additionalClasses.push('fixed-top-header');
      thead.style = { top:0 };
    }
    // 加 fixed-left
    let positiveCols:TableDataColItem[] = thead.rows[0].cols.concat();
    let fixedLeftColumns  = tableConfig.fixedLeftColumns || [];
    let fixedLeftPosition = 0;
    // 计算 fixed-left 位置
    positiveCols.some((col:TableDataColItem,colIdx:number)=>{
      if ( fixedLeftColumns.indexOf(col.properties.id)<0 ) {
        if ( colIdx>0 ) {
          // 给最后一个添加标识
          positiveCols[colIdx-1].additionalClasses = positiveCols[colIdx-1].additionalClasses || [];
          positiveCols[colIdx-1].additionalClasses.push('fixed-left-column-last')
        }
        return true;
      }
      // 加上固定左边的标识
      col.additionalClasses.push( 'fixed-left-column' );
      // console.log('__________', col);
      col.style = { ...col.style, left:fixedLeftPosition+'px' };
      fixedLeftPosition += col.properties.width;
      return false;
    });


    // 加 fixed-right 标识
    let invertedCols:TableDataColItem[] = thead.rows[0].cols.concat().reverse();
    let fixedRightColumns  = tableConfig.fixedRightColumns || [];
    let fixedRightPosition = 0;
    // 倒序循环, 计算 fixed-right 的位置
    invertedCols.some((col:TableDataColItem,colIdx)=>{
      // 如果碰到 fixed-left, 也结束循环
      // col.additionalClasses = col.additionalClasses || [];
      if (
        col.additionalClasses.indexOf('fixed-left-column-last')>-1 ||
        fixedRightColumns.indexOf(col.properties.id)<0
      ) {
        if ( colIdx>0 ) {
          invertedCols[colIdx-1].additionalClasses.push('fixed-right-column-last')
        }
        return true;
      }
      // 加上固定左边的标识
      col.additionalClasses.push( 'fixed-right-column' );
      col.style = { ...col.style, right:fixedRightPosition+'px' };
      fixedRightPosition += col.properties.width;
      return false;
    });

    // 表体, 表头标题字段一致; 所以某些属性直接复制, 不做计算
    //当有数字汇总项时添加额外的class

    let additionalClasses: any = [];
    if(this.originalNumberData){
      additionalClasses = ['table-body-wrapper has-number-item'];
    }else{
      additionalClasses = ['table-body-wrapper']
    }
    let tbody:TableDataRowCategory = {
      additionalClasses,
      rows: this.originalTableData.map((row,rowIdx)=>{
        // 'table-row-item',`table-row-item-${col.properties.id}`, ...
        let additionalClasses:string[] = ['table-row','table-body-row'];
        if ( ['草稿','进行中'].includes(row.sequenceStatus) ) {
          additionalClasses.push('unfinished');
        }
        return {
          index:rowIdx,
          __ordinalNo: this.pageVM.curPage > 1 ? rowIdx+1 +(this.pageVM.curPage-1)*this.pageVM.pageSize : rowIdx+1,
          checked : false,
          additionalClasses,
          cols : columns.map((col,colIdx)=>{
            let value = row[col.propertyAlias] || row[col.id];
            let page:number = 1;
            let last:boolean = true;
            let sourceValue:any = null;
            let collapsible:boolean = true;
            // NOTE:  table-body-col 会使用 table-head-col 所定义的类名
            let { properties, additionalClasses, style } = positiveCols[colIdx];
            // 对附件
            if ( col.propertyType === DataItemType.Attachment && !!value && Array.isArray(value)) {
              value.forEach(v=>{
                // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
                v.isImage = /^image\//.test(v.mimeType);
                v.url = renderer.UploadControl.service.getDownloadUrl(v);
              })
            }
            // 关联单选
            if (col.propertyType === DataItemType.RelevanceForm && !!value) {
              //关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
              let isJson = this.isJSON(value);
              if(isJson) {
                value = getRealValue(col, value);
              }else if(Array.isArray(value)){
                value = value.map(el => el.name).join(',')
              }
            }
            // 关联多选
            if (col.propertyType === DataItemType.RelevanceFormEx && !!value) {
              // 关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
              
              let isJson = false;
              let valueList = [];
              console.log(value,typeof(value),"valuevaluevalue----------------------------------------");
              valueList = value.split(';');
              //@ts-ignore
              isJson = this.isJSON(valueList[0]);
              if(isJson) {
                value = '';
                valueList.forEach((ele)=>{
                  value += `${getRealValue(col, ele)};`;
                });
              }
            }
            // 对富文本
            else if ( col.propertyType === DataItemType.LongText && (/<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/).test(value) ) {
              value = '该内容不支持展示';
              additionalClasses = [...additionalClasses];
              additionalClasses.push('text-disabled');
            } else if (col.propertyType === DataItemType.Date || col.propertyType === DataItemType.Time) {
              value = getRealValue(col, value);
            }
            // 对子表
            else if (col.propertyType === DataItemType.Sheet && Array.isArray(value) && Array.isArray(col.childColumns)) {
              // 子表数据项做本地分页，sourceValue为原数据
              value.forEach(val=>{
                col.childColumns.forEach((childCol:any)=>{
                  let cValue = val[childCol.id];
                  // 对附件(子表)
                  if ( childCol.propertyType === DataItemType.Attachment && !!cValue && Array.isArray(cValue)) {
                    cValue.forEach(v=>{
                      // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
                      v.isImage = /^image\//.test(v.mimeType);
                      v.url = renderer.UploadControl.service.getDownloadUrl(v);
                    })
                  } else if (childCol.propertyType === DataItemType.Date || childCol.propertyType === DataItemType.Time) {
                    cValue = getRealValue(childCol, cValue);
                  }
                  // 对富文本（子表）
                  else if ( childCol.propertyType === DataItemType.LongText && (/<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/).test(cValue) ) {
                    val[childCol.id] = {
                      text: '该内容不支持展示',
                      class: 'text-disabled',
                    };
                  }
                })
              });
              sourceValue = value;
              value = value.slice(0, this.pageSize);
              last = sourceValue.length === value.length;
            }

            return {
              properties,
              additionalClasses,
              style,
              value,
              sourceValue,
              page,
              last,
              collapsible,
            }
          })
        }
      }),
    };

    tableData = { thead,tbody, additionalClasses:tableClasses };



    // let z1 = { value:'占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; ', colspan:3, properties:{ id:'custom-cols' }, additionalClasses:[]}
    // tableData.tbody.rows[0].cols.splice(3, 3, z1)
    // let z2 = {value:'占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; ', colspan:2, properties:{id:'ttt'}, additionalClasses:[] }
    // tableData.tbody.rows[0].cols.splice(4, 2, z2)


    // console.log('_____________ tabl')
    // console.log( tableData )

    return tableData;
  }

  isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }
        } catch(e) {
            return false;
        }
    }
 }

  // 给具有排序字段添加状态
  setOnlyFlag(col: any): any {
    // 判断是否为序号，是，则直接返回
    if(col.type === 1000) return col
    // {...col ,isEdit: false,sub: null }
    this.sortConfigMap.forEach((item: any) => {
      if(col.key === item.propertyCode) {
        this.$set(col ,'isEdit' ,false)
        if(this.isSort) {
          if(item.propertyCode === this.sortCode) {
            this.$set(col ,'isEdit' ,true)
          }
        }
        const subValue = item.direction === null ? 2 : item.direction
        this.$set(col ,'sub' ,subValue)
        // col.isEdit = false
        // col.sub = item.direction || 2
      }
    })
    return col
  }
  

  // 子表数据项加载更多
  loadMore(col:any) {
    col.page += 1;
    col.value = col.sourceValue.slice(0, col.page*this.pageSize);
    col.last = col.value.length >= col.sourceValue.length;
  }

  // @@ 函数
  // 合并列宽度(colspan)
  combineColsWidth(row,col) {
    // return col.properties.width;
    let span = +col.colspan;
    if ( isNaN(span) || span<=1 ) return col.properties.width;


    // 计算对应的 columns idx
    let colIdx = 0;
    row.cols.some((c,i)=>{
      if ( c===col ) return true;
      colIdx += isNaN(c.colspan)? 1: parseInt(c.colspan,10);
    });

    // 通过下标和span的长度, 获取合并长度
    let columns = this.columns;
    let colWidth   = 0;
    let loopIdx=colIdx,
        loopLen=colIdx+span>columns.length? columns.length: colIdx+span;
    for(; loopIdx<loopLen; loopIdx++ ) {
      colWidth += +columns[loopIdx].width;
    }
    return colWidth;
  }


  // @@ dom 事件
  // * 列宽自定义
  resizeStart :number = 0;
  resizeMove  :number = 0;
  resizeBar  :any    = null;
  resizeBars :any[]  = [];
  resizeBarName:string = 'resize-bar'
  resizeMinWidth = 70;
  resizeStartHandler(e) {
    // console.log( e );
    let target = e.target;
    if ( target.className!==this.resizeBarName ) return;

    // console.log( target, this.resizeBars.length );

    e.preventDefault();
    const isChildSheet = target.getAttribute('data-sheet');
    let resizeBar:any  = {};
    if (isChildSheet) {
      const parentIndex = +target.getAttribute('parent-index');
      const parentBar = this.resizeBars[parentIndex];
      if (!parentBar || !parentBar.childColumns) {
        return;
      }
      resizeBar  = parentBar.childColumns[+target.getAttribute('data-index')];
      resizeBar.parentIndex = parentIndex;
    } else {
      resizeBar  = this.resizeBars[+target.getAttribute('data-index')];
    }
    

    resizeBar.width = resizeBar.parent.clientWidth;
    // resizeBar.minWidth = (resizeBar.parent.children[0] as any).clientWidth || this.resizeMinWidth;
    resizeBar.parent.classList.add('resizing');

    // console.log( (resizeBar.parent.children[0]).clientWidth, resizeBar.minWidth );

    // 记录
    this.resizeBar = resizeBar;
    this.resizeStart = e.pageX;
  }
  resizeMoveHandler(e) {
    if ( !this.resizeBar ) return;
    let { index,column,width,parent,minWidth,isLastColumn,isChildSheet,parentIndex,childColumns } = this.resizeBar;

    let computedWidth = width - (this.resizeStart-e.pageX);

    // 如果小于最小宽度, 直接滚粗
    if ( computedWidth <= minWidth ) {
      return;
    }

    // 重置 backupWidth, 否则最后一列的宽度无法设置
    if ( isLastColumn ) {
      this.resizeBar.backupWidth = 0;
    }

    // console.log('_______ coooo')
    column.width = computedWidth;

    // 子表子数据项处理
    if (isChildSheet) {
      const parentBar = this.resizeBars[parentIndex];
      if (parentBar && parentBar.childColumns) {
        // 拖拽子表子数据项且父级子表为最后一列时重置backupWidth和backupMinWidth
        parentBar.backupWidth = parentBar.isLastColumn ? 0 : parentBar.backupWidth;
        parentBar.backupMinWidth = parentBar.isLastColumn ? 0 : parentBar.backupMinWidth;
        this.computeChildSheetWidth(parentIndex, parentBar, parentBar.childColumns);
      }
    }

    this.computeWidth({isChildSheet, curColumn:column, isLastColumn});
    // this.columns.splice( index, column );
  }
  resizeEndHandler(e) {
    if ( !this.resizeBar ) return;
    let { index,width,parent,column,isChildSheet,parentIndex } = this.resizeBar;
    let finalWidth = parseInt(parent.style.width);

    parent.classList.remove('resizing');

    this.resizeBar.width = column.width;
    this.resizeStart = 0;
    this.resizeBar = null;

    let cIndex = index;
    let parentColumn:any = null;
    if (isChildSheet) {
      parentColumn = this.originalTableColumns[parentIndex];
      if (parentColumn && parentColumn.childColumns) {
        parentColumn.childColumns[cIndex].width = column.width;
      }
    } else {
      // 修改源数据, 否则在不刷新的情况下调整宽度+设置列展示项, 会取之前的宽度
      cIndex = this.tableConfig.rowOrdinal? index-1: index;
      this.originalTableColumns[cIndex].width = column.width;
    }
    
    // 驱动 vm 做记录
    this.$emit('onResizeEnd', { index,column,width:column.width,parentColumn });
  }
  // * 初始化列调整尺寸功能
  initColumnsResizing() {
    let theadWrapper:any = this.$el.querySelector('.table-head-wrapper');
    if ( !theadWrapper ) return console.error('table-head not found!');

    let ths   = theadWrapper.querySelectorAll('.table-row-item');
    

    this.resizeBars = [];
    this.columnsResizing(ths, this.columns, this.resizeBars);
  }
  columnsResizing(ths:any, or_columns:any, resizeBars:any,isChildSheet?: boolean, parentIndex?: number) {
    let thLen = ths.length;
    [].forEach.call(ths, ((th,i)=>{

      // 最后一个不开发"手动"宽度调整, 仅程序自动
      // if ( i===thLen-1 ) return;

      // 序号不开放宽度调整
      let column = or_columns[i];
      let isLastColumn = i === thLen-1;
      let offsetWidth  = th.children[0].offsetWidth
      if ( column.id==='__ordinalNo' ) return;

      let bar = th.querySelector(`.${this.resizeBarName}`);
      if ( !bar && (!isChildSheet || !isLastColumn) ) {
        bar = document.createElement('b');
        bar.className = this.resizeBarName;
        bar.setAttribute('data-index', String(resizeBars.length));
        // 给子表数据项增加标记及其所属子表index
        if( isChildSheet ) {
          bar.setAttribute('data-sheet', isChildSheet);
          bar.setAttribute('parent-index', parentIndex);
        }
        th.appendChild( bar );
      }

      // 最后一行样式有些许不同, 因此这里做个偏移
      let minWidthOffset = isLastColumn? 5: 0;
      let minWidth = offsetWidth? offsetWidth+15+minWidthOffset: this.resizeMinWidth+minWidthOffset;

      // 子表里的数据项作为子表项childColumns
      let childColumns:any = null;
     
      // 子表处理-重复调用columnsResizing方法。
      if (column.propertyType === DataItemType.Sheet && column.childColumns) {
        childColumns = [];
        column.width = isLastColumn ? column.width + 13: column.width;
        let cths = th.querySelectorAll('.child-row-item');
        this.columnsResizing(cths, column.childColumns, childColumns, true, resizeBars.length);
        // 子表最小宽由子数据项的宽之和
        const lastChildColumn = column.childColumns[column.childColumns.length - 1];
        const lastChildResizebar = childColumns[childColumns.length-1];
        let exsertedWidth = column.childColumns.reduce((s,c,i)=>(
          s += c===lastChildColumn ? lastChildResizebar.minWidth: +(c.width)
          ), 0);
        minWidth = isLastColumn ? exsertedWidth + 13: exsertedWidth;
        let sumWidth = column.childColumns.reduce((s,c,i)=>(
          s += c===lastChildColumn ? 0: +(c.width)
          ), 0);
        lastChildColumn.width = isLastColumn ? column.width - sumWidth -13 - 15: column.width - sumWidth;
        // console.log('child-sheet-minWidth', minWidth);
      }

      if ( minWidth>column.width ) column.width = minWidth;

      resizeBars.push({
        index:i,
        element:bar,
        parent:th,
        column,
        // 最后一个需要做特别处理, 所以加个标识
        isLastColumn,
        minWidth,
        // : offsetWidth? offsetWidth+15+minWidthOffset: this.resizeMinWidth+minWidthOffset
        // 子表表头参数标识
        isChildSheet,
        childColumns
      });

    }));
  }

  tableScrollHandler(e) {
    // console.log('_)____')
    let el = this.$el;
    let container = this.tableContainerElement;
    let v, h;

    if ( !container ) return;
    // 纵向
    if ( el.scrollTop === 0 ) { v='v-top' }
    else if ( el.scrollTop===(el.scrollHeight-el.clientHeight) ) { v='v-bottom' }
    else { v='v-middle' }
    // 横向
    if ( el.scrollLeft===0 ) { h='h-left' }
    else if ( el.scrollLeft===(el.scrollWidth-el.clientWidth) ) { h='h-right' }
    else { h='h-middle' }

    //设置数值汇总项在table底部
    if(this.originalNumberData){
      const numberEl:any = this.$refs.tableNumberItem;
      const rowEl: any = document.querySelectorAll('.table-number-item-row');
      if (el.scrollLeft>0) {
        //@ts-ignore
        if( Number(el.scrollLeft.toFixed()) === (el.scrollWidth-el.clientWidth) ){
          rowEl.forEach((r =>{
            r.style.paddingLeft = '5px';
          }))
        }else{
          rowEl.forEach((r =>{
            r.style.paddingLeft = '8px';
          }))
        }
        numberEl.scrollLeft = el.scrollLeft;
      }
    }
    container.setAttribute('data-v-pos', v);
    container.setAttribute('data-h-pos', h);
  }
  bottom = 0;

  //初始化底部汇总功能位置
  handleSerializeNumberScroll(){
    if(this.originalNumberData){
      const numberEl:any = this.$refs.tableNumberItem;
      numberEl.scrollLeft = this.$el.scrollLeft;
    }
  }

  // 根据用户自定义子表数据项列宽, 动态调整子表表格的尺寸
  computeChildSheetWidth(parentIndex:number, childSheet:any, childResizeBar:any) {
    if ( !childResizeBar.length ) return;

    const pIndex = this.tableConfig.rowOrdinal? parentIndex+1: parentIndex;
    let columns          = this.columns[pIndex].childColumns;
    let lastColumn       = columns[columns.length-1];
    let lastChildResizebar = childResizeBar[childResizeBar.length - 1];
    let tableClientWidth = childSheet.backupWidth || 0;
    let tableScrollWidth = columns.reduce((s,c,i)=>(
      s += isNaN(c.width)? this.resizeMinWidth: +(c.width )
      ), 0);
    let exsertedWidth    = tableScrollWidth - tableClientWidth;

    tableScrollWidth = childSheet.isLastColumn ? tableScrollWidth + 13 + 5: tableScrollWidth;

    
    
    // 做拉伸
    if ( exsertedWidth===0 ) return;
    else {
      let childSheetMinWidth = tableScrollWidth - lastColumn.width + lastChildResizebar.minWidth;
      childSheet.minWidth = childSheetMinWidth;
      // console.log('childSheetMinWidth', childSheetMinWidth);
      this.columns[pIndex].width  = tableScrollWidth;
    }
  }

  // 根据用户自定义列宽, 动态调整表格/最后一列的尺寸
  tableClientWidth:number = 0;
  tableScrollWidth:string = '100%';
  // shouldComputeWidth:boolean = true;
  computeWidth(obj?: any) {
    if ( !this.resizeBars.length ) return;  // 跟着 columns 变, 但仍然需要等待渲染完毕才能用

    let columns          = this.columns;
    let lastColumn       = columns[columns.length-1];
    let lastResizebar    = this.resizeBars[this.resizeBars.length-1];
    let tableClientWidth = this.tableClientWidth || ( this.tableClientWidth = (document.querySelector('#ApplicationList') as any).clientWidth || 0 );
    let tableScrollWidth = columns.reduce((s,c,i)=>(
      s += isNaN(c.width)?
        this.resizeMinWidth:
        // 如果是最后一个, 取备份值来计算
        +( c===lastColumn && lastResizebar.backupWidth || c.width )
      ), 0);
    let exsertedWidth    = tableScrollWidth - tableClientWidth;


    // console.log( 'computeWidth---',tableClientWidth, tableScrollWidth, exsertedWidth, lastResizebar );

    // 记录尾列的原始数据
    if ( !lastResizebar.backupWidth ) {
      lastResizebar.backupWidth = +lastColumn.width;
    }
    if ( !lastResizebar.backupMinWidth ) {
      lastResizebar.backupMinWidth = lastResizebar.minWidth;
    }

    // 做拉伸
    if ( exsertedWidth===0 ) return;
    else if ( exsertedWidth > -5 ) {
      // console.log( 'Width---',lastResizebar.backupWidth,lastResizebar.minWidth, exsertedWidth, lastResizebar.backupMinWidth );
      // this.shouldComputeWidth = false;
      lastColumn.width = lastResizebar.backupWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth = lastResizebar.minWidth-exsertedWidth>lastResizebar.backupMinWidth? lastResizebar-exsertedWidth: lastResizebar.backupMinWidth;
      this.tableScrollWidth  = tableScrollWidth + 'px';
    }
    else {
      // this.shouldComputeWidth = false;
      lastColumn.width = lastResizebar.backupWidth - exsertedWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth = lastColumn.width > lastResizebar.backupMinWidth? lastColumn.width: lastResizebar.backupMinWidth;
      this.tableScrollWidth = '100%';
    }

    // 最后一列为子表时动态处理子表的最后一列子数据项列宽(主表数据项才需要调整)
    if (obj && !obj.isChildSheet && lastColumn.propertyType === DataItemType.Sheet && lastColumn.childColumns) {
      const lastChildColumn = lastColumn.childColumns[lastColumn.childColumns.length-1];
      let extraWidth = lastColumn.childColumns.reduce((s,c,i)=>(
        s += c===lastChildColumn ? 0: +(c.width)
        ), 0);
      // 去除最后一列的padding-right:13px(滚动条预留15px兼容IE)
      lastChildColumn.width = lastColumn.width - extraWidth - 13 - 15;
    }

    // 拖拽非最后一列且为子表时，调整该子表的子数据项最后一列的列宽
    if (obj && obj.curColumn && !obj.isLastColumn && obj.curColumn.propertyType === DataItemType.Sheet && obj.curColumn.childColumns) {
      const lastChildColumn = obj.curColumn.childColumns[obj.curColumn.childColumns.length-1];
      let extraWidth = obj.curColumn.childColumns.reduce((s,c,i)=>(
        s += c===lastChildColumn ? 0: +(c.width)
        ), 0);
      lastChildColumn.width = obj.curColumn.width - extraWidth;
      // console.log('lastChildColumn-width', lastChildColumn.width);
    }
  }

  tableContainerElement:any;
  initDomEvents() {

    // console.log('--------')
    let tableConfig = this.tableConfig;
    let tableSelector = tableConfig.tableSelector || '.table-container';
    let tableContainer = this.$el.querySelector( tableSelector ) as any;
    if ( !tableContainer && this.modelType === 'LIST') return this.$message.error(`找不到表单元素: ${ tableSelector }`);

    // 记录为 vm 变量
    this.tableContainerElement = tableContainer;

    // 如果可调节尺寸
    if ( tableConfig.columnResizable ) {
      let theadSelector = tableConfig.theadSelector || '.table-head-wrapper';
      let theadWrapper = tableContainer.querySelector( theadSelector );
      if ( theadWrapper ) {
        theadWrapper.removeEventListener('mousedown', this.resizeStartHandler);
        theadWrapper.addEventListener('mousedown', this.resizeStartHandler);
        document.removeEventListener('mousemove', this.resizeMoveHandler);
        document.addEventListener('mousemove', this.resizeMoveHandler);
        document.removeEventListener('mouseup', this.resizeEndHandler);
        document.addEventListener('mouseup', this.resizeEndHandler);
      }
      else {
        this.$message.error(`找不到表头元素: ${theadSelector}`)
      }
    }

    // 如果有固定的元素, 要监听滚动操作
    if (
      tableConfig.fixedHeader ||
      (Array.isArray(tableConfig.fixedLeftColumns)&&tableConfig.fixedLeftColumns.length) ||
      (Array.isArray(tableConfig.fixedRightColumns)&&tableConfig.fixedRightColumns.length)
    ) {
      this.$el.removeEventListener('scroll', this.tableScrollHandler);
      this.$el.addEventListener('scroll', this.tableScrollHandler);
    }

    window.onresize = function(){};
    window.addEventListener('resize', e=>{
      this.tableClientWidth = this.$el.clientWidth;
      this.computeWidth();
    });


    this.initColumnsResizing();
    this.computeWidth();
    this.tableScrollHandler(null);
  }

  // @@ 用户事件
  rowSelection(action:string, row) {
    let rows = this.tableData.tbody.rows;

    if ( action==='checkAll' ) {
      rows.forEach(r=>r.checked=true);
    }
    else if ( action==='cancelAll' ) {
      rows.forEach(r=>r.checked=false);
    }
    else if ( action==='check' ) {
      row.checked = !row.checked;
    }
    
    this.$emit('onCheck', rows.map(r=>r.checked));
  }

  // @@ render
  // 如果模板字符串改变, compiled 相关也重置
  templateRender:Function|null = null;
  templateStaticRenderFns:Function|null = null;
  @Watch('templateString', {immediate: true})
  onTemplateStringChange() {
    this.templateRender = null;
    this.templateStaticRenderFns = null;
  }
  // 正常渲染流程
  render(h) {
    const outerVm = this;
    const templateString = outerVm.templateString? outerVm.templateString.trim(): listCustomTemplateConverter.template;

    // 优先使用缓存模板
    if ( !outerVm.templateRender ) {
      let compiled = vueCompiler.compile( templateString  );
      if ( compiled.errors.length ) {
        outerVm.templateParsingError = `Error compiling template:\n\n${templateString}'\n\n${compiled.errors.join('\n')}`;
        return outerVm.errorRender(h);
      }
      outerVm.templateRender = new Function(compiled.render);
      outerVm.templateStaticRenderFns = new Function(compiled.staticRenderFns);
    }

    return outerVm.templateRender(h);
  }
  // 错误渲染流程 (输出错误信息)
  templateParsingError:string = '';
  templateParsingErrorHtml:any;
  errorRender(h) {
    return h(
      'div', {
        attrs: { id:'custom-list-container' }
      },
      [
        h(
          'pre',
          { attrs: { id:'custom-list-parsing-error' } },
          this.templateParsingError
        )
      ]
    );
  }
  //获取数值数据项汇总名称
  getsumTypeName(type){
    let name: string = ''
    switch(type){
      case 1 :
        name = '求和';
        break;
      case 2 :
        name = '平均值'
        break;
      case 3 :
         name = '最小值'
        break;
      case 4 :
        name = '最大值'
        break;
      case 5 :
        name = '计数';
        break;
    }
    return name;
  }
  // 格式化数值数据项汇总的值
  getNumberValue(value: any,column: any){
    let val: any = '--';
    if(value && value.num){
      if(typeof value.num === 'number'){
        if(value.sumType !== 5){
          val = Helper.numberToDisplay(value.num, column);
        }else{//计数不需要做格式化
          val = value.num
        }
      }
    }
    return val;
  }
}
</script>
