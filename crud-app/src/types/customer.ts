import {Item} from './item'

export interface Customer{
    id: string;
    email: string;
    password: string;
    name: string;
    favorite: Item;
    history: Item[];
    status: string;
}