<template>
  <a-modal
    :title="title"
    :visible="true"
    width="536px"
    @cancel="closeModal"
    @ok="backData"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
  >
   <!-- 地址 -->
   <template v-if="propertyType === 14">
     <pca-selector
     :format="locationType"
      v-model="address"
     ></pca-selector>
     <a-textarea
      v-model="address.address"
      style="margin-top:8px;"
      v-if="showDetails === 'true'"
      :placeholder="$t('cloudpivot.form.renderer.inputAddress')"
      :autosize="{ minRows: 3, maxRows: 6 }"
      @change="onAdChange"
     ></a-textarea>
   </template>

   <!-- 定位 -->
   <div class="address-textarea" v-if="propertyType === 11">
      <SmartLocation
        v-model="location"
        :initMap="initMap"
        @ok="mapChange"
      >
      </SmartLocation>
   </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { FormLocationControl } from "@cloudpivot/form/src/common/controls/form-location-control";
import { FromAddressValueService } from "@cloudpivot/form/src/common/services";

@Component({
  name: "AddressModal",
  components: {
    SmartLocation: () => import("@cloudpivot/form/src/common/components/smart-location/index.vue"),
    PcaSelector: () => import("@cloudpivot/form/src/common/components/pca-selector/pca-selector.vue")
  }
})
export default class RequiredConditon extends Vue {
  @Prop({
    type: Object
  })
  modalData!: any;

  @Prop({type:Object})
  modalOptions!:any

  @Prop({})
  getControl!:any
  
  get title() {
    if(this.control && this.control.type === 14) {
      return '设置地址'
    }
    if(this.control && this.control.type === 11) {
      return '设置定位'
    }
  }

  get propertyType() {
    if(this.control && this.control.type)
    return this.control.type
  }

  get initMap() {
    return FormLocationControl.service.initMap
  }

  get showDetails() {
    return this.control && this.control.options.addressDetail
  }

  // 地址格式同步
  get locationType() {
    return this.control && this.control.options.locationType
  }

  @Watch("modalData", {
    immediate: true
  })
  onModalDataChange(modalData: any) {
    // 每次数据改变同步control
    debugger
    this.control = this.getControl()

    if(this.propertyType === 14) {
      if (!modalData.data.value) {
        this.address = {
          address: ''
        }
        return;
      }
    }
    if(this.propertyType === 11) {
      if (!modalData.data.value) {
        this.location = {
          cityAdcode: "",
          cityName: "",
          districtAdcode: "",
          districtName: "",
          provinceAdcode: "",
          provinceName: ""
        }
        return;
      }
    }


    const { data } = modalData

    this.propertyType === 11 ? 
    this.location = data.value : 
    this.propertyType === 14 ? 
    this.address = Object.assign({}, this.address, data.value) : ''
  }

  address: any = {
    address: ''
  }

  location: any = {}

  locationInfo: any = {}  

  mapChange(val: any) {
    FromAddressValueService.setAddressVal(
      val.adcode
    ).then((value: any) => {
      // 获取区县code并组合成参数
      this.location = Object.assign({}, this.location, value)
    })
  }

  backData() {
    const backData: any = {}
    switch (this.propertyType) {
      case 11:
        backData.value = this.location
        backData.default = this.location
        break;
      case 14:
        backData.value = this.address
        backData.default = this.address
        break;
      default:
        break;
    }
    debugger
    this.$emit("backData", backData);
  }

  closeModal() {
    this.$emit("closeModal");
  }


  onAdChange(evt: any) {
    // debugger
    const val = evt.target.value
    this.address.address = val
  }  

  control: any = null

}
</script>

<style lang="less" scoped>

</style>
