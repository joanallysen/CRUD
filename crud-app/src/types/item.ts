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
  discount: number;
  available: boolean;
  popularity: number;
  modifiedAt: Date;

  // mongodb have its own _id
  _id: any;
}
