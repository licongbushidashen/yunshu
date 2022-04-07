/*
 * @Author: panwl
 * @Date: 2020-04-22 19:19:12
 * @LastEditTime: 2020-04-22 19:23:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Attachment\control\form-loaction-control.ts
 */

import * as typings from "@cloudpivot/form/schema";

import { BaseControl } from '@cloudpivot/form/src/common/controls/base-control';

import { FromAddressValueService } from "@cloudpivot/form/src/common/services/form-address-value-service"

export abstract class FormLocationControl extends BaseControl<typings.LocationOptions> {

  val: any = {}

  static service: LocationService

  get address() {
    if (!this.ctrl.value) {
      return '';
    }
    const val = this.ctrl.value;
    return `${val.provinceName || ''}${val.cityName || ''}${val.districtName || ''}${val.address|| ''}`;
  }

  get isEl() {
    // 
    return FormLocationControl.service.isEl();
  }

  position() {
    if (!FormLocationControl.service) {
      return;
    }

    let range: number | undefined;
    if (this.controlOpts.displayMode === 'accurate') {
      range = parseInt(this.controlOpts.range.substr(0, this.controlOpts.range.length - 1));
    }
    FormLocationControl.service.position(range, true).then(result => {
      FromAddressValueService.setAddressVal(result.adcode).then((value:any) => {
        this.ctrl.value = Object.assign(result, value);
      });
      
    });
  }

  navigation() {
    if (!FormLocationControl.service || !this.ctrl.value) {
      return;
    }
    const val = this.ctrl.value;
    FormLocationControl.service.navigation(val.lat, val.lng, val.address);
  }

  setControl() {
    this.handleValueChange(this.ctrl.value);
  }

  handleValueChange(value: any) {
    this.val = value || {};
  }

}

export interface LocationService {

  initMap?(): void

  position(range?: number, showMap?: boolean): Promise<LocationPositionResult>

  navigation(latitude: number, longitude: number, title: string): void

  isEl(): boolean

}

export interface LocationPositionResult {

  provinceName: string,

  cityName: string,

  districtName: string,

  lat: number,

  lng: number,

  address: string

  adcode: string
}