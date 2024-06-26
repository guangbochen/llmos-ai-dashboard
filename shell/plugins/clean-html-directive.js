import { createApp } from 'vue';
const vueApp = createApp({});
import { purifyHTML } from './clean-html';

export const cleanHtmlDirective = {
  mounted(el, binding) {
    el.innerHTML = purifyHTML(binding.value);
  },
  updated(el, binding) {
    el.innerHTML = purifyHTML(binding.value);
  },
  unmounted(el) {
    el.innerHTML = '';
  }
};

vueApp.directive('clean-html', cleanHtmlDirective);
