<template>
	<div
		v-show="showRoomsList"
		class="vac-rooms-container"
		:class="{
			'vac-rooms-container-full': isMobile,
			'vac-app-border-r': !isMobile
		}"
	>
		<slot name="rooms-header" />

		<slot name="rooms-list-search">
			<rooms-search
				:rooms="rooms"
				:loading-rooms="loadingRooms"
				:text-messages="textMessages"
				:show-search="showSearch"
				:show-add-room="showAddRoom"
				@search-room="searchRoom"
				@add-room="$emit('add-room')"
			>
				<template v-for="(idx, name) in $slots" #[name]="data">
					<slot :name="name" v-bind="data" />
				</template>
			</rooms-search>
		</slot>

		<loader :show="loadingRooms" type="rooms">
			<template v-for="(idx, name) in $slots" #[name]="data">
				<slot :name="name" v-bind="data" />
			</template>
		</loader>

		<div v-if="!loadingRooms && !rooms.length" class="vac-rooms-empty">
			<slot name="rooms-empty">
				{{ textMessages.ROOMS_EMPTY }}
			</slot>
		</div>

		<div v-if="!loadingRooms" id="rooms-list" class="vac-room-list">
			<div
				v-for="fRoom in filteredRooms"
				:id="fRoom.roomId"
				:key="fRoom.roomId"
				class="vac-room-item"
				:class="{ 'vac-room-selected': selectedRoomId === fRoom.roomId }"
				@click="openRoom(fRoom)"
			>
				<room-content
					:current-user-id="currentUserId"
					:room="fRoom"
					:text-formatting="textFormatting"
					:link-options="linkOptions"
					:text-messages="textMessages"
					:room-actions="roomActions"
					@room-action-handler="$emit('room-action-handler', $event)"
				>
					<template v-for="(idx, name) in $slots" #[name]="data">
						<slot :name="name" v-bind="data" />
					</template>
				</room-content>
			</div>
			<transition name="vac-fade-message">
				<div v-if="rooms.length && !loadingRooms" id="infinite-loader-rooms">
					<loader :show="showLoader" :infinite="true" type="infinite-rooms">
						<template v-for="(idx, name) in $slots" #[name]="data">
							<slot :name="name" v-bind="data" />
						</template>
					</loader>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
import Loader from '@shell/components/chat/Loader/Loader'
import RoomsSearch from './RoomsSearch/RoomsSearch'
import RoomContent from './RoomContent/RoomContent'

import filteredItems from '@shell/utils/filter-items'

export default {
	name: 'RoomsList',
	components: {
		Loader,
		RoomsSearch,
		RoomContent
	},

	props: {
		currentUserId: { type: [String, Number], required: true },
		textMessages: { type: Object, required: true },
		showRoomsList: { type: Boolean, required: true },
		showSearch: { type: Boolean, required: true },
		showAddRoom: { type: Boolean, required: true },
		textFormatting: { type: Object, required: true },
		linkOptions: { type: Object, required: true },
		isMobile: { type: Boolean, required: true },
		rooms: { type: Array, required: true },
		loadingRooms: { type: Boolean, required: true },
		roomsLoaded: { type: Boolean, required: true },
		room: { type: Object, required: true },
		customSearchRoomEnabled: { type: [Boolean, String], default: false },
		roomActions: { type: Array, required: true },
		scrollDistance: { type: Number, required: true }
	},

	emits: [
		'add-room',
		'search-room',
		'room-action-handler',
		'loading-more-rooms',
		'fetch-room',
		'fetch-more-rooms'
	],

	data() {
		return {
			filteredRooms: this.rooms || [],
			observer: null,
			showLoader: true,
			loadingMoreRooms: false,
			selectedRoomId: '88bYp60jS861AHTzbC2j'
		}
	},

	watch: {
		rooms: {
			deep: true,
			handler(newVal, oldVal) {
				this.filteredRooms = newVal
				if (newVal.length !== oldVal.length || this.roomsLoaded) {
					this.loadingMoreRooms = false
				}
			}
		},
		loadingRooms(val) {
			if (!val) {
				setTimeout(() => this.initIntersectionObserver())
			}
		},
		loadingMoreRooms(val) {
			this.$emit('loading-more-rooms', val)
		},
		roomsLoaded: {
			immediate: true,
			handler(val) {
				if (val) {
					this.loadingMoreRooms = false
					if (!this.loadingRooms) {
						this.showLoader = false
					}
				}
			}
		},
		room: {
			immediate: true,
			handler(val) {
				if (val && !this.isMobile) this.selectedRoomId = val.roomId
			}
		}
	},

	methods: {
		initIntersectionObserver() {
			if (this.observer) {
				this.showLoader = true
				this.observer.disconnect()
			}

			const loader = this.$el.querySelector('#infinite-loader-rooms')

			if (loader) {
				const options = {
					root: this.$el.querySelector('#rooms-list'),
					rootMargin: `${this.scrollDistance}px`,
					threshold: 0
				}

				this.observer = new IntersectionObserver(entries => {
					if (entries[0].isIntersecting) {
						this.loadMoreRooms()
					}
				}, options)

				this.observer.observe(loader)
			}
		},
		searchRoom(ev) {
			if (this.customSearchRoomEnabled) {
				this.$emit('search-room', ev.target.value)
			} else {
				this.filteredRooms = filteredItems(
					this.rooms,
					'roomName',
					ev.target.value
				)
			}
		},
		openRoom(room) {
			if (room.roomId === this.room.roomId && !this.isMobile) return
			if (!this.isMobile) this.selectedRoomId = room.roomId
			this.$emit('fetch-room', { room })
		},
		loadMoreRooms() {
			if (this.loadingMoreRooms) return

			if (this.roomsLoaded) {
				this.loadingMoreRooms = false
				this.showLoader = false
				return
			}

			this.$emit('fetch-more-rooms')
			this.loadingMoreRooms = true
		}
	}
}
</script>

<style lang="scss" scoped>
.vac-rooms-container {
  display: flex;
  flex-flow: column;
  flex: 0 0 25%;
  min-width: 260px;
  max-width: 500px;
  position: relative;
  //background: var(--chat-sidemenu-bg-color);
  height: 100%;
  //border-top-left-radius: var(--chat-container-border-radius);
  //border-bottom-left-radius: var(--chat-container-border-radius);

  &.vac-rooms-container-full {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .vac-rooms-empty {
    font-size: 14px;
    color: #9ca6af;
    font-style: italic;
    text-align: center;
    margin: 40px 0;
    line-height: 20px;
    white-space: pre-line;
  }

  .vac-room-list {
    flex: 1;
    position: relative;
    max-width: 100%;
    padding: 0 10px 5px;
    overflow-y: auto;
  }

  .vac-room-item {
    border-radius: 8px;
    align-items: center;
    display: flex;
    flex: 1 1 100%;
    margin-bottom: 5px;
    padding: 0 14px;
    position: relative;
    min-height: 71px;
    transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

    &:hover {
      //background: var(--chat-sidemenu-bg-color-hover);
    }

    &:not(.vac-room-selected) {
      cursor: pointer;
    }
  }

  .vac-room-selected {
    //color: var(--chat-sidemenu-color-active) !important;
    //background: var(--chat-sidemenu-bg-color-active) !important;

    &:hover {
      //background: var(--chat-sidemenu-bg-color-active) !important;
    }
  }

  @media only screen and (max-width: 768px) {
    .vac-room-list {
      padding: 0 7px 5px;
    }

    .vac-room-item {
      min-height: 60px;
      padding: 0 8px;
    }
  }
}
</style>