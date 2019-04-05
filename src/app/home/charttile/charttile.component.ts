import { Component, Input, HostBinding, ViewChildren } from '@angular/core';
import { ChartPoint, Chart } from 'chart.js';

import { ChartConfig, ChartFactoryService } from '@app/shared';
import { ApiService } from '@app/api';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { QueryList } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { TileManagement } from '../home.component';

/**
 * A component for chart based tiles
 */
@Component({
  selector: 'app-chart-tile',
  templateUrl: './charttile.component.html',
  styleUrls: ['./charttile.component.scss']
})
export class ChartTileComponent implements TileManagement {
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
   * The Chart object, which is drawn to the canvas
   */
  chart: Chart = null;
  chartAlternate: Chart = null;

  watcher: Subscription;
  activeMediaQuery = '';

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
   * Outer CSS binding for the display mode
   */
  @HostBinding('style.display')
  display: string;

  /**
   * Tile configuration
   */
  chartConfig: ChartConfig = null;

  /**
   * The canvas object to draw on
   * We need the reference for this, so Chart.js can draw on it
   */
  @ViewChildren('canvas')
  canvases: QueryList<any>;

  constructor(
    private chartFactory: ChartFactoryService,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private media: ObservableMedia
  ) {}

  /**
   * Initializes the tile based on the configuration object
   * @param {ChartConfig} chartConfig The tile configuration
   * @param {number} alternate If the tile is an alternate, this specifies the width of the original
   */
  initConfig(chartConfig: ChartConfig, alternate?: number) {
    // Sets the basic fields
    this.chartConfig = chartConfig;
    this.title = chartConfig.title;
    this.name = chartConfig.name;
    this.description = chartConfig.description;

    // Insert a custom style rule for tile size in the CSS grid
    // This is given by the configuration object
    this.gridArea = this.sanitizer.bypassSecurityTrustStyle(
      'span ' + this.chartConfig.height + ' / ' + 'span ' + this.chartConfig.width
    );

    // Calculate the correct responsivity breakpoints
    // This is different for the alternate tiles, since it has to be the exact opposite of their originals
    if (alternate) {
      this.calculateAlternate(alternate);
    } else {
      this.calculateFlex(this.chartConfig.width);
    }

    // Create a chart with Chart.js
    this.chart = this.chartFactory.createChart(this.canvases.first.nativeElement, this.chartConfig);
    console.log(this.name);
    console.log(this.chart);
  }

  /**
   * Update the tile data and reanimate chart
   */
  updateSelf() {
    this.apiService
      .tilesData(this.name)
      .pipe(
        // Map the incoming data into chartpoints
        map<any, ChartPoint[]>((data: any) => {
          // The incoming data is a indexed by its keys, so we transpose it into an array
          const keys = Object.keys(data);
          const returnArray: ChartPoint[] = [];
          // If it is a categorised chart, we must set the label array to the data keys
          if (this.chartConfig.options.axes === 'category') {
            this.chart.data.labels = keys;
          }
          keys.forEach(key => {
            returnArray.push({
              x: key,
              y: data[key]
            });
          });
          return returnArray;
        })
      )
      .subscribe(pointArray => {
        this.updateChartWithAnimation(this.chart, pointArray);
        console.log('Tile data updated...');
      });
  }

  /**
   * Update the chart with new data and animate it into position
   * @param {Chart} chart The Chart to update (why is this a parameter?)
   * @param {ChartPoint[]} pointArray The new datapoints
   */
  updateChartWithAnimation(chart: Chart, pointArray: ChartPoint[]) {
    // There is an unhandled case here, where for example a toplist like chart has the members themselves changed
    // In this case, the labels themselves need updating
    // Furthermore, the animation should also represent this, by taking out one column and replacing it

    // While there aren't any dynamic length charts yet, if one were to exist, there is another unhandled case
    // This is when a subset of the new array matches the old but there are new members as well
    // This subset could also be a subset of the old array, where not all old labels can be found in the new array
    // These cases would have to be solved with matching the old and new labels to each other

    // Another slight problem is that the whole equality checking is a bit overboard here
    // In most charts usually only one or a few values change at once, and only by a very little amount
    // This means that the animation can't even be noticed at all

    // First we perform multiple checks on data equality

    // If the the datasets are not of the same length, they cannot be equal
    // Here we first zero out the object, then reload it with the new data
    if (chart.data.datasets[0].data.length !== pointArray.length) {
      // Empty old object
      chart.data.datasets[0].data = [];
      // Create a zeroed out array with the same length as the new point array
      pointArray.forEach((element, index) => {
        // For timeline based data the key name might matter (t instead of x)
        if ('t' in element) {
          chart.data.datasets[0].data.push({ t: pointArray[index].t, y: 0 });
        } else {
          chart.data.datasets[0].data.push({ x: pointArray[index].x, y: 0 });
        }
      });
      // Update the chart, this will perform an animation
      chart.update();

      // Delay the loading of the real data by one second, this allows the chart to settle before the real animation
      setTimeout(() => {
        for (let i = 0; i < chart.data.datasets[0].data.length; i++) {
          chart.data.datasets[0].data[i] = pointArray[i];
        }
        // Call the update again
        chart.update(2000);
      }, 1000);
      // If the arrays are of equal length, we check if the datapoints themselves are equal
    } else if (!this.arraysEqual(chart.data.datasets[0].data, pointArray)) {
      // For each point, we only change the value, if it has changed (is this check really necessary?)
      for (let i = 0; i < chart.data.datasets[0].data.length; i++) {
        (chart.data.datasets[0].data[i] as any).y = pointArray[i].y;
      }
      // Call the update
      chart.update(2000);
    }
  }

  /**
   * Checks complete elementwise equality between two charts
   * Only works with value types (or equal member references)
   * @param {Array<T>} a First array
   * @param {Array<T>} b Second array
   * @returns {boolean} Whether the two arrays are equal elementwise
   */
  arraysEqual<T>(a: Array<T>, b: Array<T>) {
    // If the references are the same, or both of them are null
    if (a === b) {
      return true;
    }
    // If either of them are null
    if (a == null || b == null) {
      return false;
    }
    // If the lengths are'nt the same
    if (a.length !== b.length) {
      return false;
    }

    // Elementwise check
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Calculates the responsivity breakpoints for the tile
   * (Shouldn't there be a difference between 3 and 4 width tiles??)
   * @param {number} width The width of the tile
   */
  calculateFlex(width: number) {
    if (width > 2) {
      this.mediaQueryWatcher('lt-md');
    } else if (width === 2) {
      this.mediaQueryWatcher('lt-sm');
    }
  }

  /**
   * Calculates the responsivity breakpoints for alternate tiles
   * Unlike regular tiles, the breakpoints depend on the original, not the alternate itself
   * @param {number} width The width of the original tile this is the alternate of
   */
  calculateAlternate(width: number) {
    if (width > 2) {
      this.mediaQueryWatcher('gt-sm');
    } else if (width === 2) {
      this.mediaQueryWatcher('gt-xs');
    }
  }

  /**
   * Creates subscriptions to hide the tiles at certain breakpoints
   * @param {string} alias The mediaquery alias of the screen size
   */
  mediaQueryWatcher(alias: string) {
    // Prehides tiles on load if it shouldn't be visible given the starting screen size
    this.makeInvisbileIf(alias);

    // Create mediaquery subscriptions
    this.watcher = this.media.subscribe(() => {
      this.makeInvisbileIf(alias);
    });
  }

  /**
   * Conditional hiding of the tile
   * @param {string} alias The mediaquery alias of the screen size
   */
  makeInvisbileIf(alias: string) {
    if (this.media.isActive(alias)) {
      if (!(this.display === 'none')) {
        this.display = 'none';
      }
    } else if (!(this.display === '')) {
      this.display = '';
    }
  }
}
