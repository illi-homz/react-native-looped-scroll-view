import { StartTopItemType, TopItemType } from './types';

export const getStartTopItems = (
  currentArray: any[],
  itemHeight: number,
): StartTopItemType[] => {
  return currentArray.map((_, idx) => {
    if (idx === 0) {
      return { top: -itemHeight };
    }

    return { top: (idx - 1) * itemHeight };
  });
};

export const getTopItems = (
  data: any[],
  currentArray: any[],
  itemHeight: number,
): TopItemType[] => {
  return currentArray.map((item, idx) => {
    if (idx === 0) {
      return {
        top: -itemHeight,
        item,
        index: data.length - 1,
        // isLock: false,
      };
    }

    return {
      top: (idx - 1) * itemHeight,
      item,
      index: idx - 1,
      // isLock: false,
    };
  });
};
