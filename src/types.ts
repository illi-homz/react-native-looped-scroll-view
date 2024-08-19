import { ListRenderItemInfo } from 'react-native';

export type TopItemType = {
  top: number;
  item: any;
  index: number;
};

export type StartTopItemType = Pick<TopItemType, 'top'>;

export type RenderItemValueType = Pick<
  ListRenderItemInfo<any>,
  'index' | 'item'
>;
