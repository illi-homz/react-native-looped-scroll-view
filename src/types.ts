import { ListRenderItemInfo } from 'react-native';

export type TopSlideType = {
  top: number;
  item: any;
  index: number;
  // isLock: boolean;
};

export type StartTopSlideType = Pick<TopSlideType, 'top'>;

export type RenderItemValueType = Pick<
  ListRenderItemInfo<any>,
  'index' | 'item'
>;
