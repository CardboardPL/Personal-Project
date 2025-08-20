const modesHTML = {
    creation: `
        <form action="#" aria-label="Task creation form">
            <textarea id="task-title" name="task-title" rows="1" placeholder="Task Title"></textarea>
            <textarea id="task-description" name="task-description" rows="1" placeholder="Description"></textarea>

            <div class="form-button-group"> 
                <button type="button" class="form-cancel-button js-form-cancel-button">Cancel</button>
                <button type="submit" class="form-submit-button js-form-submit-button">Create Task</button>
            </div>
        </form>
    `,
    update: `
        <form action="#" aria-label="Task update form">
            <textarea id="task-title" name="task-title" rows="1" placeholder="Task Title"></textarea>
            <textarea id="task-description" name="task-description" rows="1" placeholder="Description"></textarea>

            <fieldset>
                <legend>Status</legend>

                <div class="task-status-group">
                    
                    <label for="status-0">
                        Pending
                        <input id="status-0" class="visually-hidden" name="task-status" type="radio" value="0">
                    </label>
                    
                    <label for="status-1">
                        In-progress
                        <input id="status-1" class="visually-hidden" name="task-status" type="radio" value="1">
                    </label>
                    
                    <label for="status-2">
                        Completed
                        <input id="status-2" class="visually-hidden" name="task-status" type="radio" value="2">
                    </label>
                </div>
            </fieldset>
            

            <div class="form-button-group"> 
                <button type="button" class="form-cancel-button js-form-cancel-button">Cancel</button>
                <button type="submit" class="form-submit-button js-form-submit-button">Update Task</button>
            </div>
        </form>
    `,
    deleteConfirmation: ``,
}

function setupTextarea(textarea) {
    function adjustHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 4}px`;
    }

    function cleanTextarea() {
        textarea.value = '';
        textarea.removeEventListener('input', adjustHeight);
    }

    adjustHeight();
    textarea.addEventListener('input', adjustHeight);
    return cleanTextarea;
}

export function setup(modalContainer, initialMode) {
    if (!modalContainer || !(modalContainer instanceof Element)) {
        throw new Error('To continue with the setup, provide a valid DOM element.');
    }
    if (typeof initialMode !== 'string') {
        throw new Error('To continue with the setup, provide an initial mode of type "string".');
    } else if (!initialMode) {
        throw new Error('To continue with the setup, provide a non-empty initial mode.');
    }

    const reference = {};

    let textareas = [];

    function openModal() {
        closeModal();
        modalContainer.querySelectorAll('textarea').forEach(textarea => {
            textareas.push(setupTextarea(textarea));
        });
        modalContainer.setAttribute('aria-hidden', 'false');
        modalContainer.classList.remove('visually-hidden');
        reference.isOpen = true;
    }

    function closeModal() {
        for (const cleanFunc of textareas) {
            cleanFunc();
        }
        textareas = [];
        modalContainer.setAttribute('aria-hidden', 'true');
        modalContainer.classList.add('visually-hidden');
        reference.isOpen = false;
    }

    function setModalMode(mode) {
        if (typeof mode !== 'string') {
            throw new Error('Set modal mode process aborted. Provided mode must be of type "string".');
        }

        const cleanedMode = mode.trim();
        if (cleanedMode === '') {
            throw new Error('Set modal mode process aborted. Provided mode must not be an empty string.');
        }

        const modeHTML = modesHTML[cleanedMode];
        if (!modeHTML) {
            throw new Error(`Given Mode: ${cleanedMode}, doesn't exist.`);
        }

        if (cleanedMode !== reference.currentMode) {
            modalContainer.innerHTML = modeHTML;
            reference.currentMode = cleanedMode;
        }
    }

    setModalMode(initialMode);
    closeModal();

    reference.setModalMode = setModalMode;
    reference.openModal = openModal;
    reference.closeModal = closeModal;
    return reference;
}