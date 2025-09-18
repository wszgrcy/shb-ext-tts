import { ManifestFactoy, NormalCollectionInlineType } from '@shenghuabi/sdk/server';
import { convertNumber } from '@siakhooi/number-to-chinese-words';
import { ExtensionConfig } from './config';
const HanNumberList = '零一二三四五六七八九'.split('');
function number2Han(input: number) {
  return `${input}`
    .split('')
    .map((c) => HanNumberList[+c])
    .join('');
}
// 不推荐变更此导出,未来可能会在其他地方使用
export const manifestFactory = (options: any): ManifestFactoy => {
  return (input) => {
    return {
      tts: {
        changeAudioItemList: [
          {
            name: '数字转中文',
            fn: async (item) => {
              let content = item.replaceContent ?? item.content;
              item.replaceContent = content.replace(/\d+/g, (input) => {
                console.log(input);
                return convertNumber(+input);
              });
              return item;
            },
          },
          {
            name: 'GB国标',
            priority: 1,
            fn: async (item) => {
              let content = item.replaceContent ?? item.content;
              item.replaceContent = content.replace(/(GB)\s?(?<index>\d+)(?<part>\.\d+)?(?<gang>—|-)(?<year>\d{4})/g, (input, ...args) => {
                let group = args.slice(-1)[0];
                let str = `国标${number2Han(group['index'])}`;
                if (group['part']) {
                  str += `点${number2Han(group['part'].slice(1))}`;
                }
                str += '杠';
                str += number2Han(group['year']);
                return str;
              });
              return item;
            },
          },
          {
            name: '自定义替换',
            priority: 2,
            fn: async (item) => {
              let content = item.replaceContent ?? item.content;
              for (const item of ExtensionConfig.replaceList()) {
                content = content.replaceAll(item.find, item.replace);
              }
              item.replaceContent = content;
              return item;
            },
          },
          {
            name: '正则自定义替换',
            priority: 3,
            fn: async (item) => {
              let content = item.replaceContent ?? item.content;
              for (const item of ExtensionConfig.regReplaceList()) {
                let regexp = new RegExp(item.find.pattern, item.find.flags);
                content = content.replace(regexp, item.replace);
              }
              item.replaceContent = content;
              return item;
            },
          },
        ],
      },
    };
  };
};
