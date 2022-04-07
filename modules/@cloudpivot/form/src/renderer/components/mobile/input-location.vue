
<template>
  <h3-field
    v-if="controlOpts.displayMode === 'accurate' && !isEl"
    :required="ctrl.required"
    :readOnly="readonly || readonlyFormula"
    :showIcon="true"
    @contentClick="onClickContent"
    @iconClick="onClickContent"
    :label="label"
    :class="{locationVertical: layoutType}"
    :labelStyle="styleObj"
  >
    <div :class="{'field__control' : !readonly}">
      <span v-if="address" style="color: #333333">{{ address }}</span>
      <span class="placeholder" v-if="!address && !(readonly || readonlyFormula)">{{ placeholder }}</span>
    </div>
    <span
      slot="extra"
      @click.stop="onClickContent"
      class="aufontAll h-icon-all-get-address-o"
    ></span>
  </h3-field>
  <smart-location
    v-else
    :initMap="initMap"
    :autoGetLocation="autoGetLocation"
    :labelStyle="styleObj"
    :title="label"
    :required="ctrl.required"
    :readonly="readonly"
    v-model="val"
    @change="valueChange"
    :range="range"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import { RendererFormControl } from "../../typings";

import { FormControlType, LocationOptions } from "../../typings";

import { FormLocationControl } from "../../controls";

import { H3Field } from 'h3-mobile-vue';

// import SmartLocation from '../shared/mobile-smart-location/smart-location.vue'

import { FromAddressValueService } from "../../services"

@Component({
  name: "input-location",
  components:{
    H3Field,
    SmartLocation: () => import('../shared/mobile-smart-location/smart-location.vue')
  }
})
export default class InputLocation extends FormLocationControl {
  
  get initMap() {
    return FormLocationControl.service.initMap;
  }

  onClickContent() {
    if(this.readonly || this.readonlyFormula){
      return false;
    }
    return !this.readonly ? this.onPosition() : this.onNavigation();
  }

  get autoGetLocation() {
    if (!this.getIsNew()) {
      return false;
    }
    if (!this.controlOpts.autoGetLocation) {
      return false;
    } else {
      return this.controlOpts.autoGetLocation === 'true';
    }
  }


  mounted() {
    if (this.controlOpts.displayMode === 'accurate' && !this.isEl) {
      if (this.autoGetLocation) {
        this.setCurLoction();
      }
    }
  }

  setCurLoction() {
    const formControls = this.getFormControls();

    const sheetControls = formControls.filter(res => {
      return res.type === FormControlType.Sheet;
    });

    // const l = '{"lat": 22.548602, "lng": 113.944437, "adcode": "440305", "address": "科兴科学园B栋G层16B中国建设银行(科兴微银行)", "cityName": "深圳市", "cityAdcode": "440300", "districtName": "南山区", "provinceName": "广东省", "districtAdcode": "440305", "provinceAdcode": "440000"}'
    
    const locationContrl = formControls.filter(res => {
      return (res.type === FormControlType.Location 
      && res.options.autoGetLocation 
      && res.options.autoGetLocation === 'true'
      && res.options.displayMode
      && res.options.displayMode === 'accurate'
      )
    });
    // 
    // sheetControls.forEach((res:any) => {
    //   const locationsKeys = res.columns.map(col => {
    //       if (col.type === FormControlType.Location 
    //         && col.options.autoGetLocation 
    //         && col.options.autoGetLocation === 'true'
    //         && col.options.displayMode
    //         && col.options.displayMode === 'accurate') {
    //           return col.key
    //         }
    //     })
    //     locationsKeys.forEach(loc => {
    //       if (!loc) {
    //         return
    //       }
    //       if (res.controller.value) {
    //         res.controller.value.forEach((sheetVal,index) => {
    //           res.controller.children[index].children[loc].value = Object.assign({}, JSON.parse(l));
    //         })
    //       }
    //     })
    //     
    // });

    const range = 500;
    FormLocationControl.service.position(range, false).then((result:any)=> {
      let adcode = '';
      if (result.cityAdCode) {
        adcode = result.cityAdCode;
      }

      if (result.districtAdCode) {
        adcode = result.districtAdCode;
      }
      
      const obj = {
        provinceName: result.province,
        cityName: result.city,
        districtName: result.district,
        address: result.address,
        lat: result.latitude,
        lng: result.longitude,
        adcode
      };
      console.log('当前位置=>', obj);
      FromAddressValueService.setAddressVal(result.adcode).then((value:any) => {
        const v = Object.assign(obj, value);
        locationContrl.forEach(res => {
          if (res.controller) {
            res.controller.value = Object.assign({}, v);
          }
        });

        // 子表赋值
        sheetControls.forEach((res:any) => {
          const locationsKeys = res.columns.map(col => {
              if (col.type === FormControlType.Location 
                && col.options.autoGetLocation 
                && col.options.autoGetLocation === 'true'
                && col.options.displayMode
                && col.options.displayMode === 'accurate') {
                  return col.key
                }
            });
            locationsKeys.forEach(loc => {
              if (!loc) {
                return
              }
              if (res.controller.value) {
                res.controller.value.forEach((sheetVal,index) => {
                  res.controller.children[index].children[loc].value = Object.assign({}, v);
                })
              }
            })
        });
      });
    });
  }

  

  // created() {
  //   
  //   console.log('111111111',this.controlOpts.displayMode);
  // }
  @Inject()
  layoutTypeFn!: Function;

  //上下布局模式
  get layoutType(){
    if(this.layoutTypeFn){
      return this.layoutTypeFn();
    }
  }

  get range() {

    let range = 500;
    if(this.controlOpts.range) {

      const rangeMapping:any = {
        '1km': 1000,
        '500m': 500,
        '200m': 200
      };

      range = rangeMapping[this.controlOpts.range];
    }
    return  range;
  }

  onPosition(){
    this.position();
  }
  onNavigation() {
    this.navigation();
  }

  valueChange(val:any) {
    if(val.adcode){
      FromAddressValueService.setAddressVal(val.adcode).then((value:any) => {
        this.ctrl.value = Object.assign(val,value);
      });
    }else{
      this.ctrl.value = null;
    }
  }
}
</script>

<style lang="less" scoped>
.field__control{
  min-height: 10px;
}
</style>
<style>
.locationVertical .h3-field-icon-wrapper{
  width: 22px;
  height: 22px;
  position: absolute;
  bottom: 10px;
  right: 15px;
  text-align: center;
  line-height: 22px;
}
</style>

