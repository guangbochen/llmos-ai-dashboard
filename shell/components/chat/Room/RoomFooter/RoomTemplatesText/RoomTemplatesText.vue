<template>
	<transition name="vac-slide-up">
		<div
			v-if="filteredTemplatesText.length"
			class="vac-template-container vac-app-box-shadow"
		>
			<div
				v-for="(template, index) in filteredTemplatesText"
				:key="index"
				class="vac-template-box"
				:class="{ 'vac-template-active': index === activeItem }"
				@mouseover="activeItem = index"
				@click="$emit('select-template-text', template)"
			>
				<div class="vac-template-info">
					<div class="vac-template-tag">
						/{{ template.tag }}
					</div>
					<div class="vac-template-text">
						{{ template.text }}
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'RoomTemplatesText',

	props: {
		filteredTemplatesText: { type: Array, required: true },
		selectItem: { type: Boolean, default: null },
		activeUpOrDown: { type: Number, default: null }
	},

	emits: ['select-template-text', 'activate-item'],

	data() {
		return {
			activeItem: null
		}
	},

	watch: {
		filteredTemplatesText(val, oldVal) {
			if (!oldVal.length || val.length !== oldVal.length) {
				this.activeItem = 0
			}
		},
		selectItem(val) {
			if (val) {
				this.$emit(
					'select-template-text',
					this.filteredTemplatesText[this.activeItem]
				)
			}
		},
		activeUpOrDown() {
			if (
				this.activeUpOrDown > 0 &&
				this.activeItem < this.filteredTemplatesText.length - 1
			) {
				this.activeItem++
			} else if (this.activeUpOrDown < 0 && this.activeItem > 0) {
				this.activeItem--
			}
			this.$emit('activate-item')
		}
	}
}
</script>

<style lang="scss" scoped>
.vac-template-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  .vac-template-box {
    display: flex;
    width: 100%;
    height: 54px;
    overflow: hidden;
    cursor: pointer;
    background: var(--chat-footer-bg-color-tag);
    transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  }

  .vac-template-active {
    //background: var(--chat-footer-bg-color-tag-active);
  }

  .vac-template-info {
    display: flex;
    overflow: hidden;
    padding: 0 20px;
    align-items: center;
  }

  .vac-template-tag {
    font-size: 14px;
    font-weight: bold;
    margin-right: 10px;
  }

  .vac-template-text {
    font-size: 14px;
  }

  @media only screen and (max-width: 768px) {
    .vac-template-box {
      height: 50px;
    }

    .vac-template-info {
      padding: 0 12px;
    }
  }
}
</style>