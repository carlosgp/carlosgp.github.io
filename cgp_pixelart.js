/**
 * Pixel drawing application.
 */
class CGPPixelArt
{
  /**
   * @constructor
   */
  constructor()
  {
    this.eContext = document.getElementsByTagName('main')[0];
    if (typeof this.eContext === 'undefined')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_MAIN_CONTAINER);

    this.oCanvas = new Canvas(this.eContext);
    this.oPalette = new Palette(this.eContext);
  }

  /**
   * Loads all the application required modules.
   * @param {string[]} aFilenames - List of module names to load.
   * @param {Function} fCallback - Function to execute after all modules have been loaded.
   */
  static LoadModules(aFilenames, fCallback)
  {
    function LoadModule(aFilenames, fOnLoadCallback)
    {
      var eScript = document.createElement('script');
      var sFilename = aFilenames.shift(); // Retrieve the next filename from the list.
      eScript.src = 'app/' + sFilename + '.js';
      eScript.onload = function ()
      {
        Logger.Print(Logger.TYPE.INFO, Logger.CODE.MODULE_LOADED, sFilename);
        if (aFilenames.length === 0) // All files have been loaded.
        {
          Logger.Print(Logger.TYPE.INFO, Logger.CODE.APP_RUN);
          fOnLoadCallback();
        }
        else // Load the next file.
          LoadModule(aFilenames, fOnLoadCallback);
      };
      document.head.appendChild(eScript);
    }

    LoadModule(aFilenames, fCallback); // Start loading the first file.
  }

  /**
   * Runs the application.
   */
  Run()
  {
    this.oCanvas.Render();
    this.oPalette.Render();
    Cursor.Render(this.eContext);
    var eHeader = document.getElementsByTagName('header')[0];
    if (typeof eHeader === 'undefined')
      return Logger.Print(Logger.TYPE.ERROR, Logger.CODE.MISSING_HEADER_CONTAINER);
    Options.Render(eHeader);
    this.IntroGuide(); // Show the intro guide dialog.
    this.RegisterEvents();
  }

  /**
   * Shows the intro guide dialog.
   */
  IntroGuide()
  {
    /**
     * Builds the intro guide dialog mouse image.
     */
    function BuildMouse()
    {
      /**
       * Adds the left and right mouse buttons to the mouse image.
       */
      function AddMouseButton(eContainer, sSide)
      {
        var eMouseButton = document.createElement('div');
        eMouseButton.className = 'guide-mouse-' + sSide + ' guide-mouse-' + sSide + '-hint';
        eContainer.append(eMouseButton);
      }

      var eMouseContainer = document.createElement('div');
      eMouseContainer.className = 'guide-mouse';
      AddMouseButton(eMouseContainer, 'left');
      AddMouseButton(eMouseContainer, 'right');
      return eMouseContainer;
    }

    /**
     * Builds the intro guide dialog hints.
     */
    function BuildHint(sSide, sText)
    {
      var eGuideHint = document.createElement('span');
      eGuideHint.className = 'guide-mouse-' + sSide + '-hint';
      eGuideHint.textContent = sText;
      return eGuideHint;
    }

    var eGuideDialog = document.createElement('div'); // Create the intro guide dialog.
    eGuideDialog.appendChild(BuildHint('left', 'PAINT AND INTERACT')); // Create the left mouse button hint.
    eGuideDialog.appendChild(BuildHint('right', 'OPEN PALETTE AND TOOLS')); // Create the right mouse button hint.
    eGuideDialog.appendChild(BuildMouse()); // Create the mouse image.
    
    var eGuideCloseButton = document.createElement('div'); // Create the close button for the intro guide dialog.
    eGuideCloseButton.id = 'guide-button';
    eGuideCloseButton.textContent = 'Understood!';
    eGuideDialog.appendChild(eGuideCloseButton);

    var eGuideLayer = document.createElement('div'); // Create the overlay for the intro guide dialog.
    eGuideLayer.id = 'guide-layer';
    eGuideLayer.appendChild(eGuideDialog);
    document.getElementsByTagName('body')[0].appendChild(eGuideLayer);
  }

  /**
   * Registers the event listeners.
   */
  RegisterEvents()
  {
    // Intro guide dialog button.
    document.getElementById('guide-button').addEventListener('click', function ()
    {
      document.getElementById('guide-layer').remove(); // Close the intro guide dialog.
    });

    // Download button.
    document.getElementById('download-button').addEventListener('click', function ()
    {
      document.getElementById('download-options').style.display = 'block'; // Open the download options dropdown list.
    });

    // Download options.
    document.getElementById('download-options').addEventListener('mouseleave', function ()
    {
      this.style.display = 'none'; // Close the download options dropdown list.
    });

    document.querySelectorAll('.download-option').forEach(function (eOption)
    {
      eOption.addEventListener('click', function (event)
      {
        Options.Download(event.currentTarget, this.oCanvas); // Download the canvas as an image.
      }.bind(this), false);
    }, this);

    // Canvas Size buttons.
    document.querySelectorAll('.size-button').forEach(function (eOption)
    {
      eOption.addEventListener('click', function (event)
      {
        var nSize = parseInt(event.currentTarget.getAttribute('size'), 10);
        if (isNaN(nSize))
          return Logger.Print(Logger.TYPE.WARN, Logger.CODE.INVALID_CANVAS_SIZE);
        this.oCanvas.Resize(nSize, nSize); // Resize the canvas.
      }.bind(this));
    }, this);

    // Canvas interaction.
    this.eContext.addEventListener('mousedown', function (event)
    {
      event.preventDefault();
      if (event.button === 0) // Left mouse button press.
      {
        this.oPalette.Hide();
        var ePixel = event.target;
        if (typeof ePixel === 'object' && ePixel.hasAttribute('x') && ePixel.hasAttribute('y')) // The current target is a valid pixel cell.
        {
          var nX = parseInt(ePixel.getAttribute('x'), 10);
          var nY = parseInt(ePixel.getAttribute('y'), 10);
          if (isNaN(nX) || isNaN(nY))
            return Logger.Print(Logger.TYPE.WARN, Logger.CODE.INVALID_PIXEL);

          this.oPalette.Hide();
          Cursor.Update(this.eContext, event.clientX, event.clientY, this.oPalette.mode); // Update the cursor to reflect the current painting state.

          // Apply the action corresponding to the current painting mode.
          switch (this.oPalette.mode)
          {
            case Palette.MODE.BRUSH: // "Brush" mode: Standard per-pixel painting.
              this.oCanvas.PaintStart();
              this.oCanvas.Paint(nX, nY, this.oPalette.colour);
              break;
            case Palette.MODE.BUCKET: // "Paint Bucket" mode: Paint filling the neighbour colours.
              this.oCanvas.Paint(nX, nY, this.oPalette.colour, true);
              break;
            case Palette.MODE.EYEDROPPER: // "Eyedropper" mode: Pick the colour of the current pixel cell.
              this.oPalette.colour = this.oCanvas.PickColour(nX, nY);
              this.oPalette.RevertMode(); // Switch back to the previous Painting Mode (either "Brush" or "Paint Bucket").
              break;
          }
        }
      }
    }.bind(this));

    this.eContext.addEventListener('mouseup', function ()
    {
      this.eContext.classList.remove('idle'); // Put the working area in idle state.
      this.oCanvas.PaintEnd(); // Stop painting when releasing the mouse button.
    }.bind(this));

    this.eContext.addEventListener('mouseenter', function ()
    {
      Cursor.Show();
    });

    this.eContext.addEventListener('mouseleave', function ()
    {
      this.oCanvas.PaintEnd(); // Stop painting when leaving the working area.
      Cursor.Hide();
    }.bind(this));

    this.eContext.addEventListener('mousemove', function (event)
    {
      Cursor.Update(this.eContext, event.clientX, event.clientY, this.oPalette.mode);
      var ePixel = event.target;
      if (typeof ePixel === 'object' && ePixel.hasAttribute('x') && ePixel.hasAttribute('y')) // The current target is a valid pixel cell.
      {
        ePixel.style.borderColor = '#' + this.oPalette.colour;
        if (this.oCanvas.painting) // If the user is currently performing a paint action in the canvas, proceed with the painting.
        {
          var nX = parseInt(ePixel.getAttribute('x'), 10);
          var nY = parseInt(ePixel.getAttribute('y'), 10);
          if (isNaN(nX) || isNaN(nY))
            return Logger.Print(Logger.TYPE.WARN, Logger.CODE.INVALID_PIXEL);
          this.oCanvas.Paint(nX, nY, this.oPalette.colour); // Paint the current pixel cell with the current palette colour.
        }
      }
    }.bind(this));

    // Palette menu.
    this.eContext.addEventListener('contextmenu', function (event)
    {
      event.preventDefault(); // Disable browser's context menu.
      Cursor.Hide();
      this.eContext.classList.add('idle'); // Make the working area leave the idle state.
      var oCoordsContext = event.currentTarget.getBoundingClientRect();
      this.oPalette.Show(event.clientX - oCoordsContext.left, event.clientY - oCoordsContext.top); // Display the palette menu.
    }.bind(this));
  }
}

// Load the required modules before starting the application.
CGPPixelArt.LoadModules(['logger', 'canvas', 'palette', 'cursor', 'options'], function ()
{
  const oCGPPixelArt = new CGPPixelArt();

  oCGPPixelArt.Run(); // Start the application.
});