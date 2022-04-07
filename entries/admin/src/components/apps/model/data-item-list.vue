<template>
  <div class="data-item-list">
    <template v-if="dataSource && dataSource.length">
      <a-spin :spinning="loading" class="spinning">
        <table class="table table-striped">
          <thead class="thead-dark">
          <tr>
            <th style="width: 56px"></th>
            <th :key="item.key" 
            :style="{width: item.width + 'px',
            textAlign: item.key === 'action' ? 'left' : item.align ? item.align : 'center',
            paddingLeft: item.key === 'action' ? '30px' : item.key === 'published' ? '20px' : ''
            }"
                scope="col" v-for="item in columns">
              <slot :name="item.slots.title" v-if="item.slots && item.slots.title"/>
              <template v-else>{{ item.name }}</template>
            </th>
            <td class="right-th"></td>
          </tr>
          </thead>
          <draggable :list="list" :options="dragOptions"
                     @end="onEnd"
                     handle=".handles"
                     tag="tbody"
                     v-if="list.length">
            <div :key="item.id" class="drag-title" v-for="(item, i) in list">
              <tr>
                <td :class="{'handles': !noSort, handle: true}" @mouseleave="itemLeave(item,i)"
                    @mouseover="itemOver(item,i)">
                  <span class="icon aufontAll" v-if="item.hove">&#xe63e;</span>
                  <span v-else>{{ i + 1  }}</span>
                </td>
                <td :key="n" :style="{textAlign: v.align ? v.align : 'center',width: v.width + 'px'}"
                    v-for="(v,n) in columns">
                  <slot :name="v.scopedSlots.customRender" :record="item" :text="item[v.key]"
                        v-if="v.scopedSlots && v.scopedSlots.customRender"/>
                  <template v-else>{{ item[v.key] }}</template>
                </td>
                <td class="right"></td>
              </tr>
              <template v-if="item.children && item.children.length">
                <draggable :list="childrenList(item.children)" :options="dragOptionsChild" @end="(e) => { onSheetSortEnd(childrenList(item.children), e, item.code) }"
                           handle=".handles"
                           tag="tbody"
                           v-if="item.sheetSort">
                  <div class="left-back"></div>        
                  <div :key="i+'d'+ii" class="drag-title" v-for="(items, ii) in item.children">
                    <tr>
                      <td :class="{'handles': !noSort, handle: true}" @mouseleave="itemLeaveSheet(item,items,i,ii)"
                          @mouseover="itemOverSheet(item,items,i,ii)">
                        <span class="icon aufontAll" v-if="items.hove">&#xe63e;</span>
                        <span v-else>{{ ii + 1  }}</span>
                      </td>
                      <td :key="nn" :style="{textAlign: v.align ? v.align : 'center',width: v.width + 'px'}"
                          v-for="(v,nn) in columns">
                        <slot :name="v.scopedSlots.customRender" :record="items" :text="items[v.key]"
                              v-if="v.scopedSlots && v.scopedSlots.customRender"/>
                        <template v-else>{{ items[v.key] }}</template>
                      </td>
                      <td class="right"></td>
                    </tr>
                  </div>
                </draggable>
              </template>
              <div class="item-sheet" v-if="item.children">
                <i @click="handleSheetSort(item,i)" class="icon aufontAll h-icon-all-arrows-alt-o"
                   v-if="!item.sheetSort"></i>
                <i @click="handleSheetSort(item,i)" class="icon aufontAll h-icon-all-arrows-o" v-else></i>
              </div>
            </div>
          </draggable>
        </table>
      </a-spin>
    </template>
    <template v-else>
      <div class="no-data" v-if="dataSource.length === 0">
        <div class="no-data-tips">
          <img src="../../../assets/images/userEmpty.png"/>
          <p class="tips">暂无数据</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue, Watch,} from "vue-property-decorator";
  import Draggable from "vuedraggable";

  @Component({
    name: "DataItemList",
    components: {
      Draggable
    },
  })
  export default class DataItemList extends Vue {
    @Prop() columns: any;
    @Prop() dataSource: any;
    @Prop({
      default: false
    }) loading: any;
    @Prop() noSort: any;

    list: any[] = [];
    dragOptions: any = {
      animation: 150,
      ghostClass: "ghostClass",
      forceFallback: true,
      fallbackClass: "dragClass",
      touchStartThreshold: 20,
      delay: 100,
    };

    dragOptionsChild: any = {
      animation: 150,
      ghostClass: "ghostClass",
      forceFallback: true,
      fallbackClass: "dragClass",
      touchStartThreshold: 20,
      delay: 200,
    };

    showSheet: any[] = [];

    created() {
      if (this.list.length === 0 && this.dataSource.length > 0) {
        this.list = this.dataSource;
      }
    }

    childrenList(list: any) {
      const orList = JSON.parse(JSON.stringify(list))
      return orList
    }

    /**
     * 结束拖拽
     */
    onEnd(evt: any) {
      const codeList = this.list.map((res: any) => {
        return res.code;
      });
      const item = codeList.filter((i, v) => v === evt.oldIndex);
      let data = codeList.filter((res: any, i: any) => {
        return i !== evt.oldIndex;
      });
      data.splice(evt.newIndex, 0, item);
      this.$emit('sortEnd', data, true);
    }

    onSheetSortEnd(list: any, evt: any, sheetCode: any) {
      const orange:any = list.map((res: any) => {
        return res.code;
      });
      const item = (orange.filter((i, v) => v === evt.oldIndex-1)).join(''); // 被拖拽的项

      let filerList = orange.filter((res: any, i: any) => {
        return res !== item;
      });
      filerList.splice((evt.newIndex-1), 0, item)
      const result = filerList.join(',')
      this.$emit('sortChildrenRankList', result, sheetCode, true) 
    }

    itemOver(item: any, i: number) {
      if (!this.noSort) {
        item.hove = true;
        this.$set(this.list, i, item);
      }
    }

    itemLeave(item: any, i: number) {
      if (!this.noSort) {
        item.hove = false;
        this.$set(this.list, i, item);
      }
    }

    itemLeaveSheet(item: any, items: any, i: number, ii: number) {
      items.hove = false;
      item.children[ii] = items;
      this.$set(this.list, i, item);
    }

    itemOverSheet(item: any, items: any, i: number, ii: number) {
      items.hove = true;
      item.children[ii] = items;
      this.$set(this.list, i, item);
    }

    handleSheetSort(item: any, i: number) {
      item.sheetSort = !item.sheetSort;
      if (item.sheetSort) {
        this.showSheet.push(item.code);
      } else {
        this.showSheet = this.showSheet.filter(v => v !== item.code)
      }
      this.$set(this.list, i, item);
    }

    @Watch('dataSource')
    changeDataSource(val: any) {
      this.list = this.handleChangeList(val, {});
    }

    handleChangeList(data: any, nodes: any) {
      const result: any = [];
      data.forEach((node: any, i) => {
        node.hove = false;
        const status = this.showSheet.includes(node.code);
        node.sheetSort = status;
        if (node.children && node.children.length) {
          node.children = this.handleChangeList(node.children, node);
        }
        result.push(node);
      });
      return result;
    }
  }
</script>
<style lang='less' scoped>
  .data-item-list {
    margin-top: 15px;
    
    .no-data-tips {
      margin: 50px auto;
      width: 160px;
      
      p {
        text-align: center;
      }
    }
    
    .ghostClass {
      opacity: 1;
      background: #E8FCF4;
      border-radius: 4px;
      border: 1px solid #E8FCF4 !important;
      
      * {
        opacity: 0;
      }
    }
    
    .drag-title {
      /*height: 43px;*/
      margin-bottom: 8px;
      border-radius: 4px;
      border: 1px solid rgb(221, 221, 221);
      position: relative;
      color: #000;
      &:hover {
        border: 1px solid #17BC94;
      }
      .left-back {
        position: absolute;
        left: 0;
        top: 39px;
        bottom: 0;
        width: 40px;
        background: #E9EDF2;
        z-index: 0;
      }

      tbody {
        padding-top: 10px;
      }
      
      .item-sheet {
        width: 26px;
        height: 26px;
        background: #FFFFFF;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
        border-radius: 50%;
        position: absolute;
        top: 3px;
        left: -13px;
      }
    }
    
    .dragClass {
      background-color: #fff;
      box-shadow: inset 0 0 0 1px @primary-color,
      0px 4px 12px 0px rgba(7, 98, 23, 0.15);
    }
    
    .table {
      width: calc(100% + 12px);
      margin-left: -12px;
      /*border-spacing: 0px 5px;*/
      /*border-collapse: separate;*/
      table-layout: fixed;
      
      table thead,
      tbody tr,
      tfoot tr {
        display: table;
        width: 100%;
        table-layout: fixed;
      }
      
      tbody {
        display: block;
        max-height: calc(100vh - 280px);
        overflow-y: auto;
        width: calc(100%);
        padding-left: 15px;
        tr {
          height: 41px;
          border-radius: 4px;
          /*border: 1px solid #DDDDDD;*/
          
          .handle {
            width: 40px;
            height: 39px;
            background: #E9EDF2;
            border-radius: 4px 0px 0px 4px;
            /*border: 1px solid #DDDDDD;*/
            line-height: 39px;
            text-align: center;
            
            .icon {
              &:hover {
                cursor: move;
              }
            }
            
            span {
              color: rgba(0, 0, 0, 0.65);
              font-size: 16px;
            }
          }
          
          .right {
            width: 14px;
            height: 39px;
            border-radius: 0px 4px 4px 0px;
            /*border-right: 1px solid #DDDDDD;*/
          }
          
          td {
            /*border-bottom: 1px solid #DDDDDD;*/
            /*border-top: 1px solid #DDDDDD;*/
            padding: 0 10px;
          }
        }
      }
    }
    
    .thead-dark {
      width: calc(100%);
      display: table;
      table-layout: fixed;
      margin-bottom: 8px;
      
      
      .right-th {
        width: 30px;
      }
      
      tr {
        th {
          /*width: 24px;*/
          height: 20px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #000000;
          line-height: 20px;
          overflow-wrap: break-word;
          padding: 0 10px;
          color: rgba(0, 0, 0, 0.65);
        }
      }
    }
  }
</style>
