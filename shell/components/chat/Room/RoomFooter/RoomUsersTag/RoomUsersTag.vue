<template>
	<transition name="vac-slide-up">
		<div v-if="filteredUsersTag.length" class="vac-tags-container">
			<div
				v-for="(user, index) in filteredUsersTag"
				:key="user._id"
				class="vac-tags-box"
				:class="{ 'vac-tags-box-active': index === activeItem }"
				@mouseover="activeItem = index"
				@click="$emit('select-user-tag', user)"
			>
				<div class="vac-tags-info">
					<div
						v-if="user.avatar"
						class="vac-avatar vac-tags-avatar"
						:style="{ 'background-image': `url('${user.avatar}')` }"
					/>
					<div class="vac-tags-username">
						{{ user.username }}
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'RoomUsersTag',

	props: {
		filteredUsersTag: { type: Array, required: true },
		selectItem: { type: Boolean, default: null },
		activeUpOrDown: { type: Number, default: null }
	},

	emits: ['select-user-tag', 'activate-item'],

	data() {
		return {
			activeItem: null
		}
	},

	watch: {
		filteredUsersTag(val, oldVal) {
			if (!oldVal.length || val.length !== oldVal.length) {
				this.activeItem = 0
			}
		},
		selectItem(val) {
			if (val) {
				this.$emit('select-user-tag', this.filteredUsersTag[this.activeItem])
			}
		},
		activeUpOrDown() {
			if (
				this.activeUpOrDown > 0 &&
				this.activeItem < this.filteredUsersTag.length - 1
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
.vac-tags-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  .vac-tags-box {
    display: flex;
    width: 100%;
    height: 54px;
    overflow: hidden;
    cursor: pointer;
    //background: var(--chat-footer-bg-color-tag);
    transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  }

  .vac-tags-box-active {
    //background: var(--chat-footer-bg-color-tag-active);
  }

  .vac-tags-info {
    display: flex;
    overflow: hidden;
    padding: 0 20px;
    align-items: center;
  }

  .vac-tags-avatar {
    height: 34px;
    width: 34px;
    min-height: 34px;
    min-width: 34px;
  }

  .vac-tags-username {
    font-size: 14px;
  }

  @media only screen and (max-width: 768px) {
    .vac-tags-box {
      height: 50px;
    }

    .vac-tags-info {
      padding: 0 12px;
    }
  }
}
</style>