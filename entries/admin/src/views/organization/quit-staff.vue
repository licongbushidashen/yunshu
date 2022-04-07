<template>
  <div class="quit-staff">
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
          @click="clearSearchVal"
        />

        <a-icon
          class="suffix-icon"
          type="search"
          slot="suffix"
          @click="filterTable"
        />
      </a-input>
    </div>
    <div class="empty-box" v-show="isEmpty">
      <img class="user-empty" src="../../assets/images/userEmpty.png" />
      <div>{{ $t("languages.NoUser") }}</div>
    </div>
    <div v-show="userList.length" class="table-wrap">
      <a-table
        class="user-list"
        :class="{ 'scroll-bottom': true }"
        :columns="tableColums"
        :dataSource="userList"
        :pagination="false"
        :loading="isLoading"
        :scroll="{ y: 430 }"
        :customRow="onRowClick"
        :rowKey="(record) => record.id"
      >
        <span slot="indexTitle" style="font-weight: 600; white-space: nowrap"
          ><span style="display: none" class="line"></span
          >{{ $t("languages.NO") }}</span
        >
        <span slot="nameTitle" class="resize"
          ><span class="line"></span>{{ $t("languages.Name") }}</span
        >
        <span slot="userIdTitle" class="resize"
          ><span class="line"></span
          >{{ $t("languages.User.UserAccount") }}</span
        >
        <span slot="roleNameTitle" class="resize"
          ><span class="line"></span>{{ $t("languages.Roles") }}</span
        >
        <span slot="mobileTitle" class="resize"
          ><span class="line"></span
          >{{ $t("languages.User.MobilePhone") }}</span
        >
        <span slot="emailTitle" class="resize"
          ><span class="line"></span>{{ $t("languages.User.Email") }}</span
        >
        <span slot="operationTitle" class="resize"
          ><span class="line"></span>{{ $t("languages.Operation") }}</span
        >

        <p slot="name" class="cursor text-ellipsis" slot-scope="text, record">
          <a-tooltip placement="top">
            <span class="name-span" v-if="searchVal" :title="text">
              <template
                v-for="(fragment, i) in text.split(
                  new RegExp(`(${searchVal})|(?=${searchVal})`, 'i')
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
            <span class="name-span" v-else :title="text">{{ text }}</span>
          </a-tooltip>
        </p>
        <p slot="userId" class="cursor text-ellipsis" slot-scope="text, record">
          <span v-if="searchVal" :title="text">
            <template
              v-for="(fragment, i) in text.split(
                new RegExp(`(${searchVal})|(?=${searchVal})`, 'i')
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
          <span v-else :title="text">{{ text }}</span>
        </p>

        <p slot="role" class="text-ellipsis" slot-scope="text">
          <a-tooltip placement="top">
            <template slot="title">
              <span>{{ text }}</span>
            </template>
            <span>{{ text }}</span>
          </a-tooltip>
        </p>
        <span slot="mobile" class="text-ellipsis" slot-scope="text">{{
          text
        }}</span>
        <span slot="email" class="text-ellipsis" slot-scope="text">{{
          text
        }}</span>
        <div
          slot="operation"
          slot-scope="text, record"
          class="operation"
          @click.stop="() => {}"
        >
          <i
            class="cursor icon aufontAll h-icon-all-work-handover-o"
            @click.self.stop="showModel(record)"
          ></i>
        </div>
      </a-table>
    </div>
    <div v-show="!isEmpty" class="load-more">
      <span v-if="isShowLoadMore" @click="loadMore">{{
        $t("languages.ClickToLoadMore")
      }}</span>
      <span class="text" v-if="isLoadAll">{{
        $t("languages.HasLoadedAllData")
      }}</span>
    </div>

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
      <TaskTransfer :userid="userid"></TaskTransfer>
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
      <UserInfo @closeDrawer="onCloseInfoModal" :onlyView="true"></UserInfo>
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, namespace } from "vuex-class";

import { mixins } from "vue-class-component";

import OrgMixins from "./mixins/org";

import OrgApi from "@/apis/organization";

import TaskTransfer from "../../components/organization/taskTransfer/index.vue";
import UserInfo from "../../components/organization/userInfo.vue";

@Component({
  name: "quitStaff",
  components: {
    TaskTransfer,
    UserInfo,
  },
})
export default class QuitStaff extends mixins(OrgMixins) {
  // 数据
  userList: any = [];

  curPage: number = 0;

  size: number = 40;

  isEmpty: boolean = false;

  isLoading: boolean = true;

  // 是否显示加载更多按钮
  isShowLoadMore: boolean = false;

  // 是否全部加载完
  isLoadAll: boolean = false;

  searchVal: string = "";

  mounted() {
    this.searchDemissionUsers();
  }

  async searchDemissionUsers() {
    const { curPage, size } = this;
    const params: Organization.searchResignUserParams = {
      page: curPage,
      size,
      wd: this.searchVal,
    };

    this.isLoading = true;

    const res: any = await OrgApi.searchDemissionUsers(params);

    this.isLoading = false;

    const { errcode, errmsg, data } = res;

    if (errcode === 0) {
      const { content } = data;
      this.isEmpty = data.totalElements <= 0;
      this.userList = this.userList.concat(content);
      this.userList.forEach((item: any, index: number) => {
        item.index = index + 1;
      });
      this.isShowLoadMore = this.userList.length < data.totalElements;
      this.isLoadAll = !this.isShowLoadMore;
    } else {
      this.$message.error(errmsg);
    }
  }

  // 搜索高亮
  filterTable() {
    this.searchVal = this.searchVal.trim();
    this.curPage = 0;
    this.userList = [];
    this.searchDemissionUsers();
  }

  clearSearchVal() {
    this.searchVal = "";
    this.curPage = 0;
    this.userList = [];
    this.searchDemissionUsers();
  }

  /**
   * 点击行，弹出人员信息
   * */
  onRowClick(record: any, index: number) {
    return {
      on: {
        click: () => {
          this.showInfoModal(record.id);
        },
      },
    };
  }

  loadMore() {
    this.curPage += 1;
    this.searchDemissionUsers();
  }
}
</script>
<style lang="less">
.quit-staff {
  padding: 16px 0 8px 0;
  margin: 0 26px;
  .table-wrap .scroll-bottom {
    .ant-table-body {
      max-height: calc(100vh - 261px) !important;
    }
  }
  .search__input {
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
    .ant-input-affix-wrapper {
      width: 300px;
      .seach-input.ant-input {
        padding-right: 52px;
      }
      .close-icon {
        color: rgba(0, 0, 0, 0.25);
        margin-right: 12px;
      }
    }
  }
  div.empty-box {
    text-align: center;
    .user-empty {
      margin: 0px auto;
      margin-top: 150px;
    }
  }
  .user-list {
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
      padding-left: 32px;
      &:first-child {
        padding-left: 16px;
        padding-right: 0;
      }
    }

    .cursor {
      cursor: pointer;
      .name-span {
        display: inline-block;
        max-width: 100px;
        height: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .star {
        color: #fadb14;
        margin-left: 8px;
        font-size: 14px;
      }
      .lock {
        margin-left: 8px;
      }
    }
    .highlight {
      color: @primary-color;
    }
  }
  /deep/ .ant-table-header {
    overflow-x: hidden;
    padding-bottom: 0px !important;
    margin-bottom: -20px !important;
    .ant-table-thead > tr > th {
      color: rgba(0, 0, 0, 0.65);
    }
  }
  /deep/ .ant-table-body {
    min-height: 43px;
    max-height: calc(100vh - 195px) !important;
    overflow-x: hidden !important;
    color: rgba(0, 0, 0, 0.85);
    p {
      margin-bottom: 0;
    }
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
</style>