import {
  Component,
  AfterViewInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ChangeDetectorRef,
  ComponentRef,
  OnDestroy,
  ComponentFactory
} from '@angular/core';
import { ApiService } from '@app/api';
import { ChartTileComponent } from './charttile/charttile.component';
import { NumericTileComponent } from './numerictile/numerictile.component';
import { TileConfig, ChartConfig, NumericConfig } from '@app/shared';
import { cloneDeep } from 'lodash';
import { timer, Subscription } from 'rxjs';

/**
 * An interface to manage tile updates through
 * All tile components must implement this
 */
export interface TileManagement {
  updateSelf(): void;
}

/**
 * Component for the dashboard page
 * It is just a wrapper for tile components, which get dynamically loaded from the server
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  /**
   * Container reference for the tile container, this is needed for runtime loading of the tiles
   */
  @ViewChild('tileContainer', { read: ViewContainerRef })
  tileContainer: ViewContainerRef;

  /**
   * Loading indicator
   */
  isLoading = true;

  /**
   * Periodic updating signal
   */
  updateTimerSubscription: Subscription;

  /**
   * A list of tiles currently loaded
   */
  tiles: ComponentRef<TileManagement>[] = [];

  /**
   * Component factory for {@link NumericTileComponent}
   */
  numericTileComponentFactory: ComponentFactory<NumericTileComponent> = this.factoryResolver.resolveComponentFactory(
    NumericTileComponent
  );

  /**
   * Component factory for {@link ChartTileComponent}
   */
  chartTileComponentFactory: ComponentFactory<ChartTileComponent> = this.factoryResolver.resolveComponentFactory(
    ChartTileComponent
  );

  constructor(
    private apiService: ApiService,
    private factoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.isLoading = true;
    // Load the tile information, then call their init function
    this.apiService.tiles().subscribe(tiles => {
      this.initTiles(tiles);
    });
  }

  /**
   * Separately initialize the different tile compoents from the list
   * @param {TileConfig} tiles The tile configuration of the system
   */
  initTiles(tiles: TileConfig) {
    // Numeric tiles
    tiles.numeric.forEach(numericConfig => {
      this.initNumericTile(numericConfig);
    });

    // Chart based tiles
    tiles.charts.forEach(chartConfig => {
      this.initChartTile(chartConfig);

      // If the tile width is larger than 1, make a 1x3, borderless alternative
      // This will replace it, when screen size is too small to show the big version
      if (chartConfig.width > 1) {
        const altConfig = cloneDeep(chartConfig);
        altConfig.width = 1;
        altConfig.height = 3;
        altConfig.borderless = true;
        // This tile gets initialized with an auxiliary parameter
        // Which assists in setting the correct breakpoint in screensize
        this.initChartTile(altConfig, chartConfig.width);
      }
    });


    // Set a timeout to loading the data
    // This is required, because there are some sync problems if this runs synchronously
    setTimeout(() => {
      this.scheduleUpdates();
      setTimeout(() => {
        this.isLoading = false;
      }, 100);
    }, 1000);
  }

  /**
   * Start the tile updater timer, which runs once immediately and then every 15 seconds after that
   * The updating is just calling the updateSelf method of every tile through the {@link TileManagement} interface
   */
  scheduleUpdates() {
    const updateTimer = timer(0, 15000);
    this.updateTimerSubscription = updateTimer.subscribe(x => {
      this.tiles.forEach(tile => {
        tile.instance.updateSelf();
      });
    });
  }

  /**
   * Configures one numeric tile
   * @param {NumericConfig} numericConfig Tile configuration
   */
  initNumericTile(numericConfig: NumericConfig) {
    // Create a new numeric component with the numeric tile factory
    const tileRef = this.tileContainer.createComponent(this.numericTileComponentFactory);
    // Record it in the list of current tiles
    this.tiles.push(tileRef);
    // Change detection, so the frameworks knows there is a new component
    this.cd.detectChanges();
    // Inner init method of the component
    // This is async so the change detection can run before this
    setTimeout(() => {
      tileRef.instance.initConfig(numericConfig);
    });
  }

  /**
   * Configures one chart based tile
   * @param {ChartConfig} chartConfig Tile configuration
   * @param {number} alternate If the tile is an alternate, this specifies the width of the original
   */
  initChartTile(chartConfig: ChartConfig, alternate?: number) {
    // Create a new numeric component with the numeric tile factory
    const tileRef = this.tileContainer.createComponent(this.chartTileComponentFactory);
    // Record it in the list of current tiles
    this.tiles.push(tileRef);
    // Change detection, so the frameworks knows there is a new component
    this.cd.detectChanges();
    // Inner init method of the component
    // This is async so the change detection can run before this
    setTimeout(() => {
      if (alternate) {
        // The alternate tile width parameter just gets passed to the inner init method
        tileRef.instance.initConfig(chartConfig, alternate);
      } else {
        tileRef.instance.initConfig(chartConfig);
      }
    });
  }

  ngOnDestroy(): void {
    // The update timer has to be stopped on unloading by unsubscribing from it
    this.updateTimerSubscription.unsubscribe();
  }
}
