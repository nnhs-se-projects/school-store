# School Store App

# Description

The School Store App is a website that allows students to order school supplies online and schedule a time to pick the supplies up. Our group has so far created an order system, a way to add and remove items for sale, a on website spreadsheet for the quantity of inventory, and different web pages for each one of these items. Students buying items works the same way any online store works. When they place their order, they will receive an email form the school store email bot, and the volunteers will get the order on the orders page, along with information of when the student will be coming. 

# Start

make sure to run "npm install nodemailer" in the terminal
your .env file needs to have 4 things in it
1. The MONGO_URI
2. the SESSION_SECRET
3. the EMAIL_PASSWORD
4. the GOOGLE_CLIENT_ID
our project currently has two separate google client ID's, one for the live server, and one for local host.

# Running the Project

To run the project open up the Run & Debug button on the left side of VS Code and then run the node server, and node client and a window should appear with the site. All of the links on the head bar should work and send you to their specific page. Make sure that you are on port 8080 as port 8087 is for the live server.

# Description of the Project’s Architecture

We have split up our route files into 5 different ones, they are disorganized but all work.
Router.js: GET routes for the homepage and admin pages
Cart.js: All cart and order handling; cart adding and updating, order placing
Inventory.js: Most inventory management
Size.js: two routes for adding and deleting sizes
Auth.js: google auth route

We have 3 roles for users that determine their clearance number: student, volunteer, and admin. A student is allowed to order items, a volunteer can check off orders in the manage inventory page, and the admins can add new items and adjust the inventory. 

We have the following functions for our security middleware: isVolunteer, isAdmin, and isStudent. They each do exactly what they say and check to see if the user opening the file is a volunteer, admin, or student account. It is important to call these functions on pages that are only meant for certain levels of clearance. 

We use a MongoDB database to store all of the information on our items and orders. 

# What to start working on/Known issues

The inventory list is currently just a table on the website itself, making it so that you can export it to an external spreadsheet for printing and sharing would be good for the admins.
Our trello is quite disorganized as well.
Fix bugs with the inventory not updating when orders are placed

# Backlog User Stories


1. As an admin, I want to be able to update the list of volunteers so that new home and school volunteers can fulfill orders

2. As an admin, I want to assign blockout dates to weekends and days off school so that no orders can be picked up when school is not in session

3. As an admin, I want to be sent an email when new orders are placed so that I know what items to fulfill

4. As an admin I would like to be able to track long-term trends about when people most want to buy our merchandise so that we can better plan for future years.

5. As an admin I want there to be a spreadsheet for both the orders and the supplies so that I can easily keep stock

Have fun coding!
