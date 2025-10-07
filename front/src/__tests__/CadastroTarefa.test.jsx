import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import "@testing-library/jest-dom";
import { describe, it, expect } from 'vitest';
import { CadTarefa } from '../pages/CadTarefa';
import { MemoryRouter } from 'react-router-dom';
import axios from "axios";

// No topo do arquivo, onde você já mocka o axios:
vi.mock("axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [{ id: 1, nome: "Maria Freitas" }] })),
    post: vi.fn(),
  },
}));

// Opcionalmente, se quiser garantir que o mock possa ser modificado em testes específicos, 
// você pode sobrescrever em beforeEach, mas o acima já atende a maioria dos casos


// 🔧 Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("Cadastro de Tarefa", () => {
    beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

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
  
    it("deve resetar os campos após submissão", async () => {
      // Mock de sucesso da API
      axios.get.mockResolvedValueOnce({
        data: [{ id: 1, nome: "Maria Silva" }],
      });
      axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

      render(
            <MemoryRouter>
                <CadTarefa />
            </MemoryRouter>
      );

      // Captura todos os inputs e selects
      const usuarioSelect = await screen.findByLabelText(/Nome do usuário/i);
      const descInput = screen.getByLabelText(/Descrição/i);
      const setorInput = screen.getByLabelText(/Nome do setor/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const botao = screen.getByRole("button", { name: /Cadastrar tarefa/i });

      // Preenche os campos com valores válidos
      fireEvent.change(usuarioSelect, { target: { value: "1" } });
      fireEvent.change(descInput, { target: { value: "Gerar relatório financeiro" } });
      fireEvent.change(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(prioridadeSelect, { target: { value: "alta" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });

      // Submete o formulário
      fireEvent.click(botao);

      // Espera a promessa de sucesso resolver (e o alert aparecer)
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Tarefa cadastrada com sucesso");
      });

      // Verifica que todos os campos foram resetados
      expect(usuarioSelect.value).toBe("");
      expect(descInput.value).toBe("");
      expect(setorInput.value).toBe("");
      expect(prioridadeSelect.value).toBe("");
      expect(statusSelect.value).toBe("a fazer");
    });

    it("não deve permitir nome do setor com mais de 100 caracteres", async () => {
        render(
            <MemoryRouter>
                <CadTarefa />
            </MemoryRouter>
        );

        const setorInput = screen.getByLabelText(/Setor/i);
        const descricaoInput = screen.getByLabelText(/Descrição/i);
        const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
        const statusSelect = screen.getByLabelText(/Status/i);
        const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

        // Preenche com 101 caracteres
        fireEvent.input(setorInput, { target: { value: "A".repeat(101) } });
        fireEvent.input(descricaoInput, { target: { value: "Descrição válida" } });
        fireEvent.change(prioridadeSelect, { target: { value: "media" } });
        fireEvent.change(statusSelect, { target: { value: "a fazer" } });

        fireEvent.click(botaoCadastrar);

        await waitFor(() => {
            expect(
                screen.getByText((content) =>
                    content.includes("Máximo 100 caracteres")
                )
            ).toBeInTheDocument();
        });

        expect(window.alert).not.toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
    });


    it("não deve permitir caracteres que não sejam letras no nome do setor", async () => {
        render(
            <MemoryRouter>
                <CadTarefa />
            </MemoryRouter>
        );

        const setorInput = screen.getByLabelText(/Setor/i);
        const descricaoInput = screen.getByLabelText(/Descrição/i);
        const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
        const statusSelect = screen.getByLabelText(/Status/i);
        const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

        // Preenche com caracteres inválidos
        fireEvent.input(setorInput, { target: { value: "TI123!" } });
        fireEvent.input(descricaoInput, { target: { value: "Descrição válida" } });
        fireEvent.change(prioridadeSelect, { target: { value: "media" } });
        fireEvent.change(statusSelect, { target: { value: "a fazer" } });

        fireEvent.click(botaoCadastrar);

        await waitFor(() => {
            expect(
                screen.getByText((content) =>
                    content.includes("Digite apenas letras")
                )
            ).toBeInTheDocument();
        });

        expect(window.alert).not.toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it("deve mostrar um erro se a descrição contiver apenas espaços em branco", async () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      fireEvent.input(screen.getByLabelText(/Descrição/i), { target: { value: "    " } });
      fireEvent.input(screen.getByLabelText(/Setor/i), { target: { value: "TI" } });
      fireEvent.change(screen.getByLabelText(/Prioridade/i), { target: { value: "media" } });
      fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "a fazer" } });

      fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

      await waitFor(() => {
        expect(screen.getByText("Insira ao menos uma frase")).toBeInTheDocument();
      });

      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("deve mostrar um erro se o nome do setor contiver apenas espaços em branco", async () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      fireEvent.input(screen.getByLabelText(/Setor/i), { target: { value: "    " } });
      fireEvent.input(screen.getByLabelText(/Descrição/i), { target: { value: "Tarefa válida" } });
      fireEvent.change(screen.getByLabelText(/Prioridade/i), { target: { value: "media" } });
      fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "a fazer" } });

      fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

      await waitFor(() => {
        expect(screen.getByText("Insira o nome do setor")).toBeInTheDocument();
      });

      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("deve mostrar um erro se a prioridade não for selecionada", async () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      fireEvent.input(screen.getByLabelText(/Descrição/i), { target: { value: "Tarefa válida" } });
      fireEvent.input(screen.getByLabelText(/Setor/i), { target: { value: "TI" } });
      fireEvent.change(screen.getByLabelText(/Prioridade/i), { target: { value: "" } }); // não selecionada
      fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "a fazer" } });

      fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

      await waitFor(() => {
        expect(screen.getByText("Prioridade inválida")).toBeInTheDocument();
      });

      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("deve mostrar erro se o status não for selecionado", async () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      fireEvent.input(screen.getByLabelText(/Descrição/i), { target: { value: "Tarefa válida" } });
      fireEvent.input(screen.getByLabelText(/Setor/i), { target: { value: "TI" } });
      fireEvent.change(screen.getByLabelText(/Prioridade/i), { target: { value: "media" } });
      fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "" } }); // não selecionado

      fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

      await waitFor(() => {
        expect(screen.getByText("Selecione o status da tarefa")).toBeInTheDocument();
      });

      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("deve mostrar erro se a descrição contiver apenas caracteres especiais", async () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      // Preenche os campos obrigatórios
      const descInput = screen.getByLabelText(/Descrição/i);
      const setorInput = screen.getByLabelText(/Nome do setor/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const usuarioSelect = screen.getByLabelText(/Nome do usuário/i);

      fireEvent.change(usuarioSelect, { target: { value: "1" } }); // exemplo
      fireEvent.change(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(descInput, { target: { value: "!!!@@@###$$$" } }); // apenas símbolos
      fireEvent.change(prioridadeSelect, { target: { value: "baixa" } });

      fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Descrição inválida: use letras ou números")
        ).toBeInTheDocument();
      });
    });

    it("não deve permitir descrição com mais de 100 caracteres", async () => {
      render(
          <MemoryRouter>
              <CadTarefa />
          </MemoryRouter>
      );

      const setorInput = screen.getByLabelText(/Setor/i);
      const descricaoInput = screen.getByLabelText(/Descrição/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

      // Descrição com 101 caracteres
      const descricaoLonga = "A".repeat(101);

      fireEvent.input(descricaoInput, { target: { value: descricaoLonga } });
      fireEvent.input(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });

      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
          expect(
              screen.getByText((content) => content.includes("Insira uma descrição válida"))
          ).toBeInTheDocument();
      });

      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("não deve permitir descrição com menos de 10 caracteres", async () => {
      render(
          <MemoryRouter>
              <CadTarefa />
          </MemoryRouter>
      );

      const setorInput = screen.getByLabelText(/Setor/i);
      const descricaoInput = screen.getByLabelText(/Descrição/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const usuarioSelect = screen.getByLabelText(/Usuário/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

      // Preenche com menos de 10 caracteres
      fireEvent.input(descricaoInput, { target: { value: "Muito cur" } }); // 9 caracteres
      fireEvent.input(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });
      fireEvent.change(usuarioSelect, { target: { value: 1 } }); // Seleciona usuário válido

      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
          expect(
              screen.getByText((content) =>
                  content.includes("Insira ao menos uma frase")
              )
          ).toBeInTheDocument();
      });

      // Garante que não houve requisição nem alerta
      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("não deve permitir nome do setor com apenas caracteres especiais", async () => {
      render(
          <MemoryRouter>
              <CadTarefa />
          </MemoryRouter>
      );

      const setorInput = screen.getByLabelText(/Setor/i);
      const descricaoInput = screen.getByLabelText(/Descrição/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const usuarioSelect = screen.getByLabelText(/Usuário/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });

      // Preenche o setor apenas com caracteres especiais
      fireEvent.input(setorInput, { target: { value: "@#$%^&*" } });
      fireEvent.input(descricaoInput, { target: { value: "Descrição válida da tarefa" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });
      fireEvent.change(usuarioSelect, { target: { value: 1 } }); // Seleciona usuário válido

      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
          expect(
              screen.getByText((content) =>
                  content.includes("Digite apenas letras")
              )
          ).toBeInTheDocument();
      });

      // Garante que o form não foi enviado
      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("não deve permitir envio sem selecionar um usuário", async () => {
      render(
          <MemoryRouter>
              <CadTarefa />
          </MemoryRouter>
      );

      
      const botaoCadastrar = screen.getByRole("button", { name: /cadastrar tarefa/i });
      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes("Escolha um usuário") ||
            content.includes("Invalid input: expected number, received undefined")
          )
        ).toBeInTheDocument();
      });
    });

    it("não deve permitir envio com usuário selecionado inválido", async () => {
        render(
            <MemoryRouter>
                <CadTarefa />
            </MemoryRouter>
        );

        const usuarioSelect = screen.getByLabelText(/nome do usuário/i);
      fireEvent.change(usuarioSelect, { target: { value: "abc" } }); // valor inválido
      const botaoCadastrar = screen.getByRole("button", { name: /cadastrar tarefa/i });
      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes("Escolha um usuário") ||
            content.includes("Invalid input: expected number, received undefined")
          )
        ).toBeInTheDocument();
      });
    });

    it("deve mostrar mensagem de sucesso após cadastro bem-sucedido", async () => {
      axios.post.mockResolvedValueOnce({ data: {} });

      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      const usuarioSelect = await screen.findByLabelText(/Nome do usuário/i);
      const descricaoInput = screen.getByLabelText(/Descrição/i);
      const setorInput = screen.getByLabelText(/Nome do setor/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar tarefa/i });

      fireEvent.change(usuarioSelect, { target: { value: "1" } }); // string, convertido internamente
      fireEvent.change(descricaoInput, { target: { value: "Descrição válida da tarefa" } });
      fireEvent.change(setorInput, { target: { value: "TI Setor" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });

      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Tarefa cadastrada com sucesso");
      });

      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it("deve permitir descrição com exatamente 10 caracteres", async () => {
      axios.post.mockResolvedValueOnce({ data: {} });

      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      const usuarioSelect = await screen.findByLabelText(/Nome do usuário/i);
      const descricaoInput = screen.getByLabelText(/Descrição/i);
      const setorInput = screen.getByLabelText(/Nome do setor/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar tarefa/i });

      fireEvent.change(usuarioSelect, { target: { value: "1" } });
      fireEvent.change(descricaoInput, { target: { value: "1234567890" } }); // 10 chars
      fireEvent.change(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });

      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Tarefa cadastrada com sucesso");
      });

      expect(axios.post).toHaveBeenCalledTimes(1);
  });


    it("deve permitir descrição com exatamente 100 caracteres", async () => {
      axios.post.mockResolvedValueOnce({ data: {} });

      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      const usuarioSelect = await screen.findByLabelText(/Nome do usuário/i);
      const descricaoInput = screen.getByLabelText(/Descrição/i);
      const setorInput = screen.getByLabelText(/Nome do setor/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar tarefa/i });

      fireEvent.change(usuarioSelect, { target: { value: "1" } });
      fireEvent.change(descricaoInput, { target: { value: "A".repeat(100) } }); // 100 chars
      fireEvent.change(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });

      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Tarefa cadastrada com sucesso");
      });

      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it("não deve permitir envio com todos os campos vazios e deve mostrar todos os erros", async () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      const botaoCadastrar = screen.getByRole("button", { name: /cadastrar tarefa/i });
      fireEvent.click(botaoCadastrar);

      // Agora busca a mensagem real disparada pelo Zod
      expect(await screen.findByText(/Invalid input: expected number, received undefined/i)).toBeInTheDocument();
      expect(await screen.findByText(/Insira ao menos uma frase/i)).toBeInTheDocument();
      expect(await screen.findByText(/Insira o nome do setor/i)).toBeInTheDocument();
      expect(await screen.findByText(/Prioridade inválida/i)).toBeInTheDocument();

      expect(window.alert).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("deve permitir descrição com letras acentuadas", async () => {
      axios.post.mockResolvedValueOnce({ data: {} });

      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      const usuarioSelect = await screen.findByLabelText(/Nome do usuário/i);
      const descricaoInput = screen.getByLabelText(/Descrição/i);
      const setorInput = screen.getByLabelText(/Nome do setor/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar tarefa/i });

      fireEvent.change(usuarioSelect, { target: { value: "1" } });
      fireEvent.change(descricaoInput, { target: { value: "Tarefa com acentuação: análise" } });
      fireEvent.change(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });

      fireEvent.click(botaoCadastrar);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Tarefa cadastrada com sucesso");
      });

      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it("não deve resetar campos válidos se houver erro em outro campo", async () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      // Espera o select de usuário ser carregado com opções
      const usuarioSelect = await screen.findByLabelText(/Nome do usuário/i);
      const descInput = screen.getByLabelText(/Descrição/i);
      const setorInput = screen.getByLabelText(/Nome do setor/i);
      const prioridadeSelect = screen.getByLabelText(/Prioridade/i);
      const statusSelect = screen.getByLabelText(/Status/i);
      const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar tarefa/i });

      // Preenche campos válidos
      fireEvent.change(usuarioSelect, { target: { value: "1" } }); // string
      fireEvent.change(setorInput, { target: { value: "Financeiro" } });
      fireEvent.change(prioridadeSelect, { target: { value: "media" } });
      fireEvent.change(statusSelect, { target: { value: "a fazer" } });

      // Deixa descrição inválida para disparar erro
      fireEvent.change(descInput, { target: { value: "short" } });

      fireEvent.click(botaoCadastrar);

      // Espera mensagem de erro da descrição
      await waitFor(() => {
        expect(screen.getByText(/Insira ao menos uma frase/i)).toBeInTheDocument();
      });

      // Agora os campos válidos não devem ter sido resetados
      expect(usuarioSelect.value).toBe("1"); // string
      expect(setorInput.value).toBe("Financeiro");
      expect(prioridadeSelect.value).toBe("media");
      expect(statusSelect.value).toBe("a fazer");
    });

    it("deve ter status padrão 'a fazer' no carregamento do formulário", () => {
      render(
        <MemoryRouter>
          <CadTarefa />
        </MemoryRouter>
      );

      const statusSelect = screen.getByLabelText(/Status/i);
      expect(statusSelect.value).toBe("a fazer");
    });

});