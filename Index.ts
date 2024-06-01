interface Items {
    id: number;
    name: string;
    task: string;
  }
  
  interface addItems {
    id: string;
    name: string;
    task: string;
  } 
  class CreateTodo {
    private tasks: Items[];
  
    constructor() {
      this.tasks = [];
      document.addEventListener('DOMContentLoaded', () => {
        this.loadTasks()
          .then(message => {
            console.log(message);
            this.renderTasks();
          })
          .catch(error => {
            console.error("Error loading tasks:", error);
          });
      });
  
      const button = document.getElementById('btn') as HTMLButtonElement;
      button.addEventListener('click', () => this.handleAddTask());
    }
  
    private handleAddTask(): void {
      const taskInput = document.getElementById('task') as HTMLInputElement;
      const textInput = document.getElementById('text') as HTMLInputElement;
      const newTask: addItems = {
        id: Math.ceil(Math.random() * 1000).toString(),
        name: textInput.value,
        task: taskInput.value
      };
  
      this.addItem(newTask)
        .then(message => {
          console.log(message);
          taskInput.value = '';
          textInput.value = '';
        })
        .catch(error => {
          console.error("Error adding task:", error);
        });
    }
  
    async addItem(task: addItems): Promise<string> {
      console.log('Attempting to add task:', task);
      try {
        const response = await fetch("http://localhost:3000/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(task)
        });
  
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to add task. Status: ${response.status}. Message: ${text}`);
        }
  
        const newTask = await response.json();
        this.tasks.push(newTask);
        this.renderTasks();
        return "Task added successfully";
      } catch (error) {
        console.error("Error adding task:", error);
        throw error;
      }
    }
  
    async loadTasks(): Promise<string> {
      try {
        const response = await fetch("http://localhost:3000/tasks");
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to load tasks. Status: ${response.status}. Message: ${text}`);
        }
        const data = await response.json();
        this.tasks = data;
        return "Tasks loaded successfully";
      } catch (error) {
        console.error("Error loading tasks:", error);
        throw error;
      }
    }
  
    renderTasks(): void {
      const tasksList = document.querySelector('.tasks');
      if (!tasksList) {
        console.error('Tasks list element not found');
        return;
      }
      tasksList.innerHTML = '';
  
      this.tasks.forEach(task => {
        const listItem = document.createElement('div');
        listItem.className = 'task-item';
        listItem.dataset.id = task.id.toString();
        listItem.innerHTML = `
          <input type="text" value="${task.task}" id="task-${task.id}" />
          <input type="text" value="${task.name}" id="name-${task.id}" />
          <div class='btn'>
            <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">Delete</button>
            <button class="update-btn" onclick="taskManager.handleUpdateTask(${task.id})">Update</button>
          </div>
        `;
        tasksList.appendChild(listItem);
      });
    }
  
    async deleteTask(id: number): Promise<void> {
      try {
        const response = await fetch(`http://localhost:3000/tasks/${id}`, {
          method: "DELETE"
        });
  
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Task with ID ${id} not found.`);
          } else {
            const text = await response.text();
            throw new Error(`Failed to delete task. Status: ${response.status}. Message: ${text}`);
          }
        }
  
        // If deletion is successful, remove the task from the local tasks array
        this.tasks = this.tasks.filter(task => task.id !== id);
        // Render updated tasks list
        this.renderTasks();
        console.log("Task deleted successfully");
      } catch (error) {
        if (error instanceof TypeError) {
          console.error("Network error. Please check your internet connection.");
        } else {
          console.error("Error deleting task:", error.message);
        }
        throw error;
      }
    }
  
    async updateTask(updatedTask: Items): Promise<string> {
      try {
        const response = await fetch(`http://localhost:3000/tasks/${updatedTask.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedTask)
        });
  
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to update task. Status: ${response.status}. Message: ${text}`);
        }
  
        // If update is successful, update the task in the local tasks array
        this.tasks = this.tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
        // Render updated tasks list
        this.renderTasks();
        console.log(`Task with id ${updatedTask.id} updated successfully.`);
        return "Task updated successfully";
      } catch (error) {
        console.error("Error updating task:", error);
        throw error;
      }
    }
  
    handleUpdateTask(id: number): void {
      const taskInput = document.getElementById(`task-${id}`) as HTMLInputElement;
      const nameInput = document.getElementById(`name-${id}`) as HTMLInputElement;
      const updatedTask: Items = {
        id,
        task: taskInput.value,
        name: nameInput.value
      };
  
      console.log(`Updating task with id: ${id}, task: ${updatedTask.task}, name: ${updatedTask.name}`);
      this.updateTask(updatedTask)
        .then(message => {
          console.log(message);
        })
        .catch(error => {
          console.error("Error updating task:", error);
        });
    }
  }