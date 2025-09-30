import { componentClass } from '@piying/view-angular-core';

export function asRow<TInput>(count?: number) {
  return componentClass<TInput>(typeof count === 'number' ? `grid gap-2 grid-cols-${count}` : 'flex gap-2 *:flex-1 items-center');
}
export function asColumn<TInput>() {
  return componentClass<TInput>('grid gap-2');
}
