import { Link } from 'react-router-dom'

export function Navbar(){
    return(
        <nav className="barra">
            <ul>
                <li>
                    <Link to = '/cadUsusario'>
                        Cadastro de Usuário
                    </Link>
                </li>
                <li>
                    <Link to= '/cadTarefa'>
                        Cadastro de Tarefas
                    </Link>
                </li>
                <li>
                    <Link to='/'>
                        Gerenciar Tarefas
                    </Link>
                </li>
            </ul>
        </nav>
    );
}