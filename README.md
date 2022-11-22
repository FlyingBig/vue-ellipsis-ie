<!--
 * @Author: Chenqy
 * @Date: 2022-11-14 11:09:45
 * @description: 描述此文件
 * @LastEditors: Chenqy
 * @LastEditTime: 2022-11-22 11:35:24
-->
# vue-text-ellipsis-ie
兼容ie浏览器的多行省略Vue组件
## 用法
```
· import { MutiEllipsis } from "vue-ellipsis-ie";
在组件中直接使用components: { MutiEllipsis }
```
```
 在main.js中
import MutiEllipsis from "vue-ellipsis-ie";
Vue.use(MutiEllipsis);
在任意组件中使用： <MutiEllipsis text="text" :maxLine="9"></MutiEllipsis>
```
 组件配置项
#### text [String]
  需要展示的文字内容
#### ~~height [Number] 优先级比maxline更高 [1.0.7及以后废弃]~~
  ~~设置一个高度，在此高度内自动适配出最合适的高度~~
#### ~~heightType [remove / increase] [1.0.7及以后废弃]~~
  ~~只有在设置height以后才生效，若设置的高度处于n*lineHeight < height < (n+1)*lineHeight,remove-> height = n*lineHeight;increase -> (n+1) * lineHeight~~
#### maxLine [Number] 建议使用
  设置一个最大行数, 超过该行数就省略
#### isComplate [Boolean]
  是否完全展示内容
#### txtStyle [cssStyle]
  设置内容的style样式
#### more [String]
  超过部分使用什么字符代替
#### tabs [Number]
  省略位置往前/后平移几个字体单位

在线dome：https://codesandbox.io/s/sweet-sutherland-nuqg43?file=/src/App.vue
