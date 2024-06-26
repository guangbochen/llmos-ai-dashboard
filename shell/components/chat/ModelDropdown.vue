<script>
import { createPopper } from '@popperjs/core';
import { get } from '@shell/utils/object';
import isString from 'lodash/isString';
import VueSelectOverrides from '@shell/mixins/vue-select-overrides';

export default {
  mixins: [VueSelectOverrides],
  props:  {
    // array of model objects
    dropdownOptions: {
      required: true,
      default: () => [],
      type:    Array,
    },
    defaultOption: {
      default: null,
      type:    Object,
    },
    closeOnSelect: {
      default: true,
      type:    Boolean
    },
    disabled: {
      default: false,
      type:    Boolean,
    },
    optionKey: {
      default: null,
      type:    String,
    },
    optionLabel: {
      default: 'label',
      type:    String,
    },
    // sm, null(med), lg - no xs...its so small
    size: {
      default: null,
      type:    String,
    },
    value: {
      default: null,
      type:    String,
    },
    placement: {
      default: 'bottom-start',
      type:    String
    },
    selectable: {
      default: (opt) => {
        if ( opt ) {
          if ( opt.disabled || opt.kind === 'group' || opt.kind === 'divider' || opt.loading ) {
            return false;
          }
        }

        return true;
      },
      type: Function
    },
  },
  data() {
    return { focused: false };
  },

  computed: {
    getDefaultOption() {
      if (this.defaultOption){
        return this.getFormatLabel(this.defaultOption);
      }

      for ( const option of this.dropdownOptions ) {
        if ( option.metadata?.annotations?.['llmos.ai/default-model'] === 'true' ) {
          return this.getFormatLabel(option);
        }
      }
      return this.dropdownOptions[0];
    },
  },

  methods: {
    withPopper(dropdownList, component, { width }) {
      /**
       * We need to explicitly define the dropdown width since
       * it is usually inherited from the parent with CSS.
       */
      const componentWidth = component.$refs.search.clientWidth;
      const dropWidth = dropdownList.clientWidth;

      if (dropWidth < componentWidth) {
        dropdownList.style.width = `${ componentWidth }px`;
      } else {
        dropdownList.style.width = 'min-content';
      }

      /**
       * Here we position the dropdownList relative to the $refs.toggle Element.
       *
       * The 'offset' modifier aligns the dropdown so that the $refs.toggle and
       * the dropdownList overlap by 1 pixel.
       *
       * The 'toggleClass' modifier adds a 'drop-up' class to the Vue Select
       * wrapper so that we can set some styles for when the dropdown is placed
       * above.
       */
      const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: this.placement || 'bottom-start',
        modifiers: [
          {
            name:    'offset',
            options: { offset: [-2, 2] },
          },
          {
            name:    'toggleClass',
            enabled: true,
            phase:   'write',
            fn({ state }) {
              component.$el.setAttribute('x-placement', state.placement);
            },
          },
        ],
      });

      /**
       * To prevent memory leaks Popper needs to be destroyed.
       * If you return function, it will be called just before dropdown is removed from DOM.
       */
      return () => popper.destroy();
    },

    ddButtonAction(option) {
      this.focusSearch();
      this.$emit('dd-button-action', option);
    },

    getFormatLabel(option) {
      if (option.status) {
        return `${option.status.model} (${ option.status.byteSize })`;
      }
      return option
    },

    onFocus() {
      return this.onFocusLabeled();
    },

    onFocusLabeled() {
      this.focused = true;
    },

    onBlur() {
      return this.onBlurLabeled();
    },

    onBlurLabeled() {
      this.focused = false;
    },

    focusSearch() {
      this.$nextTick(() => {
        const el = this.$refs['button-dropdown'].searchEl;

        if ( el ) {
          el.focus();
        }
      });
    },
    get,
  },
};
</script>

<template>
  <v-select
    class="v-select-model"
    v-bind="$attrs"
    :append-to-body="true"
    :calculate-position="withPopper"
    :searchable="true"
    :clearable="false"
    :close-on-select="closeOnSelect"
    :value="getDefaultOption"
    :options="dropdownOptions"
    :map-keydown="mappedKeys"
    :get-option-key="
      (opt) => (optionKey ? get(opt, optionKey) : getFormatLabel(opt))
    "
    :get-option-label="(opt) => getFormatLabel(opt)"
    :selectable="selectable"
    @search:blur="onBlur"
    @search:focus="onFocus"
    @update:modelValue="$emit('click-action', $event)"
  >
  </v-select>
</template>

<style lang='scss' scoped>
.v-select-model {
  border-width: 0;
  :deep() > .vs__dropdown-toggle {
    width: 100%;
    display: grid;
    grid-template-columns: 75% 25%;
    background: transparent;
  }

  :deep() .vs__selected-options {
    .vs__selected {
      color: #1b1c21;
    }
  }
}
</style>
