import axios, { CreateAxiosDefaults } from 'axios';

const getRequestInstance = (config: CreateAxiosDefaults | undefined | null) => {
  return axios.create({
    ...config,
  });
};

export default getRequestInstance;