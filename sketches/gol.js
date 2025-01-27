var grid;

function setup () {
  createCanvas(400, 400);
  grid = new Grid(25);
  grid.draw();
}

function generate () {
  grid.generate($("input").val());
  grid.draw();
}

/* function draw () {
  background(250);

  grid.updateNeighborCounts();
  grid.updatePopulation();
  grid.draw();
} */

function mousePressed() {
  grid.updateNeighborCounts();
  grid.updatePopulation();
  grid.draw();

  // var randomColumn = floor(random(grid.numberOfColumns));
  // var randomRow = floor(random(grid.numberOfRows));

  // var randomCell = grid.cells[randomColumn][randomRow];
  // var neighborCount = grid.getNeighbors(randomCell).length;

  // print("cell at " + randomCell.column + ", " + randomCell.row + " has " + neighborCount + " neighbors");
  // print(neighbors.length || "undefined");
}

class Grid {
  constructor (cellSize) {
    this.cellSize = cellSize;
    this.numberOfColumns = floor(width / this.cellSize);
    this.numberOfRows = floor(height / this.cellSize);

    this.cells = new Array(this.numberOfColumns);
    for (var column = 0; column < this.numberOfColumns; column ++) {
      this.cells[column] = new Array(this.numberOfRows);
    }

    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        this.cells[column][row] = new Cell(column, row, cellSize)
      }
    }
    print(this.cells);
  }

  draw () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        this.cells[column][row].draw();
      }
    }
  }

  generate (tx) {
    var arr = tx.slice(2)
      .match(/(.{1,4})/g)
      .map((chunk) => parseInt(chunk, 16).toString(2).padStart(16, '0'))
      .map((binaryChunk) => binaryChunk.split(''));

    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        console.log(arr[column][row]);
        this.cells[column][row].setIsAlive(parseInt(arr[column][row]));
      }
    }
  }

  updateNeighborCounts () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        var currentCell = this.cells[column][row]
        currentCell.liveNeighborCount = 0;

        var neighborsArray = this.getNeighbors(currentCell);

        for (var position in neighborsArray) {
          if (neighborsArray[position].isAlive) {
            currentCell.liveNeighborCount += 1;
          }
        }
      }
    }
  }

  getNeighbors(currentCell) {
    var neighbors = [];

    for (var columnOffset = -1; columnOffset <= 1; columnOffset++) {
      for (var rowOffset = -1; rowOffset <= 1; rowOffset++) {
        var neighborX = currentCell.column + columnOffset;
        var neighborY = currentCell.row + rowOffset;

        if (this.isValidPosition(neighborX, neighborY)) {
          var neighborCell = this.cells[neighborX][neighborY];

          if (neighborCell != currentCell) {
            neighbors.push(neighborCell);
          }
        }
      }
    }

    return neighbors;
  }

  isValidPosition (column, row) {
    var validColumn = column >= 0 && column < this.numberOfColumns;
    var validRow = row >= 0 && row < this.numberOfRows

    return  validColumn && validRow;
  }

  updatePopulation () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        this.cells[column][row].liveOrDie();
      }
    }
  }
}

class Cell {
  constructor (column, row, size) {
    this.column = column;
    this.row = row;
    this.size = size;
    this.isAlive = false;
    this.liveNeighborCount = 0;
  }

  draw () {
    if (this.isAlive) {
      fill(color(200, 0, 200));
    } else {
      fill(color(240));
    }
    noStroke();
    rect(this.column * this.size + 1, this.row * this.size + 1, this.size - 1, this.size - 1, 5, 5, 5);
  }

  setIsAlive (value) {
    if (value) {
      this.isAlive = true;
    } else {
      this.isAlive = false;
    }
  }

  liveOrDie () {
    if      (this.isAlive && this.liveNeighborCount <  2) this.isAlive = false;   // Loneliness
    else if (this.isAlive && this.liveNeighborCount >  3) this.isAlive = false;   // Overpopulation
    else if (!this.isAlive && this.liveNeighborCount === 3)  this.isAlive = true; // Reproduction
    // otherwise stay the same
  }
}
