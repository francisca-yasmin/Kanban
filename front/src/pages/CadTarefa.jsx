import axios from 'axios'; // eh o hook que faz comunicação com a internet (http)
/**
 * hooks que permite a validação de interação com o usuário
 * NUNCA DUVIDE DA CAPACIDADE DO USUARIO
 * react é comum ver o zod
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; // Hook determinado pela palavra (use) na frente
import { z } from 'zod'; // zod é uma descrição de como eu validar, quais serial as regras
import { zodResolver } from '@hookform/resolvers/zod'; // é o que liga o hook form com o zod
import { useNavigate } from 'react-router-dom'; // permite navegar entre as páginas

const schemaCadTarefa = z.object({
    desc_tarefa: z.string()
        .trim()
        .min(10, 'Insira ao menos uma frase')
        .max(100, 'Insira uma descrição válida')
        .refine((val) => /[A-Za-zÀ-ÿ0-9]/.test(val), {
        message: 'Descrição inválida: use letras ou números'
    }),

    nome_setor: z.string()
        .trim()
        .min(1, 'Insira o nome do setor')
        .max(100, 'Máximo 100 caracteres')
        .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Digite apenas letras'),

    prioridade: z
        .string()
        .refine(val => ['baixa', 'media', 'alta'].includes(val), {
        message: 'Prioridade inválida'
    }),

    status: z.enum(['a fazer', 'fazendo', 'pronto'], {
        errorMap: () => ({ message: 'Status inválido' })
    }),

  usuario_id: z.preprocess((val) => {
      // Se o valor não for número válido, transforma em undefined para disparar required_error
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number({
      required_error: "Escolha um usuário",
      invalid_type_error: "Escolha um usuário",
    })
    .int()
    .positive("ID do usuário inválido")
  )

});

export function CadTarefa() {
    const [usuarios, setUsuarios] = useState([]);
    const navigate = useNavigate();

    const {
        register, // registra pra mim oq o usuario faz
        handleSubmit, // no momento em que ele der um submit (botao)
        formState: { errors }, // no formulario, se der ruim guarda os erros na variavel errors
        reset
    } = useForm({
        resolver: zodResolver(schemaCadTarefa), // para validar eu chamo o resolver
        defaultValues: {
            status: 'a fazer'
        }
    });

    useEffect(() => {
        async function buscarUsuario() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/usuario/')
                setUsuarios(response.data);
            } catch (error) {
                console.error("erro", error);
            }
        }
        buscarUsuario(); // chamando minha função para chamar usuarios
    }, [])

    async function obterDados(data) {
        console.log("dados da tarefa informado pelo usuario: ", data)

        try {
            await axios.post("http://127.0.0.1:8000/tarefa/", data);
            alert("Tarefa cadastrada com sucesso");
            reset(); /// limpo meu form
            navigate('/') // depois de cadastrar a tarefa, levo o usuario para o quadro
        } catch (error) {
            alert("Erro no cadastro da tarefa. Verifique as informações")
            console.log("Erros", error)
            console.log(error.response.data)
        }
    }

    return (
        <form className='formularios' onSubmit={handleSubmit(obterDados)} aria-labelledby="form-cadastro-tarefa">
            <h2 id="form-cadastro-tarefa"> Cadastro de Tarefas </h2>

            {/* Nome do usuário */}
            <label htmlFor="usuario">Nome do usuário </label>
            <select
                id="usuario"
                {...register('usuario_id', { valueAsNumber: true })}
                aria-invalid={errors.usuario ? "true" : "false"}
                aria-describedby={errors.usuario ? "usuario-error" : undefined}
            >
                <option value="">Selecione o usuário</option>
                {usuarios.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.nome}
                    </option>
                ))}
            </select>
            {errors.usuario_id && <p id="usuario-error" className='errors'>{errors.usuario_id.message}</p>}

            {/* Descrição da tarefa */}
            <label htmlFor="desc_tarefa">Descrição: </label>
            <input
                type="text"
                id="desc_tarefa"
                placeholder='descrição da tarefa'
                {...register("desc_tarefa")}
                aria-invalid={errors.desc_tarefa ? "true" : "false"}
                aria-describedby={errors.desc_tarefa ? "desc_tarefa-error" : undefined}
            />
            {errors.desc_tarefa && <p id="desc_tarefa-error" className='errors'> {errors.desc_tarefa.message}</p>}

            {/* Nome do setor */}
            <label htmlFor="nome_setor">Nome do setor: </label>
            <input
                type="text"
                id="nome_setor"
                {...register("nome_setor")}
                placeholder='trabalho'
                aria-invalid={errors.nome_setor ? "true" : "false"}
                aria-describedby={errors.nome_setor ? "nome_setor-error" : undefined}
            />
            {errors.nome_setor && <p id="nome_setor-error" className='errors'> {errors.nome_setor.message}</p>}

            {/* Prioridade */}
            <label htmlFor="prioridade">Prioridade: </label>
            <select
                id="prioridade"
                {...register("prioridade")}
                aria-invalid={errors.prioridade ? "true" : "false"}
                aria-describedby={errors.prioridade ? "prioridade-error" : undefined}
            >
                <option value=""> Selecione o nível de prioridade</option>
                <option value="baixa">Baixa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
            </select>
            {errors.prioridade && <p id="prioridade-error" className='errors'>{errors.prioridade.message}</p>}

            {/* Status */}
            <label htmlFor="status">Status: </label>
            <select
                readOnly
                id="status"
                {...register("status")}
                aria-invalid={errors.status ? "true" : "false"}
                aria-describedby={errors.status ? "status-error" : undefined}
            >
                <option value=""> Selecione o status da tarefa</option>
                <option value="a fazer">Fazer</option>
            </select>
            {errors.status && <p id="status-error" className='errors'> {errors.status.message}</p>}

            <button type='submit'>Cadastrar tarefa</button>
        </form>
    )
}
