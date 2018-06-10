export type Data = {
  t: string;
  v: number;
};

export type ResponseData<T> = {
  data: T | null;
  error: string;
};

const API_URL = 'http://localhost:9999';

const handleService = async <T>(service: Promise<Response>) => {
  const result: ResponseData<T> = {
    data: null,
    error: '',
  };

  try {
    const res = await service;
    const data: T = await res.json();

    result.data = data;
  } catch (e) {
    result.error = 'Server error';
  }

  return result;
};

const getService = <T>(name: string) => handleService<T>(fetch(`${API_URL}/${name}`));

export const getTemperatures = () => getService<Data[]>('temperatures');
export const getPrecipitations = () => getService<Data[]>('precipitations');
