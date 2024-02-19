const express = require("express");
const router = express.Router();
const Post = require("./models/Post");
const io = require("./socket");

router.post("/", async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
    });
    await newPost.save();
    io.emit("new-post", newPost);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
