import {IStatisticDayData, IStatisticResponse} from "../types/Statistic.js";
import {formatDateWS} from "./Dates.js";

export function groupBy(array: any[], key: string): { [key: string]: any[] } {
  return array.reduce((result: any, currentValue: any) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}

export function distributeData(data: any[]): IStatisticResponse {
  const statisticData: IStatisticDayData[] = [];

  // Группируем данные по дате
  const groupedData = groupBy(data, 'date');
  // Обрабатываем каждую группу
  for (const date in groupedData) {
    if (groupedData.hasOwnProperty(date)) {
      const group = groupedData[date];
      const statisticDayData: IStatisticDayData = {
        d: formatDateWS(new Date(date)),
        m: group.length,
        r: 0,
        nr: 0,
        e: 0
      };

      // Обрабатываем каждый элемент группы
      group.forEach((item: any) => {
        statisticDayData.r += item.visit_respect_count;
        statisticDayData.nr += item.visit_norespect_count;
        statisticDayData.e += item.visit_exist_count;
      });

      statisticData.push(statisticDayData);
    }
  }

  return {
    sd: statisticData
  };
}
