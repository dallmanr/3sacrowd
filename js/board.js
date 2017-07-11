define(["js/properties", "js/sound", "js/squareImages"], function(properties, sound, squareImages) {

    function Board() {
        this.squares = [];
    }

    Board.prototype.addRow = function(row) {
        this.squares.push(row);
    }

    Board.prototype.numberChangeableSquares = function() {
        var count = 0;
        this.squares.forEach(function(row) {
            row.forEach(function(square) {
                if(square.changeable) { ++count; }
            });
        });
        return count;
    };

    Board.prototype.numberFilledSquares = function() {
        var count = 0;
        this.squares.forEach(function(row) {
            row.forEach(function(square) {
                if((square.changeable) && (square.currentImage !== properties.EMPTY)) { ++count; }
            });
        });
        return count;
    };

    Board.prototype.createElement = function() {
        function createBoardElement() {
            var boardElement = document.createElement("div");
            boardElement.className = "board";
            return boardElement;
        }

        function createRowElement() {
            var rowElement = document.createElement("div");
            rowElement.className = "row";
            return rowElement;
        }

        function createSquareElement(square) {
            function createSquareImageElement(square) {
                var squareImageElement = document.createElement("img");
                squareImageElement.className = "squareImage";
                squareImageElement.id = square.generateImageId();
                squareImageElement.src = squareImages.generateImagePath(square.currentImage);
                squareImageElement.style.border = "solid transparent";
                return squareImageElement;
            }

            var squareElement = document.createElement("div");
            squareElement.className = "square";
            squareElement.appendChild(createSquareImageElement(square));
            return squareElement;
        }

        var boardElement = createBoardElement();
        boardElement.addEventListener("click", this.clicked);

        this.squares.forEach(function(row) {
            var rowElement = createRowElement();
            boardElement.appendChild(rowElement);
            row.forEach(function(square) {
                var squareElement = createSquareElement(square);
                rowElement.appendChild(squareElement);
            });
        });
        return boardElement;
    };

    Board.prototype.clicked = function(event) {
      if (level !== null) {
        if (level.filledSquares() < level.squaresToFill) {
            if (event.target.className == "squareImage") {
                if(level.pinSelected) {
                    level.board.pinSquare(event.target.id);
                } else {
                    level.board.turnImage(event.target.id);
                }
            }
        }
      }
    };

    Board.prototype.pinSquare = function(squareId) {
        var squarePosition = squareImages.getPosition(squareId);
        let clickedSquare = level.board.squares[squarePosition[0]][squarePosition[1]];
        if(clickedSquare.pinned) {
            clickedSquare.unpin();
        } else {
            clickedSquare.pin();
        }
    };

    Board.prototype.validImage = function(imageValue, position) {

        return !threeEquasValuesAdjacentAnywhere();

        function threeEquasValuesAdjacentAnywhere() {
            return(
                    threeEqualValuesAdjacentVertically(imageValue, position) ||
                    threeEqualValuesAdjacentHorizontally(imageValue, position) ||
                    threeEqualValuesAdjacentDiagonally1(imageValue, position) ||
                    threeEqualValuesAdjacentDiagonally2(imageValue, position)
                    );
        }

        function threeEqualValuesAdjacentVertically() {
            return threeEqualValuesAdjacent([-1, 0], [1, 0]);
        }

        function threeEqualValuesAdjacentHorizontally() {
            return threeEqualValuesAdjacent([0, -1], [0, 1]);
        }

        function threeEqualValuesAdjacentDiagonally1() {
            return threeEqualValuesAdjacent([-1, -1], [1, 1]);
        }

        function threeEqualValuesAdjacentDiagonally2() {
            return threeEqualValuesAdjacent([-1, 1], [1, -1]);
        }

        function threeEqualValuesAdjacent(offsetDirection1, offsetDirection2) {
            let firstAdjacentDirection1ContainsValue = validPositionAndContainsValue([position[0]+offsetDirection1[0], position[1]+offsetDirection1[1]]);
            let secondAdjacentDirection1ContainsValue = validPositionAndContainsValue([position[0]+(offsetDirection1[0]*2), position[1]+(offsetDirection1[1]*2)]);
            let firstAdjacentDirection2ContainsValue = validPositionAndContainsValue([position[0]+offsetDirection2[0], position[1]+offsetDirection2[1]]);
            let secondAdjacentDirection2ContainsValue = validPositionAndContainsValue([position[0]+(offsetDirection2[0]*2), position[1]+(offsetDirection2[1]*2)]);
            return threeValuesAdjacent(firstAdjacentDirection1ContainsValue, secondAdjacentDirection1ContainsValue, firstAdjacentDirection2ContainsValue, secondAdjacentDirection2ContainsValue);
        }

        function validPositionAndContainsValue(checkedPosition) {
            return validPosition(checkedPosition) && (squareImages.imageValuesEquivalent(imageValue, adjacentImageValue(checkedPosition)));
        }

        function adjacentImageValue(checkedPosition) {
            return level.board.squares[checkedPosition[0]][checkedPosition[1]].currentImage;
        }

        function validPosition(checkedPosition) {
            return (
                    (checkedPosition[0] >= 0) &&
                    (checkedPosition[1] >= 0) &&
                    (checkedPosition[0] <= level.board.squares.length-1) &&
                    (checkedPosition[1] <= level.board.squares[0].length-1)
                    );
        }

        function threeValuesAdjacent(firstAdjacentDirection1ContainsValue, secondAdjacentDirection1ContainsValue, firstAdjacentDirection2ContainsValue, secondAdjacentDirection2ContainsValue) {
            return (
                    (firstAdjacentDirection1ContainsValue && secondAdjacentDirection1ContainsValue) ||
                    (firstAdjacentDirection2ContainsValue && secondAdjacentDirection2ContainsValue) ||
                    (firstAdjacentDirection1ContainsValue && firstAdjacentDirection2ContainsValue)
                    );
        }
    };

    Board.prototype.turnImage = function(squareId) {
        var squarePosition = squareImages.getPosition(squareId);
        let clickedSquare = this.squares[squarePosition[0]][squarePosition[1]];
        var initialImage = clickedSquare.currentImage;
        if((!clickedSquare.pinned) && (clickedSquare.changeable)) {
            let imageBeingChecked = squareImages.nextImage(clickedSquare.currentImage);
            let validImageFound = false;
            while(!validImageFound) {
                if ((imageBeingChecked == properties.EMPTY) || (this.validImage(imageBeingChecked, squarePosition))) {
                    clickedSquare.change(imageBeingChecked);
                    validImageFound = true;
                    if (imageBeingChecked != properties.EMPTY) { level.movements.push(squarePosition); }
                    if (level.filledSquares() == level.squaresToFill) {
                        document.getElementById("headerImage").src = properties.COMPLETED_FULL_PATH;
                        sound.play(sound.COMPLETED);
                    }
                } else {
                    imageBeingChecked = squareImages.nextImage(imageBeingChecked);
                }
            }
        } else {
            sound.play(sound.FORBIDDEN);
        }
    };

    return {
        createEmptyBoard: function() {
            return new Board();
        }
    }
});
