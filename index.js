const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
// const stripe = require('stripe')(process.env.STRIPE_SECRET);


const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.smfjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// datas

async function run() {
	try {
		await client.connect();
		console.log('Connected to database.');


		// collections
		const database = client.db("travelo");
		const placesCollection = database.collection('places');
		// const ordersCollection = database.collection('orders');
		const usersCollection = database.collection('users');
		const reviewsCollection = database.collection('reviews');
		// const likedCollection = database.collection('liked');


		// all cars
		app.get('/places', async (req, res) => {
			console.log(req.query);
			const cursor = placesCollection.find({});
			const page = req.query.page;
			const count = await cursor.count();

			const size =  parseInt(req.query.size);
			let place;
			if(page){
				place = await cursor.skip(page * size).limit(size).toArray();
			}
			else{
				place = await cursor.toArray();
			}
			res.send({count,place});
		})

		app.get('/users', async (req, res) => {
			const cursor = usersCollection.find({});
			const user = await cursor.toArray();
			res.send(user);
		})


		// all cars
		app.get('/orders', async (req, res) => {
			const cursor = ordersCollection.find({});
			const orders = await cursor.toArray();
			res.send(orders);
		})


		// get order

		app.get('/myorders', async(req, res) =>{			
			const email = req.query.email;
			const query = {email:email}
			const cursor = ordersCollection.find(query);
			const order = await cursor.toArray();
			res.send(order);
		})


		app.get('/eusers', async(req, res) =>{			
			const email = req.query.email;
			const query = {email:email}
			const cursor = usersCollection.find(query);
			const user = await cursor.toArray();
			res.send(user);
		})


		app.get('/reviews', async(req, res) =>{
			const cursor = reviewsCollection.find({});
			const review = await cursor.toArray();
			res.send(review);
		})

		app.get('/orders/:id', async(req, res)=>{
			const id = req.params.id;
			const query = {_id:ObjectId(id)};
			const result = await ordersCollection.findOne(query);
			res.json(result);
		})

		// get user info
		// app.get('/users', async(req, res) => {
		// 	const email = req.query.email;
		// 	const query = {email:email}
		// 	const cursor = usersCollection.find(query);
		// 	const user = await cursor.toArray();
		// 	res.send(user);
		// })

		app.get('/places/:id', async(req, res) =>{
			const id = req.params.id;
			console.log(id);
			const query = {_id: ObjectId(id)};
			const items = await placesCollection.findOne(query);
			res.json(items);
		})

		// post car/add car
		app.post('/cars', async(req, res) =>{
			const car = req.body;
			const result = await carsCollection.insertOne(car);
			res.json(result);
		})

		// post order
		app.post('/orders', async(req, res) =>{
			const order = req.body;
			const result = await ordersCollection.insertOne(order);
			res.json(result);
		})

		// post like
		app.post('/liked', async(req, res) =>{
			const order = req.body;
			const result = await ordersCollection.insertOne(order);
			res.json(result);
		})

		// post user
		app.post('/users', async(req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			console.log(result)
			res.json(result);
		})

		// post api(review)
		app.post('/reviews', async(req, res) =>{
			const review = req.body;
			const result = await reviewsCollection.insertOne(review);
			res.json(result);
		})

		app.post('/user/admin', async (req, res)=>{
			const user = req.body;
			const filter = {email: user.email};
			const updateDoc = {$set:{role:'admin'}};
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.json(result)
		})

		// delete car
		app.delete('/cars/:id', async(req, res) =>{
			const id = req.params.id;
			console.log('id',id)
			const query = {_id: ObjectId(id)};
			const result = await ordersCollection.deleteOne(query);
			res.json(result);
		})

		// update after payment
		app.put('/cars/:id', async (req, res)=>{
			const id = req.params.id;
			const payment = req.body;
			const filter = {_id:ObjectId(id)};
			const updateDoc = {
				$set:{
					payment:payment
				}
			};

			const result = await carsCollection.updateOne(filter, updateDoc);
			res.json(result);
		})

		// app.post('/create-payment-intent', async(req, res) =>{
		// 	const paymentInfo = req.body;
		// 	const amount = paymentInfo.price * 100;
		// 	const paymentIntent = await stripe.paymentIntents.create({
		// 		currency: 'usd',
		// 		amount : amount,
		// 		payment_method_types:['card']
		// 	});
		// 	res.json({clientSecret:paymentIntent.client_secret})
		// })

	}

	finally {

	}
}


run().catch(console.dir);


app.get('/', (req, res) => {
	res.send('Running Travelo website server');
});

app.listen(port, () => {
	console.log('Running Travelo Server on port', port);
})