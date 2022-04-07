<template>
  <div>
    <smart-search @reset="resetParams" @search="query">
      <div class="clearfix" slot="search">
        <div class="search">
          <span style="margin-right: 5px">文件状态:</span>
          <a-select
            style="width: 95px"
            v-model="params.exportTaskStatus"
          >
            <a-select-option :key="e.id" :value="e.id" v-for="e in statusList">{{e.name}}</a-select-option>
          </a-select>
        </div>
        <div class="search">
          <span style="margin-right: 5px">开始时间:</span>
          <a-range-picker
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间','结束时间']"
            class="w"
            v-model="params.queryTime"
          />
        </div>
      </div>
    </smart-search>
    <div class="export__content">
      <a-table
        :columns="columns"
        :dataSource="dataSource"
        :loading="false"
        :locale="{emptyText: '暂无数据'}"
        :pagination="false"
        :scroll="{ y: 350 }"
        rowKey="id"
        size="small"
      >
        <span slot="indexTitle">序号</span>
        <span class="resize" slot="startTimeTitle">开始时间</span>
        <span class="resize" slot="endTimeTitle">结束时间</span>
        <span class="resize" slot="schemaNameTitle">模型名称</span>
        <span class="resize" slot="taskStatusTitle">文件状态</span>
        <span class="resize" slot="actionTitle">操作</span>
        <span
          :title="text"
          class="text-ellipsis"
          slot="schemaName"
          slot-scope="text"
        >{{ text }}</span>
        <span
          :title="text"
          class="text-ellipsis"
          slot="startTime"
          slot-scope="text"
        >{{ text }}</span>
        <span
          :title="text"
          class="text-ellipsis"
          slot="endTime"
          slot-scope="text"
        >{{ text }}</span>
        <span
          slot="taskStatus"
          slot-scope="text"
        >
          <span class="file-status-icon">
             <span class="icon aufontAll h-icon-all-loading-o RUN" v-if="text === 'RUN'"></span>
             <span class="icon aufontAll h-icon-all-flow-pass END" v-if="text === 'END'"></span>
             <span class="icon aufontAll h-icon-all-symbol_Timeselector INIT" v-if="text === 'INIT'"></span>
             <span class="icon aufontAll h-icon-all-flow-cancel FAIL" v-if="text === 'FAIL'"></span>
            {{ statusFile[text] }}
          </span>
        </span>
        <a
          @click="handleUploadFile(record.id)"
          class="biz-log__link"
          href="javascript:void(0)"
          slot="id"
          slot-scope="text, record"
        >
          下载
        </a>
      
      </a-table>
    </div>
    <div class="clearfix">
      <div class="export__footer" v-show="totalPage > 0">
        <a-pagination
          :current="params.page + 1"
          :defaultPageSize="params.size"
          :pageSizeOptions="pageSizeOptions"
          :showTotal="total => `共${totalPage}条`"
          :total="totalPage"
          @change="pageChange"
          @showSizeChange="pageSizeChange"
          showQuickJumper
          showSizeChanger
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import {namespace} from 'vuex-class';
  import SmartSearch from './smart-search.vue';
  import moment from 'moment';
  import {listApi} from '@cloudpivot/api';

  const UserModule = namespace('System/User');

  export enum statusEnum {
    RUN = '生成中',
    END = '生成成功',
    INIT = '排队中',
    FAIL = '生成失败'
  }

  @Component({
    name: 'ExportTaskList',
    components: {
      SmartSearch
    }
  })
  export default class ExportTaskList extends Vue {
    @Prop() showList!: boolean;

    statusFile: any = {
      RUN: statusEnum.RUN,
      END: statusEnum.END,
      INIT: statusEnum.INIT,
      FAIL: statusEnum.FAIL,
    };
    statusFileIcon: any = {
      RUN: 'h-icon-all-loading-o',
      END: 'h-icon-all-flow-pass',
      INIT: 'h-icon-all-symbol_Timeselector',
      FAIL: 'h-icon-all-flow-cancel',
    }

    dataSource = [];
    columns: any = [
      // 序号
      {
        dataIndex: 'index',
        slots: {title: 'indexTitle'},
        scopedSlots: {customRender: 'index'},
        width: 60,
        key: 'index',
        align: 'center',
      },
      // 开始时间
      {
        dataIndex: 'startTime',
        slots: {title: 'startTimeTitle'},
        scopedSlots: {customRender: 'startTime'},
        key: 'startTime',
        width: 170,
      },
      // 结束时间
      {
        dataIndex: 'endTime',
        slots: {title: 'endTimeTitle'},
        scopedSlots: {customRender: 'endTime'},
        key: 'endTime',
        width: 170,
      },
      // 模型名称
      {
        dataIndex: 'schemaName',
        slots: {title: 'schemaNameTitle'},
        scopedSlots: {customRender: 'schemaName'},
        key: 'schemaName'
      },
      // 状态
      {
        dataIndex: 'taskStatus',
        slots: {title: 'taskStatusTitle'},
        scopedSlots: {customRender: 'taskStatus'},
        width: '13%',
        key: 'taskStatus'
      },
      // 操作
      {
        dataIndex: 'id',
        slots: {title: 'actionTitle'},
        scopedSlots: {customRender: 'id'},
        key: 'id',
        width: 85,
        align: 'left',
      }
    ];
    
    statusList = [{id: 'END', name: '生成成功'}, {id: 'FAIL', name: '生成失败'}, {id: 'INIT', name: '排队中'}, {
      id: 'RUN',
      name: '生成中'
    }];
    totalPage: number = 0;
    pageSizeOptions: Array<string> = [
      '10',
      '20',
      '50',
      '100'
    ];
    params = {
      status: '',
      queryTime: [],
      page: 0,
      exportTaskStatus: null,
      size: 20
    };

    created(): void {
      this.getTaskList();
    }

    @Watch('showList')
    changeShowList(val) {
      if (val) {
        this.getTaskList();
      }
    }

    resetParams() {
      this.params.exportTaskStatus = null;
      this.params.queryTime = [];
      this.getTaskList();
    }

    query() {
      this.params.page = 0;
      this.getTaskList();
    }

    async handleUploadFile(id: string) {
      this.$emit('downLoadExportFile', id);
    }

    async getTaskList() {
      const params = {
        startTime: '',
        endTime: '',
        exportTaskStatus: this.params.exportTaskStatus,
        page: this.params.page,
        size: this.params.size
      };
      if (this.params.queryTime.length > 0) {
        const timer = this.params.queryTime;
        params.startTime = moment(timer[0]).format('YYYY-MM-DD HH:mm:ss');
        params.endTime = moment(timer[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      const res = await listApi.getExportTaskList(params);
      if (res.errcode === 0) {
        res.data.content.forEach((item: any, index: number) => {
          item.index = index + 1 + params.page * params.size;
        });
        this.totalPage = res.data.totalElements;
        this.dataSource = res.data.content;
      }
    }

    // 分页 page change 回调
    pageChange(page: number, pageSize: number) {
      this.params.page = page - 1;
      this.params.size = pageSize;
      this.getTaskList();
    }

    /**
     * 修改分页大小
     */
    pageSizeChange(current: number, pageSize: number) {
      this.params.page = 0;
      this.params.size = pageSize;
      this.getTaskList();
    }
  }
</script>
<style lang="less" scoped>
  .export__footer {
    float: right;
    padding: 8px 0;
    margin-right: 24px;
  }
  
  .search {
    height: 32px;
    margin-bottom: 16px;
    margin-right: 16px;
    float: left;
  }
  
  .file-status-icon {
    span {
      font-size: 14px;
      margin-right: 5px;
    }
    
    .END {
      color: #00C293;
    }
    
    .RUN {
      color: #2970FF;
    }
    
    .INIT {
      color: #FAAD14;
    }
    
    .FAIL {
      color: #F4454E;
    }
  }
  
  .clearfix:after {
    clear: both;
  }
</style>
