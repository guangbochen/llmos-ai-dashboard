<template>
	<div
		ref="modal"
		tabindex="0"
		class="vac-media-preview"
		@click.stop="closeModal"
		@keydown.esc="closeModal"
	>
		<transition name="vac-bounce-preview" appear>
			<div v-if="isImage" class="vac-media-preview-container">
				<div
					class="vac-image-preview"
					:style="{
						'background-image': `url('${file.url}')`
					}"
				/>
			</div>

			<div v-else-if="isVideo" class="vac-media-preview-container">
				<video controls autoplay>
					<source :src="file.url" />
				</video>
			</div>
		</transition>

		<div class="vac-svg-button">
			<slot name="preview-close-icon">
<!--				<svg-icon name="close-outline" param="preview" />-->
			</slot>
		</div>
	</div>
</template>
<script>
// import SvgIcon from '../../components/SvgIcon/SvgIcon'

// import { isImageFile, isVideoFile } from '../../utils/media-file'

export default {
	name: 'MediaPreview',
	components: {
		// SvgIcon
	},

	props: {
		file: { type: Object, required: true }
	},

	emits: ['close-media-preview'],

	computed: {
		isImage() {
			return isImageFile(this.file)
		},
		isVideo() {
			return isVideoFile(this.file)
		}
	},

	mounted() {
		this.$refs.modal.focus()
	},

	methods: {
		closeModal() {
			this.$emit('close-media-preview')
		}
	}
}
</script>

<style lang="scss" scoped>
$media-preview-height: 70px;
$media-preview-width-lg: 40px;
$media-preview-width-sm: 20px;

.vac-media-preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  outline: none;

  .vac-media-preview-container {
    height: calc(100% - #{$media-preview-height * 2});
    width: calc(100% - #{$media-preview-width-lg * 2});
    padding: $media-preview-height $media-preview-width-lg;
    margin: 0 auto;
  }

  .vac-image-preview {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  video {
    width: 100%;
    height: 100%;
  }

  .vac-svg-button {
    position: absolute;
    top: 30px;
    right: 30px;
    transform: scale(1.4);
  }

  @media only screen and (max-width: 768px) {
    .vac-svg-button {
      top: 20px;
      right: 20px;
      transform: scale(1.2);
    }

    .vac-media-preview-container {
      width: calc(100% - #{$media-preview-width-sm * 2});
      padding: $media-preview-height $media-preview-width-sm;
    }
  }
}
</style>