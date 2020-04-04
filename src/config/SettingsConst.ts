export const settingsDef = {
  listMode: 'list',
  listSortMode: 'createDate',
  insertImageBase64: true,
};

export interface SettingsData {
  listMode: 'list'|'grid',
  listSortMode: 'createDate'|'updateDate'|'name',
  insertImageBase64: boolean,
};