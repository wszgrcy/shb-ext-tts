import { ComponentInput } from '@shenghuabi/sdk/componentDefine';
import { NODE_DEFINE } from '../common/define';

export default (input: ComponentInput) => {
  return {
    // 在节点中显示
    displayConfig: NODE_DEFINE,
    // 右侧显示
    config: NODE_DEFINE,
    // 初始化数据,和NODE_DEFINE(input)数据结构类似,一般不需要改变
    initData: () => {
      return {
        data: {
          // 节点是否允许缩放
          transform: {
            resizable: true,
          },
        },
        // 初始化宽度
        width: 300,
      };
    },
  };
};
