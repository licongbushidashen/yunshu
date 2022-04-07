<template>
  <a-modal
    :title="'导出部门'"
    :visible="isShowExportDept"
    :width="408"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    @ok="ExportDept"
    @cancel="closeModel"
  >
    <div class="add-data-manager">
      <a-row class="add-data-manager__item">
        <a-col :span = "layout.left" class="add-data-manager__left">
          <span class="label-required">选择部门:</span>
        </a-col>
        <a-col :span = "layout.right" class="add-data-manager__right">
          <staff-selector
            :options="stuffOrOrgSelectorOpts"
            :params="{ corpId: '', filterType: 'self' }"
            v-model="departments"
            @ok="addDepartments"
            appManagerFilter="true"
            :visiblePart="true"
          >
          </staff-selector>
        </a-col>
      </a-row>

    </div>
  </a-modal>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Emit, Watch
} from 'vue-property-decorator';

import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';

import OrgApi from '@/apis/organization';

@Component({
  name: 'export-dept',
  components: {
    StaffSelector
  }
})

export default class AddDataManager extends Vue {
  @Prop() isShowExportDept!: boolean;

  layout = {
    left: 6,
    right: 18
  }

  // 选人
  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择'
  }

  // 选人与选组织
  stuffOrOrgSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    isExport: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择'
  }
  departments = []; // 组织或角色
   /**
   * 导出操作
   */
  async ExportDept() {
    if (this.departments.length === 0) {
      this.$message.info('请选择部门');
      return;
    }
    // @ts-ignore
    let departmentsId:any =  this.departments.map( x=> x.id)
    const res: any = await OrgApi.exportDept( departmentsId );
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
       this.$message.error(this.$t('languages.Modal.DownloadFailed') as string);
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
      const timer = this.dateFtt(new Date());
      let fileName = `部门导出${timer}.xlsx`;
      this.downloadFile(blob, fileName);
    }
    this.$emit('cancel');
  }

  /**
   * 文件下载方法
   */
  downloadFile(blob: any, fileName: string) {
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

 
  /**
   * 时间标准化 
  */
  dateFtt(date, fmt = 'YYYYMMDDHHmmss') { 
    const o = {
      "M+": date.getMonth() + 1,     //月份 
      "DD+": date.getDate(),     //日 
      "HH+": date.getHours(),     //小时 
      "m+": date.getMinutes(),     //分 
      "s+": date.getSeconds(),     //秒 
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds()    //毫秒 
    };
    if (/(Y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (const k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }

  closeModel() {
    this.$emit('cancel');
  }

  addDepartments(val:any) {
    this.departments = val;
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t('Languages.Apps.PlzSelect') as string;
    this.stuffOrOrgSelectorOpts.placeholder = this.$t('Languages.Apps.PlzSelect') as string;
  }

  // 日期控件国际化
  @Watch('$i18n.locale')
  onLanguageChange(val: any) {
    this.placeHolderLang();
  }
}
</script>
<style lang="less" scoped>
.add-data-manager{
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
