<template>
  <div class="data-item">
    <!-- 数据项头部 -->
    <property-widget
      label="数据项"
    >
      <template>
        <div slot="right" class="check-wrap">
          <div
            v-for="(i,index) in dataHead"
            :key="index"
            class="check-item"
          >
            <a-checkbox
              class="checkbox"
              v-model="i.checked"
              :disabled="!canCheck"
              @change="onSelectAll(i)"
            ></a-checkbox>
            <span>{{ i.text }}</span>
          </div>
        </div>
      </template>
    </property-widget>
    <!-- 数据项区域 -->
    <div class="dataitem-wrap">
      <div v-show="!isLoading" :key="key" v-for="(item,key) in dataList">
        <property-widget
          :title="item.propertyName"
          :label="item.propertyName"
          :tip="item.propertyEmpty?'数据模型创建数据项的时候如果勾选了“不允许为空”，则该数据项默认是必填状态，不可更改，如果要更改，请前往【数据模型】页面取消对该数据项的不允许为空设置。':false"
        >
          <template>
            <div slot="right" class="check-wrap">
              <div class="check-item">
                <a-checkbox
                  v-model="item.visible"
                  :indeterminate="item.visibleIndeterminate"
                  @change="onSelectChange('visible',item.propertyCode)"
                  class="checkbox"
                  :disabled="item.propertyEmpty"
                ></a-checkbox>
              </div>
              <div class="check-item">
                <a-checkbox
                  v-model="item.editable"
                  :indeterminate="item.editableIndeterminate"
                  @change="onSelectChange('editable',item.propertyCode)"
                  class="checkbox"
                  :disabled="item.propertyEmpty"
                ></a-checkbox>
              </div>
              <div class="check-item">
                <a-checkbox
                  v-model="item.required"
                  :indeterminate="item.requiredIndeterminate"
                  @change="onSelectChange('required',item.propertyCode)"
                  class="checkbox"
                  :disabled="item.propertyEmpty"
                ></a-checkbox>
              </div>
            </div>
          </template>
        </property-widget>
        <template v-for="(subItem,subKey) in item.subPropertyPermissions">
          <property-widget
            :key="`${item.propertyCode}-${subKey}`"
            :title="`${item.propertyName}.${subItem.propertyName}`"
            :label="`${item.propertyName}.${subItem.propertyName}`"
            :tip="subItem.propertyEmpty?'数据模型创建数据项的时候如果勾选了“不允许为空”，则该数据项默认是必填状态，不可更改，如果要更改，请前往【数据模型】页面取消对该数据项的不允许为空设置。':false"
          >
            <template>
              <div slot="right" class="check-wrap">
                <div class="check-item">
                  <a-checkbox
                    v-model="subItem.visible"
                    :indeterminate="subItem.visibleIndeterminate"
                    @change="onSubSelectChange('visible',item, subItem.propertyCode)"
                    class="checkbox"
                    :disabled="subItem.propertyEmpty"
                  ></a-checkbox>
                </div>
                <div class="check-item">
                  <a-checkbox
                    v-model="subItem.editable"
                    :indeterminate="subItem.editableIndeterminate"
                    @change="onSubSelectChange('editable',item, subItem.propertyCode)"
                    class="checkbox"
                    :disabled="subItem.propertyEmpty"
                  ></a-checkbox>
                </div>
                <div class="check-item">
                  <a-checkbox
                    v-model="subItem.required"
                    :indeterminate="subItem.requiredIndeterminate"
                    @change="onSubSelectChange('required',item, subItem.propertyCode)"
                    class="checkbox"
                    :disabled="subItem.propertyEmpty"
                  ></a-checkbox>
                </div>
              </div>
            </template>
          </property-widget>
        </template>
      </div>

      <PageLoading
        v-model="isLoading"
        shadeColor="#FFF"
        text="数据权限获取中，请稍侯…"
        :shadeOpacity="0.8"
      ></PageLoading>
    </div>

  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import {
  State, Mutation, namespace
} from 'vuex-class';
import PropertyWidget from '../../base/propertyWidget.vue';
import PageLoading from '@/components/shared/loading/page-loading/page-loading.vue';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'MultiDataItem',
  components: {
    PropertyWidget,
    PageLoading
  }
})

export default class MultiDataItem extends Vue {
  @WorkflowModule.State('selectedActivities') selectedActivities: any;

  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem:any;

  @WorkflowModule.Mutation('changeActivityByBatch') changeActivityByBatch: any;

  dataHead:any = [{
    text: '可见',
    code: 'visible',
    checked: false
  }, {
    text: '可写',
    code: 'editable',
    checked: false
  }, {
    text: '必填',
    code: 'required',
    checked: false
  }];

  dataList:any = [];

  isLoading:boolean = false;

  get canCheck() {
    if (this.dataList.length) {
      return true
    }
    return false;
  }

  get multipleLength() {
    return this.selectedActivities.length || 0;
  }

  // 根据数据初始化视图
  dataMounted() {
    
    if (!this.WorkflowDataItem.length || !this.selectedActivities.length) {
      return;
    }
    this.isLoading = true;
    const totalFlag:any = {};
    const selectedLength = this.selectedActivities.length;
    this.selectedActivities.forEach((sel:any, idx:number) => {
      this.dataList = sel.propertyPermissions.map((item: any) => {
        const itemCopy = JSON.parse(JSON.stringify(item));
        const indeterminate = this.calcIndeterminate(totalFlag, item.propertyCode, itemCopy, idx, selectedLength);
        const list:any = { ...itemCopy, ...indeterminate };
        if (Array.isArray(item.subPropertyPermissions)) {
          const childValue:any = item.subPropertyPermissions.map((subItem:any) => { 
            const subItemCopy = JSON.parse(JSON.stringify(subItem));
            const subIndeterminate = this.calcIndeterminate(totalFlag, `${item.propertyCode}.${subItem.propertyCode}`, subItemCopy, idx, selectedLength);
            return { ...subItemCopy, ...subIndeterminate };
          });
          list.subPropertyPermissions = childValue;
        }
        return list;
      });
    });
    
    // 如果数据模型存在数据项且后台数据项不为空，则使用数据模型的顺序展示
    const sortValue:any = this.WorkflowDataItem.map((item:any) => {
      const dataItem:any = this.dataList.find((data: any) => item.code === data.propertyCode && item.propertyType !== 7);
      if (dataItem) {
        dataItem.propertyName = item.name;
        if (dataItem.propertyEmpty) {
          dataItem.visible = dataItem.editable = dataItem.required = true;
        }
        // 子表数据项排序使用数据模型的顺序展示
        if (item.propertyType === 8 && dataItem.subPropertyPermissions) {
          const childSortValue:any = item.subSchema.properties.map((sub:any) => {
            const childItem:any = dataItem.subPropertyPermissions.find((subData: any) => sub.code === subData.propertyCode && sub.propertyType !== 7);
            if (childItem) {
              childItem.propertyName = sub.name;
              if (childItem.propertyEmpty) {
                childItem.visible = childItem.editable = childItem.required = true;
              }
              return childItem;
            }
          }).filter((sub: any) => !!sub);
          dataItem.subPropertyPermissions = childSortValue;
        }
        return dataItem;
      }
    }).filter((item: any) => !!item);
    this.dataList = sortValue;

    if (this.dataList.length) {
      // 视图挂载时判定全选按钮状态
      this.checkStatus('visible');
      this.checkStatus('editable');
      this.checkStatus('required');
    }
    this.isLoading = false;
  }

  calcIndeterminate(totalFlag:any, code:string, item:any, idx:number, selectedLength:number) {
    const indeterminate:any = {
      editableIndeterminate: false,
      requiredIndeterminate: false,
      visibleIndeterminate: false,
    };
    if (!totalFlag[code]) {
      let visible:any = [];visible.push(item.visible);
      let editable:any = [];editable.push(item.editable);
      let required:any = [];required.push(item.required);
      totalFlag[code] = { visible, editable, required };
    } else {
      totalFlag[code].visible.push(item.visible);
      totalFlag[code].editable.push(item.editable);
      totalFlag[code].required.push(item.required);
    }
    
    // 当循环到最后一次时，汇总所有数据
    if (idx === selectedLength - 1) {
      const arr = ['visible', 'editable', 'required'];
      arr.forEach((a:any) => {
        const totalLength = totalFlag[code][a].filter((f:any) => f).length;
        if (totalLength !== selectedLength && totalLength) {
          indeterminate[`${a}Indeterminate`] = true;
          item[a] = false;
        }
      });
    }
    return indeterminate;
  }

  compareItem(item:any, changeArr:any) {
    const result = {};
    const arr = ['visible', 'editable', 'required'];
    arr.forEach((a:any) => {
      if (changeArr.includes(a)) {
        result[a] = item[a];
        this.$nextTick(() => {
          this.$set(item, `${a}Indeterminate`, false);
        });
      }
    });
    return result;
  }

  // 数据权限select改变
  onSelectChange(type:string, itemCode?:string, isSelectAll?: boolean) {
    this.dataList.forEach((item: any, i:number) => {
      if (itemCode && itemCode !== item.propertyCode) {
        return;
      }
      let changeArr:any = [type];
      if (type === 'visible' && !item.visible) {
        // 可见取消勾选则可写必填也取消勾选
        this.dataList[i].editable = false;
        this.dataList[i].required = false;
        changeArr = ['visible', 'editable', 'required'];
      }
      if (type === 'editable' && !item.editable) {
        // 可写取消勾选则必填也取消勾选
        this.dataList[i].required = false;
        changeArr = ['editable', 'required'];
      }
      if (type === 'editable' && item.editable) {
        // 勾选可写则可见也需勾选
        this.dataList[i].visible = true;
        changeArr = ['editable', 'visible'];
      }
      if (type === 'required' && item.required) {
        // 勾选必填则可写可见也需勾选
        this.dataList[i].editable = true;
        this.dataList[i].visible = true;
        changeArr = ['visible', 'editable', 'required'];
      }
      const value = this.compareItem(item, changeArr);
      this.changeActivityByBatch({ key: 'propertyPermissions', PropValue: { key: item.propertyCode, value } });

      // ehr改动后全选时子表补充逻辑
      if (Array.isArray(item.subPropertyPermissions) && isSelectAll) {
        this.onSubSelectChange(type, item);
      }
    });

    this.checkStatus('visible');
    this.checkStatus('editable');
    this.checkStatus('required');
  }

  // 数据权限全选事件
  onSelectAll(value:any) {
    if (!value) {
      return;
    }
    this.dataList.forEach((item: any, i:number) => {
      if (value.checked) {
        item[value.code] = true;
        if (Array.isArray(item.subPropertyPermissions)) {
          item.subPropertyPermissions.forEach((subItem:any) => { subItem[value.code] = true; });
        }
      } else if (!item.propertyEmpty) {
        item[value.code] = false;
        if (Array.isArray(item.subPropertyPermissions)) {
          item.subPropertyPermissions.forEach((subItem:any) => { 
            subItem[value.code] = subItem.propertyEmpty ?  true : false;
          });
        }
      }
    });
    this.onSelectChange(value.code, '', true);
  }

  // 判定全选是否勾选
  checkStatus(type:string) {
    this.dataList.some((item: any, l: number) => {
      let flag = true;
      if (Array.isArray(item.subPropertyPermissions)) {
        flag = item.subPropertyPermissions.filter((sub:any) => sub[type]).length === item.subPropertyPermissions.length;
      }
      if (!item[type] || !flag) {
        this.dataHead.forEach((head: any) => {
          if (head.code === type) {
            head.checked = false;
          }
        });
        return true;
      } if (item[type] && l === this.dataList.length - 1) {
        this.dataHead.forEach((head: any) => {
          if (head.code === type) {
            head.checked = true;
          }
        });
        return true;
      }
      return false;
    });
  }

  // 子表数据项数据权限select改变
  onSubSelectChange(type:string, item:any, subItemCode?:string) {
    item.subPropertyPermissions.forEach((subItem:any, i:number) => {
      if (subItemCode && subItemCode !== subItem.propertyCode) {
        return;
      }
      let changeArr:any = [type];
      if (type === 'visible' && !subItem.visible) {
        // 可见取消勾选则可写必填也取消勾选
        item.subPropertyPermissions[i].editable = false;
        item.subPropertyPermissions[i].required = false;
        changeArr = ['visible', 'editable', 'required'];
      }
      if (type === 'editable' && !subItem.editable) {
        // 可写取消勾选则必填也取消勾选
        item.subPropertyPermissions[i].required = false;
        changeArr = ['editable', 'required'];
      }
      if (type === 'editable' && subItem.editable) {
        // 勾选可写则可见也需勾选
        item.subPropertyPermissions[i].visible = true;
        changeArr = ['visible', 'editable'];
      }
      if (type === 'required' && subItem.required) {
        // 勾选必填则可写可见也需勾选
        item.subPropertyPermissions[i].editable = true;
        item.subPropertyPermissions[i].visible = true;
        changeArr = ['visible', 'editable', 'required'];
      }
      const value = this.compareItem(subItem, changeArr);
      this.changeActivityByBatch({ key: 'propertyPermissions', PropValue: { key: `${item.propertyCode}.${subItem.propertyCode}`, value } });
    });

    this.checkStatus('visible');
    this.checkStatus('editable');
    this.checkStatus('required');
  }

  @Watch('multipleLength', { immediate: true })
  onMultiActivityChange(v: string) {
    this.dataMounted();
  }
}
</script>

<style lang="less" scoped>
.data-item{
  .check-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 8px;
    .check-item{
      flex: 1;
      min-width: 66px;
      font-size: 14px;
      .checkbox{
        font-size: 14px;
        margin-right: 6px;
        /deep/.ant-checkbox-indeterminate{
          .ant-checkbox-inner{
            background-color: #75C9B5;
            border-color: #75C9B5;
            &:after{
              width: 10px;
              height: 3px;
              background-color: #fff;
            }
          }
        }
      }
    }
  }
  .dataitem-wrap{
    &.page-loading-wrap{
      min-height: 104px;
    }
  }
}
</style>
