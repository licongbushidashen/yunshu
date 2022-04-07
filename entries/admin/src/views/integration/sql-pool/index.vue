<template>
  <div class="sqlpool">
    <!-- 搜索栏 -->
    <div class="sqlpool__search">
      <a-input-search
        v-model="searchKey"
        placeholder="搜索编码或名称"
        style="width:240px"
        @change="changeValue"
        @search="searchPool"
      >
        <a-icon
          class="suffix-icon close-icon"
          v-if="searchKey.length > 0 "
          slot="suffix"
          type="close-circle"
          @click="clearKeyword"
        />
      </a-input-search>
      <a-button type="primary" class="sqlpool__button" @click="showAddPool">
        <i class="icon aufontAll h-icon-all-plus-o" />新建
      </a-button>
    </div>
    <!-- 列表 -->
    <div class="sqlpool__table">
      <a-table
        :loading="isLoading"
        :columns="columns"
        :dataSource="sqlList"
        :pagination="false"
        :scroll="{y:500}"
        :locale="{ emptyText: $t('languages.NoRelevantData') }"
        rowKey="code"
        size="small"
      >
        <!-- 表头 -->
        <span class="text-ellipsis" slot="indexTitle">{{ $t('languages.NO') }}</span>
        <span class="text-ellipsis resize" slot="codeTitle">显示编码</span>
        <span class="text-ellipsis resize" slot="nameTitle">显示名称</span>
        <span class="text-ellipsis resize" slot="typeTitle">数据源类型</span>
        <span class="text-ellipsis resize" slot="curlTitle">URL</span>
        <span class="text-ellipsis" slot="actionTitle">操作</span>
        <!-- 表体 -->
        <span
          class="text-ellipsis"
          slot="code"
          slot-scope="text"
          :title="text"
          v-hight-light="{ keyWords: wd, value: text }"
        ></span>
        <span
          class="text-ellipsis"
          slot="name"
          slot-scope="text"
          :title="text"
          v-hight-light="{ keyWords: wd, value: text }"
        ></span>
        <span slot="type" slot-scope="text,record">{{ record.typeName }}</span>
        <span
          class="text-ellipsis"
          slot="curl"
          slot-scope="text,record"
          :title="text">{{ record.datasourceType === 'DATABASE' ? text : record.datasourceType }}</span>
        <span slot="action" slot-scope="text,record" class="sqlpool__actions">
          <template v-if="isOperation(record)">
            <i class="icon aufontAll h-icon-all-eye-o" @click="onEditItem(record)" />
          </template>
          <template v-else>
            <i class="icon aufontAll h-icon-all-edit-o" @click="onEditItem(record)"></i>
          <i class="icon aufontAll h-icon-all-delete-o" @click="onDeleteItem(record)"></i>
          </template>
        </span>
      </a-table>
    </div>
    <!-- 弹窗 -->
    <a-drawer
      :title="addModalTitle"
      :visible="showAddModal"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      wrapClassName="sqlpool-modal"
      @close="closeAddModal"
    >
      <add-sql :value="editModalPayload" :databaseTypes="databaseTypes" :otherType="otherType" @success="updateList" @close="closeAddModal" />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  namespace, State, Action, Mutation
} from 'vuex-class';
import moment from 'moment';
const UserModule = namespace('System/User');
import * as BizSql from '@/apis/biz-sql/index';

@Component({
  name: "sql-pool",
  components: {
    addSql: () => import('./modals/addSql.vue')
  }
})
export default class SqlPool extends Vue {

  // 数据库类型选项
  databaseTypes: any = [];

  //SAP类型
  otherType: any = [];
  // 实时搜索内容
  searchKey: string = '';

  // 上次请求搜索关键字
  wd: string = '';
  //是否正在加载列表
  isLoading: boolean = true;
  //表头信息
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      key: 'index',
      width: 110,
      align: 'center',
    },
    {
      dataIndex: 'code',
      slots: { title: 'codeTitle' },
      scopedSlots: { customRender: 'code' },
      key: 'code',
      width: 200,
      align: 'left',
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: { customRender: 'name' },
      key: 'name',
      width: 200,
      align: 'left',
    },
    {
      dataIndex: 'databaseType',
      slots: { title: 'typeTitle' },
      scopedSlots: { customRender: 'type' },
      key: 'databaseType',
      width: 200,
      align: 'left',
    },
    {
      dataIndex: 'jdbcUrl',
      slots: { title: 'curlTitle' },
      scopedSlots: { customRender: 'curl' },
      key: 'jdbcUrl',
      width: 300,
      align: 'left',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      key: 'action',
      width: 160,
      align: 'right'
    }
  ];
  // 数据库列表
  sqlList: Array<any> = [];

  @UserModule.State('isJustAdmin') isJustAdmin!: boolean;

  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

    /**
   * 按钮操作权限
   */
  isOperation(e: any): boolean {
    if (!e || !Object.keys(e).length) {
      return false;
    }
    if (this.isJustAdmin || e.createdBy === this.loginedUserInfo.id || this.loginedUserInfo.permissions.includes('SYS_MNG')) {
      // 历史数据不做处理 admin账号、方法创建人不做处理
      return false;
    } else {
      return true;
    }
  }

  // 弹窗参数

  // 新建弹窗标题
  addModalTitle: string = '新建数据源连接';
  // 是否展示弹窗
  showAddModal: boolean = false;

  // 编辑弹窗数据载入
  editModalPayload: BizSql.poolItem | null = null;

  /**
   * 设置列表，增加序号、数据库类型展示名处理
   */
  setList(payload: Array<BizSql.poolItem>) {
    const lowerCaseWd = this.wd.toLowerCase();
    this.sqlList = payload.map((item: BizSql.poolItem, idx: number) => {
      return {
        index: idx + 1,
        typeName: this.getTypeName(item),
        ...item
      }
    }).filter((item: BizSql.poolItem ) => item.code.toLowerCase().includes(lowerCaseWd) || (item.name.toLowerCase().includes(lowerCaseWd)))
  }

  /**
   * 获取数据库类型文案标签
   */
  getTypeName(item: BizSql.poolItem) {
    return item.datasourceType === 'DATABASE' ? item.databaseType : item.datasourceType;
  }

  changeValue(){
    if(this.searchKey === ''){
      this.searchPool('');
    }
  }

  /**
   * 搜索数据库连接池
   */
  searchPool(ctx: string) {
    if (ctx === this.wd) {
      return;
    }
    console.log('search sql pool:', ctx);
    this.wd = ctx.toString().trim();
    if (!this.wd) {
      this.getPoolList();
    } else {
      this.searchPoolList(ctx);
    }
  }

  /**
   * 清空搜索内容
   */
  clearKeyword() {
    this.searchKey = '';
    this.searchPool('');
  }

  /**
   * 通过接口搜索数据库连接
   */
  searchPoolList(ctx: string) {
    BizSql.searchBizSql({
      key: ctx
    }).then((res: Common.Data) => {
      if (res.errcode === 0 && Array.isArray(res.data)) {
        this.setList(res.data);
      }
    })
  }

  /**
   * 弹出新增连接池弹窗
   */
  showAddPool() {
    this.addModalTitle = '新增数据源连接';
    this.editModalPayload = null;
    this.showAddModal = true;
  }

  /**
   * 编辑条目
   */
  onEditItem(record: any) {
    this.addModalTitle = '编辑数据源连接';
    this.editModalPayload = record;
    this.showAddModal = true;
  }

  /**
   * 删除条目
   */
  onDeleteItem(record: any) {
    if (!record || !record.id) {
      this.$message.warning('当前选中项数据为空，无法删除！')
      return;
    }
    const vm: any = this;
    this.$confirm({
      title: this.$t('languages.integration.ConfirmDeleteSqlconnect').toString(),
      okText: this.$t('languages.Apps.Ok').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk() {
        const popParams: BizSql.deleteParams = {
          id: record.id
        };
        BizSql.deleteBizSql(popParams).then((res: Common.Data) => {
          if (res.errcode === 0) {
            const resultList = vm.sqlList.filter((item: BizSql.poolItem) => item.id !== record.id);
            resultList.forEach((item:BizSql.poolItem,idx:number) => item.index = idx+1);
            vm.$set(vm, 'sqlList', resultList);
          } else {
            vm.$message.error(res.errmsg);
          }
        });
      }
    })
  }

  /**
   * 关闭新增弹窗
   */
  closeAddModal() {
    this.showAddModal = false;
  }

  /**
   * 获取数据库连接池列表
   */
  getPoolList() {
    this.isLoading = true;
    BizSql.getBizSqlList()
      .then((res: Common.Data) => {
        console.log('get pool list:', res);
        if (res.errcode === 0 && Array.isArray(res.data)) {
          this.setList(res.data);
        }
      })
      .finally(() => {
        this.isLoading = false;
      })
  }

  /**
   * 获取数据库连接池列表
   */
  getDatabaseTypes() {
    
    BizSql.getAlldbtype()
      .then((res: Common.Data) => {
        
        if (res.errcode === 0) {
          this.databaseTypes = res.data;
        }
      })
    BizSql.getOtherDstype().then(res => {
      this.otherType = res.data
    })
  }
  /**
   * 操作新增/编辑成功后更新列表
   */
  updateList(payload: any) {
    let typeName = this.getTypeName(payload);
    const exist: boolean = this.sqlList.some((item: BizSql.poolItem, idx: number) => {
      if (payload.id === item.id) {
        item = {
          ...item,
          ...payload,
          typeName,
        };
        this.$set(this.sqlList, idx, item);
        return true;
      }
      return false;
    });
    if (!exist) {
      this.sqlList.push({
        ...payload,
        index: this.sqlList.length + 1,
        typeName,
      });
    }
    this.closeAddModal();
  }

  mounted() {
    this.getDatabaseTypes();
    this.getPoolList();
  }
}
</script>
<style lang="less" scoped>
.sqlpool {
  padding: 0 24px;
  &__search {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 16px 0;
    .close-icon {
      color: rgba(0, 0, 0, 0.25);
      margin-right: 12px;
    }
  }
  &__button {
    width: 82px;
    margin-left: 24px;
    padding-left: 0;
    padding-right: 0;
    i {
      margin-right: 8px;
      font-size: 12px;
    }
  }
  &__actions {
    i {
      cursor: pointer;
      padding: 0 9px;
    }
    i:last-child {
      padding-right: 0;
    }
  }
  &__table {
    &,
    /deep/.ant-table-header,
    /deep/.ant-table-body {
      &::-webkit-scrollbar {
        width: 0;
        display: none;
      }
    }
    // /deep/.ant-table-thead span {
    //   display: inline-block;
    //   height: 22px;
    //   color: rgba(0, 0, 0, 0.65);
    //   font-weight: 600;
    // }
    /deep/.ant-table-body {
      max-height: calc(100vh - 180px - 44px) !important;
    }
  }
}
</style>
<style lang="less">
.sqlpool-modal {
  .ant-drawer-body {
    padding: 0;
  }
}
</style>