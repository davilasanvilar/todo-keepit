let db;
function initDb() {
  const dbInitRequest = window.indexedDB.open("todos");

  dbInitRequest.onupgradeneeded = (e) => {
    db = e.target.result;
    const objectStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true })
    objectStore.createIndex("title", "title")
    objectStore.createIndex("dueDate", "dueDate")
    objectStore.createIndex("completed", "completed");
  }

  dbInitRequest.onsuccess = (e) => {
    db = dbInitRequest.result;
    onGetTasks();
  };
}
initDb();

function onToggleModal() {
  const modal = document.getElementById("modal");
  if (modal.classList.contains("modal-visible")) {
    modal.classList.remove("modal-visible");
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-due-date").value = "";
    document.getElementById("task-id").value = "";
    document.getElementById("title-error").classList.remove("show-error");
  } else {
    modal.classList.add("modal-visible");
  }
}

function onShowToast(success, text) {
  const toast = document.getElementById("toast");
  toast.className = "";
  if (success) {
    toast.classList.add("success-toast");
  } else {
    toast.classList.add("error-toast");
  }
  toast.textContent = text;
  toast.classList.add("show-toast");
  setTimeout(() => {
    toast.classList.remove("show-toast");
  }, 3000);
}

function onShowAddModal() {
  document.querySelector("#modal-top-bar h2").textContent = "Add task";
  onToggleModal();
}

function onShowEditModal(id) {
  document.querySelector("#modal-top-bar h2").textContent = "Edit task";
  const objectStore = db.transaction("tasks", "readonly").objectStore("tasks")
  objectStore.get(id).onsuccess = (e) => {
    const task = e.target.result;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    document.getElementById("task-due-date").value = task.dueDate ? task.dueDate.toISOString().split('T')[0] : "";
    document.getElementById("task-id").value = id;
    onToggleModal();
  }
}


function onEditTask() {
  const id = parseInt(document.getElementById("task-id").value);
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  let dueDate = undefined;
  if (document.getElementById("task-due-date").value !== '') {
    dueDate = new Date(Date.parse(document.getElementById("task-due-date").value));
  }
  document.getElementById("title-error").classList.remove("show-error");
  let hasError = false;
  if (!title) {
    document.getElementById("title-error").classList.add("show-error");
    hasError = true;
  }
  if (dueDate && isNaN(dueDate.getTime())) {
    document.getElementById("due-date-error").classList.add("show-error");
    hasError = true;
  }
  if (hasError) {
    return
  }
  const objectStore = db.transaction("tasks", "readwrite").objectStore("tasks")

  const getTaskRequest = objectStore.get(id)
  getTaskRequest.onsuccess = (e) => {
    const task = e.target.result;
    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    const updateRequest = objectStore.put(task);
    updateRequest.onsuccess = (e) => {
      onShowToast(true, "Task updated successfully");
      onGetTasks();
      onToggleModal();
    }
    updateRequest.onerror = (e) => {
      onShowToast(false, "Error updating task");
    }
  }
  getTaskRequest.onerror = (e) => {
    onShowToast(false, "Error updating task");
  }

  const task = {
    id,
    title,
    description,
    dueDate,
    completed
  }

  const editTaskRequest = db.transaction("tasks", "readwrite").objectStore("tasks").put(task);
  addTaskRequest.onsuccess = (e) => {
    onShowToast(true, "Task updated successfully");
    onGetTasks();
    onToggleModal();
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-due-date").value = "";

  }
  addTaskRequest.onerror = (e) => {
    onShowToast(false, "Error updating task");
  }
}


function onAddTask() {
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  let dueDate = undefined;
  if (document.getElementById("task-due-date").value !== '') {
    dueDate = new Date(Date.parse(document.getElementById("task-due-date").value));
  }
  document.getElementById("title-error").classList.remove("show-error");
  let hasError = false;
  if (!title) {
    document.getElementById("title-error").classList.add("show-error");
    hasError = true;
  }
  if (dueDate && isNaN(dueDate.getTime())) {
    document.getElementById("due-date-error").classList.add("show-error");
    hasError = true;
  }

  if (hasError) {
    return
  }

  const task = {
    title,
    description,
    dueDate,
    completed: 0
  }

  const addTaskRequest = db.transaction("tasks", "readwrite").objectStore("tasks").add(task);
  addTaskRequest.onsuccess = (e) => {
    onShowToast(true, "Task added successfully");
    onGetTasks();
    onToggleModal();
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-due-date").value = "";

  }
  addTaskRequest.onerror = (e) => {
    onShowToast(false, "Error adding task");
  }
}

function onSubmit(e) {
  e.preventDefault();
  if (document.getElementById("task-id").value) {
    onEditTask();
  } else {
    onAddTask();
  }
}

const uncompleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle"><circle cx="12" cy="12" r="10"/></svg>`
const completeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
  stroke-linejoin="round" class="lucide lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>`
const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-delete">
  <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
  <path d="m12 9 6 6"/><path d="m18 9-6 6"/>
  </svg>`
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
  class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 
  4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`

function createTaskElement(task) {
  const newLiElement = document.createElement("li");

  //Complete task button
  const buttonComplete = document.createElement("button");
  buttonComplete.className = "complete-button";
  buttonComplete.onclick = () => {
    onSwitchCompleteTask(task.id);
  }
  buttonComplete.innerHTML = task.completed ? completeIcon : uncompleteIcon;

  //Edit task button
  const buttonEdit = document.createElement("button");
  buttonEdit.className = "edit-button";
  buttonEdit.onclick = () => {
    onShowEditModal(task.id);
  }
  buttonEdit.innerHTML = editIcon;

  //Delete task button
  const buttonDelete = document.createElement("button");
  buttonDelete.className = "delete-button";
  buttonDelete.onclick = () => {
    onDeleteTask(task.id);
  }
  buttonDelete.innerHTML = deleteIcon;

  //Task info div
  const taskInfoDiv = document.createElement("div");
  taskInfoDiv.className = "task-info-div";
  const titleSpan = document.createElement("span");
  titleSpan.appendChild(document.createTextNode(task.title));
  titleSpan.className = "title-span";
  const dueDateSpan = document.createElement("span");
  const formatDate = task.dueDate && task.dueDate.toLocaleDateString("en-UK")
  if (formatDate) {
    dueDateSpan.appendChild(document.createTextNode(formatDate));
  }
  dueDateSpan.className = "due-date-span";
  const titleAndDueDateDiv = document.createElement("div");
  titleAndDueDateDiv.className = "title-due-date-div";
  titleAndDueDateDiv.appendChild(titleSpan);
  titleAndDueDateDiv.appendChild(dueDateSpan);
  taskInfoDiv.appendChild(titleAndDueDateDiv);
  const descriptionSpan = document.createElement("span").appendChild(document.createTextNode(task.description));
  taskInfoDiv.appendChild(descriptionSpan);

  //Build final element
  newLiElement.appendChild(buttonComplete);
  newLiElement.appendChild(taskInfoDiv);
  newLiElement.appendChild(buttonEdit);
  newLiElement.appendChild(buttonDelete);
  newLiElement.className = task.completed ? "completed-task" : "uncompleted-task";
  return newLiElement;
}

function onSwitchCompleteTask(id) {
  const objectStore = db.transaction("tasks", "readwrite").objectStore("tasks")
  objectStore.get(id).onsuccess = (e) => {
    const task = e.target.result;
    task.completed = task.completed ? 0 : 1;
    objectStore.put(task);
  }
  onGetTasks();
}

function onResetFilters() {
  document.getElementById("filter-title").value = "";
  document.getElementById("filter-due-date").value = "";
  onGetTasks();
}

function onGetTasks() {
  const objectStore = db.transaction("tasks", "readonly").objectStore("tasks")
  const titleFilter = document.getElementById("filter-title").value;
  const dueDateFilter = document.getElementById("filter-due-date").value && new Date(Date.parse(document.getElementById("filter-due-date").value));
  const taskListElement = document.getElementById("task-list")
  taskListElement.innerHTML = "";
  const tasksToDisplay = [];

  const filterTasks = (e, tasksToDisplayArray, nextFunction) => {
    const cursor = e.target.result;
    if (cursor) {
      //We add the tasks that match our criteria to the tasksToDisplay array
      const task = cursor.value;
      if ((!titleFilter || task.title.trim().toLowerCase().includes(titleFilter.trim().toLowerCase()))
        && (!dueDateFilter || (task.dueDate !== undefined && task.dueDate.getTime() === dueDateFilter.getTime()))) {
        tasksToDisplayArray.push(task);
      }
      cursor.continue();
    } else {
      //Once finished we sort the tasks by due date and display them
      tasksToDisplayArray.sort((a, b) => {
        //If a task due date is undefined we put it at the end
        if (a.dueDate === undefined) {
          return 1;
        }
        if (b.dueDate === undefined) {
          return -1;
        }
        return a.dueDate - b.dueDate
      });
      tasksToDisplayArray.forEach(task => {
        const newTaskElement = createTaskElement(task);
        taskListElement.appendChild(newTaskElement)
      });
      tasksToDisplayArray.length = 0
      //If next function is defined we call it (it makes the execution sequential)
      nextFunction && nextFunction();
    }
  }

  //We divide the search in 3 steps, first we get the uncompleted tasks, then the completed ones,
  //and finally we check if the list is empty to display a message
  //we have to send the next function to the first call to make the execution sequential and to have the uncompleted tasks first
  const checkEmptyList = () => {
    if (taskListElement.innerHTML === "") {
      const emptyListElement = document.createElement("span");
      emptyListElement.className = "empty-list-element";
      emptyListElement.appendChild(document.createTextNode("No tasks found"));
      taskListElement.appendChild(emptyListElement);
    }
  }
  const searchCompletedTasks = () => {
    const getCompletedTasksRequest = objectStore.index("completed").openCursor(1);
    getCompletedTasksRequest.onsuccess = (e) => filterTasks(e, tasksToDisplay, checkEmptyList);
    getCompletedTasksRequest.onerror = (e) => {
      onShowToast(false, "Error getting tasks");
    }
  }
  const getUncompletedTasksRequest = objectStore.index("completed").openCursor(0);
  getUncompletedTasksRequest.onsuccess = (e) => filterTasks(e, tasksToDisplay, searchCompletedTasks);
  getUncompletedTasksRequest.onerror = (e) => {
    onShowToast(false, "Error getting tasks");
  }
}

function onDeleteTask(id) {
  const deleteTaskRequest = db.transaction("tasks", "readwrite").objectStore("tasks").delete(id);
  deleteTaskRequest.onsuccess = (e) => {
    onShowToast(true, "Task deleted successfully");
    onGetTasks();
  }
  deleteTaskRequest.onerror = (e) => {
    onShowToast(false, "Error deleting task");
  }
}
