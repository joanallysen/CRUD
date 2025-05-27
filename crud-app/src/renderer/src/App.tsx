import {useState} from 'react'
import electronLogo from './assets/electron.svg'
import uploadPicture from "../assets/addPicture.svg"

import {Customer} from '../../types/customer';
import {Admin} from '../../types/admin';
import {Item} from '../../types/item';

import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

function App(): React.JSX.Element {
  const [page, setPage] = useState<PageName>('loginPage');
  
  function handleChangePage(pageName: PageName){
    console.log('Page changed to ', pageName);
    setPage(pageName);
  }

  return (
    <>
      {page == 'loginPage' && <LoginPage onChangePage={handleChangePage}/>}
      {page == 'adminPage' && <AdminPage onChangePage={handleChangePage} />}
      {page == 'customerPage' && <CustomerPage onChangePage={handleChangePage} />}
      {page == 'signUpPage' && <SignUpPage onChangePage={handleChangePage} />}
    </>
  );
}

export default App
