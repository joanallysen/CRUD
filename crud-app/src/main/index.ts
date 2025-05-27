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

async function connectToMongoDB(){
  try{
    console.log(`Mongodb uri: ${uri}`)
    dbClient = new MongoClient(uri!);
    await dbClient.connect();
    console.log('Connecting to MongoDB');
    db = dbClient.db(process.env.DB_NAME || 'my-app');
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
  if (!db){
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

    // checkEmailExist(email);
    let collection; let matchedAccount;
    collection = db?.collection('admins');
    matchedAccount = await collection?.findOne({email: email});
    console.log(password);
    // console.log(matchedAccount);
    if(matchedAccount && await bcrypt.compare(password, matchedAccount.password)){
      console.log(`email: ${email} matched! in admin`)
      return {matchedAccount, isAdmin: true};
    }

    collection = db?.collection('customer');
    matchedAccount = await collection?.findOne({email: email});
    if(matchedAccount && await bcrypt.compare(password, matchedAccount.password)){
      console.log(`email: ${email} matched! in customer`);
      return {matchedAccount, isAdmin:false}
    }

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

    const collection = db?.collection('customer');
    password = await hashPassword(password);
    const customer = {
      email: email,
      password: password,
      name: 'User',
      favorite: [],
      history: [],
      currentCart: [],
      status: 'Not Here'
    }

    await collection?.insertOne(customer);
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

    const collection = db?.collection('admins');
    password = await hashPassword(password);
    const admin = {
      email: email,
      password: password,
    }
    await collection?.insertOne(admin);
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
      const collection = db?.collection('customers');
      const customersRaw = await collection?.find({}).toArray();

      const customers = customersRaw?.map((customer) => ({
        ...customer,
        id: customer._id.toHexString(),
      }));

      console.log('Value is not inserted, showing all customer');
      return customers;
    }
    
    // TODO
    const collection = db?.collection('customers');
    const data = await collection?.find({email: email}).toArray();
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
      const collection = db?.collection('admins');
      const adminsRaw = await collection?.find({}).toArray();
      
      const admins = adminsRaw?.map((admin) => ({
        ...admin,
        id: admin._id.toHexString(),
      }));
      
      console.log('Value is not inserted, showing all admin');
      return admins;
    }
    
    // TODO
    const collection = db?.collection('admins');
    const data = await collection?.find({email: email}).toArray();
    return data;
  } catch(error){
    console.error('Error getting admin:', error);
    return [];
  }
})

ipcMain.handle('update-customer', async(_, email:string, keyAndValue:Record<string, any>) =>{
  try{
    await checkConnection();

    const collection = db?.collection('customers');

    await collection?.updateOne(
      {email: email},
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


ipcMain.handle('add-item', async(_, name:string, description: string, price: number, img: {mime: string, data: string}, category:string, special: boolean, available: boolean, popularity: number) =>{
  try{
    await checkConnection();

    const collection = db?.collection('items');
    const item = {
      name: name,
      description: description,
      price: price,
      img: {mime:img.mime, data:Buffer.from(img.data, 'base64')},
      category: category,
      special: special,
      available: available,
      popularity: popularity,
      modifiedAt: new Date(),
    }

    await collection?.insertOne(item);
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
      const collection = db?.collection('items');
      const itemsRaw = await collection?.find({category:category}).toArray();
      const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id.toHexString(),
        img: {mime: item.img.mime, data: item.img.data.toString('base64')}
      }))
      console.log('items received index.ts get-item:');
      return items || [];
    }

    if(name !== ''){
      console.log('Getting items by name');
      const collection = db?.collection('items');
      const itemsRaw = await collection?.find({name: {$regex:name, $options:'i'}}).toArray();
      const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id.toHexString(),
        img: {mime: item.img.mime, data: item.img.data.toString('base64')}
      }))
      console.log('items received index.ts get-item by name: ', items?.length);
      return items || [];
    }

    const collection = db?.collection('items');
      const itemsRaw = await collection?.find().toArray();
      const items = itemsRaw?.map((item) => ({
        ...item,
        id: item._id.toHexString(),
        img: {mime: item.img.mime, data: item.img.data.toString('base64')}
      }))
      console.log('items received index.ts get-item:');
      return items || [];
  } catch (error){
    console.log('error retrieving item', error);
    return [];
  }
})

ipcMain.handle('get-special-item', async(_) =>{
  try{
    await checkConnection();
    const collection = db?.collection('items');
    const itemsRaw = await collection?.find({special: true}).toArray();
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
    const categoryField = db?.collection('items').distinct('category');
    console.log('categoryField type:',typeof categoryField);
    return categoryField;

  } catch(error) {console.log('Error get-unique-category index.ts: ', error);}
})