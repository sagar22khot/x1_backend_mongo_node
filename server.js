const express = require("express");

const app = express();

// app.get("/api/signup", (req, res) => {
//   res.json({
//     data: "you hit signup endpoint",
//   });
// });

// import routes
const authRoutes = require("./routes/auth");

// middleware
app.use('/api', authRoutes);

const port = process.env.port || 8000;

app.listen(port, () => {
  console.log(`Api is running on port ${port}`);
});
