<template>
  <div class="org-user">
    <a-tabs default-active-key="1" @change="tabChange" class="user-tabs">
      <a-tab-pane key="1" tab="在职人员">
        <div class="user-tree" v-resize.east>
          <div class="role-operation" v-if="hasCloudPivot">
            <div class="role-btn add-role-group" @click="importDepartment()">
              <i class="icon aufontAll h-icon-all-download-o"></i>
              <span>{{ $t("languages.ImportDepartment") }}</span>
            </div>
            <div class="role-line"></div>
            <div class="role-btn add-role" @click="exportDepartment()">
              <i class="icon aufontAll h-icon-all-upload-o"></i>
              <span>{{ $t("languages.ExportDepartment") }}</span>
            </div>
          </div>
          <export-dept
            v-if="isShowExportDept"
            :isShowExportDept="isShowExportDept"
            @cancel="cancel"
          ></export-dept>

          <div class="search-wrap">
            <a-input
              :placeholder="$t('languages.PlaceHolder.SearchByNameDept')"
              class="input-search"
              v-model="searchText"
              @pressEnter="onSearch"
            >
              <a-icon
                class="suffix-icon close-icon"
                v-if="searchText.length > 0"
                slot="suffix"
                type="close-circle"
                @click="clearKeyword"
              />

              <a-icon
                class="suffix-icon"
                type="search"
                slot="suffix"
                @click="onSearch"
              />
            </a-input>
          </div>

          <!-- 组织树 -->
          <org-tree-component
            @selectNodeEvent="selectNode"
            :depdSearch="depdSearch"
            :searchList="searchList"
            ref="orgTree"
          ></org-tree-component>
        </div>
        <div class="user-table">
          <div class="user-title search__input">
            <h2 v-show="!isSearchTitle">
              <div class="title-limit">{{ curNodeState.name }}</div>
              &nbsp;&nbsp;&nbsp;
              <!-- <span>{{ `ID：${curNodeState.id}` }}</span> -->
              <template v-if="curNodeState.enabled">
                <a-popover
                  placement="rightTop"
                  trigger="click"
                  :visible="isShowPop"
                  overlayClassName="dept-popover"
                  @visibleChange="onVisibleChange($event)"
                >
                  <template slot="content">
                    <p
                      v-show="btnsDisplayPermission.copyID"
                      @click="copyID(curNodeState.id)"
                    >
                      复制 ID
                    </p>
                    <p @click="showDepartment(1, curNodeState)">编辑</p>
                    <p
                      v-show="btnsDisplayPermission.deleteAble"
                      @click="deleteDepartment"
                    >
                      删除
                    </p>
                  </template>
                  <i class="icon aufontAll h-icon-all-setting-o edit"></i>
                </a-popover>
              </template>
              <template v-else-if="curNodeState.enabled === false">
                <span style="color: rgba(0, 0, 0, 0.65)">{{ "(已禁用)" }}</span>
              </template>
            </h2>
            <div class="add-operation" v-if="!isSearchTitle">
              <!-- 20200426 ui改变 -->
              <template v-if="curNodeState.enabled">
                <a-dropdown v-show="personImportExport || deptPersonSync">
                  <a-button>
                    <i class="icon aufontAll h-icon-all-ellipsis-o op-icon"></i>
                    更多
                  </a-button>
                  <template slot="overlay">
                    <div class="btns-group">
                      <template v-show="personImportExport">
                        <div
                          v-show="btnsDisplayPermission.importPerson"
                          class="like-btn"
                          @click="importPerson"
                        >
                          {{ $t("languages.ImportPerson") }}
                        </div>
                        <div
                          v-show="btnsDisplayPermission.exportPerson"
                          class="like-btn"
                          @click="exportPerson"
                        >
                          {{ $t("languages.ExportPerson") }}
                        </div>
                      </template>
                      <template v-show="btnsDisplayPermission.batchOperation">
                        <div class="like-btn" @click="batchModify">
                          批量修改
                        </div>
                        <div class="like-btn" @click="batchDelete">
                          批量删除
                        </div>
                      </template>

                      <template v-show="deptPersonSync">
                        <div
                          v-show="btnsDisplayPermission.syncDepartment"
                          class="like-btn"
                          @click="() => (this.syncDepartVisible = true)"
                        >
                          同步部门
                        </div>
                        <div
                          v-show="btnsDisplayPermission.syncPerson"
                          class="like-btn"
                          @click="syncPeople"
                        >
                          同步人员
                        </div>
                      </template>
                    </div>
                  </template>
                </a-dropdown>

                <a-dropdown v-show="deptPersonCreate">
                  <a-button type="primary">
                    <i class="icon aufontAll h-icon-all-plus-o op-icon"></i>
                    新建
                  </a-button>
                  <template slot="overlay">
                    <div class="btns-group">
                      <template>
                        <div
                          v-show="btnsDisplayPermission.createDepartment"
                          class="like-btn"
                          @click="showDepartment(0)"
                        >
                          新建部门
                        </div>
                        <div
                          v-show="btnsDisplayPermission.createUser"
                          class="like-btn"
                          @click="showUser(0)"
                        >
                          新建用户
                        </div>
                      </template>
                    </div>
                  </template>
                </a-dropdown>
              </template>
              <template v-else>
                <a-button :disabled="true">
                  <i class="icon aufontAll h-icon-all-ellipsis-o op-icon"></i>
                  更多
                </a-button>
                <a-button type="primary" :disabled="true">
                  <i class="icon aufontAll h-icon-all-plus-o op-icon"></i> 新建
                </a-button>
              </template>
            </div>
          </div>
          <div v-if="isSearchTitle" class="search-title">{{ searchTitle }}</div>
          <div class="empty-box" v-show="noUser && !orgUserList.length">
            <img class="user-empty" src="../../assets/images/userEmpty.png" />
            <div>{{ $t("languages.NoUser") }}</div>
          </div>
          <!-- 用户列表展示 -->
          <div
            v-show="orgUserList.length"
            class="table-wrap"
            :class="{ 'search-wrap': isSearchTitle }"
          >
            <a-table
              class="table-user-list"
              :class="{ 'scroll-bottom': true }"
              :columns="tableColums"
              :dataSource="orgUserList"
              :rowSelection="rowSelection"
              :pagination="false"
              :loading="loading"
              :scroll="{ y: 430 }"
              :customRow="onRowClick"
              @onBodyScroll="onTableBodyScroll"
              :rowKey="(record) => record.id"
            >
              <span
                slot="indexTitle"
                style="font-weight: 600; white-space: nowrap"
              >
                <span class="line"></span>
                {{ $t("languages.NO") }}
              </span>
              <span slot="nameTitle" class="resize">
                <span class="line"></span>
                {{ $t("languages.Name") }}
              </span>
              <span slot="userIdTitle" class="resize"
                ><span class="line"></span
                >{{ $t("languages.User.UserAccount") }}</span
              >
              <span slot="roleNameTitle" class="resize">
                <span class="line"></span>
                {{ $t("languages.Roles") }}
              </span>
              <span slot="mobileTitle" class="resize">
                <span class="line"></span>
                {{ $t("languages.User.MobilePhone") }}
              </span>
              <span slot="emailTitle" class="resize">
                <span class="line"></span>
                {{ $t("languages.User.Email") }}
              </span>
              <span slot="operationTitle" class="resize">
                <span class="line"></span>
                {{ $t("languages.Operation") }}
              </span>

              <p
                slot="name"
                class="cursor text-ellipsis"
                slot-scope="text, record"
              >
                <a-tooltip placement="top">
                  <template v-if="record.leader" slot="title">
                    <span>{{ $t("languages.User.Manager") }}</span>
                  </template>
                  <span class="name-span" v-if="searchKey" :title="text">
                    <template
                      v-for="(fragment, i) in text.split(
                        new RegExp(`(${searchKey})|(?=${searchKey})`, 'i')
                      )"
                    >
                      <span
                        v-if="
                          fragment.toLowerCase() === searchKey.toLowerCase()
                        "
                        :key="i"
                        class="highlight"
                        >{{ fragment }}</span
                      >
                      <template v-else>{{ fragment }}</template>
                    </template>
                  </span>
                  <span class="name-span" v-else :title="text">{{ text }}</span>
                </a-tooltip>
                <span
                  v-if="record.leader"
                  class="aufontAll h-icon-all-star star"
                ></span>
                <template v-if="!record.isAuthUser">
                  <a-tooltip>
                    <template slot="title">已禁止该用户登录云枢</template>
                    <span class="aufontAll h-icon-all-lock-o lock"></span>
                  </a-tooltip>
                </template>
              </p>

              <p slot="role" class="text-ellipsis" slot-scope="text">
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{ text }}</span>
                  </template>
                  <span>{{ text }}</span>
                </a-tooltip>
              </p>
              <p
                slot="userId"
                class="cursor text-ellipsis"
                slot-scope="text, record"
              >
                <span v-if="searchKey" :title="text">
                  <template
                    v-for="(fragment, i) in text.split(
                      new RegExp(`(${searchKey})|(?=${searchKey})`, 'i')
                    )"
                  >
                    <span
                      v-if="fragment.toLowerCase() === searchKey.toLowerCase()"
                      :key="i"
                      class="highlight"
                      >{{ fragment }}</span
                    >
                    <template v-else>{{ fragment }}</template>
                  </template>
                </span>
                <span v-else :title="text">{{ text }}</span>
              </p>
              <span slot="mobile" class="text-ellipsis" slot-scope="text">{{
                text
              }}</span>
              <span slot="email" class="text-ellipsis" slot-scope="text">
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{ text }}</span>
                  </template>
                  <span>{{ text }}</span>
                </a-tooltip>
              </span>
              <div
                slot="operation"
                slot-scope="text, record"
                class="operation"
                @click.stop="() => {}"
              >
                <i
                  :class="{
                    'disable-cursor': !curNodeState.enabled,
                    'cursor icon aufontAll h-icon-all-work-handover-o': true,
                  }"
                  @click.self.stop="
                    curNodeState.enabled ? showModel(record) : () => {}
                  "
                ></i>
                <!--  // 不知道具体业务规则，暂时先注释 <i v-if="true" class="cursor icon aufontAll h-icon-all-edit-o" @click.self.stop="showUser(1, record)"></i> -->
                <!-- <a-dropdown
              v-show="isCloudPivot"
              class="cursor"
              :trigger="['hover']"
                >-->
                <i
                  v-if="record.relatedSyncType === 'PUSH'"
                  :class="{
                    'disable-cursor': !curNodeState.enabled,
                    'cursor icon aufontAll h-icon-all-edit-o': true,
                  }"
                  @click.self.stop="
                    curNodeState.enabled ? showUser(1, record, 'PUSH') : () => {}
                  "
                ></i>

                <!-- 非自维护组织判断部门数是否大于一个 需要后端增加字段标识 -->
                <i
                  v-else-if="record.relatedSyncType === 'PULL' && record.deptNum > 1"
                  :class="{
                    'disable-cursor': !curNodeState.enabled,
                    'cursor icon aufontAll h-icon-all-edit-o': true,
                  }"
                  @click.self.stop="
                    curNodeState.enabled ? showUser(1, record, 'PULL') : () => {}
                  "
                ></i>


                <!-- #40164 与测试人员沟通，与编辑按钮显示条件保持一致 原为 v-if="isCloudPivot" -->
                <template v-if="curNodeState.enabled">
                  <a-dropdown
                    v-if="record.relatedSyncType === 'PUSH'"
                    class="cursor"
                    :trigger="['hover']"
                  >
                    <div
                      class="aufontAll h-icon-all-ellipsis-o table-operation"
                      @click.stop="() => {}"
                    ></div>
                    <a-menu slot="overlay">
                      <a-menu-item key="0" @click="showPwd(record)">
                        <span>{{ $t("languages.ResetPassWord") }}</span>
                      </a-menu-item>
                      <a-menu-item
                        key="1"
                        v-if="record.relatedSyncType === 'PUSH'"
                        @click="deleteUser(record.id)"
                      >
                        <span>{{ $t("languages.Delete") }}</span>
                      </a-menu-item>
                    </a-menu>
                  </a-dropdown>
                </template>
                <template v-else>
                  <div
                    class="
                      aufontAll
                      h-icon-all-ellipsis-o
                      table-operation
                      disable-cursor
                    "
                    @click.stop="() => {}"
                  ></div>
                </template>
              </div>
            </a-table>
          </div>
          <div v-show="!noUser" class="load-more">
            <span v-if="!loading && !loadCompleted" @click="loadMore">{{
              $t("languages.ClickToLoadMore")
            }}</span>
            <span v-if="loading && !loadCompleted">{{
              $t("languages.LoadMore")
            }}</span>
            <span class="text" v-if="loadCompleted">{{
              $t("languages.HasLoadedAllData")
            }}</span>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="2" tab="离职人员">
        <QuitStaff />
      </a-tab-pane>
    </a-tabs>

    <!-- 新增/编辑部门弹窗 -->
    <AddDepartment
      v-model="departmentVisible"
      :unitTitleObj="curNodeState"
      :deptType="deptType"
      :deptData="deptData"
      :corpId="curCorpId"
      @reloadTree="reloadTreeByAddOrEditDepartment"
    ></AddDepartment>

    <!-- 新增/编辑用户弹窗 -->
    <AddUser
      :bannedSwitch="bannedSwitch"
      v-model="userVisible"
      :unitTitleObj="curNodeState"
      :userType="userType"
      :userData="userData"
      @reloadUser="reloadUser"
      @watchChild="parentReceive"
      @reloadTree="reloadUserByAddUser"
    ></AddUser>

    <!-- 重置密码弹窗 -->
    <ResetPassword v-model="pwdVisible" :userData="pwdData"></ResetPassword>

    <!-- 工作交接弹框 -->
    <a-drawer
      :title="$t('languages.TaskTransfer.TaskTransfer', { name: userName })"
      width="850"
      placement="right"
      @close="onClose"
      :closable="true"
      :visible="visible"
      wrapClassName="task-transfer-drawer"
      :destroyOnClose="true"
    >
      <TaskTransfer :curTab="curTab" :corpid="corpid" :userid="userid"></TaskTransfer>
    </a-drawer>

    <!--用户信息弹框-->
    <a-drawer
      :title="$t('languages.User.UserInformation')"
      width="850"
      placement="right"
      @close="onCloseInfoModal"
      :closable="true"
      :visible="infoVisible"
      wrapClassName="user-info-drawer"
    >
      <UserInfo
        :onlyView="true"
        @closeDrawer="onCloseInfoModal"
        :curNodeState="curNodeState"
      ></UserInfo>
    </a-drawer>

    <!-- 导入弹窗-->
    <a-modal
      class="import-modal"
      v-model="isShowImportModal"
      :title="importTitle"
      @cancel="handleCancel"
      :width="552"
      :destroyOnClose="true"
      :footer="null"
      :mask="true"
      :maskClosable="false"
      :keyboard="false"
    >
      <data-upload
        v-if="showUploadModel"
        @change="changeImportBtnStatus"
        @setFileName="setImportFileName"
        @remove="removeFile"
        :importType="importType"
      ></data-upload>

      <data-import
        v-if="showImportModel"
        :percent="importPercent"
        :status="importStatus"
        :text="importStatusText"
        @importEnd="importEndFn"
      ></data-import>

      <data-info v-if="isShowDataInfo" :info="importErrInfo"></data-info>

      <!-- 模态框页脚按钮 -->
      <div class="modal-footer">
        <a-button v-if="showCancelButton" key="back" @click="handleCancel">{{
          $t("languages.Cancel")
        }}</a-button>
        <a-button
          v-if="showUploadModel"
          key="import"
          type="primary"
          :disabled="!canImport"
          @click="confirmImport"
          >{{ $t("languages.Modal.StartImport") }}</a-button
        >
        <a-button
          v-if="showReImport"
          key="import"
          type="primary"
          @click="reImport"
          >重新导入</a-button
        >
        <a-button
          v-if="showConfirmButton"
          key="confirm"
          type="primary"
          @click="handleCancel"
          >{{ $t("cloudpivot.list.pc.OK") }}</a-button
        >
      </div>
    </a-modal>
    <!-- 导入弹窗-->
    <!-- [[ 同步部门 -->
    <a-modal
      title="同步部门"
      v-model="syncDepartVisible"
      @ok="syncDepart"
      @cancel="
        () => {
          this.syncDepartSelected = [];
          this.syncDepartVisible = false;
        }
      "
      :maskClosable="false"
    >
      <staff-selector
        :options="deptOpts"
        v-model="syncDepartSelected"
        :params="filterDept"
      ></staff-selector>
    </a-modal>
    <!-- 同步部门 ]] -->
    <!-- 

      <a-tree
        v-if="orgTree && orgTree.length"
        class="tree"
        showIcon
        :defaultExpandedKeys="expandedKeys"
        :treeData="orgTree"
        @expand="getChildrenNodes"
        @select="getUserList"
      >
        <template slot="custom" slot-scope="{selected}">
          <i class="icon aufontAll h-icon-all-outer-o"></i>
        </template>
      </a-tree>
    -->
    <!-- 修改部门弹窗-->
    <a-modal
      class="modify-modal"
      v-model="isShowBatchModify"
      :title="batchModifyTitle"
      @cancel="handleModifyCancel"
      :width="552"
      :destroyOnClose="true"
      :mask="true"
      :maskClosable="false"
      :keyboard="false"
    >
      <div>
        <div class="tips">
          您已选择<span class="selected-num">{{
            rowSelection.selectedRowKeys.length
          }}</span
          >人
        </div>
        <div class="label-item">
          <span class="label">当前部门</span>
          <span>{{ curNodeState.name }}</span>
        </div>
        <div class="label-item-tips">
          <span class="label">新部门</span>
          <div class="modify-modal-input">
            <staff-selector
              :options="modifyDeptOpts"
              v-model="syncModifyDepartSelected"
              :params="filterModifyDept"
              :disabled="rowSelection.selectedRowKeys.length === 0"
            ></staff-selector>
            <div class="warning-tips">
              <span>*</span>批量调整后，人员直属主管信息会被清空，请谨慎操作
            </div>
          </div>
          <!-- <a-input class="modify-modal-input" v-model="newDepartment" /> -->
        </div>
      </div>
      <template slot="footer">
        <a-button
          key="save"
          :disabled="syncModifyDepartSelected.length === 0"
          type="primary"
          @click="handleConfirm"
          >确认</a-button
        >
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";

import { mixins } from "vue-class-component";

import OrgMixins from "./mixins/org";

import * as orgApi from "@/apis/organization";
import OrgApi from "@/apis/organization";
import OAuthApi from "@/apis/oauth";

import TaskTransfer from "../../components/organization/taskTransfer/index.vue";
import UserInfo from "../../components/organization/userInfo.vue";

import DataUpload from "./import/data-upload.vue";
import DataImport from "./import/data-import.vue";
import DataInfo from "./import/data-info.vue";
import OrgTreeComponent from "./orgTree/index.vue";
import QuitStaff from "./quit-staff.vue";

// 导出部门组件
import ExportDept from "./import/export-dept.vue";

import AddDepartment from "../../components/organization/userModals/deptConfig.vue";
import AddUser from "../../components/organization/userModals/user.vue";
import ResetPassword from "../../components/organization/userModals/reset-password.vue";
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import OrganizationApi from "@/apis/organization";

import {
  OrgTree,
  ImportModalCons,
  ImportType,
  ReloadDepartmentInfo,
  DeptOperationType,
  TreeNode,
  BtnsDisplayPermision,
  DeptSyncType,
  DeptOrgType,
} from "./orgTree/orgTree.typings";

const UserModule = namespace("Organization/User");

const SystemUserModule = namespace("System/User");

@Component({
  name: "OrgUser",
  components: {
    TaskTransfer,
    UserInfo,
    DataUpload,
    DataImport,
    ExportDept,
    DataInfo,
    AddDepartment,
    AddUser,
    ResetPassword,
    StaffSelector,
    QuitStaff,
    OrgTreeComponent,
  },
})
export default class OrgUser extends mixins(OrgMixins) {
  // @Prop() hasCloudPivotPerm?: boolean = false;
  @UserModule.State("hasCloudPivotPerm") hasCloudPivotPerm!: any;

  @UserModule.Mutation("setLoadCompleted") setLoadCompleted!: any;
  @UserModule.Mutation("setLoadCompletedNew") setLoadCompletedNew!: any;

  page: number = 0;

  pageId: string = "";

  searchKey: string = "";

  searchText: string = "";

  slideToBottom: boolean = false;

  bottom: boolean = false;

  isShowImportModal: boolean = false; // 弹窗是否显示

  batchModifyTitle: string = "";

  isShowBatchModify: boolean = false; // 批量修改弹窗显示

  syncModifyDepartSelected: any = []; // 新部门

  canImport: boolean = false; // 控制导入按钮置灰

  importFileName: string = "";

  curListCode: string = "";

  isUploading: boolean = false;

  isShowExportDept: boolean = false;

  importTitle: string = "";
  /**** 导入数据 start *****/
  // 导入-进度条
  showImportModel: boolean = false;

  // 导入-选择文件
  showUploadModel: boolean = true;

  // 导入-错误信息
  isShowDataInfo: boolean = false;

  // 导入进度
  importPercent: number = 0;

  simulateInterval: any = -1;

  // 是否导入完成
  isImportEnd: boolean = false;

  // 导入进度条状态
  importStatus: string = "active";

  // 导入状态文本
  importStatusText: string = "导入中";

  // 导入的错误信息
  importErrInfo: any = {};

  importType: string = "";

  showCancelButton: boolean = true;

  showConfirmButton: boolean = false;

  showReImport: boolean = false;
  /**** 导入数据 end *****/

  isShowPop: boolean = false;

  departmentVisible: boolean = false;

  deptType: number = 0;

  deptData: any = {};

  userVisible: boolean = false;

  userType: number = 0;

  userData: any = {};

  pwdVisible: boolean = false;

  pwdData: any = {};

  // isCloudPivot:any = false;

  relateOrgFlag: any = "-999";

  relatedSyncFlag: any = "-999";
  // 同步部门变量
  syncDepartVisible: boolean = false;

  curCorpId: string = "";

  syncDepartSelected: any = [];
  deptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: true,
    showSelect: true,
    placeholder: "请选择部门",
    appManagerFilter: true,
    isInit: false,
    rootNode: [],
    selected: [],
  };

  modifyDeptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: "请选择部门",
    appManagerFilter: true,
    isInit: false,
    rootNode: [],
    selected: [],
  };
  isShowTree: boolean = true;

  selectedDeptId: string = "";

  isSelfMaintainRootNode: boolean = false; // 是否是自维护组织根节点

  curDeptParentId: string = ""; // 当前组织的上级部门id

  // 按钮展示权限组
  btnsDisplayPermission: BtnsDisplayPermision = {
    copyID: true,
    edit: false,
    deleteAble: false,
    importPerson: false,
    exportPerson: false,
    syncDepartment: false,
    syncPerson: false,
    createUser: false,
    createDepartment: false,
    batchOperation: false,
  };

  depdSearch: boolean = false;

  searchList: any = [];

  get personImportExport() {
    const { importPerson, exportPerson } = this.btnsDisplayPermission;
    return importPerson || exportPerson;
  }

  get deptPersonSync() {
    const { syncDepartment, syncPerson } = this.btnsDisplayPermission;
    return syncDepartment || syncPerson;
  }

  get deptPersonCreate() {
    const { createUser, createDepartment } = this.btnsDisplayPermission;
    return createUser || createDepartment;
  }

  get filterDept() {
    let { relatedOrgType, corpId } = this.curNodeState;
    if (relatedOrgType === "RELEVANCE") {
      return { corpId };
    }
    return {};
  }

  get filterModifyDept() {
    let { relatedOrgType, corpId } = this.curNodeState;
    return { corpId, filterType: "admin_corp" };
  }

  get isCloudPivot() {
    return this.config.isCloudPivot === 1;
  }

  // 后端提供，用以专门判断部门导入导出按钮是否显示
  get hasCloudPivot() {
    return this.hasCloudPivotPerm;
  }

  destroyed() {
    // destroy时重置用户列表数据及组织机构树
    this.clearUserList();
  }

  // 改变导入按钮状态
  changeImportBtnStatus(status: boolean) {
    this.canImport = status;
  }

  // 删除文件时
  removeFile(fileName: string) {
    this.errorFileName = fileName;

    this.delTemFile();
  }
  

  //设置导入名称
  setImportFileName(fileName: string) {
    this.importFileName = fileName;
    this.errorFileName = fileName;
  }

  //导入人员按钮
  importPerson() {
    this.importTitle = "导入人员";
    this.importType = ImportType.person;
    this.isShowImportModal = true;
  }

  // 批量修改
  batchModify() {
    if(this.rowSelection.selectedRowKeys.length <= 0) {
      this.$message.error("请先选择成员");
    } else {
      this.batchModifyTitle = "修改部门";
      this.isShowBatchModify = true;
    }
  }

  // 确认修改
  handleConfirm() {
    const vm: any = this;
    if(this.curNodeState.id === this.syncModifyDepartSelected[0].id) {
      vm.$message.error("不可移动到自身部门");
      return
    }
    const params: any = {
      userIds: this.rowSelection.selectedRowKeys,
      sourceDept: this.curNodeState.id,
      targetDept: this.syncModifyDepartSelected[0].id,
    };
    OrgApi.batchModifyUserDept(params).then((res: any) => {
      vm.isShowBatchModify = false;
      vm.syncModifyDepartSelected = [];
      if (res.errcode) {
        vm.$message.error(res.errmsg);
        return;
      }
      vm.$message.success("修改用户部门成功！");
      vm.clearUserList();
      vm.reloadUserByAddUser();
    });
  }

  // 批量删除
  batchDelete() {
    const vm: any = this;
    if (vm.rowSelection.selectedRowKeys.length <= 0) {
      vm.$message.error("请先选择成员");
    } else {
      const ids = vm.rowSelection.selectedRowKeys.join(",");
      vm.$confirm({
        title: "是否确认删除",
        okText: vm.$t("languages.Apps.Ok").toString(),
        cancelText: vm.$t("languages.Apps.Cancel").toString(),
        onOk() {
          const params: any = { ids };
          console.log("ids", ids);
          OrgApi.batchDeleteUser(params).then((res: any) => {
            if (res.errcode) {
              vm.$message.error(res.errmsg);
              return;
            }
            vm.$message.success("删除用户成功！");
            vm.clearUserList();
            vm.reloadUserByAddUser();
          });
        },
      });
    }
  }

  /**
   * 导出人员操作
   */
  async exportPerson() {
    let usersParam: any = {
      deptId: this.curNodeState.id,
      userIds: [],
    };
    if (this.rowSelection.selectedRowKeys.length === 0) {
      // 用户没有选中任何人员 导出当前节点所有人员
      usersParam.userIds = [];
    } else {
      // 导出已选中的人员
      // usersParam = this.orgUserList.filter(item => this.rowSelection.selectedRowKeys.includes(item.id));
      usersParam.userIds = this.rowSelection.selectedRowKeys;
    }

    // @ts-ignore
    const res: any = await OrgApi.exportUser(usersParam);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(this.$t("languages.Modal.DownloadFailed") as string);
    } else {
      const blob = new Blob([res], { type: "application/vnd.ms-excel" });
      const timer = this.dateFtt(new Date());
      let fileName = `人员导出${timer}.xlsx`;
      this.downloadFile(blob, fileName);
    }
  }

  /**
   * 时间标准化
   */
  dateFtt(date, fmt = "YYYYMMDDHHmmss") {
    const o = {
      "M+": date.getMonth() + 1, //月份
      "DD+": date.getDate(), //日
      "HH+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds(), //毫秒
    };
    if (/(Y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    for (const k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
    return fmt;
  }

  /**
   * 文件下载方法
   */
  downloadFile(blob: any, fileName: string) {
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // 导入部门按钮
  importDepartment() {
    this.importTitle = "导入部门";
    this.importType = ImportType.department;
    this.isShowImportModal = true;
  }

  // 导出部门按钮
  exportDepartment() {
    this.isShowExportDept = true;
  }

  resetImportData() {
    this.showImportModel = false;

    this.showUploadModel = true;

    this.isShowDataInfo = false;

    this.importPercent = 0;

    this.simulateInterval = -1;

    this.isImportEnd = false;

    this.importStatus = "active";

    this.importStatusText = "导入中";

    this.importErrInfo = {};

    this.importType = "";

    this.showCancelButton = true;

    this.showConfirmButton = false;

    this.showReImport = false;

    this.canImport = false;
  }

  //取消
  async handleCancel() {
    this.isShowImportModal = false;
    setTimeout(() => {
      clearInterval(this.simulateInterval);
      this.resetImportData();
    }, 100);

    this.delTemFile();
  }

  handleModifyCancel() {
    this.isShowBatchModify = false;
    this.syncModifyDepartSelected = [];
  }

  /**
   * 删除临时文件文件
   * */
  async delTemFile() {
    const { errorFileName } = this;
    if (!errorFileName) return;
    await orgApi.delTemFile({ fileName: errorFileName });

    this.errorFileName = "";
  }

  /**
   * @desc 展示导入框的内容
   * @model string 需要展示的模块 upload import info
   * */
  showImportModalContent(model: string = "upload") {
    if (model === "upload") {
      this.showUploadModel = true;
      this.showImportModel = false;
      this.isShowDataInfo = false;
    } else if (model === "import") {
      this.showUploadModel = false;
      this.showImportModel = true;
      this.isShowDataInfo = false;
    } else if (model === "info") {
      this.showUploadModel = false;
      this.showImportModel = false;
      this.isShowDataInfo = true;
    }
  }

  reImport() {
    this.resetImportData();
    this.showImportModalContent(ImportModalCons.upload);
  }

  //确认导入
  importConfirm: boolean = true;
  async confirmImport() {
    if (!this.importConfirm) {
      (window as any).setTimeout(() => {
        this.importConfirm = true;
      }, 1000);
      return false;
    }
    this.importConfirm = false;
    // this.showImportModalContent(ImportModalCons.import)
    const { importFileName, importType } = this;
    let importRes: any;

    if (importType === ImportType.department) {
      importRes = await orgApi.importDepartment(importFileName);
    } else {
      importRes = await orgApi.importPerson(importFileName);
    }
    this.importConfirm = true;
    if (importRes.errcode !== 0) {
      // 有错误
      const { data } = importRes;
      if (data.errorType === 999999) {
        // 网络错误
        this.importPercent = 75;
        this.importStatus = "exception";
        this.importStatusText = "网络出现异常，导入失败！请重新导入";
        this.showReImport = true;
        this.showImportModalContent(ImportModalCons.import);
        return;
      }
      this.showImportModalContent(ImportModalCons.info);
      this.importErrInfo = importRes.data;
    } else {
      this.showImportModalContent(ImportModalCons.import);
      this.showCancelButton = false;
      this.simulateImport();
    }
  }

  // 导入结束 无论成功失败
  errorFileName: any = "";
  importEndFn(data) {
    clearInterval(this.simulateInterval);
    if (!data) return;
    const { errorType } = data;
    if (errorType === 0) {
      this.importPercent = 100;
      this.importStatus = "success";
      this.importStatusText = "导入成功";
    } else {
      this.showImportModalContent(ImportModalCons.info);
      this.importErrInfo = data;
      this.showConfirmButton = true;

      this.errorFileName = data.fileName as any;
    }

    const orgTreeRef: OrgTree = this.$refs.orgTree as any;
    const { importType, curNodeState } = this;
    if (importType === ImportType.person) {
      orgTreeRef.updateUserNum();
      this.getUserList(curNodeState);
    } else {
      orgTreeRef.reloadTree();
    }
  }

  simulateImport() {
    let percent = 1;
    this.simulateInterval = setInterval(() => {
      if (!this.isImportEnd) {
        if (percent <= 90) {
          percent += this.random(5);
          this.importPercent = percent;
        }
      } else {
        clearInterval(this.simulateInterval);
      }
    }, 1500);
  }

  /**
   * 产生随机整数
   */
  random(num: number) {
    return Math.ceil(Math.random() * 5);
  }

  cancel() {
    this.isShowExportDept = !this.isShowExportDept;
  }

  onTableBodyScroll(e: any) {
    const tableBody = e.target;
    const bodyClientHeight = tableBody.clientHeight;
    const bodyScrollHeight = tableBody.scrollHeight;
    const bodyScrollTop = tableBody.scrollTop;
    this.slideToBottom = bodyClientHeight + bodyScrollTop === bodyScrollHeight;
    if (bodyClientHeight + bodyScrollTop === bodyScrollHeight) {
      this.bottom = true;
    } else if (bodyClientHeight + bodyScrollTop + 32 <= bodyScrollHeight) {
      this.bottom = false;
    }
  }

  selectNode(curNodeState: TreeNode) {
    /******** 按钮展示逻辑 start *********/
    this.btnsDisplayPermission.edit = false;
    this.btnsDisplayPermission.deleteAble = false;

    this.btnsDisplayPermission.importPerson = false;
    this.btnsDisplayPermission.exportPerson = false;

    this.btnsDisplayPermission.syncDepartment = false;
    this.btnsDisplayPermission.syncPerson = false;

    this.btnsDisplayPermission.createUser = false;
    this.btnsDisplayPermission.createDepartment = false;

    this.btnsDisplayPermission.batchOperation = false;
    /******** 按钮展示逻辑 end **********/

    // 当前节点信息
    this.curNodeState = curNodeState;
    this.curDeptParentId = curNodeState.parentId;

    this.setDisplayOnClickDept(curNodeState);

    this.getUserList(curNodeState);

    this.setLoadCompleted(false);

    if (Vue.prototype.$httpRequestList.length > 0) {
      //强行中断时才向下执行
      Vue.prototype.$httpRequestList.forEach((item: any) => {
        item("interrupt"); //给个标志，中断请求
      });
    }
  }

  // 点击组织树节点获取用户列表
  async getUserList(node: TreeNode) {
    // if (this.loading) {
    //   return;
    // }

    this.slideToBottom = false;
    this.bottom = false;
    this.isSearchTitle = false;

    this.searchKey = "";
    this.pageId = node.id;
    this.page = 0;
    const userListParam: Organization.Users.OrgUserListParams = {
      deptId: node.id,
      page: 0,
      size: 100,
      filterType: "admin",
    };
    this.clearUserList();
    this.getOrgUserList({ params: userListParam });
    this.rowSelection.selectedRowKeys = [];
  }

  async setDisplayOnClickDept(curNodeState: TreeNode) {
    // 获取当前节点或部门的信息
    const deptInfoParams: Organization.Users.DeptInfoParams = {
      deptId: curNodeState.id,
    };

    OrgApi.getDeptInfo(deptInfoParams).then((res: any) => {
      if (res.errcode === 0) {
        this.curCorpId = res.data.corpId;
        this.selectedDeptId = res.data.id;
        this.isSelfMaintainRootNode =
          res.data.relatedSyncType === "PUSH" && res.data.isCorpRootNode;
        this.curDeptParentId = res.data.parentId || "";

        /******** 按钮展示逻辑 start *********/
        const { isRoot } = curNodeState;
        const {
          relatedSyncType,
          isCorpRootNode,
          displayOption,
          relatedOrgType,
        } = res.data;

        const isPushOrg: boolean = relatedSyncType === DeptSyncType.Push; // 是自维护组织
        const isMainOrg: boolean = relatedOrgType === DeptOrgType.Main; // 是主组织

        this.btnsDisplayPermission.edit = isPushOrg;
        this.btnsDisplayPermission.deleteAble =
          isPushOrg && !isCorpRootNode && !isRoot;

        this.btnsDisplayPermission.importPerson = isPushOrg && displayOption;
        this.btnsDisplayPermission.exportPerson = isPushOrg && displayOption;

        this.btnsDisplayPermission.syncDepartment =
          isPushOrg && !isMainOrg && displayOption;
        this.btnsDisplayPermission.syncPerson =
          isPushOrg && !isMainOrg && displayOption;

        this.btnsDisplayPermission.createUser = isPushOrg && displayOption;
        this.btnsDisplayPermission.createDepartment =
          isPushOrg && displayOption;

        this.btnsDisplayPermission.batchOperation = isPushOrg;
        /******** 按钮展示逻辑 end **********/

        this.relateOrgFlag = res.data.relatedOrgType;
        this.relatedSyncFlag = res.data.relatedSyncType;
      }
    });
  }

  // 加载更多
  loadMore() {
    this.page = this.page + 1;
    if (!this.searchKey) {
      // 组织机构用户列表的加载更多
      const loadMoreParam: Organization.Users.OrgUserListParams = {
        deptId: this.pageId,
        page: this.page,
        size: 100,
        filterType: "admin",
      };
      this.getOrgUserList({ params: loadMoreParam });
    } else {
      // 组织机构搜索的用户列表加载更多
      const loadSearchParam: Organization.Users.SearchUserListParams = {
        wd: this.searchKey,
        page: this.page,
        size: 100,
        filterType: "admin",
      };
      this.getOrgUserList({ params: loadSearchParam, isSearch: true });
    }
  }

  // 清空搜索关键字
  clearKeyword() {
    this.searchKey = "";
    this.searchText = "";
    this.isSearchTitle = false;
    this.clearUserList();
    this.clearSearchDept();
    const params: Organization.Users.OrgUserListParams = {
      deptId: this.pageId,
      page: 0,
      size: 100,
      filterType: "admin",
    };
    this.getOrgUserList({ params });
  }

  clearSearchDept() {
    this.searchList = [];
    this.depdSearch = false;
  }

  parentReceive() {
    this.clearKeyword();
  }

  // 按用户名搜索
  onSearch() {
    // value为空或数据正在加载中时，不允许请求
    this.searchText = this.searchText.trim();
    if (this.searchText === "" || this.loading) {
      this.clearSearchDept();
      return;
    }
    this.searchKey = this.searchText;
    this.page = 0;
    const searchParam: Organization.Users.SearchUserListParams = {
      wd: this.searchText,
      page: 0,
      size: 100,
      filterType: "admin",
    };
    this.isSearchTitle = true;
    this.clearUserList();
    this.getOrgDeptList({ params: searchParam, isSearch: true });
    this.getOrgUserList({ params: searchParam, isSearch: true });
  }

  async getOrgDeptList(params: any) {
    this.depdSearch = true;
    const res = await OrganizationApi.searchDepartments(params.params);
    this.depdSearch = false;
    if (res.errcode === 0 && res.data) {
      this.searchList = res.data;
    } else {
      this.searchList = [];
    }
  }

  /*
   * popover显示控制
   */
  onVisibleChange(visible: boolean) {
    this.isShowPop = visible;
  }

  /*
   * 复制ID到剪贴板
   */
  copyID(str: string) {
    this.isShowPop = false;
    const content = document.createElement("input");
    content.setAttribute("value", str);
    document.body.appendChild(content);
    content.select();
    document.execCommand("copy");
    document.body.removeChild(content);
    this.$message.success("已成功复制到粘贴板");
  }

  /*
   * show（新增/编辑）部门弹窗-- 0：新增，1：编辑
   */
  showDepartment(type: number, node: any) {
    this.isShowPop = false;
    this.deptType = type;
    if (node) {
      this.deptData = node;
      this.deptData.isSelfMaintainRootNode = this.isSelfMaintainRootNode;
      this.deptData.parentId = this.curDeptParentId;
    }
    this.departmentVisible = true;
  }

  /*
   * 删除部门
   */
  deleteDepartment() {
    this.isShowPop = false;
    const vm: any = this;
    vm.$confirm({
      title: "确定删除此部门吗？",
      okText: vm.$t("languages.Apps.Ok").toString(),
      cancelText: vm.$t("languages.Apps.Cancel").toString(),
      onOk() {
        const params = {
          id: vm.curNodeState.id,
        };
        OrgApi.deleteDepartment(params).then((res: any) => {
          if (res.errcode === 200009 || res.errcode === 200002) {
            vm.$warning({
              title: "检测当前部门下包含子部门和用户，请先删除子部门和用户",
              okText: "知道了",
            });
            return;
          } else if (res.errcode) {
            vm.$message.error(res.errmsg);
            return;
          }

          vm.$message.success("删除部门成功！");

          vm.reloadTreeByDelDepartment();
        });
      },
    });
  }
  // user组件是否禁用编辑的状态，新建用户不做禁用限制
  bannedSwitch: boolean = false

  /*
   * show（新增/编辑）用户弹窗-- 0：新增，1：编辑
   */
  showUser(type: number, node: any, opType: string) {
    this.userType = type;
    if (node) {
      this.userData = node;
    }
    this.userVisible = true;
    // 新建用户
    if(type === 0) {
      // 新建用户取消禁用，非自维护组织不会有新建按钮
      this.bannedSwitch = false
    }
    // 编辑用户
    if(type === 1) {
      // 自维护组织取消禁用
      opType === 'PUSH' ? this.bannedSwitch = false : this.bannedSwitch = true
    }

  }

  /*
   * 删除用户
   */
  deleteUser(id: string) {
    const vm: any = this;
    vm.$confirm({
      title: "确定删除此用户吗？",
      okText: vm.$t("languages.Apps.Ok").toString(),
      cancelText: vm.$t("languages.Apps.Cancel").toString(),
      onOk() {
        const params = { id };
        OrgApi.deleteUser(params).then((res: any) => {
          if (res.errcode) {
            vm.$message.error(res.errmsg);
            return;
          }
          vm.$message.success("删除用户成功！");
          // vm.reloadUser(true);
          vm.searchKey = "";
          vm.searchText = "";
          vm.isSearchTitle = false;
          vm.clearUserList();
          // vm.reloadTree();
          // vm.clearKeyword();
          vm.reloadUserByAddUser();
        });
      },
    });
  }

  /*
   * show重置密码弹窗
   */
  showPwd(data: any) {
    this.pwdData = data;
    this.pwdVisible = true;
  }

  /*
   * 重载树
   */
  async reloadTree() {
    setTimeout(() => {}, 300);
    setTimeout(() => {
      this.reloadUser();
    }, 1000);
  }

  /**
   * 通过添加用户重载用户列表
   */
  async reloadUserByAddUser() {
    // 重载用户数量
    const orgTreeRef: OrgTree = this.$refs.orgTree as any;
    orgTreeRef.updateUserNum();

    const { curNodeState } = this;

    this.getUserList(curNodeState);
  }

  /**
   * @desc
   * @params data: 已编辑或者已添加的部门信息
   * */
  reloadTreeByAddOrEditDepartment(data: ReloadDepartmentInfo) {
    const { type } = data;
    const orgTreeRef: OrgTree = this.$refs.orgTree as any;
    if (type === DeptOperationType.Add) {
      orgTreeRef.reloadTreeByAddDepartment(data);
    } else {
      orgTreeRef.reloadTreeByEditDepartment(data);
      this.reloadUser(true);
    }
  }

  /**
   *@desc 删除部门时重载树
   * */
  reloadTreeByDelDepartment() {
    const orgTreeRef: OrgTree = this.$refs.orgTree as any;
    orgTreeRef.reloadTreeByDelDepartment();
    // this.reloadUser();
  }

  /*
   * 重载用户
   */
  reloadUser(curPage?: boolean) {
    let deptId = "";
    if (curPage) {
      deptId = this.curNodeState.id;
    }
    this.clearUserList();
    this.page = 0;
    const params: Organization.Users.OrgUserListParams = {
      deptId,
      page: 0,
      size: 100,
      filterType: "admin",
    };
    this.getOrgUserList({ params });
  }
  /**
   * @desc 同步人员
   */
  async syncPeople() {
    let {
      rowSelection: { selectedRowKeys },
      orgUserList,
    } = this;
    if (!Array.isArray(selectedRowKeys) || selectedRowKeys.length === 0) {
      return this.$message.error("请选择需要同步的人员");
    }
    let users = orgUserList.filter((item: any) =>
      selectedRowKeys.includes(item.id)
    );
    // 同步用户需要[deptId,userId]
    users = users.map((item: any) => ({
      userId: item.id,
      deptId: this.selectedDeptId,
    })); // 部门应当传选中的id
    let { errcode, errmsg } = await orgApi.pushToDingTalk(users);
    if (errcode === 0) {
      return this.$message.success(errmsg as string);
    }
    return this.$message.error(errmsg as string);
    //  console.log('tongbu人员', selectedRowKeys, orgUserList)
  }
  /**
   * @desc 同步部门
   */
  async syncDepart() {
    //  console.log('同步部门')
    let { syncDepartSelected } = this;
    if (Array.isArray(syncDepartSelected) && syncDepartSelected.length === 0) {
      return this.$message.error("请先选择需要同步的部门！");
    }
    // 只需要 deptId参数
    syncDepartSelected = syncDepartSelected.map((item: any) => ({
      deptId: item.id,
    }));
    let { errcode, errmsg } = await orgApi.pushToDingTalk(syncDepartSelected);
    if (errcode === 0) {
      this.syncDepartVisible = false;
      this.syncDepartSelected = [];
      return this.$message.success("同步成功");
    }
    return this.$message.error(errmsg as string);
  }

  curTab: string = "2";
  tabChange(ak: any) {
    this.curTab = ak;
  }

  mounted() {
    this.setLoadCompletedNew(false);
    this.$nextTick(() => {
      // 移除按钮的focus状态
      const allbtns: any = document.querySelectorAll(".user-btn");
      allbtns.forEach((btn: any) => {
        btn.addEventListener("mouseup", () => {
          btn.blur();
        });
      });
    });

    // this.isCloudPivot = this.config.isCloudPivot === 1;
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/themes/index.less";
.modal-footer {
  height: 53px;
  line-height: 53px;
  text-align: right;
  margin-bottom: -24px;
  & button + button {
    margin-left: 8px;
    margin-bottom: 0;
  }
}

.modify-modal {
  .label-item {
    margin-top: 25px;
    display: flex;
    align-items: center;
    &-tips {
      margin-top: 25px;
      display: flex;
    }
  }
  .label {
    margin-right: 23px;
    width: 56px;
  }
  &-input {
    width: 100%;
  }
  .tips {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    .selected-num {
      color: @primary-color;
      margin: 0 5px;
    }
  }
  .warning-tips {
    color: rgba(0, 0, 0, 0.48) ;
    margin-top: 15px;
    font-size: 12px;
    span {
      color: #E02020;
      margin-right: 5px;
    }
  }
}

.org-user {
  height: calc(100vh - 64px);
  .user-tabs {
    /deep/.ant-tabs-bar {
      margin: 0 !important;
    }
  }
  .user-tree {
    width: 224px;
    height: 100%;
    float: left;
    box-shadow: 1px 0px 0px 0px #e8e8e8;
    position: relative;
    text-align: left;
    padding-bottom: 25px;
    .search-wrap {
      width: 100%;
      padding: 0 16px;
      .input-search {
        width: 100%;
        margin-top: 16px;
        margin-bottom: 8px;

        /deep/ .ant-input {
          padding-right: 48px;
        }
        /deep/ .ant-input-suffix {
          right: 5px;
        }

        .close-icon {
          color: rgba(0, 0, 0, 0.25);
          margin-right: 12px;
        }
      }
    }

    .role-operation {
      width: 100%;
      height: 32px;
      padding: 8px 16px 16px 16px;
      margin-bottom: 8px;
      line-height: 32px;
      .role-line {
        width: 1px;
        height: 24px;
        float: left;
        background: #d8d8d8;
        margin: 4px 20px 4px 12px;
        line-height: 32px;
      }
      .role-btn {
        font-size: 12px;
        color: @primary-color;
        float: left;
        cursor: pointer;
        width: 40%;
        text-align: center;
        i {
          margin-right: 4px;
          font-size: 10px;
        }
      }
    }
    /deep/.ant-tree-icon__open,
    /deep/.ant-tree-icon__close,
    /deep/.ant-tree-iconEle.ant-tree-icon__docu {
      display: none;
    }
  }
  .user-table {
    margin-left: 224px;
    overflow: scroll;
    padding: 0 24px;
    height: 100%;
    & > div.empty-box {
      text-align: center;
      .user-empty {
        margin: 0px auto;
        margin-top: 150px;
      }
    }
    .search__input {
      display: flex;
      align-items: center;
      -webkit-box-pack: justify;
      justify-content: space-between;
      padding-top: 16px;
      h2 {
        font-size: 16px;
        text-align: left;
        font-weight: 500;
        & > span {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
      }
      .user-btn {
        margin-left: 8px;
        vertical-align: middle;
        i {
          font-size: 14px;
          margin-right: 8px;
        }
      }
    }
    .table-wrap {
      padding: 2px 0 8px 0;

      &.search-wrap {
        margin-top: 12px;
      }
      .table-user-list {
        min-width: 670px;

        /deep/ .ant-table-thead > tr > th,
        /deep/ .ant-table-tbody > tr > td {
          padding: 8px 16px;
          padding-top: 9px;
        }

        /deep/ .ant-table-thead > tr > th {
          .line {
            display: inline-block;
            margin-right: 16px;
            vertical-align: middle;
            width: 1px;
            height: 22px;
            background: rgba(232, 232, 232, 1);
          }

          .resize {
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.85);
          }

          &:first-child {
            padding-right: 0;
          }
        }

        /deep/ .ant-table-tbody > tr > td {
          padding-left: 38px;
          padding-right: 5px;
          &:first-child {
            padding-left: 16px;
            padding-right: 0;
          }
        }

        .cursor {
          cursor: pointer;
          .name-span {
            display: inline-block;
            max-width: 70px;
            height: 18px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .star {
            color: #fadb14;
            margin-left: 8px;
            font-size: 14px;
            display: inline-block;
            vertical-align: text-bottom;
          }
          .lock {
            margin-left: 8px;
          }
        }
        .disable-cursor {
          cursor: default;
          color: rgba(0, 0, 0, 0.25);
        }
        .highlight {
          color: @primary-color;
        }
      }
      /deep/ .ant-table-header {
        overflow-x: hidden;
        padding-bottom: 20px !important;
        margin-bottom: -20px !important;
        .ant-table-thead > tr > th {
          color: rgba(0, 0, 0, 0.65);
        }
      }
      /deep/ .ant-table-body {
        min-height: 43px;
        max-height: calc(100vh - 229px + 12px) !important;
        overflow-x: hidden !important;
        color: rgba(0, 0, 0, 0.85);
        p {
          margin-bottom: 0;
        }
      }
      .scroll-bottom {
        /deep/ .ant-table-body {
          max-height: calc(100vh - 261px) !important;
        }
      }
    }
    .user-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      h2 {
        font-size: 16px;
        text-align: left;
        font-weight: 500;
        .title-limit {
          display: inline-block;
          max-width: 192px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: bottom;
        }
        // background: #fff;
        // border-bottom: 1px solid #E8E8E8;
        & > span {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
        .edit {
          cursor: pointer;
        }
      }
      .add-operation {
        &_childs {
          float: left;
        }
        & > button {
          margin-left: 8px;
        }
      }
    }
    .search-title {
      // padding-top: 17px;
      text-align: left;
      font-size: 14px;
      opacity: 0.45;
      color: #000;
    }
    .ant-table-small {
      padding: 0;
    }
    .operation {
      i {
        font-size: 14px;
        margin-right: 16px;
      }
    }
    .table-operation {
      display: inline-block;
      font-size: 14px;
    }
    .resize {
      white-space: nowrap;
    }
    .load-more {
      text-align: center;
      padding: 6px 0;
      span {
        padding: 11px 0;
        color: rgba(0, 0, 0, 0.45);
        font-weight: 400;
        font-size: 12px;
        cursor: pointer;
      }
      .text {
        cursor: default;
      }
    }
  }
}
</style>

<style lang="less">
.ant-table-body::-webkit-scrollbar,
.ant-table-header::-webkit-scrollbar {
  width: 0;
}
.user-info-drawer {
  .ant-drawer-body {
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
.task-transfer-drawer {
  //  z-index: 1051;
  .ant-drawer-body {
    padding: 0px;
  }
}
.dept-popover {
  cursor: pointer;
}
.dept-popover p:first-child {
  border-top: none;
  border-radius: 4px 4px 0 0;
  &:hover {
    &:before {
      content: "";
      display: block;
      width: 8.5px;
      height: 8.5px;
      transform: rotate(45deg);
      background-color: #e8fcf4;
      position: absolute;
      left: 6px;
      top: 12px;
    }
  }
}
.dept-popover .ant-popover-inner-content {
  padding: 0px;
}
.dept-popover p {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  padding: 5px 16px;
}
.dept-popover p:hover {
  background-color: #e8fcf4;
}

.more-dot {
  transform: rotate(90deg);
}

// .add-operation_childs {
//   & > button {
//     display: block;
//   }
// }

.btns-group {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  .like-btn {
    padding: 5px 12px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    transition: all ease 0.3s;
    &:hover {
      background: #e8fcf4;
    }
  }
}

.op-icon {
  margin-right: 8px;
}
</style>
