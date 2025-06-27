import {useState} from 'react'

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
      {page == 'signUpPage' && <SignUpPage onChangePage={handleChangePage} />}
      {page == 'customerPage' && <CustomerPage onChangePage={handleChangePage} />}
      
    </>
  );
}

export default App
