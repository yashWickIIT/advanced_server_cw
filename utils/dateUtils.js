const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/London");

exports.getToday = () => {
  return dayjs().tz().format("YYYY-MM-DD");
};

exports.getTomorrow = () => {
  return dayjs().tz().add(1, "day").format("YYYY-MM-DD");
};
