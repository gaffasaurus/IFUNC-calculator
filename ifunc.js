const maxPerRow = 4
const addTableButton = document.getElementById("add-table")
const allContent = document.getElementById("content");

const tonesDisplay = {
    'C': 0,
    'C#': 1,
    'Db': 1,
    'D': 2,
    'D#': 3,
    'Eb': 3,
    'E': 4,
    'Fb': 4,
    'E#': 5,
    'F': 5,
    'F#': 6,
    'Gb': 6,
    'G': 7,
    'G#': 8,
    'Ab': 8,
    'A': 9,
    'A#': 10,
    'Bb': 10,
    'B': 11,
    'Cb': 11,
    'B#': 0
};

const tonesLower = {
    'c': 0,
    'c#': 1,
    'db': 1,
    'd': 2,
    'd#': 3,
    'eb': 3,
    'e': 4,
    'fb': 4,
    'e#': 5,
    'f': 5,
    'f#': 6,
    'gb': 6,
    'g': 7,
    'g#': 8,
    'ab': 8,
    'a': 9,
    'a#': 10,
    'bb': 10,
    'b': 11,
    'cb': 11,
    'b#': 0
};


function generateTables() { //TODO: If tables are already drawn and generate is clicked again, delete old tables first
  //delete current tables if they exist
  let previous = [document.getElementById("all-tables"), document.getElementById("catalog-heading"), document.getElementById("catalog-table")];
  for (let element of previous) {
    if (element) {
      element.remove();
    }
  }
  const rows = document.getElementsByClassName("row");
  const allValues = {};
  let errors = [];
  for (let i = 0; i < rows.length; i++) { //length - 1 to get rid of generate button
    for (let j = 0; j < rows[i].children.length; j++) { //loops through input divs, -1 to get rid of add table
      //ignore add table button
      if (rows[i].children[j].id == "add-table") {
        continue;
      }
      let current = rows[i].children[j]
      let textboxes = current.children;
      let collection1 = textboxes[0].value.trim();
      let collection2 = textboxes[1].value.trim();
      if (!validInput(collection1.split(" ")) || !validInput(collection2.split(" "))) {
        errors.push([i+1, j+1]);
        continue;
      }
      if (errors.length > 0) {
        continue;
      } else { //no errors, continue generating
        let values = generateValues(collection1.split(" "), collection2.split(" "))
        let rowCol = "row" + i.toString() + "col" + j.toString();
        allValues[rowCol] = { "col1": collection1.toLowerCase().split(" "), "col2": collection2.toLowerCase().split(" "), "values": [] };
        allValues[rowCol]["values"].push(values);
      }
    }
  }
  if (errors.length > 0) {
    displayError(errors);
    return;
  } else {
    //show reset button
    const resetButton = document.getElementById("reset-div");
    resetButton.style.display = "flex";
    //Data is valid, turn into tables
    const deepClone = JSON.parse(JSON.stringify(allValues)); //drawTables modifies allValues, so we use a clone to maintain the original for drawCatalog
    drawTables(deepClone);
    const separator = document.createElement("h2");
    separator.setAttribute("id", "catalog-heading");
    separator.innerHTML = "Catalog Format:"
    allContent.appendChild(separator);
    drawCatalog(allValues);
  }
}

function drawTables(allValues) {
  //entry format: { col1: "pitches in col1", col2: "pitches in col2", values: [interval values] }
  const allTables = document.createElement("div");
  allTables.setAttribute("class", "all-tables");
  allTables.setAttribute("id", "all-tables");
  //find how many total rows needed for tables using maxPerRow
  let numTRows = Math.ceil(Object.keys(allValues).length / 4);
  const tRows = []
  for (let i = 0; i < numTRows; i++) {
    const newTRow = document.createElement("div");
    newTRow.setAttribute("class", "table-row");
    newTRow.setAttribute("id", "t-row-" + (i+1));
    tRows.push(newTRow);
  }
  let counter = 0;
  for (let key in allValues) {
    let entry = allValues[key];
    let col1 = pitchesToUpper(entry["col1"]);
    let col2 = pitchesToUpper(entry["col2"]);
    let values = entry["values"][0];
    //add left side pitches (col1)
    for (let i = 0; i < values.length; i++) {
      values[i].splice(0, 0, col1[i]);
    }
    col2.splice(0, 0, "") //blank cell in top left corner
    values.splice(0, 0, col2);
    let numRows = values.length;
    let numCols = values[0].length;
    const table = document.createElement("table");
    table.setAttribute("class", "interval-table");
    table.setAttribute("id", Object.keys(allValues)[counter]) //id is rowcolumn, ex. 01 is row 0, column 1
    //set width of each table to the same as the textboxes
    let textboxRect = document.getElementsByClassName("input")[0].getBoundingClientRect();
    table.style.width = textboxRect.width + "px";
    for (let i = 0; i < numRows; i++) {
      let newRow = document.createElement("tr");
      for (let j = 0; j < numCols; j++) {
        let newCell = document.createElement("td");
        newCell.innerHTML = values[i][j]
        newRow.appendChild(newCell);
      }
      table.appendChild(newRow);
    }
    let currentRowNum = Math.floor(counter / 4);
    tRows[currentRowNum].appendChild(table);
    console.log(table)
    counter++;
  }
  for (let i = 0; i < tRows.length; i++) {
    allTables.appendChild(tRows[i]);
  }
  allContent.append(allTables);
}

function drawCatalog(allValues) {
  const catDiv = document.createElement("div");
  catDiv.setAttribute("class", "catalog-div");
  catDiv.setAttribute("id", "catalog-div");
  const catTable = document.createElement("table");
  catTable.setAttribute("class", "catalog-table");
  catTable.setAttribute("id", "catalog-table");
  const count = {};
  //populate count Object
  for (let key in allValues) {
    count[key] = {}
    for (let i = 0; i < 12; i++) {
      count[key][i] = 0;
    }
    let entry = allValues[key];
    let values = entry["values"][0];
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[0].length; j++) {
        count[key][values[i][j]]++;
      }
    }
  }
  console.log(allValues)
  const numRows = Object.keys(allValues).length + 1; //+ 1 for header with nums
  const allRows = []
  const firstRow = document.createElement("tr");
  firstRow.setAttribute("class", "catalog-table-row");
  firstRow.setAttribute("id", "catalog-table-row-0");
  for (let i = -1; i < 12; i++) {
    //empty top left cell
    let newCell = document.createElement("td");
    newCell.setAttribute("class", "catalog-cell");
    if (i == -1) {
      newCell.innerHTML = "";
    } else {
      newCell.innerHTML = i;
    }
    firstRow.appendChild(newCell);
  }
  allRows.push(firstRow)
  let counter = 0;
  for (let table in count) {
    console.log(table);
    let entry = count[table];
    let newRow = document.createElement("tr");
    newRow.setAttribute("class", "catalog-table-row");
    newRow.setAttribute("id", "catalog-table-row-" + (counter + 1));
    for (let j = -1; j < 12; j++) {
      let newCell = document.createElement("td");
      newCell.setAttribute("class", "catalog-cell");
      if (j == -1) {  //add left side labels if first column
        let index = table;
        let col1pitches = pitchesToUpper(allValues[index]['col1']);
        let col2pitches = pitchesToUpper(allValues[index]['col2']);
        newCell.innerHTML = col1pitches.join(" ") + "/" + col2pitches.join(" ");
      } else {
        let value = entry[j];
        newCell.innerHTML = value;
      }
      newRow.appendChild(newCell);
    }
    allRows.push(newRow);
    counter++;
  }
  for (let i = 0; i < allRows.length; i++) {
    catTable.appendChild(allRows[i]);
  }
  allContent.appendChild(catTable);
}

function pitchesToUpper(pitches) {
  const fixed = [];
  for (let i = 0; i < pitches.length; i++) {
    if (pitches[i] == pitches[i].toLowerCase()) {
      if (pitches[i].length > 1) { //if it is a sharp or flat, only capitalize first character
        fixed.push(pitches[i][0].toUpperCase() + pitches[i][1]);
      } else {
        fixed.push(pitches[i].toUpperCase())
      }
    }
  }
  return fixed;
}

function validInput(pitches) {
  for (let i = 0; i < pitches.length; i++) {
    if (!(pitches[i].toLowerCase() in tonesLower)) {
      return false;
    }
  }
  return true;
}

function generateValues(collection1, collection2) {
  let values = []
  for (let i = 0; i < collection1.length; i++) {
    let row = []
    for (let j = 0; j < collection2.length; j++) {
      row.push(mod((tonesLower[collection2[j].toLowerCase()] - tonesLower[collection1[i].toLowerCase()]), 12));
    }
    values.push(row);
  }
  return values;
}

function mod(part, whole) {
  if (part >= 0) {
    return part % whole;
  } else {
    return (part % whole) + whole;
  }
}

function displayError(errors) {
  let msg = "Invalid formatting in the following squares:\n"
  for (let i = 0; i < errors.length; i++) {
    msg += "Row " + errors[i][0] + ", Column " + errors[i][1] + "\n"
  }
  alert(msg);
  return;
}

function addTable() {
  const numRows = document.getElementsByClassName("row").length;
  //see how many rows there are to see how to add another table, subtract generate button
  const currentRow = document.getElementById("row-" + numRows);
  //create new text boxes
  let inputDiv = document.createElement("div");
  inputDiv.setAttribute("class", "input")
  let textbox1 = document.createElement("input");
  let textbox2 = document.createElement("input");
  textbox1.setAttribute("type", "text");
  textbox1.setAttribute("class", "pitch-input");
  textbox1.setAttribute("placeholder", "Input pitches in 1st collection...");
  textbox2.setAttribute("type", "text");
  textbox2.setAttribute("class", "pitch-input");
  textbox2.setAttribute("placeholder", "Input pitches in 2nd collection...");
  inputDiv.appendChild(textbox1)
  inputDiv.appendChild(textbox2)

  //generate button so textboxes can be inserted before it
  let genDiv = document.getElementById("gen-div");

  if (currentRow.children.length - 1 < maxPerRow) {
    currentRow.insertBefore(inputDiv, addTableButton);
  } else {
    //make a new row
    newRow = document.createElement("div");
    newRow.setAttribute("class", "row");
    newRow.setAttribute("id", "row-" + (numRows+1));
    //add textbox to new row
    newRow.appendChild(inputDiv);
    //delete old add Table BUtton
    addTableButton.remove()
    //Place new Add Table BUtton after the newest generated text box
    newRow.appendChild(addTableButton)
    allContent.insertBefore(newRow, genDiv)
  }
}

function reset() {
  location.reload();
  // console.log(allContent.children);
  // for (let child of allContent.children) {
  //   console.log(child)
  //   const keep = ["gen-div", "reset-div", "row-1"];
  //   if (!keep.includes(child.id)) {
  //     child.remove();
  //   }
  // }
  // let row1 = document.getElementById("row-1").children;
  // for (let row of row1) {
  //   console.log(row.id);
  //   if (row.id != "first") {
  //     row.remove();
  //   }
  // }
  // document.getElementById("catalog-heading").remove()
  // const firstTextbox = document.getElementsByClassName("pitch-input");
  // console.log(firstTextbox);
  // for (let box of firstTextbox) {
  //   box.value = "";
  // }
}
