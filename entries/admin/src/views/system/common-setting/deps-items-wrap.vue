<template>
  <div>
    <div class="deps-items-wrap">
      <span v-for="item in showDataList" :key="item.id" @click="changeActive(item)">
        {{item.name}}
      </span>
    </div>
    <div class="pagination-wrap">
      <a-pagination 
        @showSizeChange="showSizeChange" 
        :current="currentPage" 
        :showTotal="total => `共${listData.length}条`" 
        :pageSizeOptions="pageSizeOptions" 
        size="small" 
        :total="listData.length" 
        show-size-changer show-quick-jumper
        :defaultPageSize="pageSize"
        @change="pageChange"
      />
    </div>
    
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({
  name: "deps-items-wrap",
  components: {
  },
})
export default class CommonSetting extends Vue {
  @Prop()
  listData!: any[];

  changeActive(item){
    this.$emit('itemClick', item)
  }

  @Watch('listData')
  onListDataChange(){
    this.currentPage = 1
  }

  /**
   * 分页参数
   */
  pageSizeOptions: Array<string> = [
    '10',
    '20',
    '50',
    '100'
  ]
  get showDataList(){
    let start = (this.currentPage - 1) * this.pageSize
    return this.listData.slice(start, start + this.pageSize)
  }

  currentPage: number = 1
  pageSize:number = 20
  showSizeChange(current: number, size: number) {
    this.currentPage = 1;
    this.pageSize = size;
  }

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.currentPage = page;
  }
}
</script>
<style lang="less" scoped>
.deps-items-wrap{
  // display: flex;
  // flex-wrap: wrap;
  background: #FAFAFA;
  padding: 16px 24px 0;
  height: 232px;
  overflow: auto;
  span{
    width: 16%;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    display: inline-block;
    margin-bottom: 16px;
    line-height: 14px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    &:hover{
      color: #17BC94;
    }
  }
}
.pagination-wrap{
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  align-items: center;
  /deep/li{
    height: 25px !important;
  }
}
</style>