export interface Saveable {
  toJson() : string;
  fromJson(json : string);
}