export default {
    Checkbox: () => import('./checkbox.vue'),
    Empty: () => import('./empty/empty.vue'),
    GridList: () => import('./grid-list.vue'),
    LoadingFailed: () => import('./loading-failed/loading-failed.vue'),
    NoSearchData: () => import('./no-search-data.vue'),
    Searchbar: () => import('./searchbar.vue'),
    Sidebar: () => import('./sidebar.vue'),
    AppsList: () => import('./applist.vue'),
    Tabbar: () => import('./sidebar.vue'),
    ItemList: () => import('./item-list.vue'),
    Toptip: () => import('./toptip.vue'),
    BaseItem: () => import('./base-item/base-item.vue'),
    BottomButton: () => import('./bottom-button.vue'),
    FormUnpublished: () => import('./form-unpublished/form-unpublished.vue')
}