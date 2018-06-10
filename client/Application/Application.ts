import { getPrecipitations, getTemperatures } from '../api/services';
import { getPeriodData, makeSelectOption, setSelectOptions } from '../Application/utils';
import { Parameter, Period, State } from '../Application/types';

export default class Application {
  // private chartElement: HTMLCanvasElement;
  private buttons: Record<Parameter, HTMLButtonElement>;
  private selects: Record<Period, HTMLSelectElement>;

  private state: State;

  constructor() {
    this.selects = {
      [Period.Begin]: document.getElementById('date-beg') as HTMLSelectElement,
      [Period.End]: document.getElementById('date-end') as HTMLSelectElement,
    };
    // this.chartElement = document.getElementById('chart') as HTMLCanvasElement;
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

    this.init(Parameter.Temperature);
  }

  private handleSelectClick(period: Period, selectElement: HTMLSelectElement) {
    console.log(period, selectElement.value);
  }
  private handleButtonClick(parameter: Parameter) {
    if (this.state.selectedParameter !== parameter) {
      this.buttons[this.state.selectedParameter].classList.remove('activeButton');
      this.buttons[parameter].classList.add('activeButton');
    }

    this.state.selectedParameter = parameter;
    this.updateView();
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

    this.updateView();
  }

  private setSelectOptions() {
    const years: string[] = [];

    this.state.periodData[this.state.selectedParameter]
      .forEach((item) => {
        const year = item.t.split('-')[0];

        !years.includes(year) && years.push(year);
      });

    const beginOptions = years.map(item => makeSelectOption({
      value: item,
      text: item,
    }));
    const endOptions = years.map((item, i) => makeSelectOption({
      value: item,
      text: item,
      selected: i === years.length - 1,
    }));

    setSelectOptions(this.selects[Period.Begin], beginOptions);
    setSelectOptions(this.selects[Period.End], endOptions);

    this.state.selectedPeriod[Period.Begin] = years[0];
    this.state.selectedPeriod[Period.End] = years[years.length - 1];
  }
  private updateView() {
    this.setSelectOptions();
    console.log(this.state);
  }
}

export const createApplication = () => new Application();
