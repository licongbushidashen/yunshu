<template>
  <div class="add-data-dictionary">
    <group-title>
      基本信息
    </group-title>
    
    <list-item :label="'字典编码'" :showRequire="true">
      <a-input :disabled="!isNew" v-model="addParams.code" placeholder="请输入" />
    </list-item>
    <list-item :label="'字典名称'" :showRequire="true">
      <a-input v-model="addParams.name" placeholder="请输入" />
    </list-item>
    <list-item :label="'字典分类'" :showRequire="false">
      <a-select show-search :filter-option="filterOption" v-model="addParams.classificationId" default-value="" style="width: 100%">
        <template v-for="(item, key) in classList">
          <a-select-option :value="item.id" :key="key">
            {{item.name}}
          </a-select-option>
        </template>
      </a-select>
    </list-item>

    <list-item :label="'字典类型'" :showRequire="false">
      <a-radio-group :disabled="!isNew" name="dictionaryType" v-model="addParams.dictionaryType" :default-value="0" @change="onChange">
        <a-radio :value="0">
          简单键值结构
        </a-radio>
        <a-radio :value="1">
          树形父子结构
        </a-radio>
      </a-radio-group>
    </list-item>

    <list-item :label="'描述'" :showRequire="false">
      <a-textarea 
      v-model="addParams.remarks" 
      :rows="3"
      maxlength="200"
      placeholder="请输入描述" /> 
    </list-item>

    <group-title>
      配置数据<small>每行为一个数据项，数据项包含名称和代码，如果不输入代码，则代码由系统生成</small>
    </group-title>

    <div v-if="addParams.dictionaryType === 0">
      <key-value :isEdit="isNew" :recordsData="recordsData" @recordsDataChange="recordsDataChange"></key-value>
    </div>
    
    <div v-if="addParams.dictionaryType === 1">
      <tree :isEdit="!isNew" :recordsData="recordsData" @recordsDataChange="recordsDataChange"></tree>
    </div>
    
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch,Prop} from "vue-property-decorator";
import dataDictionaryApi from "@/apis/system/data-dictionary.api";
import common from "@cloudpivot/common/pc";
import groupTitle from './group-title.vue'
import listItem from './list-item.vue'
import tree from './tree.vue'
import keyValue from './key-value.vue'

@Component({
  name: "addDataDictionary",
  components: {
    RoleSelect: common.components.RoleSelect,
    groupTitle,
    listItem,
    keyValue,
    tree
  },
})
export default class addDataDictionary extends Vue {
  @Prop({
    default : []
  })
  classList !: any[]

  @Prop({
    default: false
  })
  isAddDataDictionaryOkBtnClick!:boolean

  @Prop({
    default: false
  })
  isNew!:boolean

  @Prop({
    default:() => {}
  })
  currentDataDictionary?: {}

  @Watch('isAddDataDictionaryOkBtnClick')
  onIsAddDataDictionaryOkBtnClickChange(type){
    if(type){
      this.saveDictionary()
    }
  }

  @Watch('classList')
  onClassListChange(val){
    console.log('classList===>>>', val)
  }

  filterOption(input, option){
    return option.componentOptions.children[0].text.includes(input)
  }

  remarksChange(){
    if(this.addParams.remarks.length > 200){
      this.$message.error('说明不能超过200字')
      this.$set(this.addParams, 'remarks', this.addParams.remarks.slice(0, 200))
    }
  }
  
  onChange(evt){
    // const type = evt.target.value;
    this.recordsData = [];
  }

  // 新建或更新数据字典
  saveDictionary(){
    if(this.addParams.code === ''){
      this.$message.error('字典编码必填') 
      return
    }

    if(!/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/.test(this.addParams.code)){
      this.$message.error('字典编码仅支持以字母开头不超过28个字符，仅支持字母、数字、下划线')
      return
    }

    // if(!/^[-_a-zA-Z0-9]+$/.test(this.addParams.code)){
    //   this.$message.error('字典编码仅支持英文、数字及英文符号”-“和”_“')
    //   return
    // }

    // if(this.addParams.code.length > 50){
    //   this.$message.error('字典编码不能超过50个字')
    //   return
    // }

    this.addParams.name = this.addParams.name && this.addParams.name.replace(/\s/g,'')
    if(this.addParams.name === ''){
      this.$message.error('字典名称必填')
      return
    }

    if(this.addParams.remarks.length > 200){
      this.$message.error('说明不能超过200字')
      return
    }

    if(!/^[\u4e00-\u9fa5-_a-zA-Z0-9]+$/.test(this.addParams.name)){
      this.$message.error('字典名称仅支持中英文、数字及英文符号”-“和”_“')
      return
    }

    if(this.addParams.name.length > 50){
      this.$message.error('字典名称不能超过50个字')
      return
    }

    let params = {...this.addParams}
    let ErrorTypes:any[] = []
    this.recordsData.forEach((el, index) => {
      el.sortKey = index + 1
      if(el.name === ''){
        ErrorTypes.push('第'+ (index+1) + '行：中文名称不能为空')
      }
      if(el.code === ''){
        ErrorTypes.push('第'+ (index+1) + '行：代码不能为空')
      }
      if(!/^[-_a-zA-Z0-9]+$/.test(el.code)){
        ErrorTypes.push('第'+ (index+1) + '行：代码仅支持英文、数字及英文符号”-“和”_“')
      }

      if(el.name.length > 50){
        ErrorTypes.push('第'+ (index+1) + '行：中文名称最多支持50个字')
      }
      if(el.code.length > 50){
        ErrorTypes.push('第'+ (index+1) + '行：代码最多支持50个字符')
      }

    })

    let names = this.recordsData.map(el => el.name)
    let codes = this.recordsData.map(el => el.code)
    if([...new Set(names)].length < this.recordsData.filter(el => !el.deleted).length){
      ErrorTypes.push('中文名称有重复，请排查修改!')
    }
    if([...new Set(codes)].length < this.recordsData.filter(el => !el.deleted).length){
      ErrorTypes.push('代码有重复，请排查修改!')
    }


    if(ErrorTypes.length){
      this.$message.error(ErrorTypes[0])
      return
    }


    params.records = [...this.recordsData]
    dataDictionaryApi.saveDictionary(params).then((res: any) => {
      if(res.errcode === 0){
        this.$message.success(res.errmsg)
        this.resetAddParams()

        this.recordsData = []
        this.$emit('addOver')
        this.closeModal()
      }else{
        this.$message.error(res.errmsg)
      }
    })
  }
  closeModal(){
    this.$emit('closeModal')
  }
  
  // 字典数据项
  recordsData:any[] = []
  recordsDataChange(val){
    this.recordsData = val
  }

  resetAddParams(){
    this.addParams = {
      id: '',
      code: '',
      name: '',
      classificationId: '', // 分类Id
      dictionaryType: 0, // 字典类型 0:键值对 1:树形
      remarks: '', //描述
      records: [],
      createdTime: ''
    }
  }
  addParams:any = {
    id: '',
    code: '',
    name: '',
    classificationId: '', // 分类Id
    dictionaryType: 0, // 字典类型 0:键值对 1:树形
    remarks: '', //描述
    records: [],
    createdTime: ''
  }

  
  @Watch('currentDataDictionary')
  onCurrentDataDictionaryChange(val){
    const {id,code,name,classificationId,dictionaryType,remarks,createdTime} = val

    this.addParams = {
      id,
      code,
      name,
      classificationId,
      dictionaryType,
      createdTime,
      remarks,
      records: [],
    }

    // 如果已选择的字典分类已经被删除，清空已选择分类
    if(this.classList.length && this.currentDataDictionary){
      if(this.classList.every(el => el.id !== this.addParams.classificationId)){
        this.$set(this.addParams, 'classificationId', '')
      }
    }else{
      this.$set(this.addParams, 'classificationId', '')
    }

    this.searchDictionaryRecord(val)
  }

  async searchDictionaryRecord(options){
    let res:any = await dataDictionaryApi.searchDictionaryRecord({
      id: options.id,
      searchWord:'',
      page: 1,
      size: 99999
    })
    if(res.errcode === 0){
      // this.$set(this.addParams, 'records', res.data.content)
      this.recordsData = res.data.content
    }
  }
  



}
</script>
<style lang="less" scoped>
  .add-data-dictionary{
    max-height: 550px;
    overflow: auto;
    padding: 10px;
  }
</style>
<style lang="less">
.add-data-dictionary{
  .ant-form-item-label{
    text-align: left;
  }
}
</style>
