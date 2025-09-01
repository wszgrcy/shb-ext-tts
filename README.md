# 使用说明
- 安装 nodejs 20.18.2或者以上版本
> https://nodejs.org/zh-cn/download
> 推荐fnm(nodejs版本管理),在msys2中会快一些

- `npm i` 安装依赖
- `npm run local-publish` 构建依赖
- `dist`文件夹中的`shb-ext-demo-XX.YY.ZZ.vsix`为打包好的制品
- 导入`vsix`到软件中

# 注意
- 任何插件导入后都必须重启软件
> 虽然右下角弹窗需要重启插件,但是实际上这会重启所有插件,并且会导致已经打开的页面与原有上下文的连接丢失