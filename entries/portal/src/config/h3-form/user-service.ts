import { renderer } from "@cloudpivot/form";

import { organizationApi } from "@cloudpivot/api";

import { userApi } from "@cloudpivot/api";

export class DefaultUserService implements renderer.UserService {
  getCurrentUser() {
    const json = sessionStorage.getItem("user");
    if (json) {
      const user = JSON.parse(json);
      user.type = renderer.OrganizationType.User;

      user.departments = [
        {
          id: user.departmentId,
          name: user.departmentName,
          type: renderer.OrganizationType.Department,
          leaf: false,
          employees: 0
        }
      ];

      return user;
    }
    return null;
  }

  getCurrentUserDept() {
    const user = this.getCurrentUser();
    if (!user || user.departments.length === 0) {
      return null;
    }
    return user.departments[0];
  }

  async getDepartmentsBy(
    deptIds?: string,
    filterType?: string,
    sourceType?: string,
    corpId?: string,
    excludeCorpId?: string,
    selectUserIds?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    queryType?: string,
  ): Promise<{
    departments: renderer.DepartmentInfo[];
    myDepartment?: renderer.DepartmentInfo[];
  }> {
    const res = await organizationApi.getOrgTree(
      deptIds,
      filterType,
      sourceType,
      corpId,
      excludeCorpId,
      selectUserIds,
      workflowInstanceId,
      activityCode,
      formRootDeptIds
    );
    const data = res.data;

    const map = (d: any) => {
      if (!d) return {};
      d.type = renderer.OrganizationType.Department;
      return d;
    };

    const departments = data.departmentList.filter((item: any) => !!item).map(map);

    let myDepartment: renderer.DepartmentInfo[] | undefined;

    if (data.myDepartment) {
      myDepartment = data.myDepartment.filter((item: any) => !!item).map(map);
    }

    return {
      departments,
      myDepartment
    };
  }

  async getUsersBy(
    deptId: string,
    roleId?: string,
    filterType?: string,
    sourceType?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string
  ): Promise<renderer.UserInfo[]> {
    const res = await organizationApi.getUsersTree(
      deptId,
      roleId,
      filterType,
      sourceType,
      workflowInstanceId,
      activityCode,
      formRootDeptIds
    );
    const data = res.data;

    const map = (d: any) => {
      d.type = renderer.OrganizationType.User;
      if (Array.isArray(d.departments)) {
        d.parentId = d.departments.filter((f: any) => f && f.id).map((m: any) => m.id);
      }
      return d;
    };

    const users = data.map(map);
    return users;
  }

  async search(
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
    formRootDeptIds?: string
  ): Promise<{
    departments?: renderer.DepartmentInfo[];
    users?: renderer.UserInfo[];
    departmentsTotal?: number;
    usersTotal?: number;
  }> {
    const res = await organizationApi.search(
      name,
      queryType,
      deptIds,
      roleIds,
      filterType,
      sourceType,
      corpId,
      excludeCorpId,
      workflowInstanceId,
      activityCode,
      formRootDeptIds
    );
    const data = res.data;

    let departments: renderer.DepartmentInfo[] | undefined;
    let users: renderer.UserInfo[] | undefined;
    let departmentsTotal: number | undefined = data.departmentsTotal;
    let usersTotal: number | undefined = data.usersTotal;

    if (data.departments) {
      departments = data.departments
        .filter((item: any) => !!item)
        .map((d: any) => {
          d.type = renderer.OrganizationType.Department;
          return d;
        });
    }

    if (data.users) {
      users = data.users.map((u: any) => {
        u.type = renderer.OrganizationType.User;
        if (Array.isArray(u.departments)) {
          u.parentId = u.departments.filter((d: any) => d && d.id).map((d: any) => d.id);
        }
        return u;
      });
    }

    return {
      departments,
      users,
      departmentsTotal,
      usersTotal
    };
  }

  async getUserDepartments(userId: string) {
    const res = await userApi.getUserDepartments(userId);
    if (res.errcode !== 0 || !res.data) {
      return null;
    }
    return res.data.map((d: any) => ({
      id: d.deptId,
      name: d.deptName
    }));
  }

  async getOrganizationLevel(userId: string) {
    const res = await userApi.getOrganizationLevel(userId);
    if (res.errcode !== 0 || !res.data) {
      return null;
    }
    return res.data as any;
  }
  async getDeptLeader(userId: string) {
    const res = await userApi.getDeptLeader(userId);
    if (res.errcode !== 0 || !res.data) {
      return null;
    }
    return res.data as any;
  }
}
