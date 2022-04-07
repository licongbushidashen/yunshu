<template>
  <div class="selector-user" style="min-width: 75px;">
    <div class="selector" @click="setUser">
      <i 
        class="icon aufontAll" 
        :class="batch ? 'h-icon-all-add-user-group-o': 'h-icon-all-add-user-o'"
      ></i>{{ $t('cloudpivot.list.pc.chooseUser') }}
    </div>
    <staff-selector
      v-model="selectorData"
      :options="taffSelectorOpts"
      :params="{sourceType: 'portal' }"
      @ok="submitUser"
      @cancel="cancel"
    ></staff-selector>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import StaffSelector from '@cloudpivot/form/src/renderer/components/shared/staff-selector.vue';

@Component({
  name: "select-user",
  components: {
    StaffSelector
  }
})

export default class SelectUser extends Vue {

  @Prop() value!: any;

  @Prop() row!: any;

  @Prop() sheetKey!: string;

  @Prop({ default: false }) batch!: boolean; //批量修改

  @Prop({ default: false }) isSheet!: boolean; //是否为子表

  selectorData:any = [];

  taffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    showModel: false,
    mulpitle: true,
    showSelect: false,
    placeholder: '请选择'
  }

  get corpId () {
    try {
      let user:any = sessionStorage.getItem('user');
      user = JSON.parse(user);
      if (user.corpId) {
        return user.corpId
      } else {
        return ''
      }
    } catch {
      return ''
    }
  }

  /* 
  * 打开选人控件
  */
 setUser(selector:any) {
   if(this.batch){
     //批量修改时判断是否有选择数据
     let resouce: any = this.value.find((v: any) => v.checked);
     if(!resouce){
       this.$message.error(this.$t('cloudpivot.list.pc.chooseData') as string);
       return;
     }
     //判断是否选择子表数据
     if(this.isSheet){
       let sheetArr: Array<any> = [];
       this.value.forEach((v: any) => {
         if(v.checked){
            sheetArr = sheetArr.concat(v[this.sheetKey])
         }
       })
       let sheetResouce = sheetArr.find((s: any) => s.checked);
       if(!sheetResouce){
       this.$message.error(this.$t('cloudpivot.list.pc.chooseSheetData') as string);
        return;
      }
     }
   }
   if(this.row.key === 'owner'){
    this.taffSelectorOpts = {
      selectOrg: false,
      selectUser: true,
      showModel: false,
      mulpitle: false,
      showSelect: false,
      placeholder: '请选择'
    }
   }
   this.taffSelectorOpts.showModel = true;
 }

  /* 
  * 选人控件确定事件
  */
 submitUser(val:any) {
   const value = val.map((v:any) => {
     return {
      excelType: v.excelType,
      id: v.id,
      type: v.type,
      name: v.name,
      imgUrl: v.imgUrl,
      departmentId: null,
      departments: null,
      parentId: null,
     }
   });
   if(this.batch){
     const resouce: any = this.value.forEach((v: any) => {
       if(v.checked){
         if(this.isSheet){
            v[this.sheetKey].forEach((s: any) => {
              if(s.checked){
                s[this.row.key] = value;
              }
            })
         }else{
           v[this.row.key] = value;
         }
       }
     });
     this.$emit('input', resouce);
   }else{
     this.$emit('input', value);
   }
   this.taffSelectorOpts.showModel = false;
 }

  /* 
  * 选人控件取消事件
  */
  cancel() {
    this.taffSelectorOpts.showModel = false;
  }
  
  @Watch('value', { deep: true, immediate: true })
  onUserDataChange(value:any) {
    if(this.batch){
      this.selectorData = [];
    }else{
      // 必填且返回为空的值，不写入选人控件
      if (value && value[0] && value[0].excelType === 3) {
        this.selectorData = [];
        return;
      }
      this.selectorData = value;
    }
    
  }
}
</script>

<style lang="less" scoped>
.selector-user{
  .selector{
    text-align: right;
    color: @primary-color;
    cursor: pointer;
    i{
      font-size: 14px;
      margin-right: 4px;
    }
  }
}
</style>
