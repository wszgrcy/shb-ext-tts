import { ManifestFactoy, NormalCollectionInlineType } from '@shenghuabi/sdk/server';
import { NODE_DEFINE } from './workflow/node/demo/common/define';
import { duckduckgoRunner } from './workflow/node/duck-duck-go/server';
import * as vscode from 'vscode';
// 不推荐变更此导出,未来可能会在其他地方使用
export const manifestFactory = (options: any): ManifestFactoy => {
  return (input) => {
    return {
      workflow: {
        node: [
          {
            // 工作流流程设计使用,用于配置连接节点
            // 打包时脚本已经配置会自动处理
            client: './workflow/node/demo/client/index.js',
            // 服务端执行节点时使用
            runner: class DemoNode extends input.provider.workflow.NodeRunnerBase {
              override async run() {
                return async () => {
                  let data = this.getParsedNode(NODE_DEFINE);
                  console.log(data);
                  return { value: 'demo' };
                };
              }
            },
            config: {
              type: 'demo1',
              label: `测试`,
              /**
               * 图标选择
               * codicon: https://microsoft.github.io/vscode-codicons/dist/codicon.html
               *
               * 默认: https://marella.github.io/material-icons/demo/
               */
              icon: 'chat',
              color: 'accent',
              help: [`- 帮助显示`].join('\n'),
            },
          },
          {
            client: './workflow/node/duck-duck-go/client/index.js',
            runner: duckduckgoRunner(input),
            config: {
              type: 'ddg',
              label: `ddg搜索`,
              // icon: 'manage_search',
              icon: {
                fontIcon: 'search-fuzzy',
                fontSet: 'codicon',
              },
              color: 'accent',
              help: [`- 使用duck duck go网络搜索`].join('\n'),
            },
          },
        ],
        context: {
          // 在服务端定义一些函数,然后工作流设计时请求(因为两者环境隔离)
          getList: () => {
            return [{ label: '远程1', value: 'value1' }];
          },
        },
      },
      providers: {
        root: [
          {
            provide: input.provider.root.FileParserToken,
            multi: true,
            // 增加一种文件解析类型
            useClass: class {
              // 权重高的会优先执行
              priority = 999;
              parse = async (fileName: string, buffer: Uint8Array | ArrayBuffer) => {
                if (fileName.endsWith('.demo')) {
                  console.log('解析.demo文件', fileName);
                  return [{ title: '插件标题', content: '插件返回内容' }];
                }
                // 返回undefined会继续执行其他的解析
              };
            },
          },
        ],
        knowledge: [
          {
            // 普通知识库的部分方法重写
            provide: input.provider.knowledge.NormalKnowledgeService,
            useClass: class extends input.provider.knowledge.NormalKnowledgeService {
              async create(collection: NormalCollectionInlineType): Promise<void> {
                vscode.window.showWarningMessage(`集合被创建 ${collection.collectionName}`);
                return super.create(collection);
              }
            },
          },
          {
            // qdrant的重写,可以用于对接其他数据库,比如neo4j;
            provide: input.provider.knowledge.QdrantClientService,
            useClass: class extends input.provider.knowledge.QdrantClientService {
              deleteCollection(name: string) {
                vscode.window.showWarningMessage(`集合被创建 ${name}`);
                return super.deleteCollection(name);
              }
              createCollection(collection_name: string, args_1: any): Promise<boolean> {
                vscode.window.showWarningMessage(`准备创建 ${collection_name}`);
                return super.createCollection(collection_name, args_1);
              }
            },
          },
        ],
      },
    };
  };
};
