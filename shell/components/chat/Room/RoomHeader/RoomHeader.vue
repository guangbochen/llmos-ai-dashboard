<template>
	<div class="vac-room-header vac-app-border-b">
		<slot name="room-header">
			<div class="vac-room-wrapper">
				<transition name="vac-slide-up">
					<div v-if="messageSelectionEnabled" class="vac-room-selection">
						<div
							v-for="action in messageSelectionActions"
							:id="action.name"
							:key="action.name"
						>
							<div
								class="vac-selection-button"
								@click="messageSelectionActionHandler(action)"
							>
								{{ action.title }}
								<span class="vac-selection-button-count">
									{{ selectedMessagesTotal }}
								</span>
							</div>
						</div>
						<div
							class="vac-selection-cancel vac-item-clickable"
							@click="$emit('cancel-message-selection')"
						>
							{{ textMessages.CANCEL_SELECT_MESSAGE }}
						</div>
					</div>
				</transition>
				<template
					v-if="!messageSelectionEnabled && messageSelectionAnimationEnded"
				>
					<div
						v-if="!singleRoom"
						class="vac-svg-button vac-toggle-button"
						:class="{
							'vac-rotate-icon-init': !isMobile,
							'vac-rotate-icon': !showRoomsList && !isMobile
						}"
						@click="$emit('toggle-rooms-list')"
					>
						<slot name="toggle-icon">
							<svg-icon name="toggle" />
						</slot>
					</div>
					<div
						class="vac-info-wrapper"
						:class="{ 'vac-item-clickable': roomInfoEnabled }"
						@click="$emit('room-info')"
					>
						<slot name="room-header-avatar">
							<div
								v-if="room.avatar"
								class="vac-avatar"
								:style="{ 'background-image': `url('${room.avatar}')` }"
							/>
						</slot>
						<slot name="room-header-info">
							<div class="vac-text-ellipsis">
								<div class="vac-room-name vac-text-ellipsis">
									{{ room.roomName }}
								</div>
								<div v-if="typingUsers" class="vac-room-info vac-text-ellipsis">
									{{ typingUsers }}
								</div>
								<div v-else class="vac-room-info vac-text-ellipsis">
									{{ userStatus }}
								</div>
							</div>
						</slot>
					</div>
					<slot v-if="room.roomId" name="room-options">
						<div
							v-if="menuActions.length"
							class="vac-svg-button vac-room-options"
							@click="menuOpened = !menuOpened"
						>
							<slot name="menu-icon">
								<svg-icon name="menu" />
							</slot>
						</div>
						<transition v-if="menuActions.length" name="vac-slide-left">
							<div
								v-if="menuOpened"
								v-click-outside="closeMenu"
								class="vac-menu-options"
							>
								<div class="vac-menu-list">
									<div v-for="action in menuActions" :key="action.name">
										<div
											class="vac-menu-item"
											@click="menuActionHandler(action)"
										>
											{{ action.title }}
										</div>
									</div>
								</div>
							</div>
						</transition>
					</slot>
				</template>
			</div>
		</slot>
	</div>
</template>

<script>
import SvgIcon from '@shell/components/SvgIcon/SvgIcon'
import vClickOutside from '@shell/utils/chat/on-click-outside'
import typingText from '@shell/utils/typing-text'

export default {
	name: 'RoomHeader',
	components: {
		SvgIcon
	},

	directives: {
		clickOutside: vClickOutside
	},

	props: {
		currentUserId: { type: [String, Number], required: true },
		textMessages: { type: Object, required: true },
		singleRoom: { type: Boolean, required: true },
		showRoomsList: { type: Boolean, required: true },
		isMobile: { type: Boolean, required: true },
		roomInfoEnabled: { type: Boolean, required: true },
		menuActions: { type: Array, required: true },
		room: { type: Object, required: true },
		messageSelectionEnabled: { type: Boolean, required: true },
		messageSelectionActions: { type: Array, required: true },
		selectedMessagesTotal: { type: Number, required: true }
	},

	emits: [
		'toggle-rooms-list',
		'room-info',
		'menu-action-handler',
		'cancel-message-selection',
		'message-selection-action-handler'
	],

	data() {
		return {
			menuOpened: false,
			messageSelectionAnimationEnded: true
		}
	},

	computed: {
		typingUsers() {
			return typingText(this.room, this.currentUserId, this.textMessages)
		},
		userStatus() {
			if (!this.room.users || this.room.users.length !== 2) return

			const user = this.room.users.find(u => u._id !== this.currentUserId)

			if (!user?.status) return

			let text = ''

			if (user.status.state === 'online') {
				text = this.textMessages.IS_ONLINE
			} else if (user.status.lastChanged) {
				text = this.textMessages.LAST_SEEN + user.status.lastChanged
			}

			return text
		}
	},

	watch: {
		messageSelectionEnabled(val) {
			if (val) {
				this.messageSelectionAnimationEnded = false
			} else {
				setTimeout(() => {
					this.messageSelectionAnimationEnded = true
				}, 300)
			}
		}
	},

	methods: {
		menuActionHandler(action) {
			this.closeMenu()
			this.$emit('menu-action-handler', action)
		},
		closeMenu() {
			this.menuOpened = false
		},
		messageSelectionActionHandler(action) {
			this.$emit('message-selection-action-handler', action)
		}
	}
}
</script>

<style lang="scss" scoped>
.vac-room-header {
  //position: var(--chat-header-position);
  display: flex;
  align-items: center;
  height: 64px;
  //width: var(--chat-header-width);
  z-index: 10;
  margin-right: 1px;
  //background: var(--chat-header-bg-color);
  //border-top-right-radius: var(--chat-container-border-radius);

  .vac-room-wrapper {
    display: flex;
    align-items: center;
    min-width: 0;
    height: 100%;
    width: 100%;
    padding: 0 16px;
  }

  .vac-toggle-button {
    margin-right: 15px;

    svg {
      height: 26px;
      width: 26px;
    }
  }

  .vac-rotate-icon {
    &-init {
      transform: rotate(360deg);
    }
    transform: rotate(180deg) !important;
  }

  .vac-info-wrapper {
    display: flex;
    align-items: center;
    min-width: 0;
    width: 100%;
    height: 100%;
  }

  .vac-room-selection {
    display: flex;
    align-items: center;
    min-width: 0;
    width: 100%;
    height: 100%;

    .vac-selection-button {
      padding: 8px 16px;
      //color: var(--chat-color-button);
      //background-color: var(--chat-bg-color-button);
      border-radius: 4px;
      margin-right: 10px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        opacity: 0.7;
      }

      &:active {
        opacity: 0.9;
      }

      .vac-selection-button-count {
        margin-left: 6px;
        opacity: 0.9;
      }
    }

    .vac-selection-cancel {
      display: flex;
      align-items: center;
      margin-left: auto;
      white-space: nowrap;
      //color: var(--chat-color-button-clear);
      transition: all 0.2s;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  .vac-room-name {
    font-size: 17px;
    font-weight: 500;
    line-height: 22px;
    //color: var(--chat-header-color-name);
  }

  .vac-room-info {
    font-size: 13px;
    line-height: 18px;
    //color: var(--chat-header-color-info);
  }

  .vac-room-options {
    margin-left: auto;
  }

  @media only screen and (max-width: 768px) {
    height: 50px;

    .vac-room-wrapper {
      padding: 0 10px;
    }

    .vac-room-name {
      font-size: 16px;
      line-height: 22px;
    }

    .vac-room-info {
      font-size: 12px;
      line-height: 16px;
    }

    .vac-avatar {
      height: 37px;
      width: 37px;
      min-height: 37px;
      min-width: 37px;
    }
  }
}
</style>