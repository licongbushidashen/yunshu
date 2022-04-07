<template>
  <a-modal
    v-model="syncVisable"
    title="从已有人员中导入"
    :width="422"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="submit"
    @cancel="cancel"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-row class="row-flex" type="flex">
      <a-col :span="7">选择人员</a-col>
      <a-col :span="17">
        <staff-selector
          v-model="user"
          :params="{ excludeCorpId: corpId }"
          :options="deptOpts"
        ></staff-selector>
      </a-col>
    </a-row>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, PropSync, Watch } from 'vue-property-decorator';
import { State, namespace } from 'vuex-class';
import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import OrgApi from '@/apis/organization';
const UserModule = namespace('Organization/User');
@Component({
  name: "import-people",
  components: {
    StaffSelector
  }
})

export default class ImportPeople extends Vue {
  
  @PropSync('visable') syncVisable!:boolean;

  @Prop() corpId!:string;

  user:any = null;
  showModal: boolean = false;
  deptOpts:any = {
    selectOrg: false,
    selectUser: true,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择需要同步的人员',
    appManagerFilter: true,
    isInit: false,
    rootNode: [],
    selected: []
  }

  submit() {
    this.$emit('update', this.user[0]);
  }

  cancel() {
    this.$emit('changeVisable', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
  }

  @Watch('syncVisable')
  onVisableChange(v: boolean) {
    this.user = [];
  }

}
</script>

<style lang="less" scoped>
.row-flex{
  margin-bottom: 16px;
  align-items: center;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
