# School Store App

# Description

The School Store App is a website that allows students to order school supplies online and schedule a time to pick up the supplies. Our group has created these functions so far:

**Volunteer and Admin functions**

- View and change in-person management
- Inventory sheet
- Order viewer (current and previous)

**User functions**

- Placing orders
- Viewing their current and previous orders

**Admin only functions**

- Manage sale items
- Manage pickup times
- Set Admin and Volunteer permissions
- Edit email text for emails that get sent out

# Start

Make sure to run "npm install" in the terminal
Your .env file needs to have 4 things in it, found in trello

1. The MONGO_URI
2. the SESSION_SECRET
3. the EMAIL_PASSWORD (google app password is a 16-character code in a 4x4 format (i.e. \_**\_ \_\_** \_**\_ \_\_**))
4. the GOOGLE_CLIENT_ID
   our project currently has two separate google client ID's, one for the live server and one for localhost.

# External services and platform requirements

- MongoDB
- Google OAUTH
- Node mailer
- Gmail SMTP

# Running the Project

To run the project open up the Run & Debug button on the left side of VS Code and then run the node server, and node client and a window should appear with the site. The website should be running on port 8087. All of the links on the head bar should work and send you to their specific page (some are hidden in for different auth levels, see next section).
Also, developers should contact a current admin (e.g. Mr. Callaghan or Mr. Schmit) to get admin access.

# Description of the Project’s Architecture

We have split up our route files into 5 different ones, they are disorganized but all work.

- [`router.js`](/server/routes/router.js): GET routes for the homepage and admin pages
- [`cart.js`](/server/routes/cart.js): All cart and order handling; cart adding and updating, order placing
- [`inventory.js`](/server/routes/inventory.js): Most inventory management
- [`size.js`](/server/routes/size.js): two routes for adding and deleting sizes
- [`auth.js`](/server/routes/auth.js): google auth route

There are also utility functions in [`/server/utils/`](/server/utils/) that are used in different routes.

We have 3 roles for users that determine their clearance number: student, volunteer, and admin. A student is allowed to order items, a volunteer can check off orders in the manage inventory page, and the admins can add new items and adjust the inventory.

We have the following functions for our security middleware: isVolunteer, isAdmin, and isStudent. They each do exactly what they say and check to see if the user opening the file is a volunteer, admin, or student account. It is important to call these functions on pages that are only meant for certain levels of clearance.

We use a MongoDB database to store all of the information on our items and orders.

# What to Start Working on/Known issues

Refer to stories on Trello.

Have fun coding!
