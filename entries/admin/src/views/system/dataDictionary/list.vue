<template>
  <div class="data-list">
    <div class="list-header">
      <div
        class="th"
        :key="item.key"
        :style="{
          width: item.width + 'px',
          textAlign: item.align ? item.align : 'center',
        }"
        scope="col"
        v-for="item in columns"
      >
        <slot :record="item" :name="item.slots.title" v-if="item.slots && item.slots.title"/>
        <template v-else >{{ item.title }}</template>
      </div>
    </div>
    <draggable
      :list="list"
      :options="dragOptions"
      @end="onEnd"
      handle=".handles"
      tag="div"
    >
      <template v-for="item in list">
        <div class="list-item" :key="item.id" v-if="(~item.name.indexOf(keyWords) || ~item.code.indexOf(keyWords)) && !item.deleted">
          <div class="td" :key="n" :style="{textAlign: v.align ? v.align : 'center',width: v.width + 'px'}"
              v-for="(v,n) in columns">
            <slot :name="v.scopedSlots.customRender" :record="item" :text="item[v.key]"
                  v-if="v.scopedSlots && v.scopedSlots.customRender"/>
            <template v-else>{{ item[v.key] }}</template>
          </div>
        </div>
      </template>
      
    </draggable>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Draggable from "vuedraggable";

@Component({
  name: "DataItemList",
  components: {
    Draggable,
  },
})
export default class DataItemList extends Vue {
  @Prop({
    default: () => [],
  })
  columns: any;

  @Prop({
    default: () => []
  }) dataSource: any;

  @Prop() keyWords: any

  list:any[] = []


  @Watch('dataSource')
  changeDataSource(val: any) {
    this.list = val;
  }
  created(){
    if (this.list.length === 0 && this.dataSource.length > 0) {
      this.list = this.dataSource;
    }
  }

  @Watch('list', { deep: true })
  onListChange(val:any){
    console.log(val)
  }

  dragOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    forceFallback: true,
    fallbackClass: "dragClass",
    touchStartThreshold: 20,
    delay: 100,
  };
  /**
   * 结束拖拽
   */
  onEnd(evt: any) {
    const codeList = this.list.map((res: any) => {
      return res.code;
    });
    const item = codeList.filter((i, v) => v === evt.oldIndex);
    let data = codeList.filter((res: any, i: any) => {
      return i !== evt.oldIndex;
    });

    data.splice(evt.newIndex, 0, item);
    this.$emit('sortEnd', data, true);
  }
}
</script>

<style lang="less" scoped>
.data-list{
  box-sizing: border-box;
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;

  .list-header,.list-item{
    width: 100%;
    display: flex;
    height: 36px;
    background-color: #F7F7F7;
    font-size: 14px;
    color: #000;
    border-bottom: 1px solid#e8e8e8;
    .th,.td{
      line-height: 34px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      border-right: 1px solid #e8e8e8;
      padding: 0 10px;
      &:last-child{
        border-right: none;
      }
    }
  }
  .list-item{
    background-color: #fff;
  }

  .ghostClass {
    opacity: 1;
    background: #E8FCF4;
    border-radius: 4px;
    border: 1px solid #E8FCF4 !important;
    * {
      opacity: 0;
    }
  }

  .dragClass {
    background-color: #fff;
    box-shadow: inset 0 0 0 1px @primary-color,
    0px 4px 12px 0px rgba(7, 98, 23, 0.15);
  }

}

</style>
<style lang="less">
.more {
  i {
    font-size: 16px;
    &:nth-child(2) {
      margin-left: -8px;
    }
  }
  cursor: move !important;
}
</style>
