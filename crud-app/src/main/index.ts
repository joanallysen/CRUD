import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { contextIsolated } from 'process'

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
    message: 'Are you sure you want to leave this haunted house?',
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


// PRIVATE KEY------------------------------------------------------------------------
const privateKey = process.env.PRIVATE_KEY;

// CONFIGURE ENVIRONMENT ------------------------------------------------------------
dotenv.config();

// MONGODB CONNECTION --------------------------------------------------------------------
const uri = process.env.MONGODB_URI;
let dbClient: MongoClient | null = null;
let db: Db | null = null;
import { Document } from 'mongodb';
let customerCollection: Collection<Document> | null = null;
let adminCollection: Collection<Document> | null = null;
let itemCollection: Collection<Document> | null = null;

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
  if (!db || !customerCollection || !adminCollection || !itemCollection){
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
import {Customer} from '../types/customer'
import {Admin} from '../types/admin'
import {Item} from '../types/item'


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


ipcMain.handle('add-customer', async (_, email: string, password:string) =>{
  console.log(`Adding new customer, email: ${email}, password: ${password}`);

  try{
    await checkConnection();

    password = await hashPassword(password);
    const customer = {
      email: email,
      password: password,
      name: 'User',
      favorite: [],
      history: [],
      cart: [],
      status: 'Not Here'
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
    const admin = {
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
      const customersRaw = await customerCollection?.find({}).toArray();

      const customers = customersRaw?.map((customer) => ({
        ...customer,
        id: customer._id.toHexString(),
      }));

      console.log('Value is not inserted, showing all customer');
      return customers;
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
      const adminsRaw = await adminCollection?.find({}).toArray();
      
      const admins = adminsRaw?.map((admin) => ({
        ...admin,
        id: admin._id.toHexString(),
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
ipcMain.handle('update-customer', async(_, keyAndValue:Record<string, any>) =>{
  try{
    await checkConnection();

    console.log('The current user is:', currentUser);
    console.log('Updating user.......')

    await customerCollection?.updateOne(
      {email: currentUser.email},
      {
        $set:{keyAndValue}
      }
    )
    console.log('Customer data succesfully modified');
    return {success: true};
  } catch(error){
    console.error('Error updating customer:', error);
    return {success:false};
  }
})

ipcMain.handle('save-customer-cart', async(_, cartObject: Customer['cart']) =>{
  try{
    await checkConnection();
    console.log(currentUser.email);
    
    console.log('cartObject:', cartObject);

    await customerCollection?.updateOne(
      { email: currentUser.email },
      { $set: { cart: cartObject } }  // Save the array directly
    );

    return {success: true};
  } catch(error){
    console.error('Error updating customer cart', error);
    return {success: false};
  }
})


// FOR ITEM REMEMBER TO ALWAYS CONVER BUFFER TO STRING AND STRING BACK TO BUFFER IN BACKEND
ipcMain.handle('add-item', async(_,name:string, description: string, price: number, img: {mime: string, data: string}, category:string, discount: number, available: boolean, popularity: number) =>{
  try{
    await checkConnection();

    const item = {
      name: name,
      description: description,
      price: price,
      img: {mime:img.mime, data:Buffer.from(img.data, 'base64')},
      category: category,
      discount: discount,
      available: available,
      popularity: popularity,
      modifiedAt: new Date(),
    }

    await itemCollection?.insertOne(item);
    console.log("Successfully added a new item.");
    return {success: true};
  }
    catch (error){
      console.error('Error adding item:', error);
    return {success: false};
  }
} 
),

ipcMain.handle('get-item', async(_, category:string = '', name:string = '') =>{
  try{
    await checkConnection();


    if (category !== ''){
      console.log('Getting items... index.ts');
      const itemsRaw = await itemCollection?.find({category:category}).toArray();
      const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id.toHexString(),
        img: {mime: item.img.mime, data: item.img.data.toString('base64')}
      }))
      console.log('items received index.ts get-item');
      return items || [];
    }

    if(name !== ''){
      console.log('Getting items by name');
      const itemsRaw = await itemCollection?.find({name: {$regex:name, $options:'i'}}).toArray();
      const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id.toHexString(),
        img: {mime: item.img.mime, data: item.img.data.toString('base64')}
      }))
      console.log('items received index.ts get-item by name: ', items?.length);
      return items || [];
    }

      const itemsRaw = await itemCollection?.find().toArray();
      const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id.toHexString(),
        img: {mime: item.img.mime, data: item.img.data.toString('base64')}
      }))
      console.log('items received index.ts get-item');
      return items || [];
  } catch (error){
    console.log('error retrieving item', error);
    return [];
  }
})

ipcMain.handle('get-customer-cart', async (_) => {
  try {
    const cart: { itemId: string, amount: number }[] = currentUser.cart;
    
    if (!cart || cart.length === 0) {
      return [];
    }

    // gotta adjust with typescript later but this is more simpler
    // {item: Item, amount: number}[]
    let itemObjectAndAmount: any[] = [];
    
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
    
    console.log('itemObject:', itemObjectAndAmount);
    return itemObjectAndAmount;
    
  } catch (error) {
    console.error('Error fetching customer cart:', error);
    throw error;
  }
});


ipcMain.handle('get-special-item', async(_) =>{
  try{
    await checkConnection();
    const itemsRaw = await itemCollection?.find({special: true}).toArray();
    const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id.toHexString(),
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
    const categoryField = itemCollection?.distinct('category');
    console.log('categoryField type:',typeof categoryField);
    return categoryField;

  } catch(error) {console.log('Error get-unique-category index.ts: ', error); return {};}
})