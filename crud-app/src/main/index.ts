import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import { contextIsolated } from 'process'

import fs from 'fs'
import {MongoClient, ObjectId, Db, Collection} from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (e) =>{
    const choice = dialog.showMessageBoxSync(mainWindow, {
    type: 'question',
    buttons: ['Yes', 'No'],
    title: 'Confirm',
    message: 'Are you sure you want to leave?',
    });

    if (choice === 1) {
      e.preventDefault(); // Don't exit
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('Soemthing i to know'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



// CONFIGURE ENVIRONMENT ------------------------------------------------------------
if (app.isPackaged) {
  // Production: look next to the exe
  const envPath = path.join(path.dirname(app.getPath('exe')), '.env');
  dotenv.config({ path: envPath });
} else {
  // Development: use default behavior (looks in project root)
  dotenv.config();
}

// MONGODB CONNECTION --------------------------------------------------------------------
const uri = process.env.MONGODB_URI;
let dbClient: MongoClient | null = null;
let db: Db | null = null;

let customerCollection: Collection<Customer> | null = null;
let adminCollection: Collection<Admin> | null = null;
let itemCollection: Collection<Item> | null = null;
let orderCollection: Collection<Order> | null = null;

async function connectToMongoDB(){
  try{
    console.log(`Mongodb uri: ${uri}`)
    dbClient = new MongoClient(uri!);
    await dbClient.connect();
    console.log('Connecting to MongoDB');
    db = dbClient.db(process.env.DB_NAME || 'my-app');
    customerCollection = db?.collection('customers');
    adminCollection = db?.collection('admins');
    itemCollection = db?.collection('items');
    orderCollection = db?.collection('orders');

    return true;
  } catch (error){
    console.error('Cannot connect to MongoDB:', error);
    return false;
  }
}

async function hashPassword(password: string){
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('hashed password', hash);
  return hash;
}

async function checkConnection(){
  if (!db || !customerCollection || !adminCollection || !itemCollection || !orderCollection){
    console.log('database or collection is not connected, connecting...');
      const connected = await connectToMongoDB();
      if (!connected) {
        console.log('Cannot connect to MongoDB, main.ts');
      };
    }
}

function getMimeType(filePath: string) : string {
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('jpeg'))  return 'image/jpeg';
  return 'application/octet-stream' // unknown mime
}


ipcMain.handle('choose-image', async() =>{
  const result = await dialog.showOpenDialog({
    title: 'Select Image',
    properties: ['openFile'],
    filters: [{name : 'Images', extensions: ['png', 'jpg', 'jpeg']}],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const data = fs.readFileSync(filePath);
  const mime = getMimeType(filePath);

  const base64 = data.toString('base64');
  return {mime, data: base64};
})


// IPC
import {CartItem, Customer} from '../types/customer'
import {Admin} from '../types/admin'
import {Item} from '../types/item'
import { Order } from '../types/order'


ipcMain.handle('verify-account', async (_, email: string, password: string) =>{
  console.log(`Received email: ${email} and password: ${password}`);
  try{
    await checkConnection();

    let matchedAccount;
    matchedAccount = await adminCollection?.findOne({email: email});
    console.log(password);
    // console.log(matchedAccount);
    if(matchedAccount && await bcrypt.compare(password, matchedAccount.password)){
      console.log(`email: ${email} matched! in admin`)
      currentUser = matchedAccount;
      return {matchedAccount, isAdmin: true};
    }

    matchedAccount = await customerCollection?.findOne({email: email});
    if(matchedAccount && await bcrypt.compare(password, matchedAccount.password)){
      console.log(`email: ${email} matched! in customer`);
      currentUser = matchedAccount;
      return {matchedAccount, isAdmin:false}
    }

    console.log('User not matched anywhere');
    return {};
  } catch (error: any){
    console.error('Error verifying:', error);
    return {};
  }
});

ipcMain.handle('check-email-exist', async(_, email: string) =>{
  try{
    console.log('Checking if email existed');
    await checkConnection();

    const result = await customerCollection?.findOne({email: email});
    if (result){
      console.log('Email already existed');
      return {success: true, exist: true};
    }
    return {success: true, exist: false};
  } catch(error){
    console.log(error);
    return {success: false};
  }
})


ipcMain.handle('add-customer', async (_, email: string, password:string) =>{
  console.log(`Adding new customer, email: ${email}, password: ${password}`);

  try{
    await checkConnection();

    password = await hashPassword(password);
    const customer : Customer= {
      email: email,
      password: password,
      name: 'User',
      favorites: [],
      orderHistory: [],
      cart: [],
      status: 'Inactive',
      paymentMethod: 'Unknown',
    }

    await customerCollection?.insertOne(customer);
    console.log("Successfully added a new customer");
    return {success: true};
  } catch (error: any){
    console.error('Error adding customer:', error);
    return {success: false};
  }
})

ipcMain.handle('add-admin', async(_, email, password) =>{
  console.log(`Adding new admin, email: ${email}, password: ${password}`);

  try{
    await checkConnection();

    password = await hashPassword(password);
    const admin : Admin = {
      email: email,
      password: password,
    }
    
    await adminCollection?.insertOne(admin);
    console.log("Successfully added a new admin");
    return {success: true};
  } catch (error: any){
    console.error('Error adding admin:', error);
    return {success: false};
  }
})


ipcMain.handle('get-customer', async(_, email: string) =>{
  try{
    await checkConnection();

    if (email === ''){
      const customersRaw = await customerCollection?.find({}).toArray() as Customer[];

      const customers : Customer[] = (customersRaw ?? []).map((customer) => ({
        ...customer,
        id: customer._id?.toHexString(),
      }));

      console.log('Value is not inserted, showing all customer');
      return customers; // this is returning with the _id, see interface for more detail
    }
    
    // TODO return the actual searched customer
    const data = await customerCollection?.find({email: email}).toArray();
    return data;
  } catch(error){
    console.error('Error getting customer:', error);
    return [];
  }
})

ipcMain.handle('get-admin', async(_, email: string) =>{
  try{
    await checkConnection();

    if (email === ''){
      const adminsRaw = await adminCollection?.find({}).toArray() as Admin[];
      
      const admins : Admin[] = adminsRaw?.map((admin) => ({
        ...admin,
        id: admin._id?.toHexString(),
      }));
      
      console.log('Value is not inserted, showing all admin');
      return admins;
    }
    
    // TODO return the actual admin data
    const data = await adminCollection?.find({email: email}).toArray();
    return data;
  } catch(error){
    console.error('Error getting admin:', error);
    return [];
  }
})

let currentUser : any; // can be customer or admin

ipcMain.handle('save-customer-cart', async(_, cartItems: CartItem[]) =>{
  try{
    await checkConnection();
    console.log(currentUser.email);
    
    console.log('cartObject:', cartItems);

    await customerCollection?.updateOne(
      { email: currentUser.email },
      { $set: { cart: cartItems } }  // Save the array directly
    );

    currentUser.cart = cartItems;
    return {success: true};
  } catch(error){
    console.error('Error updating customer cart', error);
    return {success: false};
  }
})


// FOR ITEM REMEMBER TO ALWAYS CONVER BUFFER TO STRING AND STRING BACK TO BUFFER IN BACKEND
ipcMain.handle('add-item', async(_, item : Item) =>{
  try{
    await checkConnection();

    const itemMongo : Item = {
      ...item,
      img: {
        mime:item.img.mime,
        data: typeof item.img.data === 'string' ? Buffer.from(item.img.data, 'base64'): item.img.data, // already a Buffer
      }
    }

    await itemCollection?.insertOne(itemMongo);
    console.log("Successfully added a new item.");
    return {success: true};
  }
    catch (error){
      console.error('Error adding item:', error);
    return {success: false};
  }
} 
),

ipcMain.handle('get-item', async(_) =>{
  try{
    await checkConnection();

    const itemsRaw = await itemCollection?.find().toArray() as Item[];
    const items : Item[] = itemsRaw?.map((item) => ({
      ...item,
      id: item._id?.toHexString(),
      img: {mime: item.img.mime, data: item.img.data.toString('base64')}
    }))
    console.log('items received index.ts get-item');
    return items || [];
  } catch (error){
    console.log('error retrieving item', error);
    return [];
  }
})

ipcMain.handle('get-available-item', async(_) =>{
  try{
    await checkConnection();

    const itemsRaw = await itemCollection?.find({available : true}).toArray() as Item[];
    const items : Item[] = itemsRaw?.map((item) => ({
      ...item,
      id: item._id?.toHexString(),
      img: {mime: item.img.mime, data: item.img.data.toString('base64')}
    }))
    console.log('items received index.ts get-item');
    return items || [];
  } catch (error){
    console.log('error retrieving item', error);
    return [];
  }
})

ipcMain.handle('get-special-deals', async (_) => {
  console.log('Getting special deals')
  try {
    await checkConnection();
    const itemsRaw = await itemCollection?.find({ discount: { $gt: 0 } }).toArray() as Item[];
    const items = itemsRaw?.map((item) => ({
      ...item,
      id: item._id?.toHexString(),
      img: { mime: item.img.mime, data: item.img.data.toString('base64') }
    }));
    console.log('test seeing if theree special deals items', items[0]);
    return items || [];
  } catch (error) {
    console.error('Error getting special deals:', error);
    return [];
  }
});

ipcMain.handle('update-item', async(_, updatedItem : Item) => {
  try {
    console.log('called update', updatedItem);
    await checkConnection();

    if (!ObjectId.isValid(updatedItem.id!)) {
      return { success: false, message: 'Invalid item id' };
    }

    const newItemBackend: Item = {
      ...updatedItem,
      img: {
        mime: updatedItem.img.mime,
        data: typeof updatedItem.img.data === 'string' ? Buffer.from(updatedItem.img.data, 'base64') : updatedItem.img.data
      }
    };

    const result = await itemCollection?.updateOne(
      { _id: ObjectId.createFromHexString(updatedItem.id!) },
      { $set: newItemBackend }
    );

    if (result && result.modifiedCount > 0) {
      return { success: true };
    } else {
      return { success: false, message: 'No item updated' };
    }
  } catch (error) {
    console.error('Error updating item:', error);
    return { success: false, message: 'Error updating item' };
  }
});

// Remove item by id
ipcMain.handle('remove-item', async (_, itemId: string) => {
  try {
    await checkConnection();

    if (!ObjectId.isValid(itemId)) {
      return { success: false, message: 'Invalid item id' };
    }

    const result = await itemCollection?.deleteOne({ _id: ObjectId.createFromHexString(itemId) });

    if (result && result.deletedCount > 0) {
      console.log(`Item with id ${itemId} removed successfully.`);
      return { success: true };
    } else {
      return { success: false, message: 'No item removed' };
    }
  } catch (error) {
    console.error('Error removing item:', error);
    return { success: false, message: 'Error removing item' };
  }
});

ipcMain.handle('get-customer-cart', async (_) => {
  try {
    const cart: CartItem[] = currentUser.cart;
    
    if (!cart || cart.length === 0) {
      return [];
    }

    // gotta adjust with typescript later but this is more simpler
    // {item: Item, amount: number}[] pretty much cartItem but with the actual item
    let itemObjectAndAmount: any = [];
    
    for (const cartItem of cart) {
      if (!ObjectId.isValid(cartItem.itemId)) {
        console.warn(`Invalid itemId: ${cartItem.itemId}`);
        continue;
      }

      const actualItemObject = await itemCollection?.findOne({
        _id: ObjectId.createFromHexString(cartItem.itemId)
      });
      
      if (actualItemObject) {
        const formattedItem = {
          ...actualItemObject,
          id: actualItemObject._id.toHexString(),
          img: {
            mime: actualItemObject.img.mime, 
            data: actualItemObject.img.data.toString('base64')
          }
        };
        
        itemObjectAndAmount.push({
          item: formattedItem,
          amount: cartItem.amount
        });
      } else {
        console.warn(`Item not found for id: ${cartItem.itemId}`);
      }
    }
    return itemObjectAndAmount;
    
  } catch (error) {
    console.error('Error fetching customer cart:', error);
    throw error;
  }
});


ipcMain.handle('get-special-item', async(_) =>{
  try{
    await checkConnection();
    const itemsRaw : Item[] = await itemCollection?.find({special: true}).toArray() as Item[];
    const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id?.toHexString(),
        img: {mime: item.img.mime, data: item.img.data.toString('base64')}
      }))
      return items || [];
  } catch(error){
    console.log('error get special item, main', error);
    return [];
  }

})

ipcMain.handle('get-unique-category', async(_) =>{
  try{
    checkConnection();
    const categoryField = await itemCollection?.distinct('category');
    console.log('categoryField type:',typeof categoryField);
    return categoryField;

  } catch(error) {console.log('Error get-unique-category index.ts: ', error); return {};}
})

// Add item to customer's favorites
ipcMain.handle('add-to-favorites', async (_, itemId: string) => {
  try {
    await checkConnection();
    
    if (!currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    // Check if item already exists in favorites
    const existingFavorite = currentUser.favorites?.find((fav: string) => fav === itemId);
    if (existingFavorite) {
      return { success: false, message: 'Item already in favorites' };
    }

    await customerCollection?.updateOne(
      { email: currentUser.email },
      { $push: { favorites: itemId } }
    );

    // Update current user object
    if (!currentUser.favorites) {
      currentUser.favorites = [];
    }
    currentUser.favorites.push(itemId);

    console.log('Item added to favorites successfully');
    return { success: true };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, message: 'Error adding to favorites' };
  }
});

// Remove item from customer's favorites
ipcMain.handle('remove-from-favorites', async (_, itemId: string) => {
  try {
    await checkConnection();
    
    if (!currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    await customerCollection?.updateOne(
      { email: currentUser.email },
      { $pull: { favorites: itemId } }
    );

    // Update current user object
    if (currentUser.favorites) {
      currentUser.favorites = currentUser.favorites.filter((fav: string) => fav !== itemId);
    }

    console.log('Item removed from favorites successfully');
    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, message: 'Error removing from favorites' };
  }
});

// Get customer's favorite items with full item details
ipcMain.handle('get-customer-favorites', async (_) => {
  try {
    await checkConnection();
    
    if (!currentUser || !currentUser.favorites || currentUser.favorites.length === 0) {
      return [];
    }

    let favoriteItems: Item[] = [];
    
    for (const itemId of currentUser.favorites) {
      if (!ObjectId.isValid(itemId)) {
        console.warn(`Invalid itemId in favorites: ${itemId}`);
        continue;
      }

      const actualItemObject = await itemCollection?.findOne({
        _id: ObjectId.createFromHexString(itemId)
      });
      
      if (actualItemObject) {
        const formattedItem = {
          ...actualItemObject,
          id: actualItemObject._id.toHexString(),
          img: {
            mime: actualItemObject.img.mime, 
            data: actualItemObject.img.data.toString('base64')
          }
        };
        
        favoriteItems.push(formattedItem);
      } else {
        console.warn(`Favorite item not found for id: ${itemId}`);
      }
    }

    return favoriteItems;
  } catch (error) {
    console.error('Error fetching customer favorites:', error);
    return [];
  }
});

// Check if item is in favorites
ipcMain.handle('is-item-favorited', async (_, itemId: string) => {
  try {
    if (!currentUser || !currentUser.favorites) {
      return false;
    }
    
    return currentUser.favorites.includes(itemId);
  } catch (error) {
    console.error('Error checking if item is favorited:', error);
    return false;
  }
});

const increasePopularity = async (itemId) => {
  try{
    await checkConnection();
    console.log('the item id WOOOOOOOOOOOOO: ', itemId);

    itemCollection?.updateOne(
      { _id: ObjectId.createFromHexString(itemId) },
      { $inc: { popularity: 1 } });
  } catch (error){
    console.log(error);
  }
} 

ipcMain.handle('add-order', async (_, orderData: { cartItems: CartItem[], paymentMethod: 'Cash' | 'Card' }) => {
  try {
    console.log(`User successfully payed by ${orderData.paymentMethod}, User buyed cart : ${orderData.cartItems}`)
    await checkConnection();

    if (!currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    // Calculate total from cart items
    let total = 0;
    for (const cartItem of orderData.cartItems) {
      const item = await itemCollection?.findOne({ _id: ObjectId.createFromHexString(cartItem.itemId) });
      if (item) {
        console.log("THE ITEMMM", item);
        total += ((item.price -  (item.price * (item.discount || 0) / 100)) * cartItem.amount);
        increasePopularity(item.id);
      }
    }

    const order: Order = {
      date: new Date(),
      customerEmail: currentUser.email,
      customerName: currentUser.name,
      items: orderData.cartItems,
      orderStatus: 'Processing',
      paymentMethod: orderData.paymentMethod,
      totalPrice: total
    };

    // Insert order
    const result = await orderCollection?.insertOne(order);
    
    if (result?.insertedId) {
      // Add order ID to customer's order history
      await customerCollection?.updateOne(
        { email: currentUser.email },
        { $push: { orderHistory: result.insertedId.toHexString() } }
      );

      // Clear customer's cart
      await customerCollection?.updateOne(
        { email: currentUser.email },
        { $set: { cart: [] } }
      );

      // Update current user
      currentUser.cart = [];
      if (!currentUser.orderHistory) {
        currentUser.orderHistory = [];
      }
      currentUser.orderHistory.push(result.insertedId.toHexString());

      console.log("Successfully added a new order.");
      return { success: true };
    }

    return { success: false, message: 'Failed to create order' };
  } catch (error) {
    console.error('Error adding order:', error);
    return { success: false, message: 'Error adding order' };
  }
});

// for history
ipcMain.handle('get-customer-orders', async (_) => {
  try {
    console.log('Getting customer orders at get-customer-orders')
    await checkConnection();

    if (!currentUser) {
      return [];
    }

    const orders = await orderCollection?.find({ customerEmail: currentUser.email })
      .sort({ date: -1 }) // Most recent first
      .toArray() as Order[];

    // Format orders for frontend
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      // Get full item details for each cart item
      const itemsWithDetails = await Promise.all(order.items.map(async (cartItem) => {
        const item = await itemCollection?.findOne({ _id: ObjectId.createFromHexString(cartItem.itemId) });
        if (item) {
          return {
            ...cartItem,
            itemDetails: {
              ...item,
              id: item._id?.toHexString(),
              img: {
                mime: item.img.mime,
                data: item.img.data.toString('base64')
              }
            }
          };
        }
        return cartItem;
      }));

      return {
        ...order,
        id: order._id?.toHexString(),
        items: itemsWithDetails
      };
    }));

    return formattedOrders;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
});

// TODO add loading screen when getting all order
ipcMain.handle('get-all-orders', async(_) =>{
  try{
      console.log('getting all order get-all-orders')
      await checkConnection();

      const orders = await orderCollection?.find().sort({ date: -1 }).toArray() as Order[];
      return {success: true, orders: orders}
  } catch(error){
    return {success: false, orders: []}
  }
});

import * as fastcsv from 'fast-csv';
import path from 'path';

ipcMain.handle('export-order-to-csv', async(_) => {
  try {
    console.log('Exporting orders to CSV');
    await checkConnection();


    const orders = await orderCollection
      ?.find({}, { projection: { items: 0 } })
      .sort({ date: -1 })
      .toArray() as Order[];
    
    if (orders.length === 0) {
      return { success: false, message: 'No orders found to export' };
    }

    // Generate unique filename with timestamp
    const baseFileName = `orders-export-${new Date().toISOString().split('T')[0]}`;
    let fileName = `${baseFileName}.csv`;
    let filePath = path.join(app.getPath('downloads'), fileName);
    
    // Check if file exists and create unique name if needed
    let counter = 1;
    while (fs.existsSync(filePath)) {
      fileName = `${baseFileName}-(${counter}).csv`;
      filePath = path.join(app.getPath('downloads'), fileName);
      counter++;
    }

    const ws = fs.createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
      fastcsv
        .write(orders, { headers: true })
        .pipe(ws)
        .on('finish', () => {
          console.log('CSV file successfully written to:', filePath);
          resolve();
        })
        .on('error', (err) => {
          console.error('Error writing CSV:', err);
          reject(err);
        });
    });

    return { success: true, filePath, message: `Exported ${orders.length} orders` };
  } catch(error : any) {
    console.error('Error exporting orders to CSV:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-order-to-json', async(_) =>{
  try{
    console.log('Exporting orders to JSON');
    await checkConnection();

    const orders = await orderCollection?.find().sort({date:-1}).toArray() as Order[];

    // Generate unique filename with timestamp
    const baseFileName = `orders-export-${new Date().toISOString().split('T')[0]}`;
    let fileName = `${baseFileName}.json`;
    let filePath = path.join(app.getPath('downloads'), fileName);
    
    // Check if file exists and create unique name if needed
    let counter = 1;
    while (fs.existsSync(filePath)) {
      fileName = `${baseFileName}-(${counter}).json`;
      filePath = path.join(app.getPath('downloads'), fileName);
      counter++;
    }

    const jsonData = JSON.stringify(orders, null, 2);
    await fs.promises.writeFile(filePath, jsonData, 'utf8');
    console.log('JSON file successfully written to:', filePath);

    return { success: true, filePath, message: `Exported ${orders.length} orders` };
  } catch(error : any) {
    console.error('Error exporting orders to CSV:', error);
    return { success: false, error: error.message };
  }
})