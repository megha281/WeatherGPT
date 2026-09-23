const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const logger = {
  info: (msg) => console.log(`[${stamp()}] INFO  ${msg}`),
  warn: (msg) => console.warn(`[${stamp()}] WARN  ${msg}`),
  error: (msg) => console.error(`[${stamp()}] ERROR ${msg}`),
  debug: (msg) => {
    if (process.env.NODE_ENV !== 'production') console.log(`[${stamp()}] DEBUG ${msg}`);
  },
};

module.exports = logger;
