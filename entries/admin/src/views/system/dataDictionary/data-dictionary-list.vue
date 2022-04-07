<template>
  <div class="list-wrapper">
    <div class="data-dictionary-list">
      <a-table
        :columns="columns"
        :pagination="false"
        :dataSource="data"
        :loading="loading"
        size="small"
        :rowKey="(record) => record.id"
        bordered
        :ellipsis="true"
        :scroll="{ y: scrollHeight }"
      >
        <!-- :scroll="{ y: 300 }" -->
        <!-- 序号 -->
        <template slot="index" slot-scope="text, record">
          <template>
            {{ record.index }}
          </template>
        </template>

        <!-- 字典类型 -->
        <template slot="dictionaryType" slot-scope="text, record">
          <span>{{ !text ? "简单键值" : "树形结构" }}</span>
        </template>
        
        <!-- 字典分类 -->
        <template slot="classificationName" slot-scope="text, record">
          <span>{{ text ? text : '--' }}</span>
        </template>

        <!-- 状态 -->
        <template slot="status" slot-scope="text, record">
          <p class="status-wrapper">
            <span class="dot" :class="{ green: text }"></span>
            <span :class="{ green: !text }">{{ text ? "有效" : "失效" }}</span>
          </p>
        </template>

        <!-- 操作 -->
        <template slot="operation" slot-scope="text, record">
          <div class="operation-btns">
            <span class="edit" @click="edit(record)">编辑</span>
            <span @click="changeItemStatus(record)">{{
              record.status ? "禁用" : "启用"
            }}</span>
          </div>
        </template>
      </a-table>
    </div>
    <div class="pagination-box">
      <a-pagination
        show-quick-jumper
        :default-current="1"
        :total="total"
        @change="pageChange"
        @showSizeChange="onShowSizeChange"
        :page-size-options="pageSizeOptions"
        show-size-changer
        :showTotal="showTotal"
        :pageSize ="searchParams.pageSize"
      >
        <template slot="buildOptionText" slot-scope="props">
          <span>{{ props.value }}条/页</span>
          <!-- <span v-if="props.value === '50'">全部</span> -->
        </template>
      </a-pagination>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import dataDictionaryApi from "@/apis/system/data-dictionary.api";
import common from "@cloudpivot/common/pc";

@Component({
  name: "DataDictionaryList",
})
export default class DataDictionaryList extends Vue {
  @Prop({
    default: "",
  })
  classificationId!: string;

  @Prop({
    default: "",
  })
  searchWord!: string;

  @Prop({
    default: false,
  })
  isBeginSerch!: boolean;

  @Watch("isBeginSerch")
  onIsBeginSerchChange(isBeginSerch) {
    if (isBeginSerch) {
      this.searchDictionary();
    }
  }

  loading: boolean = false;
  data: any[] = [];

  // 获取列表数据
  async searchDictionary() {
    let params: any = {
      page: this.searchParams.pageNum || 1,
      size: this.searchParams.pageSize || 10,
      searchWord: this.searchWord || "",
      classificationId: this.classificationId || "",
      sortColumn: this.sortBy,
      sortDirection: this.sortType=== 'ascend' ? 'asc' : 'desc'
    };
    let res: any = await dataDictionaryApi.searchDictionary(params);
    if (res.errcode === 0) {
      const { data } = res;
      if (Array.isArray(data.content)) {
        data.content.forEach((item, index) => {
          item.index =
            index +
            1 +
            (this.searchParams.pageNum - 1) * this.searchParams.pageSize;
        });
      }
      this.data = data.content || [];
      this.total = data.totalElements;

      this.isStartSort = false
    }
  }
  // 禁用/启用
  async changeItemStatus(item) {
    let _this = this;
    this.$confirm({
      title: `确定要${item.status ? "禁用" : "启用"}当前字典？`,
      cancelText: "取消",
      okText: "确定",
      async onOk() {
        let res: any = await dataDictionaryApi.updateDictionaryStatus({
          id: item.id,
          status: !item.status,
        });
        if (res.errcode === 0) {
          _this.searchDictionary();
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  scrollHeight:number = 0
  getScrollHeight(){
    // @ts-ignore
    this.scrollHeight = document.querySelector('.data-dictionary-list').scrollHeight - 32
  }
  

  edit(item) {
    this.$emit("edit", item);
  }

  isStartSort:boolean = false
  sortBy:string = ''
  sortType: string = ''
  sort(arg, sortBy){
    if(this.isStartSort){
      return
    }
    if(arg[2] && (this.sortBy === '' || arg[2] !== this.sortType)){
      this.isStartSort = true
      this.searchParams.pageNum = 1
      this.sortBy = sortBy
      this.sortType = arg[2]
      this.searchDictionary()
    }
  }

  columns = [
    {
      title: "序号",
      dataIndex: "index",
      scopedSlots: { customRender: "index" },
      align: "center",
      width: 60,
    },
    {
      title: "字典名称",
      dataIndex: "name",
      align: "left",
      width: 150,
      ellipsis: true,
    },
    {
      title: "字典类型",
      dataIndex: "dictionaryType",
      scopedSlots: { customRender: "dictionaryType" },
      align: "left",
      width: 100,
      ellipsis: true,
    },
    {
      title: "字典分类", 
      dataIndex: "classificationName",
      scopedSlots: { customRender: "classificationName" },
      align: "left",
      width: 125,
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "left",
      scopedSlots: { customRender: "status" },
      width: 75,
    },

    {
      title: "创建人",
      dataIndex: "createdBy",
      align: "left",
      width: 75,
    },
    {
      title: "创建时间",
      dataIndex: "createdTime",
      align: "left",
      width: 160,
      sorter: (...arg) => this.sort(arg, 'createdTime'),
    },
    {
      title: "修改人",
      dataIndex: "modifiedBy",
      align: "left",
      width: 75,
    },
    {
      title: "修改时间",
      dataIndex: "modifiedTime",
      align: "left",
      width: 160,
    },

    {
      title: "说明",
      dataIndex: "remarks",
      align: "left",
      width: "auto",
      ellipsis: true,
    },
    {
      title: "操作",
      dataIndex: "operation",
      align: "left",
      scopedSlots: { customRender: "operation" },
      width: 100,
    },
  ];

  //分页 start
  pageSizeOptions = ["10", "20", "30", "40", "50"];
  total = 0;
  showQuickJumper = true;
  showTotal(total, range) {
    return "共" + total + "条";
  }

  onShowSizeChange(current, pageSize) {
    this.searchParams.pageSize = pageSize;
    this.searchDictionary();
  }

  pageChange(pageNumber) {
    this.searchParams.pageNum = 1;
    this.searchParams.pageNum = pageNumber;
    this.searchDictionary();
  }
  //分页 end
  searchParams = {
    pageSize: 20,
    pageNum: 1,
  };

  created() {
    this.searchDictionary();
  }

  mounted(){
    this.getScrollHeight()
  }
}
</script>
<style lang="less" scoped>
.list-wrapper{
  height: 100%;
  min-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  .data-dictionary-list{
    flex: 1;
    overflow: hidden;
  }
}

.pagination-box {
  text-align: right;
  margin-top: 20px;
  margin-bottom: 10px;
}
.operation-btns {
  width: 100%;
  text-align: center;
  span {
    cursor: pointer;
    color: #00C293;
  }
  .edit {
    margin-right: 20px;
  }
}

.status-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  margin-right: 7px;
  vertical-align: center;
  &.green {
    background-color: #17BC94;
  }
}
.green {
  color: rgba(0, 0, 0, 0.25);
}
</style>
<style lang="less">
.data-dictionary-list {
  .ant-table-small > .ant-table-content > .ant-table-body {
    margin: 0;
  }
  .ant-table-column-title {
    white-space: nowrap;
  }
  td {
    white-space: nowrap !important;
  }

  .ant-table-wrapper,.ant-spin-nested-loading,.ant-spin-container,.ant-table{
    height: 100%;
  }
  .ant-table{
    border-right: 1px solid #e8e8e8
  }
  .ant-table-small.ant-table-bordered .ant-table-content{
    border-right: none;
  }
}
</style>
