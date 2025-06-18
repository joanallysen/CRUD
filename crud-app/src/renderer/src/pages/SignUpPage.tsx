import SignupForm from "@renderer/components/SignupForm";

export default function SignUpPage({onChangePage}:{onChangePage: (p:PageName) => void}) : React.JSX.Element{
    return(
        <SignupForm onChangePage={onChangePage}/>
    )
}