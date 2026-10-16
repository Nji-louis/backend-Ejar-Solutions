require("dotenv").config();

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret Exists:", !!process.env.CLOUDINARY_API_SECRET);

const express = require("express");
const cors = require("cors");


const app = express();

const path = require("path");

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const homepageRoutes = require("./routes/homepageRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const blogRoutes = require("./routes/blogRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const faqRoutes = require("./routes/faqRoutes");
const teamRoutes = require("./routes/teamRoutes");



app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/team", teamRoutes);


app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0",() => {
  console.log(`Server running on ${PORT}`);
});