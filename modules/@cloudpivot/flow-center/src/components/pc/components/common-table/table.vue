<template>
  <div 
    class="common-table" 
    ref="commonTable"
  >
    <div class="common-table-contain" :class="{'self-adaption':tableScrollWidth==='100%'}" data-h-pos="h-left" :style="{ width:tableScrollWidth, minWidth: minTableWidth?minTableWidth+'px':0 }">
      <!-- 表头 -->
      <div class="common-table__thead-wrap">
        <div class="common-table__thead">
          <div class="common-table__row">
            <div 
              class="common-table__col"
              :class="{'fixed-left-column fixed-left-column-last': idx === 0}"
              v-for="(col, idx) in tableColumns"
              :style="{...col.colStyles, width:col.width+'px'}"
              :key="idx"
            >
              <span v-if="col.title">{{ col.title }}</span>
              <slot v-else :record="col" :name="col.hSlot"></slot>
            </div>
          </div>
        </div>
      </div>

      <!-- 表体 -->
      <div 
        class="common-table__tbody-wrap"
      >
        <div class="common-table__tbody">
          <draggable
            :list="dataSource"
            :options="dragOptions"
            @end="onEnd"
            handle=".handles"
            tag="div"
          >
          <div 
            class="common-table__row" 
            v-for="(data, index) in dataSource" 
            :key="index"
            @mouseenter="$set(data, 'listhover', true)"
            @mouseleave="$set(data, 'listhover', false)"
          >
            <div 
              class="common-table__col"
              v-for="(col, colIdx) in tableColumns"
              :key="colIdx"
              :style="{...col.colStyles, width:col.width+'px'}"
              :class="colIdx === 0 ? 'fixed-left-column fixed-left-column-last': ''"
            >
              <div class="table-wrapper">
                <span v-if="col.bSlot" :title="setTitle(data[col.dataIndex])">
                  <slot 
                    v-if="col.bSlot" 
                    :name="col.bSlot" 
                    :text="data[col.dataIndex]"
                    :record="data"
                  ></slot>
                </span>
                <span class="text-ellipsis" v-else :title="setTitle(data[col.dataIndex])">{{ data[col.dataIndex] }}</span>
              </div>
            </div>
          </div>
        </draggable>
        </div>
        <!-- 数据为空时 -->
        <slot name="loadAll"></slot>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import  * as TableTypings from './table.typings';
import common from '@cloudpivot/common/pc';
import Draggable from "vuedraggable";

@Component({
  name: 'CommonTable',
  components: {
    Draggable
  }
})
export default class CommonTable extends Vue {
  @Prop({
    default: () => []
  }) columns !:Array<TableTypings.TableColumns>; // 定义表头数据结构

  @Prop({
    default: () => []
  }) dataSource !:any; // 表体数据源

  @Prop({
    default: true
  }) resizable ?:any; // 是否可以拖拽

  @Prop() minTableWidth ?:number; // table最小宽

  dragOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    forceFallback: true,
    fallbackClass: "dragClass",
    touchStartThreshold: 20,
    delay: 100,
  };

  /**
   * 结束拖拽
   */
  onEnd(evt: any) {
    this.$emit('sortEnd', this.dataSource);
  }

  // minTableWidth: number = 1060;

  tableClientWidth:number = 0;

  tableScrollWidth:string = '100%';

  tableColumns:Array<TableTypings.TableColumns> = [];

  tableContainerElement:any = null;

  mousemoveEvent:any = null;

  setTitle(data){ // 返回title，对象不显示
    if(typeof(data) !== 'string'){
      return ''
    }else{
      return data
    }
  }

  // 拖拽列宽相关变量
  resizeStart:number = 0;

  resizeMove:number = 0;

  resizeBar:any = null;

  resizeBars:any[]  = [];

  resizeBarName:string = 'resize-bar';

  resizeMinWidth = 70;

  get isTrident() {
    return window.navigator.userAgent.indexOf('Trident') !== -1
  }

  get isChrome() {
    return window.navigator.userAgent.indexOf('Chrome') !== -1
  }

  @Watch('columns', {immediate: true})
  onColumnsChange(columns:any) {
    if (!columns || !columns.length) return;

    this.$nextTick(() => {
      this.tableColumns = this.initColStyle(columns);
      this.initDomEvents();
    });
  }

  mounted() {
    common.utils.Bus.$on('resize', this.resizeEvent);
  }

  destroyed() {
    const theadWrapper = this.$el.querySelector('.common-table__thead-wrap') as HTMLElement;
    if (theadWrapper) {
      theadWrapper.removeEventListener('mousedown', this.resizeStartHandler);
    }
    document.removeEventListener('mousemove', this.mousemoveEvent);
    document.removeEventListener('mouseup', this.resizeEndHandler);
    this.$el.removeEventListener('scroll', this.tableScrollHandler);
    window.removeEventListener('resize', this.resizeEvent);
  }

  /* 
  * 初始化事件
  */
  initDomEvents() {
    this.tableContainerElement = this.$el.querySelector('.common-table-contain') as any;

    if (this.resizable) {
      let theadSelector = '.common-table__thead-wrap';
      let theadWrapper =  this.$el.querySelector( theadSelector );
      if ( theadWrapper ) {
        theadWrapper.addEventListener('mousedown', this.resizeStartHandler);
        this.mousemoveEvent = this.debounce(this.resizeMoveHandler, 20);
        document.addEventListener('mousemove', this.mousemoveEvent);
        document.addEventListener('mouseup', this.resizeEndHandler);
      }
      else {
        this.$message.error(`找不到表头元素: ${theadSelector}`)
      }
    }

    this.$el.addEventListener('scroll', this.tableScrollHandler);
    window.addEventListener('resize', this.resizeEvent);

    this.$nextTick(() => {
      this.initColumnsResizing();
    });
  }

  resizeEvent(e:any) {
    this.tableClientWidth = this.$el.clientWidth;
    this.computeWidth();
  }

  /* 
  * 节流函数
  */
  debounce(fn, time) {     
    let init_time:number = 0;
    const vm:any = this;
    // 回调函数提供给drag事件
    return function(...args) {
      let now_time = +new Date();
      if(now_time-init_time > time){
        init_time = now_time;
        fn.apply(vm, args);
      }
    }
  }

  /** 
   * 初始化每一列的样式
  */
  initColStyle(columns: any){
    let tableClientWidth = this.tableClientWidth || ( this.tableClientWidth = this.$el.clientWidth || 0 );
    if (this.minTableWidth && tableClientWidth < this.minTableWidth) {
      tableClientWidth = this.minTableWidth;
    }
    
    let tableWidth = columns.reduce((s,c,i)=>(
        s += (c.width)
        ), 0);
    let widthPercent = (tableClientWidth - tableWidth) / tableWidth;
    const resultArr = columns.map((col:TableTypings.TableColumns) => {
      const colWidth:any = col.width + col.width*widthPercent;
      const colStyles = {
        textAlign: col.align
      };
      return {
        ...col, colStyles, width: colWidth.toFixed(2)
      }
    })
    return resultArr;
  }

  // 初始化列调整尺寸功能
  initColumnsResizing() {
    let theadWrapper:any = this.$el.querySelector('.common-table__thead-wrap');
    if ( !theadWrapper ) return console.error('tableHead not found!');

    let ths   = theadWrapper.querySelectorAll('.common-table__col');
    
    this.resizeBars = [];
    this.columnsResizing(ths);
  }

  columnsResizing(ths:any) {
    let thLen = ths.length;
    [].forEach.call(ths, ((th,i)=>{
      let column = this.tableColumns[i];
      let isLast = i === thLen-1;
      let offsetWidth  = th.children[0].offsetWidth

      // 插入resizeBar
      let bar = th.querySelector(`.${this.resizeBarName}`);
      if (!bar) {
        bar = document.createElement('b');
        bar.className = this.resizeBarName;
        bar.setAttribute('data-index', String(this.resizeBars.length));
        th.appendChild( bar );
      }

      let minWidthOffset = isLast? 5: 0;
      let minWidth = offsetWidth? offsetWidth+31+minWidthOffset: this.resizeMinWidth+minWidthOffset;

      if ( minWidth>column.width ) column.width = minWidth;

      this.resizeBars.push({
        index:i,
        element:bar,
        parent:th,
        column,
        isLast,
        minWidth,
      });
    }));
  }

  resizeStartHandler(e) {
    let target = e.target;
    if ( target.className!==this.resizeBarName ) return;
    e.preventDefault();
    let resizeBar:any  = {};
    resizeBar  = this.resizeBars[+target.getAttribute('data-index')];
    resizeBar.width = resizeBar.parent.clientWidth;
    resizeBar.parent.classList.add('resizing');
    // 记录
    this.resizeBar = resizeBar;
    this.resizeStart = e.pageX;
  }

  resizeMoveHandler(e) {
    if ( !this.resizeBar ) return;
    let { column,index,width,minWidth,isLastColumn } = this.resizeBar;

    let computedWidth = width - (this.resizeStart-e.pageX);

    // 如果小于最小宽度, 直接return
    if ( computedWidth <= minWidth ) {
      return;
    }

    // 序号列最大宽250，超过return
    if (index === 0 && computedWidth > 250) {
      return;
    }

    // 重置 backupWidth, 否则最后一列的宽度无法设置
    if ( isLastColumn ) {
      this.resizeBar.backupWidth = 0;
    }
    column.width = computedWidth;
    this.computeWidth();
  }

  resizeEndHandler(e) {
    if ( !this.resizeBar ) return;
    let { width,parent,column } = this.resizeBar;
    let finalWidth = parseInt(parent.style.width);

    parent.classList.remove('resizing');

    this.resizeBar.width = column.width;
    this.resizeStart = 0;
    this.resizeBar = null;
  }

  // 计算column宽度
  computeWidth() {
    if ( !this.resizeBars.length ) return;

    let columns          = this.tableColumns;
    let lastColumn       = columns[columns.length-1];
    let lastResizebar    = this.resizeBars[this.resizeBars.length-1];
    let tableClientWidth = this.tableClientWidth || ( this.tableClientWidth = this.$el.clientWidth || 0 );
    let tableScrollWidth = columns.reduce((s,c,i)=>(
      s += isNaN(c.width)?
        this.resizeMinWidth:
        // 如果是最后一个, 取备份值来计算
        +( c===lastColumn && lastResizebar.backupWidth || c.width )
      ), 0);
    let scrollbarWidth = this.isChrome ? 5: 15;
    let exsertedWidth    = tableScrollWidth - tableClientWidth - scrollbarWidth;


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
    else if ( exsertedWidth > 3 ) {
      lastColumn.width = lastResizebar.backupWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth = lastResizebar.minWidth-exsertedWidth>lastResizebar.backupMinWidth? lastResizebar.minWidth-exsertedWidth: lastResizebar.backupMinWidth;
      this.tableScrollWidth  = tableScrollWidth + 'px';
    }
    else {
      lastColumn.width = lastResizebar.backupWidth - exsertedWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth = lastColumn.width > lastResizebar.backupMinWidth? lastColumn.width: lastResizebar.backupMinWidth;
      this.tableScrollWidth = '100%';
    }
  }

  tableScrollHandler(e) {
    if (this.isTrident) return;
    let el = this.$el;
    let container = this.tableContainerElement;
    let h;

    if ( !container ) return;
    // 横向
    if ( el.scrollLeft===0 ) { h='h-left' }
    else if ( el.scrollLeft===(el.scrollWidth-el.clientWidth) ) { h='h-right' }
    else { h='h-middle' }

    container.setAttribute('data-h-pos', h);
  }

}
</script>

<style lang="less" scoped>
  @import "../../style/table.less";

  .table-wrapper{
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .common-table__row:hover{
    background-color: #f0f7ff;
    .common-table__col{
      background-color: #f0f7ff;
    }
  }
</style>

