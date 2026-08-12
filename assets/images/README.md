# 美术资源

把美术资源放到这个目录下，文件名必须与 `js/config.js` / `index.html` / `js/ui.js` 里引用的路径一致。

## 当前需要的文件

| 文件名 | 引用位置 | 备注 |
|---|---|---|
| `robot.png` | [index.html:56](file:///d:/Trae/game/index.html#L56) + [ui.js:190](file:///d:/Trae/game/js/ui.js#L190) | 自动拆包器机器人形象（你刚提供的） |

## 建议规格

- **格式**：PNG（透明背景）或 SVG
- **尺寸**：512×512 或 1024×1024（高清，CSS 会用 `object-fit: contain` 缩到 44×44）
- **风格**：暖橘色卡通 / zakka / 扁平 3D（与项目"暖橘牛皮纸"主题一致）
- **透明背景**：必备

## 未来规划

```
images/
  ├─ robot.png         ← 自动拆包器机器人
  ├─ parcel-ordinary.png  ← 普通快递盒（未来替换）
  ├─ parcel-premium.png   ← 精品快递盒
  ├─ parcel-luxury.png    ← 豪华礼盒
  └─ item-*.png        ← 物品图标（未来替换 emoji）
```

替换完成后，HTML/CSS 不需要再改，刷新即可生效。
