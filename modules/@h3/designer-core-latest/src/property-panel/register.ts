
import { VueConstructor } from 'vue';

import { PropertyInfo, PropertyDisplaySettings } from '../typings';
import { ObjectPropertyInfo } from '../schema-typings';


export interface Register {

  components: RegisterComponents

  componentMap: (propertyInfo: PropertyInfo, displaySettings: PropertyDisplaySettings) => string

}


export interface RegisterComponents {

  [key: string]: VueConstructor<any> | (() => Promise<typeof import('*.vue')>)

}


export interface Packages {
  [key: string]: {
    schema: ObjectPropertyInfo,
    component: VueConstructor<any> | (() => Promise<typeof import('*.vue')>)
  }
}


export class Register {

  components: RegisterComponents = {}

  packages: Packages = {}

  componentMap: (propertyInfo: PropertyInfo, displaySettings: PropertyDisplaySettings) => string = () => ''

}

export const register = new Register() 