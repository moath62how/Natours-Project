import axios from 'axios';

import { showAlert } from './alert.js';

const stripe = Stripe(
  'pk_test_51OgFKmFBenoio41Wp2QYnkJvamgE2rTtmoDwsOsvkQkM5nUHNW7t0QIk6NFcxaGU4REH8ZDq0hDYWq0SM3FWBXN900tSEhQmBO',
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}
        `,
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
