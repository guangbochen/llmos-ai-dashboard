<template>
	<transition name="vac-slide-up">
		<div
			v-if="files.length"
			class="vac-room-files-container"
		>
			<div class="vac-files-box">
				<div v-for="(file, i) in files" :key="i">
					<room-file
						:file="file"
						:index="i"
						@remove-file="$emit('remove-file', $event)"
					>
						<template v-for="(idx, name) in $slots" #[name]="data">
							<slot :name="name" v-bind="data" />
						</template>
					</room-file>
				</div>
			</div>

			<div class="vac-icon-close">
				<div class="vac-svg-button" @click="$emit('reset-message')">
					<slot name="files-close-icon">
						<svg-icon name="close-outline" />
					</slot>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
import SvgIcon from '@shell/components/SvgIcon/SvgIcon'
import RoomFile from './RoomFile/RoomFile'

export default {
	name: 'RoomFiles',
	components: {
		SvgIcon,
		RoomFile
	},

	props: {
		files: { type: Array, required: true }
	},

	emits: ['remove-file', 'reset-message'],

	computed: {
	}
}
</script>

<style lang="scss" scoped>
.vac-room-files-container {
  display: flex;
  align-items: center;
  padding: 10px 6px 0 6px;
  //background: var(--chat-footer-bg-color);

  .vac-files-box {
    display: flex;
    overflow: auto;
    width: calc(100% - 30px);
  }

  video {
    height: 100px;
    //border: var(--chat-border-style-input);
    border-radius: 4px;
  }

  .vac-icon-close {
    margin-left: auto;

    svg {
      height: 20px;
      width: 20px;
    }
  }
}

@media only screen and (max-width: 768px) {
  .vac-files-container {
    padding: 6px 4px 4px 2px;
  }
}
</style>