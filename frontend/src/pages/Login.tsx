import LoginForm from "../components/LoginForm";
import {Link} from 'react-router-dom'

function Login(){
    return (
        <div>
            <h1>Login</h1>
            <LoginForm />
            <p>Don't have an account ? <Link to="/register">Sign up here</Link></p>
        </div>
    );
}

export default Login;