import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import BOAT_OBJECT from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import { subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    boatId;
    wiredRecord;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };

    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wireRecord({ error, data }) {
        // Error handling
        if (data) {
            this.wiredRecord = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.wiredRecord = undefined;
        }
    }

    @wire(MessageContext)
    messageContext;

    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord ? 'utility:anchor' : null;
    }

    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord, BOAT_NAME_FIELD);
    }

    // Private
    subscription = null;

    // Subscribe to the message channel
    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
    }

    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC();
    }

    handleMessage(message) {
        this.boatId = message.recordId;
    }

    // Navigates to record page
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: BOAT_OBJECT,
                actionName: 'view'
            }
        });
    }

    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated(event) {
        this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}