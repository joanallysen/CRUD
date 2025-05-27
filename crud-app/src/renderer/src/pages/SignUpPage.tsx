import { useState } from "react"

export default function SignUpPage({onChangePage}:{onChangePage: (p:PageName) => void}) : React.JSX.Element{
    const [accountMade, setAccountMade] = useState<string>('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })

    const handleAddCustomer = () => {
        if (formData.password !== formData.confirmPassword){
            console.log('error!!!');
            // todo errorrr!!
            return;
        }
        console.log('password correct!');
        window.electron.ipcRenderer.invoke('add-customer', formData.email, formData.password);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev, 
            [name] : value
        }))
    }

    return(
        <div>
            <h1>Sign Up Page</h1>
            <form action="">
                <label>Email</label>
                <input type="text" name="email" value={formData.email} onChange={handleInputChange}/>
                <label>Password</label>
                <input type="text" name="password" value={formData.password} onChange={handleInputChange}/>
                <label>Confirm Password</label>
                <input type="text" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}/>
                <input type="submit" onClick={() => handleAddCustomer()} />
            </form>
        </div>
    )
}