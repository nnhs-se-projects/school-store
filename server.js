/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// import the http module, which provides an HTTP server
const http = require("http");

// Import the path module
const path = require("path");
// import the express module, which exports the express function
const express = require("express");

// invoke the express function to create an Express application
const app = express();

// add middleware to handle JSON in HTTP request bodies (used with
//  POST commands)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// load environment variables from the .env file into process.env
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// connect to the database
const connectDB = require("./server/database/connection");
connectDB();

// import the express-session module, which is used to manage sessions
const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// app.post("/upload", upload.single("file"), (req, res) => {
// 	// check whether req.file contains the file
// 	// if not multer is failed to parse so notify the client
// 	if (!req.file) {
// 		res.status(413).send(`File not uploaded!, Please
// 							attach jpeg file under 5 MB`);
// 		return;
// 	}
// 	// successfull completion
// 	res.status(201).send("Files uploaded successfully");
// });

// set the template engine to EJS, which generates HTML with embedded
//  JavaScript
app.set("view engine", "ejs");

// load assets
app.use("/css", express.static("assets/css"));
app.use("/img", express.static("assets/img"));
app.use("/js", express.static("assets/js"));

// app.use takes a function that is added to the chain of a request.
//  When we call next(), it goes to the next function in the chain.
app.use((req, res, next) => {
  // if the student is not already logged in, redirect all requests to the
  //  authentication page
  if (req.session.clearance === undefined) {
    req.session.clearance = 0;
  }

  // if (req.session.email === undefined && !req.path.startsWith("/auth")) {
  //   res.redirect("/auth/");
  //   return;
  // }

  next();
});

// create the HTTP server
const server = http.createServer(app);

// attaches session data to every route
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.locals.session = req.session;
  }
  next();
});

// to keep this file manageable, we will move the routes to a separate file
//  the exported router object is an example of middleware
app.use("/", require("./server/routes/router"));
app.use("/auth", require("./server/routes/auth"));
app.use(require("./server/routes/cart"));
app.use(require("./server/routes/inventory"));

app.use("/size", require("./server/routes/size"));

// Serve the bundled files from the "dist" directory
app.use("/dist", express.static(path.join(__dirname, "dist")));

// Serve other static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// start the server
const PORT = process.env.PORT || 8087;
server.listen(PORT, () => {
  console.log("Server started on http://localhost:" + PORT);
});
