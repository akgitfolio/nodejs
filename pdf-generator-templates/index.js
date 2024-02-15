const express = require("express");
const fileUpload = require("express-fileupload");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/generate-pdf", async (req, res) => {
  const { recipes, title, author } = req.body;
  const images = req.files?.images;

  if (!recipes || !title || !author || !images) {
    return res.status(400).send("Missing required fields");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader(
    "Content-disposition",
    'attachment; filename="recipe-book.pdf"'
  );
  res.setHeader("Content-type", "application/pdf");

  doc.pipe(res);

  doc.fontSize(25).text(title, { align: "center" });
  doc.fontSize(20).text(author, { align: "center" });
  doc.moveDown();

  const imagesArray = Array.isArray(images) ? images : [images];

  recipes.forEach((recipe, index) => {
    if (imagesArray[index]) {
      const imagePath = path.join(
        __dirname,
        "uploads",
        imagesArray[index].name
      );
      fs.writeFileSync(imagePath, imagesArray[index].data);
      doc.addPage().image(imagePath, { fit: [500, 300], align: "center" });
    }
    doc.fontSize(20).text(recipe.title, { bold: true });
    doc.fontSize(14).text("Ingredients:");
    doc.fontSize(12).text(recipe.ingredients);
    doc.fontSize(14).text("Instructions:");
    doc.fontSize(12).text(recipe.instructions);
    doc.moveDown();
  });

  doc.end();
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
