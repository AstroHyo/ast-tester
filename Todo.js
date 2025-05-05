function todo_manager(list, TYPE) {  
  let todoList = [];
  let completed_items = [];
  
  if (list.length > 10) {
    console.log("Error: Too many items");
    return null;
  }
  
  for (var i = 0; i < list.length; i++) {
    if (list[i].done == true) {
      completed_items.push(list[i]);
    } else {
      if (TYPE == 1) {
        list[i].priority = "high";
      } else if (TYPE == 2) {
        list[i].priority = "medium";
      } else {
        list[i].priority = "low";
      }
      todoList.push(list[i]);
    }
  }
  
  for (var j = 0; j < todoList.length; j++) {
    console.log("Todo: " + todoList[j].text);
  }
  
  for (var k = 0; k < completed_items.length; k++) {
    console.log("Completed: " + completed_items[k].text);
  }
  
  return {
    todos: todoList,
    completed: completed_items
  };
}
