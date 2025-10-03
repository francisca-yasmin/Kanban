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
/**
 * import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CadastroUsuario } from "../Paginas/CadastroUsuario";
import { describe, it, expect } from "vitest";
 
describe("CadastroUsuario", () => {
 
  it("deve renderizar todos os campos do formulário", () => {
    render(<CadastroUsuario />);
 
    const nomeInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const botao = screen.getByRole("button", { name: /Cadastrar/i });
 
    expect(nomeInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(botao).toBeTruthy();
  });
 
  it("deve mostrar erros quando campos estiverem vazios", async () => {
    render(<CadastroUsuario />);
 
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));
 
    await waitFor(() => {
      expect(screen.getByText("Informe ao menos um valor")).toBeTruthy();
      expect(screen.getByText("Preencha o campo com seu email")).toBeTruthy();
    });
  });
 
  it("deve mostrar erro quando o email tiver formato inválido", async () => {
    render(<CadastroUsuario />);
 
    fireEvent.input(screen.getByLabelText(/Nome/i), { target: { value: "Maria" } });
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: "emailinvalido" } });
 
  fireEvent.submit(screen.getByRole("form") || screen.getByRole("button", { name: /Cadastrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/Formato de email inválido/i)).toBeTruthy();
    });
  });
 
  it("deve resetar os campos após submissão", async () => {
    render(<CadastroUsuario />);
 
    const nomeInput = screen.getByLabelText(/Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);
 
    fireEvent.input(nomeInput, { target: { value: "Maria" } });
    fireEvent.input(emailInput, { target: { value: "maria@email.com" } });
 
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));
 
    await waitFor(() => {
      expect(nomeInput.value).toBe("");
      expect(emailInput.value).toBe("");
    });
  });
 
});
 
 */