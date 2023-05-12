const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
var _ = require("lodash");
// const date = require(__dirname + "/date.js");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin_rafeeq:7tMjhoAKlFIEWXoR@cluster0.71tpzhd.mongodb.net/todolistDB"
);

const itemsSchema = {
  name: String,
};
const Items = mongoose.model("item", itemsSchema);

const item1 = new Items({
  name: "Welcome to Your ToDo List...!",
});
const item2 = new Items({
  name: "Hit the + Button to add New Item.",
});
const item3 = new Items({
  name: "New",
});

const defaultArray = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = new mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Items.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Items.insertMany(defaultArray, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("succesfully added");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);

  const item = new Items({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Items.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        } else {
          console.log(err);
        }
      }
    );
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //Create a new List
        const list = new List({
          name: customListName,
          items: defaultArray,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show an exisiting List
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started Succesfully");
});
