/**
 * Application logs.
 */
class Logger
{
  static TYPE =
  {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  };

  static CODE =
  {
    MODULE_LOADED: 'Module successfully loaded.',
    APP_RUN: 'All modules successfully loaded. Running...',
    MISSING_HEADER_CONTAINER: 'The Header container is missing.',
    MISSING_MAIN_CONTAINER: 'The Main container is missing.',
    MISSING_CURSOR: 'The Cursor is missing.',
    MISSING_CANVAS: 'The Canvas is missing.',
    INVALID_CANVAS_SIZE: 'The selected Canvas size is invalid.',
    INVALID_PIXEL: 'The painted Pixel is invalid.',
    INVALID_COLOUR: 'The selected Colour is invalid.',
  };

  /**
   * Prints a log message in the browser console.
   * @param {string} sType - The type of log to print (info, warn, error).
   * @param {string} sCode - The message code to display.
   * @param {string} [sMsg] - An optional text message to display after the message code.
   */
  static Print(sType, sCode, sMsg)
  {
    console[sType](sCode + (typeof sMsg === 'string' ? ' [' + sMsg + ']' : ''));
  }
}