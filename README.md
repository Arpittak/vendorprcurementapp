Vendor Procurement App
This document provides instructions on how to get the Vendor Procurement App up and running on your local machine.

Backend Setup (Server)
Follow these steps to get the backend server running:

Navigate to the server directory: 

cd server

Install dependencies:


npm install
npx playwright install

Run the server with nodemon: nodemon server.js

This will start the server and automatically restart it when you make changes to the code.


Frontend Setup (Client)
Follow these steps to get the frontend application running:

Navigate to the client directory:

cd client

Install dependencies:

npm install

Run the frontend development server:

npm run dev


all done now to test 
open new terminal 
cd server
node test-pdf-load.js 
note:make sure you have data in your procurement try to change vendor id in it also