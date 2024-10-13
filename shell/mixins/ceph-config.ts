import Vue from 'vue';
import { _CREATE, _EDIT, _VIEW } from '@shell/config/query-params';
import { getCephClusterAddonUrl } from '@shell/utils/url';

export default Vue.extend({
  computed: {
    isCreate() {
      return this.mode === _CREATE;
    },

    isEdit() {
      return this.mode === _EDIT;
    },

    isView() {
      return this.mode === _VIEW;
    },

    managedWarning() {
      const { value } = this;
      const managedWarning = {
        show: this.isLLMOSRelease,
        type: value?.kind || '',
        url:  this.cephAddonUrl,
      };

      return this.t('ceph.managedWarning', managedWarning, 'html');
    },

    cephAddonUrl() {
      return getCephClusterAddonUrl();
    },

    isLLMOSRelease() {
      return this.annotations?.['meta.helm.sh/release-name'] === 'llmos-ceph-cluster';
    },

    options() {
      return [{ label: 'true', value: true }, { label: 'false', value: false }];
    }
  }
});
