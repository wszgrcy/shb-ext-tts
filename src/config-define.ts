import * as v from 'valibot';
import { componentClass, NFCSchema, patchAsyncInputs, patchInputs, setComponent, topClass } from '@piying/view-angular-core';
import { map } from 'rxjs';
export const ExtensionConfigDefine = v.pipe(
  v.object({
    replaceList: v.pipe(
      v.optional(
        v.array(
          v.pipe(
            v.object({ find: v.pipe(v.string(), v.title('匹配字符串')), replace: v.pipe(v.string(), v.title('替换字符串')) }),
            componentClass('flex gap-2 items-center *:flex-1')
          )
        ),
        []
      ),
      v.description('用于替换插件使用,字符串替换')
    ),
    regReplaceList: v.pipe(
      v.optional(
        v.array(
          v.pipe(
            v.object({
              find: v.pipe(
                v.object({ pattern: v.string(), flags: v.pipe(v.optional(v.string()), topClass('w-[100px]')) }),
                v.title('匹配字符串'),
                componentClass('flex gap-2 items-center *:nth-1:flex-1')
              ),
              replace: v.pipe(v.string(), v.title('替换字符串')),
            }),
            componentClass('grid gap-2')
          )
        ),
        []
      ),
      v.description('用于替换插件使用,正则表达式替换')
    ),
    ffmpeg: v.pipe(
      v.object({
        url: v.pipe(
          // https://github.com/BtbN/FFmpeg-Builds/releases
          v.optional(v.string(), `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.0-latest-win64-gpl-8.0.zip`),
          v.title('ffmpeg下载地址'),
          v.description(
            `linux下使用: https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.0-latest-linux64-gpl-8.0.tar.xz`
          )
        ),
        af: v.pipe(v.optional(v.string(), 'silenceremove=1:0:-50dB,areverse,silenceremove=1:0:-50dB,areverse'), v.title('音频滤镜')),
        dir: v.pipe(v.optional(v.string(), './plugin/tts/ffmpeg'), v.title('保存文件夹')),
        execPath: v.pipe(v.optional(v.string(), './ffmpeg-n8.0-latest-win64-gpl-8.0/bin/ffmpeg.exe'), v.title('执行路径')),
        __download: v.pipe(
          NFCSchema,
          setComponent('download-button'),
          patchInputs({ autoUnzip: true }),
          patchAsyncInputs({
            fileList: (field) => {
              let url = field.get(['..', 'url'])!;
              return url.form.control!.valueChanges.pipe(
                map((value) => {
                  return [{ url: value }];
                })
              );
            },
            dir: (field) => {
              let dir = field.get(['..', 'dir'])!;
              return dir.form.control!.valueChanges;
            },
          })
        ),
      }),
      componentClass('grid gap-2')
    ),
  }),
  componentClass('grid gap-2')
);

export default ExtensionConfigDefine;
