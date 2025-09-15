const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    const { itemId, businessId } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: itemId,
            quantity: 1,
        }],
        mode: 'payment',
        success_url: 'https://www.uniquitysolutions.com/thankyou.html',
        cancel_url: 'https://www.uniquitysolutions.com/',
        metadata: {
            business_id: businessId, // Include business_id here
        },
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ id: session.id }),
    };
};
