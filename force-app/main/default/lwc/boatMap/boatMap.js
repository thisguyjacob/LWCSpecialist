import { LightningElement, api, wire } from 'lwc';
import { subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getBoatLocation from '@salesforce/apex/BoatDataService.getBoatLocation';
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
    // private
    subscription = null;
    @api boatId;
    boatRecord;

    // Getter and Setter to allow for logic to run on recordId change
    // this getter must be public
    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
        // return refreshApex(this.boatRecord);
    }

    //public
    error = undefined;
    mapMarkers = [];

    // Initialize messageContext for Message Service
    @wire(MessageContext)
    messageContext;

    // Getting record's location to construct map markers using recordId
    // Wire the getRecord method using ('$boatId')
    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wiredRecord({ error, data }) {
        // Error handling
        if (data) {
            this.boatRecord = data;
            this.error = undefined;
            const longitude = data.fields.Geolocation__Longitude__s.value;
            const latitude = data.fields.Geolocation__Latitude__s.value;
            this.updateMap(longitude, latitude);
        } else if (error) {
            this.error = error;
            this.boatId = undefined;
            this.mapMarkers = [];
        }
    }

    // Runs when component is connected, subscribes to BoatMC
    connectedCallback() {
        // recordId is populated on Record Pages, and this component
        // should not update when this component is on a record page.
        if (this.subscription || this.recordId) {
            return;
        }
        // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
        this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
    }

    handleMessage(message) {
        // this.boatId = message.recordId;
        this.recordId = message.recordId;
        this.getBoatLocation();
        // return refreshApex(this.boatRecord);
    }

    // Creates the map markers array with the current boat's location for the map.
    updateMap(longitude, latitude) {
        // this.mapMarkers = [longitude, latitude];
        this.mapMarkers = [{
            location: {
                Latitude: latitude,
                Longitude: longitude
            }
        }];
    }

    // Getter method for displaying the map component, or a helper method.
    get showMap() {
        return this.mapMarkers.length > 0;
    }

    getBoatLocation() {
        getBoatLocation({ boatId: this.boatId })
            .then((result) => {
                this.boatRecord = result;
                this.error = undefined;
                const longitude = result.Geolocation__Longitude__s;
                const latitude = result.Geolocation__Latitude__s;
                this.updateMap(longitude, latitude);
            })
            .catch((error) => {
                this.error = error;
                this.boatRecord = undefined;
            });
    }
}