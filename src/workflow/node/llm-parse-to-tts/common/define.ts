import * as v from 'valibot';
import { debounceTime } from 'rxjs';
import { condition, renderConfig } from '@piying/view-angular-core';
import { asColumn } from '../../../../action/layout';
import { patchWrappers, setComponent, valueChange } from '@piying/view-angular-core';
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
      value: v.pipe(
        v.string(),
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
                  field.context.changeHandleByTemplate(field, value, 1);
                });
            }),
          ],
        }),
        condition({ environments: ['config'], actions: [renderConfig({ hidden: true })] })
      ),
    }),
    asColumn()
  ),
});
