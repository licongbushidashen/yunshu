<template>
  <div class="list-sort">
    <div class="text">排序</div>
    <div class="select-wrap">
      <div class="list-wrap">
        <div class="select-title" @click="selectSort" >
          {{ curSort.name }}
          <i
            :class="[
            'icon aufontAll',
            showList ? 'h-icon-all-up-o' : 'h-icon-all-down-o'
          ]"
          ></i>
        </div>
        <ul class="select-list" v-show="showList">
          <li @click="changeSort(item)" :class="{ 'active': curSort.name === item.name }" v-for="item in querySorts" :key="item.id" >{{ item.name}}</li>
        </ul>
      </div>
      <div class="sort-buttons" @click="changeMethod">
        <div class="head-value-up_down">
          <a-icon type="caret-up" class="icon-up_down"
            :class="[ sortIndex === 1 ? 'icon-up-down-light' : '']"
          />
          <a-icon type="caret-down" class="icon-up_down"
            :class="[ sortIndex === 2 ? 'icon-up-down-light' : '']"
          />
        </div>

      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
import { Icon } from "@h3/antd-vue";

const SortMap = [
  {
    name: '升序',
    index: 1
  },
  {
    name: '降序',
    index: 2
  },
  {
    name: '取消',
    index: 3
  }
]

@Component({
  name: "ListFormSort",
  components: {
    AIcon: Icon
  }
})


export default class ListFormSort extends Vue {
  
  @Prop() querySorts!: Array<any>;

  @Watch('querySorts')
  onSortsChange(val) {
    this.querySorts.length > 0 ? this.curSort = this.querySorts[0] : {}
    if(this.curSort.direction === 1) {
      this.sortIndex = 1
    } else if(this.curSort.direction === 2 || !this.curSort.direction) {
      this.sortIndex = 2
    } else {
      this.sortIndex = 3
    }
  }

  SortMap: Array<any> = SortMap

  curSort: any = {}
  showList : boolean = false
  sortIndex: number = 3

  selectSort() {
    this.showList = !this.showList
  }

  changeSort(item: any) {
    this.curSort = item
    // 重置排序方式 若有设置排序则取用户设置
    if(this.curSort.direction === 1 || !this.curSort.direction) {
      this.sortIndex = 1
    } else if(this.curSort.direction === 2) {
      this.sortIndex = 2
    } else {
      this.sortIndex = 3
    }
    const params = this.queryFun()
    this.$emit('sort', params)
  }

  queryFun() {
    let params: any = {}
    let code = this.curSort ? this.curSort.propertyCode : ''
    if(code) {
      params.orderByFields = [code]
    }
    if(this.sortIndex > 0 && this.sortIndex < 3) {
      params.orderType = this.sortIndex
    }
    this.showList = false
    return params
  }

  changeMethod() {
    if(this.sortIndex === 3){
      this.sortIndex = 1
    }
    else {
      this.sortIndex++
    }
    const params = this.queryFun()
    this.$emit('sort', params)
  }

  mounted() {
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

.list-sort {
  height: 1.2rem;
  display: flex;
  align-items: center;
  .text {
    .px2rem(font-size, 30px);
    color: rgba(0, 0, 0, .4);
    .px2rem(padding-left, 30px);
  }
  .select-wrap {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    .px2rem(padding-right, 30px);
    .list-wrap {
      .px2rem(padding-right, 30px);
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      ul {
        margin: 0;
        position: absolute;
        top: 1.2rem;
        z-index: 100;
        box-shadow: 0px 3px 4px 1px rgba(0,0,0,0.15);
        li {
          background: #FFF;
          .px2rem(padding, 24px);
          white-space: nowrap;
          &:hover {
            background: #f2f4f8;
            color: #2970ff;
          }
        }
        .active {
          background: #f2f4f8;
          color: #2970ff;
        }
      }
      .select-title {
        i {
          font-size: 10px;
          .px2rem(margin-left, 15px);
        }
      }
    }

    .sort-buttons {
    .px2rem(padding-left, 30px);
    border-left: 1px solid #eee;
    }
  }

  .head-value-up_down {
    .icon-up_down {
      color: rgb(158, 158, 158);
    }
    >.icon-up-down-light {
      color: rgb(34, 133, 247);
    }
    .px2rem(margin-right, 30px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
