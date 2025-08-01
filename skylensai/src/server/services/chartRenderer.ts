import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as d3 from 'd3';

export interface ChartExportOptions {
  title: string;
  data: Array<{
    timestamp: number;
    value: number;
    unit: string;
  }>;
  parameter: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export class ChartRenderer {
  private static readonly DEFAULT_WIDTH = 800;
  private static readonly DEFAULT_HEIGHT = 600;
  private static readonly DEFAULT_BACKGROUND_COLOR = '#ffffff';

  /**
   * Generate PNG chart image from time series data using D3 and Canvas
   */
  static async generatePngChart(options: ChartExportOptions): Promise<Buffer> {
    const {
      title,
      data,
      parameter,
      width = this.DEFAULT_WIDTH,
      height = this.DEFAULT_HEIGHT,
      backgroundColor = this.DEFAULT_BACKGROUND_COLOR,
    } = options;

    if (data.length === 0) {
      throw new Error('Data array cannot be empty');
    }

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Chart dimensions and margins
    const margin = { top: 60, right: 50, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.timestamp) as [number, number])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value) as [number, number])
      .range([chartHeight, 0]);

    // Set font
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText(title, width / 2, 30);

    // Move to chart area
    ctx.translate(margin.left, margin.top);

    // Draw grid lines
    this.drawGrid(ctx, xScale, yScale, chartWidth, chartHeight);

    // Draw axes
    this.drawAxes(ctx, xScale, yScale, chartWidth, chartHeight, data[0]?.unit || '');

    // Draw data line
    this.drawDataLine(ctx, data, xScale, yScale, parameter);

    // Draw axis labels
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText('Time', chartWidth / 2, chartHeight + 60);
    
    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(-60, chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(this.getYAxisLabel(parameter, data[0]?.unit || ''), 0, 0);
    ctx.restore();

    return canvas.toBuffer('image/png');
  }

  /**
   * Generate multi-parameter PNG chart
   */
  static async generateMultiParameterPngChart(
    title: string,
    datasets: Array<{
      parameter: string;
      data: Array<{
        timestamp: number;
        value: number;
        unit: string;
      }>;
    }>,
    options?: {
      width?: number;
      height?: number;
      backgroundColor?: string;
    }
  ): Promise<Buffer> {
    const {
      width = this.DEFAULT_WIDTH,
      height = this.DEFAULT_HEIGHT,
      backgroundColor = this.DEFAULT_BACKGROUND_COLOR,
    } = options || {};

    if (datasets.length === 0 || datasets.every(d => d.data.length === 0)) {
      throw new Error('At least one dataset with data is required');
    }

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Chart dimensions and margins
    const margin = { top: 80, right: 50, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Find overall data bounds
    const allData = datasets.flatMap(d => d.data);
    const xExtent = d3.extent(allData, d => d.timestamp) as [number, number];
    const yExtent = d3.extent(allData, d => d.value) as [number, number];

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([chartHeight, 0]);

    // Draw title
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 30);

    // Draw legend
    this.drawLegend(ctx, datasets, width - 20, 50);

    // Move to chart area
    ctx.translate(margin.left, margin.top);

    // Draw grid lines
    this.drawGrid(ctx, xScale, yScale, chartWidth, chartHeight);

    // Draw axes
    this.drawAxes(ctx, xScale, yScale, chartWidth, chartHeight, 'mixed');

    // Draw data lines for each dataset
    datasets.forEach((dataset, index) => {
      if (dataset.data.length > 0) {
        this.drawDataLine(ctx, dataset.data, xScale, yScale, dataset.parameter, index);
      }
    });

    // Draw axis labels
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText('Time', chartWidth / 2, chartHeight + 60);
    
    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(-60, chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Value', 0, 0);
    ctx.restore();

    return canvas.toBuffer('image/png');
  }

  /**
   * Draw grid lines
   */
  private static drawGrid(
    ctx: CanvasRenderingContext2D,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    width: number,
    height: number
  ): void {
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xTicks = xScale.ticks(8);
    xTicks.forEach(tick => {
      const x = xScale(tick);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

    // Horizontal grid lines
    const yTicks = yScale.ticks(6);
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });
  }

  /**
   * Draw axes
   */
  private static drawAxes(
    ctx: CanvasRenderingContext2D,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    width: number,
    height: number,
    unit: string
  ): void {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // X-axis ticks and labels
    const xTicks = xScale.ticks(8);
    xTicks.forEach(tick => {
      const x = xScale(tick);
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, height + 5);
      ctx.stroke();
      
      ctx.fillText(this.formatTimestamp(tick), x, height + 20);
    });

    // Y-axis ticks and labels
    ctx.textAlign = 'right';
    const yTicks = yScale.ticks(6);
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(-5, y);
      ctx.stroke();
      
      ctx.fillText(tick.toFixed(1), -10, y + 4);
    });
  }

  /**
   * Draw data line
   */
  private static drawDataLine(
    ctx: CanvasRenderingContext2D,
    data: Array<{ timestamp: number; value: number; unit: string }>,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    parameter: string,
    colorIndex: number = 0
  ): void {
    if (data.length === 0) return;

    const color = this.getParameterColor(parameter, 1, colorIndex);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // Draw line
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = xScale(point.timestamp);
      const y = yScale(point.value);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    data.forEach(point => {
      const x = xScale(point.timestamp);
      const y = yScale(point.value);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  /**
   * Draw legend
   */
  private static drawLegend(
    ctx: CanvasRenderingContext2D,
    datasets: Array<{ parameter: string; data: any[] }>,
    x: number,
    y: number
  ): void {
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';

    datasets.forEach((dataset, index) => {
      const legendY = y + index * 20;
      const color = this.getParameterColor(dataset.parameter, 1, index);
      
      // Draw color box
      ctx.fillStyle = color;
      ctx.fillRect(x - 80, legendY - 8, 12, 12);
      
      // Draw label
      ctx.fillStyle = '#374151';
      ctx.fillText(this.formatParameterLabel(dataset.parameter), x - 60, legendY);
    });
  }

  /**
   * Format timestamp for display
   */
  private static formatTimestamp(timestamp: number): string {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format parameter label for display
   */
  private static formatParameterLabel(parameter: string): string {
    const labelMap: Record<string, string> = {
      'altitude': 'Altitude',
      'battery_voltage': 'Battery Voltage',
      'gps_lat': 'GPS Latitude',
      'gps_lng': 'GPS Longitude',
      'roll': 'Roll',
      'pitch': 'Pitch',
      'yaw': 'Yaw',
      'motor_1': 'Motor 1',
      'motor_2': 'Motor 2',
      'motor_3': 'Motor 3',
      'motor_4': 'Motor 4',
    };

    return labelMap[parameter] || parameter.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get color for parameter (returns CSS color string)
   */
  private static getParameterColor(parameter: string, alpha: number = 1, index: number = 0): string {
    const colors = [
      '#3B82F6', // Blue-500
      '#EF4444', // Red-500
      '#22C55E', // Green-500
      '#F59E0B', // Yellow-500
      '#A855F7', // Violet-500
      '#EC4899', // Pink-500
      '#14B8A6', // Teal-500
      '#F97316', // Orange-500
    ];

    const colorMap: Record<string, string> = {
      'altitude': colors[0]!, // Blue
      'battery_voltage': colors[1]!, // Red
      'gps_lat': colors[2]!, // Green
      'gps_lng': colors[3]!, // Yellow
      'roll': colors[4]!, // Violet
      'pitch': colors[5]!, // Pink
      'yaw': colors[6]!, // Teal
      'motor_1': colors[7]!, // Orange
      'motor_2': colors[0]!, // Blue
      'motor_3': colors[1]!, // Red
      'motor_4': colors[2]!, // Green
    };

    const baseColor = colorMap[parameter] || colors[index % colors.length]!;
    
    if (alpha === 1) {
      return baseColor;
    } else {
      // Convert hex to rgba
      const hex = baseColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  /**
   * Get Y-axis label with unit
   */
  private static getYAxisLabel(parameter: string, unit: string): string {
    const label = this.formatParameterLabel(parameter);
    return unit ? `${label} (${unit})` : label;
  }

  /**
   * Determine if Y-axis should begin at zero
   */
  private static shouldBeginAtZero(parameter: string): boolean {
    // Parameters that should start from zero
    const zeroBasedParameters = ['altitude', 'motor_1', 'motor_2', 'motor_3', 'motor_4'];
    return zeroBasedParameters.includes(parameter);
  }
}