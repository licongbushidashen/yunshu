<template>
  <div class="key-value">
    <div class="content-top">
      <div class="query-box">
        <a-input
          :placeholder="'搜索中文名称或代码'"
          v-model="keyWords"
        >
          <a-icon
            v-if="keyWords"
            slot="suffix"
            type="close-circle"
            class="del-icon delete"
            @click="clearKeyWords"
          />
          <a-icon slot="prefix" type="search" class="del-icon" />
        </a-input>
      </div>
    </div>

    <div class="content" ref="content">
      <list :columns="columns" :dataSource="data" :keyWords="keyWords">
        <template slot="titleName" slot-scope="{record}">
          {{record.title}}<span style="color: red">*</span>
        </template>

        <template slot="index" slot-scope="{record}">
          <template>
            {{  getIndex(record.code) }}
          </template>
        </template>
        <template slot="name" slot-scope="{record}">
          <template>
            <a-input :disabled="record.initialUsed" placeholder="请输入" v-model="record.name" />
          </template>
        </template>
        <template slot="code" slot-scope="{record}">
          <template>
            <a-input :disabled="record.initialUsed" placeholder="请输入" v-model="record.code" />
          </template>
        </template>
        <template slot="status" slot-scope="{record}">
          <a-switch :disabled="record.initialUsed" default-checked v-model="record.status" size="small" />
        </template>
        <template slot="operation" slot-scope="{record}">
          <div class="operation-btns">
            <template v-if="record.isNew">
              <span class="delete" @click="del(record)">
                <a-icon type="delete" />
              </span>
            </template>

            <span class="more handles"><a-icon type="more"/><a-icon type="more"/></span>
          </div>
        </template>
      </list>
      <div class="list-btns">
        <span @click="addOne()"><a-icon type="plus" />添加</span>
        <span @click="addMoreVisible = true"><a-icon type="plus"/>批量添加</span>
      </div>
    </div>

    <!-- 新增字典弹窗 -->
    <a-modal
      v-model="addMoreVisible"
      width="800px"
      height="600px"
      title="批量添加"
      @cancel="addMoreVisible = false"
      :maskClosable="false"
      :closable="true"
      @ok="addMoreOk"
    >
      <a-textarea
        v-model="addMoreDatas"
        placeholder="每行为一个数据项，数据项的名称和代码可以采用“=”分割，如果不采用“=”分割，那么输入内容为名称，代码由系统生成"
        :rows="16"
      />
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import List from "./list.vue";

@Component({
  name: "keyValue",
  components: {
    List
  }
})
export default class keyValue extends Vue {
  @Prop({
    default: false,
  })
  isEdit!: boolean;

  @Prop({
    default: [],
  })
  recordsData!: any[];

  created() {
    this.data = this.recordsData;
  }

  getDictionaryList(){
    this.data = this.data.filter(el => ~el.name.indexOf(this.keyWords) || ~el.code.indexOf(this.keyWords))
  }

  addMoreVisible: boolean = false;

  keyWords: string = "";
  clearKeyWords() {
    this.keyWords = "";
  }
  checkedDatas: any[] = [];
  onSelectChange(selectedRowKeys) {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.checkedDatas = selectedRowKeys;
  }
  //列表数据
  data: any[] = [];
  loading: boolean = false;
  gotoInfo() {}

  oneData: any = {
    name: "",
    code: "",
    status: true,
  };
  addMoreDatas: string = "";

  //   删除
  del(record) {
    console.log(record);
    this.data.splice(record.index-1, 1)
  }
  //   添加
  addOne(options) {
    let oneData: any = {};
    if (options) {
      oneData = { ...options };
    } else {
      oneData = { ...this.oneData };
    }
    oneData._id = Math.random() + "";
    oneData.isNew = true;
    if(oneData.code === ''){
      oneData.code = 'code' + (Math.floor(Math.random() * 10000000)) + ((+new Date() + '').slice(-7))
    }

    this.data.push(oneData);
    setTimeout(()=>{
      // @ts-ignore
      document.querySelector('.add-data-dictionary').scrollTop = document.querySelector('.add-data-dictionary').scrollHeight + 400;
      let inputs = document.querySelectorAll('.key-value-table .ant-table-row input')
      // @ts-ignore
      inputs && inputs[inputs.length - 2].focus()
    },100)
  }
  addMore() {
    this.addMoreVisible = true;
  }
  addMoreOk() {
    // 批量添加
    let addMoreDatas = [];
    if (this.addMoreDatas) {
      // @ts-ignore
      addMoreDatas = this.addMoreDatas.split("\n");
    }
    addMoreDatas.forEach((el) => {
      // @ts-ignore
      let keyVal: any[] = el.split("=");
      if (keyVal[0]) {
        this.addOne({
          name: keyVal[0],
          code: keyVal[1] || "",
          status: true,
        });
      }
    });
    this.addMoreVisible = false;
    this.addMoreDatas = "";
  }

  columns = [
    {
      title: "序号",
      dataIndex: "index",
      scopedSlots: { customRender: "index" },
      align: "center",
      width: 60,
    },
    {
      title: "中文名称",
      dataIndex: "name",
      slots:{title: 'titleName'},
      scopedSlots: { customRender: "name" },
      align: "left",
      width: 310,
    },
    {
      title: "代码",
      dataIndex: "code",
      scopedSlots: { customRender: "code" },
      align: "left",
      width: 210,
    },
    {
      title: "启用",
      dataIndex: "status",
      align: "left",
      scopedSlots: { customRender: "status" },
      width: 70,
    },
    {
      title: "操作",
      dataIndex: "operation",
      align: "left",
      scopedSlots: { customRender: "operation" },
      width: "auto",
    },
  ];

  @Watch("recordsData")
  onDataChange(val) {
    this.recordsData.forEach((el, index) => {
      el.index = index + 1;
    });
    this.data = this.recordsData;
    this.$emit("recordsDataChange", val);
  }

  getIndex(code) {
    let result = this.data.filter((item)=>{
      return !item.deleted;
    });
    let currentIndex = result.findIndex((item) => {
      return item.code === code;
    });
    return currentIndex + 1;
  }
}
</script>
<style lang="less" scoped>
.content-top {
  padding-bottom: 10px;
  overflow: hidden;
  .query-box {
    width: 240px;
    float: right;
  }
}
.content {
  margin-top: 0px;
  .list-btns {
    padding: 10px;
    background: #f4f5f9;
    text-align: center;
    span {
      display: inline-block;
      padding: 5px 10px;
      cursor: pointer;
      color: #17bc94;
      i {
        display: inline-block;
        margin-right: 5px;
      }
    }
  }
}

.operation-btns {
  width: 100%;
  text-align: center;
  span {
    cursor: pointer;
  }
  .delete {
    margin-right: 8px;
  }
  .more {
    i {
      font-size: 16px;
      &:nth-child(2) {
        margin-left: -8px;
      }
    }
  }
}
</style>
<style lang="less">
.key-value .ant-table-small > .ant-table-content > .ant-table-body {
  margin: 0;
}
</style>
