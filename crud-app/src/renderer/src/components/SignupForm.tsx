import {useState} from 'react'
import Notification from './Notification';
export default function SignupForm(
    {onChangePage}:
    {onChangePage : (pageName: PageName) => void}
) : React.JSX.Element{
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<{ email: string; password: string; confirmPassword: string }>({ email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotificaiton] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev, 
            [name] : value
        }))
    }
    
    const isValid = async() => {
        const newErrors : {email:string, password:string, confirmPassword: string} = {email:'', password:'', confirmPassword:''};
    
        // Email validation
        if (!formData.email) {
        newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        }
    
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword){
            newErrors.confirmPassword = 'Password do not match'
        }
    
        setErrors(newErrors);
        console.log((Object.keys(newErrors).length === 0));
        return (Object.keys(newErrors).length === 0);
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) =>{
        e.preventDefault();
        if (await !isValid()){return;} // check key or password

        // TODO check email here
        const emailExist : {success: boolean, exist: boolean} = await window.electron.ipcRenderer.invoke('check-email-exist', formData.email);
        if (emailExist.success){
            if (emailExist.exist){
                setErrors({email: 'Email already existed', password: '', confirmPassword: ''});
                return;
            }
        } else{
            console.log('Failed to check email inside database')
            return;
        }

        setIsLoading(true);
        setShowNotificaiton(true);
        await window.electron.ipcRenderer.invoke('add-customer', formData.email, formData.password);
        setIsLoading(false);
    }
    
    
    return (
        
        <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #142D4D 0%, #3C0A06 100%)'
        }}>
            {showNotification && (<Notification notificationMessage={'Account Created, Go back to login page to sign in'} onNotificationEnd={() => setShowNotificaiton(false)} />)}
        <div className="w-full max-w-sm mx-4">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="font-light mb-2">Sign up</h1>   
            </div>

            {/* Form */}
            <div className="space-y-6">
            {/* Email Field */}
            <div>
                <label className="block mb-2 text-left">
                Email
                </label>
                <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className={`w-full px-4 py-3 bg-transparent border rounded-lg  placeholder-gray-400 focus:outline-none focus:border-white transition-colors ${
                    errors.email 
                    ? 'border-red-400' 
                    : 'border-gray-500 hover:border-gray-400'
                }`}
                />
                {errors.email && (
                <p className="mt-1 text-red-400">{errors.email}</p>
                )}
            </div>
    
            {/* Password Field */}
            <div>
                <label className="block mb-2 text-left">
                Password
                </label>
                <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={`w-full px-4 py-3 bg-transparent border rounded-lg  placeholder-gray-400 focus:outline-none focus:border-white transition-colors ${
                    errors.password 
                    ? 'border-red-400' 
                    : 'border-gray-500 hover:border-gray-400'
                }`}
                />
                {errors.password && (
                <p className="mt-1 text-red-400">{errors.password}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label className="block mb-2 text-left">
                Confirm Password
                </label>
                <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className={`w-full px-4 py-3 bg-transparent border rounded-lg  placeholder-gray-400 focus:outline-none focus:border-white transition-colors ${
                    errors.confirmPassword 
                    ? 'border-red-400' 
                    : 'border-gray-500 hover:border-gray-400'
                }`}
                />
                {errors.confirmPassword && (
                <p className="mt-1 text-red-400">{errors.confirmPassword}</p>
                )}
            </div>
    
            {/* Submit Button */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`button ${
                isLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100 active:bg-gray-200'
                }`}
            >
                {isLoading ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating new account...
                </div>
                ) : (
                'Sign up'
                )}
            </button>
    
            {/* Sign Up Link */}
            <div className="text-center">
                <span className="">Back to Login Page? </span>
                <button
                type="button"
                className=" underline hover:no-underline focus:outline-none cursor-pointer"
                onClick={() => onChangePage('loginPage')}
                >
                Log in
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}