<template>
  <div class="" @click="clickHandler">
    <input @keyup="saveHandler" ref="inputRef" v-model="inputVal" class="edit-input" type="text" v-if="showInput">
    <span v-else>{{ label }}</span>
  </div>

</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, ref} from "vue";
const props = defineProps<{ params: any }>();
const inputVal = ref(props.params.data.label);

const clickHandler = (evt: MouseEvent) => {
  evt.stopPropagation();
  props.params.onClick(props.params.data.id)
}

const label = computed(() => {
  return props.params.data.label
});
const inputRef = ref<HTMLInputElement | null>(null)
const showInput = computed(() => {
  return props.params.editItemNum != null && +props.params.editItemNum === props.params.data.id;
});


const saveHandler = (evt: KeyboardEvent) => {

  if (evt.key === "13") {
    console.log("saving", props.params.data)
    props.params.onSave({
      id: props.params.data.id,
      label: inputVal.value ?? "",
      parent: props.params.data.parent,
    })
  }

}
onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>
<style>
.edit-input {
  width: 100%;
  position: relative;
  z-index: 20;
}
</style>