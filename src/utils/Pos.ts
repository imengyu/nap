
export class Point {
  x : number = 0;
  y : number = 0;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function getTop(e : HTMLElement){
  var offset=e.offsetTop;
  if(e.offsetParent != null) 
    offset += getTop(<HTMLElement>e.offsetParent);
  return offset;
}
function getLeft(e : HTMLElement){
  var offset=e.offsetLeft;
  if(e.offsetParent != null) 
    offset += getLeft(<HTMLElement>e.offsetParent);
  return offset;
}
function screenToClient(e : HTMLElement, pos : Point) {
  return new Point(pos.x - getLeft(e), pos.y - getTop(e));
}
function clientToScreen(e : HTMLElement, pos : Point) {
  return new Point(pos.x + getLeft(e), pos.y + getTop(e));
}

export default {
  getLeft,
  getTop,
  screenToClient,
  clientToScreen,
}