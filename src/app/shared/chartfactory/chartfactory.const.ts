import {
  ChartColor,
  GridLineOptions,
  TimeUnit,
  ChartType,
  ScaleType,
  InteractionMode,
  ChartTooltipOptions,
  ChartDataSets,
  ChartScales,
  ChartData,
  ChartConfiguration,
  ChartOptions,
  ChartLayoutOptions,
  ChartLayoutPaddingObject,
  ChartLegendOptions,
  ChartHoverOptions,
  ChartXAxe,
  ChartYAxe,
  TickOptions
} from 'chart.js';

export const DEFAULT_LINE_CONFIG = {
  type: 'line' as ChartType,
  data: {
    datasets: []
  },
  options: {
    layout: {
      padding: {
        left: 10,
        top: 0,
        right: 10,
        bottom: 10
      }
    },
    legend: {
      display: false
    },
    hover: {
      mode: 'nearest' as InteractionMode,
      intersect: false
    },
    scales: {
      xAxes: [
        {
          type: 'linear' as ScaleType
        }
      ],
      yAxes: [
        {
          gridLines: {
            color: 'rgba(0,0,0,0.05)' as ChartColor,
            drawBorder: false,
            drawTicks: false
          },
          ticks: {
            suggestedMax: 500,
            beginAtZero: false,
            maxTicksLimit: 4,
            padding: 10,
            callback: (value: any) => {
              return value === 0 ? null : value;
            }
          }
        }
      ]
    }
  }
} as ChartConfiguration;

export const DEFAULT_BAR_TOOLTIPS = {
  mode: 'index' as InteractionMode,
  intersect: false
} as ChartTooltipOptions;

export const DEFAULT_LINEBAR_DATASET = {
  showLine: true,
  lineTension: 0.15,
  backgroundColor: 'rgba(255,255,255,1)' as ChartColor,
  borderColor: 'rgba(255,255,255,1)' as ChartColor,
  pointBackgroundColor: 'rgba(255,255,255,1)' as ChartColor,
  borderWidth: 2
} as ChartDataSets;

export const DEFAULT_TIME_AXES = {
  type: 'time' as ScaleType,
  time: {
    unit: 'day' as TimeUnit
  },
  gridLines: {
    display: false
  }
} as ChartScales;

export const DEFAULT_CATEGORY_AXES = {
  type: 'category' as ScaleType,
  gridLines: {
    display: false
  }
} as ChartScales;
