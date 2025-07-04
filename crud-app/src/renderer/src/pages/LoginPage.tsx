import LoginForm from '../components/LoginForm'

export default function LoginPage({onChangePage} : {onChangePage: (p:PageName) => void}) : React.JSX.Element{
    return(
        <>
            <div>
                <LoginForm onChangePage={onChangePage}></LoginForm>
            </div>
        </>
    )
}