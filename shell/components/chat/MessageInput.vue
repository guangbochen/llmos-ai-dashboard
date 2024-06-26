<script lang="ts">

export default {
  data() {
    const t = this.$store.getters['i18n/t'];
    return {};
  },
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900">
    <div class="max-w-3xl px-2.5 mx-auto inset-x-0">
      <div class=" pb-2">
        <input type="file" hidden>
        <form class="">

          <div class="flex">
            <!-- send a message-->
            <textarea id="chat-textarea" />

            <!-- record voice-->
            <div class="">
            </div>
          </div>
        </form>

        <div class="text-center text-small helper-text">
          {{ t('llm.chat.notify') }}.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.helper-text {
  padding: 3px;
  color: gray;
}

#chat-textarea {
  margin: 0.3rem;
  padding: 0.5rem;
}
</style>