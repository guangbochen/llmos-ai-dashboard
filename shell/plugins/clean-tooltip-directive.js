import { createApp } from 'vue';
const vueApp = createApp({});
import { VTooltip } from 'v-tooltip';
import { purifyHTML } from './clean-html';

function purifyContent(value) {
  const type = typeof value;

  if (type === 'string') {
    return purifyHTML(value);
  } else if (value && type === 'object' && typeof value.content === 'string') {
    return { ...value, content: purifyHTML(value.content) };
  } else {
    return value;
  }
}

function bind(el, { value, oldValue, modifiers }) {
  const purifiedValue = purifyContent(value);

  VTooltip.bind(
    el,
    {
      value: purifiedValue, oldValue, modifiers
    });
}

export const VCleanTooltip = {
  ...VTooltip,
  bind,
  update: bind,
};

vueApp.directive('clean-tooltip', VCleanTooltip);
