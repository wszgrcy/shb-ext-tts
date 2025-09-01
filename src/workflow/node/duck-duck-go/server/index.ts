import { ManifestInput } from '@shenghuabi/sdk/server';
import { NODE_DEFINE } from '../common/define';
import * as ddg from 'duck-duck-scrape';
let query = `请帮我将这个问题转换为更简洁、明确且适合搜索引擎查询的形式。如果有必要，可以添加相关的关键词或术语，但避免使用模糊或过于笼统的表达。例如，如果用户的问题是'如何学好英语'，你可以将其优化为'学习英语的有效方法'或者'提高英语水平的学习资源'。请确保转换后的内容能够更准确地反映用户的需求，并且更容易在搜索引擎中找到相关结果。
请直接返回转换后的问题`;
const prompt2 = `使用提供的上下文回答用户查询，并且仅在上下文中明确提供<source_id>标签时，才包含内联引用，格式为[source_id]。

指南:
如果不知道答案，请明确说明。
如果不确定，请询问用户以澄清。
用与用户查询相同的语言进行回复。
如果上下文难以阅读或质量较差，请告知用户并提供最佳可能的答案。
如果答案不在上下文中，但您拥有相关知识，请向用户解释这一点，并用自己的理解提供答案。
仅在上下文中明确提供<source_id>标签时，才使用[source_id]格式包含内联引用（例如[1]、[2]）。
如果没有<source_id>标签，请省略引用。
不要在响应中使用XML标签。
确保引用简洁且与提供的信息直接相关。
引用示例:
如果用户询问某个特定主题，而信息在“whitepaper.pdf”中，并且提供了<source_id>，则响应应包括如下引用：

“根据研究，提出的方法效率提高了20% [whitepaper.pdf]。” 如果没有<source_id>，请省略引用。
输出:
提供对用户查询的清晰直接的回答，仅在上下文中明确提供<source_id>标签时，才包含格式为[source_id]的内联引用。`;
// todo 此节点仅作为演示使用,因为最优化的搜索还是搞api或者说爬虫获得更具体的网页
export function duckduckgoRunner(input: ManifestInput) {
  return class extends input.provider.workflow.NodeRunnerBase {
    #chatUtil = input.inject(input.provider.root.ChatUtilService);

    override async run() {
      return async () => {
        let instance = this.injector.get(input.provider.root.ChatService);
        let data = this.getParsedNode(NODE_DEFINE);
        console.log('配置', data);
        const chatInput = this.#chatUtil.interpolate(data.data.value, this.inputValueObject$$());
        console.log(chatInput);

        let res = await (
          await instance.chat()
        ).chat({
          messages: [
            {
              role: 'system',
              content: [{ text: query, type: 'text' }],
            },
            { role: 'user', content: [{ text: chatInput, type: 'text' }] },
          ],
        });
        let content1 = res.content;

        console.log('查询问题', content1);
        // todo 之前这里正常,但是本次更新测试时这里出现问题,未知.
        const searchResults = await ddg.search(content1, {
          safeSearch: ddg.SafeSearchType.STRICT,
          locale: 'cn-zh',
          region: 'cn-zh',
          marketRegion: 'zh-CN',
        });
        console.log('返回', searchResults);
        let result = searchResults.results;
        let data2 = result
          .map((item, i) => {
            return `<source_id>${i}</source_id>\n ## 标题\n${item.title}\n## 内容\n${item.description}`;
          })
          .join('\n---\n');
        console.log(data2);

        let res2 = (await instance.chat()).stream({
          messages: [
            {
              role: 'system',
              content: [{ text: prompt2, type: 'text' }],
            },
            {
              role: 'user',
              content: [{ text: `问题: ${chatInput}\n上下文: ${data2}`, type: 'text' }],
            },
          ],
        });
        const streamData = this.emitter.createLLMData({
          node: this.node,
          value: '',
          extra: {
            references: result.map((item) => {
              return {
                type: '链接',
                description: item.title,
                reference: {
                  type: 'url',
                  title: item.title,
                  url: item.url,
                },
              };
            }),
            historyList: [],
            delta: '',
            content: '',
          },
        });
        const endRef = this.injector.get(input.provider.root.ChatUtilService).getMetadataEndRef(streamData.extra!.references);

        for await (const item of res2) {
          const value = endRef ? item.content + endRef : item.content;
          streamData.value = value;
          streamData.extra = { ...streamData.extra, ...item, content: value };

          this.emitter.send(streamData);
        }

        return { value: streamData.value };
      };
    }
  };
}
