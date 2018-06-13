import { getPrecipitations, getTemperatures } from 'api/services';
import { getDataForPeriod, getPeriodData, makeSelectOption, setSelectOptions, getYearPart } from './utils';
import { Parameter, Period, State } from './types';
import LineChart, { createLineChart } from 'components/LineChart';

export default class Application {
  private readonly chartElement: HTMLCanvasElement;
  private readonly chartWrapper: HTMLDivElement;
  private readonly avgCheckbox: HTMLInputElement;
  private readonly lineChart: LineChart;
  private initialDateRange: string[] = [];
  private filteredDateRange: string[] = [];
  private readonly buttons: Record<Parameter, HTMLButtonElement>;
  private readonly selects: Record<Period, HTMLSelectElement>;

  private readonly state: State;

  constructor() {
    this.chartElement = document.getElementById('chart') as HTMLCanvasElement;
    this.chartWrapper = document.getElementById('chart-wrapper') as HTMLDivElement;
    this.avgCheckbox = document.getElementById('avg') as HTMLInputElement;
    this.lineChart = createLineChart(
      this.chartElement,
      this.chartWrapper.clientWidth,
      this.chartWrapper.clientHeight,
    );

    this.selects = {
      [Period.Begin]: document.getElementById('date-beg') as HTMLSelectElement,
      [Period.End]: document.getElementById('date-end') as HTMLSelectElement,
    };
    this.buttons = {
      [Parameter.Temperature]: document.getElementById('temperature') as HTMLButtonElement,
      [Parameter.Precipitation]: document.getElementById('precipitation') as HTMLButtonElement,
    };

    Object.keys(this.buttons).forEach((key) => {
      const parameter = key as Parameter;
      this.buttons[parameter].onclick = () => this.handleButtonClick(parameter);
    });
    Object.keys(this.selects).forEach((key) => {
      const period = key as Period;
      this.selects[period].onchange = (e: Event) => this.handleSelectClick(period, e.target as HTMLSelectElement);
    });

    this.avgCheckbox.onchange = () => {
      this.render();
    };

    this.state = {
      selectedParameter: Parameter.Temperature,
      periodData: {
        [Parameter.Temperature]: [],
        [Parameter.Precipitation]: [],
      },
      selectedPeriod: {
        [Period.Begin]: '',
        [Period.End]: '',
      },
    };

    window.addEventListener('resize', () => {
      this.lineChart.updateSize(
        this.chartWrapper.clientWidth,
        this.chartWrapper.clientHeight,
      );
      this.render();
    });

    this.init(Parameter.Temperature);
  }

  private handleSelectClick(period: Period, selectElement: HTMLSelectElement) {
    this.state.selectedPeriod[period] = selectElement.value;

    if (parseInt(this.state.selectedPeriod.begin, 10) > parseInt(this.state.selectedPeriod.end, 10)) {
      alert('Некорректный период');
    }

    this.render();
  }
  private handleButtonClick(parameter: Parameter) {
    if (this.state.selectedParameter !== parameter) {
      this.buttons[this.state.selectedParameter].classList.remove('activeButton');
      this.buttons[parameter].classList.add('activeButton');
    }

    this.state.selectedParameter = parameter;
    this.render();
  }
  private initSelectedOptions(parameter: Parameter) {
    if (this.state.periodData[parameter].length > 2) {
      const l = this.state.periodData[parameter].length - 1;
      this.state.selectedPeriod.begin = getYearPart(this.state.periodData[parameter][0].t);
      this.state.selectedPeriod.end = getYearPart(this.state.periodData[parameter][l].t);
    }
  }
  private async updateData(parameter: Parameter) {
    switch (parameter) {
      case Parameter.Temperature:
        this.state.periodData[parameter] = await getPeriodData(getTemperatures);
        break;

      case Parameter.Precipitation:
        this.state.periodData[parameter] = await getPeriodData(getPrecipitations);
        break;

      default:
    }
  }

  private async init(parameter: Parameter) {
    this.buttons[parameter].classList.add('activeButton');

    await this.updateData(Parameter.Temperature);
    await this.updateData(Parameter.Precipitation);

    this.initSelectedOptions(parameter);
    this.setSelectOptions();

    this.render();
  }
  private updatePeriodRange() {
    this.initialDateRange = [];

    this.state.periodData[this.state.selectedParameter]
    .forEach((item) => {
      const year = getYearPart(item.t);

      !this.initialDateRange.includes(year) && this.initialDateRange.push(year);
    });

    this.filteredDateRange = this.initialDateRange.filter(year => (
      parseInt(year, 10) >= parseInt(this.state.selectedPeriod.begin, 10)
      && parseInt(year, 10) <= parseInt(this.state.selectedPeriod.end, 10)
    ));
  }
  private setSelectOptions() {
    this.updatePeriodRange();

    const beginOptions = this.initialDateRange.map(item => makeSelectOption({
      value: item,
      text: item,
      selected: item === this.state.selectedPeriod.begin,
    }));
    const endOptions = this.initialDateRange.map(item => makeSelectOption({
      value: item,
      text: item,
      selected: item === this.state.selectedPeriod.end,
    }));

    setSelectOptions(this.selects[Period.Begin], beginOptions);
    setSelectOptions(this.selects[Period.End], endOptions);
  }
  private render() {
    this.updatePeriodRange();

    if (this.filteredDateRange.length === 0) {
      return;
    }

    const data = getDataForPeriod(
      this.state.periodData[this.state.selectedParameter],
      this.filteredDateRange,
      this.avgCheckbox.checked,
    );

    this.lineChart.render(data);
  }
}

export const createApplication = () => new Application();
