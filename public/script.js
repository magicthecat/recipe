import { Utils, Page, DynamicHtml } from './ui.js';

class Schema {
    static new(data) {
        return Object.assign(new Schema(), data);
    }
}


class CrudController {
    constructor(schema, endpoint) {
        this.schema = schema;
        this.endpoint = endpoint;
    }

    async createDataEntry(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        try {
            await DataController.addData(this.endpoint, data);

            // Reset the form inputs
            form.reset();

            // Fetch the updated data and regenerate the list
            await this.updateDataAndList();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async updateDataAndList() {
        try {
            const data = await DataController.fetchData(this.endpoint);
            DynamicHtml.generateListItems(data, this.deletePost.bind(this), this.editPost.bind(this), `${this.endpoint}List`);

        } catch (error) {
            console.error('Error:', error);
        }
    }

    async deletePost(itemId) {
        try {
            await DataController.deleteData(this.endpoint, itemId);
            await this.updateDataAndList();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async editPost(itemId) {
        try {
            const data = await DataController.fetchData(this.endpoint);
            const item = data.find((item) => item.id === itemId);
            if (!item) {
                throw new Error(`Item with id ${itemId} not found.`);
            }

            const formContainer = document.getElementById('formContainer');
            formContainer.innerHTML = ''; // Clear the form container

            const formTitle = document.createElement('h2');
            formTitle.textContent = `Edit ${Utils.getPageTitle(this.endpoint)}`;
            formContainer.appendChild(formTitle);

            const form = DynamicHtml.createForm('editForm', this.schema, this.updateDataEntry.bind(this, item));
            formContainer.appendChild(form);
            this.fillFormWithData(form, item);

            const cancelButton = document.createElement('button');
            cancelButton.classList.add('button', 'cancel-button');

            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', () => {
                formContainer.innerHTML = ''; // Clear the form container
            });
            form.appendChild(cancelButton);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async updateDataEntry(item, event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        try {
            await DataController.updateData(this.endpoint, item.id, data);

            // Reset the form inputs
            form.reset();

            // Fetch the updated data and regenerate the list
            await this.updateDataAndList();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    fillFormWithData(form, data) {
        for (const prop in this.schema) {
            if (Object.prototype.hasOwnProperty.call(this.schema, prop)) {
                const input = form.querySelector(`#${prop}`);
                if (input) {
                    input.value = data[prop] || '';
                }
            }
        }
    }
}



class DataController {
    static async fetchData(endpoint) {
        try {
            const response = await fetch(`http://localhost:3000/${endpoint}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from ${endpoint}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static async addData(endpoint, data) {
        try {
            const response = await fetch(`http://localhost:3000/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Failed to add data to ${endpoint}`);
            }
            return response;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static async deleteData(endpoint, itemId) {
        try {
            const response = await fetch(`http://localhost:3000/${endpoint}/${itemId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Failed to delete entry from ${endpoint}`);
            }
            return response;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static async updateData(endpoint, itemId, data) {
        try {
            const response = await fetch(`http://localhost:3000/${endpoint}/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Failed to update entry in ${endpoint}`);
            }
            return response;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

class App {
    static initialize(schema, endpoint) {
        const postsController = new CrudController(schema, endpoint);
        Page.generateCrudUserInterface(endpoint, schema, postsController);
        postsController.updateDataAndList();
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const actorSchema = Schema.new({
        name: 'actorName',
        type: 'typeName',
    });

    const requirementsSchema = Schema.new({
        name: 'requirementText',
        type: 'requirementType',
    });

    const acceptanceCriteria = Schema.new({
        name: 'acceptanceCriteriaText',
        type: 'acceptanceCriteriaType',
    });

    App.initialize(actorSchema, 'actors');
    App.initialize(requirementsSchema, 'requirements');
    App.initialize(acceptanceCriteria, 'acceptanceCriteria');


});