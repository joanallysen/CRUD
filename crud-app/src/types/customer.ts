import {Item} from './item'

export interface Customer{
    id: string;
    email: string;
    password: string;
    name: string;
    favorite: Item;
    cart: Map<string, {item: Item, amount: number}>;
    history: Item[];
    status: string;
}