import RegisterForm from "../components/RegisterForm"
import {Link} from 'react-router-dom'

export default function(){
    return (
        <div>
            <h1>Sing up</h1>
            <RegisterForm />
            <p>Already have an account ? <Link to="\login">Sign in here</Link></p>
        </div>
    );
};
