import axios from 'axios'; // eh o hook que faz comunicação com a internet (http)
/**
 * hooks que permite a validação de interação com o usuário
 * NUNCA DUVIDE DA CAPACIDADE DO USUARIO
 * react é comum ver o zod
 */
import { useForm } from 'react-hook-form'; // Hook determinado pela palavra (use) na frente
import { z } from 'zod'; // zod é uma descrição de como eu validar, quais serial as regras
import { zodResolver } from '@hookform/resolvers/zod'; // é o que liga o hook form com o zod

// validação de formulario -- estou usadno as regras do zod, que pode ser consultada na web
const schemaCadUsuario = z.object({
    nome: z.string()
        .min(1, ' Insira ao menos 1 caractere')
        .max(100, 'Insira no maximo 100 caracteres')
        .regex(
            /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/,
            "Digite nome completo (nome e sobrenome), sem números ou símbolos, sem espaços no início e fim"
        ),
    email: z.string()
        .min(1, 'Insira seu email')
        .max(255, 'Insira um e-mail com até 255 caracteres')
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Formato de email inválido"
        ),
})

export function CadUsuario() {

    const {
        register, // registra pra mim oq o usuario faz
        handleSubmit, // no momento em que ele der um submit (botao)
        formState: { errors }, // no formulario, se der ruim guarda os erros na variavel errors
        setValue,
        reset
    } = useForm({
        resolver: zodResolver(schemaCadUsuario) // para validar eu chamo o resolver
    });

    // tratamento para o campo nome (apenas para prevenir entrada inválida antes do submit)
    const handleNomeChange = (e) => {
        let valor = e.target.value;
        valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, ""); // só letras e espaço
        valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
        if (valor.length > 100) valor = valor.slice(0, 100); // máximo 30 chars
        setValue("nome", valor)
    };

    const handleEmailChange = (e) => {
        let valor = e.target.value.trim();
        if (valor.length > 255) valor = valor.slice(0, 255); // máximo 50 chars
        setValue("email", valor, { shouldValidate: true});
    };

    async function obterdados(data) {
        console.log('dados informados pelo user:', data)

        // para grande parte das interações com outra plataforma eh necessario usar o try
        try {
            await axios.post("http://127.0.0.1:8000/usuario/", data);
            alert("Usuário cadastrado com sucesso");
            reset(); // limpo o formulario depois do cadastro
        } catch (error) {
            alert("Tente novamente, por favor")
            console.log("Erros", error)
        }
    }

    return (
        <form role='form' className='formularios' onSubmit={handleSubmit(obterdados)} aria-labelledby="form-cadusuario">
            <h2 id="form-cadusuario">Cadastro do Usuário </h2>

            {/* Nome */}
            <label htmlFor='nome'>Nome:</label>
            <input
                {...register("nome")}
                onChange={handleNomeChange}
                type="text"
                id='nome'
                placeholder='francisca yasmin'
                aria-invalid={errors.nome ? "true" : "false"}
                aria-describedby={errors.nome ? "nome-error" : undefined}
            />
            {/* aqui eu vejo a variavel erros no campo nome e exibo a mensagem de erro para o usuario */}
            {errors.nome && <p id="nome-error" className='errors'>{errors.nome.message}</p>}

            {/* Email */}
            <label htmlFor='email'> Email: </label>
            <input
                type="email"
                id='email'
                {...register("email")}
                onChange={handleEmailChange}
                placeholder='email@gmail.com'
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <p id="email-error" className='errors'> {errors.email.message}</p>}

            <button type='submit'>Cadastrar</button>
        </form>
    );
}
