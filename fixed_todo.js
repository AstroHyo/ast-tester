/**
 * @param {Array} items - 할일 항목 배열
 * @param {number} priorityType - 우선순위 유형 (1: 높음, 2: 중간, 3: 낮음)
 * @returns {Object} 분류된 할일 목록
 */
function manageTodoList(items, priorityType) {
  const MAX_ITEMS = 10;
  const PRIORITY = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
  };
  
  if (!Array.isArray(items)) {
    console.error("유효한 배열이 필요합니다");
    return null;
  }
  
  if (items.length > MAX_ITEMS) {
    console.error(`할일은 최대 ${MAX_ITEMS}개까지 가능합니다`);
    return null;
  }
  
  const todoItems = [];
  const completedItems = items.filter(item => {
    const isDone = item.done === true;
    if (!isDone) {
      // 우선순위 설정
      switch (priorityType) {
        case PRIORITY.HIGH:
          item.priority = "high";
          break;
        case PRIORITY.MEDIUM:
          item.priority = "medium";
          break;
        default:
          item.priority = "low";
      }
      todoItems.push(item);
    }
    return isDone;
  });
  
  logItems("Todo", todoItems);
  logItems("Completed", completedItems);
  
  return {
    todos: todoItems,
    completed: completedItems
  };
}

/**
 */
function logItems(label, items) {
  items.forEach(item => {
    console.log(`${label}: ${item.text}`);
  });
}
