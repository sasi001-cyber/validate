

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const csvtojson = require("csvtojson");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://venkateshsasi12:vJ8OkCPtw2moThbd@fee.kftd7.mongodb.net/?retryWrites=true&w=majority&appName=Fee"
  )
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

app.use(express.static("public"));
app.set("view engine", "ejs");

const studentSchema = mongoose.Schema({
  REF_NO: { type: String, required: true },
  NAME: { type: String, required: true },
  ROOM_NO: { type: String, required: true },
  FEES: { type: String, required: true },
  img: { type: String, required: true },
});

const Student = mongoose.model("Student", studentSchema);

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname ); // Store uploaded files in a dedicated uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const excelUploads = multer({ storage: excelStorage });

app.get("/", (req, res) => {
  res.render("welcome");
});

app.post("/", (req, res) => {
  res.render("welcome");
});

app.post("/c", (req, res) => {
  res.render("index");
});

// Upload excel file and import into MongoDB
app.post(
  "/uploadExcelFile",
  excelUploads.single("uploadfile"),
  async (req, res) => {
    try {
      const filePath = path.join(__dirname, req.file.filename);
      const data = await csvtojson().fromFile(filePath);

      const studentsToInsert = data.map((row) => ({
        REF_NO: row["REF_NO"],
        NAME: row["NAME"],
        ROOM_NO: row["ROOM_NO"],
        FEES: row["FEES"],
        img: row["img"],
      }));

      await Student.insertMany(studentsToInsert);
      res.render("success");
    } catch (err) {
      console.error("Error importing file:", err);
      res.status(500).send("Error importing file");
    }
  }
);

app.post("/post", async (req, res) => {
  try {
    const REF_NO = req.body.search;
    const data = await Student.find({ REF_NO });
    res.render("post", { data });
  } catch (err) {
    console.error("Error searching for student:", err);
    res.status(500).send("Error searching for student");
  }
});

app.post("/delete", async (req, res) => {
  try {
    await Student.deleteMany({});
    res.render("delete");
  } catch (err) {
    console.error("Error deleting students:", err);
    res.status(500).send("Error deleting students");
  }
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});