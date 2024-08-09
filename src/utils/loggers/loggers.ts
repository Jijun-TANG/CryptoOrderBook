const logger = {
    debug: (...arg: any) => {
      console.log((new Date()).toISOString(), 'DEBUG', ...arg);
    },
    info: (...arg: any) => {
      console.log((new Date()).toISOString(), 'INFO', ...arg);
    },
    warn: (...arg: any) => {
      console.log((new Date()).toISOString(), 'WARN', ...arg);
    },
  };
  
  export default logger;
  