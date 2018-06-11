import { map } from 'components/LineChart/utils';
import { Data } from 'api/services';

const ANTI_ALIASING_OFFSET = 0.5;

export default class LineChart {
  private readonly context: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private width: number = 0;
  private height: number = 0;
  private padding: number = 50;
  private yScaleStep: number = 10;
  private yRange: [number, number] = [-40, 40];
  // private xRange: string[] = [];

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.updateSize(width, height);
  }
  // public setXRange(range: string[]) {
  //   this.xRange = range;
  // }
  public updateSize(width: number, height: number) {
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.context.translate(ANTI_ALIASING_OFFSET, ANTI_ALIASING_OFFSET);
  }
  private clearCanvas() {
    this.context.save();
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.restore();
  }
  private toLocalCanvas() {
    this.context.translate(this.padding, this.padding);
  }
  private toGlobalCanvas() {
    this.context.translate(-this.padding, -this.padding);
  }
  private getXPoint(value: number, limit: number) {
    const localWidth = this.width - (this.padding * 2);

    const x = map(
      value,
      0,
      limit,
      0,
      localWidth,
    );

    return Math.round(x);
  }
  private getYPoint(value: number) {
    const localHeight = this.height - (this.padding * 2);

    const y = map(
      value,
      this.yRange[1],
      this.yRange[0],
      0,
      localHeight,
    );

    return Math.round(y);
  }
  private drawScale() {
    this.context.save();

    this.toLocalCanvas();
    this.context.setLineDash([3, 3]);
    this.context.textAlign = 'end';
    this.context.textBaseline = 'middle';
    const localWidth = this.width - (this.padding * 2);

    for (
      let valueStep = this.yRange[0];
      valueStep <= this.yRange[1];
      valueStep += this.yScaleStep
    ) {
      this.context.beginPath();

      const pxValue = this.getYPoint(valueStep);

      this.context.moveTo(0, pxValue);
      this.context.lineTo(localWidth, pxValue);
      this.context.stroke();

      this.context.font = '16px Arial';
      this.context.fillText(`${valueStep}`, -10, pxValue);
    }

    this.context.setLineDash([]);
    this.toGlobalCanvas();

    this.context.restore();
  }
  private drawLine(data: Data[]) {
    this.context.save();

    this.toLocalCanvas();

    this.context.beginPath();
    this.context.moveTo(0, this.getYPoint(data[0].v));
    const lenght = data.length;

    for (let i = 1; i < lenght; ++i) {
      const x = this.getXPoint(i + 1, lenght);

      const y = this.getYPoint(data[i].v);

      this.context.lineTo(x, y);

      // const prevPointYear = data[i - 1].t.split('-')[0];
      // const currentPointYear = data[i].t.split('-')[0];

      // if (currentPointYear !== prevPointYear) {
      //   this.context.fillStyle = 'lightgreen';
      //   this.context.fillRect(x, y, 50, 10);
      // }
    }
    this.context.stroke();

    this.toGlobalCanvas();

    this.context.restore();
  }
  public render(data: Data[]) {
    if (data.length === 0) {
      return;
    }

    this.clearCanvas();
    this.drawScale();
    this.drawLine(data);
  }
}

export const createLineChart = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) => new LineChart(canvas, width, height);
