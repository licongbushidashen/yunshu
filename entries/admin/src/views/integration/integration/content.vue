<template>
  <div>
    <div class="integration__head">
      <section class="integration__title">
        {{ folderName }}
        <span class="integration__subtitle" v-if="plainOptions.length > 0"
          >已选择<span class="num">{{ plainOptions.length }}</span
          >个集成服务</span
        >
      </section>
      <section>
        <a-input-search
          v-model="searchKey"
          placeholder="搜索服务编码或显示名称"
          style="width: 240px"
          @change="changeValue"
          @search="onSearch"
        >
          <a-icon
            class="suffix-icon close-icon"
            v-if="searchKey.length > 0"
            slot="suffix"
            type="close-circle"
            @click="clearKeyword"
          />
        </a-input-search>

        <a-button
          class="integration__button__import"
          :disabled="!folderName"
          @click="operate('import')"
        >
          导入
        </a-button>

        <a-button
          class="integration__button__import"
          @click="operate('export')"
          :disabled="plainOptions.length < 1"
        >
          导出
        </a-button>

        <a-button
          type="primary"
          class="integration__button"
          :disabled="!folderName"
          @click="showAddDrawer()"
        >
          <i class="icon aufontAll h-icon-all-plus-o" />新建
        </a-button>
      </section>
    </div>
    <div class="integration__table">
      <a-table
        :loading="isLoading"
        :columns="columns"
        :dataSource="list"
        :pagination="false"
        :scroll="{ y: 500 }"
        :locale="{ emptyText: $t('languages.NoRelevantData') }"
        :expandedRowRender="rowRender"
        :rowClassName="(record) => (isCanExpand(record) ? '' : 'hide-expand')"
        :expandedRowKeys="expandedRowKeys"
        rowKey="code"
        size="small"
        @expand="expandRow"
      >
        <!-- 表头 -->
        <!-- <span class="text-ellipsis" slot="indexTitle">{{ $t('languages.NO') }}</span> -->
        <span class="text-ellipsis" slot="indexTitle">
          <a-checkbox
            :indeterminate="indeterminate"
            :checked="checkAll"
            @change="onCheckAllChange"
          >
          </a-checkbox>
        </span>
        <span class="text-ellipsis resize" slot="codeTitle">服务编码</span>
        <span class="text-ellipsis resize" slot="nameTitle">显示名称</span>
        <span class="text-ellipsis resize" slot="adapterTitle">适配器</span>
        <span class="text-ellipsis resize" slot="modifyTitle">更新时间</span>
        <span class="text-ellipsis" slot="actionTitle">{{
          $t("languages.integration.Action")
        }}</span>
        <!-- 表体 -->
        <span
          slot="indexTitle"
          slot-scope="text, record, index"
          @mouseenter="showCheckBox(record,index)"
          @mouseleave="hideCheckBox(record,index)"
        >
          <a-checkbox
            v-show="record.isShowCheckBox"
            :checked="record.checked"
            @change="(...args) => rowSelection(...args, record)"
          ></a-checkbox>
          <span v-show="!record.isShowCheckBox">{{ text }}</span>
        </span>

        <span
          slot="code"
          slot-scope="text"
          class="text-ellipsis"
          v-hight-light="{ keyWords: wd, value: text }"
        ></span>
        <span
          slot="name"
          slot-scope="text"
          :title="text"
          class="text-ellipsis"
          v-hight-light="{ keyWords: wd, value: text }"
        ></span>
        <span slot="modifiedTime" slot-scope="text" class="text-ellipsis">{{
          text
        }}</span>

        <span
          slot="action"
          slot-scope="text, record"
          class="integration__actions"
        >
          <template v-if="isOperation(record)">
            <i
              class="icon aufontAll h-icon-all-eye-o"
              @click="showAddDrawer(record)"
            />
          </template>
          <template v-else>
            <!-- 编辑 -->
            <i
              class="icon aufontAll h-icon-all-edit-o"
              @click="showAddDrawer(record)"
            />
            <!-- 新增restful / database的方法 -->
            <i
              v-if="isRestful(record) || isDatabase(record) || isSap(record)"
              class="icon aufontAll h-icon-all-plus-o"
              @click="addMethod(record)"
            />
            <!-- 同步soap服务的方法 -->
            <i
              v-else-if="isSoap(record)"
              class="icon aufontAll h-icon-all-sync-o"
              :class="record.code === syncingSoap && 'sync_spin'"
              @click="syncMethod(record)"
            />
            <!-- 运行webserver -->
            <i
              v-else
              class="icon aufontAll h-icon-all-play-circle-o"
              @click="runItem(record)"
            />
            <!-- 删除服务条目 -->
            <i
              class="icon aufontAll h-icon-all-delete-o"
              @click="popItem(record)"
            />
          </template>
        </span>
      </a-table>
    </div>
    <!-- 运行方法 -->
    <a-drawer
      :title="'运行'"
      :visible="showRunDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      @close="closeRunDrawer"
    >
      <run-method :target="currentItem" @close="closeRunDrawer" />
    </a-drawer>
    <!-- 添加或编辑服务 -->
    <a-drawer
      :title="serverDrawerTitle"
      :visible="showServerDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      @close="closeServerDrawer"
    >
      <add-server :server="serverItem" @close="closeServerDrawer" />
    </a-drawer>
    <!-- 添加或编辑Restful方法 -->
    <a-drawer
      :title="methodDrawerTitle"
      :visible="showMethodDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      wrapClassName="method-drawer"
      @close="closeMethodDrawer"
    >
      <add-method
        :method="currentMethod"
        :service="currentServer"
        :currentAdapterType="adapterType"
        @close="closeMethodDrawer"
        @submit="afterMethodChanged"
        @test="testMethod"
      />
    </a-drawer>
    <!-- 添加或编辑SQL方法 -->
    <a-drawer
      :title="methodDrawerTitle"
      :visible="showSqlMethodDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      wrapClassName="method-drawer"
      @close="closeMethodDrawer"
    >
      <add-sql-method
        :method="currentMethod"
        :service="currentServer"
        :currentAdapterType="adapterType"
        @close="closeMethodDrawer"
        @submit="afterMethodChanged"
        @test="testMethod"
      />
    </a-drawer>
    <!-- 添加SQL_Table方法 -->
    <a-drawer
      :title="methodDrawerTitle"
      :visible="showSqlTableMethodDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      wrapClassName="method-drawer"
      @close="closeMethodDrawer"
    >
      <add-sql-table-method
        :method="currentMethod"
        :service="currentServer"
        :currentAdapterType="adapterType"
        @close="closeMethodDrawer"
        @submit="afterMethodChanged"
        @test="testMethod"
      />
    </a-drawer>
    <!-- 编辑SQL_Table方法 -->
    <a-drawer
      :title="methodDrawerTitle"
      :visible="showEditTableMethodDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      wrapClassName="method-drawer"
      @close="closeMethodDrawer"
    >
      <edit-sql-table-method
        :method="currentMethod"
        :currentAdapterType="adapterType"
        :service="currentServer"
        @close="closeMethodDrawer"
        @submit="afterMethodChanged"
        @test="testMethod"
      />
    </a-drawer>
    <!-- 查看引用 -->
    <a-drawer
      title="查看引用"
      :visible="showReferenceDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      @close="closeReferenceDrawer"
    >
      <refer-method :serviceMethod="currentItem" />
    </a-drawer>
    <!-- 删除有关联业务模型的集成方法时提示 -->
    <a-modal
      v-model="showReferenceWarn"
      :width="618"
      wrapClassName="refer-modal_wrap"
      :title="$t('languages.Prompt')"
      :maskClosable="false"
      :destroyOnClose="true"
      :closable="true"
      :okText="'知道了'"
      @ok="closeReferWarn"
      @cancel="closeReferWarn"
    >
      <div class="refer-modal">
        <div class="refer-modal_tip warn">
          <i class="icon aufontAll h-icon-all-exclamation-circle-o" />
          <article>
            <header>该集成方法已关联业务方法，不能删除！</header>
            <p>
              以下业务模型的业务方法引用了当前集成方法，删除集成方法将导致相关业务方法不可用，请解除以下引用后再删除。
            </p>
          </article>
        </div>
        <refer-method :serviceMethod="currentItem" :showTitle="false" />
      </div>
    </a-modal>
    
    <!-- 修改集成方法成功时提示关联业务方法更新 -->
    <a-modal
      v-model="showReferenceInfo"
      :width="618"
      wrapClassName="refer-modal_wrap"
      :title="$t('languages.Prompt')"
      :maskClosable="false"
      :destroyOnClose="true"
      :closable="true"
      @ok="closeReferInfo"
      @cancel="closeReferInfo"
    >
      <div class="refer-modal">
        <div class="refer-modal_tip success">
          <i class="icon aufontAll h-icon-all-check-circle-o" />
          <article>
            <header>保存成功！</header>
            <p>请根据需要同步修改以下引用该方法的业务模型。</p>
          </article>
        </div>
        <refer-method
          :serviceMethod="currentItem"
          :showTitle="false"
          :showRoute="true"
        />
      </div>
    </a-modal>

    <!-- 导入弹窗 -->

    <IntegratedBusinessImport 
    :show="isShow" 
    @importSucceed="importSucceed()"
    @missedDataSourceCodes="getMissedDataSpurce"
    :groupItem="groupItem"
    @close="isShow = false"
     />
     
     <!-- 数据源检测弹窗 -->
     <DataSourceDetect
     :show="!isShow && missedDataSourceCodes.length>0"
     :missedDataSourceCodes="missedDataSourceCodes"
     @close="missedDataSourceCodes=''"
     />

  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace, State, Action, Mutation } from "vuex-class";
import Bus from "@/utils/bus";
import serviceApi from "@/apis/biz-service/service.api";
import ChildTable from "./child-table.vue";
import RunMethod from "./modals/run-method.vue";
import AddServer from "./modals/add-server.vue";
import AddMethod from "./modals/add-method.vue";
import ReferMethod from "./modals/view-reference.vue";
import AddSqlMethod from "./modals/add-method_sql.vue";
import AddSqlTableMethod from "./modals/add-method_table.vue";
import EditSqlTableMethod from "./modals/edit-method_table.vue";
import IntegratedBusinessImport from "./modals/integrated-business-import.vue";
import DataSourceDetect from "./modals/data-source-detect.vue";
import { LanguageTransform, Download } from "@/utils";

const ServiceModule = namespace("Integration/Service");
const UserModule = namespace("System/User");
import { ProtocolAdapterType } from "./type";
import { message } from "@h3/antd-vue";
import { DataSource } from '@h3/report';
@Component({
  name: "integration-content",
  components: {
    ChildTable,
    RunMethod,
    AddServer,
    AddMethod,
    ReferMethod,
    AddSqlMethod,
    AddSqlTableMethod,
    EditSqlTableMethod,
    IntegratedBusinessImport,
    DataSourceDetect,
  },
})
export default class IntegrationContent extends Vue {
  @ServiceModule.State("isLoading") isLoading!: boolean;

  @ServiceModule.State("wd") wd!: boolean;

  @ServiceModule.State("list") list!: BizService.Service.Item[];

  @ServiceModule.Mutation("filterServices") filterServices: any;

  @ServiceModule.Action("getServiceList") getServiceList: any;

  @ServiceModule.Action("getAdapters") getAdapters: any;

  @ServiceModule.Action("deleteService") deleteService: any;

  @UserModule.State("isJustAdmin") isJustAdmin!: boolean;

  @UserModule.State("loginedUserInfo") loginedUserInfo!: any;

  isClose: boolean = false;

  // 搜索关键字
  searchKey: string = "";

  folderName: string = "";

  groupItem: any = {};

  expandedRowKeys: string[] = [];

  // 是否展示运行窗口
  showRunDrawer: boolean = false;

  // 当前操作的服务
  currentItem: any = {};

  // 是否展示添加/编辑服务窗口
  showServerDrawer: boolean = false;

  // 服务窗口标题
  serverDrawerTitle: string = "新建服务";

  // 服务窗口操作原数据
  serverItem: any = {};

  // 是否展示方法弹窗
  showMethodDrawer: boolean = false;

  showSqlMethodDrawer: boolean = false;

  showSqlTableMethodDrawer: boolean = false;

  showEditTableMethodDrawer: boolean = false;

  methodDrawerTitle: string = "新增方法";

  currentServer: any = null;

  currentMethod: any = {};

  // 是否展示引用弹窗
  showReferenceDrawer: boolean = false;

  // 是否展示有引用不可删除弹窗
  showReferenceWarn: boolean = false;

  // 是否展示提示修改业务模型绑定信息弹窗
  showReferenceInfo: boolean = false;

  categoryId: string = '';

  // 表头信息
  columns: Array<Common.TableHead> = [
    {
      dataIndex: "index",
      slots: { title: "indexTitle" },
      scopedSlots: { customRender: "indexTitle" },
      width: 60,
      key: "index",
      align: "center",
      ellipsis: true,
    },
    {
      dataIndex: "code",
      slots: { title: "codeTitle" },
      scopedSlots: { customRender: "code" },
      width: 165,
      key: "code",
      align: "left",
      ellipsis: true,
    },
    {
      dataIndex: "name",
      slots: { title: "nameTitle" },
      scopedSlots: { customRender: "name" },
      width: 165,
      key: "name",
      align: "left",
    },
    {
      dataIndex: "adapterCode",
      slots: { title: "adapterTitle" },
      width: 165,
      key: "adapterCode",
      align: "left",
    },
    {
      dataIndex: "modifiedTime",
      slots: { title: "modifyTitle" },
      scopedSlots: { customRender: "modifiedTime" },
      width: 220,
      key: "modify",
      align: "left",
    },
    {
      dataIndex: "action",
      slots: { title: "actionTitle" },
      scopedSlots: { customRender: "action" },
      width: 180,
      key: "action",
      align: "right",
    },
  ];

  // 当前正在刷新的SOAP服务
  syncingSoap: string = "";

  adapterType: number = -1;

  selectedRowKeys: any[] = [];
  indeterminate: boolean = false;
  checkAll: boolean = false;
  plainOptions: any[] = [];
  isShow: boolean = false; //导入弹窗
  missedDataSourceCodes: string= '';

   /**
    * 获取数据源编码
    */
   getMissedDataSpurce(item){
     if(Array.isArray(item) && item.length>0){
        this.missedDataSourceCodes = item.join('、');
     }else{
       this.missedDataSourceCodes = '';
     }
   }

  /**
   * 重置页面
   */
  importSucceed(){
     this.getServiceList(this.categoryId);
     this.isShow = false;
  }

  /**
   * 全选
   */
  onCheckAllChange(e) {
    Object.assign(this, {
      checkedList: e.target.checked ? this.list : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });

    this.list.forEach((item) => {
      item["checked"] = e.target.checked;
      this.$set(item, "isShowCheckBox", e.target.checked);
    });
    if (e.target.checked) {
      this.plainOptions = JSON.parse(JSON.stringify(this.list));
    } else {
      this.plainOptions = [];
    }
  }

  rowSelection(e, item) {
    let temp = item.checked;
    this.$set(item, "checked", !temp);
    if (temp) {
      this.plainOptions = this.plainOptions.filter((el) => el.id !== item.id);
    } else {
      this.plainOptions.push(item);
    }

    this.indeterminate =
      !!this.plainOptions.length && this.plainOptions.length < this.list.length;
    this.checkAll = this.plainOptions.length === this.list.length;
  }

  hideCheckBox(e,index) {
    if (e.checked) return;
    this.$set(e, "isShowCheckBox", false);
  }

  showCheckBox(e) {
    this.$set(e, "isShowCheckBox", true);
  }

  /**
   * 表格多选
   */

  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys;
  }

  /**
   * 导入导出操作者
   */
  isExportEnd: boolean = true; // 阻止继续导出
  operate(type) {
    switch (type) {
      case "import":
        this.isShow = true;
        break;
      case "export":
        if (!this.isExportEnd) return;
        this.exportService();
        break;
      default:
        break;
    }
  }

  /**
   * 导出服务
   */
  async exportService(){
     const loading: any = this.$message.loading(
          "集成服务导出中，请稍后...",
          0
        );

    const serviceCodes = this.plainOptions.map(item=>{
      return item.code
    });
    const res: any = await serviceApi.exportService({serviceCodes:serviceCodes});
    this.isExportEnd = true;
    if (res.errcode && res.errcode !== 0) {
      this.$message.error(
        (this as any).$t("languages.Apps.ExportError") as string
      );
    } else {
      const fileStream: any = res;
      const fileType: string = "application/zip";
      const fileName = this.plainOptions.length>1?`${this.plainOptions[0].code}等.zip`:`${this.plainOptions[0].code}.zip`;
      Download.downloadByPost(fileStream, fileType, fileName);
    }
    loading();
  }

  /**
   * 按钮操作权限
   */
  isOperation(e: any): boolean {
    if (!e || !Object.keys(e).length) {
      return false;
    }
    if (
      this.isJustAdmin ||
      e.createdBy === this.loginedUserInfo.id ||
      this.loginedUserInfo.permissions.includes("SYS_MNG")
    ) {
      //admin账号、方法创建人不做处理
      return false;
    } else {
      return true;
    }
  }

  /**
   * 判断是否是restful服务或者soap服务
   */
  isCanExpand(record: BizService.Service.Item) {
    return /sap|restful|soap|data_/i.test(record.adapterCode);
  }

  /**
   * 判断是否是restful服务
   */
  isRestful(record: BizService.Service.Item) {
    return /restful/i.test(record.adapterCode);
  }

  /**
   * 判断是否是soap服务
   */
  isSoap(record: BizService.Service.Item) {
    return /soap/i.test(record.adapterCode);
  }

  /**
   * 判断是否是database服务（数据库服务）
   */
  isDatabase(record: BizService.Service.Item) {
    return /^data_/i.test(record.adapterCode);
  }

  /**
   * 是否SAP
   */
  isSap(record: BizService.Service.Item) {
    return /^sap/i.test(record.adapterCode);
  }

  /**
   * 展开子表格
   */
  expandRow(expanded: boolean, record: any) {
    if (expanded) {
      this.expandedRowKeys.push(record.code);
    } else {
      this.expandedRowKeys = this.expandedRowKeys.filter(
        (key: string) => key !== record.code
      );
    }
  }

  /**
   * 展开时获取下属集成方法列表
   */
  rowRender(record: BizService.Service.Item) {
    const vm: any = this;
    if (this.isCanExpand(record)) {
      return this.$createElement("child-table", {
        props: {
          service: {
            ...record,
            isRestful: vm.isRestful(record),
            isSoap: vm.isSoap(record),
            isDatabase: vm.isDatabase(record),
            isSap: vm.isSap(record),
          },
        },
        on: {
          // 运行
          run: (item: BizService.Method.Item) => {
            vm.runItem(item, record);
          },
          // 编辑
          edit: (item: BizService.Method.Item) => {
            vm.editMethod(item, record);
          },
          // 加载服务下的集成方法列表
          load: (methods: BizService.Method.Item[]) => {
            record.methods = methods;
          },
          // 查看引用
          reference: (item: BizService.Method.Item) => {
            vm.referMethod(item);
          },
          // 有引用信息时警告
          warn: (item: BizService.Method.Item) => {
            vm.showReferWarn(item);
          },
        },
      });
    }
    return null;
  }

  /**
   * 删除服务
   */
  async popItem(record: BizService.Service.Item) {
    const bindInfo: any = await serviceApi.getServiceBizBindInfo({
      serviceCode: record.code,
    });
    if (bindInfo.data) {
      this.$warning({
        title: this.$t("languages.Apps.DeletePrompt"),
        content: "该服务已关联业务方法，不能删除",
        okText: this.$t("languages.Apps.Ok").toString(),
      });
      return;
    }
    const vm: any = this;
    this.$confirm({
      title: this.$t("languages.integration.ConfirmDeleteService"),
      okText: this.$t("languages.Apps.Ok").toString(),
      cancelText: this.$t("languages.Apps.Cancel").toString(),
      onOk() {
        const args: BizService.Service.DeleteParams = {
          id: record.id,
        };
        vm.deleteService(args);
      },
    });
  }

  /**
   * 运行服务或方法
   */
  runItem(item: any, service?: any) {
    const target: any = item;
    if (service) {
      if (
        /data_sql/i.test(service.adapterCode) ||
        /sap/i.test(service.adapterCode)
      ) {
        target.adapterType = ProtocolAdapterType.DATA_SQL;
      } else if (/data_table/i.test(service.adapterCode)) {
        // 数据表服务
        target.adapterType = ProtocolAdapterType.DATA_TABLE;
      } else {
        target.adapterType = ProtocolAdapterType.RESTFUL;
      }
    }
    this.currentItem = target;
    this.showRunDrawer = true;
  }

  /**
   * 测试并保存方法
   */
  testMethod(item: any) {
    this.runItem(item);
    const target: any = { ...this.currentServer };
    Bus.$emit("renewMethodList", target);
  }

  /**
   * 关闭运行窗口
   */
  closeRunDrawer() {
    this.showRunDrawer = false;
  }

  changeValue() {
    if (this.searchKey === "" && this.wd) {
      this.filterServices("");
      this.indeterminate = false;
      this.checkAll = false;
      this.plainOptions = [];
      this.resultCheckBox();
    }
  }

  /**
   * 多选重置
   */
  resultCheckBox(){
    this.list.forEach(item=>{
      this.$set(item, 'isShowCheckBox', false);
    })
  }

  /**
   * 根据编码及名称搜索服务
   */
  onSearch(key: string) {
    this.filterServices(key);
    this.indeterminate = false;
    this.checkAll = false;
    this.plainOptions = [];
    this.resultCheckBox();
  }

  /**
   * 清空搜索内容
   */
  clearKeyword() {
    this.searchKey = "";
    if (this.wd) {
      this.filterServices("");
      this.indeterminate = false;
      this.checkAll = false;
      this.plainOptions = [];
      this.resultCheckBox();
    }
  }

  /**
   * 显示添加服务抽屉弹出
   */
  showAddDrawer(record?: BizService.Service.Item) {
    if (record) {
      this.serverDrawerTitle = "编辑服务";
      this.serverItem = record;
      this.isClose = this.isOperation(record);
    } else {
      this.serverDrawerTitle = "新建服务";
      this.serverItem = {};
      this.isClose = false;
    }
    this.showServerDrawer = true;
  }

  /**
   * 关闭添加服务抽屉
   */
  closeServerDrawer() {
    this.showServerDrawer = false;
  }

  /**
   * 添加服务下的方法-弹窗
   */
  addMethod(record: BizService.Service.Item) {
    this.methodDrawerTitle = "新增方法";
    this.currentServer = record;
    this.currentMethod = {};
    if (
      /data_sql/i.test(record.adapterCode) ||
      /sap/i.test(record.adapterCode)
    ) {
      // 数据库服务
      console.log("going to add sql server method");
      this.showSqlMethodDrawer = true;
      this.adapterType = ProtocolAdapterType.DATA_SQL;
    } else if (/data_table/i.test(record.adapterCode)) {
      // 数据表服务
      console.log("going to add sql_table server method");
      this.showSqlTableMethodDrawer = true;
      this.adapterType = ProtocolAdapterType.DATA_TABLE;
    } else {
      console.log("going to add restful method");
      this.showMethodDrawer = true;
      this.adapterType = ProtocolAdapterType.RESTFUL;
    }
  }

  /**
   * 编辑集成方法
   */
  editMethod(method: BizService.Method.Item, service: BizService.Service.Item) {
    this.methodDrawerTitle = "编辑方法";
    this.currentServer = service;
    this.currentMethod = method;
    if (
      /data_sql/i.test(service.adapterCode) ||
      /sap/i.test(service.adapterCode)
    ) {
      // 数据库服务
      console.log("going to edit sql server method");
      this.showSqlMethodDrawer = true;
      this.adapterType = ProtocolAdapterType.DATA_SQL;
    } else if (/data_table/i.test(service.adapterCode)) {
      // 数据表服务
      console.log("going to edit sql_table server method");
      this.showEditTableMethodDrawer = true;
      this.adapterType = ProtocolAdapterType.DATA_TABLE;
    } else {
      console.log("going to edit restful method");
      this.showMethodDrawer = true;
      this.adapterType = ProtocolAdapterType.RESTFUL;
    }
  }

  /**
   * 关闭方法添加/编辑弹窗
   */
  closeMethodDrawer() {
    this.showMethodDrawer = false;
    this.showSqlMethodDrawer = false;
    this.showSqlTableMethodDrawer = false;
    this.showEditTableMethodDrawer = false;
    this.adapterType = -1;
    this.$nextTick(() => {
      this.currentServer = null;
      this.currentMethod = {};
    });
  }

  /**
   * 添加/编辑方法成功后，重新获取对应服务下的方法列表
   * @params bindCount 方法绑定的业务模型方法的数量，以用于判断是否有绑定业务模型
   */
  afterMethodChanged(bindCount: number) {
    const service: any = { ...this.currentServer };
    const method: any = { ...this.currentMethod };
    Bus.$emit("renewMethodList", service);
    this.closeMethodDrawer();
    if (bindCount) {
      this.currentItem = method;
      this.showReferenceInfo = true;
    }
  }

  /**
   * 切换目录时，更新右侧视图列表
   */
  setFolder(item: BizService.Category.Item) {
    if (item) {
      this.folderName = item.name;
      this.groupItem = item||{};
      this.expandedRowKeys = [];
      this.categoryId = item.id;
      this.checkAll = false;
      this.plainOptions.length = 0;
      this.getServiceList(item.id);
    } else {
      this.folderName = "";
      this.expandedRowKeys = [];
    }
  }

  /**
   * 手动刷新soap方法列表
   */
  syncMethod(record: BizService.Service.Item) {
    if (this.syncingSoap) {
      this.$message.warn("请等待上一次同步完成后操作");
      return;
    }
    this.syncingSoap = record.code;
    const timestamp: number = Date.now();
    serviceApi
      .refreshSoapMethods({
        serviceCode: record.code,
      })
      .then((res: any) => {
        if (res.errcode === 0 && Array.isArray(res.data)) {
          res.data.forEach((item: any, index: number) => {
            item.index = index + 1;
          });
          record.methods = res.data;
          Bus.$emit("renewMethodList", record, res.data);
          const diff: number = Date.now() - timestamp;
          const delay: number = diff > 1000 ? 0 : 1000;
          setTimeout(() => {
            this.syncingSoap = "";
            this.$message.success("刷新成功！");
          }, delay);
        } else {
          this.syncingSoap = "";
          this.$message.error("同步失败，请检查SOAP服务地址是否可用！");
        }
      })
      .finally(() => {});
  }

  /**
   * 展示查看引用弹窗
   */
  referMethod(record: BizService.Service.Item) {
    this.currentItem = record;
    this.showReferenceDrawer = true;
  }

  /**
   * 关闭查看引用弹窗
   */
  closeReferenceDrawer() {
    this.showReferenceDrawer = false;
    this.currentItem = null;
  }

  /**
   * 展示有引用信息不可删除弹窗
   */
  showReferWarn(record: BizService.Service.Item) {
    this.currentItem = record;
    this.showReferenceWarn = true;
  }

  /**
   * 关闭有引用信息不可删除弹窗
   */
  closeReferWarn() {
    this.showReferenceWarn = false;
    this.currentItem = null;
  }

  /**
   * 关闭修改后有引用信息的提示弹窗
   */
  closeReferInfo() {
    this.showReferenceInfo = false;
    this.currentItem = null;
  }

  mounted() {
    this.getAdapters();
  }
}
</script>
<style lang="less" scoped>
.integration {
  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    .close-icon {
      color: rgba(0, 0, 0, 0.25);
      margin-right: 12px;
    }
  }
  &__title {
    font-size: 18px;
    font-family: PingFang-SC-Medium;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
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
      overflow: auto;
      table {
        padding: 0;
      }
      th,
      td {
        color: rgba(0, 0, 0, 0.85);
        overflow: hidden;
      }
      /deep/.hide-expand .ant-table-row-expand-icon {
        display: none;
        pointer-events: none;
      }
      /deep/.ant-table-body {
        max-height: none !important;
      }
    }
    /deep/.ant-table-row {
      background-color: #fff;
    }
    /deep/.ant-table-expanded-row {
      &,
      &:hover {
        background-color: transparent;
      }
      > td {
        padding: 0 !important;
        background-color: inherit;
      }
    }
    /deep/.ant-table-expand-icon-th,
    /deep/.ant-table-row-expand-icon-cell {
      padding: 0 !important;
      width: 15px;
      min-width: 15px;
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
  .integration__button__import {
    margin-left: 8px;
  }
  .integration__button {
    margin-left: 8px;
  }
  .integration__subtitle {
    margin-left: 14px;
    font-weight: 400;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    > .num {
      color: #17bc94;
      margin: 0 4px;
    }
  }
}
</style>

<style lang="less">
.method-drawer {
  z-index: 999;
  .ant-drawer-body {
    height: calc(100% - 55px - 26px);
    overflow: auto;
  }
}
.sync_spin {
  &,
  &:before {
    display: inline-block;
    animation: spining 1s infinite linear;
    -webkit-animation: spining 1s infinite linear;
  }
}
@keyframes spining {
  100% {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes spining {
  100% {
    transform: rotate(360deg);
  }
}

.refer-modal_wrap {
  .ant-modal-body {
    max-height: 60vh;
    overflow-y: auto;
  }
  .ant-modal-footer {
    padding: 10px 16px;
    .ant-btn-default {
      display: none;
    }
  }
  .refer-modal {
    &_tip {
      display: flex;
      align-items: flex-start;
      min-height: 104px;
      padding: 16px 24px;
      margin-bottom: 20px;
      border-width: 1px;
      border-style: solid;
      border-radius: 4px;
      > i {
        flex: none;
        width: 24px;
        height: 24px;
        margin-right: 16px;
        font-size: 24px;
        line-height: 24px;
      }
      > article {
        flex: 1;
        header {
          color: rgba(0, 0, 0, 0.85);
          font-size: 16px;
          font-weight: 600;
          line-height: 24px;
        }
        p {
          margin-top: 4px;
          color: rgba(0, 0, 0, 0.65);
          font-size: 14px;
          font-weight: 400;
          line-height: 22px;
        }
      }
    }
    .success {
      border-color: #b7eb8f;
      background-color: #f6ffed;
      > i {
        color: #52c41a;
      }
    }
    .warn {
      border-color: #ffe58f;
      background-color: #fffbe6;
      > i {
        color: #faad14;
      }
    }
  }
}

.integration__table{
  .ant-table-expanded-row{
    background-color: #f3f3f3!important;
    >td:last-child{
      padding: 20px 25px 20px 0!important;
      >div{
        background-color: #fff;
      }
    }
  }
  .ant-table-thead{
    .ant-table-expand-icon-th{
      padding-left: 22px!important;
    }
  }
  .ant-table-row{
    >td{
      &:first-child{
        // padding: 0 2px 0 20px!important;
      }
      &:last-child{
        padding: 0 20px!important;
      }
    }
  }
}
</style>
