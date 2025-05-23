import {useState} from 'react'
import electronLogo from './assets/electron.svg'
import uploadPicture from "../assets/addPicture.svg"

import {User} from '../../types/user';
import {Admin} from '../../types/admin';
import {Item} from '../../types/item';

import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

type PageName = 'userPage' | 'adminPage' | 'loginPage';

function App(): React.JSX.Element {

  // const addItem = (
  //   name: string,
  //   description: string,
  //   price: number,
  //   img: { mime: string, data: string },
  //   category: string,
  //   available: boolean,
  //   popularity: number
  // ): Promise<void> =>
  //   window.electron.ipcRenderer.invoke(
  //     'add-item',
  //     name,
  //     description,
  //     price,
  //     img,
  //     category,
  //     available,
  //     popularity
  //   );

const [page, setPage] = useState<PageName>('loginPage');
  function handleChangePage(pageName: PageName){
    console.log('Page changed to ', pageName);
    setPage(pageName);
  }

  return (
    <>
      {page == 'loginPage' && <LoginPage onChangePage={handleChangePage}/>}
      {page == 'adminPage' && <AdminPage onChangePage={handleChangePage} />}
      {page == 'userPage' && <UserPage onChangePage={handleChangePage} />}
    </>
  );
}

export default App
