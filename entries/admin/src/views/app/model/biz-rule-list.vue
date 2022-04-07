<template>
  <!-- <div class="biz-rule-list"> -->
  <div class="biz-rule-list">
    <div class="form clearfix">
      <div class="btn-group">
        <a-dropdown>
          <a-button class="btn" type="primary">
            <i class="icon aufontAll h-icon-all-plus-o"></i>
            {{ $t('languages.Apps.AddNew') }}
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item @click="opBizDesign('dataOperation', 'dataOperation', true)">
              <div>数据操作</div>
            </a-menu-item>
            <a-menu-item @click="opBizDesign('regularOperation', 'regularOperation', true)">
              <div>定时作业</div>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <div class="table">
      <a-table
        :columns="columns"
        size="small"
        :pagination="false"
        :loading="false"
        :dataSource="dataSource"
        rowKey="id"
        id="dataitem"
      >
        <span slot="indexTitle">{{ $t('languages.NO') }}</span>
        <span slot="codeTitle" class="resize">规则编码</span>
        <span slot="nameTitle" class="resize">规则名称</span>
        <span slot="bizRuleTypeTitle" class="resize">规则类型</span>
        <span slot="available" class="resize">状态</span>
        <span slot="actionTitle" class="resize">{{ $t('languages.Apps.Action') }}</span>
        <!-- 数据插槽 -->
        <!-- <p
          slot="index"
          slot-scope="text, record"
          v-if="!record.defaultProperty"
        >
          {{ text }}
        </p>
        <p
          slot="code"
          class="text-ellipsis"
          slot-scope="text, record"
          v-if="!record.defaultProperty"
          :title="text"
        >
          <span v-hight-light="{'keyWords': keyWords, 'value': text }">
          </span>
        </p>
        <p
          slot="name"
          class="text-ellipsis"
          slot-scope="text, record"
          v-if="!record.defaultProperty"
        >
          <span v-hight-light="{'keyWords': keyWords, 'value': text }">
          </span>
        </p>-->
        <span slot="bizRuleType" slot-scope="text,record">
          <template v-if="text === 0">数据操作</template>
          <template v-if="text === 1">获取集合</template>
          <template v-if="text === 2">定时任务</template>
          <!-- {{ text }} -->
        </span>
        <span class="is-enabled" :class="{'_enabled': record.enabled}" slot="availableType" slot-scope="text, record">
          {{ record.enabled ? '生效' : '失效' }}
        </span>
        <span class="action right" slot="action" slot-scope="text,record">
          <i
            class="icon aufontAll h-icon-all-edit-o"
            @click="opBizDesign(record.id,record.code, false)"
          ></i>
          <i
            class="icon aufontAll h-icon-all-delete-o"
            @click="deleteItem(record)"
            v-if="!record.defaultRule"
          ></i>
          <i
            class="icon aufontAll h-icon-all-confluence-o"
            @click="showQuote(record)"
          ></i>
        </span>
      </a-table>
    </div>
    <!-- 查看引用 -->
    <a-drawer
      title="查看引用"
      width="850"
      placement="right"
      @close="onCloseQuote"
      :closable="true"
      :visible="quoteVisible"
      v-if="quoteVisible"
      wrapClassName="quote-drawer"
    >
      <p class="summary">当前业务规则引用了以下{{quoteTableData?quoteTableData.length:0}}个数据项</p>
      <a-table size="middle" class="quoteTable" :pagination="false" :columns="quoteTableColumns" :dataSource="quoteTableData">
        <template slot="index" slot-scope="text, record, index">{{index+1}}</template>
        <template slot="quotename" slot-scope="text, record">{{$route.params.bizSchemaCode==record.quoteCode?"本模型":text}}</template>
      </a-table>
    </a-drawer>
  </div>
  <!-- </div> -->
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { bizpropertyApi } from '@cloudpivot/api';

@Component({
  name: 'biz-rule-list',
  components: {},
})
export default class BizRuleList extends Vue {
  dataSource = [];
  // 表格配置
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'index' },
      width: 100,
      key: 'index',
      align: 'center',
    },
    {
      dataIndex: 'code',
      key: 'code',
      slots: { title: 'codeTitle' },
      scopedSlots: {
        customRender: 'code',
      },
      align: 'left',
      width: 300,
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: {
        customRender: 'name',
      },
      key: 'name',
      align: 'left',
      width: 250,
    },
    {
      dataIndex: 'bizRuleType',
      slots: { title: 'bizRuleTypeTitle' },
      scopedSlots: { customRender: 'bizRuleType' },
      key: 'bizRuleType',
      align: 'left',
      width: 300,
    },
    {
      dataIndex: 'bizRuleTypeTitle',
      slots: { title: 'available' },
      scopedSlots: { customRender: 'availableType' },
      align: 'left',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      width: 120,
      key: 'action',
      align: 'right',
    },
  ];

  quoteVisible: boolean = false;

  // 查看引用表格配置
  quoteTableColumns=[
    {
      title:'序号',
      with:158,
      scopedSlots: { customRender: 'index' },
    },
    {
      title:'引用节点',
      dataIndex:'nodeName',
      with:208
    },
    {
      title:'业务模型',
      dataIndex:'quoteName',
      scopedSlots: { customRender: 'quotename' },
    },
    {
      title:'数据项',
      dataIndex:'quotePropertyName'
    },
  ];

  // 查看引用表格配置
  nodes: Array<any>= [];
  get quoteTableData(){
    let result=[];
    this.nodes.forEach(node => {
      if(Array.isArray((node as any).propertyModels)){
        node.propertyModels.forEach(item => {
          // @ts-ignore
          result.push({nodeName:node.nodeName,...item})
        });
      }
    });
    return result;
  }

  created() {
    this.loadData();
  }

  loadData() {
    const params = {
      schemaCode: this.schemaCode,
    };
    bizpropertyApi.listBySchemacode(params).then((res) => {
      if (res.errcode === 0) {
        this.dataSource = res.data.map((item, index) => {
          return {
            index: index + 1,
            ...item,
          };
        });
      }
    });
  }

  opBizDesign(id: string, code: string, edit: boolean) {
    this.$router
      .push({
        name: 'biz-rule',
        params: { bizRuleCode: id },
        query: { isEdit: `${edit}`, code: code },
      })
      .catch((err: any) => {
        err;
      });
  }

  deleteItem(items: any) {
    const vm: any = this;
    // const { published } = e;
    // const content = published ? this.$t('languages.Apps.DeleteTipsContent') : '';
    const params = {
      id: items.id,
    };
    vm.$confirm({
      title: '确定删除该业务规则么？',
      content: '',
      okText: this.$t('languages.Ok').toString(),
      cancelText: this.$t('languages.Cancel').toString(),
      onOk() {
        bizpropertyApi.businessruleDelete(params).then((res) => {
          if (res.errcode === 0) {
            vm.$message.success('删除成功！');
            vm.loadData();
          } else {
            vm.$message.error(res.errmsg);
          }
        });
      },
    });
  }

  showQuote(item){
    bizpropertyApi.businessruleQuote({id:item.id}).then((res)=>{
      if(res.errcode!==0){
        return this.$message.error((res as any).errmsg);
      }
      this.nodes = res.data?res.data.nodes:[];
      this.quoteVisible = true;
    })
  }

  onCloseQuote(item){
    this.nodes = [];
    this.quoteVisible = false;
  }

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }
}
</script>
<style lang="less" scoped>
.biz-rule-list {
  margin: 0 24px;
  .form {
    margin: 16px 0;
    .btn-group {
      float: right;
      .btn {
        .icon {
          margin-right: 9px;
        }
      }
    }
  }
  .action {
    .h-icon-all-delete-o {
      margin-left: 18px;
    }
    .h-icon-all-confluence-o {
      margin-left: 18px;
    }
  }
  .table {
    /deep/.ant-table {
      border: 0;
      border-bottom: 1px solid #e8e8e8;
    }
    /deep/.ant-table-body {
      max-height: calc(100vh - 218px) !important;
      overflow-y: unset;
    }
    /deep/.ant-table-thead {
      tr {
        background: #fafafa;
        th {
          & > div {
            font-weight: 600;
            color: rgba(0, 0, 0, 0.85);
            border-right: 1px solid #e8e8e8;
          }
          &:last-child {
            & > div {
              border-right: 0;
            }
          }
        }
      }
    }
  }
}
.quote-drawer{
  p.summary{
    margin: 3px 0 20px;
  }
}

.is-enabled {
  display: inline-block;
  width: 40px;
  height: 20px;
  line-height: 18px;
  text-align: center;
  border: 1px solid #FFC5C2;
  background-color: #FFF1F0;
  color: #F4454E;
  border-radius: 4px;
  font-size: 12px;

  &._enabled {
    border: 1px solid #88E3C3;
    color: #17BC94;
    background: #E8FCF4;
  }
}
</style>
