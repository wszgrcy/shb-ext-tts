import { version, name } from '../assets/package.json';
import * as core from '@actions/core';
export async function main() {
  let { $ } = await import('execa');
  let result2 = await $`git ls-remote --tags --exit-code origin refs/tags/${version}`;
  console.log(result2);
  if (result2.stdout) {
    return;
  }
  await $({ stdio: 'inherit' })`npm run local-publish`;
  await $({ stdio: 'inherit' })`git tag ${version}`;
  await $({ stdio: 'inherit' })`git push origin ${version}`;
  core.setOutput('VERSION', version);
  core.setOutput('NAME', name);
}
main();
