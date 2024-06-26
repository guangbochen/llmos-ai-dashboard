<script>
import ResourceTable from '@shell/components/ResourceTable';
import Tag from '@shell/components/Tag';
import { Banner } from '@components/Banner';

import {MANAGEMENT } from '@shell/config/types';
import ResourceFetch from '@shell/mixins/resource-fetch';
import ModelDropdown from '@shell/components/chat/ModelDropdown.vue';
import MessageInput from "@shell/components/chat/MessageInput.vue";
export default {
  name:       'ListChats',
  components: {
    MessageInput,
    ModelDropdown,
    ResourceTable,
    Tag,
    Banner,
  },
  mixins: [ResourceFetch],

  props: {
    resource: {
      type:     String,
      required: true,
    },
    schema: {
      type:     Object,
      required: true,
    },
    useQueryParamsForSimpleFiltering: {
      type:    Boolean,
      default: false
    },
  },

  async fetch() {
    const store = this.$store;
    const inStore = store.getters['currentStore']();

    this.$initializeFetchData(this.resource);

    if (store.getters[`${ inStore }/schemaFor`](MANAGEMENT.MODELFILE)) {
      this.$fetchType(MANAGEMENT.MODELFILE);
    }

    await this.$fetchType(this.resource);
  },

  data() {
    return {
      canViewMF: false,
      modelFile: null,
      showMasthead: false,
    };
  },

  beforeDestroy() {
    // Stop watching modelfiles
    this.$store.dispatch('cluster/forgetType', MANAGEMENT.MODELFILE);
  },

  computed: {
    rows() {
      return this.$store.getters['cluster/all'](this.resource);
    },

    modelfiles() {
      const mfs = this.$store.getters['cluster/all'](MANAGEMENT.MODELFILE);
      return mfs.map(mf => {
        mf.label = mf.name;
        return mf;
      });
    },

    getModelFile() {
      if (this.modelFile) {
        return this.modelFile
      }

      const mfs = this.$store.getters['cluster/all'](MANAGEMENT.MODELFILE);
      for ( const mf of mfs ) {
        if ( mf.metadata?.annotations?.['llmos.ai/default-model'] === 'true' ) {
          return mf
        }
      }
      return this.modelfiles[0];
    }
  },

  methods: {
    selectModelFile(mf) {
      this.modelFile = mf
    }
  },
};
</script>

<template>
  <div>
    <div class="row">
      <div class="col span-5">
        <ModelDropdown
            id="select-modelfile"
            :default-option="getModelFile"
            :dropdown-options="modelfiles"
            size="sm"
            @click-action="e=>selectModelFile(e)"
        />
      </div>
    </div>
    <div class="row message-input-container">
      <div class="col span-12">
        <MessageInput />
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.message-input-container{
  position: absolute;
  bottom: 10px;
  width: 80%;
}
</style>
