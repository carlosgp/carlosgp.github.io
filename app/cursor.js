/**
 * Painting cursor.
 */
class Cursor
{
  /**
   * Renders the cursor.
   * @param {Object} eContext - DOM Node where the cursor will be rendered.
   */
  static Render(eContext)
  {
    if (typeof eContext === 'undefined')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_MAIN_CONTAINER);
    if (typeof this.eCursor === 'object')
      this.eCursor.remove();
    this.eCursor = document.createElement('div');
    this.eCursor.className = 'cursor';
    eContext.appendChild(this.eCursor);
    this.Show();
  }

  /**
   * Updates the cursor position and display mode.
   * @param {Object} eContext - DOM Node where the cursor is rendered.
   * @param {number} nX - The X coordinate where the cursor will be displayed.
   * @param {number} nY - The Y coordinate where the cursor will be displayed.
   * @param {string} sMode - The painting mode to be displayed as the current cursor.
   */
  static Update(eContext, nX, nY, sMode)
  {
    if (eContext.classList.contains('idle'))
      return;
    if (typeof this.eCursor !== 'object')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_CURSOR);
    var oCoordsContext = eContext.getBoundingClientRect();
    this.eCursor.style.left = (nX - oCoordsContext.left) + 'px';
    this.eCursor.style.top = (nY - oCoordsContext.top) + 'px';
    this.eCursor.className = 'cursor cursor-' + sMode;
    this.Show();
  }

  /**
   * Displays the cursor.
   */
  static Show()
  {
    this.eCursor.style.display = 'block';
  }

  /**
   * Hides the cursor.
   */
  static Hide()
  {
    this.eCursor.style.display = 'none';
  }
}