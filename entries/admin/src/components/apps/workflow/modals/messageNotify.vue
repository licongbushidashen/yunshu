<template>
  <a-modal
    :title="titleContent ? titleContent.title : '自定义通知设置'"
    width="500px"
    :visible="value"
    cancelText="取消"
    okText="确定"
    @cancel="closeModal"
    @ok="handleOk"
    :maskClosable="false"
  >
    <div class="message-notify">
      <div class="message-notify__item">
        <div class="label">{{ titleContent ? titleContent.emailTitle : "标题" }}</div>
        <div class="select-type">
          <a-select
            class="input-select"
            mode="tags"
            :placeholder="$t('languages.PlaceHolder.Select')"
            v-model="title"
          >
            <a-select-opt-group>
              <span slot="label" class="select-title">业务数据项</span>
              <a-select-option v-for="i in bizSummaryList" :key="i.code">
                {{
                i.name
                }}
              </a-select-option>
            </a-select-opt-group>
            <a-select-opt-group>
              <span slot="label" class="select-title">系统数据项</span>
              <a-select-option v-for="i in defaultSummaryList" :key="i.code">
                {{
                i.name
                }}
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </div>
      </div>

      <div class="message-notify__item">
        <div class="label">{{ titleContent ? titleContent.emailContent : "内容" }}</div>
        <div class="select-type">
          <template v-if="typeStatus === 'email'">
            <a-select
              class="input-select"
              mode="tags"
              :placeholder="$t('languages.PlaceHolder.Select')"
              v-model="summary"
            >
              <a-select-opt-group>
                <span slot="label" class="select-title">业务数据项</span>
                <a-select-option v-for="i in bizSummaryList" :key="i.code">
                  {{
                  i.name
                  }}
                </a-select-option>
              </a-select-opt-group>
              <a-select-opt-group>
                <span slot="label" class="select-title">系统数据项</span>
                <a-select-option v-for="i in defaultSummaryList" :key="i.code">{{ i.name }}</a-select-option>
              </a-select-opt-group>
            </a-select>
          </template>
          <template v-else>
             <a-radio-group
              class="radio-group"
              v-model="isDataItem"
              @change="summary =isDataItem? '': []"
            >
              <a-radio :value="true">视图展示格式</a-radio>
              <a-radio :value="false">自定义</a-radio>
            </a-radio-group>
            <template v-if="isDataItem">
              <a-select
                class="input-select"
                :placeholder="$t('languages.PlaceHolder.Select')"
                allowClear
                v-model="summary"
              >
                <!-- 20191217 新需求 选择查询列表 -->
                <a-select-option v-for="i in lists" :key="i.id">
                  {{
                  i.name
                  }}
                </a-select-option>
              </a-select>
              <p style="margin-top:5px;">取对应列表移动端的展示字段作为消息内容</p>
            </template>
            <template v-else>
              <a-select
                class="input-select"
                mode="tags"
                :placeholder="$t('languages.PlaceHolder.Select')"
                v-model="summary"
              >
                <a-select-opt-group>
                  <span slot="label" class="select-title">业务数据项</span>
                  <a-select-option v-for="i in bizSummaryList" :key="i.code">
                    {{
                    i.name
                    }}
                  </a-select-option>
                </a-select-opt-group>
                <a-select-opt-group>
                  <span slot="label" class="select-title">系统数据项</span>
                  <a-select-option v-for="i in defaultSummaryList" :key="i.code">{{ i.name }}</a-select-option>
                </a-select-opt-group>
              </a-select>
              <p style="margin-top:5px;">选择数据项或输入文本</p>
            </template>
          </template>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import * as listApi from '@/apis/list/list.api';

// eslint-disable-next-line import/no-extraneous-dependencies
import { State, namespace } from 'vuex-class';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'MessageNotify',
})
export default class MessageNotify extends Vue {
  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;
  @WorkflowModule.Mutation("setWorkflowListItem") setWorkflowListItem: any;

  @Prop() value!: boolean;
  @Prop() titleContent!: string;
  @Prop() typeStatus!: string;

  get defaultSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => data.defaultProperty
    );
  }

  get bizSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => !data.defaultProperty
    );
  }

  title: any = [];

  summary: any = '';

  isDataItem: boolean = false;

  lists: any = [];

  closeModal() {
    this.$emit('input', false);
  }

  handleOk() {
    const { title, summary } = this;
    if (
      (title && title.length > 0 && (!summary || !summary.length)) ||
      (summary && summary.length > 0 && (!title || !title.length))
    ) {
      this.$message.warning('标题或内容不能为空');
      return;
    }
    this.$emit('ok', { title, summary });
    this.$emit('input', false);
  }

  /*
   * 获取查询列表的列表
   */
  getLists() {
    const { bizSchemaCode } = this.$route.params;
    listApi.getList(bizSchemaCode).then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        this.lists = res.data.filter((l: any) => l.publish);
        this.setWorkflowListItem(this.lists);
      }
    });
  }

  mounted() {
    this.getLists();
  }

  @Watch('value')
  onValueChange(v: any) {
    if (v) {
      if (this.typeStatus === 'dingtalk') {
        this.isDataItem = false;
        this.title = this.curActivityProps.todoDataItem.title;
        if (typeof this.curActivityProps.todoDataItem.summary === 'string') {
          this.summary = [this.curActivityProps.todoDataItem.summary];
          this.isDataItem=true;
          return;
        }

        if (!this.curActivityProps.todoDataItem.summary) {
          this.summary = [];
          return;
        }

        let isOldData: boolean = this.curActivityProps.todoDataItem.summary.some(
          (item: any) => item.isDataItem === 0 || item.isDataItem === 1
        ) as boolean;
        if (isOldData) {
          this.summary = [];
          this.curActivityProps.todoDataItem.summary.forEach((v: any) => {
            this.summary.push(v.code);
          });
        } else {
          if (this.curActivityProps.todoDataItem.summary[0] && this.curActivityProps.todoDataItem.summary[0].hasOwnProperty('isDataItem') && this.curActivityProps.todoDataItem.summary[0]['isDataItem'] === 2) {
            this.isDataItem = true;
            this.summary = this.curActivityProps.todoDataItem.summary[0]
            ? this.curActivityProps.todoDataItem.summary[0].code
            : '';
          } else {
            this.summary = this.curActivityProps.todoDataItem.summary.length ? this.curActivityProps.todoDataItem.summary : [];
          }
        }
      } else {
        this.curActivityProps.todoDataItems &&
          this.curActivityProps.todoDataItems.forEach((v) => {
            if (v.belong === 'email') {
              this.title = v.title;
              this.summary = v.summary;
            }
          });
        this.summary = this.summary ? this.summary : [];
      }
    }
  }
}
</script>
<style lang="less" scoped>
.message-notify {
  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    &:last-of-type {
      margin-bottom: 0;
    }
    & .label {
      width: 64px;
      font-size: 14px;
      line-height: 22px;
      color: rgba(0, 0, 0, 0.65);
    }
    & .select-type {
      flex-grow: 1;
      max-width: calc(100% - 64px);
      position: relative;
      .radio-group {
        margin-bottom: 20px;
      }
      .input-select {
        width: 100%;
        &.has-error {
          border-color: #f4454e !important;
          /deep/.ant-select-selection {
            border-color: #f4454e !important;
          }
        }
      }
      p {
        position: absolute;
        font-size: 12px;
      }
    }
    .required {
      position: relative;
      &:before {
        content: '*';
        color: @error-color;
        position: absolute;
        left: -0.5em;
      }
    }
  }
  /deep/.ant-select-selection--multiple
    .ant-select-selection__rendered
    > ul
    > li {
    margin-bottom: 3px;
  }
}
</style>
