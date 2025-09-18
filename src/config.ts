import { createConfig } from '@shenghuabi/sdk';
import { ExtensionConfigDefine } from './config-define';
import { name } from '../assets/package.json';
export const ExtensionConfig = createConfig(ExtensionConfigDefine, name);
