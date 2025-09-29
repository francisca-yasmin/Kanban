import React, { useState, useEffect } from 'react';
import axios from 'axios'; // import do axios
import { Coluna } from './Coluna';
import { DndContext } from '@dnd-kit/core'; // biblioteca para drag and drop -> clicar e arrastar

export function Quadro() {
    const [tarefas, setTarefas] = useState([]);

    // o Effect é um hook que permite a renderização de alguma coisa na tela
    useEffect(() => {

        // construo uma variável com o endereço da API
        const apiURL = 'http://127.0.0.1:8000/tarefa/';

        // permite a chamada do endereço
        axios.get(apiURL)

            // se a resposta for positiva
            .then(response => {
                setTarefas(response.data)
            })

            // se der algum problema
            .catch(error => {
                console.error("Houve um erro ao buscar os dados da API:", error);
            });
    }, []);


    function handleDragEnd(event) {
        // variaveis que vai me falar de onde está saindo a transição de clicar e arrastar
        // eu preciso rastrear de onde vem e de onde 
        const { active, over } = event;

        if (over && active) {
            const tarefaId = active.id; // quero pegar o ID da tarefa que ta sofrendo o evento
            const novaColuna = over.id; // quero pegar a coluna da tarefa
            setTarefas(prev =>
                prev.map(tarefa => tarefaId === tarefa.id ? { ...tarefa, status: novaColuna } : tarefa)
            );

            // Atualiza o status do card (muda a situação do card {a fazer/ fazendo / pronto})
            axios.patch(`http://127.0.0.1:8000/tarefa/${tarefaId}/`, {
                status: novaColuna
            })
                .catch(err => console.error("Erro ao  atualizar status: ", err));
        }
    }

    // armazenando em variáveis o resultado de uma função callback que procura tarefas com um certo status
    // criação de attays com os status possiveis no kanban
    const tarefasAfazer = tarefas.filter(tarefa => tarefa.status === 'a fazer');
    const tarefasFazendo = tarefas.filter(tarefa => tarefa.status === 'fazendo');
    const tarefasPronto = tarefas.filter(tarefa => tarefa.status === 'pronto');

    return (

        <DndContext onDragEnd={handleDragEnd}>
            <main className="conteiner" role="main">
                <h1>Minhas Tarefas</h1>

                <section className="colunas" role="list">
                    <Coluna id='a fazer' titulo="a fazer" tarefas={tarefasAfazer} />
                    <Coluna id='fazendo' titulo="fazendo" tarefas={tarefasFazendo} />
                    <Coluna id='pronto' titulo="pronto" tarefas={tarefasPronto} />
                </section>

            </main>
        </DndContext>

    );
}
