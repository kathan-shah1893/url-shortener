const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
  .then(() => console.log("Mongodb connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process with failure
  });

app.use(express.json());

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // Ensure the updated document is returned
    );

    if (entry) {
      res.redirect(entry.redirectURL);
    } else {
      res.status(404).send("Short URL not found");
    }
  } catch (error) {
    console.error("Error finding and updating URL:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
