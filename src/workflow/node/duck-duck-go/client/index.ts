import { ComponentInput } from '@shenghuabi/sdk/componentDefine';
import { NODE_DEFINE } from '../common/define';

export default (input: ComponentInput) => {
  return {
    displayConfig: NODE_DEFINE,
    config: NODE_DEFINE,
    initData: () => {
      return {
        data: {
          transform: {
            resizable: true,
          },
        },
        width: 300,
      };
    },
  };
};
