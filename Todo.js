/**
 * 할일 목록을 우선순위별로 관리하는 함수
 * @param {Array} items - 할일 항목 배열
 * @param {number} priorityType - 우선순위 유형 (1: 높음, 2: 중간, 3: 낮음)
 * @returns {Object} 분류된 할일 목록
 */
function manageTodoList(items, priorityType) {
  // 상수 정의
  const MAX_ITEMS = 10;
  const PRIORITY = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
  };
  
  // 입력 유효성 검사
  if (!Array.isArray(items)) {
    console.error("유효한 배열이 필요합니다");
    return null;
  }
  
  if (items.length > MAX_ITEMS) {
    console.error(`할일은 최대 ${MAX_ITEMS}개까지 가능합니다`);
    return null;
  }
  
  // 할일 필터링
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
  
  // 결과 로깅 (분리된 함수)
  logItems("Todo", todoItems);
  logItems("Completed", completedItems);
  
  return {
    todos: todoItems,
    completed: completedItems
  };
}

/**
 * 아이템 목록을 로깅하는 도우미 함수
 */
function logItems(label, items) {
  items.forEach(item => {
    console.log(`${label}: ${item.text}`);
  });
}
