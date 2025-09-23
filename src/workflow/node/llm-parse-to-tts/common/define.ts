import * as v from 'valibot';
import { debounceTime } from 'rxjs';
import { condition, renderConfig } from '@piying/view-angular-core';
import { asColumn } from '../../../../action/layout';
import { patchWrappers, setComponent, valueChange } from '@piying/view-angular-core';
const Prompt = `你是一个专业的编剧,请将输入文本转换为指定的格式用于配音
## 任务
- 请根据上下文推测出对话的说话人
- 请根据给予的配音选项为不同的文字段落提供不同的配音
- 如果无法确定说话人,请使用旁白配音
## 格式
{{__JsonSchema}}`;

export const NODE_DEFINE = v.object({
  data: v.pipe(
    v.object({
      config: v.pipe(
        v.object({
          autoStartLLM: v.pipe(
            v.optional(v.boolean(), true),
            patchWrappers(['tooltip', 'label']),
            v.title('启动大语言模型'),
            v.description('使用前自动启动本地的大语言模型启动器')
          ),
          autoStopLLM: v.pipe(
            v.optional(v.boolean(), true),
            patchWrappers(['tooltip', 'label']),
            v.title('停止大语言模型'),
            v.description('使用后自动停止本地的大语言模型启动器')
          ),
        }),
        asColumn()
      ),
      prompt: v.pipe(
        v.optional(v.string(), Prompt),
        v.title('提示词'),
        condition({
          environments: ['display'],
          actions: [
            setComponent('string'),
            patchWrappers(['form-field']),
            valueChange((fn) => {
              fn({ list: [undefined] })
                .pipe(debounceTime(100))
                .subscribe(({ list: [value], field }) => {
                  if (typeof value !== 'string') {
                    return;
                  }
                  field.context.changeHandleByTemplate(field, value, 1, ['__JsonSchema']);
                });
            }),
          ],
        }),
        condition({ environments: ['config'], actions: [renderConfig({ hidden: true })] })
      ),
      value: v.pipe(
        v.optional(v.string(), '{{input.content}}'),
        v.title('解析内容'),
        v.description('请输入解析内容'),
        condition({
          environments: ['display'],
          actions: [
            setComponent('string'),
            patchWrappers(['tooltip', 'form-field']),
            valueChange((fn) => {
              fn({ list: [undefined] })
                .pipe(debounceTime(100))
                .subscribe(({ list: [value], field }) => {
                  if (typeof value !== 'string') {
                    return;
                  }
                  field.context.changeHandleByTemplate(field, value, 2);
                });
            }),
          ],
        }),
        condition({ environments: ['config'], actions: [renderConfig({ hidden: true })] })
      ),
    }),
    condition({
      environments: ['display', 'config'],
      actions: [asColumn()],
    })
  ),
});
