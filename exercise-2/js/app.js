(function () {
  if (window.performance.now) {
    console.log("Using high performance timer");
    getTimestamp = function () {
      return window.performance.now();
    };
  } else {
    if (window.performance.webkitNow) {
      console.log("Using webkit high performance timer");
      getTimestamp = function () {
        return window.performance.webkitNow();
      };
    } else {
      console.log("Using low performance timer");
      getTimestamp = function () {
        return new Date().getTime() + "_" + Math.floor(Math.random() * 10);
      };
    }
  }

  const getData = function () {
    const data = localStorage.getItem("todo_data");
    if (data && data.length) {
      return JSON.parse(data);
    } else {
      return {
        pending: [
          {
            id: "task_" + getTimestamp(),
            name: "Pay Bills",
            inEditMode: false,
          },
          {
            id: "task_" + getTimestamp(),
            name: "Go Shopping",
            inEditMode: true,
          },
        ],
        completed: [
          {
            id: "task_" + getTimestamp(),
            name: "See the Doctor",
            inEditMode: false,
          },
        ],
      };
    }
  };

  const todoData = getData();  
  const taskInput = document.getElementById("new-task");
  const addButton = document.getElementsByTagName("button")[0];
  const incompleteTasksHolder = document.getElementById("incomplete-tasks");
  const completedTasksHolder = document.getElementById("completed-tasks");

  const saveData = function () {
    localStorage.setItem("todo_data", JSON.stringify(todoData));
  };

  const createNewTaskElement = function (task) {
    listItem = document.createElement("li");
    checkBox = document.createElement("input");
    label = document.createElement("label");
    editInput = document.createElement("input");
    editButton = document.createElement("button");
    deleteButton = document.createElement("button");

    checkBox.type = "checkbox";
    editInput.type = "text";
    editButton.innerText = "Edit";
    editButton.className = "edit";
    deleteButton.innerText = "Delete";
    deleteButton.className = "delete";
    label.innerText = task.name;

    listItem.id = task.id;
    listItem.appendChild(checkBox);
    listItem.appendChild(label);
    listItem.appendChild(editInput);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    return listItem;
  };

  const addTask = function (e) {
    if (taskInput.value && taskInput.value.trim().length) {
      const listItemName = taskInput.value;

      const task = {
        id: "task_" + new Date().getTime(),
        name: listItemName,
        inEditMode: false,
      };
      todoData.pending.push(task);
      saveData();

      listItem = createNewTaskElement(task);
      incompleteTasksHolder.appendChild(listItem);
      bindTaskEvents(listItem, taskCompleted);
      taskInput.value = "";
      taskInput.className = "";
    } else {
      taskInput.className = "error-input";
    }
  };

  const taskChange = function () {
    taskInput.className = "";
  };

  const getTask = function (id) {
    console.log(todoData);
    const pending = todoData.pending.filter((data) => data.id === id);
    if (pending && pending.length) {
      return pending[0];
    }
    const complete = todoData.completed.filter((data) => data.id === id);
    if (complete && complete.length) {
      return complete[0];
    }
  };

  const getTaskIndexById = function (taskList, id) {
    for(let i = 0; i < taskList.length; i++) {
      if(taskList[i].id === id) {
        return i;
      }
    }
    return -1;
  };

  const editTask = function () {
    if (this.parentNode) {
      const listItem = this.parentNode;
      const task = getTask(listItem.id);
      const editInput = listItem.querySelectorAll("input[type=text")[0];
      const label = listItem.querySelector("label");
      const button = listItem.getElementsByTagName("button")[0];

      const containsClass = listItem.classList.contains("editMode");
      console.log(task);
      if (containsClass) {
        task.name = editInput.value;
        task.inEditMode = false;
        label.innerText = editInput.value;
        button.innerText = "Edit";
      } else {
        editInput.value = label.innerText;
        button.innerText = "Save";
        task.inEditMode = true;
      }
      saveData();
      listItem.classList.toggle("editMode");
    }
  };

  const deleteTask = function () {
    const listItem = this.parentNode;
    const ul = listItem.parentNode;
    ul.removeChild(listItem);

    let index = getTaskIndexById(todoData.pending, listItem.id);
    if(index > -1) {
      todoData.pending.splice(index, 1);
    }
    index = getTaskIndexById(todoData.completed, listItem.id);
    if(index > -1) {
      todoData.completed.splice(index, 1);
    }
    saveData();
  };

  const taskCompleted = function () {
    const listItem = this.parentNode;
    completedTasksHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskIncomplete);
    this.checked = false;
    const index = getTaskIndexById(todoData.pending, listItem.id);
    if(index > -1) {
      const task = todoData.pending[index]
      todoData.pending.splice(index, 1);
      todoData.completed.push(task);
    }
    saveData();
  };

  const taskIncomplete = function () {
    const listItem = this.parentNode;
    incompleteTasksHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);
    this.checked = false;
    const index = getTaskIndexById(todoData.completed, listItem.id);
    if(index > -1) {
      const task = todoData.completed[index]
      todoData.completed.splice(index, 1);
      todoData.pending.push(task);
    }
    saveData();
  };

  const bindTaskEvents = function (taskListItem, checkBoxEventHandler) {
    const checkBox = taskListItem.querySelectorAll("input[type=checkbox]")[0];
    const editButton = taskListItem.querySelectorAll("button.edit")[0];
    const deleteButton = taskListItem.querySelectorAll("button.delete")[0];
    editButton.onclick = editTask;
    deleteButton.onclick = deleteTask;
    checkBox.onchange = checkBoxEventHandler;
  };

  addButton.addEventListener("click", addTask);
  taskInput.addEventListener("change", taskChange);

  const loadInitData = function () {
    for (let i = 0; i < todoData.pending.length; i++) {
      const listItem = createNewTaskElement(todoData.pending[i]);
      incompleteTasksHolder.appendChild(listItem);
      bindTaskEvents(listItem, taskCompleted);
      if (todoData.pending[i].inEditMode) {
        listItem.childNodes[3].click();
      }
    }

    for (let i = 0; i < todoData.completed.length; i++) {
      const listItem = createNewTaskElement(todoData.completed[i]);
      completedTasksHolder.appendChild(listItem);
      bindTaskEvents(listItem, taskIncomplete);
      if (todoData.completed[i].inEditMode) {
        listItem.childNodes[3].click();
      }
    }
  };

  loadInitData();
})();
