<script setup lang="ts">
import {markRaw, ref} from "vue";
import {AgGridVue} from "ag-grid-vue3";
import type {ColDef} from "ag-grid-community";
import type {ItemDto, Row} from "./types";
import TreeStore from "./utils/TreeStore.ts";
import CategoryCell from "./components/CategoryCell.vue";
import NameCell from "./components/NameCell.vue";
import type {RowClickedEvent} from "ag-grid-enterprise";

const store: TreeStore = new TreeStore([
  {id: 1, parent: null, label: "Айтем 1"},
  {id: "2", parent: 1, label: "Айтем 2"},
  {id: 3, parent: 1, label: "Айтем 3"},
  {id: 4, parent: "2", label: "Айтем 4"},
  {id: 5, parent: "2", label: "Айтем 5"},
  {id: 6, parent: "2", label: "Айтем 6"},
  {id: 7, parent: 4, label: "Айтем 7"},
  {id: 8, parent: 4, label: "Айтем 8"},
]);
const editMode = ref(false);
const editItemNum = ref<string | number | null>(null);
const onNameEdit = (id:string | number | null) => {
  if (editMode.value) {
    editItemNum.value = id
  }
}
const handleEditMode = () => editMode.value = !editMode.value;

const rowData = ref<Row[]>(
    store.toRowData()
);

function expand(id: string | number) {
  const index = rowData.value.findIndex((item) => item.id === id);
  if (index === -1) return;

  const parent = rowData.value[index];
  const children = store.getChildren(id).map((el) => ({
    ...el,
    expanded: false,
    level: (parent.level ?? 0) + 1,
  }));
  rowData.value.splice(index + 1, 0, ...children);
  parent.expanded = true;
}

function collapse(id: string | number) {
  const allChildren = store.getAllChildren(id).map((el) => el.id);
  rowData.value = rowData.value.filter((item) => !allChildren.includes(item.id));
  const parent = rowData.value.find((item) => item.id === id);
  if (parent) parent.expanded = false;
}

function onRowClicked(evt:RowClickedEvent<Row>) {
  const clickedItem = evt.data as Row;
  if (!clickedItem) return;

  if (clickedItem.expanded) {
    console.log("collapse")
    collapse(clickedItem.id);
  } else {
    expand(clickedItem.id);
  }
}


const onRemove = (id: string | number) => {
  const itemToDel = store.getItem(id);

  if (itemToDel == null) {
    throw new Error("Elem to dele is not found")
  }
  console.log("store old ", store.getAll());
  if (store.getChildren(itemToDel.id).length == 0) {
    store.removeItem(id);
    rowData.value = rowData.value.filter(el=>+el.id !== +itemToDel.id);
    return
  }
  if (itemToDel.parent) {
    collapse(itemToDel.parent);
  } else {
    collapse(itemToDel.id)
  }
  store.removeItem(id);
  console.log("store new ", store.getAll());
  rowData.value = store.getAll()
}
const onAdd = (data: ItemDto) => {
  const {id, parent, label} = data
  editItemNum.value = id;
  const added = store.addItem({
    id,
    parent,
    label,
  })
  if (parent == null) {

    rowData.value.push({
      ...added,
      expanded: false,
      level: 0,
    });
  } else {
    const parentIndex = rowData.value.findIndex(item => item.id === parent);

    if (parentIndex === -1) {
      console.warn("Parent not found in rowData");
      return;
    }

    const parentRow = rowData.value[parentIndex];

    if (!parentRow.expanded) {
      expand(parent);
    }

    const allChildren = store.getChildren(parent);
    const visibleChildren = rowData.value.filter(item => allChildren.some(child => child.id === item.id));

    let insertAfterId = parent;
    if (visibleChildren.length > 0) {
      insertAfterId = visibleChildren[visibleChildren.length - 1].id;
    }

    const insertIndex = rowData.value.findIndex(item => item.id === insertAfterId);
    rowData.value.splice(insertIndex + 1, 0, {
      ...added,
      expanded: false,
      level: (parentRow.level ?? 0) + 1,
    });
  }

}


const onSave = (data: ItemDto) => {

  const expandedIds = rowData.value
      .filter((item) => item.expanded)
      .map((item) => item.id);

  store.updateItem(data);

  const restoredData: Row[] = [];

  function restoreExpand(id: string | number, level = 0) {
    const parent = store.getItem(id);
    if (!parent) return;

    restoredData.push({
      ...parent,
      expanded: true,
      level,
    });

    const children = store.getChildren(id);
    for (const child of children) {
      if (expandedIds.includes(child.id)) {
        restoreExpand(child.id, level + 1);
      } else {
        restoredData.push({
          ...child,
          expanded: false,
          level: level + 1,
        });
      }
    }
  }

  const rootItems = store.toRowData();
  for (const item of rootItems) {
    if (expandedIds.includes(item.id)) {
      restoreExpand(item.id, 0);
    } else {
      restoredData.push({
        ...item,
        expanded: false,
        level: 0,
      });
    }
  }

  rowData.value = restoredData;

  editItemNum.value = null;
};

const colDefs = ref<ColDef<Row>[]>([
  {
    field: "id",
    headerName: "№",
    cellRenderer: (params:any) => +params.data.id
  },
  {
    field: "type",
    headerName: "Категория",
    cellRenderer: markRaw(CategoryCell),
    cellRendererParams: {
      store,
      editMode,
      onAdd,
      onRemove,
    }
  },
  {
    field: "label",
    headerName: "Наименование",
    cellRenderer: markRaw(NameCell),
    cellRendererParams: {
      editItemNum, onSave,
      onClick: onNameEdit
    }
  },
]);

</script>

<template>
  <div class="action-tab">
    <button @click="handleEditMode">{{ editMode ? "Смотреть" : "Редактировать" }}</button>
  </div>
  <ag-grid-vue
      :rowData="rowData"
      :columnDefs="colDefs"
      :components="{ CategoryCell }"
      style="height: 500px;"
      @rowClicked="onRowClicked"
  />
</template>

<style scoped>

</style>
