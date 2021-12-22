import { LightningElement, api, track, wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { MessageContext, publish } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true },
]

export default class BoatSearchResults extends LightningElement {
    boatTypeId = '';
    selectedBoatId;
    columns = COLUMNS;
    boats;
    isLoading = false;
    @track draftValues = [];
    wiredResult;

    // wired message context
    @wire(MessageContext)
    messageContext;

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.wiredResult = result;
        const { data, error } = result;
        if (data) {
            this.boats = data;
        } else if (error) {
            this.error = error;
        }
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.boatTypeId = boatTypeId;
        this.refresh();
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        // notifyLoading to trigger the loading spinner
        // invoke refreshApex to refresh a wired property
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.wiredResult);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        const payload = { recordId: boatId };
        publish(this.messageContext, BOATMC, payload);
    }

    // This method must save the changes in the Boat Editor
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        this.draftValues = event.detail.draftValues;
        console.log('draft values:::', this.draftValues);
        console.log('draft values:::', this.draftValues.slice());
        const recordInputs = event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            console.log('draft values fields:::', fields);
            return { fields };
        });
        console.log('record inputs:::', recordInputs);
        const promises = recordInputs.map(recordInput => {
            return updateRecord(recordInput);
        });

        Promise.all(promises)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ship It!',
                        variant: 'success'
                    })
                );
                this.draftValues = [];
                this.refresh();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        if (isLoading) {
            const loadingEvent = new CustomEvent('loading');
            this.dispatchEvent(loadingEvent);
        } else {
            const loadingEvent = new CustomEvent('doneloading');
            this.dispatchEvent(loadingEvent);
        }
    }
}