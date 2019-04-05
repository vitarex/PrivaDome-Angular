import { Injectable } from '@angular/core';
import { ChartType, ChartConfiguration, Chart, ScaleType, TimeUnit, ChartColor } from 'chart.js';
import {
  DEFAULT_BAR_TOOLTIPS,
  DEFAULT_CATEGORY_AXES,
  DEFAULT_LINEBAR_DATASET,
  DEFAULT_TIME_AXES,
  DEFAULT_LINE_CONFIG
} from './chartfactory.const';
import { cloneDeep } from 'lodash';

/**
 * The tile configuration object containing both the numeric and chart based tile information
 * This objects determines the number and type of all tiles on the dashboard
 * These interfaces should maybe be moved somewhere else
 */
export interface TileConfig {
  /**
   * List of chart tiles
   */
  charts: ChartConfig[];
  /**
   * List of numeric tiles
   */
  numeric: NumericConfig[];
}

/**
 * Describes a basic tile
 */
interface ITile {
  /**
   * String ID of the tile
   */
  name: string;
  /**
   * Title of the tile, displayed at the top
   */
  title: string;
  /**
   * Short description of the tile, displayed below the title
   */
  description?: string;
}

/**
 * Describes a chart tile configuration object
 */
export interface ChartConfig extends ITile {
  /**
   * Width of the tile in terms of grid columns
   * Each grid column is a constant 280px wide with 20px wide gutters
   */
  width: number;
  /**
   * Height of the tile in terms of grid rows
   * Each grid row is 55px tall with 20px tall gutters
   */
  height: number;
  /**
   * Determines whether the chart axes should have any labels or should the chart completely fill the wrapper tile
   */
  borderless: boolean;
  /**
   * Further chart options
   */
  options: ChartOptions;
}

/**
 * Describes a numeric tile configuration object
 */
export interface NumericConfig extends ITile {
  /**
   * The color of the displayed number
   */
  color?: number[];
}

/**
 * Additional chart options
 */
export interface ChartOptions {
  /**
   * The type of the chart
   * Values include: line, bar
   * Line: simple line chart with series data
   * Bar: Can be either series or category data
   */
  type: ChartType;
  /**
   * Datasets to display
   * Right now none of the charts use two datasets at the same time
   * The data load for these is more complicated and isn't supported right now
   * Since Chart.js works with datasets anyway, the interfaces support the option already
   */
  datasets: ChartDataset[];
  /**
   * Chart type
   * Values include: time, category
   * Time: timeseries data
   * Category: categorized data
   */
  axes?: ScaleType;
  /**
   * The unit base for the X axes, used to set the time base for timeseries data
   * Possible values include millisecond, second, minute, hour, day, week, month, quarter, year
   * This value is parsed by Chart.js
   * This is currently only used for timeseries charts
   */
  unit?: TimeUnit;
}

/**
 * Describes a dataset of a chart
 * Chart.js supports displaying multiple datasets on the same chart
 * Multiple datasets are currently not yet supported, becuase the data loading for them is not implemented yet
 */
export interface ChartDataset {
  label: string;
  color?: number[];
}

/**
 * Object factory service to process the tile information and create and initialize the required charts
 */
@Injectable()
export class ChartFactoryService {
  /**
   * We can define global defaults in the constructor, this can be overridden in specific cases
   */
  constructor() {
    // Important parameter so that the charts fill up their wrapper tiles
    Chart.defaults.global.maintainAspectRatio = false;
    Chart.defaults.global.elements.point.radius = 5;
    Chart.defaults.global.elements.point.hoverRadius = 7;
    Chart.defaults.global.elements.line.borderDash = [1, 5];
    Chart.defaults.global.elements.line.borderCapStyle = 'round';
  }

  /**
   * Draw a Chart.js chart based on chartConfig on chartCanvas canvas
   * @param {any} chartCanvas Canvas reference to draw on
   * @param {ChartConfig} chartConfig Chart configuration
   * @returns {Chart}
   */
  createChart(chartCanvas: any, chartConfig: ChartConfig): Chart {
    // The algorithm transforms the PrivaDome specific configuration into a Chart.js config
    // Then simply calls the Chart.js creation method

    let config: ChartConfiguration;

    // Simple switch to create different chart types
    // Currently only two types of charts are supported and they use the same creation method
    switch (chartConfig.options.type) {
      case 'line':
        config = this.configureLineBarChart(chartConfig);
        break;
      case 'bar':
        config = this.configureLineBarChart(chartConfig);
        break;
      default:
        config = this.configureLineBarChart(chartConfig);
        break;
    }

    // Make the chart borderless, i.e. no axes labels
    if (chartConfig.borderless) {
      this.makeBorderless(chartConfig, config);
    }

    // Create the chart with Chart.js
    return new Chart(chartCanvas, config);
  }

  /**
   * Create line or bar charts
   * @param {ChartConfig} chartConfig Chart configuration
   * @returns {ChartConfiguration}
   */
  configureLineBarChart(chartConfig: ChartConfig): ChartConfiguration {
    // We start by cloning the default line configuration
    const currentConfig = cloneDeep(DEFAULT_LINE_CONFIG);

    // We can just make the bar chart with this method as well
    // Line are bar charts are very similar in terms of config
    switch (chartConfig.options.type) {
      case 'bar':
        // Clone the barchart tooltips and change the type to bar
        currentConfig.options['tooltips'] = cloneDeep(DEFAULT_BAR_TOOLTIPS);
        currentConfig.type = 'bar';
        break;

      default:
        break;
    }

    // Axes config is optional
    if (chartConfig.options.axes) {
      // Special axes type settings
      switch (chartConfig.options.axes) {
        // Timeseries data
        case 'time':
          // Clone the timeseries settings
          currentConfig.options.scales.xAxes[0] = cloneDeep(DEFAULT_TIME_AXES);
          // Set the time base, if the option exists
          if (chartConfig.options.unit) {
            currentConfig.options.scales.xAxes[0]['time'] = {
              unit: chartConfig.options.unit
            };
          }
          // This is needed to separate the bars in a bar chart
          if (currentConfig.type === 'bar') {
            currentConfig.options.scales.xAxes[0]['offset'] = true;
          }
          break;

        // Categorized data
        case 'category':
          // Clone the category settings
          currentConfig.options.scales.xAxes[0] = cloneDeep(DEFAULT_CATEGORY_AXES);
          // This is needed to separate the bars in a bar chart
          if (currentConfig.type === 'bar') {
            currentConfig.options.scales.xAxes[0]['offset'] = true;
          }
          break;
        default:
          break;
      }
    }

    // Configure the datasets
    // This should maybe in createChart ?
    this.datasetConfig(currentConfig, chartConfig);

    return currentConfig;
  }

  /**
   * Modify the Chart.js configuration so that the chart doesn't display labels and completely fills its tile
   * The reference is directly modified
   * @param {ChartConfiguration} currentConfig Current Chart.js config
   */
  makeBorderless(chartConfig: ChartConfig, currentConfig: ChartConfiguration) {
    currentConfig.options.scales.xAxes[0].display = false;
    currentConfig.options.scales.yAxes[0].display = false;

    currentConfig.options.layout.padding = {
      left: -10,
      right: -10,
      top: 0,
      bottom: chartConfig.height === 3 ? 17 : 0
    };
  }

  /**
   * Configure the Chart.js datasets based on the chart tile config
   * @param {ChartConfiguration} currentConfig Chart.js configuration
   * @param {ChartConfig} chartConfig PrivaDome chart tile configuration
   */
  datasetConfig(currentConfig: ChartConfiguration, chartConfig: ChartConfig) {
    // Since only line and bar charts are supported currently, this method is incomplete
    chartConfig.options.datasets.forEach((dataset, index) => {
      // Clone the default dataset settings
      currentConfig.data.datasets[index] = cloneDeep(DEFAULT_LINEBAR_DATASET);

      // Some chart types, like category, require the labels to be set at the same time as loading the chart data
      // This is handled when loading the data
      if (dataset.label) {
        currentConfig.data.datasets[index].label = dataset.label;
      }

      // Set the dataset colors
      if (dataset.color) {
        // Background color
        currentConfig.data.datasets[index].backgroundColor = [
          'rgba(' + dataset.color[0],
          dataset.color[1],
          dataset.color[2],
          '0.3)'
        ].join(',');
        // Border color
        currentConfig.data.datasets[index].borderColor = [
          'rgba(' + dataset.color[0],
          dataset.color[1],
          dataset.color[2],
          '0.7)'
        ].join(',');
      }
    });
  }
}
