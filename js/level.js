define(function() {

    function Level(levelConfiguration, board) {
        this.number = levelConfiguration.levelNumber;
        this.squaresToFill = board.numberChangeableSquares();
        this.movements = [];
        this.pinSelected = false;
        this.images = levelConfiguration.imagesFilesNames;
        this.board = board;
        this.filledSquares = function() {
            return this.board.numberFilledSquares();
        };
    }

    return {
        createLevel: function(levelConfiguration, board) {
            return new Level(levelConfiguration, board);
        }
    }
});
