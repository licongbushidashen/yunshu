<template>
  <div>
    <a-modal
      v-model="showModal"
      title="组织同步"
      :width="554"
      :destroyOnClose="true"
      okText="立即同步"
      cancelText="取消"
      @ok="submit"
      @cancel="cancel"
      :maskClosable="false"
      :keyboard="false"
    >
      <a-form class="orgsync-form" :form="form">
        <a-form-item
          label="同步组织"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-select
            v-model="form.corpId"
            placeholder="请选择"
            @change="selectOrgSync"
          >
            <a-select-option
              v-for="(item, index) in orgSelectOptions"
              :key="index"
              :value="item.corpId"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </a-form-item>

        <a-form-item
          label="同步方式"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-radio-group
            class="form-item-control"
            v-model="form.syncMethod"
            @change="toggleSyncMethod"
          >
            <a-radio :value="1">全量同步</a-radio>
            <a-radio v-if="!hidePartSync" :value="2">部分同步</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          label="同步部门"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          v-if="isShowDepartment"
          :class="{ 'has-error': departmentError }"
        >
          <div class="orgsync-form-select-wrapper">
            <a-tree-select
              :treeData="treeData"
              style="width: 100%"
              dropdownClassName="orgsync-form-tree-select"
              class="orgsync-form-item"
              v-model="form.departments"
              :treeExpandedKeys="treeExpandedKeys"
              placeholder="请选择"
              :treeCheckable="true"
              treeCheckStrictly
              labelInValue
              @treeExpand="onTreeExpand"
            >
            </a-tree-select>
          </div>
          <div class="ant-form-explain" v-if="departmentError">
            同步部门不能为空
          </div>
        </a-form-item>
        <div class="flex">
          <a-form-item
            class="form-item-no-label one"
            v-if="isSyncRoleScopeCheckboxShow"
            :wrapperCol="formItemLayout.wrapperColNoLabel"
          >
            <a-checkbox v-model="form.isSyncRoleScope"
              >同步角色管理范围</a-checkbox
            > </a-form-item
          ><a-form-item
            class="form-item-no-label two"
            v-if="shwoDept"
            :wrapperCol="formItemLayout.wrapperColNoLabel"
            ><a-checkbox v-model="form.isSyncDeptSetting"
              >部门查看权限</a-checkbox
            >
          </a-form-item>
        </div>
        <div style="margin-top: 16px">
          <a-alert
            v-if="form.isSyncRoleScope && !form.isSyncDeptSetting"
            type="warning"
            show-icon
            message="同步后，钉钉组织架构内的角色管理权限将被覆盖，请谨慎选择"
          />
          <a-alert
            v-else-if="form.isSyncDeptSetting && !form.isSyncRoleScope"
            type="warning"
            show-icon
            message="同步后，钉钉组织架构内的部门查看权限将被覆盖，请谨慎选择"
          />
          <a-alert
            v-if="form.isSyncDeptSetting && form.isSyncRoleScope"
            type="warning"
            show-icon
            message="同步后，钉钉组织架构内的角色管理和部门查看权限将被覆盖，请谨慎选择"
          />
        </div>
      </a-form>
    </a-modal>

    <a-modal
      width="422px"
      title="提示"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible = !visible"
      okText="前往配置"
      cancelText="暂不配置"
      class="config-tips"
      :maskClosable="false"
      :keyboard="false"
    >
      <p>钉钉信息未配置，无法同步</p>
      <p>
        请前往
        <span class="heighlight">系统管理-常规设置</span> 配置钉钉信息
      </p>
    </a-modal>
    <a-modal
      width="520px"
      title
      :visible="showErrorTip"
      class="error-tips"
      :maskClosable="false"
      :keyboard="false"
      :closable="false"
    >
      <div class="error-top">
        <i
          class="icon aufontAll h-icon-all-exclamation-circle icon-warning"
        ></i>
        <span class="error-title">部分同步成功，以下数据有异常，请处理</span>
      </div>
      <div class="error-content">
        <ul>
          <li v-for="(data, index) in errorData" :key="index">
            <div class="dot"></div>
            <span>{{ data }}</span>
          </li>
        </ul>
      </div>
      <template slot="footer">
        <a-button
          key="print"
          type="primary"
          @click="showErrorTip = !showErrorTip"
          >确定</a-button
        >
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from "vue-property-decorator";
import { TreeSelect, notification, message } from "@h3/antd-vue";

import { State, namespace } from "vuex-class";

import OrgApi from "@/apis/organization";
import Bus from "@/utils/bus";

@Component({
  name: "orgsync-form",
})
export default class orgsyncForm extends Vue {
  showModal: boolean = false;
  isShowDepartment: boolean = false;
  treeExpandedKeys: string[] = [];
  orgSelectOptions: any = []; // 同步组织下拉选项
  visible: boolean = false;
  showErrorTip: boolean = false;
  departmentError: boolean = false;
  errorData: any = [];
  isSyncRoleScopeCheckboxShow: boolean = false; // 是否显示同步角色管理范围选项【钉钉组织显示】

  // 表单数据
  form: any = {
    corpId: "", // 组织机构ID
    syncMethod: 1, // 同步方式
    departments: [], // 组织部门
    isSyncRoleScope: false, // 同步角色管理范围
    isSyncDeptSetting: false,
  };

  formItemLayout: any = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 20,
    },
    wrapperColNoLabel: {
      span: 20,
      offset: 4,
    },
  };

  hidePartSync: boolean = false;

  shwoDept: boolean = false;

  SyncInterval: any = null;

  SyncLoading: any = null;

  syncLoadingStatus: boolean = false;

  // 同步部门的数据
  treeData: Array<Organization.treeData> = [];
  showParent: any = (TreeSelect as any).SHOW_PARENT;

  @Model("change") value!: boolean;

  @Watch("value")
  onValueChange(v: boolean) {
    this.showModal = v;
    this.isShowDepartment = false;

    if (v) {
      this.getOrgsyncList();
    } else {
      this.resetData();
    }
  }

  @Watch("form.syncMethod")
  onSyncMethodChange(syncMethod) {
    syncMethod === 1
      ? (this.isShowDepartment = false)
      : (this.isShowDepartment = true);
  }

  @Watch("form.departments")
  onDepartmentsChange(newValue: Array<object>, oldValue: Array<object>) {
    // 同步部门为空时，显示提示信息
    if (this.departmentError) {
      if (newValue.length) {
        this.departmentError = false;
      } else {
        this.departmentError = true;
      }
    }

    // 勾选中自动展开下一级
    let department: any = {};

    if (newValue.length > oldValue.length) {
      department = newValue[newValue.length - 1] as any;
    } else {
      department = this.getUnCheckDepartment(newValue, oldValue);
    }

    if (!department.value) return;

    const parseValue: any = JSON.parse(department.value);

    const value: string = parseValue.value;
    const hasChild: boolean = parseValue.hasChild;
    !this.treeExpandedKeys.includes(value) &&
      hasChild &&
      this.treeExpandedKeys.push(value);
  }

  /**
   * 重新组装树需要的数据
   */
  reRenderTreeData(data: any) {
    const res: any = data instanceof Array ? [] : {};

    for (let key in data) {
      if (!data[key]) continue;

      if (!data.hasOwnProperty(key)) continue;

      if (typeof data[key] === "object") {
        res[key] = this.reRenderTreeData(data[key]);
      } else {
        if (key === "name") res["title"] = data[key];

        if (key === "id") {
          const value: any = {
            value: data[key],
            corpId: data["corpId"],
            parentid: data["parentid"],
          };

          if (data.children && data.children.length) {
            value.hasChild = true;
          } else {
            value.hasChild = false;
          }

          res["key"] = data[key];
          res["value"] = JSON.stringify(value);
        }
      }
    }

    return res;
  }

  /**
   * 单击三角符展开树
   */
  onTreeExpand(expandedKeys) {
    this.treeExpandedKeys = expandedKeys;
  }

  /**
   * 切换同步组织
   */
  selectOrgSync(value: string, option: any) {
    const arr = this.orgSelectOptions.filter((i) => i.corpId === value);
    arr && arr[0] && arr[0].relatedType === "DINGTALK"
      ? (this.shwoDept = true)
      : (this.shwoDept = false);
    this.form.isSyncDeptSetting = false;
    this.resetDepartment();
  }

  /**
   * 切换同步方式
   */
  toggleSyncMethod(e) {
    if(this.form.syncMethod === 1){
      this.getOrgsyncList();
    } else{
      this.orgSelectOptions = this.orgSelectOptions.filter((i) => i.relatedType !== "CUSTOMIZE");
    }
    this.resetDepartment();
  }

  /**
   * 重置同步部门
   */
  resetDepartment() {
    if (this.form.syncMethod === 1) return;
    this.form.departments = [];
    this.treeExpandedKeys = [];
    this.loadDepartmentByCorpId();
  }

  /**
   * 清空data数据
   */
  resetData() {
    this.treeExpandedKeys = [];
    this.orgSelectOptions = []; // 同步组织列表
    this.errorData = [];
    this.departmentError = false;

    this.form = {
      corpId: "", // 组织机构ID
      syncMethod: 1, // 同步方式
      departments: [], // 组织部门
      isSyncRoleScope: false, // 同步角色管理范围
      isSyncDeptSetting: false,
    };
  }

  /**
   * 获取全量同步的参数
   */
  getRelatedId() {
    let id: string = "";

    for (let i = 0, len = this.orgSelectOptions.length; i < len; i++) {
      if (this.orgSelectOptions[i].corpId !== this.form.corpId) continue;
      id = this.orgSelectOptions[i].id;
      break;
    }

    return id;
  }

  /**
   * 获取部分同步的参数
   */
  getPartSyncParams() {
    const res: Array<Organization.partSyncParams> = [];
    const departments = this.form.departments;

    for (let i = 0, len = departments.length; i < len; i++) {
      const value = JSON.parse(departments[i].value);
      const item: any = {
        parentId: value.parentid,
        id: value.value,
        isSyncRoleScope: this.fnFormatSyncRoleScope(),
        isSyncDeptSetting: this.form.isSyncDeptSetting ? 1 : 0,
      };

      if (i === 0) item.corpId = value.corpId;

      res.push(item);
    }

    return res;
  }

  /**
   * 通过组织的corpId加载所有同步部门
   */
  async loadDepartmentByCorpId() {
    const res: any = await OrgApi.getDepartmentByCorpId({
      corpId: this.form.corpId,
    });

    if (res.errcode === 0) {
      this.treeData = this.reRenderTreeData(res.data);
    } else {
      this.$message.error(res.errmsg);
    }
  }

  /**
   * 获取钉钉关联组织列表
   */
  async getOrgsyncList() {
    const res: any = await OrgApi.orgSyncCheck();

    if (res.errcode && res.errcode !== 0) {
      this.$message.error("同步组织接口错误");
      return;
    }

    if (res.data && res.data.length === 0) {
      this.$message.error("配置错误，请检查配置");
      return;
    }

    if (res.data && res.data.length !== 0) {
      let selectList = {};
      this.orgSelectOptions = [];

      res.data.forEach((r: any) => {
        selectList = {
          id: r.id,
          name: r.name,
          corpId: r.corpId,
          relatedType: r.relatedType,
        };

        this.orgSelectOptions.push(selectList);
      });

      if(!this.form.corpId){
        // 默认选中第一项
        this.form.corpId = this.orgSelectOptions[0].corpId;
        this.shwoDept = this.orgSelectOptions[0].relatedType === "DINGTALK" ? true : false;
      }else{
        let orgSelectOptionsItem = this.orgSelectOptions.find((o:any) => o.corpId === this.form.corpId);
        this.shwoDept = orgSelectOptionsItem[0].relatedType === "DINGTALK" ? true : false;
      }
    }
  }

  /**
   * 立即同步，提交表单
   */
  async submit() {
    console.log(this.form.syncMethod, 'this.form.syncMethod');
    let params: any = this.form.syncMethod === 1 ? {} : [];
    this.$emit("handleClose", false);
    // 1 全量同步 2 部分同步
    if (this.form.syncMethod === 2) {
      // 如果为部分同步，并且同步部门为空，则显示提示信息
      if (this.form.departments.length === 0) {
        this.departmentError = true;
        return;
      }
      params = this.getPartSyncParams();
      await this.startPartSync(params)
    } else if (this.form.syncMethod === 1) {
      params.isSyncDeptSetting = this.form.isSyncDeptSetting ? 1 : 0;
      params.relatedId = this.getRelatedId();
      // 是否同步角色管理范围
      params.isSyncRoleScope = this.fnFormatSyncRoleScope();
      await this.startAllSync(params);
    }
    // let params: any = this.form.syncMethod === 1 ? {} : [];

    // 如果为部分同步，并且同步部门为空，则显示提示信息
    // if (this.form.syncMethod === 2 && this.form.departments.length === 0) {
    //   this.departmentError = true;
    //   return;
    // }

    // const loading = this.$message.loading("组织同步中", 0) as any;
    // const loading = message.loading({
    //   content: '组织同步中',
    //   duration: 0,
    // }) as any;
    // this.$emit("change", false);
    // if (this.form.syncMethod === 1) {
    //   params.isSyncDeptSetting = this.form.isSyncDeptSetting ? 1 : 0;
    //   params.relatedId = this.getRelatedId();
    //   // 是否同步角色管理范围
    //   params.isSyncRoleScope = this.fnFormatSyncRoleScope();
    // } else {
    //   params = this.getPartSyncParams();
    // }
    // await this.getOrgsync(params);
    // this.$emit("handleClose", true);
    // loading();
  }

  // 全量同步
  async startAllSync(params:any) {
    notification.destroy();
    this.$emit("change", false);
    const config:any = {
      message: '组织同步中',
      description: '',
      duration: 0,
      closeIcon: h => {
        return h(
            'span',
        );
      },
      icon: h => {
        return h(
            'a-icon',
            {
              props: {
                type: 'loading',
              },
            },
        );
      },
      class: 'aync-notification-loading',
      placement: 'bottomLeft'
    }
    notification.open(config);
    const res:any = await OrgApi.allSynchronize(params);
    if (res.errcode === 0) {
      (window as any).localStorage.removeItem('syncTaskId');
      if (res.data) {
        // 设置本地同步id
        (window as any).localStorage.setItem('syncTaskId', res.data);
        await this.getOrgAllSyncOnce(res.data);
      } else {
        notification.destroy();
        notification['success']({
          message: '同步成功',
          description: '',
          duration: 3,
          class: 'aync-notification',
          placement: 'bottomLeft'
        });
        return;
      }
    } else {
      notification.destroy();
      notification['error']({
        message: '同步失败,请重新尝试',
        description: '',
        duration: 3,
        class: 'aync-notification',
        placement: 'bottomLeft'
      });
      return;
    }
  }

  // 全量同步，发起请求
  async getOrgAllSync(taskId:string) {
    const taskStatus:any = await OrgApi.synchronizeStatus({ taskId });
    const that = this as any;
    if (taskStatus.errcode === 0) {
      (window as any).localStorage.removeItem('syncTaskId');
      that.$emit("handleClose", true);
      notification.destroy();
      notification['success']({
        message: '组织同步已完成',
        description: '',
        duration: 10000,
        class: 'aync-notification',
        placement: 'bottomLeft',
        onClose: () => {
          notification.destroy();
        }
      });
      return;
    } else if (taskStatus.errcode === 999998) {
      that.syncLoadingStatus = true;
      that.$emit("handleClose", false);
      console.log(taskStatus, 'taskStatus-2');
    }
    else {
      that.$emit("handleClose", true);
      that.SyncLoading = null;
      notification.destroy();
      notification['error']({
        message: '同步失败,请重新尝试',
        description: '',
        duration: 3,
        class: 'aync-notification',
        placement: 'bottomLeft',
        onClose: () => {
          that.SyncLoading = null;
        }
      });
      return;
    }
  }

  // 全量同步，发起一次请求后 设置定时器轮循请求
  async getOrgAllSyncOnce(taskId:string) {
    const taskStatus:any = await OrgApi.synchronizeStatus({ taskId });
    if (taskStatus.errcode === 999998) {
      this.$emit("handleClose", false);
      this.syncLoadingStatus = true;
      this.simulateSync();
    } else if (taskStatus.errcode === 0) {
      this.$emit("change", true);
      notification.destroy();
      notification['success']({
        message: '组织同步已完成',
        description: '',
        duration: 10000,
        class: 'aync-notification',
        placement: 'bottomLeft'
      });
      return;
    } else {
      this.$emit("handleClose", true);
      notification.destroy();
      notification['error']({
        message: '组织同步失败',
        description: '',
        duration: 2,
        class: 'aync-notification',
        placement: 'bottomLeft'
      });
      return;
    }
  }

  // 立即同步，发起请求
  async getOrgsync(param: any) {
    let res: any = {};
    try {
      res = this.form.syncMethod === 1 ?
          await OrgApi.allSynchronize(param) :
          await OrgApi.partSynchronize(param);
    } catch (e) {
      return;
    }

    if (res.errcode === 0) {
      // this.$message.success(res.errmsg, 2);
      notification['success']({
        message: '组织同步已完成',
        description: '',
        duration: 10000,
        class: 'aync-notification',
        placement: 'bottomLeft'
      });
      return;
    }

    if (res.errcode === 10026) {
      if (res.data && typeof res.data === "object") {
        const dataArr = Object.entries(res.data);

        dataArr.forEach((d: any) => {
          if (!d && !d[0] && !d[1]) {
            return;
          }

          const [key, value] = d;
          this.errorData.push(value);
        });

        this.showErrorTip = true;
      }
    } else if (+res.errcode === 10021) {
      this.visible = true;
    } else {
      // this.$message.error(res.errmsg, 2);
      notification['error']({
        message: res.errmsg,
        description: '',
        duration: 3,
        class: 'aync-notification',
        placement: 'bottomLeft'
      });
    }
  }

  // 部分同步
  async startPartSync(params:any) {
    this.$emit("handleClose", false);
    const config:any = {
      message: '组织同步中',
      description: '',
      duration: 0,
      closeIcon: h => {
        return h(
            'span',
        );
      },
      icon: h => {
        return h(
            'a-icon',
            {
              props: {
                type: 'loading',
              },
            },
        );
      },
      class: 'aync-notification-loading',
      placement: 'bottomLeft',
      onClose: () => {}
    }
    notification.open(config);
    this.$emit("change", false);
    params = this.getPartSyncParams();
    await this.getOrgPartSync(params);
    this.$emit("handleClose", true);
    // loading();

  }

  // 部分同步 立即同步，发起请求
  async getOrgPartSync(param: any) {
    (window as any).localStorage.setItem('orgPartSync', 'orgPartSync');
    let res: any = {};
    try {
      res = await OrgApi.partSynchronize(param);
    } catch (e) {
      return;
    }

    if (res.errcode === 0) {
      (window as any).localStorage.removeItem('orgPartSync');
      notification.destroy();
      notification['success']({
        message: '组织同步已完成',
        description: '',
        duration: 10000,
        class: 'aync-notification',
        placement: 'bottomLeft'
      });
      return;
    }

    if (res.errcode === 10026) {
      (window as any).localStorage.removeItem('orgPartSync');
      if (res.data && typeof res.data === "object") {
        const dataArr = Object.entries(res.data);

        dataArr.forEach((d: any) => {
          if (!d && !d[0] && !d[1]) {
            return;
          }

          const [key, value] = d;
          this.errorData.push(value);
        });

        this.showErrorTip = true;
      }
    } else if (+res.errcode === 10021) {
      (window as any).localStorage.removeItem('orgPartSync');
      this.visible = true;
    } else {
      (window as any).localStorage.removeItem('orgPartSync');
      notification.destroy()
      // this.$message.error(res.errmsg, 2);
      notification['error']({
        message: res.errmsg,
        description: '',
        duration: 3,
        class: 'aync-notification',
        placement: 'bottomLeft'
      });
    }
  }

  // 获取同步状态 定时器
  simulateSync() {
    const that = this as any;
    that.SyncInterval = setInterval(() => {
      const taskId:any = (window as any).localStorage.getItem('syncTaskId');
      if (taskId) {
        that.getOrgAllSync(taskId);
      } else {
        clearInterval(that.SyncInterval);
      }
    }, 1000 * 5);
  }

  /**
   * 获取去掉勾的选项
   */
  getUnCheckDepartment(newValue: Array<any>, oldValue: Array<any>) {
    let res: any = {};

    // ;
    for (let i = 0, len = oldValue.length; i < len; i++) {
      const oValue: string = JSON.parse(oldValue[i].value).value;

      for (let k = 0, ken = newValue.length; k < ken; k++) {
        const nValue: string = JSON.parse(newValue[k].value).value;

        if (oValue === nValue) break;

        if (k >= ken - 1) {
          res = oldValue[i];
          break;
        }
      }

      if (res.value) break;
    }

    return res;
  }

  /**
   * 关闭弹窗
   */
  cancel() {
    this.$emit("change", false);
  }

  /**
   *  未配置钉钉信息
   */
  handleOk() {
    this.$router
      .push({
        name: "commonSetting",
      })
      .catch((err: any) => {
        err;
      });
  }

  /**
   * 判断是否显示同步角色管理范围选项
   */
  @Watch("form.corpId")
  fnIsSyncRoleScopeCheckboxShow() {
    const selectedOrgObj = this.orgSelectOptions.filter((item) => {
      return item.corpId === this.form.corpId;
    })[0];
    if(selectedOrgObj && selectedOrgObj.relatedType === "CUSTOMIZE") {
      this.hidePartSync = true
    }else {
      this.hidePartSync = false
    }
    if (selectedOrgObj && selectedOrgObj.relatedType === "DINGTALK") {
      this.isSyncRoleScopeCheckboxShow = true;
    } else {
      this.isSyncRoleScopeCheckboxShow = false;
      this.isSyncRoleScopeClean();
    }
  }

  /**
   * 角色管理范围参数切换清理
   */
  isSyncRoleScopeClean() {
    this.form.isSyncRoleScope = false;
  }

  /**
   * 格式化同步角色管理范围参数
   */
  fnFormatSyncRoleScope() {
    return this.form.isSyncRoleScope ? 1 : 0;
  }

  created() {
    message.config({
      getContainer: () => (document as any).getElementById('app'),
      duration: 0,
      maxCount: 1,
    });
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-form-item {
  margin-bottom: 16px !important;
}
.config-tips {
  p {
    margin-bottom: 8px;
    .heighlight {
      color: @primary-color;
    }
  }
}
.error-tips {
  .ant-modal-footer {
    border-top: none;
    padding-top: 0;
  }
  .error-top {
    margin-top: 8px;
    margin-left: 8px;
    .icon-warning {
      color: #faad14;
      font-size: 22px;
    }
    .error-title {
      display: inline-block;
      font-size: 16px;
      font-family: "PingFangSC-Medium";
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      line-height: 24px;
      margin-left: 16px;
      vertical-align: text-bottom;
    }
  }
  .error-content {
    margin: 10px 8px 0 8px;
    background: #fffbe6;
    max-height: 260px;
    overflow: auto;
    border: 1px solid #ffe58f;
    padding: 12px;
    border-radius: 4px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    .dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      margin-right: 8px;
      vertical-align: middle;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
    }
  }
}
</style>

<style lang="less">
.orgsync-form {
  /deep/.ant-alert-message {
    color: rgba(0, 0, 0, 0.65);
  }
  .ant-form-explain {
    margin-top: 5px;
  }

  .orgsync-form-select-wrapper {
    box-sizing: border-box;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-top-width: 1.02px;
    border-radius: 4px;
    outline: none;
    overflow: hidden;
    -webkit-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

    .orgsync-form-item {
      .ant-select-selection {
        max-height: 120px;
        overflow: hidden;
        overflow-y: auto;

        box-sizing: inherit;
        background-color: #fff;
        border: none;
        transition: none;
      }
    }
  }
}

.orgsync-form-tree-select {
  max-width: 380px;

  &.ant-select-tree-dropdown {
    max-height: 280px !important;
  }
  .ant-select-tree li span.ant-select-tree-checkbox {
    display: inline-block;
  }
  .ant-select-tree
    li
    span.ant-select-tree-checkbox
    + .ant-select-tree-node-content-wrapper {
    width: calc(100% - 46px);
  }
  .ant-select-tree
    > .ant-select-tree-treenode-checkbox-checked
    > .ant-select-tree-node-content-wrapper,
  .ant-select-tree-child-tree
    .ant-select-tree-treenode-checkbox-checked
    .ant-select-tree-node-content-wrapper {
    background: none !important;
    font-weight: normal;
  }

  .ant-select-tree-title {
    max-width: 90%;
    overflow: hidden;
    display: inline-block;
    vertical-align: middle;
    text-overflow: ellipsis;
  }

  .ant-select-tree-node-content-wrapper {
    background-color: #ffffff !important;
  }
  .ant-select-tree-node-content-wrapper:after {
    content: "";
    display: none !important;
  }
}
.aync-notification,.aync-notification-loading{
  padding: 8px 10px;
  width: 250px;
  max-width: 400px;
  .ant-notification-notice-description{
    display: none;
  }
  .ant-notification-notice-icon{
    font-size: 14px;
    line-height: 28px;
  }
  .ant-notification-close-icon{
    font-size: 12px;
    color: rgba(0,0,0,0.45);
  }
  .ant-notification-notice-close{
    line-height: 12px;
    top: 13px;
    right: 12px;
  }
  .ant-notification-notice-message{
    font-size: 14px;
    word-break: break-all;
    color: rgba(0,0,0,.85);
    margin-bottom: 0;
    margin-left: 24px;
  }
}
.aync-notification-loading{
  width: 140px;
  max-width: 200px;
  .anticon-loading{
    color: #2970FF;
  }
  .ant-notification-notice-message{
    line-height: 28px;
  }
  .ant-notification-notice-close{
    display: none;
  }
  .ant-notification-close-x{
    display: none;
  }
}
</style>

<style lang="less" scoped>
.flex {
  display: flex;
  .one {
    width: 40%;
    margin-left: 42px;
  }
  .two {
    width: 40%;
  }
}
.form-item-no-label {
  margin-left: -7px;
  margin-bottom: 0 !important;
  /deep/.ant-form-item-control {
    line-height: 15px !important;
  }
}
.form-item-control {
  line-height: 32px;
}
</style>
