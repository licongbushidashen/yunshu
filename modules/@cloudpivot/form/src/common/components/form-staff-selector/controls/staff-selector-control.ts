/*
 * @Author: your name
 * @Date: 2020-04-22 14:11:20
 * @LastEditTime: 2022-01-27 12:15:19
 * @LastEditors: Fu Zhuohang
 * @Description: In User Settings Edit
 * @FilePath: \yunshu6.0-2\modules\@cloudpivot\form\src\common\components\form-staff-selector\controls\staff-selector-control.ts
 */

import { Subscription } from "rxjs";
import { userApi } from "@cloudpivot/api";
import * as typings from "@cloudpivot/form/src/typings";

import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";
import * as schema from "@cloudpivot/form/src/schema";
import OptionsMap from "@cloudpivot/form/src/typings/form-modals-map";
import userSelectionOptionsMap from "@cloudpivot/form/src/typings/user-selection-map";
// @ts-ignore
import isEqual from 'lodash/isEqual'
import {
  SelectControl,
  RadioControl,
  Control,
  ControlValueChange,
  ControlPropertyChange,
  FormGroup
} from "h3-forms";

const MAPPING_FIELD_OPERATE = "MAPPING_FIELD_OPERATE";
export abstract class StaffSelectorControl extends BaseControl<
  typings.StaffSelectorOptions
  > {
  static service: UserService;

  val: any[] = [];

  staffSelectorOpts: any = {};

  refSubscription?: Subscription;

  get text() {
    return this.val.map(x => x.name).join(";");
  }

  get isMobile() {
    const flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
    return flag;
  }

  get displayType() {
    if (this.controlOpts.displayType) {
      return this.controlOpts.displayType;
    }
    return schema.DisplayType.Tag;
  }

  get userAttributes() {
    let userAttributes: any = [...userSelectionOptionsMap.zh_CN.orgAttributes, ...OptionsMap.userAttributes]
    return userAttributes;
  }

  setControl() {
    this.staffSelectorOpts = this.createOptions();

    this.unsubscribe();

    let key = this.controlOpts.orgRoot;

    if (
      this.controlOpts.orgRootValueType === schema.StaffSelectorValueType.Ref &&
      key &&
      typeof key === "string"
    ) {
      key = key.substr(1, key.length - 2);
      let ctrl: any = "";
      if (this.ctrl.options && this.ctrl.options.inSheet) {
        let rowIndex = this.ctrl.options.rowIndex || 0;
        ctrl = this.findController(key, rowIndex) as RadioControl;
      } else {
        ctrl = this.findController(key) as RadioControl;
      }
      if (ctrl) {
        if (ctrl.value) {
          this.$set(this.staffSelectorOpts, "rootNode", ctrl.value);
        }

        this.refSubscription = ctrl.valueChange.subscribe((change: any) => {
          this.$set(this.staffSelectorOpts, "rootNode", change.value);
        });
      }
    }
    const value = this.ctrl.value;
    let isNew = (window as any).h3form
      ? !!(window as any).h3form.isNew
      : true;
    // ??????????????????
    let isWorkflow = (window as any).h3form
      ? !!(window as any).h3form.workflowInfo
      : false;
    if (isNew) {
      this.handleValueChange(this.ctrl.value);
    } else {
      this.val = value ? value : [];
    }
  }

  async handleValueChange(value: any): Promise<void> {
    // // @ts-ignore
    // if (!value && !this.ctrl.isChangeFromEmptyRow) {
    //   return;
    // }
    // // @ts-ignore
    // this.ctrl.isChangeFromEmptyRow = false

    if(this.control.options.orgRoot && Array.isArray(this.control.options.orgRoot) && this.control.options.orgRoot.length){
      const params = {
        unitId: Array.isArray(value) ? value[0].id : value.id,
        unitType: Array.isArray(value) ? value[0].unitType ? value[0].unitType : value[0].type : value.unitType,
        departmentIds:this.control.options.orgRoot.map(i => i.id)
      };
      let res: any = await userApi.getverifyPersonIsMapping(params);
      if (res.errcode === 0) {
        if(!res.data){
          if (this.isMobile) {
            (this as any).$h3.toast.hide();
            (this as any).$h3.toast.show({
              text: `[${this.control.options.name}] ???????????????????????????`
            });
          } else {
            this.$message.destroy();
            this.$message.error(`[${this.control.options.name}] ???????????????????????????`);
          }
          this.setValue([]);
          this.val = [];
          return;
        }
      }else {
        this.$message.error(res.errmsg as string);
        return;
      }
    }

    if (!(this.controlOpts.mappings)) {
      if (value) {
        if (!isEqual(this.val, value)) {
          this.val = value;
        }
      } else {
        // ????????????value???null ???????????????????????????????????????this.value??????????????????onValueChange??????
        // ?????????????????????
        if (Array.isArray(this.val) && this.val.length > 0) {
          this.val = [];
        }
      }
    } else {
      if (value) {
        this.mappingOperate(value);
      } else {
        this.val = [];
      }
    }
  }

  async mappingOperate(val: any) {
    let _tempMappingItem: Array<string> = ["departments", "partTimerDepartment", "manager", "entryDate"];
    let self: any = this;
    let dirty = false; // val ?????????????????????
    let userinfo = ['partTimerDepartment', 'mobile', 'email', 'officePhone', 'employeeNo'];

    let mappingList = this.controlOpts.mappings
      .slice(0, -1)
      .split(";")
      .map((val: any) => val.split(":"));
      console.log('mapping',mappingList)

    for (let _mapping of mappingList) {
      let [mappingItem, mappingKey] = _mapping;
      // console.log(mappingItem, mappingKey)
      if (self[MAPPING_FIELD_OPERATE + mappingItem] || userinfo.includes(mappingItem)) {
        if (mappingItem === "departments" &&
          (!val[0]["departments"] || val[0]["departments"].length > 1)
        ) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
        }
        else if (userinfo.includes(mappingItem) && val[0][mappingItem] === undefined) {
          dirty = true;
          //?????????????????????????????????????????????
          if (!self.isExternal) {
            await self[`${MAPPING_FIELD_OPERATE}${'partTimerDepartment'}`](val[0], mappingItem);
          }
        }

        // else if (mappingItem === "partTimerDepartment" && !val[0]["partTimerDepartment"] ) {
        //   dirty = true;
        //   //?????????????????????????????????????????????
        //   if(!self.isExternal){
        //     await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
        //   }
        // }

        else if (!val[0][mappingItem] && self[`${MAPPING_FIELD_OPERATE}${mappingItem}`]) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
        }
      }
      else if (~mappingItem.indexOf("LEVEL")) {
        if (!val[0][mappingItem]) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}OrganizationLevel`](val[0], mappingItem);
        }
      } else if (!_tempMappingItem.includes(mappingItem)) {
        if (typeof this.val !== typeof val || this.val.length !== val.length) {
          dirty = true;
        } else {
          if (this.val[0][mappingItem] !== val[0][mappingItem]) {
            dirty = true;
          }
        }
      } else if (mappingItem.indexOf('entryDate') > -1) {
        if (val[0][mappingItem] && typeof val[0][mappingItem] === 'string') {
          val[0][mappingItem] = val[0][mappingItem].replace(/-/g,'/')
          val[0][mappingItem] = new Date(val[0][mappingItem]);
          dirty = true;
        }
      }
    }
   //?????????????????????????????????????????????????????????
    if (dirty) {
      if(val[0] && val[0].id){
        let userExtAttrObj : any = {}
        if(val[0].unitType === 1 || val.length > 1){
          this.$message.warning('????????????????????????????????????????????????')
          return
        }
        let { errcode, data, errmsg } = await userApi.getUserInfo(val[0].id);
        if (errcode === 0) {
          if (data) {
            let { userExtAttrModels } = data as any;
            if(userExtAttrModels){
            userExtAttrModels.map((item:any)=>{
              userExtAttrObj[item.code] = item.mapVal
            })
          }
          }
        } else {
          this.$message.error(errmsg as string);
        }
        val = [{...userExtAttrObj,...val[0]}]
        console.log(val)
        let newVal = [...val];
        this.setValue(newVal);
        if (!isEqual(this.val, val)) {
          this.val = val;
          
        }
      }
    } else {
      if (!isEqual(this.val, val)) {
        this.val = val;
      }
    }
  }
  // ?????? ??????????????????????????????. ????????????,1. ???????????????????????? departments??????,????????????. 2. ??????????????????????????????????????????
  async [MAPPING_FIELD_OPERATE + "departments"](item: any) {
    return new Promise(async (resolve, reject) => {
      if (item.departments && item.departments.length > 1) {
        let _department: any[] = [];
        let _partTimerDepartments: any[] = [];
        for (let dp of item.departments) {
          if (dp.id !== item.departmentId) {
            _partTimerDepartments.push(dp);
          } else {
            _department.push(dp);
          }
        }
        item["partTimerDepartment"] = _partTimerDepartments;
        item["departments"] = _department;
        resolve(item);
      } else if (!item.departments) {
        let { errcode, data, errmsg } = await userApi.getUserInfo(item.id);
        if (errcode === 0) {
          if (data) {
            let { mainDepartmentName, departmentNames } = data as any;
            item["departments"] = mainDepartmentName
              ? [mainDepartmentName]
              : [];
            item["partTimerDepartment"] =
              departmentNames && departmentNames.length ? departmentNames : [];

          }
        } else {
          this.$message.error(errmsg as string);
        }
        resolve(item);
      }
    });
  }

  // ?????? ??????????????????????????????. ????????????,1. ???????????????????????? departments??????,????????????. 2. ??????????????????????????????????????????
  async [MAPPING_FIELD_OPERATE + "departments"](item: any) {
    return new Promise(async (resolve, reject) => {
      if (item.departments && item.departments.length > 1) {
        let _department: any[] = [];
        let _partTimerDepartments: any[] = [];
        for (let dp of item.departments) {
          if (dp.id !== item.departmentId) {
            _partTimerDepartments.push(dp);
          } else {
            _department.push(dp);
          }
        }
        item["partTimerDepartment"] = _partTimerDepartments;
        item["departments"] = _department;
        resolve(item);
      } else if (!item.departments) {
        let { errcode, data, errmsg } = await userApi.getUserInfo(item.id);
        if (errcode === 0) {
          if (data) {
            let { mainDepartmentName, departmentNames } = data as any;
            item["departments"] = mainDepartmentName
              ? [mainDepartmentName]
              : [];
            item["partTimerDepartment"] =
              departmentNames && departmentNames.length ? departmentNames : [];

          }
        } else {
          this.$message.error(errmsg as string);
        }
        resolve(item);
      }
    });
  }
  async [MAPPING_FIELD_OPERATE + "partTimerDepartment"](item: any, key?: string) {
    return new Promise(async (resolve, reject) => {
      let res = await userApi.getUserInfo(item.id);

      let { errcode, errmsg } = res;
      let data: any = res.data;

      if (errcode === 0) {
        if (data) {
          let { mainDepartmentName, departmentNames } = data as any;

          if (key) {
            item[key] = data[key] ? data[key] : '';
          }

          item["departments"] = mainDepartmentName
            ? [mainDepartmentName]
            : [];
          item["partTimerDepartment"] =
            departmentNames && departmentNames.length ? departmentNames : [];
        }
      } else {
        this.$message.error(errmsg as string);
      }
      resolve(item);
    });
  }

  // ????????????-manager-???????????? ??????
  async [MAPPING_FIELD_OPERATE + "manager"](item: any) {
    return new Promise((resolve, reject) => {
      StaffSelectorControl.service.getDeptLeader(item.id).then((data: any) => {
        if (Array.isArray(data)) {
          if (data.length) {
            item["manager"] = data;
          } else {
            item["manager"] = [];
          }
        } else {
          item["manager"] = [];
        }
        resolve(item);
      });
    });
  }
  // ????????????-xxx-LEVEL,x -???????????? ??????
  async [MAPPING_FIELD_OPERATE + "OrganizationLevel"](
    item: any,
    levelString: any
  ) {
    return new Promise((resolve, reject) => {
      StaffSelectorControl.service.getOrganizationLevel(item.id).then(data => {
        if (this.controlOpts) {
          let mappings = this.controlOpts.mappings.match(/\{.+?\}/g)
          let mappingsObject = '' 
          if(mappings.length){
            mappings.forEach((el:any) => {
              // @ts-ignore
              mappingsObject += h3form[el.replace('{','').replace('}','')].options.name + ';'
            });
            mappingsObject = mappingsObject.slice(0, mappingsObject.length - 1)
          }
          if (data) {
            if (data.length > 0) {
              data.forEach((el:any) => {
                if(el.type === undefined){
                  el.type = el.unitType
                }
              })
              let level = levelString.split(",")[1];
              //?????????????????????????????????????????????????????????????????????
              if (level < data.length) {
                item[levelString] = [];
                item[levelString].push(data[level]);
              } else {
                item[levelString] = [];
                item[levelString].push(data[data.length - 1]);
              }
            } else {
              this.$message.error(this.controlOpts.name + '?????????' + mappingsObject + '??????' )
              item[levelString] = [];
            }
          } else {
			        this.$message.error(this.controlOpts.name + '?????????' + mappingsObject + '??????' )
            item[levelString] = [];
          }
        }
        resolve(true);
      });
    });
  }

  unsubscribe() {
    if (this.refSubscription) {
      this.refSubscription.unsubscribe();
    }
  }

  createOptions() {
    const opts = this.controlOpts;
    const dept = opts.deptVisible;

    const selectOrg = dept === "all" || dept === "org";
    const selectUser = dept === "all" || dept === "user";

    let root: any;

    if (
      this.controlOpts.orgRootValueType === schema.StaffSelectorValueType.None
    ) {
      if (opts.orgRoot && typeof opts.orgRoot === "string") {
        try {
          root = JSON.parse(opts.orgRoot);
        } catch (error) { }
      } else if (Array.isArray(opts.orgRoot)) {
        root = opts.orgRoot;
      }
    } else if (
      this.controlOpts.orgRootValueType ===
      schema.StaffSelectorValueType.OriginatorDept
    ) {
      root = StaffSelectorControl.service.getCurrentUserDept();
    }

    if (root && !Array.isArray(root)) {
      root = [root];
    }

    let role: any;
    if (opts.roles && typeof opts.roles === "string") {
      role = JSON.parse(opts.roles);
    }
    let mulpitle: boolean = false;
    if (typeof this.controlOpts.multi === "string" && this.controlOpts.multi === 'false') {
      mulpitle = false;
    } else {
      mulpitle = Boolean(this.controlOpts.multi);
    }
    return {
      key: this.control.key,
      selectOrg: selectOrg,
      selectUser: selectUser,
      mulpitle,
      rootNode: root,
      role: role,
      showModel: true,
      showSelect: true,
      recursive: this.controlOpts.recursive,
      placeholder: this.placeholder,
      isDisplayRoot: opts.isDisplayRoot
    };
  }

  destroyed() {
    super.destroyed();

    this.unsubscribe();
  }

  // setCurrentUser() {
  //     const user = StaffSelectorControl.service.getCurrentUser();
  //     if (user) {
  //         this.ctrl.value = [user];
  //     }
  // }

  // setCurrentUserDept() {
  //     const dept = StaffSelectorControl.service.getCurrentUserDept();
  //     if (dept) {
  //         this.ctrl.value = [dept];
  //     }
  // }

  // initValue() {
  //     if (!this.control.value || !this.control.value.length) {
  //         const type = this.controlOpts.defaultValueType;
  //         if (type === typings.StaffSelectorValueType.Originator) {
  //             this.setCurrentUser();
  //         } else if (type === typings.StaffSelectorValueType.OriginatorDept) {
  //             this.setCurrentUserDept();
  //         }
  //     }
  // }
}

/**
 * ????????????
 */
export enum OrganizationType {
  /**
   * ??????
   */
  Department = 1,

  /**
   * ??????
   */
  Role = 2,

  /**
   * ??????
   */
  User = 3
}

export interface OrganizationBase {
  id: string;

  name: string;
}

export interface DepartmentInfo extends OrganizationBase {
  /**
   * ?????????
   */
  employees: number;

  /**
   * ????????????
   */
  leaf: boolean;

  /**
   * ????????????ID
   */
  parentId?: string;

  type: OrganizationType;
}

/**
 * ????????????
 */
export enum UserStatus {
  /**
   * ??????
   */
  Enable = "ENABLE",

  /**
   * ??????
   */
  Disable = "DISABLE"
}

export interface UserInfo extends OrganizationBase {
  /**
   * ??????
   */
  imgUrl?: string;

  status: UserStatus;

  [key: string]: any;

  type: OrganizationType;
}

export interface UserService {
  /**
   * ??????????????????
   */
  getCurrentUser(): UserInfo | null;

  /**
   * ????????????????????????
   */
  getCurrentUserDept(): DepartmentInfo | null;

  /**
   * ??????????????????
   * @param deptId ????????????ID?????????????????????????????????????????????,?????????
   */
  getDepartmentsBy(
    deptIds?: string,
    filterType?: string,
    sourceType?: string,
    corpId?: string,
    excludeCorpId?: string,
    selectUserIds?: any,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    queryType?:string,
  ): Promise<{
    departments: DepartmentInfo[];
    myDepartment?: DepartmentInfo[];
  }>;

  /**
   * ??????????????????
   * @param deptId ????????????ID
   * @param roleId ????????????ID
   */
  getUsersBy(
    deptId: string,
    roleId?: string,
    filterType?: string,
    sourceType?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    queryType?: string,
  ): Promise<UserInfo[]>;

  /**
   * ?????????????????????
   * @param name ??????
   * @param deptIds ???????????? ???,?????????
   * @param roleIds ???????????? ???,?????????
   */
  search(
    name: string,
    queryType: string,
    deptIds?: string,
    roleIds?: string,
    filterType?: string,
    sourceType?: string,
    corpId?: string,
    excludeCorpId?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
  ): Promise<{
    departments?: DepartmentInfo[];
    users?: UserInfo[];
    departmentsTotal?: number;
    usersTotal?: number;
  }>;

  /**
   * ????????????ID??????????????????
   * @param userId
   */
  getUserDepartments(userId: string): Promise<OrganizationBase[] | null>;

  /**
   * ????????????ID??????????????????
   * @param userId
   */
  getOrganizationLevel(userId: string): Promise<OrganizationBase[] | null>;
  /**
   * ????????????id????????????????????????
   * @param userId/??????id
   */
  getDeptLeader(userId: string): Promise<OrganizationBase[] | null>;
}
