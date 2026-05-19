export interface GardenTask {
  id: number;
  icon: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  advice: string;
}