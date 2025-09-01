import * as v from 'valibot';
import { ComponentContext } from '@shenghuabi/sdk/componentDefine';
import { condition, patchAsyncInputs, patchInputs, patchWrappers, renderConfig, setComponent } from '@piying/view-angular-core';
import { asColumn } from '../../../../action/layout';
const SelectOptions = [
  { label: '标签1', value: 'value1', description: '标签1的描述' },
  { label: '标签2', value: 'value2', description: '标签1的描述' },
] as const;
// 节点的定义配置
export const NODE_DEFINE = v.object({
  // data必须存在,因为只有此定义下的数据才可以保存
  data: v.object({
    config: v.pipe(
      v.object({
        str1: v.pipe(v.optional(v.string(), '默认值'), v.title('文本1')),
        checkbox: v.pipe(v.optional(v.boolean(), false), v.title('开关1')),
        // 不在组件中显示,但是存在这个属性,可以用valueChange,hookDefine之类的变更
        onlyInDefine: v.pipe(v.optional(v.string(), 'inDefine'), renderConfig({ hidden: true })),
        /** 静态选项 */
        select1: v.pipe(
          v.picklist(SelectOptions.map((item) => item.value)),
          patchInputs({ options: SelectOptions }),

          v.title('选项1')
        ),
        /** 动态选项 */
        select2: v.pipe(
          v.string(),
          v.title('选项2'),
          condition({
            // 默认: 右侧的配置
            // config: 右侧的配置
            // display 直接显示在工作流中的
            environments: ['config'],
            actions: [
              setComponent('picklist'),
              patchAsyncInputs({
                options: (field) => (field.context as ComponentContext).pluginMethod('getList'),
              }),
            ],
          })
        ),
        str2: v.pipe(
          v.string(),
          v.title('文本2'),
          v.description('此输入直接显示在节点中'),
          condition({
            environments: ['display'],
            actions: [
              setComponent('string'),
              // 外面第一层是提示,显示description,第二层显示的是字段
              patchWrappers(['tooltip', 'form-field']),
            ],
          })
        ),
      }),
      asColumn()
    ),
  }),
});
