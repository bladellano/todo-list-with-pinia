import { ref, watch, nextTick } from 'vue'
import Sortable from 'sortablejs'

export function useDragAndDrop(todoListRef, viewMode, filteredTodos, allTodos, updateOrder) {
  let sortableInstance = null

  const initSortable = () => {
    if (todoListRef.value && viewMode.value === 'list') {
      sortableInstance = Sortable.create(todoListRef.value, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: async (evt) => {
          const oldVisibleIds = filteredTodos.value.map(t => t.id)
          const movedId = oldVisibleIds[evt.oldIndex]
          const reorderedIds = [...oldVisibleIds]
          
          reorderedIds.splice(evt.oldIndex, 1)
          reorderedIds.splice(evt.newIndex, 0, movedId)
          
          const nonArchivedTodos = allTodos.value.filter(t => !t.archived)
          const visibleSet = new Set(reorderedIds)
          const hiddenIds = nonArchivedTodos
            .filter(t => !visibleSet.has(t.id))
            .map(t => t.id)
          
          const newOrder = [...reorderedIds, ...hiddenIds]
          await updateOrder(newOrder)
        }
      })
    }
  }

  const destroySortable = () => {
    if (sortableInstance) {
      sortableInstance.destroy()
      sortableInstance = null
    }
  }

  const updateSortable = () => {
    destroySortable()
    if (viewMode.value === 'list') {
      nextTick(() => initSortable())
    }
  }

  watch(viewMode, updateSortable)

  return {
    initSortable,
    destroySortable,
    updateSortable
  }
}
