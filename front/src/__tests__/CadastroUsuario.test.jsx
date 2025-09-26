//render: renderiza a minha tela
//screen: eu vejo os elementos que estão sendo exibidos
//fireEvent: simula o usuario pode fazer em tela
//wait: espera o resultado do evento
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect } from 'vitest';
import { CadUsuario } from '../pages/CadUsuario';

describe("Cadastro de Usuario", () =>{
    it("A tela é exibida", () =>{
        render(<CadUsuario/>);

        const nomeInput = screen.getByLabelText(/Nome/i);
        const emailInput = screen.getAllByLabelText(/Email/i);
        const botao = screen.getByRole("button", {name:/Cadastrar/i });

        expect(nomeInput).toBeTruthy();
        expect(emailInput).toBeTruthy();
        expect(botao).toBeTruthy();
    });
});