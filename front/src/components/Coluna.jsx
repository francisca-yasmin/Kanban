import { Tarefa } from './Tarefa';
import { useDroppable } from '@dnd-kit/core'; //lugares de soltura dos cards

export function Coluna({ id, titulo, tarefas = [] }) {

    const { setNodeRef } = useDroppable({ id });

    return (
        <section
            className="coluna"
            ref={setNodeRef}
            role="region"
            aria-labelledby={`coluna-${id}-titulo`}
            aria-dropeffect="move"
        >
            <h2 id={`coluna-${id}-titulo`} className="titulo">{titulo}</h2>
            <div role="list">
                {tarefas.map(tarefa => {
                    console.log("Renderizando:", tarefa);
                    return <Tarefa key={tarefa.id} tarefa={tarefa} />;
                })}
            </div>
        </section>
    );
}
