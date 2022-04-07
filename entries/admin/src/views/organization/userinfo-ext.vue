<template>
  <div class="userExt">
    <div class="userExt__new">
      <a-button
        type="primary"
        class="userExt__button"
        @click="batchDelete"
        v-show="rowSelection.selectedRowKeys.length > 0 && isSysAdmin"
      >
        <i class="icon aufontAll h-icon-all-delete-o" />批量删除
      </a-button>
      <a-button
        type="primary"
        class="userExt__button"
        @click="showAddUserExt"
        v-if="isSysAdmin"
      >
        <i class="icon aufontAll h-icon-all-plus-o" />
        新建
      </a-button>
    </div>
    <div class="empty-box" v-show="totalPage === 0">
      <img class="user-empty" src="../../assets/images/userEmpty.png" />
      <div>暂无数据</div>
    </div>
    <!-- 列表 -->
    <div class="userExt__table" v-show="totalPage > 0">
      <a-table
        :loading="isLoading"
        :columns="columns"
        :dataSource="userExtList"
        :pagination="false"
        :scroll="{y:500}"
        :locale="{ emptyText: $t('languages.NoRelevantData') }"
        :row-key="record => record.id"
        :row-selection="rowSelection"
        size="small"
      >
        <!-- 表体 -->
        <span class="text-ellipsis" slot="index" slot-scope="text,record">{{ getIndex(record.id) }}</span>
        <span
          class="text-ellipsis"
          slot="belong"
          slot-scope="text,record"
        >{{ getGroupName(record.belong) }}</span>
        <span
          class="text-ellipsis"
          slot="corpId"
          slot-scope="text,record"
        >{{ getCorpName(record.corpId) }}</span>
        <span slot="enable" slot-scope="text, record">
          <a-switch :checked="!!record.enable" :disabled="true"></a-switch>
        </span>
        <span slot="action" slot-scope="text,record" class="userExt__actions">
          <i
            class="icon aufontAll h-icon-all-edit-o"
            @click="onEditItem(record)"
            v-if="isSysAdmin"
          ></i>
          <i
            class="icon aufontAll h-icon-all-delete-o"
            @click="onDeleteItem(record)"
            v-if="isSysAdmin"
          ></i>
        </span>
      </a-table>
    </div>
    <div class="userExt__footer">
      <div v-show="totalPage > 0">
        <a-pagination
          :defaultPageSize="params.size"
          :total="totalPage"
          :showTotal="total => `共${totalPage}条`"
          :current="params.page + 1"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="pageChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
    </div>
    <userinfo-ext-dialog
      :isShowUserExt="isShowUserExt"
      :formData="formData"
      @cancel="cancel"
      @action="action"
    ></userinfo-ext-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getUserExtList, addUserExt, deleteUserExt } from "@/apis/organization";
import userinfoExtDialog from "./userinfo-ext-dialog.vue";
import OAuthApi from "@/apis/oauth";
import { State, namespace } from "vuex-class";
import { ConfigProvider } from "@h3/antd-vue";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
const UserModule = namespace("Organization/User");
@Component({
  name: "userinfo-ext",
  components: {
    userinfoExtDialog,
    AConfigProvider: ConfigProvider,
  },
})
export default class UserinfoExt extends Vue {
  @UserModule.Mutation("setUserExt") setUserExt: any;
  //表头信息
  columns: Array<Common.TableHead> = [
    {
      dataIndex: "index",
      title: "序号",
      scopedSlots: { customRender: "index" },
      width: 110,
      align: "center",
    },
    {
      dataIndex: "code",
      width: 150,
      title: "扩展字段编码",
      align: "left",
    },
    {
      dataIndex: "name",
      width: 150,
      title: "扩展字段名称",
      align: "left",
    },
    {
      dataIndex: "corpId",
      width: 150,
      title: "所属组织",
      scopedSlots: { customRender: "corpId" },
      align: "left",
    },
    {
      dataIndex: "belong",
      width: 150,
      title: "所属分组",
      scopedSlots: { customRender: "belong" },
      align: "left",
    },
    {
      dataIndex: "mapKey",
      width: 150,
      title: "匹配字段",
      align: "left",
    },
    {
      dataIndex: "enable",
      width: 100,
      title: "是否启用",
      scopedSlots: { customRender: "enable" },
      align: "left",
    },
    {
      dataIndex: "action",
      title: "操作",
      scopedSlots: { customRender: "action" },
      key: "action",
      width: 160,
      align: "center",
    },
  ];
  isShowUserExt: boolean = false;
  // 拓展字段列表
  userExtList: Array<any> = [];
  //是否正在加载列表
  isLoading: boolean = true;
  formData: any = {
    name: "",
    corpId: undefined,
    belong: undefined,
    mapKey: undefined,
    enable: true,
  };

  rowSelection = {
    selectedRowKeys: new Array<string>(),
    onChange: (selectedRowKeys, selectedRows) => {
      this.rowSelection.selectedRowKeys = selectedRows.map((x) => x.id);
    },
  };

  totalPage: number = 0;

  pageSizeOptions: Array<string> = ["10", "20", "50", "100"];

  params: any = {
    page: 0,
    size: 20,
  };

  isSysAdmin:boolean = true;

  orgList: Array<any> = [];

  groupList: Array<any> = [
    {
      key: "base",
      name: "基本信息",
    },
    {
      key: "contact",
      name: "联系方式",
    },
    {
      key: "org",
      name: "员工信息",
    },
    {
      key: "other",
      name: "其它信息",
    },
  ];
  async created() {
    let sessionUserStr = window.sessionStorage.getItem("user");
    let userInfo: any = null;
    if (sessionUserStr) {
      userInfo = JSON.parse(sessionUserStr);
    }
    this.isSysAdmin = userInfo.permissions.includes("SYS_MNG") ||  userInfo.permissions.includes("ADMIN") ;
    if (!this.isSysAdmin) {
      this.columns = [
        {
        dataIndex: "index",
        title: "序号",
        scopedSlots: { customRender: "index" },
        width: 110,
        align: "center",
        },
        {
          dataIndex: "code",
          width: 150,
          title: "扩展字段编码",
          align: "left",
        },
        {
          dataIndex: "name",
          width: 150,
          title: "扩展字段名称",
          align: "left",
        },
        {
          dataIndex: "corpId",
          width: 150,
          title: "所属组织",
          scopedSlots: { customRender: "corpId" },
          align: "left",
        },
        {
          dataIndex: "belong",
          width: 150,
          title: "所属分组",
          scopedSlots: { customRender: "belong" },
          align: "left",
        },
        {
          dataIndex: "mapKey",
          width: 150,
          title: "匹配字段",
          align: "left",
        },
        {
          dataIndex: "enable",
          width: 100,
          title: "是否启用",
          scopedSlots: { customRender: "enable" },
          align: "left",
        }
      ] 
    }
    const res: any = await OAuthApi.getDepts();
    if (res.errcode === 0) {
      this.orgList = res.data;
    }
  }
  mounted() {
    this.getUserExtList();
  }

  getGroupName(belongCode) {
    let belongItem = this.groupList.find((item) => item.key === belongCode);
    if (belongItem) {
      return belongItem.name;
    }
    return "未定义分组";
  }
  getCorpName(corpId) {
    let corpItem = this.orgList.find((item) => item.corpId === corpId);
    if (corpItem) {
      return corpItem.name;
    }
    return "未定义组织";
  }
  getIndex(id) {
    let currentIndex = this.userExtList.findIndex((item) => {
      return item.id === id;
    });
    return this.params.page * this.params.size + currentIndex + 1;
  }

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.params.page = page - 1;
    this.params.size = pageSize;
    this.getUserExtList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.params.page = 0;
    this.params.size = pageSize;
    this.getUserExtList();
  }

  getUserExtList() {
    this.isLoading = true;
    let userExtparams: Organization.searchDemissionUserParams = {
      page: this.params.page,
      size: this.params.size,
    };
    getUserExtList(userExtparams)
      .then((res: Common.Data) => {
        console.log("getUserExtList:", res);
        if (res.errcode === 0 && res.data && Array.isArray(res.data.content)) {
          this.userExtList = res.data.content;
          this.totalPage = res.data.totalElements;
        }
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  showAddUserExt() {
    this.formData = {
      name: "",
      code: "",
      corpId: undefined,
      belong: undefined,
      mapKey: undefined,
      enable: true,
    };
    let cacheInfo: any = {
      orgList: this.orgList,
      groupList: this.groupList,
      title: "新增拓展字段",
    };
    this.setUserExt(cacheInfo);
    this.isShowUserExt = true;
  }

  onEditItem(record) {
    this.formData = {
      id: record.id,
      code: record.code,
      name: record.name,
      corpId: record.corpId,
      belong: record.belong,
      mapKey: record.mapKey,
      enable: !!record.enable,
    };
    let cacheInfo: any = {
      orgList: this.orgList,
      groupList: this.groupList,
      title: "编辑拓展字段",
    };
    this.setUserExt(cacheInfo);
    this.isShowUserExt = true;
  }

  onDeleteItem(record) {
    let self = this;
    this.$confirm({
      title: "确定删除该拓展字段吗?",
      okText: "确定",
      cancelText: "取消",
      onOk() {
        deleteUserExt({ ids: record.id })
          .then((res) => {
            if (res.errcode === 0) {
              self.$message.success("删除成功");
              self.getUserExtList();
            } else {
              self.$message.error(res.errmsg as string);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
    });
  }

  batchDelete() {
    let self = this;
    let ids = this.rowSelection.selectedRowKeys.join();
    this.$confirm({
      title: "确定批量删除这些拓展字段吗?",
      okText: "确定",
      cancelText: "取消",
      onOk() {
        deleteUserExt({ ids: ids })
          .then((res) => {
            if (res.errcode === 0) {
              self.$message.success("删除成功");
              self.rowSelection.selectedRowKeys = [];
              self.getUserExtList();
            } else {
              self.$message.error(res.errmsg as string);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
    });
  }

  cancel() {
    this.isShowUserExt = false;
  }
  action(val) {
    addUserExt(val)
      .then((res) => {
        if (res.errcode === 0) {
          this.$message.success("操作成功");
          this.isShowUserExt = false;
          this.getUserExtList();
        } else {
          this.$message.error(res.errmsg as string);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }
}
</script>
<style lang="less" scoped>
.userExt {
  position: relative;
  padding: 0 24px;
  &__new {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 16px 0;
    .close-icon {
      color: rgba(0, 0, 0, 0.25);
      margin-right: 12px;
    }
  }
  & > div.empty-box {
    text-align: center;
    .user-empty {
      margin: 0px auto;
      margin-top: 150px;
    }
  }
  &__button {
    margin-left: 24px;
    padding: 0 10px;
    i {
      margin-left: 6px;
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
    /deep/.ant-table-body {
      max-height: calc(100vh - 180px - 44px) !important;
    }
    /deep/ .ant-switch-disabled {
      opacity: 1;
    }
    /deep/ .ant-table-small > .ant-table-content .ant-table-row:last-child td {
      border-bottom: none;
    }
  }
  &__footer {
    position: fixed;
    bottom: 5px;
    right: 20px;
    & > div {
      float: right;
      padding: 8px 0;
      margin-right: 24px;
    }
    /deep/.ant-pagination-options-quick-jumper input {
      vertical-align: top;
    }
    /deep/.ant-pagination-options {
      height: 32px;
    }
  }
  &__form {
    &,
    /deep/ .ant-form-item-required::before {
      top: 0px !important;
    }
  }
}
</style>
<style lang="less">
.userExt-modal {
  .ant-drawer-body {
    padding: 0;
  }
}
</style>