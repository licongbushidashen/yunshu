<template>
  <div v-if="orgUserInfo" class="user-detail-wrapper" :class="$i18n.locale">
    <div class="box">
      <!--基本信息-->
      <div class="box-item">
        <div class="item-title">{{ $t("languages.User.BaseInfo") }}</div>
        <div class="item-child">
          <p class="left-header item-avator-name">{{ $t("languages.User.Avatar") + "：" }}</p>
          <div class="item-avator">
            <a-avatar
              v-if="orgUserInfo.imgUrl && orgUserInfo.imgUrl.includes('http')"
              :size="64"
              :src="orgUserInfo.imgUrl"
              shape="square"
              icon="user"
            />
            <a-avatar
              v-else-if="orgUserInfo.imgUrl"
              :size="64"
              :src="getDownloadUrl(orgUserInfo.imgUrl)"
              shape="square"
              icon="user"
            />
            <i v-else class="icon aufontAll h-icon-all-normal_smile"></i>
          </div>
        </div>
        <div class="item-child">
          <div class="child-left">
            <p class="left-header">{{ $t("languages.User.UserName") + "：" }}</p>
            <p class="inner-text">{{ orgUserInfo.name ? orgUserInfo.name : "- -" }}</p>
          </div>
          <div class="child-right">
            <p class="left-header">{{ $t("languages.User.UserAccount") + "：" }}</p>
            <span class="inner-text">
              {{
              orgUserInfo.username ? orgUserInfo.username : "- -"
              }}
            </span>
          </div>
        </div>
        <!-- <div class="item-child">
          <div class="child-left" style="width: 100%">
            <p class="left-header">{{ $t("languages.User.UserDepartment") + "：" }}</p> -->
            <!--
                //TODO 暂无主部门数据，以多部门中的首个代替
            -->
            <!-- <p class="inner-text" style="max-width: calc( 100% - 170px )" v-if="mainDepartmentName">
              <i class="icon aufontAll h-icon-all-team-o"></i>
              {{ mainDepartmentName }}
            </p>
            <p
              class="setting-department"
              v-if="showSettingMain"
              @click="showModel"
            >{{ $t("languages.User.SettingMainDepartment") }}</p>
          </div> -->
          <!-- <div class="child-right">
          <p class="left-header">{{ $t('languages.User.Manager')+'：' }}</p>
          <p class="inner-text" v-if="orgUserInfo.managerName"><i class="icon aufontAll h-icon-all-user-o"></i>{{ orgUserInfo.managerName ? orgUserInfo.managerName : '- -' }}</p>
          <p v-else>- -</p>
          </div>
          <div class="child-right">
          <p class="left-header">{{ $t('languages.User.Gender')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.gender | gender }}</p>
          </div>-->
        <!-- </div> -->
        <!-- <div class="item-child">
        <div class="child-content">
          <p class="left-header">{{ $t('languages.User.Manager')+'：' }}</p>
          <p class="inner-text" v-if="orgUserInfo.managerName"><i class="icon aufontAll h-icon-all-user-o"></i>{{ orgUserInfo.managerName }}</p>
        </div>
        </div>-->
        <!--兼职部门-->
        <!-- <div class="item-child">
          <div class="child-content">
            <p class="left-header">{{ $t("languages.User.PartTimeDepartment") + "：" }}</p> -->
            <!-- <p
            class="inner-text limit2"
            v-if="Array.isArray(orgUserInfo.otherDepartments) && orgUserInfo.otherDepartments.length"
          >
            <template v-for="(depart,idx) in orgUserInfo.otherDepartments">
              <span v-if="depart !== mainDepartmentName" :key="idx">
                <i class="icon aufontAll h-icon-all-team-o"></i>
                {{ depart }}
              </span>
            </template>
            </p>

             <p
              class="inner-text limit2"
              v-if="Array.isArray(partTimeDepts) && partTimeDepts.length"
            >
              <template v-for="(depart, idx) in partTimeDepts">
                <span :key="idx" :title="depart.deptName">
                  <i class="icon aufontAll h-icon-all-team-o"></i>
                  {{ depart.deptName }}
                </span>
              </template>
            </p>

            <p v-else>- -</p>
          </div>
        </div> -->
        <div class="item-child">
          <div class="child-content">
            <p class="left-header">{{ $t("languages.User.Role") + "：" }}</p>
            <p class="inner-text limit2" v-if="orgUserInfo.roleName">
              <span v-for="(role, idx) in orgUserInfo.roleName.split(',')" :key="idx">
                <i class="icon aufontAll h-icon-all-user-list-o"></i>
                {{ role }}
              </span>
            </p>
            <p v-else>- -</p>
          </div>
        </div>
        <div v-if="basicExtInfo.length">
          <div class="item-child" v-for="(row, index) in basicArr" :key="index">
            <div class="child-left">
              <p
                class="left-header"
                :title="basicExtInfo[(row - 1) * 2].name"
              >{{ basicExtInfo[(row - 1) * 2].name + "：" }}</p>
              <p
                class="inner-text"
                :title="basicExtInfo[(row - 1) * 2].mapVal"
              >{{ basicExtInfo[(row - 1) * 2].mapVal }}</p>
            </div>
            <div class="child-right" v-if="basicExtInfo.length >= row * 2">
              <p
                class="left-header"
                :title="basicExtInfo[(row - 1) * 2 + 1].name"
              >{{ basicExtInfo[(row - 1) * 2 + 1].name + "：" }}</p>
              <span
                class="inner-text"
                :title="basicExtInfo[(row - 1) * 2 + 1].mapVal"
              >{{ basicExtInfo[(row - 1) * 2 + 1].mapVal }}</span>
            </div>
          </div>
        </div>
      </div>
      <!--个人信息-->
      <!-- <div class="box-item">
      <div class="item-title">{{ $t('languages.User.PersonInfo') }}</div>
      <div class="item-child">
        <div class="child-left">
          <p class="left-header">{{ $t('languages.User.Birthday')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.birthday ? orgUserInfo.birthday : '- -' }}</p>
        </div>
        <div class="child-right">
          <p class="left-header">{{ $t('languages.User.IdentityNumber')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.identityNo ? orgUserInfo.identityNo : '- -' }}</p>
        </div>
      </div>
      </div>-->
      <!--所属部门-->
      <div class="box-item box-item-dep">
        <div class="item-title">{{ $t("languages.User.department") }}</div>
        <div class="item-child">
          <div class="department-table">
            <a-table :dataSource="dataSource"
                     key="key"
                     :columns="columns"
                     :scroll="{ y: 500 }"
                     :pagination="false">
              <span slot="departmentTitle" class="resize"><span class=""></span>所属部门</span>
              <span slot="managerTitle" class="resize"><span class="line"></span>直属主管</span>
              <span slot="mainTitle" class="resize"><span class="line"></span>是否主部门</span>
              <span slot="actionTitle" class="resize"><span class="line"></span>操作</span>

              <template slot="dept" slot-scope="text, record">
                <!-- 选部门控件 单选 当前用户组织为根节点-->
                <span>{{setDepName(record.dept)}}</span>
              </template>

              <template slot="manager" slot-scope="text, record">
                 <span>{{setManageDefaultValue(record.manager)}}</span>
              </template>

              <template slot="isMainDept" slot-scope="text, record">
                <a-checkbox style="pointer-events:none;cursor: not-allowed;" :checked="record.isMainDept"/>
              </template>
            </a-table>
          </div>
        </div>
      </div>
      <!--联系方式-->
      <div class="box-item">
        <div class="item-title">{{ $t("languages.User.Contact") }}</div>
        <div class="item-child">
          <div class="child-left">
            <p class="left-header">{{ $t("languages.User.MobilePhone") + "：" }}</p>
            <p class="inner-text">{{ orgUserInfo.mobile ? orgUserInfo.mobile : "- -" }}</p>
          </div>
          <div class="child-right">
            <p class="left-header">{{ $t("languages.User.OfficePhone") + "：" }}</p>
            <p class="inner-text">{{ orgUserInfo.officePhone ? orgUserInfo.officePhone : "- -" }}</p>
          </div>
        </div>
        <div class="item-child">
          <!-- <div class="child-left">
          <p class="left-header">{{ $t('languages.User.DingTalk')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.dingtalkId ? orgUserInfo.dingtalkId : '- -' }}</p>
          </div>-->
          <div class="child-right">
            <p class="left-header">{{ $t("languages.User.Email") + "：" }}</p>
            <p class="inner-text">{{ orgUserInfo.email ? orgUserInfo.email : "- -" }}</p>
          </div>
        </div>
        <div v-if="contactExtInfo.length">
          <div class="item-child" v-for="(row, index) in contactArr" :key="index">
            <div class="child-left">
              <p
                class="left-header"
                :title="contactExtInfo[(row - 1) * 2].name"
              >{{ contactExtInfo[(row - 1) * 2].name + "：" }}</p>
              <p
                class="inner-text"
                :title="contactExtInfo[(row - 1) * 2].mapVal"
              >{{ contactExtInfo[(row - 1) * 2].mapVal }}</p>
            </div>
            <div class="child-right" v-if="contactExtInfo.length >= row * 2">
              <p
                class="left-header"
                :title="contactExtInfo[(row - 1) * 2 + 1].name"
              >{{ contactExtInfo[(row - 1) * 2 + 1].name + "：" }}</p>
              <span
                class="inner-text"
                :title="contactExtInfo[(row - 1) * 2 + 1].mapVal"
              >{{ contactExtInfo[(row - 1) * 2 + 1].mapVal }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 学生信息（家校） -->
      <div class="box-item" v-if="orgUserInfo.tag && orgUserInfo.tag === '学生'">
        <div class="item-title">{{ $t("languages.User.StudentInfo") }}</div>
        <div class="item-child">
          <div class="child-content">
            <p class="left-header">{{ $t("languages.User.StudentId") + "：" }}</p>
            <p class="inner-text">{{ orgUserInfo.employeeNo ? orgUserInfo.employeeNo : "- -" }}</p>
          </div>
        </div>
        <div class="item-child">
          <div class="child-content">
            <p class="left-header">{{ $t("languages.User.Class") + "：" }}</p>
            <p class="inner-text">
              {{
              orgUserInfo.studentClassName
              ? orgUserInfo.studentClassName
              : "- -"
              }}
            </p>
          </div>
        </div>
        <div class="item-child">
          <div class="child-content">
            <p class="left-header">{{ $t("languages.User.Parents") + "：" }}</p>
            <p
              class="inner-text link"
              v-if="orgUserInfo.guardians"
              v-for="(parent, index) in orgUserInfo.guardians"
              :key="index"
              @click="goParent(parent)"
            >{{ `${parent.name}` }}&nbsp;&nbsp;&nbsp;&nbsp;</p>
            <p v-else class="inner-text">- -</p>
          </div>
        </div>
      </div>

      <!-- 老师信息（家校） -->
      <div class="box-item" v-if="orgUserInfo.tag && orgUserInfo.tag === '老师'">
        <div class="item-title">{{ $t("languages.User.TeachersInfo") }}</div>
        <div
          class="item-child"
          v-if="orgUserInfo.tearchers"
          v-for="(tearcher, index) in orgUserInfo.tearchers"
          :key="index"
        >
          <div class="child-left">
            <p class="left-header">{{ $t("languages.User.Class") + "：" }}</p>
            <span class="inner-text">
              {{
              tearcher.deptName ? tearcher.deptName : "- -"
              }}
            </span>
          </div>
          <div class="child-right">
            <p class="left-header">{{ $t("languages.User.IsHeadTeacher") + "：" }}</p>
            <span class="inner-text">{{ tearcher.isAdviser ? "是" : "否" }}</span>
          </div>
        </div>
      </div>

      <!-- 孩子信息（家校） -->
      <div class="box-item" v-if="orgUserInfo.tag && isShowChild">
        <div class="item-title">{{ $t("languages.User.ChildsInfo") }}</div>
        <div
          class="item-child"
          v-if="orgUserInfo.childrens"
          v-for="(child, index) in orgUserInfo.childrens"
          :key="index"
        >
          <div class="child-left">
            <p class="left-header">{{ $t("languages.User.ChildName") + "：" }}</p>
            <span class="inner-text">{{ child.name ? child.name : "- -" }}</span>
          </div>
          <div class="child-right">
            <p class="left-header">{{ $t("languages.User.Class") + "：" }}</p>
            <span class="inner-text">
              {{
              child.deptName ? child.deptName : "- -"
              }}
            </span>
          </div>
        </div>
      </div>

      <!--组织信息-->
      <div class="box-item" v-if="!orgUserInfo.tag">
        <div class="item-title">{{ $t("languages.User.EmployeeInfo") }}</div>
        <div class="item-child">
          <div class="child-left">
            <p class="left-header">{{ $t("languages.User.EmployeeNumber") + "：" }}</p>
            <p class="inner-text">{{ orgUserInfo.employeeNo ? orgUserInfo.employeeNo : "- -" }}</p>
          </div>
          <div class="child-left">
            <p class="left-header">{{ $t("languages.User.EntryDate") + "：" }}</p>
            <p class="inner-text">{{ orgUserInfo.entryDate ? orgUserInfo.entryDate : "- -" }}</p>
          </div>
          <!-- <div class="child-right">
          <p class="left-header">{{ $t('languages.User.EmployeeRank')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.employeeRank ? orgUserInfo.employeeRank : '- -' }}</p>
          </div>-->
        </div>
        <div v-if="orgExtInfo.length > 0">
          <div class="item-child" v-for="(row, index) in orgArr" :key="index">
            <div class="child-left">
              <p
                class="left-header"
                :title="orgExtInfo[(row - 1) * 2].name"
              >{{ orgExtInfo[(row - 1) * 2].name + "：" }}</p>
              <p
                class="inner-text"
                :title="orgExtInfo[(row - 1) * 2].mapVal"
              >{{ orgExtInfo[(row - 1) * 2].mapVal }}</p>
            </div>
            <div class="child-right" v-if="orgExtInfo.length >= row * 2">
              <p
                class="left-header"
                :title="orgExtInfo[(row - 1) * 2 + 1].name"
              >{{ orgExtInfo[(row - 1) * 2 + 1].name + "：" }}</p>
              <span
                class="inner-text"
                :title="orgExtInfo[(row - 1) * 2 + 1].mapVal"
              >{{ orgExtInfo[(row - 1) * 2 + 1].mapVal }}</span>
            </div>
          </div>
        </div>
        <!-- <div class="item-child">
        <div class="child-left">
          <p class="left-header">{{ $t('languages.User.Appellation')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.appellation ? orgUserInfo.appellation : '- -' }}</p>
        </div>
        <div class="child-right">
          <p class="left-header">{{ $t('languages.User.Secretary')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.secretaryName ? orgUserInfo.secretaryName : '- -' }}</p>
        </div>
        </div>-->
        <!-- <div class="item-child">
        <div class="child-left">
          <p class="left-header">{{ $t('languages.User.EntryDate')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.entryDate ? orgUserInfo.entryDate : '- -' }}</p>
        </div>
        <div class="child-right">
          <p class="left-header">{{ $t('languages.User.DepartureDate')+'：' }}</p>
          <p class="inner-text">{{ orgUserInfo.departureDate ? orgUserInfo.departureDate : '- -' }}</p>
        </div>
        </div>-->
      </div>

      <div class="box-item" v-if="otherExtInfo.length">
        <div class="item-title">其它信息</div>
        <div class="item-child" v-for="(row, index) in otherArr" :key="index">
          <div class="child-left">
            <p
              class="left-header"
              :title="otherExtInfo[(row - 1) * 2].name"
            >{{ otherExtInfo[(row - 1) * 2].name + "：" }}</p>
            <p
              class="inner-text"
              :title="otherExtInfo[(row - 1) * 2].mapVal"
            >{{ otherExtInfo[(row - 1) * 2].mapVal }}</p>
          </div>
          <div class="child-right" v-if="otherExtInfo.length >= row * 2">
            <p
              class="left-header"
              :title="otherExtInfo[(row - 1) * 2 + 1].name"
            >{{ otherExtInfo[(row - 1) * 2 + 1].name + "：" }}</p>
            <span
              class="inner-text"
              :title="otherExtInfo[(row - 1) * 2 + 1].mapVal"
            >{{ otherExtInfo[(row - 1) * 2 + 1].mapVal }}</span>
          </div>
        </div>
      </div>
      <a-modal
        :title="$t('languages.User.SettingMainDepartment')"
        :okText="$t('languages.Save')"
        :cancelText="$t('languages.Cancel')"
        v-model="visible"
        @ok="handleOk"
        @cancel="handelCancel"
        :maskClosable="false"
        :keyboard="false"
      >
        <div class="main-department-wrap">
          <div class="main-department">
            <span class="left-header">
              {{
              $t("languages.User.MainDepartment")
              }}
            </span>
            <span class="inner-text">{{ mainDepartmentName }}</span>
          </div>
          <div class="department-list">
            <div
              class="department"
              :class="{ main: d.deptId === selectDepartmentId }"
              v-for="(d, index) in departmentList"
              @click="settingMainDepartment(d)"
              :key="index"
            >{{ d.deptName }}</div>
          </div>
        </div>
      </a-modal>
    </div>

    <div class="footer" v-if="!onlyView && showSettingMain">
      <a-button :disabled="curNodeState && curNodeState.enabled === false" type="primary" @click="saveData">保存</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { State, namespace } from "vuex-class";
import * as OrganizationApi from "@/apis/organization";

const UserModule = namespace("Organization/User");
import {
  Select
} from "@h3/antd-vue";
import OrgApi from "@/apis/organization";
@Component({
  name: "UserInfo",
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class userInfo extends Vue {
  @UserModule.State("orgUserInfo") orgUserInfo: any;

  @UserModule.Mutation("setEduUserInfoParams") setEduUserInfoParams: any;

  @UserModule.Mutation("clearUserInfo") clearUserInfo: any;

  @UserModule.Action("getOrgUserInfo") getOrgUserInfo: any;

  @Prop({ default: false }) onlyView!: any;

  @Prop() curNodeState!: any;

  columns: any = [
    {
      dataIndex: 'dept',
      width: '30%',
      slots: {title: "departmentTitle"},
      scopedSlots: {customRender: 'dept'},
    },
    {
      dataIndex: 'manager',
      slots: {title: "managerTitle"},
      width: '30%',
      scopedSlots: {customRender: 'manager'},
    },
    {
      slots: {title: "mainTitle"},
      dataIndex: 'isMainDept',
      width: '30%',
      scopedSlots: {customRender: 'isMainDept'},
    },
  ];

  dataSource: any = [
    {
      key: 0,
      dept: [],
      manager: {
        id: '',
        name: ''
      },
      isMainDept: false,
    },
  ];

  selectDept: any = {};

  selectDepartmentId: string = "";

  orgUserList:any = [];

  setManageDefaultValue (val:any) {
    if (val) {
      return val.name;
    }
    return '';
  }
  setDepName(val:any) {
    if (Array.isArray(val) && val.length > 0) {
      return val[0].name;
    }
    return ''
  }
  get showSettingMain() {
    const { onlyView } = this;
    if (this.orgUserInfo.departmentName) {
      return (
        this.orgUserInfo.departmentName.split(",").length >= 2 && !onlyView
      );
    }
    return false;
  }

  get basicExtInfo() {
    if (
      Array.isArray(this.orgUserInfo.userExtAttrModels) &&
      this.orgUserInfo.userExtAttrModels.length > 0
    ) {
      let basicArrInfo = this.orgUserInfo.userExtAttrModels.filter((x) => {
        return x.belong === "base" && x.enable === 1;
      });
      basicArrInfo.sort((a, b) => {
        let aTime = new Date(a.createdTime).getTime();
        let bTime = new Date(b.createdTime).getTime();
        return  aTime - bTime;
      });
      this.basicArr = this.generateDynamicArr(basicArrInfo, 2);
      return basicArrInfo;
    } else {
      this.basicArr = [];
      return [];
    }
  }
  get contactExtInfo() {
    if (
      Array.isArray(this.orgUserInfo.userExtAttrModels) &&
      this.orgUserInfo.userExtAttrModels.length > 0
    ) {
      let contactArrInfo = this.orgUserInfo.userExtAttrModels.filter((x) => {
        return x.belong === "contact" && x.enable === 1;
      });
      contactArrInfo.sort((a, b) => {
        let aTime = new Date(a.createdTime).getTime();
        let bTime = new Date(b.createdTime).getTime();
        return  aTime - bTime;
      });
      this.contactArr = this.generateDynamicArr(contactArrInfo, 2);
      return contactArrInfo;
    }
    this.contactArr = [];
    return [];
  }
  get orgExtInfo() {
    if (
      Array.isArray(this.orgUserInfo.userExtAttrModels) &&
      this.orgUserInfo.userExtAttrModels.length > 0
    ) {
      let orgArrInfo = this.orgUserInfo.userExtAttrModels.filter((x) => {
        return x.belong === "org" && x.enable === 1;
      });
      orgArrInfo.sort((a, b) => {
        let aTime = new Date(a.createdTime).getTime();
        let bTime = new Date(b.createdTime).getTime();
        return  aTime - bTime;
      });
      this.orgArr = this.generateDynamicArr(orgArrInfo, 2);
      return orgArrInfo;
    }
    this.orgArr = [];
    return [];
  }
  get otherExtInfo() {
    if (
      Array.isArray(this.orgUserInfo.userExtAttrModels) &&
      this.orgUserInfo.userExtAttrModels.length > 0
    ) {
      let otherArrInfo = this.orgUserInfo.userExtAttrModels.filter((x) => {
        return x.belong === "other" && x.enable === 1;
      });
      otherArrInfo.sort((a, b) => {
        let aTime = new Date(a.createdTime).getTime();
        let bTime = new Date(b.createdTime).getTime();
        return  aTime - bTime;
      });
      this.otherArr = this.generateDynamicArr(otherArrInfo, 2);
      return otherArrInfo;
    }
    this.otherArr = [];
    return [];
  }

  // 家长是否展示孩子信息
  get isShowChild() {
    if (this.orgUserInfo.tag === "家长") {
      return true;
    } else if (
      this.orgUserInfo.childrens &&
      this.orgUserInfo.childrens.length &&
      this.orgUserInfo.tag === "老师"
    ) {
      return true;
    }
    return false;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  visible: boolean = false;
  isClickOk: boolean = false;

  departmentList: any = [];

  mainDepartmentName: string = "";

  mainDepartmentId: string = "";

  partTimeDepts: any[] = [];

  basicArr: number[] = [];
  contactArr: number[] = [];
  orgArr: number[] = [];
  otherArr: number[] = [];

  @Watch("orgUserInfo", { immediate: true, deep: true })
  async onOrgUserInfoWatch(v: any) {
    if (this.orgUserInfo && this.orgUserInfo.id) {
      const mainDepartmentName = this.orgUserInfo.mainDepartmentName;

      if (mainDepartmentName) {
        this.mainDepartmentName = mainDepartmentName.mainDeptPath;
        this.mainDepartmentId = this.selectDepartmentId = mainDepartmentName.id;
      }
      await this.getUserDepInfo(this.orgUserInfo.id);
      await this.getDepartmentList();
      this.selectDept = this.departmentList.find(
        (item) => item.deptId === this.mainDepartmentId
      ) || {
        deptId: this.orgUserInfo.departmentId,
        deptName: mainDepartmentName.mainDeptPath,
      };

      this.params = {
        deptId: this.orgUserInfo.departmentId,
        main: true,
        userId: this.orgUserInfo.id,
      };
    }
  }

  // 获取当前用户部门列表
  async getUserDepInfo(userId:string) {
    const params = {
      userId,
    };
    const res = await OrgApi.getOrgUserDepList(params);
    if (res.errcode === 0 && res.data) {
      const data:any = res.data;
      if (data.length > 0) {
        data.forEach((item: any, index: number) => {
          item.key = index;
        })
      }
      this.dataSource = data;
    }
  }

  // 获取当前用户的所属部门列表
  async getDepartmentList() {
    const params = {
      id: this.orgUserInfo.id,
      filterType: "admin",
    };

    const res = await OrganizationApi.getDepartmentList(params);
    if (res.errcode === 0) {
      if (Array.isArray(res.data)) {
        this.departmentList = res.data;

        // 20200410 已沟通通过此接口获取兼职部门
        this.partTimeDepts = res.data.filter(
          (r: any) => r.deptId !== this.mainDepartmentId
        );
      }
    }
  }

  /*
   * 展示主部门弹窗
   */
  async showModel() {
    this.visible = true;
  }

  /*
   * 设置主部门
   */
  params: any = {};
  curDept: any = {};
  async settingMainDepartment(dept: any) {
    this.selectDept = dept;
    this.selectDepartmentId = dept.deptId;
  }

  async saveData() {
    // 获取当前用户的所属部门列表
    const { params, curDept } = this;
    const res = await OrganizationApi.updateMainDepartment(params);
    // console.log(res);
    const { errcode, errmsg } = res;
    if (errcode === 0) {
      this.mainDepartmentId = curDept.deptId;
      this.$emit("closeDrawer");
      this.$message.success(errmsg as string);
    } else {
      this.$message.error(errmsg as string);
    }
  }

  handleOk() {
    this.visible = false;
    this.curDept = this.selectDept;
    this.mainDepartmentName = this.curDept.deptName;
    this.mainDepartmentId = this.curDept.deptId;

    this.params = {
      deptId: this.curDept.deptId,
      main: true,
      userId: this.orgUserInfo.id,
    };

    this.getDepartmentList();
  }

  handelCancel() {
    this.visible = false;
    this.selectDepartmentId = this.mainDepartmentId;
  }

  // 家校跳转家长信息页面
  goParent(data: any) {
    if (!data.id || !data.deptId) {
      return;
    }
    this.clearUserInfo();
    const params: Organization.Users.EduRequestParams = {
      userId: data.id,
      deptId: data.deptId,
    };
    this.setEduUserInfoParams(params);
    this.getOrgUserInfo(true);
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  }

  @Watch("orgUserInfo")
  onUserInfoChange(v: any) {
    if (v && v.id) {
      this.getDepartmentList();
    }
  }

  // 根据实际数组创建行数组，用于循环输出
  generateDynamicArr(source: any[], column = 2) {
    let arr: number[] = [];
    if (Array.isArray(source) && source.length > 0) {
      let row: number = 1;
      arr.push(row);
      while (row * column < source.length) {
        row++;
        arr.push(row);
      }
    }
    return arr;
  }
}
</script>

<style lang="less">
@import "../../styles/themes/index.less";
.user-detail-wrapper {
  max-height: calc(100% - 57px);
  height: calc(100% - 57px);
  & > .box {
    height: 100%;
    overflow: auto;
  }
  .footer {
    text-align: center;
    position: absolute;
    height: 50px;
    line-height: 50px;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 6;
    background: #fff;
    border-top: 1px solid #e8e8e8;
  }
  &.en {
    /* 英文下样式修复 */
    .box-item .item-child .left-header {
      width: auto;
      min-width: 135px;
    }
  }
  .box-item {
    padding: 21px 0 19px;
    border-bottom: 1px solid rgb(232, 232, 232);
    &:last-child {
      border-bottom: 0 none;
    }
    .item-title {
      padding-bottom: 6px;
      text-align: left;
      font-size: 14px;
      color: @base-text-color;
      font-weight: 500;
    }
    .item-child {
      font-size: 0;
      padding: 10px 0;
      p {
        display: inline-block;
        vertical-align: top;
        margin-bottom: 0;
      }
      .item-avator-name {
        display: inline-block;
        vertical-align: top;
        font-size: 14px;
      }
      .item-avator {
        display: inline-block;
        vertical-align: top;
        border-radius: 4px;
        overflow: hidden;
        & > i.icon {
          font-size: 64px;
          line-height: 64px;
          color: #ffb131;
        }
      }
      .setting-department {
        color: @primary-color;
        margin-left: 20px;
        cursor: pointer;
      }
      .child-left,
      .child-right,
      .child-content {
        font-size: 14px;
      }
      .child-left,
      .child-right {
        display: inline-block;
        vertical-align: top;
        width: 50%;
        overflow: hidden;
      }
      .left-header {
        width: 78px;
        margin-right: 8px;
        color: rgba(0, 0, 0, 0.65);
      }
      .limit {
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .link {
        color: @primary-color !important;
        cursor: pointer;
      }
      .inner-text {
        color: rgba(0, 0, 0, 0.85);
        i {
          margin-right: 6px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.25);
        }
        span:nth-child(n + 2) {
          margin-right: 17px;
          white-space: nowrap;
          word-break: normal;
        }
      }

      .limit2 {
        max-width: 90%;
        white-space: normal;
      }
    }
  }
  .box-item-dep{
    border-bottom:0;
  }
}
.main-department-wrap {
  height: 100%;
  position: relative;
  .main-department {
    .left-header {
      color: rgba(0, 0, 0, 0.65);
    }
    .inner-text {
      margin-left: 24px;
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .department-list {
    overflow: hidden;
    margin-top: 22px;
    .department {
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      background: #fafafa;
      float: left;
      margin: 0 8px 16px 0;
      color: rgba(0, 0, 0, 0.65);
      cursor: pointer;
    }
    .main {
      border: 1px solid @primary-color;
      background: #e8fcf4;
      color: @primary-color;
    }
  }
}
</style>
