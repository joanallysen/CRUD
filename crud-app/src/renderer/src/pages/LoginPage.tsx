import {useState} from 'react';
import {User} from '../../../types/user'
import {Admin} from '../../../types/admin'

import LoginForm from '../components/LoginForm'

type PageName = 'userPage' | 'adminPage' | 'loginPage';
function Debugform({isAdmin}: {isAdmin: boolean}) : React.JSX.Element{
    const addUser = (email: string, password: string): Promise<void> =>
    window.electron.ipcRenderer.invoke('add-user', email, password);

    const addAdmin = (email: string, password: string): Promise<void> =>
    window.electron.ipcRenderer.invoke('add-admin', email, password);
    
    const [email, setEmail] = useState('');
    const [password, setPassword]= useState('');

    let text = 'user';
    if(isAdmin){
        text = 'admin';
    }

    const handleAdd = () =>{
        if (email.trim() === '' || password.trim() === '') {
        console.log('Email or password is empty!');
        return;
        }

        if(isAdmin){
            console.log('Adding new admin...');
            addAdmin(email, password);
        } else if(!isAdmin){
            console.log('Adding new user...');
            addUser(email, password);
        }

        setEmail('');
        setPassword('');
    }

    return(
        <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', flexDirection: 'row', gap: '2rem'}}>
            <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`Enter new ${text} email...`}
            />
            <input 
            type="text" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Enter new ${text} password...`}
            />

            <button onClick={handleAdd}>
            Add new {text}
            </button>
        </div>
    )
}

export default function LoginPage({onChangePage} : {onChangePage: (p:PageName) => void}) : React.JSX.Element{
    const [users, setUsers] = useState<User[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);

    const getUser = (email: string): Promise<User[]> =>
    window.electron.ipcRenderer.invoke('get-user', email);

    const getAdmin = (email: string): Promise<Admin[]> =>
    window.electron.ipcRenderer.invoke('get-admin', email);


    const handleGetUser = async () => {
        console.log("Getting users...");
        const users = await getUser('');
        console.log('Received users in UI: ', users);
        setUsers(users);
    }

    const handleGetAdmin = async () => {
        console.log("Getting users...");
        const admins = await getAdmin('');
        console.log('Received admins in UI: ', admins);
        setAdmins(admins);
    }


    return(
        <>
            <div>
                <LoginForm onChangePage={onChangePage}></LoginForm>
                <h1> Debug Section 🐛</h1>
                <Debugform isAdmin={true}></Debugform>
                <Debugform isAdmin={false}></Debugform>
                
                <div className='flex .m-0 justify-center text-center gap-4'>
                    <ul>
                    <h3>Users: </h3>
                    {users.map((user, index) =>{
                        return <li key={index}>{user.email} {user.password}</li>
                    })}
                    <button onClick={handleGetUser} className='border-black p-2.5 border-1 rounded-2xl cursor-pointer'>Refresh User</button>
                    </ul>

                    <ul>
                    <h3>Admins: </h3>
                    {admins.map((admin, index) =>{
                        return <li key={index}>{admin.email} {admin.password}</li>
                    })}
                    <button onClick={handleGetAdmin} className='border-black p-2.5 border-1 rounded-2xl cursor-pointer'>Refresh Admin</button>
                    </ul>
                </div>
            </div>
        </>
    )
}