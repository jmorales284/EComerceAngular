import Stripe from 'stripe';
import dotenv from 'dotenv';
import Product from '../models/product.models.js';

dotenv.config();

const stripe = new Stripe('sk_test_51NULwtFsdqrJgkQwgWNMefogdDxE9H7kF4mcnbo0iQ3bA5BhVhBNdtHQQz7NREFsdKQz73jtWJuQVFhzoARma6Kj00X3xvaDRy');

// Controller to open the Stripe payment link
const openStripePaymentLink = async (
	carts,
	totalPrice,
	userID,
	shippingAddress
  ) => {
	const url =
	  process.env.NODE_ENV === "production"
		? process.env.PROD_URL
		: process.env.DEV_URL;
  
	const products = [];
	// Obtaining the products of the cart items
	for (const cart of carts) {
	  const product = await Product.findByPk(cart.productID);
	  if (!product) {
		return res.status(404).json({ message: "Product not found" });
	  }
  
	  products.push({
		price_data: {
		  currency: "usd",
		  product_data: {
			name: product.productName,
			description: product.description,
		  },
		  unit_amount: Math.round(product.price * 100),
		},
		quantity: cart.quantity,
	  });
	}
  
	try {
	  const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: products,
		mode: "payment",
		success_url: `https://koajstoreapi.onrender.com/api/payment/success?userID=${userID}&totalPrice=${totalPrice}&shippingAddress=${shippingAddress}`,
		cancel_url: `https://koajstoreapi.onrender.com/api/payment/cancel`,
	  });
  
	  if (!session) {
		return { success: false, error: "Error creating the payment link" };
	  }
  
	  return { success: true, url: session.url };
	} catch (error) {
	  console.log(error);
	  return { success: false, error: "Error creating the payment link" };
	}
  };
  
  export { openStripePaymentLink };
  