import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const TOAST_TITLE = 'Review Created!';
const TOAST_SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
    // Private
    boatId;
    rating;

    // Public Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() {
        return this.boatId;
    }

    set recordId(value) {
        //sets boatId attribute
        //sets boatId assignment
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    // Gets user rating input from stars component
    handleRatingChanged(event) {
        this.rating = event.detail.rating;
        console.log('updated rating:::', this.rating);
    }

    // Custom submission handler to properly set Rating
    // This function must prevent the anchor element from navigating to a URL.
    // form to be submitted: lightning-record-edit-form
    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Boat__c = this.boatId;
        fields.Rating__c = this.rating;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    // Shows a toast message once form is submitted successfully
    // Dispatches event when a review is created
    handleSuccess() {
        // TODO: dispatch the custom event and show the success message
        const createReviewEvent = new CustomEvent('createreview');
        this.dispatchEvent(createReviewEvent);
        this.dispatchEvent(
            new ShowToastEvent({
                title: TOAST_TITLE,
                message: 'Ship It!',
                variant: TOAST_SUCCESS_VARIANT
            })
        );
        this.handleReset();
    }

    // Clears form data upon submission
    // TODO: it must reset each lightning-input-field
    handleReset() {
        this.template.querySelectorAll('lightning-input-field').forEach(each => {
            each.reset();
        });
    }
}