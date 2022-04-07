<template>
  <a-drawer
    :title="modalTitle"
    width="850"
    placement="right"
    @close="cancel"
    :visible="showModal"
    :destroyOnClose="true"
  >
    <a-form
      class="add-department"
      labelAlign="left"
      :autoFormCreate="
        (form) => {
          this.form = form;
        }
      "
    >
      <template v-if="isLoading">
        <div class="loading-icon">
          <a-spin :tip="$t('languages.Apps.Loading')" />
        </div>
      </template>
      <div class="drawer-dept" v-show="!isLoading">
        <div class="drawer-dept-title">部门信息</div>
        <div class="drawer-dept-content">
          <a-form-item
            label="上级部门"
            fieldDecoratorId="department"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :fieldDecoratorOptions="rules.department"
            v-if="isHasParent"
          >
            <staff-selector
              :disabled="isSuperiorDeptEditable || !deptEdit"
              :options="deptOpts"
              :params="{ corpId: corpidAll, filterType: 'admin_corp' }"
            ></staff-selector>
          </a-form-item>

          <a-form-item
            label="部门名称"
            fieldDecoratorId="deptName"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :fieldDecoratorOptions="rules.deptName"
          >
            <a-input
              :disabled="isSuperiorDeptEditable || !deptEdit"
              class="dept__name"
              maxlength="50"
              placeholder="请输入名称"
            />
          </a-form-item>

          <a-form-item
            v-if="deptType === 1"
            label="部门主管"
            fieldDecoratorId="deptLeader"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <a-select
              allowClear
              showSearch
              :disabled="!deptEdit"
              placeholder="请选择"
              optionFilterProp="children"
            >
              <a-select-option
                v-for="(user, index) in orgUserList"
                :key="index"
                :value="user.userId"
                >{{ user.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </div>
        <div class="line"></div>
      </div>
      <div class="drawer-dept" v-show="!isLoading">
        <div class="drawer-dept-title">
          部门设置
          <a-tooltip title="设置后，本部门只会可被指定的部门/人员可见">
            <a-icon type="question-circle-o" />
          </a-tooltip>
        </div>
        <div class="drawer-dept-content">
          <a-form-item
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <span slot="label">
              部门可见性
              <a-tooltip
                title="设置后，本部门(包含子部门)只会被指定的部门/人员可见"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-radio-group v-model="deptParam.open">
              <a-radio class="radioStyle" value="ALL_VISIBLE"
                >所有人/部门可见</a-radio
              >
              <a-radio
                class="radioStyle"
                value="PART_VISIBLE"
                :style="deptParam.open === 'PART_VISIBLE' ? radioStyles : {}"
                >指定人/部门可见
                <div
                  v-if="deptParam.open === 'PART_VISIBLE'"
                  style="margin: 5px 0 0 24px"
                >
                  <staff-selector
                    :onlyForm="true"
                    v-model="selectDeptData"
                    :options="deptSelectorOpts"
                    @ok="handleSelectDept"
                    :params="{ sourceType: 'admin' }"
                  ></staff-selector>
                </div>
              </a-radio>
              <a-radio class="radioStyle" value="NOT_VISIBLE">均不可见</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <span slot="label">
              部门成员可见范围
              <a-tooltip
                title="设置后，本部门成员 (包含子部门)只能看到指定的部门/人员"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-radio-group v-model="deptParam.openUser">
              <a-radio class="radioStyle" value="ALL_VISIBLE">全部</a-radio>
              <a-radio class="radioStyle" value="ONLY_DEPT"
                >所在部门及下级部门</a-radio
              >
              <a-radio
                class="radioStyle"
                value="PRAT_VISIBLE"
                :style="
                  deptParam.openUser === 'PRAT_VISIBLE' ? radioStyles : {}
                "
                >指定人/部门
                <div
                  v-if="deptParam.openUser === 'PRAT_VISIBLE'"
                  style="margin: 5px 0 0 24px"
                >
                  <staff-selector
                    v-model="selectUserData"
                    :onlyForm="true"
                    :options="userSelectorOpts"
                    :params="{ sourceType: 'admin' }"
                    @ok="handleSelectUser"
                  ></staff-selector>
                </div>
              </a-radio>
              <a-radio class="radioStyle" value="ONESELF">仅自己</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
      </div>
    </a-form>
    <div class="drawer-dept-bottom">
      <template>
        <a-button style="margin-right: 8px" @click="cancel">取消</a-button>
        <a-button type="primary" @click="submit">确定</a-button>
      </template>
      <!-- <template v-else>
        <a-button style="margin-right: 8px" @click="cancel">关闭</a-button>
      </template> -->
    </div>
  </a-drawer>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { pattern, nameValidator } from "@/common/utils";

import { State, namespace } from "vuex-class";

import OrgApi from "@/apis/organization";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

@Component({
  name: "add-department",
  components: {
    StaffSelector,
  },
})
export default class AddDepartment extends Vue {
  // @UserModule.State('unitTitleObj') unitTitleObj: any;

  @Prop() value!: boolean;
  @Prop() unitTitleObj!: any;

  @Prop() deptType!: number; // 0：新增，1：编辑

  @Prop() corpId!: string; // corpid  新增部门只能展示当前组织下的部门

  @Prop() deptData!: any;
  get staffParams() {
    let { relatedOrgType, corpId } = this.unitTitleObj;

    return relatedOrgType === "MAIN"
      ? {}
      : { sourceType: "admin", corpId: corpId };
  }

  radioStyles = {
    height: "70px",
    marginBottom: "8px",
    marginRight: "0px",
  };

  isLoading: boolean = true;

  get corpidAll() {
    // return this.corpId;
    // 以下先保留
    if (this.deptType === 0) {
      return this.corpId;
    } else {
      return `${this.corpId}@@excludedeptid-${this.deptData.id}`;
    }
  }

  // 上级部门是否展示
  // 部门名称是否修改
  get isSuperiorDeptEditable() {
    if (this.deptType === 0) return false; // 新增的时候 可以编辑
    return this.deptData.isSelfMaintainRootNode;
  }

  // 是否有上级部门
  get isHasParent() {
    if (this.deptType === 0) return true;
    return !!this.deptData.parentId;
  }
  selectDeptData: any = [];
  selectUserData: any = [];

  showModal: boolean = false;

  modalTitle: string = "新建部门";

  orgUserList: any = [];

  params: any = {
    department: "",
    deptName: "",
    deptLeader: "",
  };

  form: any = {};

  formItemLayout: any = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 15,
    },
  };

  rules: any = {};

  deptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: "请选择",
    appManagerFilter: true,
    rootNode: [],
  };

  deptSelectorOpts = {
    showError: false,
  };

  userSelectorOpts = {
    showError: false,
  };

  selectorOpts = {
    selectOrg: true,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    showError: false,
    placeholder: "请选择人/部门",
  };

  cacheDeptId: string = ""; // 缓存上级部门id，用以判断是否修改了上级部门

  isSubmiting: boolean = false; // 请求是否加载中

  deptParam: any = {
    open: "ALL_VISIBLE",
    openUser: "ALL_VISIBLE",
  };

  deptEdit = false;

  beforeMount() {
    this.userSelectorOpts = Object.assign(
      this.userSelectorOpts,
      this.selectorOpts
    );
    this.deptSelectorOpts = Object.assign(
      this.deptSelectorOpts,
      this.selectorOpts
    );
    this.setRules();
  }

  setRules() {
    this.rules = {
      department: {
        rules: [
          {
            required: true,
            message: "上级部门不能为空",
          },
        ],
      },
      deptName: {
        rules: [
          {
            required: true,
            message: "部门名称不能为空",
          },
          {
            validator: nameValidator,
            maxLength: 50,
            message: this.$t("languages.Apps.AppNameRule"),
            // 仅限50个字符以内，并不能以空格开头
          },
        ],
      },
    };
  }

  async getOrgUserList(id: any) {
    const params = {
      deptId: id,
      page: 0,
      size: 10000, // 暂设10000条，加载全部数据
      filterType: "admin",
    };
    const res = await OrgApi.getOrgList(params);
    if (!res.errcode && res.data && res.data.content) {
      this.orgUserList = res.data.content;
    }
  }

  handleSelectDept(val: any) {
    this.deptSelectorOpts.showError = val && val.length > 0 ? false : true;
  }
  handleSelectUser(val: any) {
    this.userSelectorOpts.showError = val && val.length > 0 ? false : true;
  }

  selectDeptDataChangeString(list: any[]) {
    const str = list.map((i: any) => {
      return {
        id: i.id,
        name: i.name,
        unitType: i.unitType,
      };
    });
    return JSON.stringify(str);
  }

  submit() {
    const { isSubmiting } = this;
    if (isSubmiting) return;
    this.form.validateFields((err: any) => {
      if (!err) {
        const deptName = this.form.getFieldValue("deptName");
        const department = this.form.getFieldValue("department");
        const managerId = this.form.getFieldValue("deptLeader");
        if (
          this.deptParam.open === "PART_VISIBLE" ||
          this.deptParam.openUser === "PRAT_VISIBLE"
        ) {
          if (
            this.deptParam.open === "PART_VISIBLE" &&
            (!this.selectDeptData || this.selectDeptData.length <= 0)
          ) {
            this.deptSelectorOpts.showError = true;
            return;
          }
          if (
            this.deptParam.openUser === "PRAT_VISIBLE" &&
            (!this.selectUserData || this.selectUserData.length <= 0)
          ) {
            this.userSelectorOpts.showError = true;
            return;
          }
        } 
        if(this.deptParam.open !== "PART_VISIBLE"){
          this.selectDeptData = [];
        }
        if(this.deptParam.openUser !== "PRAT_VISIBLE"){
          this.selectUserData = [];
        }
        this.isSubmiting = true;
        const parentId =
          department && department.length ? department[0].id : "";

        console.log(this.deptData, "this.deptData");

        // 判断是否修改了上级部门
        const { cacheDeptId } = this;

        const isUpdateParentDept = cacheDeptId !== parentId;
        const scopeModel = {
          departmentId: this.deptData ? this.deptData.id : "",
          deptVisibleType: this.deptParam.open,
          deptVisibleScope: this.selectDeptDataChangeString(
            this.selectDeptData
          ),
          staffVisibleType: this.deptParam.openUser,
          staffVisibleScope: this.selectDeptDataChangeString(
            this.selectUserData
          ),
        };
        if (this.deptType === 1) {
          // 编辑部门接口
          const params: any = {
            parentId,
            name: deptName,
            managerId: managerId ? managerId : "",
            id: this.deptData ? this.deptData.id : "",
            corpId: this.deptData ? this.deptData.corpId : "",
            scopeModel: scopeModel,
          };
          OrgApi.updateDepartment(params).then((res: any) => {
            if (res.errcode) {
              this.$message.error(res.errmsg);
              return;
            }

            res.data.parentId = parentId; // 取页面上的id,防止后端缓存策略导致数据不正确

            res.data.id = params.id; // 取页面上的id,防止后端缓存策略导致数据不正确

            this.$message.success("编辑部门成功！");
            this.$emit("reloadTree", {
              data: res.data,
              type: "edit",
              isUpdateParentDept,
            });
            this.cancel();
          });
        } else {
          // 新增部门接口
          const params: any = {
            parentId,
            name: deptName,
            scopeModel: scopeModel,
          };
          OrgApi.addDepartment(params).then((res: any) => {
            this.isSubmiting = false;
            if (res.errcode) {
              this.$message.error(res.errmsg);
              return;
            }

            this.$message.success("创建部门成功！");

            res.data.parentId = parentId; // 取页面上的id,防止后端缓存策略导致数据不正确

            this.$emit("reloadTree", {
              data: res.data,
              type: "add",
              isUpdateParentDept,
            });
            this.cancel();
          });
        }
      }
    });
  }

  cancel() {
    this.isLoading = true;
    this.form.resetFields();
    this.deptParam = {
      open: "ALL_VISIBLE",
      openUser: "ALL_VISIBLE",
    };
    this.selectDeptData = [];
    this.selectUserData = [];
    this.$emit("input", false);
  }

  @Watch("value")
  async onValueChange(v: boolean) {
    this.deptOpts.deptEdit = this.deptType === 1 ? "edit" : "add";
    this.deptOpts.selectedDepId = this.deptData.id ? this.deptData.id : "";
    // console.log('add-department', this)
    this.showModal = v;
    if (!v) {
      this.isSubmiting = false;
      return;
    }
    if (this.deptType === 1) {
      this.modalTitle = "编辑部门";
      await this.getOrgUserList(this.deptData.id);
      this.deptEdit = this.deptData.relatedSyncType === "PUSH";
      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          const deptId = this.deptData.id ? this.deptData.id : "";

          const params = {
            deptId,
          };
          // 获取当前部门的部门主管
          OrgApi.searchDeptDetail(params).then((res: any) => {
            if (!res.errcode && res.data) {
              const detail = res.data;

              this.cacheDeptId = detail.parentId;
              this.deptParam = {
                open: detail.scopeModel
                  ? detail.scopeModel.deptVisibleType
                  : "ALL_VISIBLE",
                openUser: detail.scopeModel
                  ? detail.scopeModel.staffVisibleType
                  : "ALL_VISIBLE",
              };
              this.selectDeptData = detail.scopeModel
                ? JSON.parse(detail.scopeModel.deptVisibleScope)
                : [];
              this.selectUserData = detail.scopeModel
                ? JSON.parse(detail.scopeModel.staffVisibleScope)
                : [];
              this.form.setFieldsValue({
                deptName: detail.deptName,
                department: [
                  {
                    name: detail.parentName,
                    id: detail.parentId,
                    unitType: 1,
                  },
                ],
                deptLeader: detail.managerId ? detail.managerId : "",
              });
              setTimeout(() => {
                this.isLoading = false;
              }, 800);
            }
          });
        }
      });
    } else {
      this.deptEdit = true;
      this.modalTitle = "新建部门";
      this.cacheDeptId = this.unitTitleObj.id;
      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          this.deptParam = {
            open: "ALL_VISIBLE",
            openUser: "ALL_VISIBLE",
          };
          this.selectDeptData = [];
          this.selectUserData = [];
          this.form.setFieldsValue({
            department: [
              {
                name: this.unitTitleObj.name,
                id: this.unitTitleObj.id,
                unitType: 1,
              },
            ],
          });
          setTimeout(() => {
            this.isLoading = false;
          }, 800);
        }
      });
    }
  }
}
</script>

<style lang="less" scoped>
.loading-icon {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.drawer-dept {
  margin-bottom: 24px;
  padding-bottom: 50px;;
  .line {
    height: 1px;
    background: #e8e8e8;
  }
  .drawer-dept-title {
    font-size: 16px;
    color: #000000;
    font-weight: 600;
  }
  .drawer-dept-content {
    margin-top: 24px;
    margin-bottom: 24px;
    /deep/ .ant-radio-group {
      display: block;
    }
    .radioStyle {
      display: block;
      height: 30px;
      line-height: 30px;
      margin-bottom: 8px;
      margin-right: 0px;
    }
  }
}
.drawer-dept-bottom {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: center;
  z-index: 1;
}
</style>
