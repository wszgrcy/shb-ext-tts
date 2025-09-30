import * as v from 'valibot';
export const ExtensionConfigDefine = v.object({
  replaceList: v.pipe(
    v.optional(
      v.array(v.object({ find: v.pipe(v.string(), v.title('匹配字符串')), replace: v.pipe(v.string(), v.title('替换字符串')) })),
      []
    ),
    v.description('用于替换插件使用,字符串替换')
  ),
  regReplaceList: v.pipe(
    v.optional(
      v.array(
        v.object({
          find: v.pipe(v.object({ pattern: v.string(), flags: v.optional(v.string()) }), v.title('匹配字符串')),
          replace: v.pipe(v.string(), v.title('替换字符串')),
        })
      ),
      []
    ),
    v.description('用于替换插件使用,正则表达式替换')
  ),
});

export default ExtensionConfigDefine