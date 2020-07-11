import { LightningElement, wire, track } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

// imports
// import getBoatTypes from the BoatDataService => getBoatTypes method';
export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';

    // Private
    error = undefined;

    // Needs explicit track due to nested data
    @track searchOptions;

    // Wire a custom Apex method
    @wire(getBoatTypes)
    boatTypes({ error, data }) {
        if (data) {
            console.log('BoatTypes:::', data);
            this.searchOptions = data.map(type => {
                return {label: type.Name, value: type.Id};
            });
            console.log(this.searchOptions);
            this.searchOptions.unshift({ label: 'All Types', value: '' });

            this.selectedBoatTypeId = this.searchOptions[0].value;
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }

    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        console.log('new selected value...');
        // Create the const searchEvent
        // searchEvent must be the new custom event search
        this.selectedBoatTypeId = event.target.value;
        const searchEvent = new CustomEvent('search', {
            detail: {boatTypeId: this.selectedBoatTypeId}
        });
        // searchEvent;
        this.dispatchEvent(searchEvent);
    }
}