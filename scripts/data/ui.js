import { UIComponents, UIComponent } from '../view/UIComponents.js';

export const components = new UIComponents([
    new UIComponent('/taskmanager', 'Task Manager', `
        <main>
            <header class="task-list-header">
                <h1>Task List</h1>
                <button class="add-task-button js-addTaskButton" type="button">
                    <svg aria-label="Add Task" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </header>

            <ul data-component="/taskmanager">
            
            </ul>
        </main>

        <aside>
            <form class="modal js-addTaskModal hidden" aria-label="Add Task Modal" aria-hidden="true">
                <fieldset>
                    <legend>Add a New Task</legend>
                    <textarea name="task-title" type="text" rows="1" required placeholder="Task name"></textarea>
                    <textarea name="task-description" rows="3" placeholder="Description"></textarea>

                    <div class="modal-buttons">
                        <button type="button" class="modal-button--secondary"  id="cancel-task-creation-button">Cancel</button>
                        <button type="submit" class="modal-button--primary" id="add-task-button">Add</button>
                    </div>
                </fieldset>
            </form>

            <form class="modal js-taskModal hidden" aria-label="Task Information" aria-hidden="true">
                <fieldset>
                    <div class="modal-header">
                        <legend>Task Details</legend>

                        <button type="button" class="modal-close-button js-taskModalCloseButton">
                            <svg aria-label="Remove Task" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <textarea name="task-title" rows="1" type="text" required placeholder="Task name"></textarea>
                    <textarea name="task-description" rows="3" placeholder="Description"></textarea>

                    <div class="modal-buttons">
                        <button type="button" class="modal-button--secondary js-taskModalCloseButton">Cancel</button>
                        <button type="button" class="modal-button--primary js-taskModalSaveButton">Save</button>
                    </div>
                </fieldset>
            </form>
        </aside>
    `)
]);
