/**
 * Painting canvas.
 */
class Canvas
{
  /**
   * @constructor
   * @param {Object} eContext - DOM Node where the canvas will be rendered.
   * @param {number} [nWidth=8] - The canvas width in pixel cells. Defaults to 8.
   * @param {number} [nHeight=8] - The canvas height in pixel cells. Defaults to 8.
   * @returns {Object} The Canvas object.
   */
  constructor(eContext, nWidth, nHeight)
  {
    this.eContext = eContext;
    this.nWidth = nWidth || 8;
    this.nHeight = nHeight || 8;
    this.SetCanvas(); // Builds the canvas content (pixel cells grid) for the first time.

    if (!!Canvas.instance)
      return Canvas.instance;
    Canvas.instance = this;
    return this;
  }

  /**
   * The current canvas width in pixel cells.
   */
  get width()
  {
    return this.nWidth || 8;
  }

  /**
   * The current canvas height in pixel cells.
   */
  get height()
  {
    return this.nHeight || 'FFFFFF';
  }

  /**
   * The current painting state.
   */
  get painting()
  {
    return this.bPainting;
  }

  /**
   * Sets the canvas content using the currently configured canvas size.
   * New content is set to white, while existing content is unmodified.
   */
  SetCanvas()
  {
    if (!Array.isArray(this.aaCanvas)) // If the canvas is empty, define it.
      this.aaCanvas = new Array(this.nHeight);
    else // If the canvas is already defined, update its size.
      this.aaCanvas.length = this.nHeight;
    for (let nY = 0; nY < this.nHeight; nY++)
    {
      if (!Array.isArray(this.aaCanvas[nY])) // If the current canvas row empty, define it.
        this.aaCanvas[nY] = new Array(this.nWidth);
      else // If the currnet canvas row is already defined, update its size.
        this.aaCanvas[nY].length = this.nWidth;
      // Set all undefined pixel cells as white (keep any previous painting that fits in the new canvas size).
      for (let nX = 0; nX < this.nWidth; nX++)
      {
        if (typeof this.aaCanvas[nY][nX] === 'undefined')
          this.aaCanvas[nY][nX] = 'FFFFFF';
      }
    }
  }

  /**
   * Renders the canvas.
   */
  Render()
  {
    if (typeof this.eContext === 'undefined')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_MAIN_CONTAINER);
    this.eCanvas = document.createElement('div');
    this.eCanvas.id = 'canvas';
    this.RenderContent(); // Render the canvas content.
    this.eContext.appendChild(this.eCanvas);
  }

  /**
   * Renders the canvas content (the pixel cells grid).
   */
  RenderContent()
  {
    this.eCanvas.className = 'width-' + this.nWidth + ' height-' + this.nHeight;
    for (let nRow = 0; nRow < this.aaCanvas.length; nRow++)
    {
      for (let nCol = 0; nCol < this.aaCanvas[nRow].length; nCol++)
        this.RenderPixel(nCol, nRow);
    }
  }

  /**
   * Renders the pixel cell represented by the given X and Y coordinates.
   * @param {number} nX - The X coordinate where the pixel cell will be rendered.
   * @param {number} nY - The Y coordinate where the pixel cell will be rendered.
   */
  RenderPixel(nX, nY)
  {
    var ePixel = document.createElement('div');
    ePixel.setAttribute('x', nX);
    ePixel.setAttribute('y', nY);
    var nWidth = 100 / this.nWidth;
    var nHeight = 100 / this.nHeight;
    /*ePixel.style.width = nWidth + '%';
    ePixel.style.height = nHeight + '%';
    ePixel.style.left = (nWidth * nX) + '%';
    ePixel.style.top = (nHeight * nY) + '%';*/
    this.SetPixel(nX, nY, ePixel);
    if (typeof this.eCanvas === 'undefined')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_CANVAS);
    this.eCanvas.appendChild(ePixel);
  }

  /**
   * Sets the colour of the pixel cell located at the given X and Y coordinates.
   * @param {number} nX - The X coordinate where the pixel cell is located.
   * @param {number} nY - The Y coordinate where the pixel cell is located.
   * @param {number} [ePixel] - The DOM Node representing the pixel. If not defined, the DOM Node is retrieved using the X and Y coordinates.
   */
  SetPixel(nX, nY, ePixel)
  {
    ePixel = ePixel || this.eCanvas.querySelector('div[x="' + nX + '"][y="' + nY + '"]');
    if (typeof ePixel !== 'object')
      return Logger.Print(Logger.TYPE.WARN, Logger.CODE.INVALID_PIXEL);
    ePixel.style.backgroundColor = '#' + this.aaCanvas[nY][nX];
  }

  /**
   * Resizes the canvas based on a given width and height.
   * @param {number} nWidth - The width in pixel cells to which the canvas will be resized.
   * @param {number} nHeight - The height in pixel cells to which the canvas will be resized.
   */
  Resize(nWidth, nHeight)
  {
    this.nWidth = nWidth;
    this.nHeight = nHeight;
    this.SetCanvas();
    if (typeof this.eCanvas === 'undefined')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_CANVAS);
    this.eCanvas.innerHTML = '';
    this.RenderContent();
  }

  /**
   * Starts painting (enables the painting state).
   */
  PaintStart()
  {
    this.bPainting = true;
  }

  /**
   * Ends painting (disables the painting state).
   */
  PaintEnd()
  {
    this.bPainting = false;
  }

  /**
   * Paints the pixel cell located at the given X and Y coordinates.
   * @param {number} nX - The X coordinate where the pixel cell is located.
   * @param {number} nY - The Y coordinate where the pixel cell is located.
   * @param {string} sColour - Colour used for painting the pixel cell.
   * @param {boolean} [bFill] - True if the painting mode is "fill" (paint bucket tool), which extends the painting action to matching neighbour pixel cells.
   * @param {string} [sPrevColour] - Previous colour of the pixel cell before painting (the pixel cell original colour). Required for the "fill" mode.
   */
  Paint(nX, nY, sColour, bFill, sPrevColour)
  {
    /**
     * Applies a painting on neighbour pixel cells of the given axis.
     * @param {Object} oArgs
     * @param {number} oArgs.nX - The X coordinate where the pixel cell is located.
     * @param {number} oArgs.nY - The Y coordinate where the pixel cell is located.
     * @param {number} [oArgs.nAxisX] - If set to anything different from zero/null/undefined, the neighbours will be searched in the X axis. Required if nAxisY is not defined.
     * @param {number} [oArgs.nAxisY] - If set to anything different from zero/null/undefined, the neighbours will be searched in the Y axis. Required if nAxisX is not defined.
     * @param {string} oArgs.sColour - Colour used for painting the pixel cell.
     * @param {string} oArgs.sPrevColour - Previous colour of the pixel cell before painting (the pixel cell original colour).
     */
    function ColourFill(oArgs)
    {
      if (typeof oArgs === 'object')
      {
        for (let nOffset = -1; nOffset <= 1; nOffset += 2)
        {
          var nX = oArgs.nX + (nOffset * !!oArgs.nAxisX);
          var nY = oArgs.nY + (nOffset * !!oArgs.nAxisY);
          if (Array.isArray(this.aaCanvas[nY]) && this.aaCanvas[nY][nX] === oArgs.sPrevColour)
            this.Paint(nX, nY, oArgs.sColour, true, oArgs.sPrevColour);
        }
      }
    }

    if (typeof this.aaCanvas[nY][nX] !== 'string')
      return Logger.Print(Logger.TYPE.WARN, Logger.CODE.INVALID_PIXEL);
    sPrevColour = sPrevColour || this.aaCanvas[nY][nX];
    if (this.aaCanvas[nY][nX] !== sColour)
    {
      this.aaCanvas[nY][nX] = sColour;
      this.SetPixel(nX, nY);
      if (bFill)
      {
        ColourFill.call(this, { nX: nX, nY: nY, nAxisX: 1, sColour: sColour, sPrevColour: sPrevColour });
        ColourFill.call(this, { nX: nX, nY: nY, nAxisY: 1, sColour: sColour, sPrevColour: sPrevColour });
      }
    }
  }

  /**
   * Returns the colour of the pixel cell located at the given X and Y coordinates.
   * @param {number} nX - The X coordinate where the pixel cell is located.
   * @param {number} nY - The Y coordinate where the pixel cell is located.
   * @returns {string} The colour picked from the pixel cell.
   */
  PickColour(nX, nY)
  {
    return this.aaCanvas[nY][nX];
  }
}