<script>
import ResourceSummary from '@shell/components/ResourceSummary';
import {
  NAMESPACE, MANAGEMENT, NODE, COUNT, LLMOS, PVC
} from '@shell/config/types';
import { VIEW_CONTAINER_DASHBOARD } from '@shell/store/prefs';
import { mapGetters } from 'vuex';
import { allHash } from '@shell/utils/promise';
import { Banner } from '@components/Banner';

export default {
  components: {
    ResourceSummary,
    Banner,
  },

  async fetch() {
    const hash = await allHash({
      clusters:      this.$store.dispatch('management/findAll', { type: MANAGEMENT.CLUSTER }),
      settings:      this.$store.dispatch('management/findAll', { type: MANAGEMENT.SETTING }),
      managedAddons: this.$store.dispatch('management/findAll', { type: MANAGEMENT.MANAGED_ADDON }),
      cephClusters:  this.$store.dispatch('management/findAll', { type: LLMOS.CEPH_CLUSTER }),
      viewContainer: this.$store.getters['prefs/get'](VIEW_CONTAINER_DASHBOARD),
    });

    this.clusters = hash.clusters;
    this.settings = hash.settings;
    this.managedAddons = hash.managedAddons;
    this.viewContainerDashboard = hash.viewContainer;
  },

  data() {
    return {
      clusters:               [],
      settings:               [],
      managedAddons:          [],
      cephClusters:           [],
      clusterDetail:          null,
      clusterCounts:          {},
      viewContainerDashboard: false,
    };
  },

  computed: {
    LLMOS() {
      return LLMOS;
    },
    MANAGEMENT() {
      return MANAGEMENT;
    },
    ...mapGetters(['currentCluster']),

    cephClusterEnabled() {
      if (this.cephClusters.length > 0 ) {
        return true;
      }

      const cephCluster = this.managedAddons.find((m) => m.metadata.name === 'llmos-ceph-cluster');

      if (cephCluster.spec.enabled) {
        return true;
      }

      return false;
    },

    canAccessNodes() {
      return !!this.clusterCounts?.[0]?.counts?.[NODE];
    },

    canAccessNamespaces() {
      return !!this.clusterCounts?.[0]?.counts?.[NAMESPACE];
    },

    canAccessPVC() {
      return !!this.clusterCounts?.[0]?.counts?.[PVC];
    },

    canAccessMLCluster() {
      return !!this.clusterCounts?.[0]?.counts?.[LLMOS.RAY_CLUSTER];
    },

    canAccessModelServices() {
      return !!this.clusterCounts?.[0]?.counts?.[LLMOS.MODEL_SERVICE];
    },

    canAccessNotebooks() {
      return !!this.clusterCounts?.[0]?.counts?.[LLMOS.NOTEBOOK];
    },

    canAccessAddons() {
      return !!this.clusterCounts?.[0]?.counts?.[MANAGEMENT.MANAGED_ADDON];
    },

    hasDescription() {
      return !!this.currentCluster?.spec?.description;
    },

    llmIcon() {
      return require(`~shell/assets/images/providers/llm.svg`);
    },

    getServerVersion() {
      if ( this.settings === [] ) {
        return 'unknown';
      }

      // loop setting and find the server-version
      for ( let i = 0; i < this.settings.length; i++ ) {
        if ( this.settings[i].id === 'server-version' ) {
          return this.settings[i].value || this.settings[i].default;
        }
      }

      return 'N/A';
    },

    getServerCreatedTime() {
      if ( this.settings === [] ) {
        return 'unknown';
      }
      const serverVersion = this.settings.find((s) => s.id === 'server-version');

      if ( serverVersion ) {
        return serverVersion.metadata?.creationTimestamp;
      }

      return 'unknown';
    },
  },

  watch: {
    async clusters(neu) {
      this.clusterDetail = neu[0];
      await this.$store.dispatch('loadCluster', { id: this.clusterDetail.id });
      this.clusterCounts = this.$store.getters[`cluster/all`](COUNT);
    }
  },

  methods: {
    isComponentStatusHealthy(field) {
      if (field === 'storage') {
        return this.cephCluster?.status?.phase === 'Ready';
      }

      const matching = (this.currentCluster?.status?.componentStatuses || []).filter((s) => s.name.startsWith(field));

      // If there's no matching component status, it's "healthy"
      if ( !matching.length ) {
        return true;
      }

      const count = matching.reduce((acc, status) => {
        const conditions = status.conditions.find((c) => c.status !== 'True');

        return !conditions ? acc : acc + 1;
      }, 0);

      return count === 0;
    },
  }
};
</script>

<template>
  <div v-if="clusterDetail">
    <header class="single-cluster-header">
      <img
        class="cluster-llm-logo"
        :src="llmIcon"
        alt="LLM ICON"
      >
      <h1>
        <t k="home.title" />
      </h1>
      <div>
        <span v-if="hasDescription">{{ currentCluster.spec.description }}</span>
      </div>
    </header>

    <Banner
      v-if="!cephClusterEnabled"
      color="warning"
      class="mb-20"
      :inner-html="t('ceph.enableNotification', null, 'html')"
    />

    <div class="home-overview-glance">
      <div
        v-if="clusterDetail.kubernetesVersionRaw"
      >
        <label>{{ t('home.glance.version') }}: </label>
        <span>{{ getServerVersion }}</span>
      </div>
      <div>
        <label>{{ t('home.glance.created') }}: </label>
        <span><LiveDate
          :value="getServerCreatedTime"
          :add-suffix="true"
          :show-tooltip="true"
        /></span>
      </div>
      <div :style="{'flex':1}" />
    </div>

    <div>
      <div class="single-cluster-info">
        <h3>
          Quick Access
        </h3>
        <div class="cluster-counts">
          <ResourceSummary
            v-if="canAccessMLCluster"
            :cluster="clusterDetail.id"
            :resource="LLMOS.RAY_CLUSTER"
            product="llmos"
          />
          <ResourceSummary
            v-if="canAccessNotebooks"
            :cluster="clusterDetail.id"
            :resource="LLMOS.NOTEBOOK"
            product="llmos"
          />
          <ResourceSummary
            v-if="canAccessModelServices"
            :cluster="clusterDetail.id"
            :resource="LLMOS.MODEL_SERVICE"
            product="llmos"
          />
        </div>
        <h3>Others</h3>
        <div class="cluster-counts">
          <ResourceSummary
            v-if="canAccessNodes"
            :cluster="clusterDetail.id"
            resource="node"
            product="llmos"
          />
          <ResourceSummary
            v-if="canAccessNamespaces"
            :cluster="clusterDetail.id"
            resource="namespace"
            product="llmos"
          />
          <ResourceSummary
            v-if="canAccessPVC"
            :cluster="clusterDetail.id"
            resource="persistentvolumeclaim"
            product="llmos"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.single-cluster-header {
  align-items: center;
  display: flex;

  .provider-icon {
    margin-right: 10px;
  }

  h1 {
    font-size: 20px;
    margin: 0;
  }

  .cluster-llm-logo {
    margin-right: 10px;
    width: 30px;
    height: 30px;
  }
}
.single-cluster-info {
  margin-top: 20px;

  .cluster-counts {
    display: flex;
    flex-wrap: wrap;
    margin: 10px 0;
    > * {
      flex: 1 0 21%;
      margin: 5px;
      height: 100px;
      &:not(:last-child) {
        margin-right: 20px;
      }
    }
  }
}

.home-overview-glance {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 20px 0px;
  display: flex;

  &>*:not(:nth-last-child(-n+2)) {
    margin-right: 40px;
  }
}

.title h1 {
  margin: 0;
}
</style>
