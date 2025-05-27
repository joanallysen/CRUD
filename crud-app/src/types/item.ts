export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  img: {
    mime: string,
    data: Buffer,
  }
  category: string;
  special: boolean;
  available: boolean;
  popularity: number;
  modifiedAt: Date;
}
