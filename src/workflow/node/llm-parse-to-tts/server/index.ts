import { ManifestInput } from '@shenghuabi/sdk/server';
import { NODE_DEFINE } from '../common/define';
import * as v from 'valibot';
import { unionBy } from 'es-toolkit';
import { toJsonSchema } from '@valibot/to-json-schema';
const Prompt = `你是一个专业的编剧,请将输入文本转换为指定的格式用于配音\n请根据给予的配音选项为不同的文字段落提供不同的配音`;

export function llmParseToTTSRunner(input: ManifestInput) {
  return class extends input.provider.workflow.NodeRunnerBase {
    #chatUtil = input.inject(input.provider.root.ChatUtilService);

    override async run() {
      return async () => {
        const instance = this.injector.get(input.provider.root.ChatService);
        const ttsService = this.injector.get(input.provider.root.TTSSerivce);
        const llmLauncher = this.injector.get(input.provider.root.LLMLauncherService);
        const data = this.getParsedNode(NODE_DEFINE);
        if (data.data.config.autoStartLLM) {
          await llmLauncher.start();
        }
        const chatInput = this.#chatUtil.interpolate(data.data.value, this.inputValueObject$$());

        const queue = await ttsService.getByCustom({ filePath: '', content: chatInput }, async (content, options) => {
          const voiceList = options.voiceList.map((item) => {
            return {
              player: item.player!,
              state: item.state!,
              language: item.language!,
            };
          });
          const emoList = (options.indextTTSEmoList ?? []).map((item) => {
            return {
              player: item.player!,
              state: item.state!,
              language: item.language!,
            };
          });
          const itemToString = (item: any) => `${item.player}-${item.state}-${item.language}`;
          const list = unionBy(voiceList, emoList, itemToString);

          const audioItemDefine = v.object({
            text: v.pipe(v.string(), v.title('需要配音的文本')),
            actor: v.pipe(
              v.picklist(list.map(itemToString)),
              v.title('配音表'),
              v.description('当前文本可以使用的配音项,请根据说话人,语言和情绪进行选择')
            ),
          });
          const define = v.object({ list: v.array(audioItemDefine) });
          const strSchema = toJsonSchema(define);
          console.log(strSchema);
          const res = await (
            await instance.chat()
          ).chat(
            {
              messages: [
                {
                  role: 'system',
                  content: [{ text: [Prompt, `## 格式`, JSON.stringify(strSchema)].join('\n'), type: 'text' }],
                },
                { role: 'user', content: [{ text: chatInput, type: 'text' }] },
              ],
              response_format: { type: 'json_schema', json_schema: { name: '', schema: strSchema as any } },
            },
            {}
          );
          console.log(res);
          const result = JSON.parse(res.content) as v.InferOutput<typeof define>;
          console.log(result);
          return result.list.map((gItem) => {
            let voiceItem = voiceList.find((item) => {
              return itemToString(item) === gItem.actor;
            });
            const emoItem = emoList.find((item) => {
              return itemToString(item) === gItem.actor;
            });
            if (emoItem && !voiceItem) {
              voiceItem = voiceList.find((item) => {
                return itemToString(item) === gItem.actor.replace(`-[^-]+-`, `-default-`);
              });
              if (!voiceItem) {
                throw new Error(`${gItem.actor}未找到默认状态的语音,请设置默认语音`);
              }
            }
            return {
              item: {
                subtitle: { text: gItem.text },
                generateOptions: {
                  reference: { preset: voiceItem! },
                  emo: { preset: emoItem ?? voiceItem! },
                },
                audioOptions: { isParagraph: false },
              },
              metadata: {},
            };
          });
        });

        console.log(chatInput);

        if (data.data.config.autoStopLLM) {
          await llmLauncher.stop();
        }
        return { value: queue.config as any };
      };
    }
  };
}
