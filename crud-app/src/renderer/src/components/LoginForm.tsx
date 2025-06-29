import {useState} from "react";

export default function LoginForm({onChangePage} : {onChangePage: (p: PageName) => void}) : React.JSX.Element{
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ email: string; password: string }>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isValid = async() => {
    const newErrors : {email:string, password:string} = {email:'', password:''};
    console.log('formData.email:', formData.email);

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

    setErrors(newErrors);
    console.log('Isvalid value: ', Object.values(newErrors).some(msg => msg === ''))
    return Object.values(newErrors).every(msg => msg === '');
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!(await isValid())) {
      console.log("it's not valid, isValid returned true");
      return;
    }

    const result = await window.electron.ipcRenderer.invoke('verify-account', formData.email, formData.password);
    const newErrors : {email:string, password:string} = {email:'', password:''};

    console.log('result: loginform.tsx', result);
    if (Object.keys(result).length === 0){
      newErrors.password = 'Email or password not found';
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setLoginMessage('');

    if (result.isAdmin){
      setLoginMessage('Login successful! Welcome back admin!');
      setIsLoading(false);
      onChangePage('adminPage');
    } else{
      setLoginMessage('Login successful! Welcome back customer!');
      setIsLoading(false);
      onChangePage('customerPage');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #142D4D 0%, #3C0A06 100%)'
    }}>
      <div className="w-full max-w-sm mx-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-2">Login</h1>
        </div>

        {/* Login Message */}
        {loginMessage && (
          <div className={`mb-6 p-3 rounded ${
            loginMessage.includes('successful') 
              ? 'bg-green-900 bg-opacity-50 text-green-200 border border-green-700' 
              : 'bg-red-900 bg-opacity-50 text-red-200 border border-red-700'
          }`}>
            {loginMessage}
          </div>
        )}

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
          <div className="mb-21">
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 bg-transparent border border-gray-500 rounded focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="remember-me" className="ml-2 ">
                Remember Me
              </label>
            </div>
            <button
              type="button"
              className=" underline hover:no-underline focus:outline-none"
            >
              Forgot Password?
            </button>
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
                Logging in...
              </div>
            ) : (
              'Log In'
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="">Don't have an account? </span>
            <button
              type="button"
              className=" underline hover:no-underline focus:outline-none cursor-pointer"
              onClick={() => onChangePage('signUpPage')}
            >
              Create One Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
