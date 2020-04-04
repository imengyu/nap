export interface ResetFul<T> {
  get(id : number, querys ?: any) : Promise<T>;
  getPage(index : number, size : number, querys ?: any) : Promise<RequestPage<T>>;
  add(data, querys ?: any) : Promise<number>;
  update(id : number, data : T, querys ?: any) : Promise<T>;
  delete(id : number, querys ?: any) : Promise<T>;
}
export class RequestPage<T> {
  items : Array<T>;
  allItemCount : number;
  pageSize : number;
  pageCount : number;
  pageIndex : number;
}