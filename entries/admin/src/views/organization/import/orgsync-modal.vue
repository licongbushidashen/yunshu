<template>
  <a-modal
    :title="'组织同步'"
    :visible="isShowOrgModal"
    :width="408"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    @cancel="closeModel"
    @ok="selectedOrg"
  >
    <div class="add-data-manager">
      <a-row class="add-data-manager__tips">
        <a-col>系统检测当前系统绑定了多个钉钉组织，请选择需要同步的组织</a-col>
      </a-row>
      <a-row class="add-data-manager__item">
        <a-col :span = "layout.left" class="add-data-manager__left">
          <span class="label-required">选择组织:</span>
        </a-col>
        <a-col :span = "layout.right" class="add-data-manager__right">
          <a-select
            style="width: 245px" 
            v-model="orgId"
            placeholder="请选择"
          >
            <a-select-option
              :value="item.id"
              :key="item.id"
              v-for="item in setList"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>

    </div>
  </a-modal>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Emit, Watch
} from 'vue-property-decorator';


@Component({
  name: 'export-dept',
  components: {
   
  }
})

export default class AddDataManager extends Vue {
  @Prop() isShowOrgModal!: boolean;

  @Prop() setList!:Array<any>;

  orgId:any = "";

/*   setList:Array<any> = [
    {
      label: '组织名称1',
      value: 0
    },
    {
      label: '组织名称2',
      value: 1
    }
  ]; */

  layout = {
    left: 6,
    right: 18
  }


  closeModel() {
    this.$emit('cancel');
  }

  selectedOrg(){
     const params = {
          relatedId: this.orgId
        }
    this.$emit('getOrgsync',params);
    this.$emit('cancel');
  }


}
</script>
<style lang="less" scoped>
.add-data-manager{
  &__tips{
    font-size: 12px;
    color:#999999;
    margin-bottom: 13px;
  }
  &__item{
    margin-bottom: 20px;
    .add-data-manager__left{
      height: 32px;
      line-height: 32px;
    }
    .add-data-manager__right{
      .add-data-manager__select{
        width: 100%;
      }
      &>span{
        height: 32px;
        line-height: 32px;
      }
    }
  }
}
</style>
