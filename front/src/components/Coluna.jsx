import { Tarefa } from './Tarefa';
import { useDroppable } from '@dnd-kit/core'; //lugares de soltura dos cards

export function Coluna({ id, titulo, tarefas = [] }) {

    const { setNodeRef } = useDroppable({ id });

    return (
       <section
            className="coluna"
            ref={setNodeRef}
            aria-labelledby={`coluna-${id}-titulo`}
        >
            <h2 id={`coluna-${id}-titulo`} className="titulo">{titulo}</h2>
            <ul>
                {tarefas.map(tarefa => {
                    return <Tarefa key={tarefa.id} tarefa={tarefa} />;
                })}
            </ul>
        </section>
    );
}
