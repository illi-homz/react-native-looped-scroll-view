import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { RenderItemValueType, StartTopSlideType, TopSlideType } from './types';
import { getStartTopSlides, getTopSlides } from './utils';

const InfinitySlider: React.FC<InfinitySliderProps> = ({
  data,
  vivableCount,
  pagingEnabled = false,
  style,
  renderItem,
  onViewableItemsChanged,
  onInit,
  onScrollStart,
  onScrollEnd,
}) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const itemHeight = containerHeight / vivableCount;
  const currentArray = [
    data[data.length - 1],
    ...data.slice(0, vivableCount + 1),
  ];

  const [topSlides, setTopSlides] = useState<TopSlideType[]>([]);

  const startTopSlidesRef = useRef<StartTopSlideType[]>();
  const topSlidesRef = useRef<TopSlideType[]>();
  const isInertiaAnimation = useRef(false);
  const sirectionForVivableSlidesRef = useRef<number | undefined>();
  const viewableItemsRef = useRef<any[] | undefined>();
  const topIndexDataRef = useRef(data.length - 1);
  const bottomIndexDataRef = useRef(currentArray.length - 2);
  const topIndexRef = useRef(0);
  const bottomIndexRef = useRef(currentArray.length - 1);

  useEffect(() => {
    if (containerHeight) {
      initStartValues();
    }
  }, [containerHeight]);

  const initStartValues = () => {
    startTopSlidesRef.current = getStartTopSlides(currentArray, itemHeight);
    setTopSlides(getTopSlides(data, currentArray, itemHeight));

    setTimeout(() => {
      saveTopSlides(0);
      onShowViewableItems(1);
      onInit?.(viewableItemsRef.current);
    }, 300);
  };

  const inertFunCouner = useRef(0);
  const timeout = useRef<NodeJS.Timeout>();

  const runStepper = async (
    cb: (step: number) => boolean,
    count = 20,
  ): Promise<any> => {
    inertFunCouner.current = +count;

    while (inertFunCouner.current !== 0) {
      await new Promise((resolve, reject) => {
        timeout.current = setTimeout(() => {
          const ok = cb(inertFunCouner.current);

          if (!ok) {
            inertFunCouner.current = 0;
            clearTimeout(timeout.current);
            reject();
          }

          resolve(undefined);
        }, 1);
      });

      inertFunCouner.current--;
    }
  };

  const scrollToTop = async (translationY: number): Promise<any> => {
    const steps = 10;
    let newTranslationY = +translationY;

    let topNode: TopSlideType;

    topSlidesRef.current?.forEach(item => {
      if (!topNode) topNode = item;

      if (Math.abs(item.top) < Math.abs(topNode.top)) {
        topNode = item;
      }
    });

    // @ts-ignore
    if (!topNode) return;

    let cureentTop = topNode.top;

    onShowViewableItems(cureentTop);

    await runStepper(() => {
      let shift = cureentTop / steps;

      newTranslationY = newTranslationY - shift;
      saveTopSlides(newTranslationY);

      return true;
    }, steps);

    saveStartTop();
    onScrollEnd?.(viewableItemsRef.current);
  };

  const animateInertia = async ({
    velocityY,
    translationY,
  }: PanGestureHandlerEventPayload) => {
    if (Math.abs(velocityY) < 400) {
      if (pagingEnabled) {
        return scrollToTop(translationY);
      }

      return saveStartTop();
    }

    isInertiaAnimation.current = true;
    const kooff = 0.95;
    let shift = 10;
    let newTranslationY = +translationY;

    await runStepper(step => {
      shift = shift * kooff;

      if (velocityY > 0) {
        newTranslationY += shift;
      }

      if (velocityY < 0) {
        newTranslationY -= shift;
      }

      saveTopSlides(newTranslationY);

      return true;
    }, 60);

    if (pagingEnabled) {
      await scrollToTop(newTranslationY);
    }

    saveStartTop();
    isInertiaAnimation.current = true;
  };

  const saveTop = ({
    translationY,
  }: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
    if (isInertiaAnimation.current) {
      isInertiaAnimation.current = false;
      inertFunCouner.current = 0;
      clearTimeout(timeout.current);
      saveStartTop();

      return;
    }

    saveTopSlides(translationY);
  };

  const saveStartTop = () => {
    startTopSlidesRef.current = startTopSlidesRef.current?.map((el, idx) => ({
      ...el,
      top: topSlidesRef.current?.[idx].top || 0,
    }));
  };

  const onShowViewableItems = (direction: number) => {
    const slidesList = [...(topSlidesRef.current || [])];
    const sortedSlides = slidesList.sort((a, b) => (a.top > b.top ? 1 : -1));
    let slicedList;

    if (direction <= 0) {
      slicedList = sortedSlides
        .slice(0, vivableCount)
        .map(({ item, index }) => ({ item, index }));
    }

    if (direction > 0) {
      slicedList = sortedSlides
        .slice(1, vivableCount + 1)
        .map(({ item, index }) => ({ item, index }));
    }

    slicedList && onViewableItemsChanged?.(slicedList);
    viewableItemsRef.current = slicedList;

    sirectionForVivableSlidesRef.current = undefined;
  };

  const getNewTopSlides = (
    translationY: number,
    oldData: TopSlideType[],
  ): TopSlideType[] => {
    const newData = oldData.map((oldValue, idx) => {
      const startTop =
        (startTopSlidesRef.current?.[idx].top || 0) + translationY; // work

      if (startTop < -itemHeight && idx === topIndexRef.current) {
        const lastItem = oldData[bottomIndexRef.current];
        const lastTop = lastItem.top + itemHeight;

        if (startTopSlidesRef.current) {
          startTopSlidesRef.current[idx].top =
            startTopSlidesRef.current[bottomIndexRef.current].top + itemHeight;
        }

        topIndexRef.current = idx + 1;
        bottomIndexRef.current = idx;

        topIndexDataRef.current += 1;
        bottomIndexDataRef.current += 1;

        if (topIndexRef.current === oldData.length) {
          topIndexRef.current = 0;
        }
        if (topIndexDataRef.current === data.length) {
          topIndexDataRef.current = 0;
        }
        if (bottomIndexDataRef.current === data.length) {
          bottomIndexDataRef.current = 0;
        }

        const newValue = {
          ...oldValue,
          top: lastTop,
          item: data[bottomIndexDataRef.current],
          index: bottomIndexDataRef.current,
        };

        return newValue;
      }

      if (
        startTop > containerHeight + itemHeight &&
        idx === bottomIndexRef.current
      ) {
        const firstItem = oldData[topIndexRef.current];
        const firstTop = firstItem.top - itemHeight;

        if (startTopSlidesRef.current) {
          startTopSlidesRef.current[idx].top =
            startTopSlidesRef.current[topIndexRef.current].top - itemHeight;
        }

        topIndexRef.current = idx;
        bottomIndexRef.current = idx - 1;

        topIndexDataRef.current -= 1;
        bottomIndexDataRef.current -= 1;

        if (bottomIndexRef.current === -1) {
          bottomIndexRef.current = oldData.length - 1;
        }
        if (topIndexDataRef.current === -1) {
          topIndexDataRef.current = data.length - 1;
        }
        if (bottomIndexDataRef.current === -1) {
          bottomIndexDataRef.current = data.length - 1;
        }

        const newValue = {
          ...oldValue,
          top: firstTop,
          item: data[topIndexDataRef.current],
          index: topIndexDataRef.current,
        };

        return newValue;
      }

      return { ...oldValue, top: startTop };
    });

    return newData;
  };

  const saveTopSlides = (translationY: number) => {
    setTopSlides(old => {
      topSlidesRef.current = getNewTopSlides(translationY, old);

      if (sirectionForVivableSlidesRef.current) {
        onShowViewableItems(sirectionForVivableSlidesRef.current);
      }

      return topSlidesRef.current;
    });
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      onScrollStart && runOnJS(onScrollStart)();
    })
    .onUpdate(e => {
      runOnJS(saveTop)(e);
    })
    .onEnd(e => {
      runOnJS(animateInertia)(e);
    })
    .onFinalize(e => {});

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.container, style]}
        onLayout={({ nativeEvent }) => {
          setContainerHeight(nativeEvent.layout.height);
        }}>
        {/* {topSlides.map(({ item, top, index }, idx) => { */}
        {topSlides.map(({ item: dataItem, top, index }, idx) => {
          const item = topSlidesRef.current?.[idx].item || dataItem;

          return (
            <View key={idx} style={[styles.item, { top, height: itemHeight }]}>
              {renderItem({ item, index })}
            </View>
          );
        })}
      </View>
    </GestureDetector>
  );
};

export default InfinitySlider;

type InfinitySliderProps = {
  data: any[];
  pagingEnabled?: boolean;
  vivableCount: number;
  onInit?(items?: RenderItemValueType[]): void;
  onScrollStart?(): void;
  onScrollEnd?(items?: RenderItemValueType[]): void;
  renderItem(v: RenderItemValueType): ReactNode;
  onViewableItemsChanged?(items: RenderItemValueType[]): void;
  style?: StyleProp<ViewStyle>;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  item: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
  },
  text: {
    fontSize: 22,
    lineHeight: 24,
    textAlign: 'center',
    color: 'white',
    fontWeight: '700',
  },
});
