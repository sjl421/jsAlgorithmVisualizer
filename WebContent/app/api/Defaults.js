/**
 * Created by nitiraj on 18/4/14.
 */
define(["Constants"], function (Constants) {

    var DEFAULT_OPTIONS = {};


    DEFAULT_OPTIONS[Constants.STAGE_CONTAINERDIV] = "containerDiv";
    DEFAULT_OPTIONS[Constants.STAGE_HEIGHT] = 500;
    DEFAULT_OPTIONS[Constants.STAGE_WIDTH] = 500;
    DEFAULT_OPTIONS[Constants.STAGE_COLOR_RED] = 256;
    DEFAULT_OPTIONS[Constants.STAGE_COLOR_BLUE] = 0;
    DEFAULT_OPTIONS[Constants.STAGE_COLOR_GREEN] = 0;
    DEFAULT_OPTIONS[Constants.STAGE_OPACITY] = 1;

    DEFAULT_OPTIONS[Constants.VAR_BOX_LENGTH] = 50;
    DEFAULT_OPTIONS[Constants.STACK_BOX_WIDTH] = 50;
    DEFAULT_OPTIONS[Constants.STACK_BOX_HEIGHT] = 30;
    DEFAULT_OPTIONS[Constants.STACK_BOX_BORDER_COLOR] = "00000";
    DEFAULT_OPTIONS[Constants.STACK_BOX_INIT_COLOR] = "FFFF33";
    DEFAULT_OPTIONS[Constants.STACK_BOX_FINAL_COLOR] = "0066CC";
    DEFAULT_OPTIONS[Constants.STACK_BOX_TEXT_COLOR] = "00000";
    DEFAULT_OPTIONS[Constants.CODE_FONT_SIZE] = 20;
    DEFAULT_OPTIONS[Constants.CODE_COLOR] = 'black';
    DEFAULT_OPTIONS[Constants.CODE_HIGHLIGHT_COLOR] = 'red';
    DEFAULT_OPTIONS[Constants.CODE_HIGHLIGHT_FONT_SIZE] = 24;

    DEFAULT_OPTIONS[Constants.ARROW_FROMX ] = 0;
    DEFAULT_OPTIONS[Constants.ARROW_FROMY ] = 0;
    DEFAULT_OPTIONS[Constants.ARROW_TOX ] = 1;
    DEFAULT_OPTIONS[Constants.ARROW_TOY ] = 1;
    DEFAULT_OPTIONS[Constants.ARROW_HEAD_LENGTH ] = 10;
    DEFAULT_OPTIONS[Constants.ARROW_HEAD_WIDTH ] = 1;
    DEFAULT_OPTIONS[Constants.ARROW_TAIL_COLOR ] = "red";
    DEFAULT_OPTIONS[Constants.ARROW_HEAD_COLOR ] = "blue";
    DEFAULT_OPTIONS[Constants.ARROW_TAIL_WIDTH ] = 1;
    DEFAULT_OPTIONS[Constants.ARROW_HEAD_SOLID ] = true;
    DEFAULT_OPTIONS[Constants.ARROW_TAIL_TEXT ] = "P";
    DEFAULT_OPTIONS[Constants.ARROW_TAIL_TEXT_FONT_SIZE ] = 10;
    DEFAULT_OPTIONS[Constants.ARROW_TAIL_TEXT_COLOR ] = "black";
    DEFAULT_OPTIONS[Constants.ARROW_TAIL_TEXT_FONT ] = "Calibri";
    DEFAULT_OPTIONS[Constants.ARROW_HEAD_HEIGHT] = 2;


    return DEFAULT_OPTIONS;
});