import { asVirtualGroup, setComponent } from '@piying/view-angular-core';
import * as v from 'valibot';
import { asColumn } from '../action/layout';

export function LLM_CONFIG(label: string) {
  return v.pipe(
    v.intersect([
      v.pipe(
        v.object({
          model: v.pipe(v.optional(v.string()), v.title('模型')),
          configuration: v.optional(
            v.object({
              baseURL: v.pipe(v.string(), v.title('地址')),
            })
          ),
        }),
        v.title(label),
        asColumn()
      ),
    ]),
    asVirtualGroup(),
    setComponent('accordion')
  );
}
