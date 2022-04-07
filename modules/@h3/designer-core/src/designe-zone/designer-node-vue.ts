
import { Component, Prop, Vue, Inject, Provide, Watch } from "vue-property-decorator";

import { register, uniqueId, DesignerNode } from '../register';

import { Direction, ComponentAsset } from '../typings';

import * as factory from "../property-panel/factory";

@Component
export default class DesignerNodeVue extends Vue {

  @Prop({
    default: -1
  })
  index!: number

  @Prop({
    default: ''
  })
  id!: string

  @Prop({
    default: ''
  })
  parentId!: string

  @Prop({
    default: ''
  })
  translateTo!: string

  @Prop({
    default: false
  })
  isRoot!: boolean

  @Prop({
    default: true
  })
  removable!: boolean

  @Prop({
    default: true
  })
  draggable!: boolean

  @Prop({
    default: false
  })
  full!: boolean

  @Prop({
    default: () => []
  })
  childIds!: string[]

  dragDirection = Direction.None

  get store() {
    const store = register.store;
    if (!store) {
      throw new Error('DesignerNode get store');
    }
    return store;
  }

  get node(): DesignerNode {
    return (register.store as any).get(this.id);
  }

  get properties(){
    return this.node.data.children;
  }

  get active() {
    const store = register.store;
    if (store) {
      return store.active;
    }
    return null;
  }

  get isActive() {
    return !!this.active && this.active.id === this.id
  }

  get pointerInNorth() {
    return this.dragDirection === Direction.North;
  }

  get pointerInCenter() {
    return this.dragDirection === Direction.Center;
  }

  get pointerInSouth() {
    return this.dragDirection === Direction.South;
  }

  @Watch('childIds',{
    immediate : true
  })
  onChildIdsChange(){
    this.children = this.childIds.map(cid => (register.store as any).get(cid))
  }

  children : DesignerNode[] = []

  // get children() {
  //   return this.childIds.map(cid => (register.store as any).get(cid))
  // }
  // get children() {
  //   const store = register.store;
  //   if (store) {
  //     return store.getChildren(this.id);
  //   }
  //   return [];
  // }

  get asset(){
    return register.assets[this.node.type];
  }

  get defaultFull() {
    return !!this.asset.info.full;
  }

  get isContainer() {
    return !!this.asset.info.container
  }

  get targetId() {
    return this.translateTo || this.id;
  }

  get target(): DesignerNode {
    return (register.store as any).get(this.targetId);
  }

  // get data(){
  //   return this.instance.data;
  // }

  beforeCreate() {
    const components = this.$options.components;
    if (components) {
      for (const name in register.components) {
        components[name] = (register.components as any)[name];
      }

      for (const type in register.assets) {
        const asset = register.assets[type];
        components[type] = asset.component;
      }
    }
  }

  onDragover(evt: DragEvent) {
    const store = register.store;
    if (!store) {
      throw new Error();
    }

    let type = '';
    if (register.dragging) {
      type = register.dragging.info.type;
    } else if (register.draggingNode) {
      type = register.draggingNode.type;
      if (this.id === register.draggingNode.id) {
        return;
      }
      if (store.isAncestor(this.id, register.draggingNode.id)) {
        return;
      }
    }

    if (!type) {
      return;
    }

    if (this.isContainer) {
      const types = this.asset.info.requireChildTypes;
      if (types && types.length > 0 && !types.includes(type)) {
        return;
      }
    } else {
      const types = this.asset.info.requireParentTypes;
      if (types && types.length > 0) {

        const parent = store.get(this.parentId);
        if (!parent) {
          throw new Error('onDragover not found parent:' + this.parentId);
        }

        if (!types.includes(parent.type)) {
          return;
        }
      }
    }

    this.dragDirection = this.calcDragDirection(evt);

    // console.log(this.instance.type, this.dragDirection);

    evt.preventDefault();
  }

  // clearCss = 0

  onDragleave() {
    // this.clearCss = setTimeout(() => {
    this.dragDirection = Direction.None;
    // }, 300)
  }

  calcDragDirection(evt: DragEvent) {
    let { offsetX, offsetY, srcElement } = evt;
    const el = srcElement as HTMLElement;

    // console.log(this.instance.type, el.outerHTML);

    let direction = Direction.None;
    if (!el) {
      return direction;
    }

    if (this.asset.info.container) {
      direction = Direction.Center;
      // const threshold = el.offsetHeight / 4;
      // if (offsetY <= threshold) {
      //   direction = Direction.North;
      // } else if (offsetY > threshold && offsetY <= threshold * 3) {
      //   direction = Direction.Center;
      // } else {
      //   direction = Direction.South;
      // }
    } else {
      const threshold = el.offsetHeight / 2;
      if (offsetY <= threshold) {
        direction = Direction.North;
      } else {
        direction = Direction.South;
      }
    }

    return direction;
  }

  onDrop(evt: DragEvent) {

    const store = register.store;
    if (!store) {
      throw new Error('onDrop register.store');
    }

    const direction = this.calcDragDirection(evt);
    const vertical = direction === Direction.North ? 0 : 1;
    const dropIn = this.isRoot || (this.asset.info.container && direction === Direction.Center);

    if (register.dragging) {
      const asset = register.dragging;
      register.dragging = null;

      if (dropIn) {
        const id = uniqueId();
        const data = factory.build(asset.schema, id, asset.info.type);
        store.insert({
          id,
          parentId: this.id,
          type:asset.info.type,
          data,
          index: -1
        });
        this.setActive(id);

      } else {

        const parent = store.get(this.parentId);
        if (!parent) {
          throw new Error('onDrop not found parent:' + this.parentId);
        }

        const index = this.index + vertical;
        const id = uniqueId();
        const data = factory.build(asset.schema, id, asset.info.type);
        store.insert({
          id,
          index,
          parentId: this.parentId,
          type:asset.info.type,
          data,
        });
        this.setActive(id);
      }

    } else if (register.draggingNode) {

      const draggingNode = register.draggingNode;
      register.draggingNode = null;

      let parentId = '';
      let index = 0;

      if (dropIn) {
        parentId = this.id;
        index = this.children.length;
      } else {
        parentId = this.parentId;
        index = this.index + vertical;
      }

      store.move({
        parentId,
        id: draggingNode.id,
        index
      });

      this.setActive(draggingNode.id);
    }

    this.dragDirection = Direction.None;
  }

  onDragstart(evt: DragEvent) {
    if (!this.draggable) {
      evt.preventDefault();
      return;
    }
    register.draggingNode = this.target;
  }

  onDragend(evt: DragEvent) {
    register.draggingNode = null;
  }

  onRemove(id: string) {
    const store = register.store;
    if (store) {
      store.remove({
        // parentId: this.parentId,
        id
      });
      this.setActive(null);
    }
  }

  removeSelf() {
    this.onRemove(this.targetId);
  }

  setActive(id: string | null) {
    const store = register.store;
    if (store) {
      store.active = id ? store.get(id) : null;
    }
  }

  setActiveSelf() {
    const store = register.store;
    if (store) {
      store.active = this.target;
    }
  }

}