import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// import getBoats from '@salesforce/apex/BoatDataService.getBoats';

// imports
export default class BoatSearch extends NavigationMixin(LightningElement) {
    // @api boatTypeId = '';
    isLoading = false;

    // Handles loading event
    handleLoading() { 
        this.isLoading = true;    
    }

    // Handles done loading event
    handleDoneLoading() {
        this.isLoading = false;
    }

    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        console.log('inside the parent after selection...');
        let boatTypeId = event.detail.boatTypeId;
        this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId);
    }

    createNewBoat() {
        console.log('clicked New Boat');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new',
            },
        });
    }
}