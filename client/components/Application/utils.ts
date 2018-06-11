import { Data, ResponseData } from 'api/services';

type SelectOptions = {
  text: string;
  value: any;
  selected?: boolean;
  onClick?(e: Event): void;
};

export const makeSelectOption = (options: SelectOptions) => {
  const element = document.createElement('option');

  element.innerHTML = options.text;
  element.value = options.value;
  element.selected = options.selected || false;
  element.onclick = options.onClick || (() => {});

  return element;
};

export const setSelectOptions = (select: HTMLSelectElement, options: HTMLOptionElement[]) => {
  select.innerHTML = '';
  options.forEach(item => select.appendChild(item));
};

export async function getPeriodData(service: () => Promise<ResponseData<Data[]>>) {
  const result = await service();
  if (result.data !== null) {
    return result.data;
  }

  if (result.error !== '') {
    alert(result.error);
  }

  return [];
}

const reduceAvg = (p: number, c: Data) => p + c.v;

export const getDataForPeriod = (data: Data[], period: string[], avg: boolean = false) => {
  if (data.length === 0 || period.length === 0) {
    return [];
  }

  const filteredData = data.filter(item => period.includes(item.t.split('-')[0]));

  if (filteredData.length === 0) {
    return [];
  }

  if (!avg) {
    return filteredData;
  }

  const avgData: Data[] = [];
  let avgAccum: Data[] = [];

  for (let i = 0; i < filteredData.length; ++i) {
    const prevYear = i === 0 ? '' : filteredData[i - 1].t.split('-')[0];
    const currentYear = i === 0 ? '' : filteredData[i].t.split('-')[0];

    avgAccum.push(filteredData[i]);
    if (currentYear !== prevYear) {
      avgData.push({
        t: avgAccum[0].t,
        v: avgAccum.reduce(reduceAvg, 0) / avgAccum.length,
      });

      avgAccum = [];
    }

  }

  return avgData;
};
