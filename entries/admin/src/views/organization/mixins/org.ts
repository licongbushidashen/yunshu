import {
  Component, Vue, Watch
} from 'vue-property-decorator';


import { State, Action, Mutation, namespace } from "vuex-class";

const UserModule = namespace("Organization/User");

@Component
export default class OrgMixin extends Vue {
 
  @State("config") config: any; // 提取 config

  @UserModule.State("loading") loading: any;

  @UserModule.State("noUser") noUser: any;

  @UserModule.State("searchTitle") searchTitle: any;

  @UserModule.State("orgUserList") orgUserList: any;

  @UserModule.State("loadCompleted") loadCompleted: any;

  @UserModule.Mutation("clearUserList") clearUserList: any;

  @UserModule.Mutation("assignUserInfoParams") assignUserInfoParams: any;

  @UserModule.Mutation("setEduUserInfoParams") setEduUserInfoParams: any;

  @UserModule.Mutation("clearUserInfo") clearUserInfo: any;

  @UserModule.Action("getOrgUserList") getOrgUserList: any;

  @UserModule.Action("getOrgUserInfo") getOrgUserInfo: any;

  tableColums = [
    {
      dataIndex: "index",
      align: "center",
      width: 80,
      slots: { title: "indexTitle" },
    },
    {
      width: 140,
      dataIndex: "name",
      slots: { title: "nameTitle" },
      scopedSlots: { customRender: "name" },
      onFilter: (value: string, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      dataIndex: "userId",
      slots: { title: "userIdTitle" },
      scopedSlots: { customRender: "userId" },
    },
    {
      width: 180,
      dataIndex: "roleName",
      slots: { title: "roleNameTitle" },
      scopedSlots: { customRender: "role" },
    },
    {
      dataIndex: "mobile",
      slots: { title: "mobileTitle" },
      scopedSlots: { customRender: "mobile" },
    },
    {
      dataIndex: "email",
      slots: { title: "emailTitle" },
      scopedSlots: { customRender: "email" },
    },
    {
      width: 120,
      dataIndex: "operation",
      slots: { title: "operationTitle" },
      scopedSlots: { customRender: "operation" },
    },
  ];

  rowSelection = {
    type: "checkbox",
    selectedRowKeys: new Array<string>(),
    onChange: this.onSelectChange,
  };

  // 当前节点信息
  curNodeState: any = {};

  isSearchTitle: boolean = false;

  infoVisible: boolean = false;

  // 工作交接
  visible: boolean = false;

  userid: string = "";
  corpid: string = "";

  userName: string = "";
  
  /* 用户信息相关 */
  showInfoModal(val: string) {
    if (val) {
      const infoParams: Organization.Users.RequestParams = {
        id: val,
      };
      this.assignUserInfoParams(infoParams);
      let isHomeSchool = false;
      const { deptType, id } = this.curNodeState;
      if (deptType) {
        isHomeSchool = deptType === 1 && !this.isSearchTitle; // 1 家校  2 组织
        const params: Organization.Users.EduRequestParams = {
          userId: val,
          deptId: id,
        };
        this.setEduUserInfoParams(params);
      }

      this.getOrgUserInfo(isHomeSchool).then(() => {
        this.infoVisible = true;
      });
    }
  }

  // 工作交接弹框
  showModel(val: any) {
    this.visible = true;
    this.userid = val.id;
    this.corpid = val.corpId;
    if (val.name) {
      this.userName = val.name;
    }
  }

  onCloseInfoModal() {
    this.infoVisible = false;
    this.clearUserInfo();
  }

  onRowClick(record: any, index: number) {
    return {
      on: {
        click: () => {
          this.showInfoModal(record.id);
        },
      },
    };
  }

  onClose() {
    this.visible = false;
  }

  // 勾选
  onSelectChange(selectedRowKeys) {
    this.rowSelection.selectedRowKeys = selectedRowKeys;
  }
  


}
