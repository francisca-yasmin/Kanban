import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CadTarefa } from '../pages/CadTarefa';
import { MemoryRouter } from 'react-router-dom';

describe("Cadastro de Tarefa", () => {
    it("A tela do formulário é exibida com todos os campos", () => {
        render(
            <MemoryRouter>
                <CadTarefa />
            </MemoryRouter>
        );

        // campos do formulário
        const usuarioSelect = screen.getByLabelText(/Nome do usuário/i);
        const descInput = screen.getByLabelText(/Descrição/i);
        const setorInput = screen.getByLabelText(/Nome do setor/i);
        const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
        const statusSelect = screen.getByLabelText(/Status/i);

        // botão de submit
        const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar tarefa/i });

        // verificações
        expect(usuarioSelect).toBeTruthy();
        expect(descInput).toBeTruthy();
        expect(setorInput).toBeTruthy();
        expect(prioridadeSelect).toBeTruthy();
        expect(statusSelect).toBeTruthy();
        expect(botaoCadastrar).toBeTruthy();
    });
});
