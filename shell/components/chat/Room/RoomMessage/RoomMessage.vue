<template>
	<div :id="message._id" ref="message" class="vac-message-wrapper">
		<div v-if="showDate" class="vac-card-info vac-card-date">
			{{ message.date }}
		</div>

		<div v-if="newMessage._id === message._id" class="vac-line-new">
			{{ textMessages.NEW_MESSAGES }}
		</div>

		<div v-if="message.system" class="vac-card-info vac-card-system">
			<slot :name="'message_' + message._id">
				<format-message
					:message-id="message._id"
					:content="message.content"
					:deleted="!!message.deleted"
					:users="roomUsers"
					:text-messages="textMessages"
					:text-formatting="textFormatting"
					:link-options="linkOptions"
					@open-user-tag="openUserTag"
				>
					<template v-for="(idx, name) in $slots" #[name]="data">
						<slot :name="name" v-bind="data" />
					</template>
				</format-message>
			</slot>
		</div>

		<div
			v-else
			class="vac-message-box"
			:class="{ 'vac-offset-current': message.senderId === currentUserId }"
			@click="selectMessage"
		>
			<slot :name="'message_' + message._id">
				<slot
					v-if="message.senderId !== currentUserId"
					:name="'message-avatar_' + message._id"
				>
					<div
            v-if="message.avatar"
						class="vac-avatar"
						:style="{ 'background-image': `url('${message.avatar}')` }"
					/>
				</slot>
				<div
					v-if="hasSenderUserAvatar && !message.avatar"
					class="vac-avatar-offset"
				/>
				<div
					class="vac-message-container"
					:class="{
						'vac-message-container-offset': messageOffset
					}"
				>
					<div
						class="vac-message-card"
						:class="{
							'vac-message-highlight': isMessageHover,
							'vac-message-current': message.senderId === currentUserId,
							'vac-message-deleted': message.deleted,
							'vac-item-clickable': messageSelectionEnabled,
							'vac-message-selected': isMessageSelected
						}"
						@mouseover="onHoverMessage"
						@mouseleave="onLeaveMessage"
					>
						<div
							v-if="showUsername"
							class="vac-text-username"
							:class="{
								'vac-username-reply': !message.deleted && message.replyMessage
							}"
						>
							<span>{{ message.username }}</span>
						</div>

						<message-reply
							v-if="!message.deleted && message.replyMessage"
							:message="message"
							:room-users="roomUsers"
							:text-formatting="textFormatting"
							:link-options="linkOptions"
						>
							<template v-for="(i, name) in $slots" #[name]="data">
								<slot :name="name" v-bind="data" />
							</template>
						</message-reply>

						<format-message
							v-if="
								!!message.deleted || !message.files || !message.files.length
							"
							:message-id="message._id"
							:content="message.content"
							:deleted="!!message.deleted"
							:users="roomUsers"
							:text-formatting="textFormatting"
							:text-messages="textMessages"
							:link-options="linkOptions"
							@open-user-tag="openUserTag"
						>
							<template v-for="(idx, name) in $slots" #[name]="data">
								<slot :name="name" v-bind="data" />
							</template>
						</format-message>

						<message-files
							v-else-if="!isAudio || message.files.length > 1"
							:current-user-id="currentUserId"
							:message="message"
							:room-users="roomUsers"
							:text-formatting="textFormatting"
							:link-options="linkOptions"
							:message-selection-enabled="messageSelectionEnabled"
							@open-file="openFile"
							@open-user-tag="openUserTag"
						>
							<template v-for="(i, name) in $slots" #[name]="data">
								<slot :name="name" v-bind="data" />
							</template>
						</message-files>

						<template v-else>
							<audio-player
								:message-id="message._id"
								:src="message.files[0].url"
								:message-selection-enabled="messageSelectionEnabled"
								@update-progress-time="progressTime = $event"
								@hover-audio-progress="hoverAudioProgress = $event"
							>
								<template v-for="(i, name) in $slots" #[name]="data">
									<slot :name="name" v-bind="data" />
								</template>
							</audio-player>

							<div v-if="!message.deleted" class="vac-progress-time">
								{{ progressTime }}
							</div>
						</template>

						<div class="vac-text-timestamp">
							<div
								v-if="message.edited && !message.deleted"
								class="vac-icon-edited"
							>
								<slot :name="'pencil-icon_' + message._id">
<!--									<svg-icon name="pencil" />-->
								</slot>
							</div>
							<span>{{ message.timestamp }}</span>
							<span v-if="isCheckmarkVisible">
								<slot :name="'checkmark-icon_' + message._id">
<!--									<svg-icon-->
<!--										:name="-->
<!--											message.distributed ? 'double-checkmark' : 'checkmark'-->
<!--										"-->
<!--										:param="message.seen ? 'seen' : ''"-->
<!--										class="vac-icon-check"-->
<!--									/>-->
								</slot>
							</span>
						</div>

						<message-actions
							:current-user-id="currentUserId"
							:message="message"
							:message-actions="messageActions"
							:show-reaction-emojis="showReactionEmojis"
							:message-hover="messageHover"
							:hover-message-id="hoverMessageId"
							:hover-audio-progress="hoverAudioProgress"
							:emoji-data-source="emojiDataSource"
							@update-message-hover="messageHover = $event"
							@update-options-opened="optionsOpened = $event"
							@update-emoji-opened="emojiOpened = $event"
							@message-action-handler="messageActionHandler"
							@send-message-reaction="sendMessageReaction"
						>
							<template v-for="(i, name) in $slots" #[name]="data">
								<slot :name="name" v-bind="data" />
							</template>
						</message-actions>
					</div>

					<message-reactions
						:current-user-id="currentUserId"
						:message="message"
						@send-message-reaction="sendMessageReaction"
					/>
				</div>
				<slot :name="'message-failure_' + message._id">
					<div
						v-if="message.failure && message.senderId === currentUserId"
						class="vac-failure-container vac-svg-button"
						:class="{
							'vac-failure-container-avatar':
								message.avatar && message.senderId === currentUserId
						}"
						@click="$emit('open-failed-message', { message })"
					>
						<div class="vac-failure-text">!</div>
					</div>
				</slot>
				<slot
					v-if="message.senderId === currentUserId"
					:name="'message-avatar_' + message._id"
				>
					<div
            v-if="message.avatar"
						class="vac-avatar vac-avatar-current"
						:style="{ 'background-image': `url('${message.avatar}')` }"
					/>
				</slot>
				<div
					v-if="hasCurrentUserAvatar && !message.avatar"
					class="vac-avatar-current-offset"
				/>
			</slot>
		</div>
	</div>
</template>

<script>
// import SvgIcon from '../../../components/SvgIcon/SvgIcon'
// import FormatMessage from '../../../components/FormatMessage/FormatMessage'
//
// import MessageReply from './MessageReply/MessageReply'
// import MessageFiles from './MessageFiles/MessageFiles'
// import MessageActions from './MessageActions/MessageActions'
// import MessageReactions from './MessageReactions/MessageReactions'
// import AudioPlayer from './AudioPlayer/AudioPlayer'

// import { messagesValidation } from '../../../utils/data-validation'
// import { isAudioFile } from '../../../utils/media-file'

export default {
	name: 'RoomMessage',
	components: {
		// SvgIcon,
		// FormatMessage,
		// AudioPlayer,
		// MessageReply,
		// MessageFiles,
		// MessageActions,
		// MessageReactions
	},

	props: {
		currentUserId: { type: [String, Number], required: true },
		textMessages: { type: Object, required: true },
		index: { type: Number, required: true },
		message: { type: Object, required: true },
		messages: { type: Array, required: true },
		editedMessageId: { type: [String, Number], default: null },
		roomUsers: { type: Array, default: () => [] },
		messageActions: { type: Array, required: true },
		newMessages: { type: Array, default: () => [] },
		showReactionEmojis: { type: Boolean, required: true },
		showNewMessagesDivider: { type: Boolean, required: true },
		textFormatting: { type: Object, required: true },
		linkOptions: { type: Object, required: true },
		usernameOptions: { type: Object, required: true },
		messageSelectionEnabled: { type: Boolean, required: true },
		selectedMessages: { type: Array, default: () => [] },
		emojiDataSource: { type: String, default: undefined }
	},

	emits: [
		'message-added',
		'open-file',
		'open-user-tag',
		'open-failed-message',
		'message-action-handler',
		'send-message-reaction',
		'select-message',
		'unselect-message'
	],

	data() {
		return {
			hoverMessageId: null,
			messageHover: false,
			optionsOpened: false,
			emojiOpened: false,
			newMessage: {},
			progressTime: '- : -',
			hoverAudioProgress: false
		}
	},

	computed: {
		showUsername() {
			if (
				!this.usernameOptions.currentUser &&
				this.message.senderId === this.currentUserId
			) {
				return false
			} else {
				return this.roomUsers.length >= this.usernameOptions.minUsers
			}
		},
		showDate() {
			return (
				this.index > 0 &&
				this.message.date !== this.messages[this.index - 1].date
			)
		},
		messageOffset() {
			return (
				this.index > 0 &&
				this.message.senderId !== this.messages[this.index - 1].senderId
			)
		},
		isMessageHover() {
			return (
				this.editedMessageId === this.message._id ||
				this.hoverMessageId === this.message._id
			)
		},
		isAudio() {
			return this.message.files?.some(file => isAudioFile(file))
		},
		isCheckmarkVisible() {
			return (
				this.message.senderId === this.currentUserId &&
				!this.message.deleted &&
				(this.message.saved || this.message.distributed || this.message.seen)
			)
		},
		hasCurrentUserAvatar() {
			return this.messages.some(
				message => message.senderId === this.currentUserId && message.avatar
			)
		},
		hasSenderUserAvatar() {
			return this.messages.some(
				message => message.senderId !== this.currentUserId && message.avatar
			)
		},
		isMessageSelected() {
			return (
				this.messageSelectionEnabled &&
				!!this.selectedMessages.find(
					message => message._id === this.message._id
				)
			)
		}
	},

	watch: {
		newMessages: {
			immediate: true,
			deep: true,
			handler(val) {
				if (!val.length || !this.showNewMessagesDivider) {
					this.newMessage = {}
					return
				}

				this.newMessage = val.reduce((res, obj) =>
					obj.index < res.index ? obj : res
				)
			}
		},
		messageSelectionEnabled() {
			this.resetMessageHover()
		}
	},

	mounted() {
		messagesValidation(this.message)

		this.$emit('message-added', {
			message: this.message,
			index: this.index,
			ref: this.$refs.message
		})
	},

	methods: {
		onHoverMessage() {
			if (!this.messageSelectionEnabled) {
				this.messageHover = true
				if (this.canEditMessage()) this.hoverMessageId = this.message._id
			}
		},
		canEditMessage() {
			return !this.message.deleted
		},
		onLeaveMessage() {
			if (!this.messageSelectionEnabled) {
				if (!this.optionsOpened && !this.emojiOpened) this.messageHover = false
				this.hoverMessageId = null
			}
		},
		resetMessageHover() {
			this.messageHover = false
			this.hoverMessageId = null
		},
		openFile(file) {
			this.$emit('open-file', { message: this.message, file: file })
		},
		openUserTag(user) {
			this.$emit('open-user-tag', { user })
		},
		messageActionHandler(action) {
			this.resetMessageHover()

			setTimeout(() => {
				this.$emit('message-action-handler', { action, message: this.message })
			}, 300)
		},
		sendMessageReaction({ emoji, reaction }) {
			this.$emit('send-message-reaction', {
				messageId: this.message._id,
				reaction: emoji,
				remove: reaction && reaction.indexOf(this.currentUserId) !== -1
			})
			this.messageHover = false
		},
		selectMessage() {
			if (this.messageSelectionEnabled) {
				if (this.isMessageSelected) {
					this.$emit('unselect-message', this.message._id)
				} else {
					this.$emit('select-message', this.message)
				}
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.vac-message-wrapper {
  .vac-card-info {
    border-radius: 4px;
    text-align: center;
    margin: 10px auto;
    font-size: 12px;
    padding: 4px;
    display: block;
    overflow-wrap: break-word;
    position: relative;
    white-space: normal;
    box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.1),
    0 1px 1px -1px rgba(0, 0, 0, 0.11), 0 1px 2px -1px rgba(0, 0, 0, 0.11);
  }

  .vac-card-date {
    max-width: 150px;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--chat-message-color-date);
    background-color: var(--chat-message-bg-color-date);
  }

  .vac-card-system {
    max-width: 250px;
    padding: 8px 4px;
    color: var(--chat-message-color-system);
    background-color: var(--chat-message-bg-color-system);
  }

  .vac-line-new {
    color: var(--chat-message-color-new-messages);
    position: relative;
    text-align: center;
    font-size: 13px;
    padding: 10px 0;
  }

  .vac-line-new:after,
  .vac-line-new:before {
    border-top: 1px solid var(--chat-message-color-new-messages);
    content: '';
    left: 0;
    position: absolute;
    top: 50%;
    width: calc(50% - 60px);
  }

  .vac-line-new:before {
    left: auto;
    right: 0;
  }

  .vac-message-box {
    display: flex;
    flex: 0 0 50%;
    max-width: 50%;
    justify-content: flex-start;
    line-height: 1.4;
  }

  $avatar-size: 28px;

  .vac-avatar {
    height: $avatar-size;
    width: $avatar-size;
    min-height: $avatar-size;
    min-width: $avatar-size;
    margin: 0 0 2px 0;
    align-self: flex-end;
  }

  .vac-avatar-current-offset {
    margin-right: $avatar-size;
  }

  .vac-avatar-offset {
    margin-left: $avatar-size;
  }

  .vac-failure-container {
    position: relative;
    align-self: flex-end;
    height: 20px;
    width: 20px;
    margin: 0 0 2px -4px;
    border-radius: 50%;
    background-color: #f44336;

    &.vac-failure-container-avatar {
      margin-right: 6px;
    }

    .vac-failure-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 15px;
      font-weight: bold;
    }
  }

  .vac-message-container {
    position: relative;
    padding: 2px 10px;
    align-items: end;
    min-width: 100px;
    box-sizing: content-box;
  }

  .vac-message-container-offset {
    margin-top: 10px;
  }

  .vac-offset-current {
    margin-left: 50%;
    justify-content: flex-end;
  }

  .vac-message-card {
    background-color: var(--chat-message-bg-color);
    color: var(--chat-message-color);
    border-radius: 8px;
    font-size: 14px;
    padding: 6px 9px 3px;
    white-space: pre-line;
    max-width: 100%;
    -webkit-transition-property: box-shadow, opacity;
    transition-property: box-shadow, opacity;
    transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: box-shadow;
    box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.1),
    0 1px 1px -1px rgba(0, 0, 0, 0.11), 0 1px 2px -1px rgba(0, 0, 0, 0.11);
  }

  .vac-message-highlight {
    box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.11), 0 1px 5px -1px rgba(0, 0, 0, 0.11);
  }

  .vac-message-current {
    background-color: var(--chat-message-bg-color-me) !important;
  }

  .vac-message-deleted {
    color: var(--chat-message-color-deleted) !important;
    font-size: 13px !important;
    font-style: italic !important;
    background-color: var(--chat-message-bg-color-deleted) !important;
  }

  .vac-message-selected {
    background-color: var(--chat-message-bg-color-selected) !important;
    transition: background-color 0.2s;
  }

  .vac-message-image {
    position: relative;
    background-color: var(--chat-message-bg-color-image) !important;
    background-size: cover !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
    height: 250px;
    width: 250px;
    max-width: 100%;
    border-radius: 4px;
    margin: 4px auto 5px;
    transition: 0.4s filter linear;
  }

  .vac-text-username {
    font-size: 13px;
    color: var(--chat-message-color-username);
    margin-bottom: 2px;
  }

  .vac-username-reply {
    margin-bottom: 5px;
  }

  .vac-text-timestamp {
    font-size: 10px;
    color: var(--chat-message-color-timestamp);
    text-align: right;
  }

  .vac-progress-time {
    float: left;
    margin: -2px 0 0 40px;
    color: var(--chat-color);
    font-size: 12px;
  }

  .vac-icon-edited {
    -webkit-box-align: center;
    align-items: center;
    display: -webkit-inline-box;
    display: inline-flex;
    justify-content: center;
    letter-spacing: normal;
    line-height: 1;
    text-indent: 0;
    vertical-align: middle;
    margin: 0 4px 2px;

    svg {
      height: 12px;
      width: 12px;
    }
  }

  .vac-icon-check {
    height: 14px;
    width: 14px;
    vertical-align: middle;
    margin: -3px -3px 0 3px;
  }

  @media only screen and (max-width: 768px) {
    .vac-message-container {
      padding: 2px 3px 1px;
    }

    .vac-message-container-offset {
      margin-top: 10px;
    }

    .vac-message-box {
      flex: 0 0 80%;
      max-width: 80%;
    }

    $avatar-size-small: 25px;

    .vac-avatar {
      height: $avatar-size-small;
      width: $avatar-size-small;
      min-height: $avatar-size-small;
      min-width: $avatar-size-small;
      margin: 0 6px 1px 0;

      &.vac-avatar-current {
        margin: 0 0 1px 6px;
      }
    }

    .vac-avatar-current-offset {
      margin-right: calc(#{$avatar-size-small} + 6px);
    }

    .vac-avatar-offset {
      margin-left: calc(#{$avatar-size-small} + 6px);
    }

    .vac-failure-container {
      margin-left: 2px;

      &.vac-failure-container-avatar {
        margin-right: 0;
      }
    }

    .vac-offset-current {
      margin-left: 20%;
    }

    .vac-progress-time {
      margin-left: 37px;
    }
  }
}
</style>