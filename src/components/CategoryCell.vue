<template>
  <div class="category-item">
    <span v-html="typeLabel"></span>
    <div v-show="params.editMode" class="category-actions">
      <button @click="addHandler" class="action-btn add-btn">+</button>
      <button @click="removeHandler" class="action-btn remove-btn">-</button>
    </div>
  </div>

</template>

<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{ params: any }>();
const removeHandler = (e:MouseEvent) =>{
  e.stopPropagation();
  props.params.onRemove(props.params.data.id)
}
const addHandler = (e:MouseEvent) => {
  e.stopPropagation()
  const {id, level} = props.params.data
  console.log("id level ",id,level);
  const lastId = props.params?.store.getAll().at(-1).id??0
  const nextId = lastId+1;
  props.params.onAdd({
    id:nextId,
    label:'Введите имя',
    parent:props.params.data.parent,
    level: level > 0 ? level + 1 : level
  })
}
const typeLabel = computed(() => {
  const hasChildren = props.params?.store.getChildren(props.params.data.id).length > 0

  const indent = "&nbsp;".repeat((props.params.data.level ?? 0) * 4);
  const icon = props.params.data.expanded ? "▼" : "▶";

  return hasChildren
      ? `${indent}${icon} Группа`
      : `${indent}— Элемент`;
})

</script>

<style>
.category-item {
  white-space: pre;
  display: flex;
  justify-content: space-between;
}

.category-actions {
  display: flex;
  gap: 5px;
  align-items: center;
}

.action-btn {
  border: 0px;
  outline: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  aspect-ratio: 1;
  border-radius: 100%;
}

.add-btn {
  background: #3c3c87;
}

.remove-btn {
  background: red;
}
</style>
