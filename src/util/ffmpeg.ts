export function mergeWavAfCommand(af: string, input: string, output: string) {
  return ['-i', input, '-af', af, output];
}
