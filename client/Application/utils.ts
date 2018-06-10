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

  return [];
}
