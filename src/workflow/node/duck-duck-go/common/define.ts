import * as v from 'valibot';
import { LLM_CONFIG } from '../../../../define/llm.define';
import { debounceTime } from 'rxjs';
import { condition } from '@piying/view-angular-core';
import { asColumn } from '../../../../action/layout';
import { patchWrappers, setComponent, valueChange } from '@piying/view-angular-core';
export const NODE_DEFINE = v.object({
  data: v.pipe(
    v.object({
      config: v.pipe(
        v.object({
          searchLLM: v.optional(LLM_CONFIG('搜索对话配置')),
          summaryLLM: v.optional(LLM_CONFIG('总结对话配置')),
        }),
        asColumn()
      ),
      value: v.pipe(
        v.string(),
        v.title('搜索内容'),
        v.description('请输入搜索内容'),
        condition({
          environments: ['default', 'display'],
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
        })
      ),
    }),
    asColumn()
  ),
});
