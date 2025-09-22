import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
//fazendo o uso do drag
import { useDraggable } from "@dnd-kit/core"; //usando a biblioteca de arrastar

export function Tarefa({ tarefa }){
    const [status, setStatus] = useState(tarefa.status || "");
    const navigate = useNavigate();

   const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: tarefa.id,
    });

    //style para usar o transform para dar a sensação de arraste para o usuário
    const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
        : undefined;

    //fazendo a exclusão de uma tarefa
    //async eh porque eu não sei extamente o tempo de resposta
    //função deve ter um nome que remeta a sua funcionalidade
    async function excluirTarefa(id) {

        if(window.confirm("Tem certeza que deseja excluir esta tarefa?")){
            try {
                await axios.delete(`http://127.0.0.1:8000/tarefa/${id}/`);
                alert("Tarefa excluida com sucesso.");
                window.location.reload(); //recarregar a pagina com a tarefa excluida -> refresh
            }catch(error){
                console.error("Erro ao excluir tarefa:", error);
                alert("Erro ao excluir tarefa.");
            }
        }
    }//fim da função
    
    async function alterarStatus() {
        event.preventDefault();
        try{
            await axios.patch(`http://127.0.0.1:8000/tarefa/${tarefa.id}/`, {
                status: status,
            });
            alert("Status alterado com sucesso!");
            window.location.reload();
        } catch (error) {
            console.error("Erro ao alterar status:", error.response?.data || error);
            alert("Erro ao alterar status.");
        }        
    }

    return(
        // configurar bonitinhos cluninhas
        // ... => serve para desconpactar arrays - tranformando cada atributo do array em uma variavel única
       <article className="tarefa" ref ={setNodeRef} style={style} {...listeners}{...attributes}> 
            <header>
                    <h3 id={`tarefa-${tarefa.id}`}>{tarefa.descricao}</h3>
            </header>
            {/* dl -> lista de detalhes == dd -> detalhe do detalhe */}
            <dl>
                <dt>Setor:</dt>
                <dd>{tarefa.setor}</dd>

                <dt>Prioridade:</dt>
                <dd>{tarefa.prioridade}</dd>
            </dl>

                <button type="button" onClick={() => navigate(`/editarTarefa/${tarefa.id}`)}>Editar</button>
                <button type="button" onClick={() => excluirTarefa(tarefa.id)}>Excluir </button>

            <form>
                <label>Status:</label>
                <select id={tarefa.id} name='status' value={status} onChange={(e) => setStatus(e.target.value)}>
                     {/* se houver mudança no campo de status isso é um evento que mudara
                     esse evento armazenado no state  */}
                    <option value="">Selecione o status</option>
                    <option value="a fazer">A Fazer</option>
                    <option value="fazendo">Fazendo</option>
                    <option value="pronto">Pronto</option>
                </select>
                <button type="button" onClick={alterarStatus}>Alterar status</button>
            </form>
        </article>

    );
}

