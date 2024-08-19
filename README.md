# react-native-infinity-scroll-view

<img src="https://github.com/illi-homz/demos/blob/main/react-native-infinity-scroll-view.gif?raw=true" width="350">
<br>

## Installation
Using NPM:
```
$ npm i react-native-infinity-scroll-view
```

Using Yarn:
```
$ yarn add react-native-infinity-scroll-view
```

## Usage
```javascript
import { InfinityScrollView } from 'react-native-infinity-scroll-view'
```

```javascript
<InfinityScrollView
  data={[1,2,3,4,5,6,7,8,9]}
  renderItem={({ item }) => <View><Text>{item.toString()}</Text></View>}
  vivableCount={5}
  pagingEnabled
  onInit={saveHour}
  onScrollEnd={saveHour}
  onScrollStart={() => {
    setActiveHourIdx(undefined);
  }}
  style={styles.timeFace}
/>
```

## Options

### InfinityScrollView

| Props | Type | Desc | Required |
| --- | --- | --- | --- |
| data | any[] | Items list | true |
| pagingEnabled | boolean | Fix position after scroll | false |
| vivableCount | number | Items count on scroll viewport | true |
| onInit | (items?: RenderItemValueType[]) => void | - | false |
| onScrollStart | () => void | - | false |
| onScrollEnd | (items?: RenderItemValueType[]) => void | - | false |
| renderItem | (v: RenderItemValueType) => ReactNode | - | true |
| onViewableItemsChanged | (items?: RenderItemValueType[]) => void | - | false |
| style | StyleProp<ViewStyle> | - | false |

<br>

## Authors

- [Ilya Gomza](https://github.com/illi-homz/)