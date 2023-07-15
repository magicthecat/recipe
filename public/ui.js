export class Utils {
    static getPageTitle = (endpoint) => {
        return endpoint.charAt(0).toUpperCase() + endpoint.slice(1);
    };
}

export class DynamicHtml {
    static createDeleteButton(onClick) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', onClick);
        deleteButton.classList.add('button', 'delete-button');

        return deleteButton;
    }

    static createCancelButton(appendTo, elementToRemove) {

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('button', 'cancel-button');

        cancelButton.addEventListener('click', () => {
            elementToRemove.innerHTML = ''; // Clear the form container
        });
        appendTo.appendChild(cancelButton);
    }

    static createEditButton(onClick) {
        const editButton = document.createElement('button');
        editButton.classList.add('button', 'edit-button');

        editButton.textContent = 'Edit';
        editButton.addEventListener('click', onClick);
        return editButton;
    }

    static generateListItems(dataArray, deleteHandler, editHandler) {
        const container = document.getElementById('list');
        container.innerHTML = '';

        if (dataArray.length === 0) {
            return;
        }

        const table = document.createElement('table');
        table.classList.add('data-table');

        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = Object.keys(dataArray[0]);

        headers.forEach((header) => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        const actionHeader = document.createElement('th');
        actionHeader.textContent = 'Actions';
        headerRow.appendChild(actionHeader);

        tableHeader.appendChild(headerRow);
        table.appendChild(tableHeader);

        // Create table body
        const tableBody = document.createElement('tbody');

        dataArray.forEach((dataItem) => {
            const row = document.createElement('tr');

            headers.forEach((header) => {
                const cell = document.createElement('td');
                cell.textContent = dataItem[header];
                row.appendChild(cell);
            });

            const actionsCell = document.createElement('td');
            const deleteButton = DynamicHtml.createDeleteButton(() => deleteHandler(dataItem.id));
            actionsCell.appendChild(deleteButton);

            const editButton = DynamicHtml.createEditButton(() => editHandler(dataItem.id));
            actionsCell.appendChild(editButton);
            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });

        table.classList.add('data-table');

        table.appendChild(tableBody);
        container.appendChild(table);
    }

    static createForm(formId, schema, submitHandler) {
        const form = document.createElement('form');
        form.id = formId;
        form.addEventListener('submit', submitHandler);

        for (const prop in schema) {
            if (Object.prototype.hasOwnProperty.call(schema, prop)) {
                const label = document.createElement('label');
                label.setAttribute('for', prop);
                label.textContent = `${prop.charAt(0).toUpperCase() + prop.slice(1)}:`;
                form.appendChild(label);

                const input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('id', prop);
                input.setAttribute('name', prop);
                input.setAttribute('required', true);
                form.appendChild(input);

                form.appendChild(document.createElement('br'));
            }
        }

        const addButton = document.createElement('button');
        addButton.setAttribute('type', 'submit');
        addButton.textContent = 'Add';
        form.appendChild(addButton);

        return form;
    }
}

export class Page {
    static generateCrudUserInterface(endpoint, schema, controller) {
        const formContainer = document.getElementById('formContainer');

        const title = Utils.getPageTitle(endpoint);

        const listTitle = document.createElement('h2');
        listTitle.textContent = title;
        document.body.insertBefore(listTitle, document.getElementById('list'));

        const formTitle = document.createElement('h2');
        formTitle.textContent = `Add To ${title}`;
        document.body.insertBefore(formTitle, formContainer);

        const addButton = document.createElement('button');
        addButton.textContent = 'Add New Entry';
        addButton.addEventListener('click', () => {
            formContainer.innerHTML = ''; // Clear the form container

            const form = DynamicHtml.createForm('addForm', schema, controller.createDataEntry.bind(controller));
            formContainer.appendChild(form);
            DynamicHtml.createCancelButton(form, formContainer);

        });
        document.body.insertBefore(addButton, formContainer);

        controller.updateDataAndList();
    }
}