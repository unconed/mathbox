export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const smallPause = () => sleep(20);
