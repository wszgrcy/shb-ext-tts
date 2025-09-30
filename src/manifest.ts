import { ManifestFactoy } from '@shenghuabi/sdk/server';
import { convertNumber } from '@siakhooi/number-to-chinese-words';
import { ExtensionConfig } from './config';
import { llmParseToTTSRunner } from './workflow/node/llm-parse-to-tts/server';
const HanNumberList = '零一二三四五六七八九'.split('');
function number2Han(input: number) {
  return `${input}`
    .split('')
    .map((c) => HanNumberList[+c])
    .join('');
}
// 不推荐变更此导出,未来可能会在其他地方使用
export const manifestFactory = (_: any): ManifestFactoy => {
  return (input) => {
    return {
      workflow: {
        node: [
          {
            client: './workflow/node/llm-parse-to-tts/client/index.js',
            runner: llmParseToTTSRunner(input),
            config: {
              type: 'llm-parse-to-tts',
              label: `llm解析tts配置`,
              // icon: 'manage_search',
              icon: {
                fontIcon: 'symbol-enum',
                fontSet: 'codicon',
              },
              color: 'accent',
              help: [`- 使用大语言模型将文本解析为复合要求的tts配置`].join('\n'),
            },
          },
        ],
        context: {
          // 在服务端定义一些函数,然后工作流设计时请求(因为两者环境隔离)
          getList: () => {},
        },
      },
      tts: {
        changeAudioItemList: [
          {
            name: '数字转中文',
            fn: async (item) => {
              const content = item.generateOptions.audioText ?? item.subtitle.text;
              item.generateOptions.audioText = content.replace(/\d+/g, (input) => {
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
              const content = item.generateOptions.audioText ?? item.subtitle.text;
              item.generateOptions.audioText = content.replace(
                /(GB)\s?(?<index>\d+)(?<part>\.\d+)?(?<gang>—|-)(?<year>\d{4})/g,
                (input, ...args) => {
                  const group = args.slice(-1)[0];
                  let str = `国标${number2Han(group['index'])}`;
                  if (group['part']) {
                    str += `点${number2Han(group['part'].slice(1))}`;
                  }
                  str += '杠';
                  str += number2Han(group['year']);
                  return str;
                }
              );
              return item;
            },
          },
          {
            name: '自定义替换',
            priority: 2,
            fn: async (item) => {
              let content = item.generateOptions.audioText ?? item.subtitle.text;
              for (const item of ExtensionConfig.replaceList()) {
                content = content.replaceAll(item.find, item.replace);
              }
              item.generateOptions.audioText = content;
              return item;
            },
          },
          {
            name: '正则自定义替换',
            priority: 3,
            fn: async (item) => {
              let content = item.generateOptions.audioText ?? item.subtitle.text;
              for (const item of ExtensionConfig.regReplaceList()) {
                const regexp = new RegExp(item.find.pattern, item.find.flags);
                content = content.replace(regexp, item.replace);
              }
              item.generateOptions.audioText = content;
              return item;
            },
          },
        ],
      },
    };
  };
};
