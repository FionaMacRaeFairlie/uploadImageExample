const path = require("path");
const fs = require("fs");
const { readdirSync } = require("fs");
const express = require("express");
const multer = require("multer");

const app = express();

const PORT = process.env.PORT || 3000;

const mustache = require("mustache-express");
app.engine("mustache", mustache());
app.set("view engine", "mustache");

const public = path.join(__dirname, "public");
app.use(express.static(public));
app.use(
  "/icons",
  express.static(path.join(__dirname, "node_modules/bootstrap-icons/font/"))
);
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
const imageDirPath = path.join(__dirname, "./public/images");

const upload = multer({
  dest: path.join(__dirname, "./temp"),
  // you might also want to set some limits to help avoid DoS attacks
});

app.get("/", express.static(path.join(__dirname, "./public")));

app.get("/images", function (req, res) {
  let files = readdirSync(imageDirPath);
  res.render("images", {
    images: files,
  });
});

app.post(
  "/upload",
  upload.single("file" /* name attribute of <file> element in the form */),
  (req, res) => {
    const tempPath = req.file.path;
    const filename = req.file.originalname;
    const targetPath = path.join(__dirname, "./public/images/" + filename);
    if (path.extname(filename).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, (err) => {
        if (err) return handleError(err, res);
        res.status(200).render("layout", {
          image: filename,
        });
      });
    } else {
      fs.unlink(tempPath, (err) => {
        if (err) return handleError(err, res);
        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }
  }
);

app.use(function (req, res) {
  res.status(404);
  res.type("text/plain");
  res.send("404 Not found.");
});

app.use(function (err, req, res, next) {
  res.status(500);
  res.type("text/plain");
  res.send("Internal Server Error.");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
