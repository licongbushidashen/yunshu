<template>
  <div>
    <ul class="alledit-ul">
      <li>· 批量编辑后无法撤销，请谨慎操作。</li>
      <li>· 逻辑、地址、人员单选、人员多选、部门单选、部门多选、混选、关联单选、关联多选不支持批量编辑</li>
    </ul>
    <a-row :gutter="20" class="row row-herder">
      <a-col :span="10">需要修改的字段</a-col>
      <a-col :span="11">批量修改为</a-col>
      <a-col :span="3">操作</a-col>
    </a-row>
    <template v-for="(item, i) in formData">
      <a-row :gutter="20" class="row" :key="i">
        <a-col :span="10">
          <a-select v-model="item.key" @change="onHandleData">
            <a-select-option
              v-for="s of filteredOptions(i)"
              :key="s.key"
              :value="s.key"
              :title="s.options.name"
              :type="s.type"
              :index="i"
              :options="s.options"
            >{{ $i18n.locale == 'zh' ? s.options.name : s.options.name_i18n }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="11">
          <template v-if="[1,2].includes(item.type)">
            <!-- 短文本,长文本 -->
            <a-input
              v-model="item.value"
              :maxlength="item.options.maxLength"
              :placeholder="item.options.placeholder"
            />
          </template>
          <template v-else-if="item.type === 3">
            <!-- 日期 -->
            <a-date-picker
              style="min-width:100%;"
              v-model="item.value"
              :showTime="true"
              :format="item.options.format"
              :valueFormat="item.options.format"
              placeholder="请选择"
            />
          </template>
          <template v-else-if="item.type === 4">
            <!-- 数值 -->
            <a-input
              min="0"
              type="number"
              @change="changeNumber(item)"
              v-model="item.value"
              :placeholder="item.options.placeholder"
            />
          </template>
          <template v-else-if="item.type === 5">
            <!-- 单选 -->
            <a-select
              :getPopupContainer="getPopupContainer"
              v-model="item.value"
              show-search
              placeholder="请选择"
            >
              <a-select-option v-for="s in item.options.options" :key="s" :title="s" :value="s">{{s}}</a-select-option>
            </a-select>
          </template>
          <template v-else-if="item.type === 6">
            <!-- 复选 -->
            <a-select
              :getPopupContainer="getPopupContainer"
              v-model="item.value"
              mode="multiple"
              :maxTagCount="2"
              show-search
              placeholder="请选择"
            >
              <a-select-option v-for="s in item.options.options" :key="s" :title="s" :value="s">{{s}}</a-select-option>
            </a-select>
          </template>
          <template v-else-if="item.type === 7 || item.type === 19">
            <!-- 下拉 -->
            <a-select
              :getPopupContainer="getPopupContainer"
              v-model="item.value"
              :mode="item.options.multi ? 'multiple' : ''"
              :maxTagCount="2"
              show-search
              placeholder="请选择"
            >
              <a-select-option v-for="s in item.options.options" :key="s" :title="s" :value="s">{{s}}</a-select-option>
            </a-select>
          </template>
        </a-col>
        <a-col :span="3">
          <span class="delete" @click="delRows(i)">
            <i class="icon aufontAll h-icon-all-delete-o"></i>
          </span>
        </a-col>
      </a-row>
    </template>
    <div class="add" v-if="formData.length < GetList.length">
      <span>
        <i class="icon aufontAll h-icon-all-plus-o"></i>
      </span>
      <span @click="addRows()">新增字段</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
// import { Button, Tooltip, Icon, Modal } from "@h3/antd-vue";

interface EditObject {
  key: string;
  type: number;
  value: any;
  options: object;
}

@Component({
  name: 'AllEdit',
  components: {
    // AButton: Button
  },
})
export default class AllEdit extends Vue {
  @Prop() data!: Array<any>;
  formData: Array<EditObject> = [
    {
      key: '',
      type: 1,
      value: '',
      options: {
        maxLength: 200,
        placeholder: '请输入',
      },
    },
  ];

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  get GetList() {
    const type = [1, 2, 3, 4, 5, 6, 7, 19];
    console.log(this.data, 'this.data');
    const arr = this.data.filter((d: any) => {
      if (type.includes(d.type) && d.key !=='rowStatus') {
        let f = d.type === 1 && d.options.noRepeat;
        if (!f) {
          if (
            d.options.hasOwnProperty('options') &&
            d.options.options &&
            d.options.options.indexOf(';') > -1
          ) {
            d.options.options = d.options.options.split(';');
          } else if (Array.isArray(d.options.options)) {
            d.options.options = d.options.options;
          } else {
            d.options.options = [];
          }
          return d;
        }
      }
    });
    return arr;
  }

  filteredOptions(index: any) {
    return this.GetList.filter((o) => {
      let arr = this.formData.map((d) => d.key);
      arr = arr.filter((d) => d !== this.formData[index].key);
      return !arr.includes(o.key);
    });
  }

  mounted() {
    console.log(this.data);
  }

  addRows() {
    let flag = this.formData.every((d) => {
      return d.key && d.value;
    });

    if (!flag) {
      this.$message.warning('请先完善当前数据设置');
      return false;
    }

    this.formData.push({
      key: '',
      type: 1,
      value: '',
      options: {
        maxLength: 200,
        placeholder: '请输入',
      },
    });
  }

  delRows(index: number) {
    this.formData.splice(index, 1);
  }

  onHandleData(value: any, obj: any) {
    console.log(value, obj.data.attrs, 'obj.data.attrs');
    if (value && obj.data.attrs) {
      const { index, type, options } = obj.data.attrs;
      this.formData[index].type = type;
      this.formData[index].value = undefined;
      this.formData[index].options = options;
    }
  }

  emits() {
    this.$emit('change', this.formData);
  }

  changeNumber(number) {
    if (number.value && number.value.length > 16) {
      number.value = number.value.slice(0,16)
    }
  }
}
</script>
<style lang="less" scoped>
.alledit-ul {
  li {
    font-size: 14px;
    color: #bababa;
  }
}
.row {
  height: 38px;
  line-height: 38px;
  font-size: 14px;
  box-shadow: 0px 1px 0px 0px #e9e9e9;
  .ant-col {
    line-height: 38px;
    position: relative;
    input,
    select,
    div {
      position: absolute;
      left: 10px;
      top: 3px;
      width: calc(100% - 20px) !important;
    }
  }
}
.row-herder {
  margin-top: 16px;
  font-weight: 500;
  background: #fafafa;
  border-radius: 4px 4px 0px 0px;
}
.add {
  margin-top: 8px;
  color: @primary-color;
  cursor: pointer;
  text-align: center;
  margin-right: 24px;
  clear: both;
  span {
    margin-right: 8px;
  }
}
</style>
