<template>
  <div class="formula-wrap">
    <section class="formula-left">
      <formula-tree @select="selectItem" :syncList="list" />
      <organization-tree  @select="selectItemOrg" />
      <role-tree  @select="selectItemOrgRole" />
    </section>
    <section class="formula-right">
      <div class="formula-editor">
        <formula-editor
          ref="editor"
          :value="content"
          :variableMap="variableMap"
          @change="setExpress"
        />
      </div>
      <div class="formula-description">{{ description || placeholder }}</div>
    </section>
  </div>
</template>
<script lang="ts">
/*
 * {} 包裹数据项
 * xxx(,) / xxx() 为函数
 */
import { Component, Vue, Prop } from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';
import FormulaTree from '@/components/apps/workflow/base/formulaTree.vue';
import OrganizationTree from "@/components/apps/workflow/modals/participant/organization.vue";
import RoleTree from "@/components/apps/workflow/modals/participant/roleTree.vue";

import WorkflowApi from '@/apis/workflow';

import FormulaEditor from '@/components/global/formula-editor/index.vue';
const DataModelModule = namespace('Apps/DataModel');
const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'Formula',
  components: {
    FormulaTree,
    FormulaEditor,
    OrganizationTree,
    RoleTree
  }
})
export default class Formula extends Vue {
  //list: any; // @WorkflowModule.State('formulaTree')

  @DataModelModule.State('bizSchemaCode') schemaCode: any; // 当前的业务模型schemaCode
  // @WorkflowModule.Action('getFormulaTree') getFormulaTree: any;

  // 原始的函数数据
  @Prop() value: any;
  // 指定编辑的类型： 参与者函数participant/条件设置函数condition
  @Prop() type?: string;
  // 所有函数方法的描述合集
  @Prop() descriptions!: Apps.Workflow.FormulaDescription[];
  // 描述占位文字
  @Prop() placeholder!: string;

  // 获取不同类型的数据时，判定函数的分支的code
  _formulaCodes: object = {};
  _formulaCode: string = '';

  // 编辑的函数内容
  content: string = '';
  // 函数描述
  description: string = '';
  // 编辑器DOM节点
  dom: any = null;
  list: Array<any> = [];

  // 变量编码映射关系
  get variableMap() {
    let map: any = {};
    if (this.list) {
      this.list.forEach((group: any) => {
        if (Array.isArray(group.children)) {
          group.children.forEach((child: any) => {
            const key: string = child.expression;
            const value: string = child.title.replace(child.expression, '');
            map[key] = value;
          });
        }
      });

      this.$nextTick(() => {
        this.dom = this.$refs.editor;
        this.dom.initEditor();
      });
    }
    return map;
  }

  mounted() {
    this.dom = this.$refs.editor;
    this.content = this.value.formula || '';
    const _type: string = this.type || 'participant';
    const _formulaCodes: any = {
      participant: 'participant',
      condition: 'function',
    };
    this._formulaCode = _formulaCodes[_type];
    this.init(_type);
  }

  init(type: string) {
    const params: Apps.Workflow.FormulaParams = {
      schemaCode: this.schemaCode,
      type
    };
    this.getFormulaTree(params);
  }
  async getFormulaTree(params: Apps.Workflow.FormulaParams){
    const res: Common.Data = await WorkflowApi.getFormulaList(params);
    if (res.errcode === 0 && Array.isArray(res.data)) {
      const _spec = params.type === 'participant' ? 'participant' : 'function';
      const _tree = res.data.map((item: Apps.Workflow.FormularItem, idx: number) => {
        const _node: Apps.Workflow.FormularTreeItem = {
          id: item.id,
          code: item.code,
          key: item.id || item.code || `${idx}`,
          title: item.displayName,
          isLeaf: false,
        };
        if (item.childrenFunctions) {
          _node.children = item.childrenFunctions.map((child: Apps.Workflow.FormularItem, j: number) => {
            const expression: string = item.code === _spec ? `${child.fullName}` : `{${child.code}}`;
            const _child: Apps.Workflow.FormularTreeItem = {
              id: child.id,
              code: child.code,
              key: child.id || child.code || `${_node.key}-${idx}-${j}`,
              title: item.code === _spec ? `${child.displayName}` : `${child.displayName}${expression}`,
              isLeaf: true,
              expression,
              parentCode: item.code
            };
            return _child;
          });
        }
        // NOTE: 前端过滤掉参与者函数中的Manager函数 2019-07-17
        if (_node.code === 'participant' && Array.isArray(_node.children)) {
          _node.children = _node.children.filter((child: Apps.Workflow.FormularTreeItem) => child.code !== 'Manager');
        }
        return _node;
      });
      this.list= _tree;
      //commit('setFormulaTree', _tree);
    }
  }
  // choose item
  selectItem(info: any) {
    const {
      isLeaf, expression, parentCode, code
    } = info;
    if (isLeaf) {
      this.setDescription(code);
      this.addContent(expression, parentCode);
    } else {
      this.description = '';
    }
  }

  selectItemOrg(info: any) {
    const {
      id, name,type
    } = info;
    this.description = `‘${name}’：${type === 1 ? '组织部门' : '部门成员'}`;
    const str = `[{\'id\':\'${id}\',\'type\':${type},\'name\':\'${name}\'}\]`;
    this.dom.insertContent(str, false, name);
  }

  selectItemOrgRole(info: any){
    const {
      id, name,type
    } = info;
    this.description = `‘${name}’：组织角色`;
    const str = `[{\'id\':\'${id}\',\'type\':2,\'name\':\'${name}\'}\]`;
    this.dom.insertContent(str, false,name);
  }
  

  // 设置描述
  setDescription(code: string) {
    const res: Apps.Workflow.FormulaDescription | undefined = this.descriptions.find((item: Apps.Workflow.FormulaDescription) => item.code === code);
    if (res) {
      // console.log(res);
      this.description = res.text;
    } else {
      this.description = '';
    }
  }

  /**
   * 往编辑区追加内容
   */
  addContent(ctx: string, parentCode: any) {
    console.log('I am inserting...', ctx);
    if (!ctx) {
      return;
    }
    // 是否直接追加到尾部
    let directlyOnTail = false;
    if (parentCode && parentCode === this._formulaCode) {
      // 当前追加的是函数表达式：自动追加到当前内容的尾部
      directlyOnTail = true;
    }
    this.dom.insertContent(ctx, directlyOnTail);

  }

  // 内容变化时传到父级
  setExpress(formula: string) {
    // console.log('set express',formula);
    this.content = formula;
    this.$emit('input', { ...this.value, formula: this.content.replace(/\s/g, '').replace(/\n/g, '').replace(/'/g, '"') });
  }
}
</script>
<style lang="less" scoped>
.formula-wrap {
  display: flex;
  justify-content: flex-start;
  min-height: 200px;
  height: calc(490 / 768 * 100 * 1vh - 15px);
  width: 100%;
  overflow: hidden;
  .formula-left {
    display: block;
    flex: none;
    width: 300px;
    height: 100%;
    // max-height: 490px;
    overflow: auto;
    background-color: #f8f8f8;
  }
  .formula-right {
    flex: 1;
    width: 400px;
    height: 100%;
    padding: 8px 16px;
    background-color: #fff;
    position: relative;
  }
  .formula-editor {
    // height: 100%;
    height: calc(100% - 125px);
    // max-height: calc(100% - 125px);
    margin-bottom: 10px;
    // textarea {
    //   width: 100%;
    //   height: 100%;
    //   border: none;
    //   resize: none;
    //   outline: none;
    //   font-size: 14px;
    //   font-family: PingFangSC-Regular;
    //   font-weight: 400;
    //   color: rgba(0, 0, 0, 0.85);
    //   line-height: 22px;
    // }
  }
  .formula-description {
    position: absolute;
    bottom: 8px;
    left: 0;
    width: 100%;
    padding: 0 16px;
    max-height: 120px;
    height: auto;
    line-height: 20px;
    font-size: 12px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    overflow: auto;
    word-break: break-all;
    user-select: none;
    -webkit-user-select: none;
  }
}
</style>
