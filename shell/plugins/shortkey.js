import { createApp } from 'vue';
const vueApp = createApp({});
import ShortKey from 'vue-shortkey';

vueApp.use(ShortKey, { prevent: ['input', 'textarea', 'select'] });
