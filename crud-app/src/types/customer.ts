import {Item} from './item'

export interface Customer{
    id: string;
    email: string;
    password: string;
    name: string;
    favorite: Item;
    cart: {itemId: string, amount: number}[];
    history: {itemId:string, amount: number}[][];
    status: string;
}