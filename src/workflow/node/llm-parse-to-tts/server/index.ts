import { ManifestInput } from '@shenghuabi/sdk/server';
import { NODE_DEFINE } from '../common/define';
import * as v from 'valibot';
import { unionBy } from 'es-toolkit';
import { toJsonSchema } from '@valibot/to-json-schema';

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

        const queue = await ttsService.getByCustom(async (options) => {
          const itemToString = (item: any) => `${item.player}-${item.state}-${item.language}`;
          const voiceList = options.voiceList.map((item) => {
            return {
              item: item,
              value: {
                player: item.player!,
                state: item.state!,
                language: item.language!,
              },
              key: itemToString(item),
            };
          });
          const emoList = (options.indextTTSEmoList ?? []).map((item) => {
            return {
              item: item,
              value: {
                player: item.player!,
                state: item.state!,
                language: item.language!,
              },
              key: itemToString(item),
            };
          });
          console.log(voiceList, emoList);
          const list = unionBy(voiceList, emoList as any, (item) => item.key);

          const audioItemDefine = v.object({
            text: v.pipe(v.string(), v.title('需要配音的文本')),
            actor: v.pipe(
              v.picklist(list.map((item) => item.key)),
              v.title('配音表'),
              v.description('当前文本可以使用的配音项,请根据说话人,语言和情绪进行选择')
            ),
          });
          const define = v.object({ list: v.array(audioItemDefine) });
          const strSchema = toJsonSchema(define);
          console.log(strSchema);
          const systemPrompt = this.#chatUtil.interpolate(data.data.prompt, {
            ...this.inputValueObject$$(),
            __JsonSchema: JSON.stringify(strSchema),
          });
          const res = await (
            await instance.chat()
          ).chat(
            {
              messages: [
                {
                  role: 'system',
                  content: [{ text: systemPrompt, type: 'text' }],
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
              return item.key === gItem.actor;
            })?.value;
            const emoItem = emoList.find((item) => {
              return item.key === gItem.actor;
            })?.value;
            if (emoItem && !voiceItem) {
              const defaultActorKey = gItem.actor.replace(`-[^-]+-`, `-default-`);
              voiceItem = voiceList.find((item) => {
                return item.key === defaultActorKey;
              })?.value;
              if (!voiceItem) {
                throw new Error(`${gItem.actor}未找到默认状态的语音,请设置默认语音;${defaultActorKey}`);
              }
            }
            console.log(voiceItem, emoItem);
            return {
              item: {
                subtitle: { text: gItem.text },
                generateOptions: {
                  reference: { preset: voiceItem!! },
                  emo: emoItem ? { preset: emoItem } : { emo_alpha: 1 },
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
        return { value: queue.getConfig() as any };
      };
    }
  };
}
