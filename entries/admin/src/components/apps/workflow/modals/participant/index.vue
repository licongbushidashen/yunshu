<template>
  <a-modal
    :visible="value"
    width="700px"
    :wrapClassName="`participant-modal ${currentView}`"
    :cancelText="'取消'" 
    :okText="'保存'"
    :confirmLoading="confirmLoading"
    @cancel="closeModal"
    @ok="handleOk"
    destroyOnClose
    :maskClosable="false"
    :keyboard="false"
  >
    <template slot="title">
      <h3>{{isNoParticipantorExr ? '自定义处理人函数' : '参与者函数'}}</h3>
      <p v-if="currentView !== 'subExpression'">
        切换至：
        <a href="javascript:;" @click="toggleView">
          {{ currentView === "formula" ? "表达式视图" : "公式视图" }}
        </a>
      </p>
    </template>
    <div>
      <component
          v-if="currentView"
          :is="currentView"
          :ref="currentView === 'expression' ? 'expression' : ''"
          :descriptions="currentView === 'formula' ? descriptions : ''"
          :placeholder="currentView === 'formula' ? placeholder : ''"
          v-model="form"
          :isNoParticipantorExr = "isNoParticipantorExr"
      />
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, namespace } from "vuex-class";
import { LINE } from "@/typings/line";

import { dealErrorCode } from "@/utils/error-tips";

import Expression from "./participant-expression.vue";
import Formula from "./formula.vue";
import subExpression from "./subExpression.vue";
import { typeF } from './findTypes';
import WorkflowApi from "@/apis/workflow";

const DataModelModule = namespace("Apps/DataModel");
const WorkflowModule = namespace("Apps/Workflow");

@Component({
  name: "ParticipantModal",
  components: {
    Expression,
    Formula,
    subExpression,
  },
})
export default class ParticipantModal extends Vue {
  @DataModelModule.State("bizSchemaCode") schemaCode: any; // 当前的业务模型schemaCode

  @WorkflowModule.State("curActivityProps") curActivityProps: any;

  // @WorkflowModule.Action('validateFormula') validateFormula: any;

  @Prop() value!: boolean;

  @Prop() data: any;

  @Prop() popupType?: string;

  @Prop() emailStatus!: boolean;

  @Prop({default: false}) isNoParticipantorExr?:boolean;

  // 函数描述合集
  descriptions: Apps.Workflow.FormulaDescription[] = [
    {
      code: "Manager",
      text:
        'Manager(x)，查找经理。这里指的是查找（某人）的直属上级。例如，Manager({Originator})-查找发起人的上级；Manager("user1")-查找数据项user1(选人控件类型)的上级；',
    },
    {
      code: "OUManager",
      text:
        'OUManager(x)，查找部门主管。这里指的是查找（某个部门/某人所在部门）的部门主管。例如，OUManager({Originator})-查找发起人所在部门的部门主管，部门主管在组织架构部门属性中显示；OUManager({"user1"})-查找数据项user1（选人控件类型）所在部门的部门主管；',
    },
    {
      code: "FindUserByRole",
      text:
        'FindUserByRole(x,y)，根据角色查找用户。这里指的是查找管理范围包含x（单个人/单个部门，不支持手动输入人的ID/部门ID）的y(角色编码)角色对应的用户，例如，FindUserByRole({Originator},"caiwu"),查找管理范围包含当前处理人的角色编码为“caiwu”的用户；',
    },
    {
      code: "ActivityParticipants",
      text:
        'ActivityParticipants(x),查找历史节点处理人。指的是根据X（节点编码），查找X节点的节点处理人，只能查找已经处理过的节点，不包含已取消的节点，如果有多人处理，则返回多人的集合；例如，ActivityParticipants("Activity7"),将返回Activity7这个节点的所有历史处理人，单人/多人集合。',
    },
    {
      code: "ExecuteBizMethod",
      text: `ExecuteBizMethod(ServiceCode,MethodName,Params),通过执行业务服务方法，返回参与者，返回类型是String或String[]。
      1.ServiceCode:业务服务编码；2.MethodName：业务服务方法名称；3.Params:参数绑定，以JSON格式传入，例如 {"param1":"param1Value"}，其中param1Value可以是一个数据项或者一个固定字符串，如果是数据项，则获取数据项的值进行传入；业务服务方法需要事先添加业务集成方法。`,
    },
    {
      code: "RecurseManager",
      text: `RecurseManager(x,y)，递归查找上级部门主管。这里指的是查找x（单个人/单个部门，目前只支持数据项和系统参数作为参数，不支持手动输入人的ID/部门ID）的部门主管，并且递归向上继续查找上级部门主管，直到找到的部门达到y级(指定级别)，y=0时，递归查找到公司根部门，数值越大部门越小。例如，RecurseManager({Originator},1)，递归查找发起人的上级部门主管，直到找到1级部门主管。`,
    },
    // 新增系统参数描述 Originator、Originator.OU、LastParticipants、LastFinisher
    // TODO 系统参数描述待补充
    {
      code: "Originator",
      text: "Originator：流程发起人",
    },
    {
      code: "Originator.OU",
      text: "Originator.OU：流程发起人所在的主部门",
    },
    {
      code: "LastParticipants",
      text: "LastParticipants：上一个活动的参与者，上个节点收到待办的所有用户",
    },
    {
      code: "LastFinisher",
      text:
        "LastFinisher：上一个活动的处理人，上个节点收到待办并且处理了待办任务的用户",
    },
    // 新增系统数据项描述 creater、createdDeptId、owner、ownerDeptId、modifier
    {
      code: "creater",
      text: "creater：首次填写流程表单的用户",
    },
    {
      code: "createdDeptId",
      text: "createdDeptId：首次填写流程表单用户的主部门",
    },
    {
      code: "owner",
      text:
        "owner：流程的拥有者，默认是创建人，如果表单里面有拥有者部门数据项，会取拥有者部门的值，可以设置任意用户为拥有者，相当于替其他人发起流程，只有拥有者才能从“我的流程”看到这条数据。",
    },
    {
      code: "ownerDeptId",
      text:
        "ownerDeptId：拥有者所在部门，当拥有者有多个部门，创建数据的时候提交表单时选择的部门就是拥有者部门。",
    },
    {
      code: "modifier",
      text: "modifier：上一次修改数据的修改人",
    },
    // 新增家校通特有查询： FindParentsMethod、FindTeacherMethod
    {
      code: "FindParentsMethod",
      text:
        "FindParents(X)，根据学生x找家长y，X可以是发起人也可以是选人控件或者历史处理人，如果有多个家长，会找到多人。",
    },
    {
      code: "FindTeacherMethod",
      text:
        "FindTeacher(X)，根据学生x找班主任y，X可以是发起人也可以是选人控件或者历史处理人，1个班级最多1个班主任，没有设置班主任时，返回空。",
    },
    // 新增递归查找部门主管函数（自下而上）
    {
      code: "OUManagerOf",
      text:
        "OUManagerOf(x,y)，查找指定层级的部门主管。这里指的是以x为基础，向上查找第y级部门的部门主管，X指单个人/单个部门，目前只支持数据项和系统参数作为参数，不支持手动输入用户ID/部门ID。示例：OUManagerOf({Originator},2)：查找到发起人上上级部门的部门主管。",
    },
    {
      code: "RecurseManagerOf",
      text:
        "RecurseManagerOf(x,y)，逐级查找部门主管。这里指的是查找x的部门主管，并递归向上继续查找部门主管，向上查找几级由y定义，X指单个人/单个部门，目前只支持数据项和系统参数作为参数，不支持手动输入用户ID/部门ID。示例：RecurseManagerOf({Originator},2)：查找到发起人的部门主管，并继续向上查找2级部门主管，即查找到3个人，分别为发起人的部门主管、发起人上级部门的部门主管、发起人上上级部门的部门主管。",
    },
  ];

  // 描述默认文字
  placeholder: string = `支持数据项、系统参数、函数输入。
函数输入需要填入参数，参数支持数据项、系统参数、常量；
参数格式要求：数据项、系统参数用{}包裹，常量用""（英文）包裹，例如OUManager({LastParticipants}),OUManager("cloudpivotUser")`;

  // 数据
  form: Apps.Workflow.ParticipantForm = {
    expression: "",
    formula: "",
    subExpression: "",
  };

  currentView: string = "";

  confirmLoading: boolean = false;

  mounted() {
    this.$nextTick(() => {
      this.Init();
    })
  }

  /**
   * 初始化
   */
  Init() {
    const triggerMapping = this.curActivityProps.commonSettings
      .triggerMappingObj;
    const triggerMappingData = triggerMapping || { mainTable: 0, code: "main" };
    // 子流程触发对象为子表时，参与者弹窗为子流程表达式弹窗
    if (triggerMappingData.mainTable === 1) {
      this.form.subExpression = this.data;
      this.currentView = "subExpression";
      return;
    }
    if (!this.data) {
      this.currentView = "expression";
      return;
    }

    if (this.popupType === LINE.popupTypes.expression) {
      this.form.expression = this.data;
      this.currentView = "expression";
    } else if (this.popupType === LINE.popupTypes.function) {
      this.form.formula = this.data;
      this.currentView = "formula";
    } else if (
      /^(Manager|OUManager|FindUserByRole|FindDepHeadByField|FindDepHeadByDep|FindUsersByDirectSupervisor)\(([^()]+?)\)$/.test(this.data) ||
      /^\[.*\]$/.test(this.data)
    ) {
      this.form.expression = this.data;
      this.currentView = "expression";
    } else {
      this.form.formula = this.data;
      this.currentView = "formula";
    }
  }

  /**
   * 切换视图
   */
  toggleView() {
    this.currentView =
      this.currentView === "expression" ? "formula" : "expression";
  }

  /**
   * 关闭
   */
  closeModal() {
    this.$emit("close");
  }

  isRepeat(arr: any[]) {
    let hash:any = {};
    for (const i in arr) {
      if (hash[arr[i]]) return true;
      hash[arr[i]] = true;
    }
    return false;
  }

  /**
   * 处理确认按钮事件
   */
  handleOk() {
    const vm: any = this;
    let result = vm.form[`${vm.currentView}`];

    // 校验数据是否填写
    if (vm.$refs.expression) {
      const validate:boolean = this.validDataList();
      if (!validate) {
        return;
      }
    }
    console.log(result, 'result');
    if (!result) {
      this.submit("");
      return;
    }

    if (vm.currentView === 'formula') {
      if (Array.isArray(result)) {
        result = JSON.stringify(result);
      } else if (typeof result === "string") {
        const list = result.split("+");
        const repeat = this.isRepeat(list);
        if (repeat) {
          this.$message.error("选择不能重复");
          return;
        }
      }
    }

    // this.submit(result);
    const params: Apps.Workflow.ValidateFormulaParams = {
      function: result,
      schemaCode: this.schemaCode,
    };
    this.confirmLoading = true;
    WorkflowApi.validateFormula(params).then((res: Common.Data) => {
      if (res.errcode === 0) {
        this.submit(result);
      } else {
        dealErrorCode(res, this);
      }
      this.confirmLoading = false;
    }).catch(() => {
      this.confirmLoading = false;
    })
  }

  /**
   * 提交
   */
  submit(formula: string) {
    this.$emit("submit", {
      formula,
      popupType:
        this.currentView === "expression"
          ? LINE.popupTypes.expression
          : LINE.popupTypes.function,
    });
  }

  validDataList() {
    const dataList:any = (this as any).$refs.expression.dataList;
    if (!Array.isArray(dataList) || dataList.length === 0) {
      return true;
    }
    let validate:boolean = true;
    for(const item in dataList) {
      const itemValue:any = dataList[item];
      if (itemValue.type === typeF.FindOrg) {
        if (Array.isArray(itemValue.org) && itemValue.org.length === 0) {
          this.$message.error("按组织架构查找(选项)不能为空");
          validate = false;
          break;
        }
      }
      else if (itemValue.type === typeF.FindDepHeadByField) {
        if (itemValue.value === '') {
          this.$message.error("按字段查找主管不能为空");
          validate = false;
          break;
        } else {
          if (itemValue.value === itemValue.department.value) {
            if (itemValue.department.selectValue === '') {
              this.$message.error("按字段查找主管(选项)不能为空");
              validate = false;
              break;
            }
          } else if (itemValue.value === itemValue.manager.value) {
            if (itemValue.manager.selectValue === '') {
              this.$message.error("按字段查找主管(选项)不能为空");
              validate = false;
              break;
            }
          }
        }
      }
      else if (itemValue.type === typeF.FindDepHeadByDep) {
        if (Array.isArray(itemValue.manager) && itemValue.manager.length === 0) {
          this.$message.error("按指定部门查找主管不能为空");
          validate = false;
          break;
        }
      }
      else if (itemValue.type === typeF.FindUserByRole) {
        if (!itemValue.manage) {
          this.$message.error("按角色找人(查找管辖范围)不能为空");
          validate = false;
          break;
        } else {
          if (Array.isArray(itemValue.role && itemValue.role.length === 0)) {
            this.$message.error("按角色找人(角色)不能为空");
            validate = false;
            break;
          } else if (!itemValue.role) {
            this.$message.error("按角色找人(角色)不能为空");
            validate = false;
            break;
          }
        }
      }
      else if (itemValue.type === typeF.FindUsersByDirectSupervisor) {
        if (!itemValue.initiator) {
          this.$message.error("按按直属主管找人(发起人)不能为空");
          validate = false;
          break;
        }
      }
    }
    return validate;
  }

  @Watch("value")
  onShowChange(v: boolean) {
    this.form.expression = "";
    this.form.formula = "";
    this.form.subExpression = "";
    if (v) {
      this.Init();
    } else {
      setTimeout(() => {
        this.currentView = "";
      }, 500);
    }
  }
}
</script>
<style lang="less">
.participant-modal {
  // z-index: 100000;
  .ant-modal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 48px;
    font-weight: 400;
    p {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
    a {
      color: @primary-color;
      text-decoration: none;
    }
  }
  &.formula {
    .ant-modal-body {
      padding: 0;
    }
  }
}
</style>
