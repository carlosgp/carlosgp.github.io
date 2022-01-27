/**
 * Painting palette.
 */
class Palette
{
  /**
   * @constructor
   * @param {Object} eContext - DOM Node where the palette will be rendered.
   * @returns {Object} The Palette object.
   */
  constructor(eContext)
  {
    this.eContext = eContext;
    this.aaPalette =
    [
      ['00FFFF', '0080FF', '0000FF'],
      ['00FF80', 'FFFFFF', '000000', '8000FF'],
      ['00FF00', Palette.MODE.BRUSH, Palette.MODE.EYEDROPPER, Palette.MODE.BUCKET, 'FF00FF'],
      ['80FF00', 'AAAAAA', '555555', 'FF0080'],
      ['FFFF00', 'FF8000', 'FF0000']
    ];
    this.sMode = Palette.MODE.BRUSH;
    this.sPrevMode = this.sMode;
    this.sColour = '000000';
    this.nSizeItem = 36;

    if (!!Palette.instance)
      return Palette.instance;
    Palette.instance = this;
    return this;
  }

  static MODE =
  {
    BRUSH: 'brush',
    BUCKET: 'bucket',
    EYEDROPPER: 'eyedropper'
  }

  /**
   * Gets the current palette mode.
   */
  get mode()
  {
    return this.sMode || 'FFFFFF';
  }

  /**
   * Gets the current palette colour.
   */
  get colour()
  {
    return this.sColour || 'FFFFFF';
  }

  /**
   * Sets the current palette colour.
   * @param {string} sColour - The colour to set as the current palette colour.
   */
  set colour(sColour)
  {
    this.sColour = sColour || 'FFFFFF';
  }

  /**
   * Renders the palette.
   */
  Render()
  {
    if (typeof this.eContext === 'undefined')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_MAIN_CONTAINER);
    if (typeof this.ePalette === 'object')
      this.ePalette.remove();
    this.ePalette = document.createElement('div');
    this.ePalette.className = 'palette';
    this.RenderContent();
    this.eContext.appendChild(this.ePalette);
  }

  /**
   * Renders the palette content (the palette colour items and tools).
   */
  RenderContent()
  {
    this.ePalette.innerHTML = '';
    for (let nIdxRow = 0; nIdxRow < this.aaPalette.length; nIdxRow++)
    {
      var aRowPalette = this.aaPalette[nIdxRow];
      var eRowPalette = document.createElement('div');
      eRowPalette.className = 'palette-row';
      eRowPalette.style.height = (this.nSizeItem - (this.nSizeItem / 6)) + 'px';
      for (let nIdxCol = 0; nIdxCol < aRowPalette.length; nIdxCol++)
      {
        var sItemPalette = aRowPalette[nIdxCol];
        var eItemPalette = document.createElement('div');
        if (sItemPalette === Palette.MODE.BRUSH || sItemPalette === Palette.MODE.BUCKET || sItemPalette === Palette.MODE.EYEDROPPER)
        {
          eItemPalette.className = 'palette-option palette-' + sItemPalette;
          eItemPalette.style.backgroundColor = '#FFFFFF';
          eItemPalette.setAttribute('mode', sItemPalette);
        }
        else
        {
          eItemPalette.className = 'palette-item';
          eItemPalette.style.backgroundColor = '#' + sItemPalette;
          eItemPalette.setAttribute('idx', nIdxRow + '-' + nIdxCol);
        }
        if (this.sMode === sItemPalette || this.sColour === sItemPalette)
          eItemPalette.classList.add('selected');
        eRowPalette.appendChild(eItemPalette);
        eItemPalette.style.width = this.nSizeItem + 'px';
        eItemPalette.style.height = this.nSizeItem + 'px';
      }
      this.ePalette.appendChild(eRowPalette);
    }

    this.RegisterEvents();
  }

  /**
   * Displays the palette at the given X and Y coordinates.
   * @param {number} nX - The X coordinate where the palette will be displayed.
   * @param {number} nY - The Y coordinate where the palette will be displayed.
   */
  Show(nX, nY)
  {
    this.RenderContent();
    this.ePalette.style.display = 'block';
    var oCoordsPalette = this.ePalette.getBoundingClientRect();
    this.ePalette.style.left = (nX - (oCoordsPalette.width / 2)) + 'px';
    this.ePalette.style.top = (nY - (oCoordsPalette.height / 2)) + 'px';
  }

  /**
   * Hides the palette.
   */
  Hide()
  {
    this.ePalette.style.display = 'none';
  }

  /**
   * Reverts the current palette mode back to the previous palette mode.
   */
  RevertMode()
  {
    this.sMode = this.sPrevMode;
  }

  /**
   * Registers the event listeners.
   */
  RegisterEvents()
  {
    if (typeof this.ePalette === 'object')
    {
      this.ePalette.querySelectorAll('.palette-item, .palette-option').forEach(function (eItemPalette)
      {
        eItemPalette.addEventListener('mousedown', function (event)
        {
          var eItemPalette = event.target;
          if (event.button === 0) // Left mouse button.
          {
            if (eItemPalette.classList.contains('palette-item')) // Palette Item (colour).
            {
              var sIdx = eItemPalette.getAttribute('idx');
              if (typeof sIdx === 'string')
              {
                var aIdx = sIdx.split('-'); // Retrieve the palette item coordinates [Row, Column].
                if (aIdx.length === 2)
                {
                  var aRowColour = this.aaPalette[aIdx[0]];
                  if (Array.isArray(aRowColour))
                  {
                    var sItemPalette = aRowColour[aIdx[1]];
                    if (typeof sItemPalette === 'string')
                    {
                      this.sColour = sItemPalette;
                      return;
                    }
                  }
                }
              }
            }
            else if (eItemPalette.classList.contains('palette-option')) // Palette Option (mode).
            {
              this.sPrevMode = this.sMode;
              this.sMode = eItemPalette.getAttribute('mode');
              return;
            }
          }
          return Logger.Print(Logger.TYPE.WARN, Logger.CODE.INVALID_COLOUR);
        }.bind(this));
      }, this);
    }
  }
}