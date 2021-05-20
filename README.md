# redis-order-manager

This is a simple order manager in node js, express and with redis.

### How to run this project

1. Download and extract the code zip file.
2. Open a command prompt or git bash inside the code folder.
3. Run `npm install` to install all the dependencies.
4. Make sure Redis is running at your system and configurations are correct.
5. Run `npm start`.
6. Voila!

### Apis
Tip: Postman will be good to test apis efficiently. :)

#### `/order` - post
Post request to add order with order object in body .
Order Object Example: 
```
{
	"price": 15,
	"side": "sell"
}
```

#### `/order/:price` - get
Get request to get value of specific order. Replace `:price` with a price.

Example Request:
`/order/15`

---

