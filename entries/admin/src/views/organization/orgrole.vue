<template>
  <div class="role clearfix">
    <div class="role-tree" v-resize.east>
      <div class="role-operation" v-if="isRoleManage">
        <div class="role-btn add-role-group" @click="showRoleGroup(0)">
          <i class="icon aufontAll h-icon-all-plus-o"></i>
          <span>新建角色组</span>
        </div>
        <div class="role-line"></div>
        <div class="role-btn add-role" @click="showRole(0)">
          <i class="icon aufontAll h-icon-all-plus-o"></i>
          <span>新建角色</span>
        </div>
      </div>
      <div class="search-wrap">
        <a-input
          :placeholder="$t('languages.PlaceHolder.InputRole')"
          class="input-search"
          v-model="searchRoleKeys"
          @pressEnter="onSearchRole"
        >
          <a-icon
            class="suffix-icon close-icon"
            v-if="searchRoleKeys.length > 0"
            slot="suffix"
            type="close-circle"
            @click="clearRoleKey"
          />

          <a-icon
            class="suffix-icon"
            type="search"
            slot="suffix"
            @click="onSearchRole"
          />
        </a-input>
        <div class="search-tips" v-show="searchTips">
          <span>{{ `"${searchRoleKeys}"` }}</span>
          <div class="search-result">相关的搜索结果：共0个</div>
        </div>
      </div>
      <p class="no-role" v-if="!treeData || !treeData.length">暂无角色</p>
      <div class="tree-wrapper">
        <a-tree
          v-if="showOrgTree"
          style="display: inline-block"
          class="tree"
          showIcon
          :expandedKeys="expandedKeys"
          :defaultSelectedKeys="defaultSelectedKeys"
          :loadedKeys="loadedKeys"
          :treeData="treeData"
          :loadData="loadChildrenNodes"
          @expand="getExpandedNodes"
          @select="getUserList"
        >
          <span slot="title" slot-scope="node" class="role-title">
            <span class="title" :title="node.title">{{ node.title }}</span>
            <template v-if="!node.isLeaf && !node.corpId">
              <span
                class="title-tip dingding"
                v-if="node.roleType === 'DINGTALK'"
                >钉钉</span
              >
              <span class="title-tip wx" v-else-if="node.roleType === 'WECHAT'"
                >企微</span
              >
              <span class="title-tip system" v-else-if="node.roleType === 'SYS'"
                >自维护</span
              >
            </template>
            <a-popover
              placement="rightTop"
              trigger="click"
              :visible="isShowPop && iconCode === node.id"
              overlayClassName="role-popover"
              @visibleChange="onVisibleChange($event, node.id)"
            >
              <template slot="content" v-if="isShowPop">
                <p
                  @click="
                    node.isLeaf ? showRole(1, node) : showRoleGroup(1, node)
                  "
                >
                  编辑
                </p>
                <p
                  @click="
                    node.isLeaf ? deleteRole(node) : deleteRoleGroup(node)
                  "
                >
                  删除
                </p>
              </template>
              <i
                v-if="
                  isRoleManage && (
                  node.roleType === 'SYS' &&
                  node.corpId &&
                  !isOnlyAppAdmin &&
                  node.name !== '主管' &&
                  node.name !== '默认' &&
                  node.groupName !== '默认'
                  )
                "
                class="icon aufontAll h-icon-all-setting-o edit"
                :class="{ isshow: isShowPop && iconCode === node.id }"
                @click.stop="() => {}"
              ></i>
            </a-popover>
          </span>
        </a-tree>
      </div>
    </div>
    <div class="role-content">
      <div v-if="isManage">
        <div style="width: 600px; margin: auto; padding-bottom: 15px">
          <a-alert
            message="“主管”为默认角色，请到部门设置中设置主管，设置完成后自动同步"
            type="warning"
            show-icon
          >
            <span slot="closeText">
              <router-link
                :to="{ name: 'orguser', params: { userLink: true } }"
              >
                <span style="color: #4aa2fb">前往设置</span></router-link
              >
            </span>
          </a-alert>
        </div>
      </div>
      <div class="role-content__search">
        <div class="search__role">
          <template v-if="userInfo.code">
            <span class="search__role_txt" :title="userInfo.name">{{
              `${userInfo.name}`
            }}</span>
            &nbsp;&nbsp;&nbsp;<span>{{
              `ID：${userInfo.code}`
            }}</span></template
          >
        </div>
        <div class="search__input">
          <a-input
            class="seach-input"
            :placeholder="$t('languages.PlaceHolder.SearchByName')"
            ref="searchInput"
            v-model="searchVal"
            @pressEnter="filterTable"
          >
            <a-icon
              class="suffix-icon close-icon"
              v-if="searchVal.length > 0"
              slot="suffix"
              type="close-circle"
              @click="clearUserKey"
            />

            <a-icon
              class="suffix-icon"
              type="search"
              slot="suffix"
              @click="filterTable"
            />
          </a-input>

          <staff-selector
            :options="taffSelectorOpts"
            v-model="selectOrg"
            @change="filterTable"
            class="user org-user"
            placeholder="请选择部门"
            :visiblePart = "true"
          ></staff-selector>


          <a-button
            v-if="isRoleManage"
            :disabled="isBatchOperate"
            @click="showUser(2)"
            class="batch-edit-btn"
            ><i class="icon aufontAll h-icon-all-list-work-o list-work-icon"></i
            >批量编辑</a-button
          >
          <template>
            <a-button
              class="user-btn"
              :disabled="isBatchOperate"
              v-if="
                isRoleManage && (
                  userInfo &&
                  userInfo.roleType === 'SYS' &&
                  userInfo.name &&
                  !isManage
                  ? true
                  : false 
                )
              "
              @click="deleteUser"
            >
              <i class="icon aufontAll h-icon-all-delete-o" />批量删除用户
            </a-button>
            <a-button
              class="user-btn"
              v-if="
                isRoleManage && (
                userInfo &&
                userInfo.roleType === 'SYS' &&
                userInfo.name &&
                !isManage
                ? true
                : false 
                )
              "
              type="primary"
              @click="showUser(0)"
            >
              <i class="icon aufontAll h-icon-all-plus-o" />新建用户
            </a-button>
          </template>
        </div>
      </div>
      <div class="table-wrap-role">
        <a-table
          :columns="tableHead"
          :dataSource="roleList"
          :pagination="false"
          :loading="loading"
          :locale="{ emptyText: '' }"
          :scroll="{ y: 500 }"
          :customRow="onRowClick"
          :customHeaderRow="onHeaderRow"
          @onBodyScroll="onTableBodyScroll"
        >
          <span
            slot="indexTitle"
            class="index"
            style="font-weight: 500; white-space: nowrap"
          >
            <a-checkbox
              v-show="showSelectAllBox || !isBatchOperate"
              @change.stop="selectAll"
              v-model="isSelectAll"
              :indeterminate="!indeterminate"
            ></a-checkbox>
            <span class="text" v-show="!showSelectAllBox && isBatchOperate">{{
              $t("languages.NO")
            }}</span>
          </span>
          <span slot="nameTitle" class="resize"
            ><span class="line"></span>用户</span
          >
          <span slot="userIdTitle" class="resize"
            ><span class="line"></span
            >{{ $t("languages.User.UserAccount") }}</span
          >
          <span slot="departmentTitle" class="resize"
            ><span class="line"></span>所属部门</span
          >
          <span slot="ouScopeTitle" class="resize"
            ><span class="line"></span
            >{{ $t("languages.ManagementScope") }}</span
          >
          <span slot="actionTitle" class="resize"
            ><span class="line"></span>操作</span
          >

          <span
            slot="index"
            class="index"
            slot-scope="text, record"
            @click.stop="() => {}"
          >
            <a-checkbox
              v-show="record.hover || record.checked"
              v-model="record.checked"
              @change.stop="onItemCheckboxChange"
            ></a-checkbox>
            <span class="text" v-show="!record.hover && !record.checked">{{
              text
            }}</span>
          </span>
          <p slot="name" slot-scope="text, record" class="text-ellipsis">
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span
                v-if="userListType === 'search' && searchVal"
                class="cursor"
              >
                <template
                  v-for="(fragment, i) in text.split(
                    new RegExp(`(?<=${searchVal})|(?=${searchVal})`, 'i')
                  )"
                >
                  <span
                    v-if="fragment.toLowerCase() === searchVal.toLowerCase()"
                    :key="i"
                    class="highlight"
                    >{{ fragment }}</span
                  >
                  <template v-else>{{ fragment }}</template>
                </template>
              </span>
              <span v-else class="cursor">{{ text }}</span>
            </a-tooltip>
            <!-- <span class="aufontAll h-icon-all-star" style="color: #FADB14;margin-left: 8px;font-size: 14px"></span> -->
          </p>
          <p slot="userId" class="text-ellipsis" slot-scope="text, record">
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span
                v-if="userListType === 'search' && searchVal"
                class="cursor"
              >
                <template
                  v-for="(fragment, i) in text.split(
                    new RegExp(`(?<=${searchVal})|(?=${searchVal})`, 'i')
                  )"
                >
                  <span
                    v-if="fragment.toLowerCase() === searchVal.toLowerCase()"
                    :key="i"
                    class="highlight"
                    >{{ fragment }}</span
                  >
                  <template v-else>{{ fragment }}</template>
                </template>
              </span>
              <span v-else class="cursor">{{ text }}</span>
            </a-tooltip>
          </p>
          <span
            class="text-ellipsis"
            slot="departmentName"
            slot-scope="text, record"
          >
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span>{{ text }}</span>
            </a-tooltip>
          </span>
          <span
            slot="ouScope"
            slot-scope="text, record"
            class="text-ellipsis"
            >{{ text }}</span
          >
          <span
            slot="action"
            slot-scope="text, record"
            v-if="!isManage"
            class="text-ellipsis cursor"
          >
            <i @click.stop="taskTransfer(record)" style="margin-right: 5px;" class="cursor icon aufontAll h-icon-all-work-handover-o"></i>
            <a href="javascript:void(0)" @click.stop="showUser(1, record)">
              <i class="icon aufontAll h-icon-all-edit-o edit"></i>
            </a>
          </span>
        </a-table>
      </div>
      <div class="load-more">
        <template v-if="isDataEmpty">
          <!-- <span class="text" v-if="userListType === 'search' && searchVal">{{
            $t("languages.NoSearchData")
          }}</span>
          <span class="text" v-else>{{ $t("languages.NoRelevantData") }}</span> -->
        </template>
        <template v-if="!isDataEmpty">
          <span @click="loadMore" v-if="!loading && !isLoadMore">{{
            $t("languages.ClickToLoadMore")
          }}</span>
          <span v-if="loading && !isLoadMore">{{
            $t("languages.LoadMore")
          }}</span>
          <span class="text" v-if="isLoadMore && roleList.length > 0">{{
            $t("languages.HasLoadedAllData")
          }}</span>
        </template>
      </div>
    </div>
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
      <UserInfo></UserInfo>
    </a-drawer>


    <!-- 工作交接弹框 -->
    <a-drawer
      :title="$t('languages.TaskTransfer.TaskTransfer', { name: userName })"
      width="850"
      placement="right"
      @close="TaskTransferVisible = false"
      :closable="true"
      :visible="TaskTransferVisible"
      wrapClassName="task-transfer-drawer"
      :destroyOnClose="true"
    >
      <TaskTransfer :curTab="'1'" :corpid="corpid" :userid="userid"></TaskTransfer>
    </a-drawer>

    <!-- 新增/编辑角色组弹窗 -->
    <AddRoleGroup
      v-model="roleGroupVisible"
      :roleGroupType="roleGroupType"
      :roleInfo="roleGroupInfo"
      :sysRoleGroup="sysRoleGroup"
      :roleGroupData="roleGroupData"
      @reloadTree="reloadTree"
    ></AddRoleGroup>

    <!-- 新增/编辑角色弹窗 -->
    <AddRole
      v-model="roleVisible"
      :roleType="roleType"
      :roleData="roleData"
      :roleInfo="roleInfo"
      :treeData="JSON.parse(JSON.stringify(sysRoleGroup))"
      @reloadTree="reloadTree"
      @nameChange="nameChange"
    ></AddRole>

    <!-- 新增/编辑用户弹窗 -->
    <AddUser
      v-model="userVisible"
      :userType="userType"
      :userData="userData"
      :roleData="userInfo"
      @reloadUser="clearUserKey"
    ></AddUser>
  </div>
</template>

<style lang="less">
.role {
  height: 100%;
  overflow: hidden;
  p {
    margin-bottom: 0;
  }
  .role-tree {
    width: 224px;
    height: 100%;
    float: left;
    box-shadow: 1px 0px 0px 0px #e8e8e8;
    position: relative;
    text-align: left;
    padding: 8px 0px 16px 0px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0;
      height: 5px;
      background: #fff;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.45);
      border-radius: 4px;
    }

    .tree-wrapper{
      overflow-x: scroll; 
      white-space: nowrap; 
      overflow-y: auto; 
      height: calc( 100% - 82px );
      padding-left: 8px;
      &::-webkit-scrollbar {
        width: 0;
        height: 5px;
        background: #fff;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.45);
        border-radius: 4px;
      }
      .tree{
        width: 100%;
      }
    }
    .search-wrap {
      width: 100%;
      margin-bottom: 9px;
      padding-left: 16px;
      padding-right: 16px;
      position: relative;
      .input-search {
        width: 100%;
        .close-icon {
          color: rgba(0, 0, 0, 0.25);
          margin-right: 12px;
        }
        & .ant-input {
          padding-right: 56px !important;
        }
      }
      .search-tips {
        position: absolute;
        left: 0;
        top: 38px;
        padding: 10px 12px;
        background: #fff;
        z-index: 9;
        width: 100%;
        color: rgba(0, 0, 0, 0.65);
        font-size: 14px;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        & > span {
          word-break: break-all;
        }
      }
    }
    ul {
      li {
        span.ant-tree-switcher {
          float: left;
          color: rgba(0, 0, 0, 0.65) !important;
        }
        span.ant-tree-node-content-wrapper {
          display: block;
          margin-left: 24px;
          &:hover {
            background-color: #e8fcf4 !important;
            .role-title {
              .edit {
                display: block;
              }
            }
          }
          &:before {
            background: transparent !important;
          }
        }
        span.ant-tree-node-selected {
          background-color: #eeeeee !important;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.65) !important;
          &:hover {
            background-color: #eeeeee !important;
          }
        }
        span.ant-tree-iconEle {
          display: none;
        }
      }
    }

    .role-operation {
      width: 100%;
      height: 32px;
      padding: 0 8px 0 20px;
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
        i {
          margin-right: 4px;
          font-size: 10px;
        }
      }
    }

    .role-title {
      position: relative;
      display: block;
      padding-right: 10px;
      overflow: hidden;
      .title {
        max-width: calc(100% - 32px);
        min-width: 100px;
        text-overflow: ellipsis;
        overflow: hidden;
        display: block;
        float: left;
        margin-right: 3px;
      }
      .title-new {
        max-width: calc(100% - 55px);
      }

      .edit {
        position: absolute;
        top: 0;
        right: 8px;
        display: none;
      }
      .title-tip {
        display: inline-block;
        font-size: 12px;
        width: 40px;
        height: 20px;
        border-radius: 10px;
        text-align: center;
        line-height: 20px;
        background: #ffffff;
      }
      .dingding {
        color: #3296fa;
        border: 1px solid #3296fa;
      }
      .wx {
        color: #4a74c1;
        border: 1px solid #4a74c1;
      }
      .system {
        width: 45px;
        color: #17bc94;
        border: 1px solid #17bc94;
      }
    }
  }
  .role-content {
    margin-left: 224px;
    padding: 16px 24px 0;
    text-align: left;
    overflow: hidden;
    &__search {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .search__input {
        display: flex;
        .org-user{
          opacity: 1;
          width: 245px;
          margin: 0 10px;
          
          // .has-val > div{
          //   max-height: 28px;
          //   overflow: auto;
          // }
        }
        .batch-edit-btn {
          vertical-align: middle;
          margin-right: 8px;

          .list-work-icon {
            margin-right: 10px;
            vertical-align: middle;
          }
        }

        .ant-input-affix-wrapper {
          .seach-input.ant-input {
            padding-right: 52px;
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
      .search__role {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        font-size: 16px;
        max-width: 500px;
        height: 24px;
        word-break: break-all;
        &_txt {
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500 !important;
          color: rgba(0, 0, 0, 0.85) !important;
          font-size: 16px !important;
          display: inline-block;
          vertical-align: bottom;
        }
        & > span {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }

    .seach-input {
      width: 192px;
      .close-icon {
        color: rgba(0, 0, 0, 0.25);
        margin-right: 12px;
      }
    }
    .table-wrap-role {
      padding: 16px 0;
      padding-bottom: 0;
      .cursor {
        cursor: pointer;
      }
      table {
        padding: 0;
        .ant-table-tbody {
          tr {
            td {
              padding-left: 33px !important;
            }
          }
        }
        .ant-table-thead {
          box-shadow: 0px -1px 0px 0px rgba(232, 232, 232, 1);
          border-radius: 4px 4px 0px 0px;
          overflow: hidden;
        }

        tr {
          td,
          th {
            padding: 8px 16px;
            padding-top: 9px;

            &:nth-child(1) {
              // width: calc(48 / 542 * 100%);
              min-width: 48px;
              text-align: center;
            }

            .resize {
              .line {
                display: inline-block;
                vertical-align: middle;

                margin-right: 16px;
                width: 1px;
                height: 22px;
                background: rgba(232, 232, 232, 1);
              }
            }
          }

          th {
            color: rgba(0, 0, 0, 0.85) !important;
          }

          td {
            padding: 6px 16px;
            padding-top: 7px;

            // padding-left: 34px;

            &:first-child {
              padding-left: 16px;
            }
          }
        }
      }
      .table-operation {
        font-size: 14px;
        margin-right: 16px;
      }
      .highlight {
        color: @primary-color;
      }
      .ant-table-header {
        overflow-x: hidden;
        padding-bottom: 20px !important;
        margin-bottom: -20px !important;
      }
      .ant-table-thead > tr > th {
        color: rgba(0, 0, 0, 0.65);
      }
      .ant-table-body {
        max-height: calc(100vh - 220px) !important;
        overflow-y: auto;
        overflow-x: hidden !important;
        color: rgba(0, 0, 0, 0.85);
        p {
          margin-bottom: 0;
        }
      }
    }
  }
  .load-more {
    text-align: center;
    padding: 11px 0;
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
  .no-role {
    margin-top: 32px;
    text-align: center;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  .h3-organization {
    opacity: 0;
  }
}
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

.role-popover {
  cursor: pointer;
}
.role-popover p:first-child {
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
.role-popover .ant-popover-inner-content {
  padding: 0px;
}
.role-popover p {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  padding: 5px 16px;
}
.role-popover p:hover {
  background-color: #e8fcf4;
}
.isshow {
  display: block !important;
  color: @primary-color;
}
</style>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import UserInfo from "../../components/organization/userInfo.vue";
import AddRoleGroup from "../../components/organization/roleModals/role-group.vue";
import AddRole from "../../components/organization/roleModals/role.vue";
import AddUser from "../../components/organization/roleModals/user.vue";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import OrgApi from "@/apis/organization";

import TaskTransfer from "../../components/organization/taskTransfer/index.vue";

const UserModule = namespace("Organization/User");
const RoleModule = namespace("Organization/Role");
const SystemUserModule = namespace("System/User");

@Component({
  components: {
    UserInfo,
    AddRoleGroup,
    AddRole,
    AddUser,
    StaffSelector,
    TaskTransfer
  },
})
export default class orgrole extends Vue {
  @RoleModule.State("orgTree") orgTree: any;

  @RoleModule.State("roleGroupList") roleGroupList: any;

  @RoleModule.State("loading") loading: any;

  @RoleModule.State("isLoadMore") isLoadMore: any;

  @RoleModule.State("roleList") roleList: any;

  @RoleModule.State("roleTitle") roleTitle: any;

  @RoleModule.State("orgTreeBySearch") orgTreeBySearch: any;

  @RoleModule.State("isRoleSearchResult") isRoleSearchResult: any;

  @RoleModule.State("searchTips") searchTips: any; // 展示搜索角色结果为空时提示

  // 修改

  @RoleModule.Mutation("assignTreeParams") assignTreeParams: any;

  @RoleModule.Mutation("setEventKey") setEventKey: any;

  @RoleModule.Mutation("clearRoleList") clearRoleList: any;

  @RoleModule.Mutation("clearOrgTreeBySearch") clearOrgTreeBySearch: any;

  @UserModule.Mutation("assignUserInfoParams") assignUserInfoParams: any;

  @UserModule.Mutation("clearUserInfo") clearUserInfo: any;

  // 异步
  @RoleModule.Action("getOrgRoleNode") getOrgRoleNode: any;

  @RoleModule.Action("getOrgRoleList") getOrgRoleList: any;

  @RoleModule.Action("getChildrenRole") getChildrenRole: any;

  @RoleModule.Action("searchOrgRoleNode") searchOrgRoleNode: any;

  @UserModule.Action("getOrgUserInfo") getOrgUserInfo: any;

  @SystemUserModule.State("isOnlyAppAdmin") isOnlyAppAdmin!: any;

  @SystemUserModule.State("isRoleManage") isRoleManage!: any;

  searchVal: string = "";

  infoVisible: boolean = false;

  isDataEmpty: boolean = false;

  slideToBottom: boolean = false;

  searchRoleKeys: string = ""; // 搜索角色关键字

  roleInfo: any = "";

  roleGroupInfo: any = "";

  isManage: boolean = false;

  selectOrg:any[] = [];

  taffSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择部门',
    appManagerFilter: true,
  }
  corpid:string = '';
  userid: string = '';
  TaskTransferVisible:boolean = false;
  userName: string = '';
  taskTransfer(recope){
    this.corpid= recope.corpId;
    this.userid = recope.id;
    this.TaskTransferVisible = true;
    this.userName = recope.name;
  }

  // 已加载的节点key值
  get loadedKeys(): string[] {
    return this.expandedKeys;
  }
  tableHead: Array<Organization.TableHead> = [
    {
      dataIndex: "index",
      slots: { title: "indexTitle" },
      scopedSlots: { customRender: "index" },
      width: 80,
    },
    {
      dataIndex: "name",
      // key: 'name',
      slots: { title: "nameTitle" },
      scopedSlots: {
        // filterDropdown: 'filterDropdown',
        // filterIcon: 'filterIcon',
        customRender: "name",
      },
      // onFilter: (value:string, record:any) =>
      //   record.name.toLowerCase().includes(value.toLowerCase()),
      width: 180,
    },
    {
      width: 200,
      dataIndex: "userId",
      slots: { title: "userIdTitle" },
      scopedSlots: { customRender: "userId" },
    },
    {
      dataIndex: "departmentName",
      slots: { title: "departmentTitle" },
      scopedSlots: { customRender: "departmentName" },
      width: 200,
    },
    {
      dataIndex: "ouScope",
      slots: { title: "ouScopeTitle" },
      scopedSlots: { customRender: "ouScope" },
      width: 120,
    },
    {
      dataIndex: "action",
      slots: { title: "actionTitle" },
      scopedSlots: { customRender: "action" },
      width: 80,
      align: "center",
    },
  ];

  userInfo = {
    roleType: "",
    code: "",
    name: "",
    id: "",
  };

  userListType: string = "page"; // 用户列表数据展示的类型： page，默认数据  search，搜索结果

  page: number = 0;

  showOrgTree: boolean = false;

  isShowPop: boolean = false;

  iconCode: string = "";

  roleGroupVisible: boolean = false;

  roleGroupType: number = 0;

  roleGroupData: any = {};

  roleVisible: boolean = false;

  roleType: number = 0;

  roleData: any = {};

  userVisible: boolean = false;

  userType: number = 0;

  userData: any = [];

  isSelectAll: boolean = false;

  showSelectAllBox: boolean = false;

  sysRoleGroup: any[] = [];

  get showBtn() {
    // 部门主管角色列表，隐藏新增和删除入口
    let { name, roleType } = this.userInfo;

    if (!name || !roleType) return false;

    return roleType === "SYS";
  }

  get indeterminate() {
    const length: number = this.roleList.length;
    const checkedLength: number = this.roleList.filter(
      (list: any) => list.checked
    ).length;
    return !checkedLength || checkedLength === length;
  }

  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.roleList.forEach((item: any) => {
        item.checked = true;
      });
    } else {
      this.roleList.forEach((item: any) => {
        item.checked = false;
      });
    }
  }

  /*
   * 当checkbox选择change时事件
   */

  onItemCheckboxChange() {
    const isCheckedItems = this.roleList.filter((d: any) => d.checked);
    if (isCheckedItems.length < this.roleList.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  // 生命周期
  created() {
    this.defaultGetData();
    this.getRoleGroup();
  }

  defaultGetData() {
    this.getOrgRoleNode().then(() => {
      this.showOrgTree = true;
      this.expandedKeys = this.expandedKeysData();
      const listParams: Organization.Roles.RequestListParams = {
        roleId: this.roleTitle.id,
        page: 0,
        size: 100,
        filterType: "admin",
      };
      this.getOrgRoleList({ params: listParams }).then(() => {
        this.userInfo = JSON.parse(JSON.stringify(this.roleTitle));
      });
    });
  }

  destroyed() {
    this.clearRoleList();
    this.clearOrgTreeBySearch();
    const treeParams: Organization.Roles.RequestChildrenTreeParams = {
      groupId: "",
    };
    this.assignTreeParams(treeParams);
  }

  onTableBodyScroll(e: any) {
    const tableBody = e.target;
    const bodyClientHeight = tableBody.clientHeight;
    const bodyScrollHeight = tableBody.scrollHeight;
    const bodyScrollTop = tableBody.scrollTop;
    this.slideToBottom = bodyClientHeight + bodyScrollTop === bodyScrollHeight;
  }

  // 获取角色组下的角色
  getExpandedNodes(expandedKeys: any, e: any) {
    this.expandedKeys = expandedKeys;
    // if (e.expanded && !this.isRoleSearchResult) {
    //   const treeParams = {
    //     groupId: e.node.$attrs.nodeData.id,
    //   };
    //   this.setEventKey({ dataRef: e.node.$attrs.nodeData });
    //   this.assignTreeParams(treeParams); // 设置参数
    //   this.getChildrenRole();
    // }
  }

  // 获取角色下的用户
  getUserList(selectedKeys: any, e: any) {

    this.roleInfo = ((e.node.dataRef.roleType === "SYS" && !e.node.isLeaf) && e.node.dataRef.name !== "默认") && e.node.dataRef.corpId ? e.node.dataRef : "";

    this.roleGroupInfo = ((e.node.dataRef.roleType === "SYS" || e.node.dataRef.id === 'other') && e.node.dataRef.name !== "默认") && (!e.node.isLeaf ? e.node.dataRef : "");

    // 子节点才展示数据，父节点只做展开操作
    if (!e.node.isLeaf) {
      return;
    }
    const userInfo = {
      code: e.node.dataRef.code,
      name: e.node.dataRef.name,
      id: e.node.dataRef.id,
      roleType: e.node.dataRef.roleType,
    };
    this.userInfo = userInfo;
    this.isManage =
      e.node.dataRef.roleType === "SYS" &&
      e.node.dataRef.name === "主管" &&
      e.node.dataRef.groupName === "默认"
        ? true
        : false;
    console.log("this.userInfo", this);
    this.clearUserKey(); // 刷新table数据
  }

  // 加载更多-角色下的用户
  loadMore() {
    this.page += 1;
    const params: Organization.Roles.RequestListParams = {
      roleId: this.userInfo.id,
      page: this.page,
      size: 100,
      filterType: "admin",
    };
    if (this.userListType === "search") {
      params.name = this.searchVal;
    }
    this.isSelectAll = false;
    this.getOrgRoleList({ type: this.userListType, params }); // 刷新table数据
  }

  // 搜索高亮
  filterTable() {
    this.searchVal = this.searchVal.trim();
    // searchVal为空或数据未加载完成时，清空上次搜索结果并加载全部数据
    if (!this.searchVal && !this.selectOrg.length || this.loading) {
      this.clearUserKey();
      return;
    }
    this.userListType = "search";
    this.page = 0;
    this.clearRoleList();
    const params: Organization.Roles.RequestListParams = {
      roleId: this.userInfo.id,
      page: 0,
      size: 100,
      name: this.searchVal,
      filterType: "admin",
      deptId: this.selectOrg.map(el => el.id).join(',')
    };
    this.slideToBottom = false;
    this.isSelectAll = false;
    this.getOrgRoleList({ type: "search", params });
  }

  // 清空搜索用户关键字
  clearUserKey(type?: string) {
    if (type === "save") {
      // 根据之前的分页及搜索结果刷新用户列表
      const listParams: Organization.Roles.RequestListParams = {
        roleId: this.userInfo.id,
        page: 0,
        size: (this.page + 1) * 100,
        filterType: "admin",
      };
      if (this.userListType === "search") {
        listParams.name = this.searchVal;
      }
      this.isSelectAll = false;
      this.getOrgRoleList({ type: this.userListType, params: listParams });
      return;
    }
    this.searchVal = "";
    this.userListType = "page";
    this.page = 0;
    this.clearRoleList();
    const params: Organization.Roles.RequestListParams = {
      roleId: this.userInfo.id,
      page: 0,
      size: 100,
      filterType: "admin",
    };
    this.slideToBottom = false;
    this.isSelectAll = false;
    this.getOrgRoleList({ params });
  }

  /* 用户信息相关 */
  showInfoModal(val: string) {
    if (val) {
      this.assignUserInfoParams({
        id: val,
      });
      this.getOrgUserInfo().then(() => {
        this.infoVisible = true;
      });
    }
  }

  // 用户信息抽屉关闭事件
  onCloseInfoModal() {
    this.infoVisible = false;
    this.clearUserInfo();
  }

  // table行点击事件
  onRowClick(record: any, index: number) {
    return {
      on: {
        click: () => {
          if (record.unitType !== 1) {
            this.showInfoModal(record.id);
          }
        },
        mouseenter: () => {
          record.hover = true;
        },
        mouseleave: () => {
          record.hover = false;
        },
      },
    };
  }

  // table行点击事件
  onHeaderRow(column: any, index: number) {
    return {
      on: {
        mouseenter: () => {
          this.showSelectAllBox = true;
        },
        mouseleave: () => {
          this.showSelectAllBox = false;
        },
      },
    };
  }

  /*
   * 搜索角色
   */
  onSearchRole() {
    this.searchRoleKeys = this.searchRoleKeys.trim();
    // searchRoleKeys为空时，不做搜索并清空上次搜索结果
    if (!this.searchRoleKeys) {
      this.clearRoleKey();
      return;
    }
    this.showOrgTree = false;
    const treeParams = {
      groupId: "",
    };
    this.clearOrgTreeBySearch();
    this.assignTreeParams(treeParams);
    this.searchOrgRoleNode(this.searchRoleKeys).then(() => {
      this.expandedKeys = this.expandedKeysData();
      this.showOrgTree = true;
    });
  }

  /*
   * 清空搜索角色关键字、结果
   */
  clearRoleKey() {
    this.showOrgTree = false;
    this.searchRoleKeys = "";
    this.clearOrgTreeBySearch();
    // 清空关键字，默认展示默认分组下的第一个角色下的用户
    this.defaultGetData();
    setTimeout(() => {
      // 重新渲染tree, 默认展开搜索的角色组
      this.showOrgTree = true;
      this.expandedKeys = this.expandedKeysData();
    }, 1);
  }

  /*
   * popover显示控制
   */
  onVisibleChange(visible: boolean, code: string) {
    this.isShowPop = visible;
    this.iconCode = code;
  }

  changeData(data: any, nodes: any) {
    const result: any = [];
    data.forEach((node: any) => {
      let obj: any = {
        id: node.id,
        value: node.id,
        name: node.name,
        title: `${node.name}`,
        isLeaf: node.children && node.children.length ? false : true,
        key: node.id,
        code: node.code,
        groupId: node.groupId,
        corpName: node.corpName,
        parentId: nodes.id,
        roleType: node.roleType,
        corpId: node.corpId,
        children: null,
      };
      if (node.children && node.children.length) {
        obj.children = this.changeData(node.children, node);
      }
      result.push(obj);
    });
    return result;
  }

  async getRoleGroup() {
    const res: any = await OrgApi.getRoleGroupNew({
      expandAll: true,
      filterDefaultRoleGroup: true,
      onlyGroup: true,
      onlySYS: true,
    });
    if (res.errcode === 0 && Array.isArray(res.data)) {
      this.sysRoleGroup = this.changeData(res.data, {});
    }
  }

  /*
   * show角色组弹窗-- 0：新增，1：编辑
   */
  showRoleGroup(type: number, node: any) {
    this.isShowPop = false;
    this.roleGroupType = type;
    if (node) {
      this.roleGroupData = node;
    }
    this.roleGroupVisible = true;
  }

  /*
   * 删除角色组
   */
  deleteRoleGroup(node: any) {
    this.isShowPop = false;
    const vm: any = this;
    this.$confirm({
      title: "确定删除当前角色组吗？",
      okText: vm.$t("languages.Apps.Ok").toString(),
      cancelText: vm.$t("languages.Apps.Cancel").toString(),
      onOk() {
        const params = {
          ids: node.id,
        };
        OrgApi.deleteRoleGroup(params).then((res: any) => {
          if (res.errcode) {
            vm.$message.error(res.errmsg);
            return;
          }

          vm.$message.success("删除成功！");
          vm.reloadTree();
        });
      },
    });
  }

  // 角色名称变化
  nameChange(data?: any) {
    if (!data) {
      this.reloadTree();
      return;
    }
    this.userInfo.name = data.roleName;
  }

  /*
   * show角色弹窗-- 0：新增，1：编辑
   */
  showRole(type: number, node: any) {
    this.isShowPop = false;
    this.roleType = type;
    if (node) {
      this.roleData = node;
    }
    this.roleVisible = true;
  }

  /*
   * 删除角色
   */
  deleteRole(node: any) {
    this.isShowPop = false;
    const vm: any = this;
    this.$confirm({
      title: "确定删除当前角色吗？",
      okText: vm.$t("languages.Apps.Ok").toString(),
      cancelText: vm.$t("languages.Apps.Cancel").toString(),
      onOk() {
        const params = {
          ids: node.id,
        };
        OrgApi.deleteRole(params).then((res: any) => {
          if (res.errcode) {
            vm.$message.error(res.errmsg);
            return;
          }

          vm.$message.success("删除角色成功！");
          vm.nameChange();
        });
      },
    });
  }

  /*
   * show用户弹窗-- 0：新增，1：编辑, 2: 批量修改
   */
  showUser(type: number, node: any) {
    this.userType = type;
    if (node) {
      this.userData = [node];
    } else {
      this.userData = this.roleList.filter((item) => item.checked);
    }

    this.userVisible = true;
  }

  /*
   * 批量删除用户
   */
  deleteUser() {
    const vm = this;
    this.$confirm({
      title: "确定要批量删除吗？",
      okText: this.$t("languages.Apps.Ok").toString(),
      cancelText: this.$t("languages.Apps.Cancel").toString(),
      onOk() {
        vm.confirmDelUser();
      },
      onCancel() {},
    });
  }

  confirmDelUser() {
    const userIds: any = [];
    const deptIds: any = [];
    this.roleList.forEach((role: any) => {
      if (role.checked) {
        if (role.unitType === 1) {
          deptIds.push(role.deptId);
        } else {
          userIds.push(role.id);
        }
      }
    });

    const params = {
      roleId: this.userInfo.id,
      userIds,
      deptIds,
    };
    OrgApi.deleteRoleUser(params).then((res) => {
      if (!res.errcode) {
        this.$message.success("删除用户成功！");
        this.clearUserKey();
      } else {
        this.$message.error(res.errmsg as string);
      }
    });
  }

  /*
   * 重载树
   */
  reloadTree() {
    const treeParams: Organization.Roles.RequestChildrenTreeParams = {
      groupId: "",
    };
    this.searchRoleKeys = "";
    this.showOrgTree = false;
    this.expandedKeys = this.expandedKeysData();
    this.assignTreeParams(treeParams);
    this.getOrgRoleNode();
    setTimeout(() => {
      // 重新渲染tree, 默认展开搜索的角色组
      this.showOrgTree = true;
    }, 1);
    this.getRoleGroup();
    this.reloadUser();
  }

  /**
   * 加载子节点
   */
  async loadChildrenNodes(e) {
    // 已展开的节点不再请求
    const { expanded, dataRef, pos } = e;

    if (expanded) return;

    if (dataRef.children && dataRef.children.length) return;
    if (!this.isRoleSearchResult) {
      const treeParams = {
        groupId: dataRef.id,
      };
      this.setEventKey({ dataRef });
      this.assignTreeParams(treeParams); // 设置参数
      this.getChildrenRole();
    }
  }

  /*
   * 重载用户列表
   */
  reloadUser() {
    this.clearRoleList();
    const listParams: Organization.Roles.RequestListParams = {
      roleId: "",
      page: 0,
      size: 100,
      filterType: "admin",
    };
    this.getOrgRoleList({ params: listParams }).then(() => {
      this.userInfo = JSON.parse(JSON.stringify(this.roleTitle));
    });
  }

  get isBatchOperate() {
    return !this.roleList.filter((list: any) => list.checked).length;
  }

  get treeData() {
    if (this.isRoleSearchResult) {
      return this.orgTreeBySearch && this.dataRecursion(this.orgTreeBySearch);
    } else {
      return this.orgTree && this.dataRecursion(this.orgTree);
    }
  }

  dataRecursion(list: []) {
    const arr: any = [];
    list.map((i: any) => {
      i.scopedSlots = { title: "title" };
      if (i.children && i.children.length) {
        i.children = this.dataRecursion(i.children);
      }
      arr.push(i);
    });
    return arr;
  }

  // 展开的节点key值
  expandedKeys: string[] = [];

  expandedKeysData() {
    let res: any[] = [];
    if (this.isRoleSearchResult) {
      if (this.orgTreeBySearch.length) {
        res = this.dataChangeAll(this.orgTreeBySearch, []);
      }
      return res;
    } else {
      if (this.orgTree && this.orgTree.length) {
        res = this.dataChange(this.orgTree, [], false);
      }
      return res;
    }
  }

  dataChangeAll(list: any, arr: any) {
    list.forEach((list: any) => {
      if (list.children && list.children.length) {
        arr.push(list.key);
        this.dataChangeAll(list.children, arr);
      }
    });
    return arr;
  }

  dataChange(list: any[], arr: any, status: boolean) {
    if (!list[0].isLeaf && list[0].children) {
      !status && arr.push(list[0].key);
      this.dataChange(list[0].children, arr, status);
    } else if (list[0].isLeaf && status) {
      arr.push(list[0].key);
    }
    return arr;
  }

  get defaultSelectedKeys() {
    let res: any[] = [];
    if (this.isRoleSearchResult) return res;
    if (
      this.orgTree &&
      this.orgTree.length &&
      this.orgTree[0].children &&
      this.orgTree[0].children.length
    ) {
      res = this.dataChange(this.orgTree, [], true);
      // res.push(this.orgTree[0].children[0].key);
    }
    return res;
  }

  @Watch("roleList")
  computerRolistLength() {
    this.isDataEmpty = !this.roleList.length;
  }
}
</script>
