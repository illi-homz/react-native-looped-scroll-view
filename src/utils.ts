import { StartTopSlideType, TopSlideType } from './types';

export const getStartTopSlides = (
  currentArray: any[],
  itemHeight: number,
): StartTopSlideType[] => {
  return currentArray.map((_, idx) => {
    if (idx === 0) {
      return { top: -itemHeight };
    }

    return { top: (idx - 1) * itemHeight };
  });
};

export const getTopSlides = (
  data: any[],
  currentArray: any[],
  itemHeight: number,
): TopSlideType[] => {
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
