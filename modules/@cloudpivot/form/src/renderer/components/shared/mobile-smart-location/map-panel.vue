

<template>
  <div class="map-panel">
    <div class="map-panel--input">
      <template v-if="!readonly">
        <h3-search-bar
          ref="searchInput"
          class="input"
          :onChange="search"
          :onClear="onClear"
        />
      </template>

      <template v-else>
        <div class="map-panel--input__detail" v-if="address">
          <span>{{ address }}</span>
        </div>
      </template>
    </div>

    <div
      class="map-panel--map"
      :class="{'readonly': readonly,'no-data':!address}"
    >
      <el-amap
        :vid="vidMap"
        :zoom="12"
        :center="mapCenter"
        class="amap"
        :events="events"
        :plugin="[{
          showCircle: true,
          enableHighAccuracy: true,
        }]"
        @click="onClickMap"
      >
        <el-amap-marker :position="mapCenter"></el-amap-marker>
      </el-amap>
      <div
        class="map-panel--map__location"
        @click="initLocation"
        v-if="!readonly"
      >
        <img src="./location.png" />
      </div>
    </div>

    <div
      class="map-panel--search"
      ref="searchResult"
      v-if="!readonly"
    >
      <template v-if="showSearchPanel">
        <p>搜索结果：共{{ areaList.length }} 条</p>
        <ul class="search-list" v-if="areaList.length > 0">
          <li
            v-for="(area,index) in areaList"
            :key="area.id || index"
            @click="searchListClick(area)"
          >
            <span
              class="res-name"
              v-hight-light="{'keyWords': keyWords, 'value': area.name }"
            ></span>
            <span class="res-district">{{ area.district || area.address }}</span>
          </li>
        </ul>
        <div v-else class="map-panel--search__nodata">
          <img src="./no-data.png" />
          <p>暂无搜索结果</p>
        </div>
      </template>
      <template v-else>
        <ul class="near-list">
          <li
            v-for="(area,index) in nearList"
            :key="area.id"
            @click="nearListPanelClick(area)"
          >
            <span class="res-name">
              {{ area.name }}
              <span v-if="index===0" class="current">[当前位置]</span>
            </span>
            <span class="res-district">{{ area.address }}</span>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Emit,
  Watch,
  Model
} from "vue-property-decorator";

import { H3Modal, H3Signature, H3SearchBar } from "h3-mobile-vue";

declare var AMap: any;

declare var AMapUI: any;

@Component({
  name: "map-panel",
  components: {
    H3SearchBar,
  }
})
export default class MapPanel extends Vue {
  @Model("input") 
  value!: {
    address: "";
    lng: 0;
    lat: 0;
  };

  @Prop({
    default: false
  })
  readonly!: boolean;

  @Prop({
    type: String,
    default: 'select'
  }) 
  type!: any;

  @Prop({
    type: String
  })
  vid!: string;

  // @Prop({
  //   type: String,
  //   default: "zh"
  // })
  // locale!: string;

  // @Prop({
  //   type: Boolean,
  //   default: false
  // })
  // showTip!: boolean;

  @Prop({
    type: Boolean,
    default: false
  })
  visible!: boolean;
  
  /**
   * 是否精确定位，
   * true：根据单点节点 根据range 范围搜索
   * false： 全国搜索
   */
  @Prop({
    default: false
  })
  isAccurate!: boolean;
  
  @Prop({
    default: 500
  })
  range!: number;

  mounted() {
    this.events = {
      click: this.onClickMap
    };
    
    // this.focus();
  }

  events: any = null;
  address: string = "";
  lng: number = 0;
  lat: number = 0;
  adcode: String = "";
  province = '';
  city = '';
  district = '';
  adDetail = '';
  showMap: boolean = false;
  openTip: boolean = true;

  keyWords: string = "";

  searchKey: string = '';

  searchOption: any = {
    city: "",
    citylimit: false
  };

  isInit: boolean = true;

  loaded = false;

  timestamp: number = 0;

  mapCenter: Array<number> = [121.59996, 31.197646];

  marker: number[] = this.mapCenter;

  hover = false;

  geolocation: any;

  showSearchResult = false;
  
  nearList: any[] = [];

  areaList: any[] = [];
  
  showSearchPanel: boolean = false;

  get vidMap() {
    return `${this.vid}-${this.timestamp}`;
  }
  
  gettimestamp() {
    this.timestamp = new Date().getTime();
  }

  listPanelSet() {
    // 
    this.showSearchPanel = false;
  }
  
  onClear() {
    this.listPanelSet();
  }

  @Watch("visible", {
    immediate: true
  })
  focus() {

    if(this.visible){
        if (this.isInit) {
        this.isInit = false;
        this.gettimestamp();
        }
        this.initLocation();
        // if(!this.value.lat && !this.value.lng){
        //     this.initGeolocation();
        // }

        // this.initPoiPicker();
    }
    
  }

  onClickMap(e: any) {
    // console.log(e);
    const { lng, lat } = e.lnglat;
    this.lng = lng;
    this.lat = lat;
    this.transformLoaction(lng, lat);
    this.marker = [lng, lat];
  }

  onCloseTip() {
    this.openTip = false;
  }

  /**
   * 经纬度转换成详细地址
   */
  transformLoaction(lng: number, lat: number) {
    const vm: any = this;
    // 这里通过高德 SDK 完成。
    let geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: "all"
    });
    geocoder.getAddress([lng, lat], (status: any, result: any) => {
      if (status === "complete" && result.info === "OK") {
        if (result && result.regeocode) {
          // 
          // const add = result.regeocode.formattedAddress;
          // vm.address = add;
          vm.adcode = result.regeocode.addressComponent.adcode;

          const adComponent: any = result.regeocode.addressComponent;
          const add = `${adComponent.township}${adComponent.street}${adComponent.streetNumber}`;

          vm.address = add;

          const currentAdress = {
            name: add,
            location: {
              lng,
              lat
            },
            selected: true
          };

          vm.nearList = [];

          vm.nearList.push(currentAdress);

          vm.getNear(vm.mapCenter);
        }
      }
    });
  }

  /**
   * 获取详细地址通过 adcode
   */
  getLocationByAdcode(adress: string) {
    const vm: any = this;
    let geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: "all"
    });

    geocoder.getLocation(adress, (status: any, result: any) => {
      if (status === "complete" && result.info === "OK") {
        // if (result && result.regeocode) {
        // 
        const city: any = result.geocodes[0];

        const add = city.formattedAddress;
        vm.address = add;
        vm.adcode = city.adcode;

        const { lng, lat } = city.location;

        vm.mapCenter = [lng, lat];

        const currentAdress = {
          name: add,
          location: {
            lng,
            lat
          },
          selected: true
        };

        vm.nearList = [];

        vm.nearList.push(currentAdress);

        vm.getNear(vm.mapCenter);

        vm.listPanelSet();
        // }
      }
    });
  }

  initLocation() {
    if (!this.geolocation) {
      this.geolocation = new AMap.Geolocation({
        // 是否使用高精度定位，默认：true
        enableHighAccuracy: true,
        // 设置定位超时时间，默认：无穷大
        timeout: 10000,
        // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
        buttonOffset: new AMap.Pixel(10, 20),
        //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        zoomToAccuracy: true,
        //  定位按钮的排放位置,  RB表示右下
        buttonPosition: "RB"
      });
    }

    const vm: any = this;

    // this.geolocation.getCityInfo((status: any, result: any) => {

    //   if (status === "complete" && result.info === "SUCCESS") {

    //     console.log(result);
    //     vm.mapCenter = result.center;
    //     // vm.marker = self.mapCenter;
    //     vm.address = result.province + result.city;
    //     vm.lng = result.center[0];
    //     vm.lat = result.center[1];
    //     vm.adcode = result.adcode;
    //   }
    // });

    this.geolocation.getCurrentPosition((status: any, result: any) => {
      // 
      if (status === "complete" && result.info === "SUCCESS") {
        // console.log('当前位置00000',result)
        // vm.address = result.formattedAddress;
        vm.lng = result.position.lng;
        vm.lat = result.position.lat;
        vm.adcode = result.addressComponent.adcode;
        vm.mapCenter = [vm.lng, vm.lat];

        const adComponent: any = result.addressComponent;
        const add = `${adComponent.township}${adComponent.street}${adComponent.streetNumber}`;

        const currentAdress = {
          name: add,
          location: {
            lng: vm.lng,
            lat: vm.lat
          },
          selected: true
        };

        vm.nearList = [];

        vm.nearList.push(currentAdress);

        vm.getNear(vm.mapCenter);
      }
    });
  }

  
  /**
   * 搜索列表点击
   */
  searchListClick(val: any) {
    if (val.location) {
      val.location;
      const { lng, lat } = val.location;
      this.lng = lng;
      this.lat = lat;
      this.mapCenter = [this.lng, this.lat];
      this.adcode = val.adcode;
      this.address = `${val.district || val.address}${val.name}`;
      const currentAdress = {
        name: this.address,
        location: {
          lng,
          lat
        },
        selected: true
      };

      this.nearList = [];

      this.nearList.push(currentAdress);

      this.getNear(this.mapCenter);

      this.listPanelSet();
    } else {
      this.getLocationByAdcode(val.district);
    }
  }
  
  nearListPanelClick(val: any) {
    // 
    const vm: any = this;

    const { lng, lat } = val.location;

    vm.address = `${val.address ? val.address : ""}${val.name}`;

    const ad = `${val.address ? val.address : ""}${val.name}`;

    let geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: "all"
    });
    geocoder.getAddress([lng, lat], (status: any, result: any) => {
      if (status === "complete" && result.info === "OK") {
        if (result && result.regeocode) {
          // 
          vm.adcode = result.regeocode.addressComponent.adcode;

          const addressComponent = result.regeocode.addressComponent;

          const {
            province,
            city,
            district,
            township,
            street
          } = addressComponent;

          const backData = {
            lng: vm.lng,
            lat: vm.lat,
            provinceName: province,
            cityName: city,
            districtName: district,
            adcode: vm.adcode,
            address: ad
          };

          vm.address = `${province}${city}${district}${ad}`;

          vm.$emit("change", backData);
          vm.keyWords = "";
        }
      }
    });
  }

  
  search(val: string) {
    // 
    if (this.isAccurate) {
      this.accurateSearch(val);
    } else {
      this.allSearch(val);
    }
  }

  allSearch(val: string) {
    this.keyWords = val;
    if (!val) return;
    this.showSearchPanel = true;
    const vm: any = this;
    AMap.plugin("AMap.PlaceSearch", function() {
      var autoOptions = {
        city: "全国",
        pageSize: 10
      };
      var placeSearch = new AMap.Autocomplete(autoOptions);
      placeSearch.search(val, function(status: any, result: any) {
        // 
        vm.areaList = result.tips;
      });
    });
  }

  accurateSearch(val: string) {
    this.keyWords = val;
    if (!val) return;
    this.showSearchPanel = true;
    const vm: any = this;
    // AMap.service(["AMap.PlaceSearch"], function() {
    //   const placeSearch = new AMap.placeSearch({
    //     pageSize: 10
    //   })

    //   placeSearch.searchNearBy(val,vm.mapCenter,vm.range,function(status:any, result:any) {
    //     
    //   });
    // });
    AMap.service(["AMap.PlaceSearch"], function() {
      var placeSearch = new AMap.PlaceSearch({
        pageSize: 10, // 每页10条
        pageIndex: 1 // 获取第一页
      });
      placeSearch.searchNearBy(val, vm.mapCenter, vm.range, function(
        status: any,
        result: any
      ) {
        // 
        if (result.info === "OK") {
          // result.poiList.pois.forEach((res:any) => {
          //   res.selected = false;
          // });
          vm.areaList = result.poiList.pois; // 周边地标建筑列表
          console.log("周边2333333", vm.nearList);
        } else {
          console.log("获取位置信息失败!");
        }
      });
    });
  }
  
  getNear(centerPoint: any) {
    const vm: any = this;
    AMap.service(["AMap.PlaceSearch"], function() {
      var placeSearch = new AMap.PlaceSearch({
        pageSize: 10, // 每页10条
        pageIndex: 1 // 获取第一页
        // city: city       // 指定城市名(如果你获取不到城市名称，这个参数也可以不传，注释掉)
      });
      placeSearch.searchNearBy("", centerPoint, 500, function(
        status: any,
        result: any
      ) {
        if (result.info === "OK") {
          result.poiList.pois.forEach((res: any) => {
            res.selected = false;
          });
          vm.nearList = vm.nearList.concat(result.poiList.pois); // 周边地标建筑列表
          console.log("周边2333333", vm.nearList);
        } else {
          console.log("获取位置信息失败!");
        }
      });
    });
  }

  ok() {
    // this.clearSearchInput();
    // self.province = adComponent.province;
    //       self.city = adComponent.city;
    //       self.district = adComponent.district;
    //       self.adDetail = add;
    const val = {
      provinceName: this.province,
      cityName: this.city,
      districtName: this.district,
      address: this.adDetail,
      lng: this.lng,
      lat: this.lat,
      adcode: this.adcode
    };
    // this.visible = false;

    // (this.$refs.input as any).blur();
    // this.$refs.search.clear();
    this.$emit("input", val);
    this.$emit("ok", val);
  }

  @Watch("value", {
    immediate: true
  })
  onChange(val: any) {
    if (val) {
      this.address = val.address || '';
    }
  }

}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

.map-panel {
  &--map {
    &.readonly {
      height: calc(100vh - 0.8rem);
    }
    &.readonly.no-data {
      height: 100vh;
    }
    height: 6.4rem;
    position: relative;
    &__location {
      right: 0.4rem;
      bottom: 0.4rem;
      position: absolute;
      img {
        width: 1.2rem;
        height: 1.2rem;
      }
    }
  }
  &--input {
    &__detail {
      text-align: left;
      color: rgba(51, 51, 51, 1);
      padding: 0.26rem 0.4rem 0.15rem 0.4rem;
    }
    .input {
      /deep/.h3-search-input {
        background-color: #f2f4f8;
        border-radius: 0.37rem;
      }
    }
  }
  &--search {
    &__nodata {
      padding-top: 2.35rem;
      height: calc(100vh - 4.6rem);
      background: #f7f8fc;
      img {
        width: 4.27rem;
        height: 2.91rem;
      }
      text-align: center;
      p {
        font-size: @font-size-14;
        color: @light-color-3;
      }
    }
    ul {
      overflow-y: scroll;
    }
    .near-list {
      height: calc(100vh - 7.6rem);
    }
    .search-list {
      height: calc(100vh - 2.4rem);
    }
    text-align: left;
    & > p {
      background: rgba(247, 248, 252, 1);
      line-height: 1.07rem;
      padding: 0 0.4rem;
    }
    ul {
      li {
        position: relative;
        padding: 0.26rem 0.4rem 0.15rem 0.4rem;
        & > span {
          display: block;
          font-size: 0.4rem;
          line-break: 0.61rem;
          &.res-name {
            color: rgba(51, 51, 51, 1);
            /deep/.highlight {
              color: @primary-color;
            }
            .current {
              color: rgba(153, 153, 153, 1);
            }
          }
          &.res-district {
            color: rgba(153, 153, 153, 1);
          }
        }
        .hairline("bottom", #eee);
      }
    }
  }
}
</style>
