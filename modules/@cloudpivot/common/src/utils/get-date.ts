/**
 * 今天 */
export const getToday = () => {
  const day = new Date();
  day.setTime(day.getTime());
  return day.getFullYear()+"-" + getMonthDate(day) + "-" + getDayDate(day);
}
/**
 * 近一周
 */
export const getLatelyWeek = () => {
  const day = new Date();
  day.setTime(day.getTime() - 7*24*60*60*1000);
  return day.getFullYear()+"-" + getMonthDate(day) + "-" + getDayDate(day);;
}
/**
 * 近一个月
 */
export const getLatelyMonth = () => {
  const day = new Date();
  // day.setTime(day.getTime() - 31*24*60*60*1000);
  day.setMonth(day.getMonth() - 1);
  day.setDate(day.getDate() + 1);
  return day.getFullYear()+"-" + getMonthDate(day) + "-" + getDayDate(day);;
}
/**
 * 近一个季度
 */
export const getLatelyQuarter = () => {
  const day = new Date();
  // day.setTime(day.getTime() - 90*24*60*60*1000);
  day.setMonth(day.getMonth() - 3);
  day.setDate(day.getDate() + 1);
  return day.getFullYear()+"-" + getMonthDate(day) + "-" + getDayDate(day);;
}
/**
 * 近一年
 */
export const getLatelyYear = () => {
  const day = new Date();
  // day.setTime(day.getTime() - 365*24*60*60*1000);
  day.setFullYear(day.getFullYear() - 1);
  day.setDate(day.getDate() + 1);
  return day.getFullYear()+"-" + getMonthDate(day) + "-" + getDayDate(day);;
}
/**
 * 本周
 */
export const getThisWeek = () => {
  const day = new Date(); 
  const today = day.getDay(); 
  let stepSunDay = -today + 1;
  if (today == 0) {  
    stepSunDay = -7;  
  } 
  const stepMonday = 7 - today;  
  const monday = new Date(); 
  const sunday = new Date(); 
  monday.setTime(day.getTime() + stepSunDay * 24 * 3600 * 1000);
  sunday.setTime(day.getTime()+ stepMonday* 24 * 3600 * 1000);
  return [monday.getFullYear()+"-" + getMonthDate(monday) + "-" + getDayDate(monday),
  day.getFullYear()+"-" + getMonthDate(day) + "-" + getDayDate(day)
  ];
}

/**
 * 本月
 */
export const getThisMonth = () => {
  const start = new Date();  
  start.setDate(1); 
  const date = new Date();  
  const currentMonth = date.getMonth();  
  var nextMonth = currentMonth + 1;
  var nextMonthFirstDay:any = new Date(date.getFullYear(), nextMonth, 1);
  var oneDay = 1000 * 60 * 60 * 24;  
  var end = new Date(nextMonthFirstDay - oneDay);  
  return [start.getFullYear()+"-" + (start.getMonth()+1) + "-" + start.getDate(),
  date.getFullYear()+"-" + (date.getMonth()+1) + "-" + date.getDate()]
}

/**
 * 本季度
 */
export const getThisQuarter = () => {
  const start = new Date();
  const month = start.getMonth();
  let startQuarter = 0;
  if (month < 3) {
    startQuarter = 0;
  } else if (3 <= month && month < 6) {
    startQuarter = 3;
  }
  if (6 <= month && month < 9) {
    startQuarter = 6;
  }
  if (month >= 9) {
    startQuarter = 9;
  }
  start.setDate(1); 
  const date = new Date();  
  return [start.getFullYear()+"-" + (startQuarter+1) + "-" + start.getDate(),
  date.getFullYear()+"-" + (date.getMonth()+1) + "-" + date.getDate()]
}

/**
 * 本年
 */
export const getThisYear = () => {
  const date = new Date();
  const year = new Date().getFullYear();  
  return [`${year}-1-1`, date.getFullYear()+"-" + (date.getMonth()+1) + "-" + date.getDate()];
}

//ios系统只支持'2020-05-20' 格式
const getMonthDate = (param: any) => {
  const month: number = param.getMonth() + 1;
  if(month < 10){
    return `0${month}`
  }
  return month
}

const getDayDate = (param: any) => {
  const day: number = param.getDate();
  if(day < 10){
    return `0${day}`
  }
  return day
}

export default {
  getToday,
  getLatelyWeek,
  getLatelyMonth,
  getLatelyQuarter,
  getLatelyYear,
  getThisWeek,
  getThisMonth,
  getThisQuarter,
  getThisYear
}