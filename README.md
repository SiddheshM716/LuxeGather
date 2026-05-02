# LuxeGather

LuxeGather is a premium event booking and architecture platform.

## Environment Variables Setup

To run this project locally, you will need to set up environment variables for both the **server** and the **client**. 
Please make sure **NOT** to commit your actual `.env` files. They are included in `.gitignore`.

### 1. Server Setup (`server/.env`)
Create a `.env` file in the `server` directory and add the following keys:

```env
# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration (for payment processing)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# MongoDB Database URI (MongoDB Atlas)
MONGO_URI=mongodb+srv://siddheshm716_db_user:<your_database_password>@cluster0.anedskk.mongodb.net/luxegather?appName=Cluster0
# PORT=5001
```

### 2. Client Setup (`client/.env`)
Create a `.env` file in the `client` directory and add the following keys:

```env
# Razorpay Client-side Key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Backend API URL (optional, defaults to local API)
# VITE_API_URL=http://localhost:5001/api
```

## Running the Project

1. Install dependencies at the root level, `client`, and `server`.
2. Run `npm run dev` from the root directory to start both the Vite client and the Express backend.
