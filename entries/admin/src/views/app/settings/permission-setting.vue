
<template>
  <div class="permission-setting">
    <div class="header-bar">
      <h3 class="permisson-title" v-if="!isTabPane">{{ $t('languages.appSettings.permissionSetting') }}</h3>
      <div class="model-name-wrap" v-if="historyData && historyData.name && historyData.id">
        <span class="model-name" @click="viewModelSettings(historyData.id, historyData.name)">{{ historyData.name }}</span>
        <i class="icon aufontAll h-icon-all-close close" @click="clearHistoryName"></i>    
      </div>
    </div>

    <h4 style="padding: 0 24px;">{{ $t('languages.appSettings.VisibleRangeSetting') }}</h4>
    <div class="permission-setting__row">
      <div>{{ $t('languages.appSettings.AppVisibleRange') }}：</div>
      <div>
        <a-radio-group v-model="visibleType" @change="onVisibleTypeChange">
          <a-radio :value="1">{{ $t('languages.appSettings.AllUserVisible') }}</a-radio>
          <a-radio :value="2">{{ $t('languages.appSettings.AccessByGroup') }}</a-radio>
        </a-radio-group>
        <div
          class="desc"
          v-show="visibleType === 1"
        >{{ $t('languages.appSettings.AllUserCanViewSelfDataAndModify') }}</div>
      </div>
    </div>

    <div v-show="visibleType === 2" class="overflow__x">
      <div class="flex__title">
        <h4>{{ $t('languages.appSettings.PermissionGroupSetting') }}</h4>
        <div class="actions">
          <div class="handle-add" @click="handleAdd">
            <i class="icon aufontAll h-icon-all-plus-o"></i>
            {{ $t('languages.appSettings.AddPermissionGroup') }}
          </div>
        </div>
      </div>

      <a-table :columns="columns" :dataSource="data" :pagination="false" rowKey="id">
        <template slot="externalUser" slot-scope="text, record">
          <a-switch disabled :checked="record.externalUser" />
        </template>

        <template slot="operation" slot-scope="text, record">
          <!-- 编辑权限组 -->
          <a-icon type="edit" @click="() => handleEdit(record.id)" />
          <!-- 模型设置 -->
          <a-icon type="setting" @click="() => viewModelSettings(record.id, record.name)" />
          <!-- 删除权限组 -->
          <a-popconfirm
            :title="$t('languages.appSettings.ConfirmDelete')"
            :okText="$t('languages.appSettings.OK')"
            :cancelText="$t('languages.appSettings.cancel')"
            placement="left"
            @confirm="() => handleDelete(record.id)"
          >
            <a-icon type="delete" />
          </a-popconfirm>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑权限组 -->
    <permission-group-modal @modifyDone="onFormOk" :groupId="groupId" @change="handleModalChange" v-model="showForm" ></permission-group-modal>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { State, namespace } from 'vuex-class';
import { Drawer } from '@h3/antd-vue';
import permissionApi from '@/apis/system/permission.api';

import PermissionGroupForm from '@/components/apps/settings/permission-group-form.vue';
import PermissionGroupModal from './components/permission-group-modal.vue'

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'permission-setting',
  components: {
    ADrawer: Drawer,
    PermissionGroupForm,
    PermissionGroupModal
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      (vm as PermissionSetting).load();
    });
  },

  beforeRouteUpdate(to, from, next) {
    const vm = this as PermissionSetting;
    // vm.clean();
    next();
    vm.load();
  }
})
export default class PermissionSetting extends Vue {
  @AppCenterModule.State('appInfo') appInfo: any;

  @Prop() isTabPane?: boolean;

  @Prop() historyData?: any

  groupId = '';

  showForm = false;

  visibleType = 1;

  columns: any[] = [];

  data: BPM.System.PermissionGroupModel[] = [];

  setColumns() {
    this.columns = [
      {
        title: this.$t('languages.appSettings.index') as string,
        dataIndex: 'index',
        width: 70
      },
      {
        title: this.$t('languages.appSettings.name') as string,
        dataIndex: 'name',
        width: 158
      },
      {
        title: this.$t('languages.appSettings.departmentsOrg') as string,
        dataIndex: 'departments',
        width: 162
      },
      {
        title: this.$t('languages.appSettings.roles') as string,
        dataIndex: 'roles',
        width: 202
      },
      {
        title: this.$t('languages.appSettings.externalUser') as string,
        dataIndex: 'externalUser',
        scopedSlots: { customRender: 'externalUser' },
        width: 140
      },
      {
        title: this.$t('languages.appSettings.operation') as string,
        dataIndex: 'operation',
        scopedSlots: { customRender: 'operation' },
        width: 140
      }
    ];
  }

  load() {
    const hideLoader = (this.$message as any).loading();

    const appCode = this.$route.params.appCode || this.appInfo.code;

    permissionApi.getAppPackage(appCode).then((res) => {
      hideLoader();
      if (res.data) {
        const data = res.data.permissionGroups;

        this.visibleType = res.data.visibleType;

        data.forEach((item: any, i) => {
          item.index = i + 1;

          if (item.departments) {
            item.departments = JSON.parse(item.departments).map((x: any) => x.name).join('、');
          }

          if (item.roles) {
            item.roles = JSON.parse(item.roles).map((x: any) => x.name).join('、');
          }

          // item.externalUser = item.externalUser ? '开' : '关';

          Object.entries(item).forEach((d: any) => {
            const [key, value] = d;
            if (typeof value !== 'boolean' && !value) {
              item[key] = '- -';
            }
          });
        });

        this.data = data;
      }
    });
  }

  handleAdd() {
    this.groupId = '';
    this.showForm = true;
  }

  handleEdit(groupId: string) {
    this.groupId = groupId;
    this.showForm = true;
  }

  viewModelSettings(groupId: string, name: any) {
    this.groupId = groupId
    this.$emit('viewModelSettings', true, this.groupId, name)
  }

  handleDelete(groupId: string) {
    permissionApi.deleteGroup(groupId).then((res) => {
      if (res.errcode === 0) {
        this.load();
        let that = this;
        setTimeout(function () {
          that.$message.success('已删除');
        }, 500);
      } else {
        this.$message.error('删除失败');
      }
    });
  }


  clearHistoryName() {
    this.$emit('clearHistoryName', '')
  }

  onFormOk() {
    this.showForm = false;
    this.load();
  }

  onVisibleTypeChange(e: any) {
    const type = e.target.value;
    const params = {
      appCode: this.$route.params.appCode || this.appInfo.code,
      visibleType: type
    };
    permissionApi.updateAppPackage(params);
  }

  handleModalChange(e) {
    this.groupId = ''
    this.showForm = e
  }

  mounted() {
    this.setColumns();
    if (!this.data.length) {
      this.load();
    }
  }
}
</script>


<style lang="less" scoped>
@import "~@/components/shared/ant-table.less";

.permission-setting {
  text-align: left;
  padding: 0;
  margin-bottom: 24px;
  color: rgba(0, 0, 0, 0.65);
  overflow: auto;
  height: 100%;
  .permission-setting__row {
    padding: 0 24px;
  }
  .permisson-title {
    font-size: 18px;
    font-weight: bolder;
    color: #17BC94;
    border-bottom: 2px solid #17BC94;
    line-height: 59px;
    height: 59px;
    padding: 0 24px;
    cursor: pointer;
  }

  .overflow__x {
    overflow-x: auto;
    padding: 0 24px;
    .flex__title {
      display: flex;
      justify-content: space-between;
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 500;
    color: #000;
    height: 64px;
    line-height: 64px;
    // padding-top: 20px;
    // padding-bottom: 10px;
    // border-bottom: 1px solid #e8e8e8;
  }
  // /deep/.ant-table-thead span {
  //   font-weight: 600;
  //   color: rgba(0,0,0,0.65);
  // }
  /deep/.ant-table-body {
    color: rgba(0, 0, 0, 0.85);
  }

  h4 {
    font-weight: 500;
    color: #000;
    margin-bottom: 1em;
    margin-top: 24px;
  }

  .actions {
    text-align: center;
    margin-top: 14px;
    margin-right: 8px;
    // height: 80px;
    // padding-bottom: 16px;
    // & > button {
    //   border: 0;
    // }
    .handle-add {
      color: @primary-color;
      text-align: center;
      margin-top: 8px;
      user-select: none;
      cursor: pointer;
      margin-bottom: 20px;
    }
  }

  i.anticon {
    font-size: 16px;
    margin-right: 17px;
    cursor: pointer;
  }

  &__row {
    display: flex;
  }
  .desc {
    padding-top: 4px;
  }
}

.desc {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.header-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  .model-title {
    font-size: 18px;
    font-weight: bolder;
    padding: 15px 24px;
    color:rgba(0, 0, 0, 0.65);
    cursor: pointer;
  }
}
.model-name-wrap {
  height: 58px;
  line-height: 58px;
  .model-name {
    font-size: 18px;
    font-weight: bolder;
    margin-left: 20px;
    margin-right: 8px;
    cursor: pointer;
  }
  .close {
    cursor: pointer;
    font-size: 18px;
    color: #AAA;
  }
}
</style>

<style lang="less">
.permission-group-drawer {
  .ant-drawer-title {
    font-weight: 600;
  }
  .ant-drawer-body {
    height: calc(100% - 57px - 52px);
    padding: 24px !important;
  }
  .ant-drawer-wrapper-body{
    overflow: inherit!important;
  }
  .ant-drawer-body{
    overflow: scroll;
  }
}
</style>
