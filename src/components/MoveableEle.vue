<template>
  <div contenteditable="false" v-if="targetEle" class="mover-tools" :style="'left:'+x+'px;top:'+
  (y-headerHeight-scrollToTop)+'px;width:'+w+'px;height:'+h+'px'"
    @mousedown="onMoveStartMove($event)"
    @touchstart="onMoveStartMove($event)">
    <div class="point delete" @click="$emit('delete')">
      <i class="iconfont icon-guanbi"></i>
    </div>
    <div class="point menu" @click="$emit('menu')">
      <i class="iconfont icon-caidan1"></i>
    </div>
    <div class="point-resize"
      v-if="canSize"
      @mousedown="onResizeStartMove($event)"
      @touchstart="onResizeStartMove($event)">
      <div class="point">
        <i class="iconfont icon-suofang"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Pos, { Point }  from "../utils/Pos";

@Component
export default class MoveableEle extends Vue {
  name = "MoveableEle";

  @Prop({default:null}) targetEle : HTMLElement;
  @Prop({default:0}) headerHeight : number;
  @Prop({default:0}) scrollToTop : number;
  @Prop({default:'custom'}) sizeOption : 'full-size'|'auto-size'|'custom-size'|'custom';

  private canSize = false;
  private canMove = false;

  @Watch("targetEle")
  onTargetEleChanged(ele) {
    if(ele) { 
      this.resetPosition();
      this.resetSize();
      this.resetType();
    }
  }
  @Watch("sizeOption")
  onSizeOptionChanged(h) {
    this.resetType();
  }
 

  mounted() {
    window.addEventListener('mousemove', this.onMove.bind(this));
    window.addEventListener('touchmove', this.onMove.bind(this));
    window.addEventListener('touchend', this.onMouseUp.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    
  }
  beforeDestroy() {
    window.removeEventListener('mousemove', this.onMove.bind(this));
    window.removeEventListener('touchmove', this.onMove.bind(this));
    window.removeEventListener('touchend', this.onMouseUp.bind(this));
    window.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private resizeing = false;
  private moving = false;
  private moveSartPosOffest = { x: 0, y: 0 }
  private resizeSartPosOffest = { x: 0, y: 0 }

  onMoveStartMove(e : MouseEvent | TouchEvent) {
    if((<HTMLElement>e.target).classList.contains('point-resize') 
      || (<HTMLElement>e.target).classList.contains('point') 
      || this.sizeOption == 'full-size'
      || this.sizeOption == 'auto-size'
      || this.sizeOption == 'custom-size') 
      return;

    this.moving = true;
    this.resizeing = false;
    if(e instanceof TouchEvent) {
      this.moveSartPosOffest.x = e.touches[0].screenX - this.x;
      this.moveSartPosOffest.y = e.touches[0].screenY - this.y;
    } else if(e instanceof MouseEvent) {
      this.moveSartPosOffest.x = e.screenX - this.x;
      this.moveSartPosOffest.y = e.screenY - this.y;
    }
  }
  onResizeStartMove(e : MouseEvent | TouchEvent) {
    if(this.sizeOption == 'full-size' || this.sizeOption == 'auto-size')
      return;

    this.moving = false;
    this.resizeing = true;
    if(e instanceof TouchEvent) {
      this.resizeSartPosOffest = Pos.screenToClient(<HTMLElement>e.target, { x: e.touches[0].screenX, y: e.touches[0].screenY })
    } else if(e instanceof MouseEvent) {
      this.resizeSartPosOffest = Pos.screenToClient(<HTMLElement>e.target, { x: e.screenX, y: e.screenY })
    }
  }

  onMove(e : MouseEvent | TouchEvent) {
    let p : Point = null;
    if(this.moving) {
      if(e instanceof TouchEvent) {
        p = Pos.screenToClient(<HTMLElement>this.targetEle.parentNode, new Point(
          e.touches[0].screenX - this.moveSartPosOffest.x, 
          e.touches[0].screenY - this.moveSartPosOffest.y));
      } else if(e instanceof MouseEvent) {
        p = Pos.screenToClient(<HTMLElement>this.targetEle.parentNode, new Point(
          e.screenX - this.moveSartPosOffest.x, 
          e.screenY - this.moveSartPosOffest.y));
      }
      this.targetEle.style.marginLeft = p.x + 'px';
      this.targetEle.style.marginTop = p.y + 'px';
      this.resetPosition();
    }
    else if(this.resizeing) {
      if(e instanceof TouchEvent) {
        p = new Point(
          e.touches[0].screenX - this.x, e.touches[0].screenY - this.headerHeight - this.y);
      } else if(e instanceof MouseEvent) {
        p = new Point(
          e.screenX - this.x, e.screenY - this.headerHeight - this.y)
      }
      this.targetEle.style.width = p.x + 'px';
      this.targetEle.style.height = p.y + 'px';
      this.resetPosition();
      this.resetSize();
    }
  }
  onMouseUp() {
    this.moving = false;
    this.resizeing = false;
    this.resetPosition();
    this.resetSize();
  }
  

  x : number = 0;
  y : number = 0;
  w : number = 0;
  h : number = 0;

  resetPosition() {
    if(this.targetEle != null) {
      this.x = Pos.getLeft(this.targetEle);
      this.y = Pos.getTop(this.targetEle);
    }
  }
  resetSize() {
    if(this.targetEle != null) {
      this.w = this.targetEle.offsetWidth;
      this.h = this.targetEle.offsetHeight;
    }
  }
  resetType() {
    switch(this.sizeOption) {
      case 'full-size': 
        this.targetEle.style.marginLeft = '';
        this.targetEle.style.marginTop = '';
        this.targetEle.style.width = '100%';
        this.targetEle.style.height = 'auto';
        this.canSize = false;
        break;
      case 'auto-size': 
        this.targetEle.style.marginLeft = '';
        this.targetEle.style.marginTop = '';
        this.targetEle.style.width = 'auto';
        this.targetEle.style.height = 'auto';
        this.canSize = false;
        break;
      default:
      case 'custom':
      case 'custom-size': 
        this.canSize = true;
        break;
    }
    this.resetPosition();
    this.resetSize();
  }
}

</script>

<style lang="scss">

@import '../assets/sass/root';

.mover-tools {
  position: absolute;
  display: inline-block;
  border: 1px solid $color-primary;
  z-index: 100;
  cursor: move;

  .point-resize {
    display: inline-block;
    width: 40px;
    height: 40px;
    cursor: nw-resize;
    position: absolute;
    bottom: -20px;
    right: -20px;
    z-index: 101;

    .point {
      position: absolute;
      left: 10px;
      top: 10px;
      
    }
  }
  .point {

    $point-width : 20px;

    position: absolute;
    width: $point-width;
    height: $point-width;
    background-color: $color-primary;
    border-radius: 50%;
    color: #fff;
    text-align: center;

    i {
      font-size: 10px;
      line-height: 20px;
    }

    &.delete {
      top: -($point-width / 2);
      left: -($point-width / 2);
      cursor: pointer;
    }
    &.menu {
      top: -($point-width / 2);
      right: -($point-width / 2);
      cursor: pointer;
    }
    &.resize {
      bottom: -($point-width / 2);
      right: -($point-width / 2);
      cursor: nw-resize;
    }
  }
}
</style>
