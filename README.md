BAXUS Chrome Extension
Overview
The BAXUS Chrome Extension allows users to automatically compare whisky and wine
bottle prices across several e-commerce websites and the BAXUS marketplace.
When visiting supported websites, the extension scrapes bottle information, sends it to the backend for matching, 
and displays price comparisons with potential savings — offering users alternative and potentially better deals on BAXUS.

video link:
https://www.loom.com/share/8f153ab4ec194dc39ec3f49aa2d3c13b?sid=d5b00f33-82d8-4956-ba84-c9a8695ee45b

Installation Instructions
Clone or download this repository:
git clone https://github.com/clemzyumoh/Baxus-Extension.git

Navigate to the baxus-frontend folder:
cd baxus-extension/baxus-frontend

Load the extension into Chrome:
Go to chrome://extensions
Enable Developer mode
Click Load unpacked
Select the baxus-frontend folder

Navigate to the baxus-backend folder and install dependencies:
cd ../baxus-backend
npm install

Start the backend server:
npm run build


Supported Websites
The extension currently supports scraping and price comparison on:

casker.com

spiritedgift.com

astorwines.com

flaviar.com

baxus.com


Project Structure
baxus-frontend/
Contains the Chrome extension code, including:

manifest.json: Defines extension permissions, background scripts, content scripts, and popup settings.

popup.jsx: Main popup interface showing price comparisons.

background.js: Handles communication between content scripts and backend, and stores results.

content.js: Scrapes product data from supported sites and sends it to the background script.


baxus-backend/
Contains the Express.js server that:

Receives scraped data from the frontend.

Matches products using a fuzzy matching algorithm.

Sends back matched BAXUS product data and savings.
Backend makes the process alot faster.I included .env file which contains mongodb url for easy access when file is downloaded.

The frontend and backend communicate via API calls — the frontend sends scraped data to the backend, which queries MongoDB for matches and returns comparison results.


Matching Algorithm
The backend uses a two-layered approach:

Left-word filtering: It ensures the first 2–3 words of the scraped name match the beginning of BAXUS product names.

Fuse.js fuzzy matching: It performs approximate text matching to handle minor differences in product naming, typos, or formatting variations.

This approach balances speed and accuracy while minimizing incorrect matches.



API Integration
BAXUS API Usage
The backend originally fetched product data from the BAXUS API, limited to ~20 items per request. To improve performance and scalability, the data is now stored in a MongoDB database, regularly synchronized from the BAXUS API.

Error Handling
The backend checks for missing or malformed data, handles network errors gracefully, and ensures that invalid requests do not break the system.

Rate Limits
As API calls are now made to the local MongoDB cache, rate limits on the BAXUS API are effectively avoided, ensuring smooth performance.



Browser Permissions and Manifest
The manifest.json declares:

Host permissions for supported websites.

Background and content scripts.

The popup interface.

Storage access for caching results.

Permissions are kept minimal to ensure user security and compliance with Chrome Web Store policies.



Privacy and Data Handling
The extension does not collect or transmit any personally identifiable information (PII). 
Only scraped product data (name, price, image, description) is sent to the backend for price matching. 
All processing occurs locally or on the backend server, and no user browsing data is stored or shared.

Summary
This extension simplifies the price-checking process for whisky and wine enthusiasts by automatically
comparing third-party listings with BAXUS offerings. It uses a lightweight, privacy-conscious design,
ensures fast performance via local caching, and provides a clean user interface to maximize value and user experience.

