
<template>
  <div class="address dd">
    <template v-if="!readonly">
      <div>
        <pca-selector
          v-model="pca"
          :format="controlOpts.locationType"
          :showEmpty="showEmpty"
          :disabled="readonlyFormula"
          @change="valueChange"
        />
      </div>
      <div class="address-textarea" v-if="controlOpts.addressDetail === 'true'">
        <a-textarea
          v-model="val.address"
          :placeholder="$t('cloudpivot.form.renderer.inputAddress')"
          :disabled="readonlyFormula"
          :autosize="{ minRows: 3, maxRows: 6 }"
          @change="onAdChange"
        ></a-textarea>
        <div class="address-textarea__local">
          <SmartLocation
            v-model="val"
            :type="'modal'"
            :initMap="initMap"
            @ok="mapChange"
          >
            <a-icon 
              v-if="!readonlyFormula" 
              slot="defineEl" 
              type="environment-o"
            />
          </SmartLocation>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="_address address-!readonly">
        <p>{{ addressString }}</p>
      </div>
    </template>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { Input, Icon } from "@h3/antd-vue";

import {
  RendererFormControl,
  FormControlType,
  AddressOptions
} from "@cloudpivot/form/schema";

import { AddressControl } from "../control/address-control";

import { FromAddressValueService } from "@cloudpivot/form/src/common/services";

import { FormLocationControl } from "@cloudpivot/form/src/common/controls/form-location-control";

import { Subscription } from "rxjs";

@Component({
  name: "input-address",
  components: {
    ATextarea: Input.TextArea,
    AIcon: Icon,
    SmartLocation: () => import("@cloudpivot/form/src/common/components/smart-location/index.vue"),
    PcaSelector: () => import("@cloudpivot/form/src/common/components/pca-selector/pca-selector.vue")
  }
})
export default class Address extends AddressControl {
  //  pca:any = {}

  get initMap() {
    console.log('ddddd', FormLocationControl)
    return FormLocationControl.service.initMap;
  }

  // subscription?: Subscription;

  //   get value(){
  //     return this.ctrl.value || {};
  //   }

  //   setControl() {

  //     if (this.ctrl.value) {
  //       this.setPcaDate();
  //     }

  //     this.unsubscribe();

  //     this.subscription = (this.ctrl as any).valueChange.subscribe((change:any) => {
  //       if(this.ctrl.value){
  //         this.setPcaDate();
  //       }else{
  //         this.ctrl.value = {};
  //       }
  //     });

  //   }

  valueChange(val: any) {
    super.valueChange(val);
  }

  mapChange(val: any) {
    FromAddressValueService.setAddressVal(
      val.adcode,
      this.controlOpts.locationType
    ).then((value: any) => {
      const type = this.controlOpts.locationType.split("-").length;
      if (type === 3) {
        value.address = val.address;
      } else if (type === 2) {
        value.address = `${val.districtName}${val.address}`;
      } else {
        value.address = `${val.cityName}${val.districtName}${val.address}`;
      }
      // 给地址加上经纬度参数
      value.lng = val.lng;
      value.lat = val.lat;
      this.setValue(value);
    });
  }

  // valueChange(val:any) {

  //   let value:any =  {};

  //   const { detailAd } = this.ctrl.value;

  //   if (detailAd) {
  //     value.address = detailAd;
  //   }

  //   value = Object.assign(value,val);

  //   this.ctrl.value = value;

  //   this.setPcaDate();
  // }

  onAdChange(evt: any) {
    // 

    if (evt.type === "change") {
      return;
    }

    this.ctrl.value = JSON.parse(JSON.stringify(this.ctrl.value));
    this.ctrl.value = Object.assign({}, this.val, {
      address: evt.target.value
    });
  }

  // setPcaDate() {
  //   this.pca = JSON.parse(JSON.stringify(this.ctrl.value));
  //   delete this.pca.address;
  // }

  // get showEmpty() {
  //   return this.controlOpts.showEmpty === 'true';
  // }

  // get addressString() {
  //   const { provinceName, cityName, districtName, address} = this.ctrl.value;
  //   const addressList:Array<any> = [];
  //   addressList.push(provinceName, cityName, districtName, address);
  //   const str = addressList.reduce((str:string,current:string)=> {
  //     let currentStr:string = '';
  //     let beforeStr:String = '';
  //     if(current) {
  //       currentStr = current;
  //     }
  //     if (str) {
  //       beforeStr = str;
  //     }
  //      return `${beforeStr} ${currentStr}`
  //   });
  //   return str
  // }

  // unsubscribe() {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //     this.subscription = undefined;
  //   }
  // }

  // destroyed() {
  //   super.destroyed();

  //   this.unsubscribe();
  // }
}
</script>

<style lang="less" scoped>
.address {
  .address-textarea {
    position: relative;
    margin-top: 8px;
    textarea {
      min-height: 76px;
      max-height: 76px;
      padding-right: 25px;
    }
    &__local {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 31px;
      cursor: pointer;
      i {
        color: #d9d9d9;
        font-size: 14px;
      }
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  ._address{
    white-space: normal;
    p{
      word-break: break-word;
    }
  }
}
</style>
