<template>
  <div class="content-box">
    <a-table
      :columns="columns"
      :pagination="{}"
      :locale="{emptyText: $t('languages.Apps.NoData')}"
      :dataSource="dataSource"
      :scroll="{ x: totalWidth }"
      @change="onChange"
      size="small"
      class="content-box__table"
    >
      <span
        v-for="(dataitem, index) in columns"
        :key="index"
        :slot="dataitem.slots.title"
        :title="dataitem.name"
        :class="{'resize': index>0}"
        class="in-th-span"
      >{{ getTableKey(dataitem)}}</span>
      <!-- dataitem.name_i18n ? (dataitem.name_i18n[$i18n.locale] ? dataitem.name_i18n[$i18n.locale] : dataitem.name) : dataitem.name -->
      <!-- v-resize.east="{onResize: tableResize,translateX: 16}" -->
      <!-- v-resize:`${dataitem.name}`.east="{onEnd: tableResize}" -->
      <!-- v-resize.east="{onEnd: tableResize, key: dataitem.code}" -->
    </a-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';
import moment from 'moment';
import {
  DateType,
  numberType,
  DateDefaultType,
} from './modals/control-modals-map';

import {
  showFieldDefaultValByCode,
  showFieldDefaultValByType,
} from './typings';

import { utils } from "@cloudpivot/common";

const DateHandle = utils.DateHandle;

// import ListDesignHeader from '@/components/apps/list-design/listDesign-header.vue';
const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'TableList',
  components: {},
})
export default class TableList extends Vue {
  @ListdesignModule.State('showFieldArray') showFieldArray: any;

  @ListdesignModule.Mutation('setShowFieldArray') setShowFieldArrayStore: any;

  dataSourceEach: any = {};

  dataSource: any[] = [];

  columns: any[] = [];

  // 中英文字段过滤
  getTableKey(cur: any) {
    let name: any = cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale];
      }
    }
    return name;
  }

  onChange(v: any) {
    console.info(v);
  }

  totalWidth: number = 300;
  // 暂改，解决发布闪烁问题，如有问题，可撤回代码，旧代码在下面
  // @Watch('showFieldArray' ,{ deep: true })
  @Watch('showFieldArray')
  setShowFieldArray(v: any) {
    const showFieldLength: number = v.length;
    /* 重置表格 */
    if (showFieldLength < 1) {
      this.columns = [];
      this.dataSource = [];
      return;
    }

    // 组装表头配置

    this.columns = v.map((pl: any, index: number) => {
      const obj: any = {
        code: pl.code,
        name: pl.name,
        name_i18n: pl.name_i18n,
        dataIndex: pl.code,
        slots: { title: `${pl.code}_${index}Title` },
        width: parseInt(pl.width),
      };

      // if (showFieldLength !== index + 1) {
      //   obj.width = parseInt(pl.width);
      // }
      return obj;
    });

    this.columns.unshift(
      ...[
        {
          code: 'order',
          name: '序号',
          dataIndex: 'order',
          slots: { title: 'orderTitle' },
          width: 79,
        },
        // {
        //   code: 'abstract',
        //   name: '数据标题',
        //   dataIndex: 'abstract',
        //   slots: { title: 'abstractTitle' },
        //   width: 296
        // }
      ]
    );

    v.forEach((el: any) => {
      if (el.isSystem) {
        this.setSystemDataItem(el);
        return;
      }
      const showFieldDefaultVal = showFieldDefaultValByType as any;
      if (el.type !== 3) {
        this.dataSourceEach[el.code] = showFieldDefaultVal[el.type]
          ? showFieldDefaultVal[el.type]
          : '- -';
      } else {
        let format = DateType.find((s: any) => s.type === el.displayFormat);
        this.dataSourceEach[el.code] = showFieldDefaultVal[el.type] && format
          ? format.format.includes('APM') ? DateHandle.dateFormatApm(new Date(showFieldDefaultVal[el.type]), format.format) : moment(showFieldDefaultVal[el.type]).format(
              format.format || 'YYYY-MM-DD HH:mm'
            )
          : '- -';
      }
    });

    ['张三的事假申请'].forEach((x: any, i: number) => {
      this.dataSourceEach.order = i + 1;
      this.dataSourceEach.abstract = x;
      this.dataSourceEach.key = i;
      this.dataSource[i] = this.dataSourceEach;
    });
    let tableWidth: number = 0;
    this.columns.forEach((res: any) => {
      tableWidth += res.width;
    });
    this.totalWidth = tableWidth;
    this.computeWidth();
  }

  computeWidth() {
    //当前的totalWidth小于table的宽度时，重新给出序号以外的每一列的宽度赋值
    this.$nextTick(() => {
      const el = document.querySelector(
        '.content-box__table'
      ) as HTMLDivElement;
      console.log(el.clientWidth);
      if (el.clientWidth > this.totalWidth) {
        const width: number = el.clientWidth - this.totalWidth;
        const length: number = this.columns.length;
        this.columns.forEach((c) => {
          if (c.code !== 'order') {
            c.width += width / (length - 1);
          }
        });
      }
    });
  }

  /**
   * 表格宽度重置回调
   */
  tableResize(key: string, event: any) {
    this.showFieldArray.forEach((res: any) => {
      if (res.code === key) {
        res.width = +event.target.offsetWidth;
      }
    });
    // this.columns
    // ;
  }

  /**
   * 设置显示默认值
   */
  setSystemDataItem(el: any) {
    const showField = showFieldDefaultValByCode as any;
    this.dataSourceEach[el.code] = showField[el.code];
  }
}
</script>
<style lang="less" scoped>
.content-box {
  &__table {
    margin-top: 16px;
  }
  overflow: hidden;
  width: 100%;
  /deep/.ant-table-thead tr th:first-of-type {
    width: 80px !important;
    display: inline-block !important;
  }
  /deep/.ant-table-thead span.resize {
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    white-space: nowrap;
    overflow: hidden;
  }
  /deep/.ant-table-body {
    color: rgba(0, 0, 0, 0.85);
  }
}

.in-th-span{
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
