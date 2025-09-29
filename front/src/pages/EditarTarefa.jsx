import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// schema de validção de edição de tarefas
const schemaEditarTarefas = z.object({
    prioridade: z.enum(['baixa', 'media', 'alta'], {
        errorMap: () => ({ message: "Escolha uma prioridade" })
    }),
    status: z.enum(['a fazer', 'fazendo', 'pronto'], {
        errorMap: () => ({ message: "Escolha o estado da tarefa" }),
    })
})

export function EditarTarefa() {
    const { id } = useParams(); // pega o id passado na rota
    const [tarefa, setTarefa] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({ resolver: zodResolver(schemaEditarTarefas) });

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/tarefa/${id}/`)
            .then((res) => {
                console.log(res)
                setTarefa(res.data);
                // atualiza os valores do formulário com os dados da tarefa
                reset({
                    prioridade: res.data.prioridade,
                    status: res.data.status,
                });
            })
            .catch((err) => console.error("Erro ao buscar tarefa", err))
    }, [id, reset]);

    // função que envia os dados editados para a API
    async function salvarEdicao(data) {
        try {
            await axios.patch(`http://127.0.0.1:8000/tarefa/${id}/`, data);
            console.log("Os dados foram: ", data)
            alert("Tarefa editada com sucsso")
        } catch (err) {
            console.log("Deu red", err)
            alert("Houve um erro ao editar sua tarefa")
        }
    }

    return (
        <section>
            <form
                className="formularios"
                onSubmit={handleSubmit(salvarEdicao)}
                aria-labelledby="editar-tarefa-title" // associa o form ao título para leitores de tela
            >
                <h2 id="editar-tarefa-title">Editar Tarefa</h2>

                {/* Descrição (somente leitura) */}
                <label htmlFor="desc_tarefa">Descrição:</label>
                <textarea
                    id="desc_tarefa"
                    value={tarefa?.desc_tarefa}
                    readOnly
                />

                {/* Setor (somente leitura) */}
                <label htmlFor="setor">Setor:</label>
                <input
                    id="setor"
                    type="text"
                    value={tarefa?.nome_setor}
                    readOnly
                />

                {/* Prioridade */}
                <label htmlFor="prioridade">Prioridade</label>
                <select
                    id="prioridade"
                    {...register('prioridade')}
                    aria-invalid={errors.prioridade ? "true" : "false"} // indica erro
                    aria-describedby={errors.prioridade ? "prioridade-error" : undefined} // conecta com mensagem de erro
                >
                    <option value=''> Selecione prioridade</option>
                    <option value='baixa'> Baixa </option>
                    <option value='media'> Media </option>
                    <option value='alta'> Alta </option>
                </select>
                {errors.prioridade && <p id="prioridade-error">{errors.prioridade.message}</p>}

                {/* Status */}
                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    {...register('status')}
                    aria-invalid={errors.status ? "true" : "false"} // indica erro
                    aria-describedby={errors.status ? "status-error" : undefined} // conecta com mensagem de erro
                >
                    <option value="a fazer">A fazer</option>
                    <option value="fazendo">Fazendo</option>
                    <option value="pronto">Pronto</option>
                </select>
                {errors.status && <p id="status-error">{errors.status.message}</p>}

                {/* Botão de envio */}
                <button type='submit'>Editar</button>
            </form>
        </section>
    )
}
