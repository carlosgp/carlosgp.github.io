/**
 * Application options.
 */
class Options
{
  static GRID_SIZES = [8, 12, 16, 32] // Available grid sizes.

  static FILE_EXTENSIONS = ['jpg', 'png', 'gif'] // Available file extensions.

  /**
   * Renders the options buttons.
   * @param {Object} eContext - DOM Node where the options will be rendered.
   */
  static Render(eContext)
  {
    /**
     * Renders the resize options buttons.
     * @param {Object} eContextOption - DOM Node where the options will be rendered.
     */
    function RenderOptionResize(eContextOption)
    {
      eContextOption.querySelectorAll('.size-button').forEach(eContextOption.removeChild.bind(eContextOption)); // Remove any previously rendered option.

      for (let nIdxOptionResize = Options.GRID_SIZES.length - 1; nIdxOptionResize >= 0; nIdxOptionResize--)
      {
        var nSize = Options.GRID_SIZES[nIdxOptionResize];
        var eOptionResize = document.createElement('div'); // Create the resize option button for the current grid size.
        eOptionResize.className = 'size-button';
        eOptionResize.setAttribute('size', nSize);
        eOptionResize.setAttribute('title', 'Size ' + nSize + 'x' + nSize);
        var eOptionTable = document.createElement('table'); // Create the table-icon representing the grid resolution.
        for (let nIdxRow = 0; nIdxRow < nIdxOptionResize + 2; nIdxRow++)
        {
          var eOptionTableRow = document.createElement('tr');
          for (let nIdxCol = 0; nIdxCol < nIdxOptionResize + 2; nIdxCol++)
            eOptionTableRow.appendChild(document.createElement('td'));
          eOptionTable.appendChild(eOptionTableRow);
        }
        eOptionResize.appendChild(eOptionTable);
        eContextOption.appendChild(eOptionResize);
      }
    }

    /**
     * Renders the download option button and dropdown list.
     * @param {Object} eContextOption - DOM Node where the option and dropdown list will be rendered.
     */
    function RenderOptionDownload(eContextOption)
    {
      var eOptionDownload = document.getElementById('download-button');
      if (eOptionDownload !== null)
        eOptionDownload.remove(); // Remove any previously rendered option.
      var eListDownload = document.getElementById('download-options');
      if (eListDownload !== null)
        eListDownload.remove(); // Remove any previously rendered option.

      eOptionDownload = document.createElement('div'); // Create the download option button.
      eOptionDownload.id = 'download-button';
      eOptionDownload.textContent = 'Download as...';
      eContextOption.appendChild(eOptionDownload);

      eListDownload = document.createElement('ul'); // Create the file extension dropdown list.
      eListDownload.id = 'download-options';
      for (let nIdxOptionDownload = 0; nIdxOptionDownload < Options.FILE_EXTENSIONS.length; nIdxOptionDownload++)
      {
        var sExtension = Options.FILE_EXTENSIONS[nIdxOptionDownload];
        var eListItemDownload = document.createElement('li'); // Create the dropdown list item for the current file extension.
        var eListItemLinkDownload = document.createElement('a');
        eListItemLinkDownload.className = 'download-option';
        eListItemLinkDownload.setAttribute('ext', sExtension);
        eListItemLinkDownload.setAttribute('href', '#');
        eListItemLinkDownload.textContent = sExtension.toUpperCase();
        eListItemDownload.appendChild(eListItemLinkDownload);
        eListDownload.appendChild(eListItemDownload);
      }
      eContextOption.appendChild(eListDownload);
    }

    RenderOptionDownload(eContext);
    RenderOptionResize(eContext);
  }

  /**
   * Downloads the current canvas in the selected file format.
   * @param {Object} eLink - DOM Node (anchor element) representing the selected download option.
   * @param {Object} oCanvas - The canvas object to download.
   */
  static Download(eLink, oCanvas)
  {
    /**
     * Translates a colour represented as a string in hexadecimal notation into and array of numbers in RGBA decimal notation.
     * @param {string} sHex - String representing a colour in hexadecimal notation using the RGB cubic-coordinate system.
     * @returns {Object[]} Array of 4 numbers representing the red, green, blue and alfa channels of the given colour, respectively.
     */
    function HexToRGBA(sHex)
    {
      if (typeof sHex === 'string')
      {
        var aHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sHex); // Extract the 3 colour channels in hexadecimal notation.
        if (aHex.length === 4)
          return [ parseInt(aHex[1], 16), parseInt(aHex[2], 16), parseInt(aHex[3], 16), 255]; // Transform from hexadecimal to decimal and add a 255 alpha channel value.
      }
      return [255, 255, 255, 255];
    }

    var eCanvas = document.createElement('canvas'); // Create a canvas element.
    eCanvas.width = oCanvas.nWidth;
    eCanvas.height = oCanvas.nHeight;
    var oContextCanvas = eCanvas.getContext('2d'); // Get the canvas context.
    var oImgDataCanvas = oContextCanvas.createImageData(oCanvas.width, oCanvas.height); // Create an image data to store each pixel's data.
    var nIdxImgData = 0;
    for (let nRow = 0; nRow < oCanvas.aaCanvas.length; nRow++) // Loop through the pixel cell grid.
    {
      for (let nCol = 0; nCol < oCanvas.aaCanvas[nRow].length; nCol++)
      {
        var aRGBA = HexToRGBA(oCanvas.aaCanvas[nRow][nCol]); // Transform the pixel cell colour to the RGBA array required by the canvas image data [R, G, B, A].
        for (let nIdxRGBA = 0; nIdxRGBA < aRGBA.length; nIdxRGBA++)
          oImgDataCanvas.data[nIdxImgData++] = aRGBA[nIdxRGBA]; // Append each colour channel to the canvas image data.
      }
    }
    oContextCanvas.putImageData(oImgDataCanvas, 0, 0); // Apply the image data to the canvas element.
    
    var sFileExtension = eLink.getAttribute('ext'); // Retrieve the selected file extension.
    var sDataURL = eCanvas.toDataURL('image/' + sFileExtension); // Retrieve the canvas Data URL.
    sDataURL = sDataURL.replace(/^data:image\/[^;]*/, 'data:application/octet-stream'); // Force the browser's download promp.
    eLink.download = 'pixelart.' + sFileExtension; // Set the default filename.
    eLink.href = sDataURL; // Trigger the download.
  }
}