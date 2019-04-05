import { Component, Input, HostBinding } from '@angular/core';
import { NumericConfig } from '@app/shared';
import { ApiService } from '@app/api';
import { TileManagement } from '../home.component';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

/**
 * A component for numeric tiles
 */
@Component({
  selector: 'app-numeric-tile',
  templateUrl: './numerictile.component.html',
  styleUrls: ['./numerictile.component.scss']
})
export class NumericTileComponent implements TileManagement {
  /**
   * Title string of the tile
   */
  title: string;
  /**
   * Short description of the tile
   */
  description: string;
  /**
   * Identifier of the tile
   */
  name: string;

  /**
   * The actual numeric value to display
   */
  numericValue: number;

  /**
   * A helper field for the automatic size updates
   * This is needed to manually trigger the sizing algorithm
   */
  compression = 1;

  /**
   * Color of the numbers
   */
  color = 'rgb(59, 69, 84)';

  /**
   * Outer class binding
   * This is needed, so that the component HTML element itself can recieve CSS classes
   */
  @HostBinding('class')
  class = 'tile';

  /**
   * Outer CSS binding for the tile size in the CSS grid
   */
  @HostBinding('style.grid-area')
  gridArea: SafeStyle;

  /**
   * Tile configuration
   */
  numericConfig: NumericConfig = null;

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer) {}

  /**
   * Initializes the tile based on the configuration object
   * @param {NumericConfig} numericConfig The tile configuration
   */
  initConfig(numericConfig: NumericConfig) {
    // Sets the basic fields
    this.numericConfig = numericConfig;
    this.title = numericConfig.title;
    this.name = numericConfig.name;
    this.description = numericConfig.description;

    // Insert a custom style rule for tile size in the CSS grid
    // For numeric tiles this size can't be changed, it is 3x1
    this.gridArea = this.sanitizer.bypassSecurityTrustStyle('span 3 / span 1');

    // Set the color
    if (numericConfig.color) {
      this.color = 'rgb(' + numericConfig.color.join(',') + ')';
    }
  }

  /**
   * Update the tile data and display it
   */
  updateSelf() {
    this.apiService.tilesData(this.name).subscribe(value => {
      // Only update the compression if the value and the number of digits changed
      if ((this.numericValue === undefined && value !== undefined)
      || (this.numericValue !== value && this.numDigits(this.numericValue) !== this.numDigits(value))) {
        this.numericValue = value;
        this.changeCompression();
      } else {
        this.numericValue = value;
      }
      console.log('Tile data updated...');
    });
  }

  /**
   * Manually trigger the sizing change
   * The sizing change is handled by an external library, but for some reason it doesn't detect the changes to the value
   * To get around this, we can manually trigger the algorithm by changing another custom parameter, compression
   * This is a bit of a hack, since we actually want compression to be exactly 1
   * So we change it back and forth between 1 and 1.01
   */
  changeCompression() {
    if (this.compression === 1) {
      this.compression = 1.01;
    } else {
      this.compression = 1;
    }
  }

  /**
   * Get the number of digits in a number
   * @param {number} number Number to get the number of digits in
   * @returns {number} The number of digits in the number
   */
  numDigits(number: number) {
    // TSLint doesn't like bitwise operation but this one is safe
    return (Math.log10((number ^ (number >> 31)) - (number >> 31)) | 0) + 1;
  }
}
